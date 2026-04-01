import React, { memo, lazy, Suspense, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useK6MainLogic } from './K6Main.web.logics';
import { k6Styles as styles } from './K6Main.web.styles';

// Lazy loading for heavy sub-components to optimize initial bundle size and UI performance
const K6Dashboard = lazy(() => import('./components/K6Dashboard/K6Dashboard.web').then(m => ({ default: m.K6Dashboard })));
const K6QAAnalysis = lazy(() => import('./components/K6QAAnalysis/K6QAAnalysis.web').then(m => ({ default: m.K6QAAnalysis })));
const K6Orchestrator = lazy(() => import('./components/K6Orchestrator/K6Orchestrator.web').then(m => ({ default: m.K6Orchestrator })));
const K6Insights = lazy(() => import('./components/K6SupportFragments.web').then(m => ({ default: m.K6Insights })));
const K6History = lazy(() => import('./components/K6SupportFragments.web').then(m => ({ default: m.K6History })));
const SanityReportView = lazy(() => import('./components/SanityReportView/SanityReportView.web').then(m => ({ default: m.SanityReportView })));
const SQLSeedGeneratorPanel = lazy(() => import('./components/SQLSeedGeneratorPanel/SQLSeedGeneratorPanel.web').then(m => ({ default: m.SQLSeedGeneratorPanel })));

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
        stats, showReport, setShowReport
    } = logic;

    // Pre-warming fragments for seamless UX
    useEffect(() => {
        // Just triggering the dynamic imports
        import('./components/K6Dashboard/K6Dashboard.web');
        import('./components/K6Orchestrator/K6Orchestrator.web');
    }, []);

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

            <div style={styles.dashboardGrid}>
                {/* LEFT PANEL: Higher interaction complexity, loaded in Parallel */}
                <div style={styles.mainPanel}>
                    <Suspense fallback={<SkeletonLoader height={400} />}>
                        <K6Dashboard currentReport={currentReport} stats={stats} />
                    </Suspense>
                    
                    <Suspense fallback={<SkeletonLoader height={240} />}>
                        <K6QAAnalysis currentReport={currentReport} analysisResult={analysisResult} />
                    </Suspense>
                    
                    <Suspense fallback={<SkeletonLoader height={100} />}>
                        <K6Insights stats={stats} />
                    </Suspense>
                </div>

                {/* RIGHT PANEL: Logic orchestrator (PRIORITY UI) */}
                <div style={styles.sidePanel}>
                    <Suspense fallback={<SkeletonLoader height={500} />}>
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
                            zipFile={zipFile} handleZipUpload={handleZipUpload}
                            handleAnalyze={handleAnalyze} analysisResult={analysisResult}
                            handleApplyZipEndpointsToPlan={handleApplyZipEndpointsToPlan}
                            planPreset={planPreset} handleLoadPreset={handleLoadPreset}
                            planJson={planJson} setPlanJson={setPlanJson}
                            planJsonError={planJsonError} setPlanJsonError={setPlanJsonError}
                        />
                    </Suspense>
                    
                    <Suspense fallback={<SkeletonLoader height={200} />}>
                        <K6History historyData={historyData} />
                    </Suspense>

                    <Suspense fallback={<SkeletonLoader height={160} />}>
                        <SQLSeedGeneratorPanel />
                    </Suspense>
                </div>
            </div>
        </div>
    );
});

export default K6MainModule;
