import React, { memo, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Zap, RefreshCw, ChevronDown, ChevronUp, Globe, Shield, Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-react';
import { tokens } from '../../../../../SharedTool/style/tokens.shared.style';
import { k6Styles as styles } from '../../K6Main.web.styles';
import { validatePlanJson, getPlanSummary } from '../../utils/planValidator';

interface K6OrchestratorProps {
    loading: boolean;
    protocol: string;
    setProtocol: (p: string) => void;
    host: string;
    setHost: (h: string) => void;
    setBaseUrlOnPlanJson: (url: string) => void;
    port: string;
    setPort: (p: string) => void;
    route: string;
    setRoute: (r: string) => void;
    authToken: string;
    setAuthToken: (t: string) => void;
    vusSingle: number;
    setVusSingle: (v: number) => void;
    durationSingle: number;
    setDurationSingle: (d: number) => void;
    handleCancel: () => void;
    handleRunPlan: () => void;
    handleRunSingle: () => void;
    statusMessage: string;
    planPreset: string;
    handleLoadPreset: (p: any) => void;
    planJson: string;
    setPlanJson: (v: string) => void;
    planJsonError: any;
    setPlanJsonError: (v: any) => void;
}

/* ─── Sub-component styles ─────────────────────────────────────────────── */

const S = {
    urlField: {
        display: 'flex', alignItems: 'center', gap: '0',
        background: 'rgba(0,0,0,0.25)', borderRadius: '14px',
        border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden',
        transition: 'border-color 0.2s',
    },
    urlProto: {
        background: 'rgba(255,255,255,0.04)', padding: '10px 12px',
        fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.4)',
        borderRight: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer',
        whiteSpace: 'nowrap' as const, userSelect: 'none' as const,
    },
    urlInput: {
        flex: 1, background: 'transparent', border: 'none', outline: 'none',
        color: 'white', fontSize: '12px', fontWeight: 600, padding: '10px 14px',
        fontFamily: "'JetBrains Mono', monospace",
    },
    urlStatus: (ok: boolean | null) => ({
        padding: '10px 14px', fontSize: '12px', flexShrink: 0,
        color: ok === null ? 'rgba(255,255,255,0.15)' : ok ? tokens.colors.accentGreen : tokens.colors.accentError,
    }),
    detailToggle: {
        display: 'flex', alignItems: 'center', gap: '4px',
        fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.25)',
        cursor: 'pointer', padding: '4px 0', userSelect: 'none' as const,
    },
    detailGrid: {
        display: 'grid', gridTemplateColumns: '80px 1fr 60px', gap: '6px',
        padding: '8px 0', borderTop: '1px solid rgba(255,255,255,0.03)',
    },
    sliderContainer: {
        display: 'flex', flexDirection: 'column' as const, gap: '4px',
    },
    sliderRow: {
        display: 'flex', alignItems: 'center', gap: '10px',
    },
    sliderTrack: {
        flex: 1, height: '6px', borderRadius: '6px', appearance: 'none' as const,
        background: 'rgba(255,255,255,0.06)', outline: 'none', cursor: 'pointer',
        WebkitAppearance: 'none' as const,
    },
    sliderValue: (accent: string) => ({
        minWidth: '50px', textAlign: 'right' as const,
        fontSize: '14px', fontWeight: 900, color: accent,
        fontFamily: "'JetBrains Mono', monospace",
    }),
    sliderHint: {
        fontSize: '9px', color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' as const,
    },
    validationBar: (hasErrors: boolean) => ({
        padding: '8px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: 800,
        display: 'flex', alignItems: 'center', gap: '6px',
        background: hasErrors ? `${tokens.colors.accentError}12` : `${tokens.colors.accentGreen}12`,
        color: hasErrors ? tokens.colors.accentError : tokens.colors.accentGreen,
        border: `1px solid ${hasErrors ? tokens.colors.accentError : tokens.colors.accentGreen}25`,
    }),
    planPreviewTable: {
        width: '100%', borderCollapse: 'collapse' as const, fontSize: '10px',
        fontFamily: "'JetBrains Mono', monospace",
    },
    planPreviewRow: {
        borderBottom: '1px solid rgba(255,255,255,0.03)',
    },
    planPreviewCell: {
        padding: '6px 4px', color: 'rgba(255,255,255,0.6)',
    },
    methodBadge: (method: string) => {
        const colorMap: Record<string, string> = {
            GET: tokens.colors.accentGreen, POST: tokens.colors.accentBlue,
            PUT: tokens.colors.accentOrange, PATCH: tokens.colors.accentPurple,
            DELETE: tokens.colors.accentError,
        };
        const c = colorMap[method] || 'rgba(255,255,255,0.3)';
        return {
            display: 'inline-block', padding: '2px 6px', borderRadius: '4px',
            background: `${c}18`, color: c, fontWeight: 900, fontSize: '8px',
            letterSpacing: '0.5px', minWidth: '36px', textAlign: 'center' as const,
        };
    },
    viewToggleBar: {
        display: 'flex', gap: '0', borderRadius: '8px', overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)', marginBottom: '6px',
    },
    viewToggleBtn: (active: boolean) => ({
        flex: 1, padding: '5px 10px', fontSize: '9px', fontWeight: 800,
        letterSpacing: '0.8px', textTransform: 'uppercase' as const,
        background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
        color: active ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)',
        border: 'none', cursor: 'pointer', transition: 'all 0.15s',
    }),
};

