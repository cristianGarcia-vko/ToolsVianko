const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { analyzeProject } = require('./analyzer.js');
const { buildScript } = require('./planScriptBuilder.js');
const { buildSanityReport } = require('./summaryReportBuilder.js');
const { runMonitor, saveReport } = require('./monitor.controller.js');
const { startStreamTest, getTest, cancelTest } = require('./k6StreamRunner.js');
const { sqlGeneratorRouter } = require('./sqlGenerator.js');
const { dataMigratorRouter } = require('./dataMigrator/router.js');
const { imageAnalyzerRouter } = require('./imageAnalyzer/router.js');

const loadLocalEnv = () => {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
};

loadLocalEnv();

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

const RUNTIME_ROOT = path.join(
  process.env.LOCALAPPDATA || os.tmpdir(),
  'ToolsVianko',
  'k6-runtime',
);
const UPLOADS_DIR = path.join(RUNTIME_ROOT, 'uploads');
const UNZIPPED_DIR = path.join(RUNTIME_ROOT, 'unzipped');
const LEGACY_UPLOADS_DIR = path.join(__dirname, 'uploads');
const LEGACY_UNZIPPED_DIR = path.join(__dirname, 'unzipped');

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const removePathSafe = (targetPath) => {
  try {
    if (fs.existsSync(targetPath)) {
      fs.rmSync(targetPath, { recursive: true, force: true });
    }
  } catch {}
};

const emptyDirSafe = (dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) return;
    for (const entry of fs.readdirSync(dirPath)) {
      removePathSafe(path.join(dirPath, entry));
    }
  } catch {}
};

ensureDir(RUNTIME_ROOT);
ensureDir(UPLOADS_DIR);
ensureDir(UNZIPPED_DIR);
ensureDir(LEGACY_UPLOADS_DIR);
ensureDir(LEGACY_UNZIPPED_DIR);
emptyDirSafe(LEGACY_UPLOADS_DIR);
emptyDirSafe(LEGACY_UNZIPPED_DIR);

const upload = multer({ dest: UPLOADS_DIR });
const HISTORY_FILE = path.join(__dirname, 'test_history.json');
const SUMMARY_FILE = path.join(__dirname, 'summary.json');
const PLAN_SUMMARY_FILE = path.join(__dirname, 'summary.plan.json');
const PLAN_SCRIPT_FILE = path.join(__dirname, 'generated_plan_script.js');
const SINGLE_SCRIPT_FILE = path.join(__dirname, 'script.js');

let currentK6Process = null;

const k6Binary = () => (fs.existsSync('C:\\Program Files\\k6\\k6.exe') ? 'C:\\Program Files\\k6\\k6.exe' : 'k6');

const readJsonSafe = (filePath, fallback) => {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
};

const saveToHistory = (testData) => {
  const history = readJsonSafe(HISTORY_FILE, []);
  history.unshift({
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    ...testData,
  });
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history.slice(0, 50), null, 2), 'utf8');
};

const runK6 = ({ scriptFile, summaryFile, env = {} }) =>
  new Promise((resolve, reject) => {
    const args = ['run', scriptFile, `--summary-export=${summaryFile}`];
    const child = spawn(k6Binary(), args, {
      cwd: __dirname,
      env: { ...process.env, ...env },
      windowsHide: true,
      shell: false,
    });

    currentK6Process = child;

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      currentK6Process = null;
      reject(error);
    });

    child.on('close', (code) => {
      currentK6Process = null;
      if (code === 0 && fs.existsSync(summaryFile)) {
        return resolve({
          summary: readJsonSafe(summaryFile, null),
          stdout,
          stderr,
        });
      }

      return reject(
        new Error(stderr || stdout || `k6 finalizo con codigo ${code}`),
      );
    });
  });

app.get('/api/history', (_req, res) => {
  return res.json(readJsonSafe(HISTORY_FILE, []));
});

app.post('/api/cancel-test', (_req, res) => {
  if (!currentK6Process) {
    return res.json({ cancelled: false, message: 'No hay proceso activo.' });
  }

  try {
    currentK6Process.kill();
    currentK6Process = null;
    return res.json({ cancelled: true });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'No se pudo cancelar el proceso',
    });
  }
});

