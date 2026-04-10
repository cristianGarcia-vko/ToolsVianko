/**
 * K6 Stream Runner
 * Wraps K6 execution with SSE-compatible event streaming.
 * Manages active tests via a Map for concurrent support.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const {
  PHASE,
  parseProgressLine,
  parseTotalDurationFromLine,
  detectPhase,
  classifyLogLevel,
  isK6Banner,
} = require('./k6OutputParser');

const activeTests = new Map();

const k6Binary = () =>
  fs.existsSync('C:\\Program Files\\k6\\k6.exe')
    ? 'C:\\Program Files\\k6\\k6.exe'
    : 'k6';

const generateTestId = () =>
  `test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

/**
 * Start a K6 test with streaming output.
 * @param {object} config
 * @param {string} config.scriptFile - Path to the K6 script
 * @param {string} config.summaryFile - Path to write the summary export
 * @param {object} [config.env] - Extra env vars for K6
 * @param {object} [config.planMeta] - Metadata for console display
 * @returns {object} test entry with id, addListener, removeListener, kill
 */
const startStreamTest = ({ scriptFile, summaryFile, env = {}, planMeta = {} }) => {
  const testId = generateTestId();
  const listeners = new Set();
  let currentPhase = PHASE.INIT;
  let totalDurationSeconds = 0;
  let stdout = '';
  let stderr = '';
  let completed = false;
  let summaryData = null;
  const logBuffer = [];

  const emit = (event) => {
    logBuffer.push(event);
    const snapshot = [...listeners];
    for (const fn of snapshot) {
      try { fn(event); } catch (e) { /* swallow */ }
    }
  };

  // Initial events
  emit({ type: 'phase', data: { name: PHASE.INIT, progress: 0 }, timestamp: Date.now() });
  emit({
    type: 'log',
    data: { line: 'Compilando script K6...', level: 'info' },
    timestamp: Date.now(),
  });

  if (planMeta.projectName) {
    const parts = [`Plan: "${planMeta.projectName}"`];
    if (planMeta.stepCount) parts.push(`${planMeta.stepCount} endpoints`);
    if (planMeta.vus) parts.push(`${planMeta.vus} VUs`);
    emit({
      type: 'log',
      data: { line: parts.join(' · '), level: 'info' },
      timestamp: Date.now(),
    });
  }

  if (planMeta.baseUrl) {
    emit({
      type: 'log',
      data: { line: `Target: ${planMeta.baseUrl}`, level: 'info' },
      timestamp: Date.now(),
    });
  }

  // Spawn K6
  const args = ['run', scriptFile, `--summary-export=${summaryFile}`];
  const child = spawn(k6Binary(), args, {
    cwd: path.dirname(scriptFile),
    env: { ...process.env, ...env },
    windowsHide: true,
    shell: false,
  });

  const processLine = (line) => {
    const trimmed = line.trim();
    if (!trimmed || isK6Banner(trimmed)) return;

    // Detect phase changes
    const detectedPhase = detectPhase(trimmed);
    if (detectedPhase && detectedPhase !== currentPhase) {
      currentPhase = detectedPhase;
      emit({
        type: 'phase',
        data: { name: currentPhase, progress: currentPhase === PHASE.RUNNING ? 5 : 0 },
        timestamp: Date.now(),
      });
    }

    // Try to extract total duration from scenario config
    if (totalDurationSeconds === 0) {
      const dur = parseTotalDurationFromLine(trimmed);
      if (dur > 0) totalDurationSeconds = dur;
    }

    // Parse progress lines
    const progress = parseProgressLine(trimmed);
    if (progress) {
      const percent = totalDurationSeconds > 0
        ? Math.min(99, Math.round((progress.elapsedSeconds / totalDurationSeconds) * 100))
        : Math.min(99, Math.round(progress.elapsedSeconds));

      emit({
        type: 'metric',
        data: {
          vus: progress.activeVus,
          maxVus: progress.maxVus,
          iterations: progress.completedIterations,
          interrupted: progress.interruptedIterations,
          elapsed: progress.elapsed,
          progress: percent,
        },
        timestamp: Date.now(),
      });
      return; // Don't double-emit as log
    }

    // Regular log line
    emit({
      type: 'log',
      data: { line: trimmed, level: classifyLogLevel(trimmed) },
      timestamp: Date.now(),
    });
  };

  // Buffer partial lines from stdout/stderr
  let stdoutBuf = '';
  child.stdout.on('data', (chunk) => {
    const text = chunk.toString();
    stdout += text;
    stdoutBuf += text;
    const lines = stdoutBuf.split(/[\r\n]+/);
    stdoutBuf = lines.pop() || '';
    lines.forEach(processLine);
  });

  let stderrBuf = '';
  child.stderr.on('data', (chunk) => {
    const text = chunk.toString();
    stderr += text;
    stderrBuf += text;
    const lines = stderrBuf.split(/[\r\n]+/);
    stderrBuf = lines.pop() || '';
    lines.forEach(processLine);
  });

  child.on('error', (error) => {
    completed = true;
    emit({
      type: 'error',
      data: { message: error.message || 'K6 process error' },
      timestamp: Date.now(),
    });
    emit({
      type: 'phase',
      data: { name: PHASE.ERROR, progress: 100 },
      timestamp: Date.now(),
    });
  });

  child.on('close', (code) => {
    // Flush remaining buffers
    if (stdoutBuf.trim()) processLine(stdoutBuf);
    if (stderrBuf.trim()) processLine(stderrBuf);
    completed = true;

    if (code === 0 && fs.existsSync(summaryFile)) {
      try {
        summaryData = JSON.parse(fs.readFileSync(summaryFile, 'utf8'));
      } catch { /* ignore */ }
    }

    emit({
      type: 'phase',
      data: { name: code === 0 ? PHASE.COMPLETE : PHASE.ERROR, progress: 100 },
      timestamp: Date.now(),
    });

    emit({
      type: 'complete',
      data: {
        exitCode: code,
        summary: summaryData ? summaryData.metrics : null,
        success: code === 0,
        error: code !== 0 ? (stderr.slice(-500) || `k6 exited with code ${code}`) : null,
      },
      timestamp: Date.now(),
    });

    // Auto cleanup from map after 5 minutes
    setTimeout(() => activeTests.delete(testId), 5 * 60 * 1000);
  });

  const testEntry = {
    id: testId,
    process: child,
    listeners,
    logBuffer,
    _finalReport: null,
    _finalMetrics: null,
    completed: () => completed,
    summary: () => summaryData,
    addListener: (fn) => {
      listeners.add(fn);
      // Replay buffered events so late joiners catch up
      for (const event of logBuffer) {
        try { fn(event); } catch { /* swallow */ }
      }
    },
    removeListener: (fn) => listeners.delete(fn),
    kill: () => {
      try { child.kill(); } catch { /* swallow */ }
      completed = true;
      emit({
        type: 'phase',
        data: { name: PHASE.ERROR, progress: 100 },
        timestamp: Date.now(),
      });
      emit({
        type: 'complete',
        data: { exitCode: -1, summary: null, success: false, error: 'Cancelado por el usuario' },
        timestamp: Date.now(),
      });
      activeTests.delete(testId);
    },
  };

  activeTests.set(testId, testEntry);
  return testEntry;
};

const getTest = (testId) => activeTests.get(testId) || null;

const cancelTest = (testId) => {
  const test = activeTests.get(testId);
  if (!test) return false;
  test.kill();
  return true;
};

module.exports = { startStreamTest, getTest, cancelTest, activeTests };
