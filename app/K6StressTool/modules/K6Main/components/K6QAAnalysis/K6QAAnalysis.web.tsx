import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Shield, Database } from 'lucide-react';
import { 
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';
import { tokens } from '../../../../../SharedTool/style/tokens.shared.style';
import { k6Styles as styles } from '../../K6Main.web.styles';

interface K6QAAnalysisProps {
    currentReport: any;
    analysisResult: any;
}

/**
 * Fragmented QA Analysis Component for K6Main.
 * Focuses on HTTP status codes and endpoint discovery/latencies.
 */
export const K6QAAnalysis: React.FC<K6QAAnalysisProps> = memo(({ currentReport, analysisResult }) => {
    return (
        <>
            <div style={styles.sectionHeader}><Shield size={12}/> PERFIL DE QA Y ANÁLISIS DE ERRORES</div>
            <div style={styles.errorAnalysisGrid}>
                <motion.div style={styles.glassCard}>
                    <div style={styles.chartTitle}>CÓDIGOS HTTP</div>
                    <div style={styles.httpCodesCard}>
                        <ResponsiveContainer width="100%" height={140} minWidth={0}>
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
                        <div style={styles.responsiveScrollContainer} className="no-scrollbar">
                        {analysisResult?.type === 'analysis' ? (
                            <div style={styles.terminal}>
                                {analysisResult.endpoints.map((ep: any, i: number) => (
                                    <div key={i} style={styles.endpointFoundRow}>
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
                                    ]).slice(0, 5).map((ep: any, i: number) => (
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
        </>
    );
});
