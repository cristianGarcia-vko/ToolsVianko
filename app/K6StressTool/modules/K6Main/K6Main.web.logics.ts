import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { setHistory, setMetrics, setCurrentReport } from '../../../store/slices/k6Slice';

export const useK6MainLogic = () => {
    const dispatch = useDispatch();
    const historyData = useSelector((state: RootState) => state.k6.historyData);
    const globalMetrics = useSelector((state: RootState) => state.k6.globalMetrics);
    const currentReport = useSelector((state: RootState) => state.k6.currentReport);

    const [loading, setLoading] = useState(false);
    const [protocol, setProtocol] = useState('http://');
    const [host, setHost] = useState('localhost');
    const [port, setPort] = useState('3000');
    const [route, setRoute] = useState('/api/ping');
    const [vusSingle, setVusSingle] = useState(1);
    const [durationSingle, setDurationSingle] = useState(10);
    const [error, setError] = useState<string | null>(null);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);

    // Advanced Evaluation State
    const [authToken, setAuthToken] = useState('');
    const [userContext, setUserContext] = useState('Admin');
    const [configJson, setConfigJson] = useState('{\n  "projectName": "Vianko ERP Sanity",\n  "endpoints": ["/api/v1/inventory", "/api/v1/orders"]\n}');
    const [zipFile, setZipFile] = useState<File | null>(null);
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    const finalUrl = useMemo(() => `${protocol}${host}${port ? ':' + port : ''}${route}`, [protocol, host, port, route]);

    const fetchHistory = useCallback(async () => {
        setIsHistoryLoading(true);
        try {
            const res = await fetch('http://localhost:3001/api/history');
            const data = await res.json();
            dispatch(setHistory(data));
        } catch (err) {
            console.error("Error fetching history");
        } finally {
            setIsHistoryLoading(false);
        }
    }, [dispatch]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const mapK6ToReport = (metrics: any, projectName: string) => {
        const totalReqs = metrics.http_reqs?.values?.count || 0;
        const failedReqs = metrics.http_req_failed?.values?.passes || 0;
        const successRate = 100 - (metrics.http_req_failed?.values?.rate * 100 || 0);
        const avgLat = metrics.http_req_duration?.values?.avg || 0;
        const p95Lat = metrics.http_req_duration?.values['p(95)'] || 0;
        
        return {
            timestamp: Date.now(),
            projectName,
            healthScore: Math.round(successRate),
            kpis: {
                totalRequests: totalReqs,
                avgLatency: Math.round(avgLat),
                failedRequests: failedReqs,
                successRate: Number(successRate.toFixed(2)),
                peakRps: Math.round(metrics.http_reqs?.values?.rate || 0)
            },
            endpointAnalysis: Object.keys(metrics).filter(k => k.startsWith('http_req_duration{expected_response:true,name:')).map(key => {
                const nameMatch = key.match(/name:(.+?)}/);
                const name = nameMatch ? nameMatch[1] : 'Unknown';
                const m = metrics[key].values;
                return {
                    name: 'API Endpoint',
                    path: name,
                    latency: Math.round(m.avg),
                    success: 100, // k6 specialized metrics are for expected responses
                    status: m.avg < 500 ? 'Stable' : 'Stressed'
                };
            }) || []
        };
    };

    const handleRunSingle = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('http://localhost:3001/api/run-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: finalUrl,
                    vus: vusSingle,
                    duration: `${durationSingle}s`
                })
            });
            const data = await res.json();
            if (data.error) {
                setError(data.error);
            } else {
                const report = mapK6ToReport(data.metrics, host || "Single Target");
                dispatch(setCurrentReport(report));
                setAnalysisResult(report);
            }
            fetchHistory();
        } catch (err) {
            setError("Error conectando con el servicio de estrés K6.");
        } finally {
            setLoading(false);
        }
    };

    const handleZipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setZipFile(e.target.files[0]);
        }
    };

    const handleAnalyze = async () => {
        if (!zipFile) {
            // If no zip, maybe fall back to single run?
            handleRunSingle();
            return;
        }
        setLoading(true);
        setError(null);
        
        try {
            const formData = new FormData();
            formData.append('projectFile', zipFile);
            
            const res = await fetch('http://localhost:3001/api/analyze-zip', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.error) setError(data.error);
            else setAnalysisResult({ type: 'analysis', endpoints: data.config });
        } catch (err) {
            setError("Error analizando el proyecto.");
        } finally {
            setLoading(false);
        }
    };

    const handleRunBatch = async () => {
        if (!analysisResult?.endpoints) return;
        setLoading(true);
        
        try {
            const res = await fetch('http://localhost:3001/api/run-multiple', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    baseUrl: host.startsWith('http') ? host : `http://${host}`,
                    endpoints: analysisResult.endpoints,
                    vus: vusSingle,
                    duration: durationSingle
                })
            });
            const data = await res.json();
            const report = mapK6ToReport(data.metrics, zipFile?.name || "Project Batch");
            dispatch(setCurrentReport(report));
            setAnalysisResult(report);
            fetchHistory();
        } catch (err) {
            setError("Error en ejecución por lotes.");
        } finally {
            setLoading(false);
        }
    };

    return {
        // States
        historyData, globalMetrics, currentReport, loading, 
        protocol, setProtocol, host, setHost, port, setPort, route, setRoute,
        vusSingle, setVusSingle, durationSingle, setDurationSingle,
        error, setError, isHistoryLoading, authToken, setAuthToken,
        userContext, setUserContext, configJson, setConfigJson,
        zipFile, setZipFile, analysisResult,
        finalUrl,
        // Handlers
        handleRunSingle, handleAnalyze, fetchHistory, handleZipUpload, handleRunBatch
    };
};
