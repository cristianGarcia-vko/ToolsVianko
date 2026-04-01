import React from 'react';
import { motion } from 'framer-motion';
import { tokens } from '../../../../../SharedTool/style/tokens.shared.style';
import { CheckCircle, Clock, Zap, BarChart3, Download, X } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { reportStyles } from './SanityReportView.web.styles';

interface SanityReportViewProps {
    report: any;
    onClose: () => void;
}

/**
 * Pure View for SanityReportView.
 * No internal business logic, only declarative UI and event binding.
 * Complies with Vianko Architecture Contract (Zero Logic in View).
 */
export const SanityReportView: React.FC<SanityReportViewProps> = ({ report, onClose }) => {
    if (!report) return null;

    const handleExportJson = () => {
        try {
            const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const projectSafe = report.projectName ? String(report.projectName).replace(/\s+/g, '_').toLowerCase() : 'export';
            link.download = `k6-report.${projectSafe}.json`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            // ignore
        }
    };

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
                        <h2 style={reportStyles.reportMainTitle}>SENTINEL SANITY REPORT: {report.projectName}</h2>
                    </div>
                    <div style={reportStyles.headerActions}>
                        <button style={reportStyles.btnAlt} onClick={handleExportJson}><Download size={16} /> EXPORT JSON</button>
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

                    {Array.isArray(report.thresholds) && report.thresholds.length > 0 && (
                        <div style={reportStyles.tableSection}>
                            <h3 style={reportStyles.sectionTitle}>THRESHOLDS / UMBRALES</h3>
                            <div style={reportStyles.tableScroll}>
                                <table style={reportStyles.table}>
                                    <thead>
                                        <tr>
                                            <th style={reportStyles.th}>MÉTRICA</th>
                                            <th style={reportStyles.th}>REGLA</th>
                                            <th style={reportStyles.th}>ACTUAL</th>
                                            <th style={reportStyles.th}>STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.thresholds.map((t: any, i: number) => {
                                            const pass = t.pass;
                                            const color =
                                                pass === true
                                                    ? tokens.colors.accentSuccess
                                                    : pass === false
                                                        ? tokens.colors.accentError
                                                        : tokens.colors.accentOrange;
                                            return (
                                                <tr key={i}>
                                                    <td style={reportStyles.td}>{t.metric}</td>
                                                    <td style={reportStyles.td}>{t.expr}</td>
                                                    <td style={reportStyles.td}>
                                                        {t.actual == null ? 'N/A' : (typeof t.actual === 'number' ? t.actual.toFixed(4) : String(t.actual))}
                                                    </td>
                                                    <td style={reportStyles.td}>
                                                        <div style={reportStyles.statusBadge(color)}>
                                                            {pass === true ? 'PASS' : pass === false ? 'FAIL' : 'N/A'}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

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
