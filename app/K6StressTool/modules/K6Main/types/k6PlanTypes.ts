export type K6PlanPresetId = 'smoke' | 'load' | 'stress' | 'soak' | 'custom';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type K6ScenarioConstant = {
  executor: 'constant-vus';
  vus: number;
  duration: string; // e.g. "30s", "1m", "4h"
};

export type K6ScenarioRamping = {
  executor: 'ramping-vus';
  startVUs?: number;
  stages: Array<{ duration: string; target: number }>;
};

export type K6Scenario = K6ScenarioConstant | K6ScenarioRamping;

export type K6AuthNone = { mode: 'none' };

export type K6AuthStaticToken = {
  mode: 'staticToken';
  token: string;
  headerName?: string; // default: Authorization
  headerPrefix?: string; // default: Bearer
};

export type K6AuthLogin = {
  mode: 'login';
  login: {
    method: 'POST' | 'GET';
    path: string; // e.g. "/usuarios/login"
    payload?: Record<string, unknown>;
    tokenPath: string; // e.g. "token" or "data.token"
  };
  headerName?: string; // default: Authorization
  headerPrefix?: string; // default: Bearer
};

export type K6Auth = K6AuthNone | K6AuthStaticToken | K6AuthLogin;

export type K6SeedRequest = {
  name: string;
  method: HttpMethod;
  path: string;
  pickPath: string; // e.g. "0.id" or "data.0.id"
  saveAs: string; // context key, e.g. "viaId"
  requiresAuth?: boolean;
};

export type K6StepExtract = {
  pickPath: string;
  saveAs: string;
};

export type K6PlanStep = {
  id: string;
  name: string;
  method: HttpMethod;
  path: string;
  enabled: boolean;
  group?: string; // used to tag metrics: group:<group>
  requiresAuth?: boolean;
  payload?: unknown; // json body for POST/PUT/PATCH
  extract?: K6StepExtract; // extract a value from response json into context
};

export type K6Thresholds = Record<string, string[]>;

export type K6PlanConfigV1 = {
  version: 'k6-plan-v1';
  projectName: string;
  baseUrl: string;
  scenario: K6Scenario;
  auth?: K6Auth;
  seed?: K6SeedRequest[];
  steps: K6PlanStep[];
  thresholds?: K6Thresholds;
};

export type K6PlanConfig = K6PlanConfigV1;

