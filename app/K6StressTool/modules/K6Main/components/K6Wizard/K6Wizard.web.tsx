import React, { memo, useMemo } from 'react';
import { tokens } from '../../../../../SharedTool/style/tokens.shared.style';
import { wizardStyles as S } from './K6Wizard.web.styles';
import { useK6Wizard, WIZARD_STEPS, WizardPresetId } from './K6Wizard.web.logics';
import type { useExecutionStream } from '../K6ExecutionConsole/K6ExecutionConsole.web.logics';
import { cn } from '../../../../../SharedTool/utils/styles';

/* ─── Props ───────────────────────────────────────────────────────────────── */

interface K6WizardProps {
    onClose: () => void;
    onStartTest: (type: 'plan', payload: any) => Promise<boolean>;
    executionStream: ReturnType<typeof useExecutionStream>;
    onViewReport: () => void;
}

/* ─── Preset meta ─────────────────────────────────────────────────────────── */

const PRESETS: { id: WizardPresetId; icon: string; name: string; desc: string; accent: string }[] = [
    { id: 'smoke', icon: '🔥', name: 'Smoke', desc: '3 VUs · 1m · salud básica', accent: 'vianko-green' },
    { id: 'load', icon: '📊', name: 'Load', desc: '75 VUs · 10m · carga real', accent: 'vianko-blue' },
    { id: 'stress', icon: '💥', name: 'Stress', desc: '300 VUs · 10m · límites', accent: 'vianko-orange' },
    { id: 'soak', icon: '🏋️', name: 'Soak', desc: '25 VUs · 2h · resistencia', accent: 'vianko-purple' },
];

/* ─── Slider CSS (reused) ─────────────────────────────────────────────────── */

const sliderCSS = `
    input[type=range].wiz-slider::-webkit-slider-thumb {
        -webkit-appearance: none; appearance: none;
        width: 18px; height: 18px; border-radius: 50%;
        background: ${tokens.colors.accentGreen}; cursor: pointer;
        border: 2px solid rgba(0,0,0,0.5);
        box-shadow: 0 0 10px ${tokens.colors.accentGreen}80;
    }
    input[type=range].wiz-slider::-moz-range-thumb {
        width: 16px; height: 16px; border-radius: 50%;
        background: ${tokens.colors.accentGreen}; cursor: pointer;
        border: 2px solid rgba(0,0,0,0.5);
    }
`;

/* ─── Component ───────────────────────────────────────────────────────────── */

