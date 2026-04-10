import { useMemo } from 'react';
import { K6DashboardProps } from './K6Dashboard.types';

export const useK6DashboardLogic = ({ currentReport, stats }: K6DashboardProps) => {
    // Manejo seguro de la data para el dashboard
    const healthScore = currentReport?.healthScore || 0;
    const errorRate = (100 - (stats?.successRate || 100)).toFixed(1);
    const peakRps = stats?.peakRps || 0;
    const avgLatency = stats?.avgLatency || 0;
    const p95Latency = stats?.p95Latency || 0;
    const activeVus = stats?.activeVus || 0;

    // Time Series Default Data Formatter
    const timeSeriesData = useMemo(() => {
        return currentReport?.timeSeries || [
            { time: 'T1', latency: 400, p95: 600, p99: 1200, rps: 10, vus: 5, in: 100 },
            { time: 'T2', latency: 600, p95: 900, p99: 1800, rps: 30, vus: 15, in: 300 },
            { time: 'T3', latency: 450, p95: 750, p99: 1500, rps: 50, vus: 25, in: 500 },
        ];
    }, [currentReport?.timeSeries]);

    return {
        healthScore,
        errorRate,
        peakRps,
        avgLatency,
        p95Latency,
        activeVus,
        timeSeriesData
    };
};
