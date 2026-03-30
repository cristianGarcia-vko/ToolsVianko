const ALLOWED_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);

const normalizeBaseUrl = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const noTrailingSlash = raw.endsWith('/') ? raw.slice(0, -1) : raw;
  return noTrailingSlash;
};

const safeMethod = (method) => {
  const m = String(method || '').trim().toUpperCase();
  return ALLOWED_METHODS.has(m) ? m : null;
};

const sanitizeSteps = (steps) => {
  if (!Array.isArray(steps)) return [];
  return steps
    .map((s) => {
      const method = safeMethod(s.method);
      const path = String(s.path || '').trim();
      if (!method || !path) return null;
      return {
        id: String(s.id || `${method}:${path}`).trim(),
        name: String(s.name || `${method} ${path}`).trim(),
        method,
        path,
        enabled: Boolean(s.enabled ?? true),
        group: s.group ? String(s.group).trim() : undefined,
        requiresAuth: Boolean(s.requiresAuth),
        payload: s.payload ?? undefined,
        extract: s.extract && typeof s.extract === 'object'
          ? {
              pickPath: String(s.extract.pickPath || '').trim(),
              saveAs: String(s.extract.saveAs || '').trim(),
            }
          : undefined,
      };
    })
    .filter(Boolean);
};

const sanitizeSeed = (seed) => {
  if (!Array.isArray(seed)) return [];
  return seed
    .map((s) => {
      const method = safeMethod(s.method) || 'GET';
      const path = String(s.path || '').trim();
      const pickPath = String(s.pickPath || '').trim();
      const saveAs = String(s.saveAs || '').trim();
      if (!path || !pickPath || !saveAs) return null;
      return {
        name: String(s.name || saveAs).trim(),
        method,
        path,
        pickPath,
        saveAs,
        requiresAuth: Boolean(s.requiresAuth),
      };
    })
    .filter(Boolean);
};

const sanitizeThresholds = (thresholds) => {
  if (!thresholds || typeof thresholds !== 'object') return undefined;
  const out = {};
  for (const [k, v] of Object.entries(thresholds)) {
    if (!Array.isArray(v)) continue;
    const list = v.map((x) => String(x || '').trim()).filter(Boolean);
    if (!list.length) continue;
    out[String(k).trim()] = list;
  }
  return Object.keys(out).length ? out : undefined;
};

const sanitizeAuth = (auth) => {
  if (!auth || typeof auth !== 'object') return { mode: 'none' };
  const mode = String(auth.mode || 'none').trim();
  if (mode === 'staticToken') {
    return {
      mode: 'staticToken',
      token: String(auth.token || '').trim(),
      headerName: String(auth.headerName || 'Authorization'),
      headerPrefix: String(auth.headerPrefix || 'Bearer '),
    };
  }
  if (mode === 'login') {
    const login = auth.login && typeof auth.login === 'object' ? auth.login : {};
    return {
      mode: 'login',
      login: {
        method: String(login.method || 'POST').toUpperCase() === 'GET' ? 'GET' : 'POST',
        path: String(login.path || '/usuarios/login').trim(),
        payload: login.payload && typeof login.payload === 'object' ? login.payload : undefined,
        tokenPath: String(login.tokenPath || 'token').trim(),
      },
      headerName: String(auth.headerName || 'Authorization'),
      headerPrefix: String(auth.headerPrefix || 'Bearer '),
    };
  }
  return { mode: 'none' };
};

const sanitizeScenario = (scenario) => {
  if (!scenario || typeof scenario !== 'object') return { executor: 'constant-vus', vus: 1, duration: '10s' };
  const executor = String(scenario.executor || 'constant-vus').trim();
  if (executor === 'ramping-vus') {
    const stages = Array.isArray(scenario.stages) ? scenario.stages : [];
    const cleanStages = stages
      .map((s) => ({
        duration: String(s.duration || '').trim(),
        target: Number.isFinite(Number(s.target)) ? Number(s.target) : 0,
      }))
      .filter((s) => s.duration);
    return {
      executor: 'ramping-vus',
      startVUs: Number.isFinite(Number(scenario.startVUs)) ? Number(scenario.startVUs) : undefined,
      stages: cleanStages.length ? cleanStages : [{ duration: '10s', target: 1 }],
    };
  }
  return {
    executor: 'constant-vus',
    vus: Math.max(1, Math.round(Number(scenario.vus) || 1)),
    duration: String(scenario.duration || '10s').trim(),
  };
};

const sanitizePlan = (plan) => {
  const baseUrl = normalizeBaseUrl(plan.baseUrl);
  const steps = sanitizeSteps(plan.steps);
  return {
    version: String(plan.version || 'k6-plan-v1'),
    projectName: String(plan.projectName || 'K6 Plan').trim() || 'K6 Plan',
    baseUrl,
    scenario: sanitizeScenario(plan.scenario),
    auth: sanitizeAuth(plan.auth),
    seed: sanitizeSeed(plan.seed),
    steps,
    thresholds: sanitizeThresholds(plan.thresholds),
  };
};

const buildK6OptionsObject = (plan) => {
  const base = {
    thresholds: plan.thresholds || undefined,
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
  };

  if (plan.scenario.executor === 'ramping-vus') {
    return {
      ...base,
      ...(plan.scenario.startVUs != null ? { startVUs: plan.scenario.startVUs } : {}),
      stages: plan.scenario.stages,
    };
  }

  return {
    ...base,
    vus: plan.scenario.vus,
    duration: plan.scenario.duration,
  };
};