app.post('/api/run-test', async (req, res) => {
  const { url, vus, duration } = req.body || {};
  if (!url) {
    return res.status(400).json({ error: 'Falta la URL' });
  }

  try {
    const { summary } = await runK6({
      scriptFile: SINGLE_SCRIPT_FILE,
      summaryFile: SUMMARY_FILE,
      env: {
        TARGET_URL: String(url),
        VUS: String(vus || 1),
        DURATION: String(duration || '10s').replace(/s$/, ''),
      },
    });

    saveToHistory({ type: 'single', url, vus, duration, metrics: summary.metrics });
    return res.json({ metrics: summary.metrics });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'No se pudo ejecutar k6',
    });
  }
});

app.post('/api/analyze-zip', upload.single('projectFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const zipPath = req.file.path;
  const extractPath = path.join(UNZIPPED_DIR, req.file.filename);
  ensureDir(extractPath);

  try {
    const endpoints = analyzeProject(zipPath, extractPath);
    fs.writeFileSync(
      path.join(__dirname, 'endpoints_encontrados.txt'),
      JSON.stringify(endpoints, null, 2),
      'utf8',
    );
    return res.json({ config: endpoints });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'No se pudo analizar el ZIP',
    });
  } finally {
    removePathSafe(zipPath);
    removePathSafe(extractPath);
    emptyDirSafe(UPLOADS_DIR);
    emptyDirSafe(UNZIPPED_DIR);
    emptyDirSafe(LEGACY_UPLOADS_DIR);
    emptyDirSafe(LEGACY_UNZIPPED_DIR);
  }
});

app.post('/api/run-plan', async (req, res) => {
  const body = req.body || {};
  const plan = body.plan || body;
  const authToken = body.authToken ? String(body.authToken).trim() : '';

  try {
    const planWithToken =
      authToken && (!plan.auth || plan.auth.mode === 'none')
        ? {
            ...plan,
            auth: {
              mode: 'staticToken',
              token: authToken,
              headerName: 'Authorization',
              headerPrefix: 'Bearer ',
            },
          }
        : plan;

    const { plan: cleanPlan, script } = buildScript(planWithToken);
    fs.writeFileSync(PLAN_SCRIPT_FILE, script, 'utf8');

    const { summary } = await runK6({
      scriptFile: PLAN_SCRIPT_FILE,
      summaryFile: PLAN_SUMMARY_FILE,
    });

    const report = buildSanityReport(summary, cleanPlan);
    saveToHistory({
      type: 'plan',
      projectName: cleanPlan.projectName,
      baseUrl: cleanPlan.baseUrl,
      metrics: summary.metrics,
      report,
    });

    return res.json({ metrics: summary.metrics, report });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'No se pudo ejecutar el plan',
    });
  }
});

app.post('/api/monitor/run', runMonitor);
app.post('/api/monitor/save', saveReport);
app.use('/api/sqlgen', sqlGeneratorRouter);
app.use('/api/data-migrator', dataMigratorRouter);
app.use('/api/image-analyzer', imageAnalyzerRouter);

// ─── STREAMING ENDPOINTS (Phase 1) ───────────────────────────────────────────

/**
 * Start a single-URL test with streaming output.
 * Returns { testId } immediately; use GET /api/test-stream/:testId for SSE.
 */
app.post('/api/start-stream-test', (req, res) => {
  const { url, vus, duration } = req.body || {};
  if (!url) return res.status(400).json({ error: 'Falta la URL' });

  try {
    const testId = `single_${Date.now()}`;
    const scriptPath = path.join(RUNTIME_ROOT, `script_${testId}.js`);
    const summaryPath = path.join(RUNTIME_ROOT, `summary_${testId}.json`);

    // Copy single script to a unique temp file
    fs.copyFileSync(SINGLE_SCRIPT_FILE, scriptPath);

    const test = startStreamTest({
      scriptFile: scriptPath,
      summaryFile: summaryPath,
      env: {
        TARGET_URL: String(url),
        VUS: String(vus || 1),
        DURATION: String(duration || '10s').replace(/s$/, ''),
      },
      planMeta: {
        projectName: 'Single Target',
        stepCount: 1,
        vus: vus || 1,
        baseUrl: url,
      },
    });

    // On completion, save to history and cleanup
    const completionHandler = (event) => {
      if (event.type !== 'complete') return;
      test.removeListener(completionHandler);

      if (event.data.success && event.data.summary) {
        saveToHistory({ type: 'single', url, vus, duration, metrics: event.data.summary });
      }
      setTimeout(() => {
        try { fs.unlinkSync(scriptPath); } catch {}
        try { fs.unlinkSync(summaryPath); } catch {}
      }, 10000);
    };
    test.addListener(completionHandler);

    return res.json({ testId: test.id });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Error starting stream test',
    });
  }
});

