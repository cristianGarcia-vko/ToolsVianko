import React, { memo, lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useK6MainLogic } from './K6Main.web.logics';
import { tokens } from '../../../SharedTool/style/tokens.shared.style';
import { k6Styles as styles } from './K6Main.web.styles';
import { k6ModuleGuides, ModuleGuideKey } from './K6Main.guides';

// Lazy loading for heavy sub-components to optimize initial bundle size and UI performance
const K6Dashboard = lazy(() => import('./components/K6Dashboard/K6Dashboard.web').then(m => ({ default: m.K6Dashboard })));
const K6QAAnalysis = lazy(() => import('./components/K6QAAnalysis/K6QAAnalysis.web').then(m => ({ default: m.K6QAAnalysis })));
const K6Orchestrator = lazy(() => import('./components/K6Orchestrator/K6Orchestrator.web').then(m => ({ default: m.K6Orchestrator })));
const K6Insights = lazy(() => import('./components/K6Insights/K6Insights.web').then(m => ({ default: m.K6Insights })));
const K6History = lazy(() => import('./components/K6History/K6History.web').then(m => ({ default: m.K6History })));
const SanityReportView = lazy(() => import('./components/SanityReportView/SanityReportView.web').then(m => ({ default: m.SanityReportView })));
const SQLSeedGeneratorPanel = lazy(() => import('./components/SQLSeedGeneratorPanel/SQLSeedGeneratorPanel.web').then(m => ({ default: m.SQLSeedGeneratorPanel })));
const DataMigratorPanel = lazy(() => import('./components/DataMigratorPanel/DataMigratorPanel.web').then(m => ({ default: m.DataMigratorPanel })));
const MonitorPanel = lazy(() => import('./components/MonitorPanel/MonitorPanel.web').then(m => ({ default: m.MonitorPanel })));
const EndpointDiscoveryPanel = lazy(() => import('./components/EndpointDiscoveryPanel/EndpointDiscoveryPanel.web').then(m => ({ default: m.EndpointDiscoveryPanel })));
const ModuleGuideModal = lazy(() => import('./components/ModuleGuideModal/ModuleGuideModal.web').then(m => ({ default: m.ModuleGuideModal })));
const K6ExecutionConsole = lazy(() => import('./components/K6ExecutionConsole/K6ExecutionConsole.web').then(m => ({ default: m.K6ExecutionConsole })));
const K6Wizard = lazy(() => import('./components/K6Wizard/K6Wizard.web').then(m => ({ default: m.K6Wizard })));
import { K6ToastContainer } from './components/K6Toast/K6Toast.web';

/**
 * Skeleton Loader Atom for Elite Architecture Vianko.
 */
const SkeletonLoader: React.FC<{ height?: number | string, width?: string }> = ({ height = 120, width = '100%' }) => (
    <div style={{
        height, width,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
        backgroundSize: '200% 100%',
        borderRadius: '16px',
        animation: 'skeleton-loading 1.5s infinite linear',
    }} className="skeleton-vko" />
);

/**
 * Fragmented & Asynchronous Module for K6Main.
 * Complies with Vianko Architecture Contract (Zero Logic in View + Maximum Optimization).
 */
