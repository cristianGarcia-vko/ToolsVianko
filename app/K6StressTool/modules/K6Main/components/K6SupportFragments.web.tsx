import React, { memo } from 'react';
import { Shield, Database } from 'lucide-react';
import { tokens } from '../../../../SharedTool/style/tokens.shared.style';
import { k6Styles as styles } from '../K6Main.web.styles';

interface K6InsightsProps {
    stats: any;
}

/**
 * Fragmented Insights Component for K6Main.
 * IA driven decision logic presentation.
 */
export const K6Insights: React.FC<K6InsightsProps> = memo(({ stats }) => {
    return (
        <>
            <div style={styles.sectionHeader}><Shield size={12}/> DECISION INSIGHTS (IA DRIVEN)</div>
            <div style={styles.insightCard}>
                <div style={styles.insightHeader}>
                    <div style={styles.insightDot} />
                    <span style={styles.insightTitle}>ANÁLISIS DE UMBRALES: {stats.successRate > 99 ? 'ÓPTIMO' : 'ESTRUCTURAL'}</span>
                </div>
                <p style={styles.insightText}>
                    {stats.peakRps > 50 && (stats.p95Latency || 0) > 800 ? 
                        "🚨 El sistema ha llegado a su límite de concurrencia física. El RPS se estanca mientras los tiempos de respuesta se disparan. Decisión recomendada: Escalar horizontalmente añadiendo más nodos o revisar bloqueos en DB." :
                     stats.successRate < 95 ?
                        "⚠️ El aumento de errores 5xx sugiere fugas de memoria o timeouts de red. Decisión recomendada: Revisar logs de Garbage Collection y auditoría de RAM en el servidor." :
                        "✅ La infraestructura se mantiene estable bajo la carga actual. El ancho de banda consumido indica que la compresión GZIP es efectiva."
                    }
                </p>
            </div>
        </>
    );
});


interface K6HistoryProps {
    historyData: any[];
}

/**
 * Fragmented History Component for K6Main.
 */
export const K6History: React.FC<K6HistoryProps> = memo(({ historyData }) => {
    return (
        <div style={{ ...styles.glassCard, flex: 1, maxHeight: '200px' }}>
            <div style={styles.chartTitle}><Database size={14}/> HISTORIAL</div>
            <div style={styles.terminal} className="no-scrollbar">
                {historyData?.map((h, i) => (
                    <div key={i} style={styles.historyLineItem(h.metrics?.http_req_failed?.values?.passes > 0)}>
                        <div style={{ fontSize: '9px', opacity: 0.4 }}>{new Date(h.timestamp).toLocaleTimeString()}</div>
                        <div style={{ fontWeight: 900, fontSize: '10px' }}>{h.projectName || h.url}</div>
                    </div>
                )).slice(0, 5)}
            </div>
        </div>
    );
});
