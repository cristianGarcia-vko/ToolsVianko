import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  "thresholds": {
    "http_req_failed": [
      "rate<0.01"
    ],
    "http_req_duration": [
      "p(95)<500"
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
  "vus": 3,
  "duration": "1m"
};

const BASE_URL = "http://localhost:3002";
const AUTH = {"mode":"none"};
const SEED = [];
const STEPS = [{"id":"get:/","name":"GET /","method":"GET","path":"/","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/health","name":"GET /health","method":"GET","path":"/health","enabled":true,"group":"smoke","requiresAuth":false},{"id":"get:/","name":"GET /","method":"GET","path":"/","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/usuario/:usuarioid","name":"GET /usuario/:usuarioId","method":"GET","path":"/usuario/:usuarioId","enabled":true,"group":"auto","requiresAuth":false},{"id":"post:/","name":"POST /","method":"POST","path":"/","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"delete:/:token","name":"DELETE /:token","method":"DELETE","path":"/:token","enabled":true,"group":"auto","requiresAuth":false},{"id":"delete:/usuario/:usuarioid","name":"DELETE /usuario/:usuarioId","method":"DELETE","path":"/usuario/:usuarioId","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/movimientos/excel","name":"GET /movimientos/excel","method":"GET","path":"/movimientos/excel","enabled":true,"group":"reporteria","requiresAuth":false},{"id":"get:/locomotoras/excel","name":"GET /locomotoras/excel","method":"GET","path":"/locomotoras/excel","enabled":true,"group":"reporteria","requiresAuth":false},{"id":"get:/empresas/excel","name":"GET /empresas/excel","method":"GET","path":"/empresas/excel","enabled":true,"group":"reporteria","requiresAuth":false},{"id":"get:/bonos/excel","name":"GET /bonos/excel","method":"GET","path":"/bonos/excel","enabled":true,"group":"reporteria","requiresAuth":false},{"id":"get:/movimientos/pdf","name":"GET /movimientos/pdf","method":"GET","path":"/movimientos/pdf","enabled":true,"group":"reporteria","requiresAuth":false},{"id":"get:/admin/pdf","name":"GET /admin/pdf","method":"GET","path":"/admin/pdf","enabled":true,"group":"reporteria","requiresAuth":false},{"id":"get:/locomotoras/pdf","name":"GET /locomotoras/pdf","method":"GET","path":"/locomotoras/pdf","enabled":true,"group":"reporteria","requiresAuth":false},{"id":"get:/empresas/pdf","name":"GET /empresas/pdf","method":"GET","path":"/empresas/pdf","enabled":true,"group":"reporteria","requiresAuth":false},{"id":"get:/bonos/pdf","name":"GET /bonos/pdf","method":"GET","path":"/bonos/pdf","enabled":true,"group":"reporteria","requiresAuth":false},{"id":"get:/ultima","name":"GET /ultima","method":"GET","path":"/ultima","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/","name":"GET /","method":"GET","path":"/","enabled":true,"group":"auto","requiresAuth":false},{"id":"post:/","name":"POST /","method":"POST","path":"/","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"put:/:id","name":"PUT /:id","method":"PUT","path":"/:id","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"get:/meta","name":"GET /meta","method":"GET","path":"/meta","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/","name":"GET /","method":"GET","path":"/","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/assets/banner-asset_svg","name":"GET /assets/banner-asset.svg","method":"GET","path":"/assets/banner-asset.svg","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/assets/:assetname","name":"GET /assets/:assetName","method":"GET","path":"/assets/:assetName","enabled":true,"group":"auto","requiresAuth":false},{"id":"post:/","name":"POST /","method":"POST","path":"/","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"get:/","name":"GET /","method":"GET","path":"/","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/lite","name":"GET /lite","method":"GET","path":"/lite","enabled":true,"group":"auto","requiresAuth":false},{"id":"put:/:id","name":"PUT /:id","method":"PUT","path":"/:id","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"delete:/:id","name":"DELETE /:id","method":"DELETE","path":"/:id","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/","name":"GET /","method":"GET","path":"/","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/imagen","name":"GET /imagen","method":"GET","path":"/imagen","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/imagen/:ruta_","name":"GET /imagen/:ruta(*)","method":"GET","path":"/imagen/:ruta(*)","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/:id/verificacion","name":"GET /:id/verificacion","method":"GET","path":"/:id/verificacion","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/:id","name":"GET /:id","method":"GET","path":"/:id","enabled":true,"group":"auto","requiresAuth":false},{"id":"post:/","name":"POST /","method":"POST","path":"/","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"put:/:id","name":"PUT /:id","method":"PUT","path":"/:id","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"delete:/:id","name":"DELETE /:id","method":"DELETE","path":"/:id","enabled":true,"group":"auto","requiresAuth":false},{"id":"post:/:id/cerrar","name":"POST /:id/cerrar","method":"POST","path":"/:id/cerrar","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"post:/:id/continuar","name":"POST /:id/continuar","method":"POST","path":"/:id/continuar","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"post:/cerrar-vencidos","name":"POST /cerrar-vencidos","method":"POST","path":"/cerrar-vencidos","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"post:/:id/resuelto","name":"POST /:id/resuelto","method":"POST","path":"/:id/resuelto","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"post:/","name":"POST /","method":"POST","path":"/","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"get:/","name":"GET /","method":"GET","path":"/","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/lite","name":"GET /lite","method":"GET","path":"/lite","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/buscar","name":"GET /buscar","method":"GET","path":"/buscar","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/:id","name":"GET /:id","method":"GET","path":"/:id","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/servicios/pendientes","name":"GET /servicios/pendientes","method":"GET","path":"/servicios/pendientes","enabled":true,"group":"auto","requiresAuth":false},{"id":"patch:/servicios/:id/estado","name":"PATCH /servicios/:id/estado","method":"PATCH","path":"/servicios/:id/estado","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"get:/","name":"GET /","method":"GET","path":"/","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/buscar","name":"GET /buscar","method":"GET","path":"/buscar","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/all","name":"GET /all","method":"GET","path":"/all","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/pendientes","name":"GET /pendientes","method":"GET","path":"/pendientes","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/empresa/:empresaid/pendientes","name":"GET /empresa/:empresaId/pendientes","method":"GET","path":"/empresa/:empresaId/pendientes","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/servicios/espera","name":"GET /servicios/espera","method":"GET","path":"/servicios/espera","enabled":true,"group":"auto","requiresAuth":false},{"id":"patch:/servicios/:id/solicitar","name":"PATCH /servicios/:id/solicitar","method":"PATCH","path":"/servicios/:id/solicitar","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"get:/empresa/:empresaid","name":"GET /empresa/:empresaId","method":"GET","path":"/empresa/:empresaId","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/empresa/:empresaid/localidad/:localidadid","name":"GET /empresa/:empresaId/localidad/:localidadId","method":"GET","path":"/empresa/:empresaId/localidad/:localidadId","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/empresa/:empresaid/localidad/:localidadid/pendientes","name":"GET /empresa/:empresaId/localidad/:localidadId/pendientes","method":"GET","path":"/empresa/:empresaId/localidad/:localidadId/pendientes","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/localidad/:localidadid/pendientes","name":"GET /localidad/:localidadId/pendientes","method":"GET","path":"/localidad/:localidadId/pendientes","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/localidad/:localidadid/all","name":"GET /localidad/:localidadId/all","method":"GET","path":"/localidad/:localidadId/all","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/localidad/:localidadid/empresa/:empresaid","name":"GET /localidad/:localidadId/empresa/:empresaId","method":"GET","path":"/localidad/:localidadId/empresa/:empresaId","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/ronda/:rondaid/info","name":"GET /ronda/:rondaId/info","method":"GET","path":"/ronda/:rondaId/info","enabled":true,"group":"auto","requiresAuth":false},{"id":"patch:/:id/cancelar","name":"PATCH /:id/cancelar","method":"PATCH","path":"/:id/cancelar","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"post:/","name":"POST /","method":"POST","path":"/","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"patch:/:id/prioridad","name":"PATCH /:id/prioridad","method":"PATCH","path":"/:id/prioridad","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"get:/:id/edicion","name":"GET /:id/edicion","method":"GET","path":"/:id/edicion","enabled":true,"group":"auto","requiresAuth":false},{"id":"delete:/:id","name":"DELETE /:id","method":"DELETE","path":"/:id","enabled":true,"group":"auto","requiresAuth":false},{"id":"patch:/:id/iniciar","name":"PATCH /:id/iniciar","method":"PATCH","path":"/:id/iniciar","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"patch:/:id/pausar","name":"PATCH /:id/pausar","method":"PATCH","path":"/:id/pausar","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"patch:/:id/reanudar","name":"PATCH /:id/reanudar","method":"PATCH","path":"/:id/reanudar","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"patch:/:id/edicion","name":"PATCH /:id/edicion","method":"PATCH","path":"/:id/edicion","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"patch:/:id/finalizar","name":"PATCH /:id/finalizar","method":"PATCH","path":"/:id/finalizar","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"post:/movimiento/:movimientoid","name":"POST /movimiento/:movimientoId","method":"POST","path":"/movimiento/:movimientoId","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"get:/","name":"GET /","method":"GET","path":"/","enabled":true,"group":"auto","requiresAuth":false},{"id":"delete:/:id","name":"DELETE /:id","method":"DELETE","path":"/:id","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/localidad/:localidadid","name":"GET /localidad/:localidadId","method":"GET","path":"/localidad/:localidadId","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/localidad/:localidadid/estado/:concluido","name":"GET /localidad/:localidadId/estado/:concluido","method":"GET","path":"/localidad/:localidadId/estado/:concluido","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/localidad/:localidadid/siguiente","name":"GET /localidad/:localidadId/siguiente","method":"GET","path":"/localidad/:localidadId/siguiente","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/localidad/:localidadid/siguiente-inteligente","name":"GET /localidad/:localidadId/siguiente-inteligente","method":"GET","path":"/localidad/:localidadId/siguiente-inteligente","enabled":true,"group":"auto","requiresAuth":false},{"id":"patch:/intercambiar-movimientos","name":"PATCH /intercambiar-movimientos","method":"PATCH","path":"/intercambiar-movimientos","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"patch:/:id/intercambiar-movimiento","name":"PATCH /:id/intercambiar-movimiento","method":"PATCH","path":"/:id/intercambiar-movimiento","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"get:/:id/info","name":"GET /:id/info","method":"GET","path":"/:id/info","enabled":true,"group":"auto","requiresAuth":false},{"id":"patch:/:id/concluir","name":"PATCH /:id/concluir","method":"PATCH","path":"/:id/concluir","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"post:/login","name":"POST /login","method":"POST","path":"/login","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"post:/","name":"POST /","method":"POST","path":"/","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"get:/","name":"GET /","method":"GET","path":"/","enabled":true,"group":"auto","requiresAuth":false},{"id":"put:/:id","name":"PUT /:id","method":"PUT","path":"/:id","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"get:/secciones","name":"GET /secciones","method":"GET","path":"/secciones","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/secciones/via/:viaid","name":"GET /secciones/via/:viaId","method":"GET","path":"/secciones/via/:viaId","enabled":true,"group":"auto","requiresAuth":false},{"id":"post:/secciones/via/:viaid","name":"POST /secciones/via/:viaId","method":"POST","path":"/secciones/via/:viaId","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"put:/secciones/:id","name":"PUT /secciones/:id","method":"PUT","path":"/secciones/:id","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"delete:/secciones/:id","name":"DELETE /secciones/:id","method":"DELETE","path":"/secciones/:id","enabled":true,"group":"auto","requiresAuth":false},{"id":"post:/secciones/via/:viaid/asignar","name":"POST /secciones/via/:viaId/asignar","method":"POST","path":"/secciones/via/:viaId/asignar","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"post:/secciones/via/:viaid/liberar","name":"POST /secciones/via/:viaId/liberar","method":"POST","path":"/secciones/via/:viaId/liberar","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"post:/secciones/via/:viaid/liberar-todas","name":"POST /secciones/via/:viaId/liberar-todas","method":"POST","path":"/secciones/via/:viaId/liberar-todas","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"get:/","name":"GET /","method":"GET","path":"/","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/lite","name":"GET /lite","method":"GET","path":"/lite","enabled":true,"group":"auto","requiresAuth":false},{"id":"post:/","name":"POST /","method":"POST","path":"/","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"get:/localidad/:localidadid","name":"GET /localidad/:localidadId","method":"GET","path":"/localidad/:localidadId","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/localidad/:localidadid/lite","name":"GET /localidad/:localidadId/lite","method":"GET","path":"/localidad/:localidadId/lite","enabled":true,"group":"auto","requiresAuth":false},{"id":"put:/:id","name":"PUT /:id","method":"PUT","path":"/:id","enabled":true,"group":"auto","requiresAuth":false,"payload":{"ejemplo":"reemplazar_con_datos_reales"}},{"id":"delete:/:id","name":"DELETE /:id","method":"DELETE","path":"/:id","enabled":true,"group":"auto","requiresAuth":false},{"id":"get:/","name":"GET /","method":"GET","path":"/","enabled":true,"group":"auto","requiresAuth":false}];

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