const K6MainModule: React.FC = memo(() => {
    const logic = useK6MainLogic();
    const [activeGuideKey, setActiveGuideKey] = useState<ModuleGuideKey | null>(null);
    const {
        currentReport, loading, historyData,
        handleAnalyze, handleRunSingle,
        host, setHost, vusSingle, setVusSingle,
        protocol, setProtocol, port, setPort, route, setRoute,
        durationSingle, setDurationSingle,
        zipFile, handleZipUpload, authToken, setAuthToken,
        analysisResult,
        planPreset, planJson, planJsonError, setPlanJson, setPlanJsonError,
        handleLoadPreset, handleApplyZipEndpointsToPlan, handleRunPlan, setBaseUrlOnPlanJson,
        statusMessage, handleCancel,
        stats, showReport, setShowReport, monitorBaseUrl,
        // Phase 1 — Execution Console
        executionStream,
        showConsole,
        handleViewReport,
        handleConsoleClose,
        handleConsoleRerun,
        handleCancelStream,
        // Phase 2/3 — Wizard + Toast
        showWizard, setShowWizard,
        toast,
        handleWizardStart,
        handleWizardViewReport,
    } = logic;

    // Pre-warming fragments for seamless UX
    useEffect(() => {
        // Just triggering the dynamic imports
        import('./components/K6Dashboard/K6Dashboard.web');
        import('./components/K6Orchestrator/K6Orchestrator.web');
    }, []);

    const activeGuide = useMemo(
        () => (activeGuideKey ? k6ModuleGuides[activeGuideKey] : null),
        [activeGuideKey],
    );

    const renderModuleCard = (
        moduleKey: ModuleGuideKey,
        title: string,
        description: string,
        accent: string,
        content: React.ReactNode,
    ) => (
        <div style={styles.moduleCard(accent)}>
            <div style={styles.moduleCardHeader}>
                <div>
                    <h3 style={styles.moduleCardTitle}>{title}</h3>
                    <p style={styles.moduleCardDescription}>{description}</p>
                </div>
                <button
                    type="button"
                    style={styles.moduleHelpButton(accent)}
                    onClick={() => setActiveGuideKey(moduleKey)}
                >
                    Ayuda
                </button>
            </div>
            {content}
        </div>
    );

    return (
        <div style={styles.container}>
            <style>{`
                @keyframes skeleton-loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                .skeleton-vko { border: 1px solid rgba(255,255,255,0.02); }
            `}</style>
            
            <Suspense fallback={null}>
                {showReport && currentReport && (
                    <SanityReportView 
                        report={currentReport} 
                        onClose={() => setShowReport(false)} 
                    />
                )}
            </Suspense>

            <Suspense fallback={null}>
                <ModuleGuideModal guide={activeGuide} onClose={() => setActiveGuideKey(null)} />
            </Suspense>

            <Suspense fallback={null}>
                {showConsole && (
                    <K6ExecutionConsole
                        phase={executionStream.phase}
                        progress={executionStream.progress}
                        entries={executionStream.entries}
                        liveMetrics={executionStream.liveMetrics}
                        isComplete={executionStream.isComplete}
                        isError={executionStream.isError}
                        isConnected={executionStream.isConnected}
                        result={executionStream.result}
                        onCancel={handleCancelStream}
                        onClose={handleConsoleClose}
                        onViewReport={handleViewReport}
                        onRerun={handleConsoleRerun}
                    />
                )}
            </Suspense>
            <Suspense fallback={null}>
                {showWizard && (
                    <K6Wizard
                        onClose={() => setShowWizard(false)}
                        onStartTest={handleWizardStart}
                        executionStream={executionStream}
                        onViewReport={handleWizardViewReport}
                    />
                )}
            </Suspense>

            <K6ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />

            <div style={styles.dashboardGrid}>
                <div style={styles.mainPanel}>
                    <section style={styles.toolGroup('rgba(0, 196, 180, 0.18)', 'rgba(0, 196, 180, 0.08)')}>
                        <div style={styles.toolGroupHeader}>
                            <div>
                                <div style={styles.toolGroupEyebrow(tokens.colors.accentTeal)}>Fuente central</div>
                                <h2 style={styles.toolGroupTitle}>Descubridor compartido de endpoints</h2>
                                <p style={styles.toolGroupText}>
                                    El analizador ZIP queda separado del resto del tablero y publica la informacion para las herramientas conectadas.
                                </p>
                            </div>
                        </div>

                        <Suspense fallback={<SkeletonLoader height={260} />}>
                            {renderModuleCard(
                                'discovery',
                                'Endpoint Discovery Hub',
                                'Guia de carga ZIP, deteccion automatica y distribucion a los demas modulos.',
                                tokens.colors.accentTeal,
                                <EndpointDiscoveryPanel
                                    loading={loading}
                                    zipFile={zipFile}
                                    handleZipUpload={handleZipUpload}
                                    handleAnalyze={handleAnalyze}
                                    handleApplyZipEndpointsToPlan={handleApplyZipEndpointsToPlan}
                                    analysisResult={analysisResult}
                                />,
                            )}
                        </Suspense>
                    </section>

                    <section style={styles.toolGroup('rgba(255, 196, 82, 0.18)', 'rgba(255, 196, 82, 0.06)')}>
                        <div style={styles.toolGroupHeader}>
                            <div>
                                <div style={styles.toolGroupEyebrow(tokens.colors.accentOrange)}>Observabilidad</div>
                                <h2 style={styles.toolGroupTitle}>Dashboard, QA y lectura de resultados</h2>
                                <p style={styles.toolGroupText}>
                                    Este bloque agrupa las vistas para entender salud, errores y hallazgos despues del descubrimiento y la ejecucion.
                                </p>
                            </div>
                        </div>

                        <div style={styles.toolGroupStack}>
                            <Suspense fallback={<SkeletonLoader height={400} />}>
                                {renderModuleCard(
                                    'dashboard',
                                    'Dashboard',
                                    'Resumen ejecutivo de salud, RPS, error rate y latencia del ultimo reporte.',
                                    tokens.colors.accentBlue,
                                    <K6Dashboard currentReport={currentReport} stats={stats} />,
                                )}
                            </Suspense>

                            <Suspense fallback={<SkeletonLoader height={240} />}>
                                {renderModuleCard(
                                    'qaAnalysis',
                                    'QA Analysis',
                                    'Lectura de codigos HTTP y detalle por endpoint para localizar riesgos.',
                                    tokens.colors.accentOrange,
                                    <K6QAAnalysis currentReport={currentReport} analysisResult={analysisResult} />,
                                )}
                            </Suspense>

                            <Suspense fallback={<SkeletonLoader height={100} />}>
                                {renderModuleCard(
                                    'insights',
                                    'Decision Insights',
                                    'Interpretacion guiada del resultado para usuarios tecnicos y no tecnicos.',
                                    tokens.colors.accentGreen,
                                    <K6Insights stats={stats} />,
                                )}
                            </Suspense>
                        </div>
                    </section>
                </div>

                <div style={styles.sidePanel}>
                    <section style={styles.toolGroup('rgba(93, 230, 156, 0.18)', 'rgba(93, 230, 156, 0.06)')}>
                        <div style={styles.toolGroupHeader}>
                            <div>
                                <div style={styles.toolGroupEyebrow(tokens.colors.accentGreen)}>Ejecucion</div>
                                <h2 style={styles.toolGroupTitle}>Orquestacion y configuracion de pruebas</h2>
                                <p style={styles.toolGroupText}>
                                    El runner, la configuracion base y el plan editable permanecen juntos como bloque operativo principal.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowWizard(true)}
                                style={{
                                    background: `linear-gradient(135deg, ${tokens.colors.accentTeal}, ${tokens.colors.accentGreen})`,
                                    border: 'none', borderRadius: '12px',
                                    padding: '10px 18px', cursor: 'pointer',
                                    fontSize: '10px', fontWeight: 900,
                                    letterSpacing: '1px', textTransform: 'uppercase' as const,
                                    color: '#000', whiteSpace: 'nowrap' as const,
                                    boxShadow: `0 4px 16px ${tokens.colors.accentGreen}40`,
                                    transition: 'transform 0.15s',
                                }}
                            >
                                🧙 Asistente Guiado
                            </button>
                        </div>

                        <Suspense fallback={<SkeletonLoader height={500} />}>
                            {renderModuleCard(
                                'orchestrator',
                                'Orchestrator',
                                'Configura URL base, autenticacion, prueba simple y plan JSON para lanzar cargas.',
                                tokens.colors.accentGreen,
                                <K6Orchestrator
                                    loading={loading}
                                    protocol={protocol} setProtocol={setProtocol}
                                    host={host} setHost={setHost} setBaseUrlOnPlanJson={setBaseUrlOnPlanJson}
                                    port={port} setPort={setPort}
                                    route={route} setRoute={setRoute}
                                    authToken={authToken} setAuthToken={setAuthToken}
                                    vusSingle={vusSingle} setVusSingle={setVusSingle}
                                    durationSingle={durationSingle} setDurationSingle={setDurationSingle}
                                    handleCancel={handleCancel} handleRunPlan={handleRunPlan}
                                    handleRunSingle={handleRunSingle} statusMessage={statusMessage || ''}
                                    planPreset={planPreset} handleLoadPreset={handleLoadPreset}
                                    planJson={planJson} setPlanJson={setPlanJson}
                                    planJsonError={planJsonError} setPlanJsonError={setPlanJsonError}
                                />,
                            )}
                        </Suspense>
                    </section>

                    <section style={styles.toolGroup('rgba(160, 132, 255, 0.2)', 'rgba(160, 132, 255, 0.07)')}>
                        <div style={styles.toolGroupHeader}>
                            <div>
                                <div style={styles.toolGroupEyebrow(tokens.colors.accentPurple)}>Herramientas conectadas</div>
                                <h2 style={styles.toolGroupTitle}>Modulos que reutilizan endpoints y contexto</h2>
                                <p style={styles.toolGroupText}>
                                    El monitor, el historico y las utilidades quedan agrupados para comunicar claramente que consumen el estado compartido.
                                </p>
                            </div>
                        </div>

                        <div style={styles.toolGroupStack}>
                            <Suspense fallback={<SkeletonLoader height={360} />}>
                                {renderModuleCard(
                                    'monitor',
                                    'Monitor Proactivo',
                                    'Evalua endpoints detectados o manuales y permite registrar resultados.',
                                    tokens.colors.accentPurple,
                                    <MonitorPanel
                                        sourceEndpoints={analysisResult?.type === 'analysis' ? analysisResult.endpoints : []}
                                        baseUrl={monitorBaseUrl}
                                        authToken={authToken}
                                        initialProjectName={zipFile?.name || currentReport?.projectName || ''}
                                    />,
                                )}
                            </Suspense>

                            <Suspense fallback={<SkeletonLoader height={200} />}>
                                {renderModuleCard(
                                    'history',
                                    'Historial',
                                    'Consulta rapida de ejecuciones recientes para revisar contexto operativo.',
                                    tokens.colors.accentTeal,
                                    <K6History historyData={historyData} />,
                                )}
                            </Suspense>

                            <Suspense fallback={<SkeletonLoader height={160} />}>
                                {renderModuleCard(
                                    'sqlSeed',
                                    'SQL Seed Generator',
                                    'Prepara datos de prueba para poblar la base antes de correr carga.',
                                    tokens.colors.accentOrange,
                                    <SQLSeedGeneratorPanel />,
                                )}
                            </Suspense>

                            <Suspense fallback={<SkeletonLoader height={260} />}>
                                {renderModuleCard(
                                    'dataMigrator',
                                    'Traductor de BD',
                                    'Motor universal para convertir CSV/XML/JSON/SQL Inserts hacia SQL, JSON, CSV o migracion Prisma.',
                                    tokens.colors.accentBlue,
                                    <DataMigratorPanel />,
                                )}
                            </Suspense>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
});

export default K6MainModule;
