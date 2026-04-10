import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Shield, Database, Activity } from 'lucide-react';
import { 
    PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { tokens } from '../../../../../SharedTool/style/tokens.shared.style';
import { qaAnalysisStyles as styles } from './K6QAAnalysis.web.styles';
import { K6QAAnalysisProps } from './K6QAAnalysis.types';
import { useK6QAAnalysisLogic } from './K6QAAnalysis.logic';

/**
 * Fragmented QA Analysis Component for K6Main.
 * Focuses on HTTP status codes and endpoint discovery/latencies.
 */
export const K6QAAnalysis: React.FC<K6QAAnalysisProps> = memo((props) => {
    const {
        isDiscovery,
        discoveredEndpoints,
        pieData,
        getPieColor,
        endpointBarData
    } = useK6QAAnalysisLogic(props);

    const CustomPieTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div style={styles.tooltipContainer}>
                    <p style={styles.tooltipLabel}>HTTP {payload[0].name}</p>
                    <p style={styles.tooltipValue}>{payload[0].value} requests</p>
                </div>
            );
        }
        return null;
    };

    const CustomBarTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div style={styles.tooltipContainer}>
                    <p style={styles.tooltipLabel}>{label}</p>
                    <p style={{...styles.tooltipValue, color: payload[0].value > 500 ? tokens.colors.accentError : tokens.colors.accentGreen}}>
                        Latency p95: {payload[0].value}ms
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <>
            <div style={styles.sectionHeader}><Shield size={12}/> PERFIL DE QA Y ANÁLISIS DE ERRORES</div>
            <div style={styles.errorAnalysisGrid}>
                <motion.div style={styles.glassCard} whileHover={{ scale: 1.002 }}>
                    <div style={styles.chartTitle}>CÓDIGOS HTTP</div>
                    <div style={styles.httpCodesCard}>
                        <ResponsiveContainer width="100%" height={140} minWidth={0}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    innerRadius={35}
                                    outerRadius={55}
                                    dataKey="value"
                                >
                                    {pieData.map((entry: any, index: number) => (
                                        <Cell key={index} fill={getPieColor(entry.name)} />
                                    ))}
                                </Pie>
                                <RechartsTooltip content={<CustomPieTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div style={{ ...styles.glassCard, flex: 1 }} whileHover={{ scale: 1.002 }}>
                        <div style={styles.chartTitle}><Database size={14}/> {isDiscovery ? 'ENDPOINTS DETECTADOS (AUTO-DISCOVERY)' : 'LATENCIA POR ENDPOINT (p95)'}</div>
                        <div style={styles.responsiveScrollContainer} className="no-scrollbar">
                        {isDiscovery ? (
                            <div style={styles.terminal}>
                                {discoveredEndpoints.map((ep: any, i: number) => (
                                    <div key={i} style={styles.endpointFoundRow}>
                                        <span style={{ fontWeight: 900 }}>[+] FOUND:</span> {ep.method} {ep.route}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={140} minWidth={0}>
                                <BarChart data={endpointBarData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.03)" />
                                    <XAxis type="number" stroke="rgba(255,255,255,0.2)" fontSize={9} />
                                    <YAxis type="category" dataKey="path" stroke="rgba(255,255,255,0.4)" fontSize={9} width={80} />
                                    <RechartsTooltip content={<CustomBarTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                                    <Bar dataKey="latency" name="p95 Latency" radius={[0, 4, 4, 0]}>
                                        {endpointBarData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.latency > 500 ? tokens.colors.accentError : tokens.colors.accentTeal} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                        </div>
                </motion.div>
            </div>
        </>
    );
});
