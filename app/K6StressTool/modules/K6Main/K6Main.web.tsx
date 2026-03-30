import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { 
    Zap, Activity, Clock, Play, Layout, Database, 
    ArrowUpRight, ArrowDownRight, Globe, Shield, RefreshCw
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
    ComposedChart, Legend, ReferenceLine
} from 'recharts';
import { tokens } from '../../../SharedTool/style/tokens.shared.style';
import { useK6MainLogic } from './K6Main.web.logics';
import { SanityReportView } from './SanityReportView.web';
import { k6Styles as styles } from './K6Main.web.styles';

const K6MainModule: React.FC = memo(() => {
    const {
        currentReport, loading, historyData,
        handleAnalyze, handleRunSingle,
        host, setHost, vusSingle, setVusSingle,
        protocol, setProtocol, port, setPort, route, setRoute,
        durationSingle, setDurationSingle,
        zipFile, handleZipUpload, authToken, setAuthToken,
        analysisResult, handleRunBatch,
        planPreset, planJson, planJsonError, setPlanJson, setPlanJsonError,
        handleLoadPreset, handleApplyZipEndpointsToPlan, handleRunPlan, setBaseUrlOnPlanJson,
        statusMessage, handleCancel
    } = useK6MainLogic();

    const [showReport, setShowReport] = React.useState(false);

    React.useEffect(() => {
        if (currentReport) setShowReport(true);
    }, [currentReport]);

    const stats = React.useMemo(() => currentReport?.kpis || {
        totalRequests: 0,
        failedRequests: 0,
        healthScore: 0,
        avgLatency: 0,
        p95Latency: 0,
        successRate: 0,
        peakRps: 0,
        ttfb: 0,
        activeVus: 0,
        dataSentKB: 0,
        dataReceivedKB: 0
    }, [currentReport]);

    const healthData = [
        { name: 'Healthy', value: currentReport?.healthScore || 0 },
        { name: 'Failed', value: 100 - (currentReport?.healthScore || 0) }
    ];

    const COLORS = [tokens.colors.accentGreen, 'rgba(255,255,255,0.05)'];

    return (
        <div style={styles.container}>
            {showReport && currentReport && (
                <SanityReportView 
                    report={currentReport} 
                    onClose={() => setShowReport(false)} 
                />
            )}

            {/* --- 1. TOP TICKER (Resumen Ejecutivo) --- */}
            <div style={styles.tickerRow} className="no-scrollbar">
                <TickerItem label="HEALTH" value={`${currentReport?.healthScore || 0}%`} icon={<Shield size={12}/>} color={tokens.colors.accentGreen} />
                <TickerItem label="ERR RATE" value={`${(100 - (stats.successRate || 100)).toFixed(1)}%`} icon={<Activity size={12}/>} color={tokens.colors.accentError} />
                <TickerItem label="MAX RPS" value={stats.peakRps || 0} icon={<Zap size={12}/>} color={tokens.colors.accentTeal} />
                <TickerItem label="AVG LAT" value={`${stats.avgLatency || 0}ms`} icon={<Clock size={12}/>} color={tokens.colors.accentPurple} />
                <TickerItem label="p95 LAT" value={`${stats.p95Latency || 0}ms`} icon={<Activity size={12}/>} color={tokens.colors.accentBlue} />
                <TickerItem label="ACTIVE VUs" value={stats.activeVus || 0} icon={<Globe size={12}/>} color="#FFD700" />
            </div>

            <div style={styles.dashboardGrid}>
                {/* --- 2. MAIN PANEL (Secciones Lógicas) --- */}
                <div style={styles.mainPanel}>
                    {/* SECTION: PERFORMANCE & LATENCY */}
                    <div style={styles.sectionHeader}><Activity size={12}/> PERFIL DE RENDIMIENTO Y LATENCIA</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <motion.div style={styles.glassCard} whileHover={{ scale: 1.002 }}>
                            <div style={styles.chartTitle}><Clock size={14} color={tokens.colors.accentPurple}/> LATENCIA POR PERCENTIL (p90/p95/p99)</div>
                            <div style={styles.chartContainer}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={currentReport?.timeSeries || [
                                        { time: 'T1', latency: 400, p95: 600, p99: 1200 },
                                        { time: 'T2', latency: 600, p95: 900, p99: 1800 },
                                        { time: 'T3', latency: 450, p95: 750, p99: 1500 },
                                    ]}>
                                        <defs>
                                            <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={tokens.colors.accentPurple} stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor={tokens.colors.accentPurple} stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                        <XAxis dataKey="time" hide />
                                        <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} />
                                        <Tooltip 
                                            contentStyle={{ background: '#0b0d13', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                        />
                                        <Area type="monotone" dataKey="p99" name="p99" stroke={tokens.colors.accentError} fill="transparent" strokeWidth={1} strokeDasharray="5 5" />
                                        <Area type="monotone" dataKey="p95" name="p95" stroke={tokens.colors.accentBlue} fill="transparent" strokeWidth={2} />
                                        <Area type="monotone" dataKey="latency" name="AVG" stroke={tokens.colors.accentPurple} fill="url(#latencyGrad)" strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        <motion.div style={styles.glassCard} whileHover={{ scale: 1.002 }}>
                            <div style={styles.chartTitle}><Zap size={14} color={tokens.colors.accentTeal}/> INFRAESTRUCTURA: RPS vs NETWORK</div>
                            <div style={styles.chartContainer}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={currentReport?.timeSeries || [
                                        { time: 'T1', rps: 10, in: 100 }, { time: 'T2', rps: 30, in: 300 }, { time: 'T3', rps: 50, in: 500 }
                                    ]}>
                                        <XAxis dataKey="time" hide />
                                        <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="in" name="Recibido (KB)" fill={tokens.colors.accentTeal} fillOpacity={0.05} stroke={tokens.colors.accentTeal} />
                                        <Line type="monotone" dataKey="rps" name="RPS" stroke={tokens.colors.accentGreen} strokeWidth={2} dot={false} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    </div>

                    {/* SECTION: ERROR ANALYSIS (QA) */}
                    <div style={styles.sectionHeader}><Shield size={12}/> PERFIL DE QA Y ANÁLISIS DE ERRORES</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 300px) 1fr', gap: '12px' }}>
                        <motion.div style={styles.glassCard}>
                            <div style={styles.chartTitle}>CÓDIGOS HTTP</div>
                            <div style={{ ...styles.chartContainer, height: '140px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={
                                                currentReport?.statusCodes 
                                                ? Object.entries(currentReport.statusCodes).map(([k, v]) => ({ name: k, value: v }))
                                                : [{ name: '200', value: 100 }, { name: '500', value: 0 }]
                                            }
                                            innerRadius={35}
                                            outerRadius={55}
                                            dataKey="value"
                                        >
                                            {Object.keys(currentReport?.statusCodes || { '200': 1, '500': 0 }).map((entry: any, index: number) => (
                                                <Cell key={index} fill={entry.startsWith('2') ? tokens.colors.accentGreen : entry.startsWith('5') ? tokens.colors.accentError : tokens.colors.accentTeal} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        <motion.div style={{ ...styles.glassCard, flex: 1 }}>
                             <div style={styles.chartTitle}><Database size={14}/> {analysisResult?.type === 'analysis' ? 'ENDPOINTS DETECTADOS (AUTO-DISCOVERY)' : 'DETALLE DE ENDPOINTS'}</div>
                             <div style={{ maxHeight: '200px', overflowY: 'auto' }} className="no-scrollbar">
                                {analysisResult?.type === 'analysis' ? (
                                    <div style={styles.terminal}>
                                        {analysisResult.endpoints.map((ep: any, i: number) => (
                                            <div key={i} style={{ color: tokens.colors.accentTeal, marginBottom: '4px', fontSize: '10px' }}>
                                                <span style={{ fontWeight: 900 }}>[+] FOUND:</span> {ep.method} {ep.route}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <table style={styles.table}>
                                        <thead>
                                            <tr>
                                                <th style={styles.th}>METODO / RUTA</th>
                                                <th style={styles.th}>LATENCIA p95</th>
                                                <th style={styles.th}>ESTADO</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(currentReport?.endpointAnalysis || [
                                                { name: 'API', path: '/v1/users', latency: 120, status: 'Stable' },
                                                { name: 'API', path: '/v1/orders', latency: 850, status: 'Stressed' },
                                            ]).slice(0, 5).map((ep, i) => (
                                                <tr key={i}>
                                                    <td style={styles.td}><span style={{ color: tokens.colors.accentTeal, fontWeight: 900 }}>{ep.name}:</span> {ep.path}</td>
                                                    <td style={styles.td}><span style={{ color: (ep.latency || 0) > 500 ? tokens.colors.accentError : tokens.colors.accentGreen }}>{ep.latency}ms</span></td>
                                                    <td style={styles.td}>
                                                        <div style={styles.statusBadge((ep.status || 'Stable') === 'Stable' ? tokens.colors.accentGreen : tokens.colors.accentError)}>
                                                            {ep.status}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                             </div>
                        </motion.div>
                    </div>

                    {/* DECISION INSIGHTS PANEL */}
                    <div style={styles.sectionHeader}><Shield size={12}/> DECISION INSIGHTS (IA DRIVEN)</div>
                    <div style={styles.insightCard}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ background: '#FFD700', borderRadius: '50%', width: '8px', height: '8px' }} />
                            <span style={{ fontSize: '12px', fontWeight: 900, color: '#FFD700' }}>ANÁLISIS DE UMBRALES: {stats.successRate > 99 ? 'ÓPTIMO' : 'ESTRUCTURAL'}</span>
                        </div>
                        <p style={{ fontSize: '11px', lineHeight: '1.6', opacity: 0.8, color: 'white' }}>
                            {stats.peakRps > 50 && (stats.p95Latency || 0) > 800 ? 
                                "🚨 El sistema ha llegado a su límite de concurrencia física. El RPS se estanca mientras los tiempos de respuesta se disparan. Decisión recomendada: Escalar horizontalmente añadiendo más nodos o revisar bloqueos en DB." :
                             stats.successRate < 95 ?
                                "⚠️ El aumento de errores 5xx sugiere fugas de memoria o timeouts de red. Decisión recomendada: Revisar logs de Garbage Collection y auditoría de RAM en el servidor." :
                                "✅ La infraestructura se mantiene estable bajo la carga actual. El ancho de banda consumido indica que la compresión GZIP es efectiva."
                            }
                        </p>
                    </div>
                </div>

                {/* --- 3. SIDE PANEL --- */}
                <div style={styles.sidePanel}>
                    <div style={styles.orchestratorBox}>
                        <div style={styles.chartTitle}><Zap size={14} color={tokens.colors.accentPurple}/> ORCHESTRATOR</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 60px', gap: '8px', opacity: loading ? 0.5 : 1 }}>
                                <div>
                                    <span style={{ fontSize: '9px', opacity: 0.4, fontWeight: 900 }}>PROTO</span>
                                    <select disabled={loading} style={styles.input} value={protocol} onChange={e => setProtocol(e.target.value)}>
                                        <option value="http://">HTTP</option>
                                        <option value="https://">HTTPS</option>
                                    </select>
                                </div>
                                <div>
                                    <span style={{ fontSize: '9px', opacity: 0.4, fontWeight: 900 }}>HOST</span>
                                    <input disabled={loading} style={styles.input} value={host} onChange={e => { setHost(e.target.value); setBaseUrlOnPlanJson(e.target.value); }} placeholder="localhost" />
                                </div>
                                <div>
                                    <span style={{ fontSize: '9px', opacity: 0.4, fontWeight: 900 }}>PORT</span>
                                    <input disabled={loading} style={styles.input} value={port} onChange={e => setPort(e.target.value)} placeholder="3000" />
                                </div>
                            </div>

                            <div style={{ opacity: loading ? 0.5 : 1 }}>
                                <span style={{ fontSize: '9px', opacity: 0.4, fontWeight: 900 }}>SINGLE ROUTE (Optional)</span>
                                <input disabled={loading} style={styles.input} value={route} onChange={e => setRoute(e.target.value)} placeholder="/api/ping" />
                            </div>

                            <div style={{ opacity: loading ? 0.5 : 1 }}>
                                <span style={{ fontSize: '9px', opacity: 0.4, fontWeight: 900 }}>BEARER TOKEN (Auth)</span>
                                <input disabled={loading} style={styles.input} value={authToken} onChange={e => setAuthToken(e.target.value)} placeholder="eyJhbGci..." />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(60px, 1fr) minmax(60px, 1fr)', gap: '10px' }}>
                                <div>
                                    <span style={{ fontSize: '9px', opacity: 0.4, fontWeight: 900 }}>USUARIOS</span>
                                    <input style={styles.input} type="number" value={vusSingle} onChange={e => setVusSingle(Number(e.target.value))} />
                                </div>
                                <div>
                                    <span style={{ fontSize: '9px', opacity: 0.4, fontWeight: 900 }}>DURACIÓN (s)</span>
                                    <input style={styles.input} type="number" value={durationSingle} onChange={e => setDurationSingle(Number(e.target.value))} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
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
                                <div style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '10px', color: tokens.colors.accentTeal, textAlign: 'center', fontWeight: 900 }}>
                                    {statusMessage}
                                </div>
                            )}

                            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginTop: '8px' }}>
                                <span style={{ fontSize: '9px', opacity: 0.4, fontWeight: 900, display: 'block', marginBottom: '8px' }}>MÓDULO AUTO-DISCOVERY (ZIP)</span>
                                <input 
                                    type="file" 
                                    onChange={handleZipUpload} 
                                    style={{ ...styles.input, fontSize: '10px', padding: '6px' }} 
                                    accept=".zip"
                                />
                                {zipFile && (
                                    <div style={{ fontSize: '10px', color: tokens.colors.accentGreen, margin: '6px 0', fontWeight: 900 }}>
                                        📦 {zipFile.name}
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
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
                            
                            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginTop: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '9px', opacity: 0.4, fontWeight: 900 }}>PLAN CONFIG (JSON)</span>
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
                                    style={{
                                        ...styles.input,
                                        minHeight: '120px',
                                        fontFamily: "'JetBrains Mono', monospace",
                                        fontSize: '10px',
                                        resize: 'vertical',
                                        background: 'rgba(0,0,0,0.2)',
                                        opacity: loading ? 0.5 : 1
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ ...styles.glassCard, flex: 1, maxHeight: '200px' }}>
                        <div style={styles.chartTitle}><Database size={14}/> HISTORIAL</div>
                        <div style={styles.terminal} className="no-scrollbar">
                            {historyData?.map((h, i) => (
                                <div key={i} style={{ marginBottom: '8px', borderLeft: `2px solid ${h.metrics?.http_req_failed?.values?.passes > 0 ? tokens.colors.accentError : tokens.colors.accentGreen}`, paddingLeft: '8px' }}>
                                    <div style={{ fontSize: '9px', opacity: 0.4 }}>{new Date(h.timestamp).toLocaleTimeString()}</div>
                                    <div style={{ fontWeight: 900, fontSize: '10px' }}>{h.projectName || h.url}</div>
                                </div>
                            )).slice(0, 5)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

const TickerItem: React.FC<{ label: string, value: any, icon: React.ReactNode, color?: string }> = ({ label, value, icon, color = 'white' }) => (
    <div style={styles.tickerItem}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '9px', fontWeight: 900, opacity: 0.4 }}>
            {icon} {label}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '18px', fontWeight: 900, color }}>{value}</span>
            <span style={{ fontSize: '9px', color: tokens.colors.accentGreen, fontWeight: 900 }}>+0.5%</span>
        </div>
        <div style={{ height: '24px', width: '100%', opacity: 0.3 }}>
            {/* Sparkline placeholder */}
            <ResponsiveContainer width="99%" height="100%">
                <LineChart data={[{v:1},{v:5},{v:3},{v:7},{v:4}]}>
                    <Line type="monotone" dataKey="v" stroke={color} dot={false} strokeWidth={1} animationDuration={500} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
);

export default K6MainModule;