const sliderCSS = `
    input[type=range].k6-slider::-webkit-slider-thumb {
        -webkit-appearance: none; appearance: none;
        width: 16px; height: 16px; border-radius: 50%;
        background: ${tokens.colors.accentGreen}; cursor: pointer;
        border: 2px solid rgba(0,0,0,0.4);
        box-shadow: 0 0 8px ${tokens.colors.accentGreen}80;
    }
    input[type=range].k6-slider::-moz-range-thumb {
        width: 14px; height: 14px; border-radius: 50%;
        background: ${tokens.colors.accentGreen}; cursor: pointer;
        border: 2px solid rgba(0,0,0,0.4);
    }
`;

/**
 * Enhanced Orchestrator with unified URL, sliders, plan preview, and inline validation.
 * Phase 2 upgrade — backward compatible props.
 */
export const K6Orchestrator: React.FC<K6OrchestratorProps> = memo(({
    loading, protocol, setProtocol, host, setHost, setBaseUrlOnPlanJson,
    port, setPort, route, setRoute, authToken, setAuthToken,
    vusSingle, setVusSingle, durationSingle, setDurationSingle,
    handleCancel, handleRunPlan, handleRunSingle, statusMessage,
    planPreset, handleLoadPreset,
    planJson, setPlanJson, planJsonError, setPlanJsonError
}) => {
    const [showDetails, setShowDetails] = useState(false);
    const [showToken, setShowToken] = useState(false);
    const [planView, setPlanView] = useState<'visual' | 'json'>('visual');

    // ─── Unified URL ─────────────────────────────────────────────────
    const fullUrl = useMemo(() => {
        return `${protocol}${host}${port ? ':' + port : ''}`;
    }, [protocol, host, port]);

    const handleUnifiedUrlChange = useCallback((raw: string) => {
        const trimmed = raw.trim();
        let proto = protocol;
        let h = trimmed;

        if (h.startsWith('https://')) { proto = 'https://'; h = h.slice(8); }
        else if (h.startsWith('http://')) { proto = 'http://'; h = h.slice(7); }

        // Split host:port
        const colonIdx = h.indexOf(':');
        if (colonIdx !== -1) {
            const afterColon = h.slice(colonIdx + 1);
            const slashIdx = afterColon.indexOf('/');
            const portCandidate = slashIdx !== -1 ? afterColon.slice(0, slashIdx) : afterColon;
            if (/^\d+$/.test(portCandidate)) {
                setPort(portCandidate);
                h = h.slice(0, colonIdx);
                if (slashIdx !== -1) {
                    setRoute(afterColon.slice(slashIdx));
                }
            }
        }

        // check for route in remaining
        const slashIdx = h.indexOf('/');
        if (slashIdx !== -1) {
            setRoute(h.slice(slashIdx));
            h = h.slice(0, slashIdx);
        }

        setProtocol(proto);
        setHost(h);
        setBaseUrlOnPlanJson(h);
    }, [protocol, setProtocol, setHost, setPort, setRoute, setBaseUrlOnPlanJson]);

    const toggleProtocol = useCallback(() => {
        const next = protocol === 'http://' ? 'https://' : 'http://';
        setProtocol(next);
    }, [protocol, setProtocol]);

    // ─── Estimated requests ──────────────────────────────────────────
    const estimatedRequests = useMemo(() => {
        return Math.round(vusSingle * durationSingle * 0.8);
    }, [vusSingle, durationSingle]);

    // ─── Plan validation ─────────────────────────────────────────────
    const validation = useMemo(() => validatePlanJson(planJson), [planJson]);
    const planSummary = useMemo(() => getPlanSummary(planJson), [planJson]);

    // ─── Plan steps for preview ──────────────────────────────────────
    const planSteps = useMemo(() => {
        try {
            const p = JSON.parse(planJson);
            return Array.isArray(p.steps) ? p.steps : [];
        } catch { return []; }
    }, [planJson]);

    return (
        <div style={styles.orchestratorBox}>
            <style>{sliderCSS}</style>
            <div style={styles.chartTitle}><Zap size={14} color={tokens.colors.accentPurple} /> ORCHESTRATOR</div>
            <div style={styles.orchestratorStack}>

                {/* ── Unified URL Field ────────────────────────────── */}
                <div>
                    <span style={styles.inputLabel}><Globe size={8} /> URL DEL SERVIDOR</span>
                    <div style={{
                        ...S.urlField,
                        borderColor: loading ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)',
                    }}>
                        <div
                            style={S.urlProto}
                            onClick={toggleProtocol}
                            title="Click para alternar HTTP/HTTPS"
                        >
                            {protocol === 'https://' ? '🔒 HTTPS' : 'HTTP'}
                        </div>
                        <input
                            disabled={loading}
                            style={S.urlInput}
                            value={`${host}${port ? ':' + port : ''}`}
                            onChange={e => handleUnifiedUrlChange(e.target.value)}
                            placeholder="localhost:3000"
                        />
                        <span style={S.urlStatus(null)}>●</span>
                    </div>

                    {/* Collapsible details */}
                    <div style={S.detailToggle} onClick={() => setShowDetails(!showDetails)}>
                        {showDetails ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                        {showDetails ? 'Ocultar detalles' : 'Ver detalles de conexión'}
                    </div>
                    {showDetails && (
                        <div style={S.detailGrid}>
                            <div>
                                <span style={styles.inputLabel}>PROTO</span>
                                <select disabled={loading} style={styles.input} value={protocol} onChange={e => setProtocol(e.target.value)}>
                                    <option value="http://">HTTP</option>
                                    <option value="https://">HTTPS</option>
                                </select>
                            </div>
                            <div>
                                <span style={styles.inputLabel}>HOST</span>
                                <input disabled={loading} style={styles.input} value={host}
                                    onChange={e => { setHost(e.target.value); setBaseUrlOnPlanJson(e.target.value); }} />
                            </div>
                            <div>
                                <span style={styles.inputLabel}>PORT</span>
                                <input disabled={loading} style={styles.input} value={port} onChange={e => setPort(e.target.value)} />
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Route ─────────────────────────────────────────── */}
                <div style={{ opacity: loading ? 0.5 : 1 }}>
                    <span style={styles.inputLabel}>RUTA SIMPLE (Opcional)</span>
                    <input disabled={loading} style={styles.input} value={route} onChange={e => setRoute(e.target.value)} placeholder="/api/ping" />
                </div>

                {/* ── Auth Token ────────────────────────────────────── */}
                <div style={{ opacity: loading ? 0.5 : 1 }}>
                    <span style={styles.inputLabel}><Shield size={8} /> BEARER TOKEN (Auth)</span>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <input
                            disabled={loading}
                            style={{ ...styles.input, flex: 1 }}
                            type={showToken ? 'text' : 'password'}
                            value={authToken}
                            onChange={e => setAuthToken(e.target.value)}
                            placeholder="eyJhbGci..."
                        />
                        <button
                            type="button"
                            onClick={() => setShowToken(!showToken)}
                            style={{
                                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'rgba(255,255,255,0.3)',
                            }}
                            title={showToken ? 'Ocultar token' : 'Mostrar token'}
                        >
                            {showToken ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                    </div>
                </div>

                {/* ── VUs / Duration Sliders ────────────────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={S.sliderContainer}>
                        <span style={styles.inputLabel}>USUARIOS VIRTUALES</span>
                        <div style={S.sliderRow}>
                            <input
                                type="range" className="k6-slider"
                                min={1} max={500} value={vusSingle}
                                onChange={e => setVusSingle(Number(e.target.value))}
                                style={S.sliderTrack}
                            />
                            <span style={S.sliderValue(tokens.colors.accentGreen)}>{vusSingle}</span>
                        </div>
                    </div>
                    <div style={S.sliderContainer}>
                        <span style={styles.inputLabel}>DURACIÓN (segundos)</span>
                        <div style={S.sliderRow}>
                            <input
                                type="range" className="k6-slider"
                                min={5} max={600} step={5} value={durationSingle}
                                onChange={e => setDurationSingle(Number(e.target.value))}
                                style={S.sliderTrack}
                            />
                            <span style={S.sliderValue(tokens.colors.accentTeal)}>
                                {durationSingle >= 60 ? `${Math.floor(durationSingle / 60)}m${durationSingle % 60 ? durationSingle % 60 + 's' : ''}` : `${durationSingle}s`}
                            </span>
                        </div>
                    </div>
                </div>
                <div style={S.sliderHint}>
                    ≈ {estimatedRequests.toLocaleString()} peticiones estimadas ({vusSingle} VUs × {durationSingle}s)
                </div>

                {/* ── Actions ───────────────────────────────────────── */}
                <div style={styles.actionButtonRow}>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={loading ? handleCancel : handleRunPlan}
                        style={{ ...styles.button(loading ? tokens.colors.accentError : tokens.colors.accentGreen), flex: 1.5, fontSize: '10px' }}
                    >
                        {loading ? <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><RefreshCw className="spin" size={12} /> CANCELAR</div> : '▶ ENVIAR PLAN'}
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRunSingle}
                        disabled={loading}
                        style={{ ...styles.button('transparent'), flex: 1, border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px', color: loading ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)' }}
                    >
                        PRUEBA SIMPLE
                    </motion.button>
                </div>

                {statusMessage && (
                    <div style={styles.statusMessageBanner}>{statusMessage}</div>
                )}

                {/* ── Plan Config ───────────────────────────────────── */}
                <div style={styles.planConfigBox}>
                    <div style={styles.planConfigHeader}>
                        <span style={styles.inputLabel}>PLAN CONFIG</span>
                        <select
                            value={planPreset}
                            onChange={(e) => handleLoadPreset(e.target.value as any)}
                            style={{ ...styles.input, width: 'auto', padding: '2px 8px', fontSize: '9px', height: '24px' }}
                        >
                            <option value="smoke">Smoke</option>
                            <option value="load">Load</option>
                            <option value="stress">Stress</option>
                            <option value="soak">Soak</option>
                        </select>
                    </div>

                    {/* View toggle */}
                    <div style={S.viewToggleBar}>
                        <button type="button" style={S.viewToggleBtn(planView === 'visual')} onClick={() => setPlanView('visual')}>
                            Visual
                        </button>
                        <button type="button" style={S.viewToggleBtn(planView === 'json')} onClick={() => setPlanView('json')}>
                            JSON
                        </button>
                    </div>

                    {/* Plan Summary */}
                    {planSummary && (
                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', marginBottom: '4px', fontStyle: 'italic' }}>
                            {planSummary}
                        </div>
                    )}

                    {/* Validation bar */}
                    {planJson !== '{}' && (
                        <div style={S.validationBar(!validation.valid)}>
                            {validation.valid
                                ? <><CheckCircle size={12} /> Plan válido — listo para ejecutar</>
                                : <><AlertTriangle size={12} /> {validation.errors.length} {validation.errors.length === 1 ? 'error' : 'errores'} — {validation.errors[0]?.message}</>
                            }
                        </div>
                    )}

                    {/* Visual view */}
                    {planView === 'visual' && planSteps.length > 0 && (
                        <div style={{ maxHeight: '160px', overflowY: 'auto', marginTop: '6px' }}>
                            <table style={S.planPreviewTable}>
                                <thead>
                                    <tr>
                                        <th style={{ ...S.planPreviewCell, color: 'rgba(255,255,255,0.2)', fontWeight: 900 }}>✓</th>
                                        <th style={{ ...S.planPreviewCell, color: 'rgba(255,255,255,0.2)', fontWeight: 900 }}>Method</th>
                                        <th style={{ ...S.planPreviewCell, color: 'rgba(255,255,255,0.2)', fontWeight: 900 }}>Path</th>
                                        <th style={{ ...S.planPreviewCell, color: 'rgba(255,255,255,0.2)', fontWeight: 900 }}>Group</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {planSteps.map((step: any, i: number) => (
                                        <tr key={i} style={S.planPreviewRow}>
                                            <td style={S.planPreviewCell}>{step.enabled !== false ? '☑' : '☐'}</td>
                                            <td style={S.planPreviewCell}>
                                                <span style={S.methodBadge(String(step.method || 'GET').toUpperCase())}>
                                                    {String(step.method || 'GET').toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ ...S.planPreviewCell, color: 'rgba(255,255,255,0.8)' }}>{step.path || '/'}</td>
                                            <td style={S.planPreviewCell}>{step.group || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* JSON view */}
                    {planView === 'json' && (
                        <textarea
                            disabled={loading}
                            value={planJson}
                            onChange={(e) => {
                                setPlanJson(e.target.value);
                                if (planJsonError) setPlanJsonError(null);
                            }}
                            spellCheck={false}
                            style={styles.planJsonArea(loading)}
                        />
                    )}

                    {/* Visual empty state */}
                    {planView === 'visual' && planSteps.length === 0 && (
                        <div style={{
                            padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.2)',
                            fontSize: '10px', fontStyle: 'italic',
                        }}>
                            Selecciona un preset o sube un ZIP para ver los endpoints del plan.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});
