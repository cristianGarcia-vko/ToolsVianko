import { useMemo } from 'react';
import { K6HistoryProps } from './K6History.types';

export const useK6HistoryLogic = ({ historyData }: K6HistoryProps) => {
    const formattedHistory = useMemo(() => {
        if (!historyData || !Array.isArray(historyData)) return [];
        
        return historyData.slice(0, 5).map(h => {
            const hasFailed = h.metrics?.http_req_failed?.values?.passes > 0;
            const timeStr = new Date(h.timestamp).toLocaleTimeString();
            const name = h.projectName || h.url || 'Prueba Desconocida';
            
            return {
                id: h.id || h.timestamp,
                hasFailed,
                timeStr,
                name
            };
        });
    }, [historyData]);

    return {
        formattedHistory
    };
};
