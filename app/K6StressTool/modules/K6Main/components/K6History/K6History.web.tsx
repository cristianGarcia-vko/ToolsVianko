import React, { memo } from 'react';
import { Database } from 'lucide-react';
import { historyStyles as styles } from './K6History.web.styles';
import { K6HistoryProps } from './K6History.types';
import { useK6HistoryLogic } from './K6History.logic';

/**
 * Fragmented History Component for K6Main.
 */
export const K6History: React.FC<K6HistoryProps> = memo((props) => {
    const { formattedHistory } = useK6HistoryLogic(props);

    return (
        <div style={styles.glassCard}>
            <div style={styles.chartTitle}><Database size={14}/> HISTORIAL DE EJECUCIONES</div>
            <div style={styles.terminal} className="no-scrollbar">
                {formattedHistory.length === 0 ? (
                    <div style={{...styles.historyTimestamp, textAlign: 'center', marginTop: '10px'}}>
                        No hay historial disponible
                    </div>
                ) : (
                    formattedHistory.map((item) => (
                        <div key={item.id} style={styles.historyLineItem(item.hasFailed)}>
                            <div style={styles.historyTimestamp}>{item.timeStr}</div>
                            <div style={styles.historyProjectName}>{item.name}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
});
