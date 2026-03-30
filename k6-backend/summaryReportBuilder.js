const getMetricValues = (metrics, key) => {
  const entry = metrics && metrics[key];
  if (!entry) return undefined;
  return entry.values && typeof entry.values === 'object' ? entry.values : entry;
};

const parseTaggedMetricKey = (key) => {
  const raw = String(key || '');
  const braceIdx = raw.indexOf('{');
  const endIdx = raw.lastIndexOf('}');
  if (braceIdx === -1 || endIdx === -1 || endIdx < braceIdx) return { name: raw, tags: null };

  const name = raw.slice(0, braceIdx);
  const inner = raw.slice(braceIdx + 1, endIdx);
  const tags = {};
  inner.split(',').forEach((part) => {
    const p = part.trim();
    if (!p) return;
    const idx = p.indexOf(':');
    if (idx === -1) return;
    const k = p.slice(0, idx).trim();
    const v = p.slice(idx + 1).trim();
    if (!k) return;
    tags[k] = v;
  });

  return { name, tags };
};

const toNumber = (value) => (Number.isFinite(Number(value)) ? Number(value) : undefined);

const computeFailedRate = (metricValues) => {
  if (!metricValues || typeof metricValues !== 'object') return undefined;
  const directRate = toNumber(metricValues.rate);
  if (directRate != null) return directRate;

  const passRatio = toNumber(metricValues.value);
  if (passRatio != null) return Math.max(0, Math.min(1, 1 - passRatio));

  const passes = toNumber(metricValues.passes);
  const fails = toNumber(metricValues.fails);
  const total = passes != null && fails != null ? passes + fails : undefined;
  if (total && total > 0 && fails != null) return fails / total;

  return undefined;
};

const extractEndpointAnalysis = (metrics) => {
  if (!metrics || typeof metrics !== 'object') return [];
  const out = [];
  Object.entries(metrics).forEach(([key, metric]) => {
    if (!key.startsWith('http_req_duration{')) return;
    const { tags } = parseTaggedMetricKey(key);
    if (!tags || !tags.name) return;

    const values = metric && metric.values ? metric.values : metric;
    const avg = toNumber(values.avg);
    const p95 = toNumber(values['p(95)']);
    const p99 = toNumber(values['p(99)']);
    out.push({
      name: tags.group ? String(tags.group).toUpperCase() : 'API',
      path: tags.name,
      group: tags.group || undefined,
      latency: Math.round(p95 ?? avg ?? 0),
      avg: avg != null ? Math.round(avg) : undefined,
      p95: p95 != null ? Math.round(p95) : undefined,
      p99: p99 != null ? Math.round(p99) : undefined,
      success: 100,
      status: (p95 ?? avg ?? 0) < 500 ? 'Stable' : 'Stressed',
    });
  });

  // Prefer shorter list: de-dup by path (k6 may generate multiple tag combos)
  const seen = new Set();
  return out.filter((row) => {
    const key = `${row.group || ''}:${row.path}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const evalThresholdExpr = (metricValues, expr) => {
  const raw = String(expr || '').trim();
  const m = raw.match(/^(.+?)(<=|>=|<|>)(.+)$/);
  if (!m) return null;
  const left = m[1].trim();
  const op = m[2];
  const right = toNumber(m[3].trim());
  if (right == null) return null;

  let actual;
  if (left === 'rate') {
    actual = computeFailedRate(metricValues);
  } else {
    actual = toNumber(metricValues[left]);
  }
  if (actual == null) return null;

  const pass =
    op === '<' ? actual < right :
    op === '<=' ? actual <= right :
    op === '>' ? actual > right :
    op === '>=' ? actual >= right :
    false;

  return { expr: raw, actual, pass, expected: right, op, left };
};

const evaluateThresholds = (metrics, thresholds) => {
  if (!thresholds || typeof thresholds !== 'object') return [];
  const rows = [];
  for (const [metricName, exprList] of Object.entries(thresholds)) {
    const values = getMetricValues(metrics, metricName);
    const list = Array.isArray(exprList) ? exprList : [];
    list.forEach((expr) => {
      const res = evalThresholdExpr(values, expr);
      if (!res) {
        rows.push({ metric: metricName, expr: String(expr || ''), pass: null, actual: null });
        return;
      }
      rows.push({ metric: metricName, expr: res.expr, pass: res.pass, actual: res.actual });
    });
  }
  return rows;
};

const buildSanityReport = (summary, plan) => {
  const metrics = summary && summary.metrics ? summary.metrics : {};

  const httpReqs = getMetricValues(metrics, 'http_reqs') || {};
  const duration = getMetricValues(metrics, 'http_req_duration') || {};
  const httpFailed = getMetricValues(metrics, 'http_req_failed') || {};

  const totalRequests = Math.round(toNumber(httpReqs.count) ?? 0);
  const peakRps = Math.round(toNumber(httpReqs.rate) ?? 0);
  const avgLatency = Math.round(toNumber(duration.avg) ?? 0);
  const p95Latency = Math.round(toNumber(duration['p(95)']) ?? avgLatency ?? 0);

  const failedRate = computeFailedRate(httpFailed) ?? 0;
  const successRate = Math.max(0, Math.min(100, (1 - failedRate) * 100));

  const thresholdRows = evaluateThresholds(metrics, plan && plan.thresholds);
  const thresholdFails = thresholdRows.filter((r) => r.pass === false).length;

  const baseHealth = Math.round(successRate);
  const healthScore = Math.max(0, Math.min(100, baseHealth - thresholdFails * 5));

  return {
    timestamp: Date.now(),
    projectName: (plan && plan.projectName) || 'K6 Plan',
    healthScore,
    kpis: {
      totalRequests,
      avgLatency: p95Latency,
      failedRequests: Math.round((toNumber(httpFailed.fails) ?? 0)),
      successRate: Number(successRate.toFixed(2)),
      peakRps,
    },
    endpointAnalysis: extractEndpointAnalysis(metrics),
    thresholds: thresholdRows,
    meta: {
      baseUrl: plan && plan.baseUrl,
      scenario: plan && plan.scenario,
      authMode: plan && plan.auth ? plan.auth.mode : 'none',
    },
  };
};

module.exports = { buildSanityReport };

