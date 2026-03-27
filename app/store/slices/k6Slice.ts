import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface KpiStats {
    totalRequests: number;
    avgLatency: number;
    failedRequests: number;
    successRate: number;
    peakRps: number;
}

interface SanityReport {
    timestamp: number;
    projectName: string;
    kpis: KpiStats;
    endpointAnalysis: any[];
    healthScore: number;
}

interface K6State {
    historyData: any[];
    globalMetrics: any | null;
    currentReport: SanityReport | null;
}

const initialState: K6State = {
    historyData: [],
    globalMetrics: null,
    currentReport: null,
};

const k6Slice = createSlice({
    name: 'k6',
    initialState,
    reducers: {
        setHistory: (state, action: PayloadAction<any[]>) => {
            state.historyData = action.payload;
        },
        setMetrics: (state, action: PayloadAction<any | null>) => {
            state.globalMetrics = action.payload;
        },
        setCurrentReport: (state, action: PayloadAction<SanityReport | null>) => {
            state.currentReport = action.payload;
            if (action.payload) {
                state.historyData = [action.payload, ...state.historyData];
            }
        },
        clearReport: (state) => {
            state.currentReport = null;
        }
    },
});

export const { setHistory, setMetrics, setCurrentReport, clearReport } = k6Slice.actions;
export default k6Slice.reducer;
