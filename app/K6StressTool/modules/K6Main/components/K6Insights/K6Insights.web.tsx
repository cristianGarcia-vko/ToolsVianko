import React, { memo } from 'react';
import { Shield } from 'lucide-react';
import { insightsStyles as styles } from './K6Insights.web.styles';
import { K6InsightsProps } from './K6Insights.types';
import { useK6InsightsLogic } from './K6Insights.logic';

/**
 * Fragmented Insights Component for K6Main.
 * IA driven decision logic presentation.
 */
export const K6Insights: React.FC<K6InsightsProps> = memo((props) => {
    const { isOptimal, insightMessage } = useK6InsightsLogic(props);

    return (
        <>
            <div style={styles.sectionHeader}><Shield size={12}/> DECISION INSIGHTS (IA DRIVEN)</div>
            <div style={styles.insightCard}>
                <div style={styles.insightHeader}>
                    <div style={styles.insightDot} />
                    <span style={styles.insightTitle}>ANÁLISIS DE UMBRALES: {isOptimal ? 'ÓPTIMO' : 'ESTRUCTURAL'}</span>
                </div>
                <p style={styles.insightText}>
                    {insightMessage}
                </p>
            </div>
        </>
    );
});
