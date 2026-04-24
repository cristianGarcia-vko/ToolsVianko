import { useState, useEffect, useCallback, useRef } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ConsoleEntryLevel = 'info' | 'warn' | 'error' | 'metric' | 'phase';

export type ConsoleEntry = {
    id: number;
    timestamp: number;
    phase: string;
    text: string;
    level: ConsoleEntryLevel;
};

export type LiveMetrics = {
    vus: number;
    maxVus: number;
    iterations: number;
    interrupted: number;
    elapsed: string;
    progress: number;
};

export type StreamResult = {
    success: boolean;
    summary: any | null;
    report: any | null;
    error: string | null;
};

// ─── Hook ────────────────────────────────────────────────────────────────────

const BACKEND_URL =
    process.env.EXPO_PUBLIC_K6_API_BASE_URL ||
    'http://localhost:4001';

export const useExecutionStream = () => {
    const [testId, setTestId] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [isError, setIsError] = useState(false);
    const [phase, setPhase] = useState('idle');
    const [progress, setProgress] = useState(0);
    const [entries, setEntries] = useState<ConsoleEntry[]>([]);
    const [liveMetrics, setLiveMetrics] = useState<LiveMetrics | null>(null);
    const [result, setResult] = useState<StreamResult | null>(null);

    const entryIdRef = useRef(0);
    const eventSourceRef = useRef<EventSource | null>(null);

    const addEntry = useCallback((text: string, level: ConsoleEntryLevel, phaseName: string) => {
        entryIdRef.current += 1;
        const entry: ConsoleEntry = {
            id: entryIdRef.current,
            timestamp: Date.now(),
            phase: phaseName,
            text,
            level,
        };
        setEntries((prev) => [...prev, entry]);
    }, []);

    // Connect to SSE stream when testId changes
    useEffect(() => {
        if (!testId) return;

        const es = new EventSource(`${BACKEND_URL}/api/test-stream/${testId}`);
        eventSourceRef.current = es;

        let currentPhase = 'init';

        es.onopen = () => {
            setIsConnected(true);
        };

        es.addEventListener('phase', (e: MessageEvent) => {
            try {
                const data = JSON.parse(e.data);
                currentPhase = data.name || currentPhase;
                setPhase(currentPhase);
                setProgress(data.progress ?? 0);

                const phaseLabel = (data.name || '').toUpperCase();
                if (data.name === 'complete') {
                    addEntry('Prueba finalizada exitosamente.', 'phase', currentPhase);
                } else if (data.name === 'error') {
                    addEntry('Error en la ejecución.', 'error', currentPhase);
                    setIsError(true);
                } else if (phaseLabel) {
                    addEntry(`Fase: ${phaseLabel}`, 'phase', currentPhase);
                }
            } catch { /* ignore */ }
        });

        es.addEventListener('log', (e: MessageEvent) => {
            try {
                const data = JSON.parse(e.data);
                addEntry(data.line || '', data.level || 'info', currentPhase);
            } catch { /* ignore */ }
        });

        es.addEventListener('metric', (e: MessageEvent) => {
            try {
                const data = JSON.parse(e.data);
                setLiveMetrics({
                    vus: data.vus ?? 0,
                    maxVus: data.maxVus ?? 0,
                    iterations: data.iterations ?? 0,
                    interrupted: data.interrupted ?? 0,
                    elapsed: data.elapsed || '',
                    progress: data.progress ?? 0,
                });
                setProgress(data.progress ?? 0);
            } catch { /* ignore */ }
        });

        es.addEventListener('complete', (e: MessageEvent) => {
            try {
                const data = JSON.parse(e.data);
                setIsComplete(true);
                setProgress(100);
                setPhase('complete');

                setResult({
                    success: data.success ?? false,
                    summary: data.summary ?? null,
                    report: data.report ?? null,
                    error: data.error ?? null,
                });

                if (data.success) {
                    const totalReqs = data.summary?.http_reqs?.values?.count || data.summary?.http_reqs?.count || '?';
                    addEntry(`✅ Completado — ${totalReqs} requests procesados`, 'phase', 'complete');
                } else {
                    addEntry(`❌ Error: ${data.error || 'Fallo desconocido'}`, 'error', 'error');
                    setIsError(true);
                }
            } catch { /* ignore */ }
        });

        es.addEventListener('error', (e: MessageEvent) => {
            try {
                const data = JSON.parse(e.data);
                addEntry(`Error: ${data.message || 'Desconocido'}`, 'error', 'error');
                setIsError(true);
            } catch { /* ignore */ }
        });

        es.onerror = () => {
            // EventSource auto-reconnects; if we haven't completed, it's a temporary issue
            if (!isComplete) {
                setIsConnected(false);
            }
        };

        return () => {
            es.close();
            eventSourceRef.current = null;
        };
    }, [testId, addEntry, isComplete]);

    /**
     * Start a new streaming test.
     * @param type 'single' | 'plan'
     * @param payload Request body for the start endpoint
     */
    const startTest = useCallback(async (type: 'single' | 'plan', payload: any): Promise<boolean> => {
        // Reset state
        setEntries([]);
        setPhase('init');
        setProgress(0);
        setIsComplete(false);
        setIsError(false);
        setIsConnected(false);
        setLiveMetrics(null);
        setResult(null);
        entryIdRef.current = 0;

        // Close existing stream
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }

        const endpoint = type === 'single'
            ? '/api/start-stream-test'
            : '/api/start-stream-plan';

        try {
            const res = await fetch(`${BACKEND_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (data.testId) {
                setTestId(data.testId);
                return true;
            } else {
                addEntry(`Error: ${data.error || 'No se pudo iniciar la prueba'}`, 'error', 'error');
                setIsError(true);
                return false;
            }
        } catch (err) {
            addEntry(`Error de conexión con el backend K6 (${BACKEND_URL})`, 'error', 'error');
            setIsError(true);
            return false;
        }
    }, [addEntry]);

    /**
     * Cancel the active test.
     */
    const cancelActiveTest = useCallback(async () => {
        if (!testId) return;

        try {
            await fetch(`${BACKEND_URL}/api/cancel-stream-test/${testId}`, { method: 'POST' });
        } catch { /* swallow */ }
    }, [testId]);

    /**
     * Close and reset the stream.
     */
    const closeStream = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
        setTestId(null);
        setIsConnected(false);
    }, []);

    return {
        testId,
        isConnected,
        isComplete,
        isError,
        phase,
        progress,
        entries,
        liveMetrics,
        result,
        startTest,
        cancelActiveTest,
        closeStream,
    };
};
