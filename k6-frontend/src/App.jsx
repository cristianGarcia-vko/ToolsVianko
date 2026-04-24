import { useState, useMemo, useEffect } from 'react'
import axios from 'axios'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts'
import { Activity, Zap, BarChart3 } from 'lucide-react'

const K6_API_BASE_URL = import.meta.env.VITE_K6_API_BASE_URL || 'http://localhost:4001'
const DEFAULT_TARGET_HOST = import.meta.env.VITE_DEFAULT_TARGET_HOST || 'localhost'
const DEFAULT_TARGET_PORT = import.meta.env.VITE_DEFAULT_TARGET_PORT || '3002'

function App() {
  const [activeTab, setActiveTab] = useState('single'); // 'single' o 'multi'

  // ================= ESTADO MODO SIMPLE =================
  const [protocol, setProtocol] = useState('http://');
  const [host, setHost] = useState(DEFAULT_TARGET_HOST);
  const [port, setPort] = useState(DEFAULT_TARGET_PORT);
  const [route, setRoute] = useState('/api/ping');
  const [vusSingle, setVusSingle] = useState(10);
  const [durationSingle, setDurationSingle] = useState(5);

  const finalUrl = useMemo(() => {
    const rawPort = port ? `:${port}` : '';
    const rawRoute = route.startsWith('/') ? route : `/${route}`;
    return `${protocol}${host}${rawPort}${rawRoute}`;
  }, [protocol, host, port, route]);

  // ================= ESTADO MODO MULTIPLE (ZIP) =================
  const [file, setFile] = useState(null);
  const [endpointsConfig, setEndpointsConfig] = useState(null);
  const [baseUrlMulti, setBaseUrlMulti] = useState(`http://${DEFAULT_TARGET_HOST}:${DEFAULT_TARGET_PORT}`);
  const [vusMulti, setVusMulti] = useState(10);
  const [durationMulti, setDurationMulti] = useState(5);

  // ================= ESTADOS GLOBALES =================
  const [loading, setLoading] = useState(false);
  const [globalMetrics, setGlobalMetrics] = useState(null);
  const [error, setError] = useState(null);
  const [historyData, setHistoryData] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${K6_API_BASE_URL}/api/history`);
      setHistoryData(res.data);
    } catch(err) { console.error('No se pudo cargar el historial:', err); }
  };

  useEffect(() => { fetchHistory(); }, [activeTab]);

  // ------- HANDLER MODO SIMPLE -------
  const handleRunSingle = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null); setGlobalMetrics(null);

    try {
      const response = await axios.post(`${K6_API_BASE_URL}/api/run-test`, {
        url: finalUrl,
        vus: vusSingle,
        duration: durationSingle,
      });
      parseMetrics(response.data.metrics);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al ejecutar prueba K6.');
    } finally {
      setLoading(false);
    }
  };

  // ------- HANDLER SUBIR ZIP -------
  const handleUploadZip = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Por favor selecciona un archivo ZIP');
      return;
    }

    setLoading(true); setError(null); setEndpointsConfig(null); setGlobalMetrics(null);
    const formData = new FormData();
    formData.append('projectFile', file);

    try {
      const res = await axios.post(`${K6_API_BASE_URL}/api/analyze-zip`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const configRaw = res.data.config || [];
      
      if (configRaw.length === 0) {
        setError('🔍 Informe del Analizador: ¡El sistema escaneó todos los archivos .js y .ts pero no logró hallar ninguna definición de ruta válida (tipo app.get, router.post, etc) en tu proyecto!');
        setLoading(false);
        return; // Salimos sin asignar Endpoints para mantener la zona de subida activa.
      }

      // Guardar el arreglo extraido y darles un campo para habilitarlos
      const extracted = configRaw.map(ep => ({
        ...ep,
        enabled: true,
        payloadString: ep.payload ? JSON.stringify(ep.payload, null, 2) : ''
      }));

      setEndpointsConfig(extracted);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al analizar el ZIP del proyecto.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ------- HANDLER CORRER MODO MULTIPLE -------
  const handleRunMulti = async () => {
    setLoading(true); setError(null); setGlobalMetrics(null);
    
    // Preparar el arreglo filtrando activos
    const activeEndpoints = endpointsConfig
      .filter(ep => ep.enabled)
      .map(ep => {
        let parsedPayload = null;
        if (ep.payloadString) {
          try {
            parsedPayload = JSON.parse(ep.payloadString);
          } catch(e) {
            console.error("Ignorando payload de", ep.route, "por json invalido");
          }
        }
        return {
          method: ep.method,
          route: ep.route,
          payload: parsedPayload
        };
      });

    if (activeEndpoints.length === 0) {
      setError("No hay endpoints seleccionados.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${K6_API_BASE_URL}/api/run-multiple`, {
        endpoints: activeEndpoints,
        baseUrl: baseUrlMulti,
        vus: vusMulti,
        duration: durationMulti,
      });

      parseMetrics(response.data.metrics);
    } catch(err) {
      setError(err.response?.data?.error || 'Error al ejecutar batería K6.');
    } finally {
      setLoading(false);
    }
  };

  const parseMetrics = (metricsData) => {
    if (!metricsData) return;
    setGlobalMetrics({
      totalRequests: metricsData.http_reqs?.count ?? metricsData.http_reqs?.values?.count ?? 0,
      avgDuration: (metricsData.http_req_duration?.avg ?? metricsData.http_req_duration?.values?.avg ?? 0).toFixed(2),
      failedRequests: metricsData.http_req_failed?.passes ?? metricsData.http_req_failed?.values?.passes ?? 0,
    });
  };

  // Toggle endpoint status
  const toggleEndpoint = (idx) => {
    const fresh = [...endpointsConfig];
    fresh[idx].enabled = !fresh[idx].enabled;
    setEndpointsConfig(fresh);
  };

  const updatePayloadStatus = (idx, value) => {
    const fresh = [...endpointsConfig];
    fresh[idx].payloadString = value;
    setEndpointsConfig(fresh);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 flex flex-col p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto w-full mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
            <svg className="w-10 h-10 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            K6 Overdrive
          </h1>
          <p className="text-slate-400 mt-2 ml-1 text-sm md:text-base">Infraestructura de Inyección y Telemetría</p>
        </div>
        
        {/* Toggle Modes */}
        <div className="bg-[#1A2234] rounded-xl p-1 flex border border-slate-700/50">
          <button 
            onClick={() => { setActiveTab('single'); setGlobalMetrics(null); setError(null); }}
            className={`px-6 py-2 rounded-lg text-sm font-bold tracking-wide transition-all flex items-center gap-2 ${
              activeTab === 'single' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" /> Singular
          </button>
          <button 
            onClick={() => { setActiveTab('multi'); setGlobalMetrics(null); setError(null); }}
            className={`px-6 py-2 rounded-lg text-sm font-bold tracking-wide transition-all flex items-center gap-2 ${
              activeTab === 'multi' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" /> Multi
          </button>
          <button 
            onClick={() => { setActiveTab('dashboard'); fetchHistory(); }}
            className={`px-6 py-2 rounded-lg text-sm font-bold tracking-wide transition-all flex items-center gap-2 ${
              activeTab === 'dashboard' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 h-full flex-1 mb-8">
        
        {/* PANEL IZQUIERDO (CONTENIDOS DINÁMICOS) */}
        {activeTab !== 'dashboard' && (
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-[#121827] rounded-3xl shadow-2xl border border-slate-800/60 overflow-hidden relative min-h-[500px] flex flex-col">
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${activeTab === 'single' ? 'from-indigo-500 to-purple-500' : 'from-pink-500 to-rose-500'}`}></div>
            
            <div className="p-6 md:p-8 flex-1">
              {/* === MODO SINGULAR === */}
              {activeTab === 'single' && (
                <form onSubmit={handleRunSingle} className="animate-fade-in space-y-8">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                    Ataque Directo
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-3">
                      <label className="block text-xs font-semibold mb-1.5 text-slate-400">Protocolo</label>
                      <select value={protocol} onChange={(e) => setProtocol(e.target.value)} className="w-full bg-[#1A2234] border border-slate-700/50 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none">
                        <option value="http://">HTTP://</option>
                        <option value="https://">HTTPS://</option>
                      </select>
                    </div>
                    <div className="md:col-span-6">
                      <label className="block text-xs font-semibold mb-1.5 text-slate-400">Host</label>
                      <input type="text" required value={host} onChange={(e) => setHost(e.target.value)} className="w-full bg-[#1A2234] border border-slate-700/50 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 outline-none" placeholder="api.server.local" />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs font-semibold mb-1.5 text-slate-400">Puerto</label>
                      <input type="text" value={port} onChange={(e) => setPort(e.target.value)} className="w-full bg-[#1A2234] border border-slate-700/50 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 outline-none" placeholder="3002" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-slate-400">Endpoint / Ruta</label>
                    <input type="text" value={route} onChange={(e) => setRoute(e.target.value)} className="w-full bg-[#1A2234] border border-slate-700/50 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 outline-none" placeholder="/api/recurso" />
                  </div>

                  <div className="p-4 bg-indigo-950/30 border border-indigo-500/20 rounded-xl flex items-center justify-between">
                    <span className="text-xs text-indigo-300 font-mono">TARGET:</span>
                    <span className="text-sm text-indigo-200 font-mono font-bold truncate">{finalUrl}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-800">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 text-slate-400">Virtual Users</label>
                      <input type="number" min="1" required value={vusSingle} onChange={(e) => setVusSingle(e.target.value)} className="w-full bg-[#1A2234] border border-slate-700/50 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 text-slate-400">Duración (seg)</label>
                      <input type="number" min="1" required value={durationSingle} onChange={(e) => setDurationSingle(e.target.value)} className="w-full bg-[#1A2234] border border-slate-700/50 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 outline-none" />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="w-full relative uppercase tracking-widest text-sm font-bold mt-4 bg-indigo-600 hover:bg-indigo-500 text-white py-4 px-6 rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50">
                    {loading ? 'Disparando Carga...' : 'Ejecutar Singular'}
                  </button>
                </form>
              )}

              {/* === MODO AUTO DISCOVERY (ZIP) === */}
              {activeTab === 'multi' && (
                <div className="animate-fade-in flex flex-col h-full">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-pink-400 mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    Batería de Pruebas (Inspector)
                  </h2>

                  {/* Paso 1: Upload */}
                  {!endpointsConfig && (
                    <form onSubmit={handleUploadZip} className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700/50 rounded-2xl bg-[#1A2234] transition-colors relative">
                      
                      <div className="relative w-full flex flex-col items-center justify-center p-6 cursor-pointer group hover:bg-slate-800/30 rounded-xl transition-colors">
                        <input 
                          type="file" 
                          accept=".zip" 
                          onChange={(e) => setFile(e.target.files[0])}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <svg className="w-8 h-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <p className="text-white font-bold text-lg">{file ? file.name : 'Haz clic aquí para seleccionar tu .ZIP'}</p>
                        <p className="text-slate-400 text-sm mt-2 text-center max-w-sm">
                          Analizaremos tus archivos y detectaremos las rutas Express con sus datos automáticamente.
                        </p>
                      </div>
                      
                      {file && (
                        <div className="mt-4 z-20 relative">
                          <button type="submit" disabled={loading} className="px-8 py-3 bg-pink-600 hover:bg-pink-500 rounded-xl font-bold uppercase tracking-wide text-white transition-all shadow-lg shadow-pink-500/20 active:scale-95">
                            {loading ? 'Analizando...' : 'Extraer y Analizar'}
                          </button>
                        </div>
                      )}
                    </form>
                  )}

                  {/* Paso 2: Revision de tabla y confirmación */}
                  {endpointsConfig && (
                     <div className="flex flex-col flex-1 min-h-[400px]">
                       <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl mb-6 flex justify-between items-center">
                          <span className="text-emerald-400 font-bold text-sm">✓ {endpointsConfig.length} Rutas detectadas</span>
                          <button onClick={() => setEndpointsConfig(null)} className="text-xs text-slate-400 hover:text-white underline">Subir otro archivo</button>
                       </div>

                       {/* Tabla de rutas */}
                       <div className="flex-1 overflow-auto max-h-[300px] border border-slate-700/50 rounded-xl bg-[#1A2234] mb-6 shadow-inner">
                         <div className="grid grid-cols-12 gap-2 border-b border-slate-700 bg-slate-800/50 p-3 text-xs font-bold text-slate-400 uppercase tracking-widest sticky top-0 z-10">
                            <div className="col-span-1 text-center">Test?</div>
                            <div className="col-span-2">Método</div>
                            <div className="col-span-5">Ruta</div>
                            <div className="col-span-4">Payload (JSON Editable)</div>
                         </div>
                         {endpointsConfig.map((ep, idx) => (
                           <div key={idx} className={`grid grid-cols-12 gap-2 p-3 border-b border-slate-700/50 items-start transition-colors ${!ep.enabled && 'opacity-40 grayscale'}`}>
                             <div className="col-span-1 flex justify-center pt-2">
                               <input type="checkbox" checked={ep.enabled} onChange={() => toggleEndpoint(idx)} className="w-4 h-4 accent-pink-500" />
                             </div>
                             <div className="col-span-2 pt-1 font-mono font-bold">
                                <span className={`px-2 py-1 rounded text-[10px] ${ep.method==='GET'?'bg-blue-500/20 text-blue-400':ep.method==='POST'?'bg-emerald-500/20 text-emerald-400':ep.method==='PUT'?'bg-amber-500/20 text-amber-400':'bg-rose-500/20 text-rose-400'}`}>
                                  {ep.method}
                                </span>
                             </div>
                             <div className="col-span-5 pt-1 text-sm font-mono truncate text-slate-300" title={ep.route}>{ep.route}</div>
                             <div className="col-span-4">
                                {['POST', 'PUT', 'PATCH'].includes(ep.method) ? (
                                   <textarea 
                                      value={ep.payloadString}
                                      onChange={(e) => updatePayloadStatus(idx, e.target.value)}
                                      disabled={!ep.enabled}
                                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs font-mono text-green-300 outline-none focus:border-pink-500 min-h-[60px]"
                                      spellCheck="false"
                                   />
                                ) : <span className="text-xs text-slate-500 italic block pt-1">Sin Body</span>}
                             </div>
                           </div>
                         ))}
                       </div>

                       {/* Controles Globales Bateria */}
                       <div className="grid grid-cols-3 gap-4 mb-6 pt-4 border-t border-slate-800">
                          <div>
                            <label className="block text-xs font-semibold mb-1.5 text-slate-400">Base URL</label>
                            <input type="text" value={baseUrlMulti} onChange={(e) => setBaseUrlMulti(e.target.value)} className="w-full bg-[#1A2234] border border-slate-700/50 rounded-xl px-3 py-2 text-sm focus:border-pink-500 focus:ring-1 outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold mb-1.5 text-slate-400">Global VUs</label>
                            <input type="number" min="1" value={vusMulti} onChange={(e) => setVusMulti(e.target.value)} className="w-full bg-[#1A2234] border border-slate-700/50 rounded-xl px-3 py-2 text-sm focus:border-pink-500 focus:ring-1 outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold mb-1.5 text-slate-400">Duración(s)</label>
                            <input type="number" min="1" value={durationMulti} onChange={(e) => setDurationMulti(e.target.value)} className="w-full bg-[#1A2234] border border-slate-700/50 rounded-xl px-3 py-2 text-sm focus:border-pink-500 focus:ring-1 outline-none" />
                          </div>
                       </div>

                       <button 
                          onClick={handleRunMulti} 
                          disabled={loading} 
                          className="w-full uppercase tracking-widest text-sm font-bold bg-pink-600 hover:bg-pink-500 text-white py-4 px-6 rounded-xl transition-all shadow-lg shadow-pink-500/20 disabled:opacity-50"
                        >
                          {loading ? 'Saturando Infraestructura...' : 'Lanzar Batería K6 Completa'}
                       </button>

                     </div>
                  )}

                </div>
              )}

            </div>
          </div>
        </div>
        )}

        {/* PANEL DERECHO (TELEMETRÍA FIJA) */}
        {activeTab !== 'dashboard' && (
        <div className="lg:col-span-5 h-full">
          <div className="bg-[#121827] rounded-3xl shadow-2xl border border-slate-800/60 p-8 h-full flex flex-col relative overflow-hidden">
            
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Telemetría en Vivo
            </h2>

            {!loading && !globalMetrics && !error && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-60">
                <svg className="w-20 h-20 mb-6 stroke-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-sm tracking-wide">Esperando inicio de prueba...</p>
              </div>
            )}

            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative w-24 h-24 mb-6">
                  <div className={`absolute inset-0 border-4 rounded-full ${activeTab==='single' ? 'border-indigo-500/20' : 'border-pink-500/20'}`}></div>
                  <div className={`absolute inset-0 border-4 rounded-full border-t-transparent animate-spin ${activeTab==='single' ? 'border-indigo-500' : 'border-pink-500'}`}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xs font-bold ${activeTab==='single' ? 'text-indigo-400' : 'text-pink-400'}`}>K6</span>
                  </div>
                </div>
                <p className={`${activeTab==='single' ? 'text-indigo-400' : 'text-pink-400'} font-medium tracking-widest text-sm uppercase animate-pulse`}>Saturando Destino...</p>
              </div>
            )}

            {error && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-red-400 font-medium text-center text-sm px-4">{error}</p>
              </div>
            )}

            {globalMetrics && !loading && !error && (
              <div className="flex-1 flex flex-col gap-4 animate-[fadeIn_0.5s_ease-out]">
                
                <div className={`bg-gradient-to-br p-5 rounded-2xl border transition-colors ${activeTab==='single'?'from-indigo-500/10 border-indigo-500/20 hover:border-indigo-500/40':'from-pink-500/10 border-pink-500/20 hover:border-pink-500/40'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Peticiones Totales</p>
                  </div>
                  <p className="text-4xl font-black text-white">{globalMetrics.totalRequests.toLocaleString()}</p>
                </div>

                <div className="bg-gradient-to-br from-teal-500/10 to-transparent p-5 rounded-2xl border border-teal-500/20 group hover:border-teal-500/40 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Latencia Promedio</p>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-black text-white">{globalMetrics.avgDuration}</p>
                    <span className="text-teal-500 font-bold uppercase text-sm">ms</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-rose-500/10 to-transparent p-5 rounded-2xl border border-rose-500/20 group hover:border-rose-500/40 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Fallas (Errors)</p>
                  </div>
                  <p className={`text-4xl font-black ${globalMetrics.failedRequests > 0 ? 'text-rose-500' : 'text-slate-300'}`}>
                    {globalMetrics.failedRequests}
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
        )}

        {/* ========== PANEL TABLERO (DASHBOARD) ========== */}
        {activeTab === 'dashboard' && (
          <div className="lg:col-span-12 w-full animate-fade-in flex flex-col gap-6 p-4 md:p-8 bg-[#121827] rounded-3xl border border-slate-800/60 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            
            <div className="flex justify-between items-center mb-4">
               <div>
                  <h2 className="text-xl font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6" /> Telemetría Global Histórica
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">Análisis predictivo y de estabilidad extraído de métricas registradas en K6.</p>
               </div>
               <div className="text-right">
                  <p className="text-2xl font-black text-white">{historyData.length}</p>
                  <p className="text-xs font-semibold uppercase text-slate-500">Pruebas Totales</p>
               </div>
            </div>

            {/* Fila de Tarjetas (KPI) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#1A2234] border border-slate-700/50 p-6 rounded-2xl relative overflow-hidden">
                 <p className="text-xs font-bold text-slate-400 uppercase mb-2">Total de Peticiones Emitidas</p>
                 <p className="text-3xl font-black text-emerald-400">
                    {historyData.reduce((acc, curr) => acc + (curr.metrics?.http_reqs?.count ?? curr.metrics?.http_reqs?.values?.count ?? 0), 0).toLocaleString()}
                 </p>
                 <div className="absolute -bottom-4 -right-4 text-emerald-500/10">
                    <Activity className="w-24 h-24" />
                 </div>
              </div>
              <div className="bg-[#1A2234] border border-slate-700/50 p-6 rounded-2xl">
                 <p className="text-xs font-bold text-slate-400 uppercase mb-2">Latencia Histórica Promedio</p>
                 <p className="text-3xl font-black text-white">
                    {(historyData.reduce((acc, curr) => acc + (curr.metrics?.http_req_duration?.avg ?? curr.metrics?.http_req_duration?.values?.avg ?? 0), 0) / (historyData.length || 1)).toFixed(2)} ms
                 </p>
              </div>
              <div className="bg-[#1A2234] border border-slate-700/50 p-6 rounded-2xl">
                 <p className="text-xs font-bold text-slate-400 uppercase mb-2">Total de Fallas (Errores)</p>
                 <p className="text-3xl font-black text-rose-400">
                    {historyData.reduce((acc, curr) => acc + (curr.metrics?.http_req_failed?.passes ?? curr.metrics?.http_req_failed?.values?.passes ?? 0), 0).toLocaleString()}
                 </p>
              </div>
              <div className="bg-[#1A2234] border border-slate-700/50 p-6 rounded-2xl">
                 <p className="text-xs font-bold text-slate-400 uppercase mb-2">Tasa de Éxito / Viabilidad</p>
                 <p className="text-3xl font-black text-teal-400">
                    {(() => {
                        const total = historyData.reduce((acc, curr) => acc + (curr.metrics?.http_reqs?.count ?? curr.metrics?.http_reqs?.values?.count ?? 0), 0);
                        const failed = historyData.reduce((acc, curr) => acc + (curr.metrics?.http_req_failed?.passes ?? curr.metrics?.http_req_failed?.values?.passes ?? 0), 0);
                        if(total === 0) return '100%';
                        return ((1 - (failed / total)) * 100).toFixed(2) + '%';
                    })()}
                 </p>
              </div>
            </div>

            {/* Graficos Principales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              
              {/* Grafica de Area - Tendencia de Peticiones y VUs */}
              <div className="bg-[#1A2234] border border-slate-700/50 p-6 rounded-2xl flex flex-col h-[400px]">
                 <h3 className="text-sm font-bold text-slate-400 mb-6">Volumen de Carga Histórico (Peticiones vs Duración)</h3>
                 <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[...historyData].reverse()}>
                        <defs>
                          <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                        <XAxis dataKey={(d) => new Date(d.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px' }} />
                        <Area type="monotone" name="Total Peticiones" dataKey={(d) => d.metrics?.http_reqs?.count ?? d.metrics?.http_reqs?.values?.count ?? 0} stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorReq)" />
                      </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* Grafica de Barras Apiladas - Latencia y Fallas */}
              <div className="bg-[#1A2234] border border-slate-700/50 p-6 rounded-2xl flex flex-col h-[400px]">
                 <h3 className="text-sm font-bold text-slate-400 mb-6">Contraste de Latencia (ms)</h3>
                 <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[...historyData].reverse()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                        <XAxis dataKey={(d) => new Date(d.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px' }} cursor={{fill: '#1E293B'}} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                        <Bar name="Latencia AVG" dataKey={(d) => d.metrics?.http_req_duration?.avg ?? d.metrics?.http_req_duration?.values?.avg ?? 0} fill="#6366F1" radius={[4, 4, 0, 0]} />
                        <Bar name="Latencia Máxima" dataKey={(d) => d.metrics?.http_req_duration?.max ?? d.metrics?.http_req_duration?.values?.max ?? 0} fill="#EC4899" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}

export default App
