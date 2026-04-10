import { useMemo } from 'react';
import { K6InsightsProps } from './K6Insights.types';

export const useK6InsightsLogic = ({ stats }: K6InsightsProps) => {
    const isOptimal = (stats?.successRate || 0) > 99;
    
    const insightMessage = useMemo(() => {
        if ((stats?.peakRps || 0) > 50 && (stats?.p95Latency || 0) > 800) {
            return "🚨 El sistema ha llegado a su límite de concurrencia física. El RPS se estanca mientras los tiempos de respuesta se disparan. Decisión recomendada: Escalar horizontalmente añadiendo más nodos o revisar bloqueos en DB.";
        }
        if ((stats?.successRate || 0) < 95) {
             return "⚠️ El aumento de errores 5xx sugiere fugas de memoria o timeouts de red. Decisión recomendada: Revisar logs de Garbage Collection y auditoría de RAM en el servidor.";
        }
        return "✅ La infraestructura se mantiene estable bajo la carga actual. El ancho de banda consumido indica que la compresión GZIP es efectiva.";
    }, [stats]);

    return {
        isOptimal,
        insightMessage
    };
};