export const K6Wizard: React.FC<K6WizardProps> = memo(({ onClose, onStartTest, executionStream, onViewReport }) => {
    const wiz = useK6Wizard();

    const enabledCount = useMemo(() => wiz.endpoints.filter(e => e.enabled).length, [wiz.endpoints]);
    const estimatedReqs = useMemo(() => Math.round(wiz.profile.vus * wiz.profile.duration * 0.8), [wiz.profile]);

    const handleExecute = async () => {
        const plan = wiz.buildPlanFromWizard();
        const started = await onStartTest('plan', { plan, authToken: wiz.connection.authToken });
        if (started) {
            wiz.goToStep('execute');
        }
    };

    const formatDuration = (s: number) => {
        if (s >= 3600) return `${Math.floor(s / 3600)}h${s % 3600 ? Math.floor((s % 3600) / 60) + 'm' : ''}`;
        if (s >= 60) return `${Math.floor(s / 60)}m${s % 60 ? s % 60 + 's' : ''}`;
        return `${s}s`;
    };

    /* ── Steps content ─────────────────────────────────────────────── */

    const renderConnection = () => (
        <>
            <h2 className={S.stepTitle}>Conexión al servidor</h2>
            <p className={S.stepSubtitle}>Configura la URL base del backend que deseas evaluar.</p>

            <div style={{
                padding: '16px',
                borderRadius: '16px',
                background: 'rgba(34, 211, 238, 0.08)',
                border: `1px solid ${tokens.colors.accentTeal}26`,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
            }}>
                <span className={S.fieldLabel}>ðŸ§  IMPORTAR .ENV DEL FRONT</span>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                        type="file"
                        accept=".env,.txt"
                        onChange={wiz.handleEnvFileUpload}
                        className={S.fieldInput}
                        style={{ flex: 1, minWidth: '260px' }}
                    />
                    <button
                        type="button"
                        onClick={wiz.importEnvFile}
                        disabled={!wiz.envFile}
                        className={S.navBtn('vianko-teal')}
                        style={{ opacity: wiz.envFile ? 1 : 0.45 }}
                    >
                        Importar variables
                    </button>
                </div>
                <p style={{
                    margin: 0,
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '12px',
                    lineHeight: 1.6,
                }}>
                    El wizard intentarÃ¡ detectar automÃ¡ticamente `baseUrl`, `host`, `port`, `jwt`, `token` o `bearer`
                    desde variables tipo `VITE_*`, `NEXT_PUBLIC_*`, `REACT_APP_*` y nombres similares.
                </p>
                {wiz.envImportInfo && (
                    <div style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        fontSize: '11px',
                        color: 'rgba(255,255,255,0.68)',
                        display: 'grid',
                        gap: '6px',
                    }}>
                        <div><strong style={{ color: tokens.colors.accentGreen }}>Archivo:</strong> {wiz.envImportInfo.fileName}</div>
                        <div><strong style={{ color: tokens.colors.accentGreen }}>Variables leÃ­das:</strong> {wiz.envImportInfo.keysCount}</div>
                        {wiz.envImportInfo.detectedBaseUrl && (
                            <div><strong style={{ color: tokens.colors.accentTeal }}>Base URL detectada:</strong> {wiz.envImportInfo.detectedBaseUrl}</div>
                        )}
                        {wiz.envImportInfo.detectedTokenKey && (
                            <div><strong style={{ color: tokens.colors.accentBlue }}>Token detectado en:</strong> {wiz.envImportInfo.detectedTokenKey}</div>
                        )}
                        {wiz.envImportInfo.appliedKeys.length > 0 && (
                            <div>
                                <strong style={{ color: tokens.colors.accentOrange }}>Claves aplicadas:</strong>{' '}
                                {wiz.envImportInfo.appliedKeys.join(', ')}
                            </div>
                        )}
                    </div>
                )}
                {wiz.envImportError ? (
                    <div style={{
                        padding: '10px 12px',
                        borderRadius: '12px',
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.22)',
                        color: '#fca5a5',
                        fontSize: '11px',
                    }}>
                        {wiz.envImportError}
                    </div>
                ) : null}
            </div>

            <div className={S.fieldRow}>
                <div className={S.fieldGroup}>
                    <span className={S.fieldLabel}>Protocolo</span>
                    <select className={S.fieldInput} value={wiz.connection.protocol}
                        onChange={e => wiz.updateConnection({ protocol: e.target.value })}>
                        <option value="http://">HTTP</option>
                        <option value="https://">HTTPS</option>
                    </select>
                </div>
                <div className={S.fieldGroup}>
                    <span className={S.fieldLabel}>Host</span>
                    <input className={S.fieldInput} value={wiz.connection.host}
                        onChange={e => wiz.updateConnection({ host: e.target.value })}
                        placeholder="localhost" />
                </div>
                <div className={S.fieldGroup}>
                    <span className={S.fieldLabel}>Puerto</span>
                    <input className={S.fieldInput} value={wiz.connection.port}
                        onChange={e => wiz.updateConnection({ port: e.target.value })}
                        placeholder="3000" />
                </div>
            </div>

            <div className={S.fieldGroup}>
                <span className={S.fieldLabel}>🔑 Bearer Token (opcional)</span>
                <input className={S.fieldInput} value={wiz.connection.authToken}
                    onChange={e => wiz.updateConnection({ authToken: e.target.value })}
                    placeholder="eyJhbGci..." type="password" />
            </div>

            <div className={`p-[12px_14px] rounded-[12px] bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] text-[11px] text-[rgba(255,255,255,0.4)] font-mono`}>
                URL: <span style={{ color: tokens.colors.accentTeal }}>{wiz.baseUrl}</span>
            </div>
        </>
    );

    const renderEndpoints = () => (
        <>
            <h2 className={S.stepTitle}>Seleccionar endpoints</h2>
            <p className={S.stepSubtitle}>Agrega endpoints manualmente o sube un ZIP de tu proyecto para detectarlos automáticamente.</p>

            {/* ZIP Upload */}
            <div style={{
                padding: '14px', borderRadius: '14px',
                background: `${tokens.colors.accentTeal}08`, border: `1px solid ${tokens.colors.accentTeal}20`,
            }}>
                <span className={S.fieldLabel}>📦 DESCUBRIMIENTO AUTOMÁTICO</span>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
                    <input type="file" accept=".zip" onChange={wiz.handleWizardZipUpload}
                        className={S.fieldInput} style={{ flex: 1, fontSize: '11px', padding: '8px' }} />
                    <button type="button" onClick={wiz.analyzeZip}
                        disabled={!wiz.zipFile || wiz.isAnalyzing}
                        className={S.navBtn('vianko-teal')}
                        style={{
                            padding: '8px 16px', fontSize: '10px',
                            opacity: (!wiz.zipFile || wiz.isAnalyzing) ? 0.4 : 1,
                        }}>
                        {wiz.isAnalyzing ? 'Analizando...' : 'Analizar'}
                    </button>
                </div>
            </div>

            {/* Manual add */}
            <div className={S.fieldGroup}>
                <span className={S.fieldLabel}>➕ AGREGAR MANUAL</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                    <select className={S.fieldInput} style={{ width: '90px', flex: 'none' }}
                        value={wiz.manualEndpoint.method}
                        onChange={e => wiz.setManualEndpoint({ ...wiz.manualEndpoint, method: e.target.value })}>
                        <option>GET</option><option>POST</option><option>PUT</option>
                        <option>PATCH</option><option>DELETE</option>
                    </select>
                    <input className={S.fieldInput} style={{ flex: 1 }}
                        value={wiz.manualEndpoint.path}
                        onChange={e => wiz.setManualEndpoint({ ...wiz.manualEndpoint, path: e.target.value })}
                        placeholder="/api/users"
                        onKeyDown={e => { if (e.key === 'Enter') wiz.addManualEndpoint(); }}
                    />
                    <button type="button" onClick={wiz.addManualEndpoint}
                        className={S.navBtn('vianko-green')} style={{ padding: '8px 14px', fontSize: '10px' }}>
                        +
                    </button>
                </div>
            </div>

            {/* Endpoint list */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={S.fieldLabel}>ENDPOINTS ({enabledCount} activos)</span>
            </div>
            <div className={S.endpointList}>
                {wiz.endpoints.map((ep, i) => (
                    <div key={i} className={S.endpointRow(ep.enabled)}>
                        <input type="checkbox" checked={ep.enabled} onChange={() => wiz.toggleEndpoint(i)}
                            style={{ accentColor: tokens.colors.accentGreen }} />
                        <span className={S.methodBadge(ep.method)}>{ep.method}</span>
                        <span className={S.endpointPath}>{ep.path}</span>
                        <button type="button" className={S.endpointAction} onClick={() => wiz.removeEndpoint(i)}>✕</button>
                    </div>
                ))}
                {wiz.endpoints.length === 0 && (
                    <div style={{
                        padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.15)',
                        fontSize: '11px', fontStyle: 'italic',
                    }}>
                        Agrega endpoints arriba o sube un ZIP para comenzar.
                    </div>
                )}
            </div>
        </>
    );

    const renderProfile = () => (
        <>
            <h2 className={S.stepTitle}>Perfilar la prueba</h2>
            <p className={S.stepSubtitle}>Elige el tipo de evaluación y ajusta los parámetros de carga.</p>

            {/* Preset cards */}
            <div className={S.presetGrid}>
                {PRESETS.map(p => (
                    <div key={p.id}
                        className={S.presetCard(wiz.profile.preset === p.id, p.accent)}
                        onClick={() => wiz.selectPreset(p.id)}>
                        <div className={S.presetIcon}>{p.icon}</div>
                        <div className={S.presetName(wiz.profile.preset === p.id, p.accent)}>{p.name}</div>
                        <div className={S.presetDesc}>{p.desc}</div>
                    </div>
                ))}
            </div>

            {/* Sliders */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' }}>
                <div className={S.sliderGroup}>
                    <span className={S.fieldLabel}>Usuarios Virtuales (VUs)</span>
                    <div className={S.sliderRow}>
                        <input type="range" className={S.sliderTrack} min={1} max={500}
                            value={wiz.profile.vus} onChange={e => wiz.updateProfile({ vus: Number(e.target.value) })}
                             />
                        <span className={S.sliderVal('vianko-green')}>{wiz.profile.vus}</span>
                    </div>
                </div>
                <div className={S.sliderGroup}>
                    <span className={S.fieldLabel}>Duración</span>
                    <div className={S.sliderRow}>
                        <input type="range" className={S.sliderTrack} min={5} max={7200} step={5}
                            value={wiz.profile.duration} onChange={e => wiz.updateProfile({ duration: Number(e.target.value) })}
                             />
                        <span className={S.sliderVal('vianko-teal')}>{formatDuration(wiz.profile.duration)}</span>
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div style={{
                padding: '14px', borderRadius: '14px',
                background: `${tokens.colors.accentGreen}08`, border: `1px solid ${tokens.colors.accentGreen}18`,
                display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: '12px',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: 800 }}>ENDPOINTS</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: tokens.colors.accentBlue }}>{enabledCount}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: 800 }}>VUS</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: tokens.colors.accentGreen }}>{wiz.profile.vus}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: 800 }}>DURACIÓN</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: tokens.colors.accentTeal }}>
                        {formatDuration(wiz.profile.duration)}
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: 800 }}>≈ REQUESTS</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: tokens.colors.accentOrange }}>
                        {estimatedReqs.toLocaleString()}
                    </div>
                </div>
            </div>
        </>
    );

    const renderExecute = () => (
        <>
            <h2 className={S.stepTitle}>
                {executionStream.isComplete
                    ? (executionStream.isError ? '❌ Error en la ejecución' : '✅ Prueba completada')
                    : '🚀 Ejecución en progreso'}
            </h2>

            {/* Progress */}
            <div style={{ height: '6px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)' }}>
                <div style={{
                    height: '100%', borderRadius: '6px', transition: 'width 0.5s',
                    width: `${executionStream.progress}%`,
                    background: executionStream.isError
                        ? `linear-gradient(90deg, ${tokens.colors.accentError}, ${tokens.colors.accentOrange})`
                        : `linear-gradient(90deg, ${tokens.colors.accentTeal}, ${tokens.colors.accentGreen})`,
                    boxShadow: `0 0 12px ${executionStream.isError ? tokens.colors.accentError : tokens.colors.accentGreen}60`,
                }} />
            </div>

            {/* Live metrics */}
            {executionStream.liveMetrics && (
                <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                        { label: 'VUs', value: `${executionStream.liveMetrics.vus}/${executionStream.liveMetrics.maxVus}`, color: tokens.colors.accentTeal },
                        { label: 'Iteraciones', value: executionStream.liveMetrics.iterations, color: tokens.colors.accentGreen },
                        { label: 'Transcurrido', value: executionStream.liveMetrics.elapsed, color: tokens.colors.accentBlue },
                    ].map(m => (
                        <div key={m.label} style={{
                            flex: 1, padding: '10px', borderRadius: '10px',
                            background: `${m.color}08`, border: `1px solid ${m.color}18`,
                            textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '8px', fontWeight: 800, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.5px' }}>{m.label}</div>
                            <div style={{ fontSize: '14px', fontWeight: 900, color: m.color, fontFamily: "'JetBrains Mono', monospace" }}>{m.value}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Mini terminal */}
            <div style={{
                background: 'rgba(0,0,0,0.4)', borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.04)', padding: '10px 12px',
                maxHeight: '200px', overflowY: 'auto',
                fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', lineHeight: 1.8,
            }}>
                {executionStream.entries.slice(-15).map(e => (
                    <div key={e.id} style={{
                        color: e.level === 'error' ? tokens.colors.accentError
                            : e.level === 'warn' ? tokens.colors.accentOrange
                            : e.level === 'phase' ? tokens.colors.accentTeal
                            : 'rgba(255,255,255,0.4)',
                    }}>
                        {e.text}
                    </div>
                ))}
            </div>

            {/* Result summary */}
            {executionStream.isComplete && executionStream.result?.success && (
                <div style={{
                    padding: '14px', borderRadius: '14px',
                    background: `${tokens.colors.accentGreen}08`, border: `1px solid ${tokens.colors.accentGreen}22`,
                    display: 'flex', justifyContent: 'center', gap: '8px',
                }}>
                    <button type="button" onClick={onViewReport}
                        className={S.navBtn('vianko-green')}>
                        📊 Ver reporte completo
                    </button>
                </div>
            )}
        </>
    );

    const renderStep = () => {
        switch (wiz.currentStep) {
            case 'connection': return renderConnection();
            case 'endpoints': return renderEndpoints();
            case 'profile': return renderProfile();
            case 'execute': return renderExecute();
            case 'results': return renderExecute(); // re-use execute view
        }
    };

    /* ── Main render ───────────────────────────────────────────────── */

    return (
        <div className={S.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <style>{S.keyframes}{sliderCSS}</style>
            <div className={cn(S.container, 'relative')}>
                <button type="button" className={S.closeBtn} onClick={onClose}>✕ Cerrar</button>

                {/* Header + Stepper */}
                <div className={S.header}>
                    <div className={S.headerTitle}>🧙 Asistente de evaluación K6</div>
                    <div className={S.stepper}>
                        {WIZARD_STEPS.map((step, i) => (
                            <div key={step.key} className={S.stepDot(
                                i < wiz.stepIndex ? 'done' : i === wiz.stepIndex ? 'active' : 'pending'
                            )} />
                        ))}
                    </div>
                    <div className={S.stepLabels}>
                        {WIZARD_STEPS.map((step, i) => (
                            <span key={step.key} className={S.stepLabel(
                                i < wiz.stepIndex ? 'done' : i === wiz.stepIndex ? 'active' : 'pending'
                            )}>
                                {step.icon} {step.label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Body */}
                <div className={S.body}>
                    {renderStep()}
                </div>

                {/* Footer navigation */}
                <div className={S.footer}>
                    <div>
                        {wiz.stepIndex > 0 && wiz.currentStep !== 'execute' && (
                            <button type="button" onClick={wiz.goBack}
                                className={S.navBtn('rgba(255,255,255,0.15)', true)}>
                                ← Atrás
                            </button>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        {wiz.currentStep === 'profile' && (
                            <button type="button" onClick={handleExecute}
                                disabled={!wiz.canGoNext || enabledCount === 0}
                                className={S.navBtn('vianko-green')}
                                style={{
                                    opacity: (!wiz.canGoNext || enabledCount === 0) ? 0.4 : 1,
                                }}>
                                🚀 Ejecutar prueba
                            </button>
                        )}
                        {wiz.currentStep !== 'profile' && wiz.currentStep !== 'execute' && wiz.currentStep !== 'results' && (
                            <button type="button" onClick={wiz.goNext}
                                disabled={!wiz.canGoNext}
                                className={S.navBtn('vianko-teal')}
                                style={{
                                    opacity: wiz.canGoNext ? 1 : 0.4,
                                }}>
                                Siguiente →
                            </button>
                        )}
                        {wiz.currentStep === 'execute' && executionStream.isComplete && (
                            <button type="button" onClick={onClose}
                                className={S.navBtn('rgba(255,255,255,0.15)', true)}>
                                Cerrar asistente
                            </button>
                        )}
                        {wiz.currentStep === 'execute' && !executionStream.isComplete && (
                            <button type="button" onClick={() => executionStream.cancelActiveTest()}
                                className={S.navBtn('vianko-danger')}>
                                ⊘ Cancelar
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});
