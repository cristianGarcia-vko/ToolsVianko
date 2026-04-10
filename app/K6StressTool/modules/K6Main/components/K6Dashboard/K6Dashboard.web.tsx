import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, Zap, Shield, Globe, Users } from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ComposedChart, LineChart, Line, Bar
} from 'recharts';
import { tokens } from '../../../../../SharedTool/style/tokens.shared.style';
import { dashboardStyles as styles } from './K6Dashboard.web.styles';
import { K6DashboardProps, TickerItemProps } from './K6Dashboard.types';
import { useK6DashboardLogic } from './K6Dashboard.logic';

/**
 * TickerItem: Subcomponente atómico para mostrar métricas clave.
 */
const TickerItem: React.FC<TickerItemProps> = memo(({ label, value, icon, color = 'white' }) => (
    <div style={styles.tickerItem}>
        <div style={styles.tickerLabelGroup}>
            {icon} {label}
        </div>
        <div style={styles.tickerValueGroup}>
            <span style={styles.tickerValue(color)}>{value}</span>
            <span style={styles.tickerTrend}>+0.5%</span>
        </div>
        <div style={styles.tickerSparkline}>
            <ResponsiveContainer width="100%" height={24} minWidth={0}>
                <LineChart data={[{v:1},{v:5},{v:3},{v:7},{v:4}]}>
                    <Line type="monotone" dataKey="v" stroke={color} dot={false} strokeWidth={1} animationDuration={500} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
));

/**
 * Fragmented Dashboard Component for K6Main.
 * Complies with Vianko Architecture Contract.
 */
export const K6Dashboard: React.FC<K6DashboardProps> = memo((props) => {
    const {
        healthScore,
        errorRate,
        peakRps,
        avgLatency,
        p95Latency,
        activeVus,
        timeSeriesData
    } = useK6DashboardLogic(props);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div style={styles.tooltipContainer}>
                    <p style={styles.tooltipLabel}>{`⏱️ T-Period: ${label}`}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} style={styles.tooltipItem}>
                            <span style={{ color: entry.color }}>{entry.name}:</span>
                            <span style={{ color: 'white' }}>{entry.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div style={styles.mainPanel}>
             {/* --- TOP TICKER (Resumen Ejecutivo) --- */}
             <div style={styles.tickerRow} className="no-scrollbar">
                <TickerItem label="HEALTH" value={`${healthScore}%`} icon={<Shield size={12}/>} color={tokens.colors.accentGreen} />
                <TickerItem label="ERR RATE" value={`${errorRate}%`} icon={<Activity size={12}/>} color={tokens.colors.accentError} />
                <TickerItem label="MAX RPS" value={peakRps} icon={<Zap size={12}/>} color={tokens.colors.accentTeal} />
                <TickerItem label="AVG LAT" value={`${avgLatency}ms`} icon={<Clock size={12}/>} color={tokens.colors.accentPurple} />
                <TickerItem label="p95 LAT" value={`${p95Latency}ms`} icon={<Activity size={12}/>} color={tokens.colors.accentBlue} />
                <TickerItem label="ACTIVE VUs" value={activeVus} icon={<Globe size={12}/>} color="#FFD700" />
            </div>

            {/* SECTION: PERFORMANCE & LATENCY */}
            <div style={styles.sectionHeader}><Activity size={12}/> PERFIL DE RENDIMIENTO Y LATENCIA</div>
            <div style={styles.dashboardLayout}>
                <motion.div style={styles.glassCard} whileHover={{ scale: 1.002 }}>
                    <div style={styles.chartTitle}><Clock size={14} color={tokens.colors.accentPurple}/> LATENCIA POR PERCENTIL (p90/p95/p99)</div>
                    <div style={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height={240} minWidth={0}>
                            <AreaChart data={timeSeriesData}>
                                <defs>
                                    <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={tokens.colors.accentPurple} stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor={tokens.colors.accentPurple} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis dataKey="time" hide />
                                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="p99" name="p99" stroke={tokens.colors.accentError} fill="transparent" strokeWidth={1} strokeDasharray="5 5" />
                                <Area type="monotone" dataKey="p95" name="p95" stroke={tokens.colors.accentBlue} fill="transparent" strokeWidth={2} />
                                <Area type="monotone" dataKey="latency" name="AVG" stroke={tokens.colors.accentPurple} fill="url(#latencyGrad)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div style={styles.glassCard} whileHover={{ scale: 1.002 }}>
                    <div style={styles.chartTitle}><Zap size={14} color={tokens.colors.accentTeal}/> INFRAESTRUCTURA: RPS vs NETWORK (I/O)</div>
                    <div style={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height={240} minWidth={0}>
                            <ComposedChart data={timeSeriesData}>
                                <defs>
                                    <linearGradient id="networkGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={tokens.colors.accentTeal} stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor={tokens.colors.accentTeal} stopOpacity={0.01}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" hide />
                                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} yAxisId="left" />
                                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} yAxisId="right" orientation="right" />
                                <Tooltip content={<CustomTooltip />} />
                                <Area yAxisId="right" type="monotone" dataKey="in" name="Recibido (KB)" fill="url(#networkGrad)" stroke={tokens.colors.accentTeal} strokeWidth={1} />
                                <Line yAxisId="left" type="monotone" dataKey="rps" name="RPS" stroke={tokens.colors.accentGreen} strokeWidth={3} dot={false} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* NEW CHART: VUS vs RPS (Throughput vs Concurrency) */}
                <motion.div style={{ ...styles.glassCard, gridColumn: '1 / -1' }} whileHover={{ scale: 1.002 }}>
                    <div style={styles.chartTitle}><Users size={14} color={tokens.colors.accentOrange}/> CONCURRENCIA: VUs vs THROUGHPUT (RPS)</div>
                    <div style={styles.chartContainer} style={{ height: '280px', minHeight: '280px' }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <ComposedChart data={timeSeriesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" fontSize={10} />
                                <YAxis yAxisId="left" stroke="rgba(255,255,255,0.2)" fontSize={10} label={{ value: 'RPS', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                                <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.2)" fontSize={10} label={{ value: 'VUs', angle: 90, position: 'insideRight', fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar yAxisId="right" dataKey="vus" name="Usuarios Virtuales" fill={tokens.colors.accentOrange} fillOpacity={0.2} radius={[4, 4, 0, 0]} />
                                <Line yAxisId="left" type="monotone" dataKey="rps" name="Peticiones/seg" stroke={tokens.colors.accentGreen} strokeWidth={3} dot={{ stroke: tokens.colors.accentGreen, strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
        </div>
    );
});
