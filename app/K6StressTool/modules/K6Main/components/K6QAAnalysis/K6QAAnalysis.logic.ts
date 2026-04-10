import { useMemo } from 'react';
import { K6QAAnalysisProps } from './K6QAAnalysis.types';
import { tokens } from '../../../../../SharedTool/style/tokens.shared.style';

export const useK6QAAnalysisLogic = ({ currentReport, analysisResult }: K6QAAnalysisProps) => {

    const isDiscovery = analysisResult?.type === 'analysis';
    const discoveredEndpoints = analysisResult?.endpoints || [];

    const pieData = useMemo(() => {
        if (!currentReport?.statusCodes || Object.keys(currentReport.statusCodes).length === 0) {
            return [{ name: '200', value: 100 }, { name: '500', value: 0 }];
        }
        return Object.entries(currentReport.statusCodes).map(([k, v]) => ({ name: k, value: v }));
    }, [currentReport?.statusCodes]);

    const getPieColor = (entryName: string) => {
        if (entryName.startsWith('2')) return tokens.colors.accentGreen;
        if (entryName.startsWith('5')) return tokens.colors.accentError;
        if (entryName.startsWith('4')) return tokens.colors.accentOrange;
        return tokens.colors.accentTeal;
    };

    const endpointBarData = useMemo(() => {
        if (!currentReport?.endpointAnalysis || currentReport.endpointAnalysis.length === 0) {
            return [
                { name: 'API', path: '/v1/users', latency: 120, status: 'Stable' },
                { name: 'API', path: '/v1/orders', latency: 850, status: 'Stressed' },
            ];
        }
        return currentReport.endpointAnalysis.slice(0, 7); // Max 7 endpoints for bar chart
    }, [currentReport?.endpointAnalysis]);

    return {
        isDiscovery,
        discoveredEndpoints,
        pieData,
        getPieColor,
        endpointBarData
    };
};
