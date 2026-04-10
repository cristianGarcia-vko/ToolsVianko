import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  "thresholds": {
    "http_req_failed": [
      "rate<0.01"
    ],
    "http_req_duration": [
      "p(95)<500"
    ],
    "http_req_duration{group:transacciones}": [
      "p(95)<800"
    ]
  },
  "summaryTrendStats": [
    "avg",
    "min",
    "med",
    "max",
    "p(90)",
    "p(95)",
    "p(99)"
  ],
  "scenarios": {
    "default": {
      "executor": "ramping-vus",
      "startVUs": 0,
      "stages": [
        {
          "duration": "5m",
          "target": 75
        },
        {
          "duration": "10m",
          "target": 75
        },
        {
          "duration": "5m",
          "target": 0
        }
      ]
    }
  }
};

const BASE_URL = "http://localhost:8088/docs/referencia";
const AUTH = {"mode":"login","login":{"method":"POST","path":"/usuarios/login","payload":{"email":"user@example.com","password":"password"},"tokenPath":"token"},"headerName":"Authorization","headerPrefix":"Bearer "};
const SEED = [{"name":"Empresas","method":"GET","path":"/empresas/lite","pickPath":"0.id","saveAs":"empresaId","requiresAuth":true},{"name":"Localidades","method":"GET","path":"/localidades/lite","pickPath":"0.id","saveAs":"localidadId","requiresAuth":true},{"name":"Vías","method":"GET","path":"/vias/lite","pickPath":"0.id","saveAs":"viaId","requiresAuth":true}];
const STEPS = [{"id":"get:/empresas/lite","name":"GET /empresas/lite","method":"GET","path":"/empresas/lite","enabled":true,"group":"contexto","requiresAuth":true},{"id":"get:/localidades/lite","name":"GET /localidades/lite","method":"GET","path":"/localidades/lite","enabled":true,"group":"contexto","requiresAuth":true},{"id":"get:/vias/lite","name":"GET /vias/lite","method":"GET","path":"/vias/lite","enabled":true,"group":"contexto","requiresAuth":true},{"id":"get:/movimientos/pendientes","name":"GET /movimientos/pendientes","method":"GET","path":"/movimientos/pendientes","enabled":true,"group":"movimientos","requiresAuth":true},{"id":"get:/movimientos/buscar","name":"GET /movimientos/buscar","method":"GET","path":"/movimientos/buscar","enabled":true,"group":"movimientos","requiresAuth":true},{"id":"post:/secciones/secciones/via/:viaid/asignar","name":"POST asignar vía","method":"POST","path":"/secciones/secciones/via/:viaId/asignar","enabled":true,"group":"transacciones","requiresAuth":true,"payload":{}},{"id":"post:/secciones/secciones/via/:viaid/liberar","name":"POST liberar vía","method":"POST","path":"/secciones/secciones/via/:viaId/liberar","enabled":true,"group":"transacciones","requiresAuth":true,"payload":{}}];

const pickPath = (obj, path) => {
  if (!path) return undefined;
  const parts = String(path).split('.').map((p) => p.trim()).filter(Boolean);
  let cur = obj;
  for (const part of parts) {
    if (cur == null) return undefined;
    const isIndex = /^\d+$/.test(part);
    const key = isIndex ? Number(part) : part;
    cur = cur[key];
  }
  return cur;
};

const templateAny = (value, ctx) => {
  if (value == null) return value;
  if (typeof value === 'string') {
    return value.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_m, key) => {
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

const failWithResponseContext = (label, res, parseError) => {
  const body = typeof res.body === 'string' ? res.body.slice(0, 240) : '';
  const contentType = res && res.headers ? (res.headers['Content-Type'] || res.headers['content-type'] || 'unknown') : 'unknown';
  throw new Error(
    label +
    ' devolvio una respuesta no JSON o invalida. ' +
    'status=' + res.status +
    ' content-type=' + contentType +
    ' body-preview=' + JSON.stringify(body) +
    (parseError ? ' parse-error=' + String(parseError.message || parseError) : '')
  );
};

const parseJsonOrFail = (label, res) => {
  try {
    return res.json();
  } catch (error) {
    failWithResponseContext(label, res, error);
  }
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
    const json = parseJsonOrFail('AUTH login ' + loginUrl, res);
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
      const picked = pickPath(parseJsonOrFail('SEED ' + (s.name || s.saveAs || s.path) + ' ' + seedUrl, res), s.pickPath);
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
      const extracted = pickPath(parseJsonOrFail(tags.name + ' ' + url, res), step.extract.pickPath);
      if (extracted != null) ctx[step.extract.saveAs] = extracted;
    }
  }

  sleep(1);
}