const buildScript = (rawPlan) => {
  const plan = sanitizePlan(rawPlan || {});
  if (!plan.baseUrl) throw new Error('baseUrl requerido');
  if (!plan.steps.length) throw new Error('steps requerido (al menos 1)');

  const options = buildK6OptionsObject(plan);
  const steps = plan.steps;

  const script = `
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = ${JSON.stringify(options, null, 2)};

const BASE_URL = ${JSON.stringify(plan.baseUrl)};
const AUTH = ${JSON.stringify(plan.auth)};
const SEED = ${JSON.stringify(plan.seed)};
const STEPS = ${JSON.stringify(steps)};

const pickPath = (obj, path) => {
  if (!path) return undefined;
  const parts = String(path).split('.').map((p) => p.trim()).filter(Boolean);
  let cur = obj;
  for (const part of parts) {
    if (cur == null) return undefined;
    const isIndex = /^\\d+$/.test(part);
    const key = isIndex ? Number(part) : part;
    cur = cur[key];
  }
  return cur;
};

const templateAny = (value, ctx) => {
  if (value == null) return value;
  if (typeof value === 'string') {
    return value.replace(/\\{\\{([a-zA-Z0-9_]+)\\}\\}/g, (_m, key) => {
      const v = ctx && ctx[key];
      return v == null ? _m : String(v);
    });
  }
  if (Array.isArray(value)) return value.map((v) => templateAny(v, ctx));
  if (typeof value === 'object') {
    const out = {};
    for (const k in value) out[k] = templateAny(value[k], ctx);
    return out;
  }
  return value;
};

const buildPath = (rawPath, ctx) => {
  const p = String(rawPath || '');
  return p.replace(/:([a-zA-Z0-9_]+)/g, (_m, key) => {
    const v = ctx && ctx[key];
    return encodeURIComponent(v == null ? '1' : String(v));
  });
};

const buildHeaders = (ctx, requiresAuth) => {
  const headers = { 'Content-Type': 'application/json' };
  if (!requiresAuth) return headers;

  if (AUTH && AUTH.mode === 'staticToken' && AUTH.token) {
    const name = AUTH.headerName || 'Authorization';
    const prefix = AUTH.headerPrefix || 'Bearer ';
    headers[name] = String(prefix || '') + String(AUTH.token);
    return headers;
  }

  const token = ctx && ctx.__token;
  if (AUTH && AUTH.mode === 'login' && token) {
    const name = AUTH.headerName || 'Authorization';
    const prefix = AUTH.headerPrefix || 'Bearer ';
    headers[name] = String(prefix || '') + String(token);
  }
  return headers;
};

const request = (method, url, payload, params) => {
  const m = String(method || 'GET').toUpperCase();
  if (m === 'GET') return http.get(url, params);
  if (m === 'DELETE') return http.del(url, payload ? JSON.stringify(payload) : null, params);
  const fn = http[m.toLowerCase()];
  return fn(url, payload ? JSON.stringify(payload) : null, params);
};

export function setup() {
  const ctx = {};

  if (AUTH && AUTH.mode === 'staticToken' && AUTH.token) {
    ctx.__token = AUTH.token;
  }

  if (AUTH && AUTH.mode === 'login' && AUTH.login && AUTH.login.path) {
    const loginUrl = BASE_URL + buildPath(AUTH.login.path, ctx);
    const loginPayload = AUTH.login.payload ? AUTH.login.payload : {};
    const headers = buildHeaders(ctx, false);
    const params = { headers, tags: { name: 'AUTH login', group: 'auth' } };
    const res = request(AUTH.login.method || 'POST', loginUrl, loginPayload, params);
    check(res, { 'AUTH login status 2xx': (r) => r.status >= 200 && r.status < 300 });
    const json = res.json();
    const token = pickPath(json, AUTH.login.tokenPath || 'token');
    if (token) ctx.__token = token;
  }

  if (Array.isArray(SEED) && SEED.length) {
    for (const s of SEED) {
      const seedUrl = BASE_URL + buildPath(s.path, ctx);
      const headers = buildHeaders(ctx, Boolean(s.requiresAuth));
      const params = { headers, tags: { name: 'SEED ' + (s.name || s.saveAs || s.path), group: 'seed' } };
      const res = request(s.method || 'GET', seedUrl, null, params);
      check(res, { ['SEED ' + (s.saveAs || s.path) + ' status 2xx']: (r) => r.status >= 200 && r.status < 300 });
      const picked = pickPath(res.json(), s.pickPath);
      if (picked != null) ctx[s.saveAs] = picked;
    }
  }

  return ctx;
}

export default function (data) {
  const ctx = Object.assign({}, data || {});

  for (const step of STEPS) {
    if (!step || !step.enabled) continue;
    const url = BASE_URL + buildPath(step.path, ctx);
    const tags = { name: step.name || (step.method + ' ' + step.path) };
    if (step.group) tags.group = step.group;

    const headers = buildHeaders(ctx, Boolean(step.requiresAuth));
    const params = { headers, tags };
    const payload = step.payload != null ? templateAny(step.payload, ctx) : null;

    const res = request(step.method, url, payload, params);
    check(res, { [tags.name + ' status 2xx']: (r) => r.status >= 200 && r.status < 300 });

    if (step.extract && step.extract.pickPath && step.extract.saveAs) {
      const extracted = pickPath(res.json(), step.extract.pickPath);
      if (extracted != null) ctx[step.extract.saveAs] = extracted;
    }
  }

  sleep(1);
}
`.trimStart();

  return { plan, script };
};

module.exports = { buildScript, sanitizePlan };

