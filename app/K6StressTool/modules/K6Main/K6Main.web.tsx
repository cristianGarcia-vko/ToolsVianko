import React from 'react';
import { 
    Zap, Activity, Shield, AlertTriangle, Clock, 
    BarChart3, PieChart as PieChartIcon, Map, Search, Filter, 
    RefreshCw, Download, FileJson, Play, Settings2, Upload, X,
    Monitor, Layout, Database
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, PieChart, Cell
} from 'recharts';
import { tokens } from '../../../SharedTool/style/tokens.shared.style';
import { useK6MainLogic } from './K6Main.web.logics';
import { SanityReportView } from './SanityReportView.web';
import { k6Styles as styles } from './K6Main.web.styles';

const K6MainModule: React.FC = () => {
    const {
        currentReport, loading, historyData,
        handleAnalyze, handleRunSingle,
        host, setHost, vusSingle, setVusSingle,
        durationSingle, setDurationSingle,
        zipFile, handleZipUpload, authToken, setAuthToken,
        analysisResult, handleRunBatch
    } = useK6MainLogic();

    const [showReport, setShowReport] = React.useState(false);

    React.useEffect(() => {
        if (currentReport) setShowReport(true);
    }, [currentReport]);

    const stats = currentReport?.kpis || {
        totalRequests: 0,
        failedRequests: 0,
        healthScore: 0,
        avgLatency: 0,
        peakRps: 0
    };

    return (
        <div style={styles.container}>
            {showReport && currentReport && (
                <SanityReportView 
                    report={currentReport} 
                    onClose={() => setShowReport(false)} 
                />
            )}

            <div style={styles.kpiRow}>
                <KPICard title="TOTAL REQUESTS" value={stats.totalRequests.toLocaleString()} accent={tokens.colors.accentTeal} />
                <KPICard title="FAILED REQUESTS" value={stats.failedRequests.toLocaleString()} accent={tokens.colors.accentError} />
                <KPICard title="HEALTH SCORE" value={currentReport?.healthScore ? `${currentReport.healthScore}%` : "0%"} accent={tokens.colors.accentMint} />
                <KPICard title="AVG LATENCY" value={`${stats.avgLatency}ms`} accent={tokens.colors.accentPurple} />
            </div>

            <div style={styles.dashboardGrid}>
                <div style={styles.mainSection}>
                    <div style={styles.glassCard}>
                        <div style={styles.panelTitle}><Activity size={18} color={tokens.colors.accentMint}/> TELEMETRÍA DE RED EN VIVO</div>
                        <div style={styles.chartContainer}>
                             <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={currentReport?.endpointAnalysis || [
                                    { name: 'W1', latency: 400 }, { name: 'W2', latency: 300 },
                                    { name: 'W3', latency: 200 }, { name: 'W4', latency: 278 },
                                    { name: 'W5', latency: 189 }, { name: 'W6', latency: 239 }
                                ]}>
                                    <defs>
                                        <linearGradient id="colorLat" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={tokens.colors.accentMint} stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor={tokens.colors.accentMint} stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} hide />
                                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                                    <Tooltip contentStyle={{background: '#0d0d14', border: 'none'}} />
                                    <Area type="monotone" dataKey="latency" stroke={tokens.colors.accentMint} fillOpacity={1} fill="url(#colorLat)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div style={styles.glassCard}>
                        {analysisResult?.type === 'analysis' ? (
                            <>
                                <div style={styles.panelTitle}><Layout size={18} color={tokens.colors.accentTeal}/> ENDPOINTS DETECTADOS</div>
                                <div style={styles.terminal}>
                                    {analysisResult.endpoints.map((ep: any, i: number) => (
                                        <div key={i} style={{ color: tokens.colors.accentTeal, marginBottom: '4px' }}>
                                            [+] {ep.method} {ep.route} {ep.payload ? '(Body OK)' : ''}
                                        </div>
                                    ))}
                                </div>
                                <button onClick={handleRunBatch} disabled={loading} style={{...styles.button(tokens.colors.accentPurple), marginTop: '12px'}}>
                                    <Zap size={14}/> INICIAR BATERÍA COMPLETA
                                </button>
                            </>
                        ) : (
                            <>
                                <div style={styles.panelTitle}><Database size={18} color={tokens.colors.accentTeal}/> ENDPOINT AUDIT LOG</div>
                                <div style={styles.terminal}>
                                    {`[${new Date().toLocaleTimeString()}] INGESTION: Scanning endpoint /api/v1/sync...\n` +
                                     `[${new Date().toLocaleTimeString()}] ALERT: Latency spike detected in /orders (450ms)\n` +
                                     `[${new Date().toLocaleTimeString()}] SUCCESS: Database nodes synchronized at 12ms\n` +
                                     `[${new Date().toLocaleTimeString()}] INFO: Vianko Orchestrator ready.`}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div style={styles.sidebarSection}>
                    <div style={styles.glassCard}>
                        <div style={styles.panelTitle}><Zap size={18} color={tokens.colors.accentPurple}/> ORCHESTRATOR</div>
                        <div style={styles.formGroup}>
                            <div>
                                <span style={styles.fieldLabel}>HOST DESTINO</span>
                                <input value={host} onChange={e=>setHost(e.target.value)} placeholder="https://api.vianko.io" style={styles.input} />
                            </div>
                            
                            <div style={{ marginTop: '12px' }}>
                                <span style={styles.fieldLabel}>AUTO-DISCOVERY (ZIP)</span>
                                <input type="file" onChange={handleZipUpload} style={{ ...styles.input, fontSize: '10px' }} />
                                {zipFile && <div style={{ fontSize: '10px', color: tokens.colors.accentMint, marginTop: '4px' }}>Archivo: {zipFile.name}</div>}
                            </div>

                            <button onClick={handleAnalyze} disabled={loading} style={{ ...styles.button(tokens.colors.accentMint), marginTop: '16px' }}>
                                <Play size={14}/> {loading ? 'PROCESANDO...' : zipFile ? 'ANALIZAR PROYECTO' : 'INICIAR PRUEBA'}
                            </button>
                        </div>
                    </div>

                    <div style={{...styles.glassCard, flex: 1}}>
                         <div style={styles.panelTitle}><Clock size={18} opacity={0.4}/> HISTORIAL DE ESTRÉS</div>
                         <div style={styles.historyList}>
                            {historyData?.map((h, i) => (
                                <div key={i} style={styles.historyCard}>
                                    <div style={styles.historyName}>{h.projectName || h.url}</div>
                                    <div style={{ ...styles.historyScore, color: h.metrics?.http_req_failed?.values?.passes > 0 ? tokens.colors.accentError : tokens.colors.accentSuccess }}>
                                        {h.type === 'multi' ? `${h.endpointsCount} Endpoints` : 'Single Target'}
                                    </div>
                                </div>
                            ))}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const KPICard: React.FC<{ title: string, value: string, accent: string }> = ({ title, value, accent }) => (
    <div style={styles.kpiCard(accent)}>
        <div style={styles.kpiAccent(accent)} />
        <span style={styles.kpiTitle}>{title}</span>
        <span style={styles.kpiValue}>{value}</span>
    </div>
);

export default K6MainModule;
