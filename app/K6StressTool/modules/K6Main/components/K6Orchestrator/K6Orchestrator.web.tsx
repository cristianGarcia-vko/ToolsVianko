import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Zap, RefreshCw } from 'lucide-react';
import { tokens } from '../../../../../SharedTool/style/tokens.shared.style';
import { k6Styles as styles } from '../../K6Main.web.styles';

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
    zipFile: any;
    handleZipUpload: (e: any) => void;
    handleAnalyze: () => void;
    analysisResult: any;
    handleApplyZipEndpointsToPlan: () => void;
    planPreset: string;
    handleLoadPreset: (p: any) => void;
    planJson: string;
    setPlanJson: (v: string) => void;
    planJsonError: any;
    setPlanJsonError: (v: any) => void;
}

/**
 * Fragmented Orchestrator Sidebar Component for K6Main.
 * Focuses on execution configuration, zip auto-discovery, and k6 plan editing.
 */
export const K6Orchestrator: React.FC<K6OrchestratorProps> = memo(({
    loading, protocol, setProtocol, host, setHost, setBaseUrlOnPlanJson,
    port, setPort, route, setRoute, authToken, setAuthToken,
    vusSingle, setVusSingle, durationSingle, setDurationSingle,
    handleCancel, handleRunPlan, handleRunSingle, statusMessage,
    zipFile, handleZipUpload, handleAnalyze, analysisResult,
    handleApplyZipEndpointsToPlan, planPreset, handleLoadPreset,
    planJson, setPlanJson, planJsonError, setPlanJsonError
}) => {
    return (
        <div style={styles.orchestratorBox}>
            <div style={styles.chartTitle}><Zap size={14} color={tokens.colors.accentPurple}/> ORCHESTRATOR</div>
            <div style={styles.orchestratorStack}>
                <div style={styles.orchestratorFormRow(loading)}>
                    <div>
                        <span style={styles.inputLabel}>PROTO</span>
                        <select disabled={loading} style={styles.input} value={protocol} onChange={e => setProtocol(e.target.value)}>
                            <option value="http://">HTTP</option>
                            <option value="https://">HTTPS</option>
                        </select>
                    </div>
                    <div>
                        <span style={styles.inputLabel}>HOST</span>
                        <input disabled={loading} style={styles.input} value={host} onChange={e => { setHost(e.target.value); setBaseUrlOnPlanJson(e.target.value); }} placeholder="localhost" />
                    </div>
                    <div>
                        <span style={styles.inputLabel}>PORT</span>
                        <input disabled={loading} style={styles.input} value={port} onChange={e => setPort(e.target.value)} placeholder="3000" />
                    </div>
                </div>

                <div style={styles.inputSectionOpacity(loading)}>
                    <span style={styles.inputLabel}>SINGLE ROUTE (Optional)</span>
                    <input disabled={loading} style={styles.input} value={route} onChange={e => setRoute(e.target.value)} placeholder="/api/ping" />
                </div>

                <div style={styles.inputSectionOpacity(loading)}>
                    <span style={styles.inputLabel}>BEARER TOKEN (Auth)</span>
                    <input disabled={loading} style={styles.input} value={authToken} onChange={e => setAuthToken(e.target.value)} placeholder="eyJhbGci..." />
                </div>

                <div style={styles.vusDurationGrid}>
                    <div>
                        <span style={styles.inputLabel}>USUARIOS</span>
                        <input style={styles.input} type="number" value={vusSingle} onChange={e => setVusSingle(Number(e.target.value))} />
                    </div>
                    <div>
                        <span style={styles.inputLabel}>DURACIÓN (s)</span>
                        <input style={styles.input} type="number" value={durationSingle} onChange={e => setDurationSingle(Number(e.target.value))} />
                    </div>
                </div>

                <div style={styles.actionButtonRow}>
                    <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={loading ? handleCancel : handleRunPlan}
                        style={{ ...styles.button(loading ? tokens.colors.accentError : tokens.colors.accentGreen), flex: 1.5, fontSize: '10px' }}
                    >
                        {loading ? <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><RefreshCw className="spin" size={12}/> CANCELAR</div> : 'ENVIAR PLAN'}
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
                    <div style={styles.statusMessageBanner}>
                        {statusMessage}
                    </div>
                )}

                <div style={styles.zipDiscoveryBox}>
                    <span style={{ ...styles.inputLabel, display: 'block', marginBottom: '8px' }}>MÓDULO AUTO-DISCOVERY (ZIP)</span>
                    <input 
                        type="file" 
                        onChange={handleZipUpload} 
                        style={{ ...styles.input, fontSize: '10px', padding: '6px' }} 
                        accept=".zip"
                    />
                    {zipFile && (
                        <div style={styles.zipDiscoveryLabel}>
                            📦 {zipFile.name}
                        </div>
                    )}
                    <div style={styles.zipActionRow}>
                        <motion.button 
                            whileTap={{ scale: 0.95 }}
                            onClick={handleAnalyze}
                            disabled={loading || !zipFile}
                            style={{ ...styles.button(tokens.colors.accentTeal), flex: 1, height: '32px', fontSize: '10px' }}
                        >
                            ANALIZAR
                        </motion.button>
                        {analysisResult?.type === 'analysis' && (
                            <motion.button 
                                whileTap={{ scale: 0.95 }}
                                onClick={handleApplyZipEndpointsToPlan}
                                style={{ ...styles.button(tokens.colors.accentPurple), flex: 1, height: '32px', fontSize: '10px' }}
                            >
                                USAR ZIP
                            </motion.button>
                        )}
                    </div>
                </div>
                
                <div style={styles.planConfigBox}>
                    <div style={styles.planConfigHeader}>
                        <span style={styles.inputLabel}>PLAN CONFIG (JSON)</span>
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
                </div>
            </div>
        </div>
    );
});
