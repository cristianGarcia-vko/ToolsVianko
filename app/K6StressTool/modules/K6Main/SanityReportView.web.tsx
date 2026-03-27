import React from 'react';
import { motion } from 'framer-motion';
import { tokens } from '../../../SharedTool/style/tokens.shared.style';
import { CheckCircle, Clock, Zap, BarChart3, Download, X } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { reportStyles } from './SanityReportView.web.styles';

interface SanityReportViewProps {
    report: any;
    onClose: () => void;
}

export const SanityReportView: React.FC<SanityReportViewProps> = ({ report, onClose }) => {
    if (!report) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={reportStyles.overlay}
        >
            <div style={reportStyles.container}>
                <header style={reportStyles.header}>
                    <div style={reportStyles.headerTitleRow}>
                        <div style={reportStyles.badge(report.healthScore > 80 ? tokens.colors.accentSuccess : tokens.colors.accentOrange)}>
                            {report.healthScore}% HEALTH
                        </div>
                        <h2 style={{ fontSize: '18px', fontWeight: 900 }}>SENTINEL SANITY REPORT: {report.projectName}</h2>
                    </div>
                    <div style={reportStyles.headerActions}>
                        <button style={reportStyles.btnAlt}><Download size={16} /> EXPORT PDF</button>
                        <button onClick={onClose} style={reportStyles.closeBtn}><X size={20} /></button>
                    </div>
                </header>

                <div style={reportStyles.contentGrid}>
                    <div style={reportStyles.kpiRow}>
                        <KpiCard label="SUCCESS RATE" value={`${report.kpis.successRate}%`} icon={<CheckCircle size={20} color={tokens.colors.accentSuccess} />} color={tokens.colors.accentSuccess} />
                        <KpiCard label="AVG LATENCY" value={`${report.kpis.avgLatency}ms`} icon={<Clock size={20} color={tokens.colors.accentPurple} />} color={tokens.colors.accentPurple} />
                        <KpiCard label="TOTAL REQUESTS" value={report.kpis.totalRequests.toLocaleString()} icon={<Zap size={20} color={tokens.colors.accentOrange} />} color={tokens.colors.accentOrange} />
                        <KpiCard label="PEAK THROUGHPUT" value={`${report.kpis.peakRps} rps`} icon={<BarChart3 size={20} color="#3b82f6" />} color="#3b82f6" />
                    </div>

                    <div style={reportStyles.chartSection}>
                        <h3 style={reportStyles.sectionTitle}>LOAD TREND ANALYSIS</h3>
                        <div style={reportStyles.chartBox}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={report.endpointAnalysis}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="name" hide />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)' }} />
                                    <Area type="monotone" dataKey="latency" stroke={tokens.colors.accentPurple} fill={tokens.colors.accentPurple + '22'} strokeWidth={3} />
                                    <Area type="monotone" dataKey="requests" stroke={tokens.colors.accentSuccess} fill={tokens.colors.accentSuccess + '22'} strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div style={reportStyles.tableSection}>
                        <h3 style={reportStyles.sectionTitle}>DETAILED ENDPOINT INVESTIGATION</h3>
                        <div style={reportStyles.tableScroll}>
                            <table style={reportStyles.table}>
                                <thead>
                                    <tr>
                                        <th style={reportStyles.th}>ENDPOINT / METHOD</th>
                                        <th style={reportStyles.th}>LATENCY (P95)</th>
                                        <th style={reportStyles.th}>SUCCESS RATE</th>
                                        <th style={reportStyles.th}>STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.endpointAnalysis.map((ep: any, i: number) => (
                                        <tr key={i}>
                                            <td style={reportStyles.td}>
                                                <div style={reportStyles.epMain}>{ep.name}</div>
                                                <div style={reportStyles.epSub}>{ep.path}</div>
                                            </td>
                                            <td style={reportStyles.td}>{ep.latency}ms</td>
                                            <td style={reportStyles.td}>{ep.success}%</td>
                                            <td style={reportStyles.td}>
                                                <div style={reportStyles.statusBadge(ep.success > 95 ? tokens.colors.accentSuccess : tokens.colors.accentError)}>
                                                    {ep.success > 95 ? 'OPTIMAL' : 'DEGRADED'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const KpiCard: React.FC<{ label: string, value: string, icon: any, color: string }> = ({ label, value, icon, color }) => (
    <div style={reportStyles.kpiCard(color)}>
        <div style={reportStyles.kpiHeader}>
            <span style={reportStyles.kpiLabel}>{label}</span>
            {icon}
        </div>
        <div style={reportStyles.kpiMain}>{value}</div>
    </div>
);
