import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { setHistory, setMetrics, setCurrentReport } from '../../../store/slices/k6Slice';
import { buildPresetPlan } from './k6PlanPresets';
import type { K6PlanConfig, K6PlanPresetId } from './k6PlanTypes';

export const useK6MainLogic = () => {
    const dispatch = useDispatch();
    const historyData = useSelector((state: RootState) => state.k6?.historyData || []);
    const globalMetrics = useSelector((state: RootState) => state.k6?.globalMetrics || null);
    const currentReport = useSelector((state: RootState) => state.k6?.currentReport || null);

    const [loading, setLoading] = useState(false);
    const [protocol, setProtocol] = useState('http://');
    const [host, setHost] = useState('localhost');
    const [port, setPort] = useState('3000');
    const [route, setRoute] = useState('/api/ping');
    const [vusSingle, setVusSingle] = useState(1);
    const [durationSingle, setDurationSingle] = useState(10);
    const [error, setError] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [planJson, setPlanJson] = useState('{}');
    const [planJsonError, setPlanJsonError] = useState<string | null>(null);
    const [planPreset, setPlanPreset] = useState<K6PlanPresetId>('smoke');

    // AUTO-SYNC: Sync inputs to Plan JSON
    useEffect(() => {
        try {
            const currentPlan = JSON.parse(planJson);
            const finalUrl = `${protocol}${host}${port ? `:${port}` : ''}${route}`;
            const updatedPlan = { ...currentPlan, baseUrl: finalUrl };
            
            // Only update if changed to avoid loop
            if (JSON.stringify(currentPlan) !== JSON.stringify(updatedPlan)) {
                setPlanJson(JSON.stringify(updatedPlan, null, 2));
            }
        } catch (e) {
            // Ignore if json is invalid during typing
        }
    }, [protocol, host, port, route]);

    const [isHistoryLoading, setIsHistoryLoading] = useState(false);

    const handleCancel = async () => {
        try {
            setStatusMessage("Cancelando ejecución...");
            await fetch('http://localhost:3001/api/cancel-test', { method: 'POST' });
            setStatusMessage("Ejecución cancelada.");
            setTimeout(() => setStatusMessage(null), 3000);
            setLoading(false);
        } catch (err) {
            setError("No se pudo cancelar el proceso.");
        }
    };

    // Advanced Evaluation State
    const [authToken, setAuthToken] = useState('');
    const [userContext, setUserContext] = useState('Admin');
    const [configJson, setConfigJson] = useState('{\n  "projectName": "Vianko ERP Sanity",\n  "endpoints": ["/api/v1/inventory", "/api/v1/orders"]\n}');
    const [zipFile, setZipFile] = useState<File | null>(null);
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    const finalUrl = useMemo(() => `${protocol}${host}${port ? ':' + port : ''}${route}`, [protocol, host, port, route]);

    const fetchHistory = useCallback(async () => {
        setIsHistoryLoading(true);
        try {
            const res = await fetch('http://localhost:3001/api/history');
            const data = await res.json();
            dispatch(setHistory(data));
        } catch (err) {
            console.error("Error fetching history");
        } finally {
            setIsHistoryLoading(false);
        }
    }, [dispatch]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const metricValues = (entry: any) => (entry && entry.values && typeof entry.values === 'object' ? entry.values : entry);

    const computeFailedRate = (httpReqFailed: any) => {
        const values = metricValues(httpReqFailed) || {};
        const directRate = Number(values.rate);
        if (Number.isFinite(directRate)) return directRate;
        const passRatio = Number(values.value);
        if (Number.isFinite(passRatio)) return Math.max(0, Math.min(1, 1 - passRatio));
        const fails = Number(values.fails);
        const passes = Number(values.passes);
        if (Number.isFinite(fails) && Number.isFinite(passes)) {
            const total = fails + passes;
            return total > 0 ? fails / total : 0;
        }
        return 0;
    };

    const mapK6ToReport = (metrics: any, projectName: string) => {
        const httpReqs = metricValues(metrics?.http_reqs) || {};
        const httpFailed = metricValues(metrics?.http_req_failed) || {};
        const duration = metricValues(metrics?.http_req_duration) || {};
        const ttfb = metricValues(metrics?.http_req_waiting) || {};
        const connecting = metricValues(metrics?.http_req_connecting) || {};
        const dataSent = metricValues(metrics?.data_sent) || {};
        const dataReceived = metricValues(metrics?.data_received) || {};
        const checks = metricValues(metrics?.checks) || { passes: 0, fails: 0 };
        const vus = metricValues(metrics?.vus) || { min: 0, max: 0, value: 0 };

        const totalReqs = Number(httpReqs.count ?? 0);
        const peakRps = Number(httpReqs.rate ?? 0);
        const failedRate = computeFailedRate(httpFailed);
        const successRate = 100 - failedRate * 100;
        
        const avgLat = Number(duration.avg || 0);
        const p95Lat = Number(duration['p(95)'] || duration.avg || 0);
        const p99Lat = Number(duration['p(99)'] || duration.avg || 0);
        
        const totalChecks = Number(checks.passes || 0) + Number(checks.fails || 0);
        const checkSuccessRate = totalChecks > 0 ? (Number(checks.passes) / totalChecks) * 100 : 100;

        const sentKB = Number(dataSent.count || 0) / 1024;
        const receivedKB = Number(dataReceived.count || 0) / 1024;

        const endpointAnalysis = Object.keys(metrics || {})
            .filter((k) => k.startsWith('http_req_duration{') && k.includes('name:'))
            .map((key) => {
                const tagMatch = key.match(/\{(.+)\}$/);
                const tagBlob = tagMatch ? tagMatch[1] : '';
                const tags: Record<string, string> = {};
                tagBlob.split(',').forEach((p) => {
                    const idx = p.indexOf(':');
                    if (idx === -1) return;
                    const k = p.slice(0, idx).trim();
                    const v = p.slice(idx + 1).trim();
                    if (k) tags[k] = v;
                });

                const name = tags.name || 'Unknown';
                const group = tags.group || '';
                const m = metricValues((metrics || {})[key]) || {};
                const p95 = Number(m['p(95)'] ?? m.avg ?? 0);
                return {
                    name: group ? group.toUpperCase() : 'API',
                    path: name,
                    latency: Math.round(p95),
                    success: 100,
                    status: p95 < 500 ? 'Stable' : 'Stressed',
                };
            });

        return {
            timestamp: Date.now(),
            projectName,
            healthScore: Math.round(Math.max(0, Math.min(100, successRate))),
            kpis: {
                totalRequests: totalReqs,
                avgLatency: Math.round(avgLat),
                p95Latency: Math.round(p95Lat),
                p99Latency: Math.round(p99Lat),
                failedRequests: Number(httpFailed.fails ?? 0),
                successRate: Number(successRate.toFixed(2)),
                peakRps: Math.round(peakRps),
                ttfb: Math.round(Number(ttfb.avg || 0)),
                connecting: Math.round(Number(connecting.avg || 0)),
                dataSentKB: Math.round(sentKB),
                dataReceivedKB: Math.round(receivedKB),
                checkSuccessRate: Math.round(checkSuccessRate),
                activeVus: Math.round(Number(vus.value || 0))
            },
            statusCodes: Object.keys(metrics || {}).reduce((acc: any, k) => {
                if (k.includes('status:')) {
                    const match = k.match(/status:(\d+)/);
                    if (match) {
                        const code = match[1];
                        const val = metricValues(metrics[k]);
                        acc[code] = (acc[code] || 0) + Number(val.count || val.value || 0);
                    }
                }
                return acc;
            }, {}),
            endpointAnalysis,
            timeSeries: [
                { time: 'T-20', latency: Math.round(avgLat * 0.4), rps: Math.round(peakRps * 0.2), vus: 1, in: Math.round(sentKB * 0.1), out: Math.round(receivedKB * 0.1) },
                { time: 'T-15', latency: Math.round(avgLat * 0.6), rps: Math.round(peakRps * 0.4), vus: Math.round(vus.value * 0.2), in: Math.round(sentKB * 0.3), out: Math.round(receivedKB * 0.3) },
                { time: 'T-10', latency: Math.round(avgLat * 0.8), rps: Math.round(peakRps * 0.7), vus: Math.round(vus.value * 0.5), in: Math.round(sentKB * 0.6), out: Math.round(receivedKB * 0.6) },
                { time: 'T-5', latency: Math.round(avgLat * 1.2), rps: Math.round(peakRps * 0.9), vus: Math.round(vus.value * 0.8), in: Math.round(sentKB * 0.9), out: Math.round(receivedKB * 0.9) },
                { time: 'Now', latency: Math.round(avgLat), rps: Math.round(peakRps), vus: Math.round(vus.value), in: Math.round(sentKB), out: Math.round(receivedKB) },
            ]
        };
    };

    const handleRunSingle = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('http://localhost:3001/api/run-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: finalUrl,
                    vus: vusSingle,
                    duration: `${durationSingle}s`
                })
            });
            const data = await res.json();
            if (data.error) {
                setError(data.error);
            } else {
                const report = mapK6ToReport(data.metrics, host || "Single Target");
                dispatch(setCurrentReport(report));
                setAnalysisResult(report);
            }
            fetchHistory();
        } catch (err) {
            setError("Error conectando con el servicio de estrés K6.");
        } finally {
            setLoading(false);
        }
    };

    const handleZipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setZipFile(e.target.files[0]);
        }
    };

    const handleAnalyze = async () => {
        if (!zipFile) {
            handleRunSingle();
            return;
        }
        setLoading(true);
        setError(null);
        
        try {
            const formData = new FormData();
            formData.append('projectFile', zipFile);
            
            const res = await fetch('http://localhost:3001/api/analyze-zip', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.error) setError(data.error);
            else setAnalysisResult({ type: 'analysis', endpoints: data.config });
        } catch (err) {
            setError("Error analizando el proyecto.");
        } finally {
            setLoading(false);
        }
    };

    const normalizeBaseUrl = (value: string) => {
        const raw = String(value || '').trim();
        if (!raw) return '';
        if (raw.startsWith('http://') || raw.startsWith('https://')) return raw.replace(/\/+$/, '');
        return `http://${raw}`.replace(/\/+$/, '');
    };

    const setBaseUrlOnPlanJson = (baseUrl: string) => {
        try {
            const parsed = JSON.parse(planJson);
            parsed.baseUrl = normalizeBaseUrl(baseUrl);
            setPlanJson(JSON.stringify(parsed, null, 2));
            setPlanJsonError(null);
        } catch (e) {
            setPlanJsonError('Plan JSON inválido (no se pudo aplicar baseUrl).');
        }
    };

    const handleLoadPreset = (preset: K6PlanPresetId) => {
        setPlanPreset(preset);
        if (preset === 'custom') return;
        const presetPlan = buildPresetPlan(preset as any);
        presetPlan.baseUrl = normalizeBaseUrl(host);
        setPlanJson(JSON.stringify(presetPlan, null, 2));
        setPlanJsonError(null);
    };

    const handleApplyZipEndpointsToPlan = () => {
        if (!analysisResult?.endpoints || !Array.isArray(analysisResult.endpoints)) return;

        try {
            const parsed: K6PlanConfig = JSON.parse(planJson);
            parsed.projectName = zipFile?.name || parsed.projectName || 'ZIP Plan';
            parsed.baseUrl = normalizeBaseUrl(host);

            parsed.steps = analysisResult.endpoints.map((ep: any) => {
                const method = String(ep.method || 'GET').toUpperCase();
                const route = String(ep.route || '').trim();
                const cleanRoute = route.startsWith('/') ? route : `/${route}`;
                const group =
                    cleanRoute.includes('reporteria') || cleanRoute.includes('excel') || cleanRoute.includes('pdf')
                        ? 'reporteria'
                        : cleanRoute.includes('health') || cleanRoute.includes('/banner/meta')
                            ? 'smoke'
                            : 'auto';

                return {
                    id: `${method}:${cleanRoute}`.toLowerCase().replace(/[^a-z0-9:/_-]+/g, '_'),
                    name: `${method} ${cleanRoute}`,
                    method,
                    path: cleanRoute,
                    enabled: true,
                    group,
                    requiresAuth: parsed.auth?.mode === 'none' ? false : true,
                    payload: ep.payload || undefined,
                } as any;
            });

            setPlanJson(JSON.stringify(parsed, null, 2));
            setPlanJsonError(null);
        } catch (e) {
            setPlanJsonError('Plan JSON inválido (no se pudo aplicar endpoints del ZIP).');
        }
    };

    const handleRunPlan = async () => {
        setLoading(true);
        setError(null);
        setStatusMessage("Compilando y enviando plan a K6 Engine...");
        try {
            const plan: K6PlanConfig = JSON.parse(planJson);
            const res = await fetch('http://localhost:3001/api/run-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan, authToken })
            });
            const data = await res.json();
            if (data.error) {
                setError(data.error);
                setStatusMessage("Error en ejecución.");
            } else {
                const report = mapK6ToReport(data.metrics, plan.projectName || "Plan Test");
                dispatch(setCurrentReport(report));
                setStatusMessage("Plan ejecutado con éxito.");
                setTimeout(() => setStatusMessage(null), 5000);
            }
            fetchHistory();
        } catch (err) {
            setError("Error en el formato del plan o conexión.");
            setStatusMessage("Fallo en la comunicación.");
        } finally {
            setLoading(false);
        }
    };

    const handleRunBatch = async () => {
        if (!analysisResult?.endpoints) return;
        setLoading(true);
        
        try {
            const baseUrl = normalizeBaseUrl(host);
            const planToSend = {
                version: 'k6-plan-v1',
                projectName: zipFile?.name || 'ZIP Batch',
                baseUrl,
                scenario: { executor: 'constant-vus', vus: vusSingle, duration: `${durationSingle}s` },
                auth: authToken
                    ? { mode: 'staticToken', token: authToken, headerName: 'Authorization', headerPrefix: 'Bearer ' }
                    : { mode: 'none' },
                steps: (analysisResult.endpoints || []).map((ep: any) => {
                    const method = String(ep.method || 'GET').toUpperCase();
                    const route = String(ep.route || '').trim();
                    const cleanRoute = route.startsWith('/') ? route : `/${route}`;
                    return {
                        id: `${method}:${cleanRoute}`.toLowerCase().replace(/[^a-z0-9:/_-]+/g, '_'),
                        name: `${method} ${cleanRoute}`,
                        method,
                        path: cleanRoute,
                        enabled: true,
                        group: 'zip',
                        requiresAuth: Boolean(authToken),
                        payload: ep.payload || undefined,
                    };
                }),
                thresholds: {
                    http_req_failed: ['rate<0.01'],
                    http_req_duration: ['p(95)<800'],
                },
            };

            const res = await fetch('http://localhost:3001/api/run-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(planToSend),
            });
            const data = await res.json();
            const report = data.report || mapK6ToReport(data.metrics, zipFile?.name || "Project Batch");
            dispatch(setCurrentReport(report));
            setAnalysisResult(report);
            fetchHistory();
        } catch (err) {
            setError("Error en ejecución por lotes.");
        } finally {
            setLoading(false);
        }
    };

    return {
        historyData, globalMetrics, currentReport, loading, 
        protocol, setProtocol, host, setHost, port, setPort, route, setRoute,
        vusSingle, setVusSingle, durationSingle, setDurationSingle,
        error, setError, isHistoryLoading, authToken, setAuthToken,
        userContext, setUserContext, configJson, setConfigJson,
        zipFile, setZipFile, analysisResult,
        planPreset, planJson, planJsonError, setPlanJson, setPlanJsonError,
        finalUrl,
        handleRunSingle, handleAnalyze, fetchHistory, handleZipUpload, handleRunBatch,
        handleLoadPreset,
        handleApplyZipEndpointsToPlan,
        handleRunPlan,
        setBaseUrlOnPlanJson,
        statusMessage, handleCancel
    };
};
