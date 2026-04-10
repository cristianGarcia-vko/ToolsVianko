const fs = require('fs');
const os = require('os');
const path = require('path');

const REPORTS_DIR = path.join(
  process.env.LOCALAPPDATA || os.tmpdir(),
  'ToolsVianko',
  'k6-runtime',
  'reports',
);

const ensureReportsDir = () => {
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
};

const buildHeaders = (endpoint) => {
  const headers = { ...(endpoint.headers || {}) };
  if (endpoint.token && !headers.Authorization) {
    headers.Authorization = `Bearer ${endpoint.token}`;
  }
  if (endpoint.payload != null && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

const evaluateEndpoint = async (endpoint) => {
  const start = performance.now();
  try {
    const response = await fetch(endpoint.url, {
      method: endpoint.method,
      headers: buildHeaders(endpoint),
      body:
        endpoint.payload != null && String(endpoint.method || 'GET').toUpperCase() !== 'GET'
          ? JSON.stringify(endpoint.payload)
          : undefined,
    });
    const latency = Math.round(performance.now() - start);

    return {
      url: endpoint.url,
      method: endpoint.method,
      status: response.status,
      latency,
      ok: response.ok,
      error: response.ok ? null : response.statusText || 'HTTP error',
    };
  } catch (error) {
    return {
      url: endpoint.url,
      method: endpoint.method,
      status: 0,
      latency: Math.round(performance.now() - start),
      ok: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
};

const runMonitor = async (req, res) => {
  const { endpoints } = req.body || {};
  if (!Array.isArray(endpoints) || !endpoints.length) {
    return res.status(400).json({ error: 'Lista de endpoints invalida' });
  }

  const cleanEndpoints = endpoints
    .map((endpoint) => ({
      url: String(endpoint.url || '').trim(),
      method: String(endpoint.method || 'GET').toUpperCase(),
      token: endpoint.token ? String(endpoint.token).trim() : '',
      headers: endpoint.headers && typeof endpoint.headers === 'object' ? endpoint.headers : {},
      payload: endpoint.payload,
    }))
    .filter((endpoint) => endpoint.url);

  if (!cleanEndpoints.length) {
    return res.status(400).json({ error: 'No hay endpoints validos para evaluar' });
  }

  const results = await Promise.all(cleanEndpoints.map(evaluateEndpoint));
  return res.json({ results });
};

const saveReport = (req, res) => {
  const { projectName, results } = req.body || {};
  if (!projectName || !Array.isArray(results)) {
    return res.status(400).json({ error: 'Faltan parametros para guardar el reporte' });
  }

  ensureReportsDir();

  const safeName = String(projectName)
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'monitor';

  const fileName = `${safeName}_report_${Date.now()}.json`;
  const filePath = path.join(REPORTS_DIR, fileName);

  try {
    fs.writeFileSync(filePath, JSON.stringify(results, null, 2), 'utf8');
    return res.json({ message: 'Reporte guardado exitosamente', fileName });
  } catch (error) {
    return res.status(500).json({
      error: 'Error al guardar el archivo',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

module.exports = {
  runMonitor,
  saveReport,
};
