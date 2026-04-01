import type { K6PlanConfig, K6PlanPresetId, K6PlanStep } from '../types/k6PlanTypes';

const makeStepId = (method: string, path: string) =>
  `${method}:${path}`.toLowerCase().replace(/[^a-z0-9:/_-]+/g, '_');

const step = (input: Omit<K6PlanStep, 'id'>): K6PlanStep => ({
  ...input,
  id: makeStepId(input.method, input.path),
});

export const buildPresetPlan = (preset: Exclude<K6PlanPresetId, 'custom'>): K6PlanConfig => {
  const baseUrl = 'http://localhost:3000';

  if (preset === 'smoke') {
    return {
      version: 'k6-plan-v1',
      projectName: 'Smoke Plan',
      baseUrl,
      scenario: { executor: 'constant-vus', vus: 3, duration: '1m' },
      auth: { mode: 'none' },
      steps: [
        step({ name: 'GET /', method: 'GET', path: '/', enabled: true, group: 'smoke' }),
        step({ name: 'GET /health', method: 'GET', path: '/health', enabled: true, group: 'smoke' }),
        step({ name: 'GET /banner/meta', method: 'GET', path: '/banner/meta', enabled: true, group: 'smoke' }),
        step({
          name: 'POST /usuarios/login',
          method: 'POST',
          path: '/usuarios/login',
          enabled: true,
          group: 'smoke',
          payload: { email: 'user@example.com', password: 'password' },
        }),
      ],
      thresholds: {
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['p(95)<500'],
      },
    };
  }

  if (preset === 'load') {
    return {
      version: 'k6-plan-v1',
      projectName: 'Load Transactional Plan',
      baseUrl,
      scenario: {
        executor: 'ramping-vus',
        startVUs: 0,
        stages: [
          { duration: '5m', target: 75 },
          { duration: '10m', target: 75 },
          { duration: '5m', target: 0 },
        ],
      },
      auth: {
        mode: 'login',
        login: { method: 'POST', path: '/usuarios/login', payload: { email: 'user@example.com', password: 'password' }, tokenPath: 'token' },
        headerName: 'Authorization',
        headerPrefix: 'Bearer ',
      },
      seed: [
        { name: 'Empresas', method: 'GET', path: '/empresas/lite', pickPath: '0.id', saveAs: 'empresaId', requiresAuth: true },
        { name: 'Localidades', method: 'GET', path: '/localidades/lite', pickPath: '0.id', saveAs: 'localidadId', requiresAuth: true },
        { name: 'Vías', method: 'GET', path: '/vias/lite', pickPath: '0.id', saveAs: 'viaId', requiresAuth: true },
      ],
      steps: [
        step({ name: 'GET /empresas/lite', method: 'GET', path: '/empresas/lite', enabled: true, group: 'contexto', requiresAuth: true }),
        step({ name: 'GET /localidades/lite', method: 'GET', path: '/localidades/lite', enabled: true, group: 'contexto', requiresAuth: true }),
        step({ name: 'GET /vias/lite', method: 'GET', path: '/vias/lite', enabled: true, group: 'contexto', requiresAuth: true }),
        step({ name: 'GET /movimientos/pendientes', method: 'GET', path: '/movimientos/pendientes', enabled: true, group: 'movimientos', requiresAuth: true }),
        step({ name: 'GET /movimientos/buscar', method: 'GET', path: '/movimientos/buscar', enabled: true, group: 'movimientos', requiresAuth: true }),
        step({
          name: 'POST asignar vía',
          method: 'POST',
          path: '/secciones/secciones/via/:viaId/asignar',
          enabled: true,
          group: 'transacciones',
          requiresAuth: true,
          payload: {},
        }),
        step({
          name: 'POST liberar vía',
          method: 'POST',
          path: '/secciones/secciones/via/:viaId/liberar',
          enabled: true,
          group: 'transacciones',
          requiresAuth: true,
          payload: {},
        }),
      ],
      thresholds: {
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['p(95)<500'],
        'http_req_duration{group:transacciones}': ['p(95)<800'],
      },
    };
  }

  if (preset === 'stress') {
    return {
      version: 'k6-plan-v1',
      projectName: 'Stress Computational Plan',
      baseUrl,
      scenario: {
        executor: 'ramping-vus',
        startVUs: 0,
        stages: [
          { duration: '2m', target: 300 },
          { duration: '6m', target: 300 },
          { duration: '2m', target: 0 },
        ],
      },
      auth: {
        mode: 'login',
        login: { method: 'POST', path: '/usuarios/login', payload: { email: 'user@example.com', password: 'password' }, tokenPath: 'token' },
        headerName: 'Authorization',
        headerPrefix: 'Bearer ',
      },
      steps: [
        step({
          name: 'GET /reporteria/movimientos/pdf',
          method: 'GET',
          path: '/reporteria/movimientos/pdf',
          enabled: true,
          group: 'reporteria',
          requiresAuth: true,
        }),
        step({
          name: 'GET /reporterias/movimientos/excel',
          method: 'GET',
          path: '/reporterias/movimientos/excel',
          enabled: true,
          group: 'reporteria',
          requiresAuth: true,
        }),
        step({
          name: 'PATCH /rondas/intercambiar-movimientos',
          method: 'PATCH',
          path: '/rondas/intercambiar-movimientos',
          enabled: true,
          group: 'rondas',
          requiresAuth: true,
          payload: {},
        }),
        step({
          name: 'POST /rondas/movimiento/:movimientoId',
          method: 'POST',
          path: '/rondas/movimiento/:movimientoId',
          enabled: true,
          group: 'rondas',
          requiresAuth: true,
          payload: {},
        }),
      ],
      thresholds: {
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['p(95)<800'],
        'http_req_duration{group:reporteria}': ['p(95)<5000'],
      },
    };
  }

  // soak
  return {
    version: 'k6-plan-v1',
    projectName: 'Soak (Resistencia) Plan',
    baseUrl,
    scenario: { executor: 'constant-vus', vus: 25, duration: '4h' },
    auth: {
      mode: 'login',
      login: { method: 'POST', path: '/usuarios/login', payload: { email: 'user@example.com', password: 'password' }, tokenPath: 'token' },
      headerName: 'Authorization',
      headerPrefix: 'Bearer ',
    },
    seed: [
      { name: 'Empresas', method: 'GET', path: '/empresas/lite', pickPath: '0.id', saveAs: 'empresaId', requiresAuth: true },
      { name: 'Localidades', method: 'GET', path: '/localidades/lite', pickPath: '0.id', saveAs: 'localidadId', requiresAuth: true },
      { name: 'Vías', method: 'GET', path: '/vias/lite', pickPath: '0.id', saveAs: 'viaId', requiresAuth: true },
    ],
    steps: [
      step({
        name: 'POST /movimientos (crear)',
        method: 'POST',
        path: '/movimientos',
        enabled: true,
        group: 'soak',
        requiresAuth: true,
        payload: {
          empresaId: '{{empresaId}}',
          localidadId: '{{localidadId}}',
          viaId: '{{viaId}}',
        },
        extract: { pickPath: 'id', saveAs: 'id' },
      }),
      step({ name: 'PATCH iniciar', method: 'PATCH', path: '/movimientos/:id/iniciar', enabled: true, group: 'soak', requiresAuth: true, payload: {} }),
      step({ name: 'PATCH pausar', method: 'PATCH', path: '/movimientos/:id/pausar', enabled: true, group: 'soak', requiresAuth: true, payload: {} }),
      step({ name: 'PATCH reanudar', method: 'PATCH', path: '/movimientos/:id/reanudar', enabled: true, group: 'soak', requiresAuth: true, payload: {} }),
      step({ name: 'PATCH finalizar', method: 'PATCH', path: '/movimientos/:id/finalizar', enabled: true, group: 'soak', requiresAuth: true, payload: {} }),
    ],
    thresholds: {
      http_req_failed: ['rate<0.01'],
      http_req_duration: ['p(95)<800'],
    },
  };
};
