import React, { memo, useEffect, useRef } from 'react';
import { tokens } from '../../../../../SharedTool/style/tokens.shared.style';
import { consoleStyles as styles } from './K6ExecutionConsole.web.styles';
import type { ConsoleEntry, LiveMetrics, StreamResult } from './K6ExecutionConsole.web.logics';

/* ─── Props ───────────────────────────────────────────────────────────────── */

interface K6ExecutionConsoleProps {
    phase: string;
    progress: number;
    entries: ConsoleEntry[];
    liveMetrics: LiveMetrics | null;
    isComplete: boolean;
    isError: boolean;
    isConnected: boolean;
    result: StreamResult | null;
    onCancel: () => void;
    onClose: () => void;
    onViewReport: () => void;
    onRerun: () => void;
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
};

const formatKpiValue = (val: number | undefined): string => {
    if (val == null || isNaN(val)) return '—';
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
    return String(Math.round(val));
};

/* ─── Component ───────────────────────────────────────────────────────────── */

export const K6ExecutionConsole: React.FC<K6ExecutionConsoleProps> = memo(({
    phase,
    progress,
    entries,
    liveMetrics,
    isComplete,
    isError,
    isConnected,
    result,
    onCancel,
    onClose,
    onViewReport,
    onRerun,
}) => {
    const terminalRef = useRef<HTMLDivElement>(null);

    // Auto-scroll terminal to bottom
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [entries]);

    const dotColor = isError
        ? tokens.colors.accentError
        : isComplete
            ? tokens.colors.accentGreen
            : tokens.colors.accentTeal;

    const report = result?.report;
    const kpis = report?.kpis || {};

    return (
        <div style={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget && isComplete) onClose(); }}>
            <style>{styles.keyframes}</style>
            <div style={styles.container}>

                {/* ── Header ───────────────────────────────────────────── */}
                <div style={styles.header}>
                    <div style={styles.headerLeft}>
                        <div style={{
                            ...styles.headerDot(dotColor),
                            animation: !isComplete ? 'consolePulse 1.5s ease-in-out infinite' : 'none',
                        }} />
                        <span style={styles.headerTitle}>
                            Consola de ejecución
                        </span>
                        {!isComplete && isConnected && (
                            <span style={{
                                fontSize: '8px',
                                fontWeight: 600,
                                color: 'rgba(255,255,255,0.2)',
                                letterSpacing: '0.5px',
                            }}>
                                ● LIVE
                            </span>
                        )}
                    </div>
                    {isComplete && (
                        <button
                            type="button"
                            style={styles.closeButton}
                            onClick={onClose}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                e.currentTarget.style.color = 'rgba(255,255,255,0.35)';
                            }}
                        >
                            ✕ Cerrar
                        </button>
                    )}
                </div>

                {/* ── Progress bar ─────────────────────────────────────── */}
                <div style={styles.progressContainer}>
                    <div style={styles.progressTrack as React.CSSProperties}>
                        <div style={styles.progressFill(progress, isError)} />
                    </div>
                    <div style={styles.progressLabel}>
                        <span style={styles.progressPhase(isError)}>
                            {phase}
                        </span>
                        <span style={styles.progressPercent}>
                            {progress}%
                        </span>
                    </div>
                </div>

                {/* ── Live metrics ─────────────────────────────────────── */}
                {liveMetrics && (
                    <div style={styles.metricsBar}>
                        <div style={styles.metricChip(tokens.colors.accentTeal)}>
                            <span style={styles.metricChipLabel}>VUs</span>
                            <span style={styles.metricChipValue(tokens.colors.accentTeal)}>
                                {liveMetrics.vus}/{liveMetrics.maxVus}
                            </span>
                        </div>
                        <div style={styles.metricChip(tokens.colors.accentGreen)}>
                            <span style={styles.metricChipLabel}>Iteraciones</span>
                            <span style={styles.metricChipValue(tokens.colors.accentGreen)}>
                                {formatKpiValue(liveMetrics.iterations)}
                            </span>
                        </div>
                        <div style={styles.metricChip(tokens.colors.accentBlue)}>
                            <span style={styles.metricChipLabel}>Transcurrido</span>
                            <span style={styles.metricChipValue(tokens.colors.accentBlue)}>
                                {liveMetrics.elapsed || '—'}
                            </span>
                        </div>
                        <div style={styles.metricChip(tokens.colors.accentPurple)}>
                            <span style={styles.metricChipLabel}>Progreso</span>
                            <span style={styles.metricChipValue(tokens.colors.accentPurple)}>
                                {liveMetrics.progress}%
                            </span>
                        </div>
                    </div>
                )}

                {/* ── Terminal output ──────────────────────────────────── */}
                <div style={styles.terminalContainer as React.CSSProperties}>
                    <div ref={terminalRef} style={styles.terminal as React.CSSProperties} className="no-scrollbar">
                        {entries.map((entry) => (
                            <div key={entry.id} style={styles.terminalLine(entry.level)}>
                                <span style={styles.terminalTimestamp}>
                                    {formatTime(entry.timestamp)}
                                </span>
                                <span style={styles.terminalPhaseTag(entry.phase)}>
                                    {(entry.phase || 'sys').slice(0, 8)}
                                </span>
                                <span style={styles.terminalText as React.CSSProperties}>
                                    {entry.text}
                                </span>
                            </div>
                        ))}

                        {!isComplete && entries.length === 0 && (
                            <div style={{ color: 'rgba(255,255,255,0.2)', fontStyle: 'italic', fontSize: '10px' }}>
                                Conectando con el backend K6...
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Result summary (on completion) ──────────────────── */}
                {isComplete && result && (
                    <div style={styles.resultBox(result.success)}>
                        <span style={styles.resultIcon}>
                            {result.success ? '✅' : '❌'}
                        </span>
                        <div style={styles.resultStats as React.CSSProperties}>
                            {result.success ? (
                                <>
                                    <div style={styles.resultStatItem}>
                                        <span>Requests:</span>
                                        <span style={styles.resultStatValue}>{formatKpiValue(kpis.totalRequests)}</span>
                                    </div>
                                    <div style={styles.resultStatItem}>
                                        <span>Errores:</span>
                                        <span style={styles.resultStatValue}>{formatKpiValue(kpis.failedRequests)}</span>
                                    </div>
                                    <div style={styles.resultStatItem}>
                                        <span>Latencia p95:</span>
                                        <span style={styles.resultStatValue}>{formatKpiValue(kpis.avgLatency)}ms</span>
                                    </div>
                                    <div style={styles.resultStatItem}>
                                        <span>RPS:</span>
                                        <span style={styles.resultStatValue}>{formatKpiValue(kpis.peakRps)}</span>
                                    </div>
                                    <div style={styles.resultStatItem}>
                                        <span>Success Rate:</span>
                                        <span style={styles.resultStatValue}>{kpis.successRate ?? '—'}%</span>
                                    </div>
                                </>
                            ) : (
                                <span style={{ color: tokens.colors.accentError }}>
                                    {result.error || 'La prueba fallo — revisa la consola para mas detalles.'}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Footer actions ──────────────────────────────────── */}
                <div style={styles.footer}>
                    {!isComplete ? (
                        <button
                            type="button"
                            style={styles.actionButton(tokens.colors.accentError)}
                            onClick={onCancel}
                        >
                            ⊘ Cancelar ejecución
                        </button>
                    ) : (
                        <>
                            {result?.success && (
                                <button
                                    type="button"
                                    style={styles.actionButton(tokens.colors.accentGreen)}
                                    onClick={onViewReport}
                                >
                                    📊 Ver reporte completo
                                </button>
                            )}
                            <button
                                type="button"
                                style={styles.actionButton(tokens.colors.accentTeal)}
                                onClick={onRerun}
                            >
                                🔄 Re-ejecutar
                            </button>
                            <button
                                type="button"
                                style={styles.actionButton('rgba(255,255,255,0.15)', true)}
                                onClick={onClose}
                            >
                                Cerrar
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
});