/**
 * Start a plan-based test with streaming output.
 * Returns { testId } immediately; use GET /api/test-stream/:testId for SSE.
 */
app.post('/api/start-stream-plan', (req, res) => {
  const body = req.body || {};
  const plan = body.plan || body;
  const authToken = body.authToken ? String(body.authToken).trim() : '';

  try {
    const planWithToken =
      authToken && (!plan.auth || plan.auth.mode === 'none')
        ? {
            ...plan,
            auth: {
              mode: 'staticToken',
              token: authToken,
              headerName: 'Authorization',
              headerPrefix: 'Bearer ',
            },
          }
        : plan;

    const { plan: cleanPlan, script } = buildScript(planWithToken);
    const testId = `plan_${Date.now()}`;
    const scriptPath = path.join(RUNTIME_ROOT, `script_${testId}.js`);
    const summaryPath = path.join(RUNTIME_ROOT, `summary_${testId}.json`);

    fs.writeFileSync(scriptPath, script, 'utf8');

    const scenario = cleanPlan.scenario || {};
    const vusDisplay = scenario.vus || (scenario.stages ? 'ramping' : '?');

    const test = startStreamTest({
      scriptFile: scriptPath,
      summaryFile: summaryPath,
      planMeta: {
        projectName: cleanPlan.projectName,
        stepCount: cleanPlan.steps ? cleanPlan.steps.length : 0,
        vus: vusDisplay,
        baseUrl: cleanPlan.baseUrl,
      },
    });

    // On completion, build report, save to history, store report on test entry
    const completionHandler = (event) => {
      if (event.type !== 'complete') return;
      test.removeListener(completionHandler);

      if (event.data.success && event.data.summary) {
        const fullSummary = { metrics: event.data.summary };
        const report = buildSanityReport(fullSummary, cleanPlan);
        test._finalReport = report;
        test._finalMetrics = event.data.summary;

        saveToHistory({
          type: 'plan',
          projectName: cleanPlan.projectName,
          baseUrl: cleanPlan.baseUrl,
          metrics: event.data.summary,
          report,
        });
      }
      setTimeout(() => {
        try { fs.unlinkSync(scriptPath); } catch {}
        try { fs.unlinkSync(summaryPath); } catch {}
      }, 10000);
    };
    test.addListener(completionHandler);

    return res.json({ testId: test.id });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Error starting stream plan',
    });
  }
});

/**
 * SSE stream for a running test. Replays buffered events on connect.
 */
app.get('/api/test-stream/:testId', (req, res) => {
  const test = getTest(req.params.testId);
  if (!test) return res.status(404).json({ error: 'Test not found' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const listener = (event) => {
    let data = event.data;

    // Enhance complete event with report if available
    if (event.type === 'complete' && test._finalReport) {
      data = { ...data, report: test._finalReport };
    }

    res.write(`event: ${event.type}\ndata: ${JSON.stringify(data)}\n\n`);

    if (event.type === 'complete' || (event.type === 'error' && !event.data?.recoverable)) {
      setTimeout(() => { try { res.end(); } catch {} }, 300);
    }
  };

  test.addListener(listener);

  req.on('close', () => {
    test.removeListener(listener);
  });
});

/**
 * Cancel a streaming test by testId.
 */
app.post('/api/cancel-stream-test/:testId', (req, res) => {
  const cancelled = cancelTest(req.params.testId);
  return res.json({ cancelled });
});

/**
 * Ping check — verify connectivity to a target URL.
 */
app.get('/api/ping-check', async (req, res) => {
  const targetUrl = String(req.query.url || '').trim();
  if (!targetUrl) return res.status(400).json({ error: 'url query param required' });

  const start = performance.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(targetUrl, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const latency = Math.round(performance.now() - start);
    return res.json({ reachable: true, status: response.status, latency });
  } catch (error) {
    const latency = Math.round(performance.now() - start);
    return res.json({
      reachable: false,
      status: 0,
      latency,
      error: error instanceof Error ? error.message : 'Network error',
    });
  }
});

const PORT = Number(process.env.PORT || 4001);
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Backend K6 Dashboard escuchando en ${HOST}:${PORT}...`);
});
