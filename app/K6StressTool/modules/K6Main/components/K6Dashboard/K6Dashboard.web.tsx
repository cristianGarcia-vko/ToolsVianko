import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, Zap, Shield, Globe } from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ComposedChart, LineChart, Line
} from 'recharts';
import { tokens } from '../../../../../SharedTool/style/tokens.shared.style';
import { k6Styles as styles } from '../../K6Main.web.styles';

interface K6DashboardProps {
    currentReport: any;
    stats: any;
}

/**
 * Fragmented Dashboard Component for K6Main.
 * Focuses on performance, latency, and real-time RPS metrics.
 */
export const K6Dashboard: React.FC<K6DashboardProps> = memo(({ currentReport, stats }) => {
    return (
        <div style={styles.mainPanel}>
             {/* --- TOP TICKER (Resumen Ejecutivo) --- */}
             <div style={styles.tickerRow} className="no-scrollbar">
                <TickerItem label="HEALTH" value={`${currentReport?.healthScore || 0}%`} icon={<Shield size={12}/>} color={tokens.colors.accentGreen} />
                <TickerItem label="ERR RATE" value={`${(100 - (stats.successRate || 100)).toFixed(1)}%`} icon={<Activity size={12}/>} color={tokens.colors.accentError} />
                <TickerItem label="MAX RPS" value={stats.peakRps || 0} icon={<Zap size={12}/>} color={tokens.colors.accentTeal} />
                <TickerItem label="AVG LAT" value={`${stats.avgLatency || 0}ms`} icon={<Clock size={12}/>} color={tokens.colors.accentPurple} />
                <TickerItem label="p95 LAT" value={`${stats.p95Latency || 0}ms`} icon={<Activity size={12}/>} color={tokens.colors.accentBlue} />
                <TickerItem label="ACTIVE VUs" value={stats.activeVus || 0} icon={<Globe size={12}/>} color="#FFD700" />
            </div>

            {/* SECTION: PERFORMANCE & LATENCY */}
            <div style={styles.sectionHeader}><Activity size={12}/> PERFIL DE RENDIMIENTO Y LATENCIA</div>
            <div style={styles.dashboardLayout}>
                <motion.div style={styles.glassCard} whileHover={{ scale: 1.002 }}>
                    <div style={styles.chartTitle}><Clock size={14} color={tokens.colors.accentPurple}/> LATENCIA POR PERCENTIL (p90/p95/p99)</div>
                    <div style={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height={240} minWidth={0}>
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
                        <ResponsiveContainer width="100%" height={240} minWidth={0}>
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
        </div>
    );
});

const TickerItem: React.FC<{ label: string, value: any, icon: React.ReactNode, color?: string }> = ({ label, value, icon, color = 'white' }) => (
    <div style={styles.tickerItem}>
        <div style={styles.tickerLabelGroup}>
            {icon} {label}
        </div>
        <div style={styles.tickerValueGroup}>
            <span style={{ fontSize: '18px', fontWeight: 900, color }}>{value}</span>
            <span style={{ fontSize: '9px', color: tokens.colors.accentGreen, fontWeight: 900 }}>+0.5%</span>
        </div>
        <div style={styles.tickerSparkline}>
            <ResponsiveContainer width="100%" height={24} minWidth={0}>
                <LineChart data={[{v:1},{v:5},{v:3},{v:7},{v:4}]}>
                    <Line type="monotone" dataKey="v" stroke={color} dot={false} strokeWidth={1} animationDuration={500} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
);
