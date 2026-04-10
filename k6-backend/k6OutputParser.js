/**
 * K6 Output Parser
 * Parses K6 process stdout/stderr to extract real-time metrics and phase information.
 */

const PHASE = {
  INIT: 'init',
  WARMUP: 'warm-up',
  RUNNING: 'running',
  TEARDOWN: 'teardown',
  COMPLETE: 'complete',
  ERROR: 'error',
};

// K6 progress: "running (0m30.0s), 003/003 VUs, 127 complete and 0 interrupted iterations"
const PROGRESS_REGEX =
  /running\s+\((\d+m[\d.]+s)\),\s+(\d+)\/(\d+)\s+VUs?,\s+(\d+)\s+complete\s+and\s+(\d+)\s+interrupted/i;

const DURATION_REGEX = /(\d+)m([\d.]+)s/;

const parseDurationToSeconds = (durationStr) => {
  if (!durationStr) return 0;
  const match = durationStr.match(DURATION_REGEX);
  if (!match) return 0;
  return parseInt(match[1], 10) * 60 + parseFloat(match[2]);
};

const parseTotalDurationFromLine = (line) => {
  // "* default: 3 looping VUs for 10s (gracefulStop: 30s)"
  const m1 = line.match(/for\s+(\d+)s\b/i);
  if (m1) return parseInt(m1[1], 10);
  const m2 = line.match(/for\s+(\d+)m\b/i);
  if (m2) return parseInt(m2[1], 10) * 60;
  const m3 = line.match(/for\s+(\d+)h/i);
  if (m3) return parseInt(m3[1], 10) * 3600;
  // ramping-vus total from max duration: "40s max duration"
  const m4 = line.match(/(\d+)s\s+max\s+duration/i);
  if (m4) return parseInt(m4[1], 10);
  const m5 = line.match(/(\d+)m\d*s?\s+max\s+duration/i);
  if (m5) return parseInt(m5[1], 10) * 60;
  return 0;
};

const parseProgressLine = (line) => {
  const match = line.match(PROGRESS_REGEX);
  if (!match) return null;
  return {
    elapsed: match[1],
    elapsedSeconds: parseDurationToSeconds(match[1]),
    activeVus: parseInt(match[2], 10),
    maxVus: parseInt(match[3], 10),
    completedIterations: parseInt(match[4], 10),
    interruptedIterations: parseInt(match[5], 10),
  };
};

const detectPhase = (line) => {
  const lower = line.toLowerCase();
  if (lower.includes('execution: local') || lower.includes('script:')) return PHASE.INIT;
  if (lower.includes('scenarios:')) return PHASE.INIT;
  if (lower.startsWith('running')) return PHASE.RUNNING;
  if (lower.includes('teardown')) return PHASE.TEARDOWN;
  if (lower.includes('level=error') || lower.includes('goerror')) return PHASE.ERROR;
  return null;
};

const classifyLogLevel = (line) => {
  const lower = line.toLowerCase();
  if (lower.includes('error') || lower.includes('fail') || lower.includes('level=error')) return 'error';
  if (lower.includes('warn') || lower.includes('level=warning')) return 'warn';
  return 'info';
};

// Filter out K6 ASCII art banner noise
const isK6Banner = (line) => {
  const t = line.trim();
  return (
    t.startsWith('/\\') ||
    t.startsWith('/ ') ||
    t.startsWith('\\ ') ||
    t.includes('|‾‾|') ||
    t.includes('|__|') ||
    t.includes('(‾)') ||
    t.includes('________') ||
    t.includes('.io') && t.length < 60
  );
};

module.exports = {
  PHASE,
  parseProgressLine,
  parseDurationToSeconds,
  parseTotalDurationFromLine,
  detectPhase,
  classifyLogLevel,
  isK6Banner,
};
