import type {
  EndpointMonitorDraft,
  EndpointMonitorHeaders,
  EndpointMonitorImportCandidate,
  EndpointMonitorItem,
  EndpointMonitorMethod,
  EndpointMonitorSourceEndpoint,
} from './EndpointMonitorPanel.types';

export const DEFAULT_MONITOR_MAX_TIME = 1000;
export const DEFAULT_MONITOR_INTERVAL_SECONDS = 30;

const SUPPORTED_METHODS: EndpointMonitorMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const ensureMethod = (value?: string): EndpointMonitorMethod => {
  const normalized = String(value || 'GET').toUpperCase() as EndpointMonitorMethod;
  return SUPPORTED_METHODS.includes(normalized) ? normalized : 'GET';
};

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const normalizePath = (value: string) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '/';
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

export const buildFullEndpointUrl = (baseUrl: string, routeOrUrl: string) => {
  const routeValue = String(routeOrUrl || '').trim();
  if (!routeValue) return trimTrailingSlash(String(baseUrl || '').trim());
  if (/^https?:\/\//i.test(routeValue)) return trimTrailingSlash(routeValue);

  const cleanBaseUrl = trimTrailingSlash(String(baseUrl || '').trim());
  if (!cleanBaseUrl) return normalizePath(routeValue);

  return `${cleanBaseUrl}${normalizePath(routeValue)}`;
};

export const stringifyJsonInput = (value: unknown) => {
  if (value == null) return '';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '';
  }
};

export const parseJsonRecord = (value: string, fieldName: string): EndpointMonitorHeaders => {
  const raw = String(value || '').trim();
  if (!raw) return {};

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`${fieldName} debe ser un JSON valido.`);
  }

  if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
    throw new Error(`${fieldName} debe ser un objeto JSON.`);
  }

  return Object.entries(parsed as Record<string, unknown>).reduce<EndpointMonitorHeaders>((acc, [key, item]) => {
    acc[key] = typeof item === 'string' ? item : JSON.stringify(item);
    return acc;
  }, {});
};

export const parseJsonValue = (value: string, fieldName: string) => {
  const raw = String(value || '').trim();
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`${fieldName} debe ser un JSON valido.`);
  }
};

export const createDraftFromCandidate = (
  candidate?: EndpointMonitorImportCandidate,
): EndpointMonitorDraft => ({
  url: candidate?.url || '',
  method: candidate?.method || 'GET',
  headersText: stringifyJsonInput(candidate?.headers || {}),
  payloadText: stringifyJsonInput(candidate?.payload),
  maxTime: DEFAULT_MONITOR_MAX_TIME,
  intervalSeconds: DEFAULT_MONITOR_INTERVAL_SECONDS,
});

export const createMonitorItem = (
  draft: EndpointMonitorDraft,
  headers: EndpointMonitorHeaders,
  payload: unknown,
  source: EndpointMonitorItem['source'],
): EndpointMonitorItem => ({
  id: `endpoint-monitor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  url: String(draft.url || '').trim(),
  method: ensureMethod(draft.method),
  headers,
  payload,
  maxTime: Number(draft.maxTime) || DEFAULT_MONITOR_MAX_TIME,
  intervalMs: Math.max(1, Number(draft.intervalSeconds) || DEFAULT_MONITOR_INTERVAL_SECONDS) * 1000,
  source,
  lastCheckLabel: '-',
  latencyMs: null,
  status: 'pending',
});

export const getEndpointIdentity = (method: string, url: string) =>
  `${String(method || 'GET').toUpperCase()}::${String(url || '').trim().toLowerCase()}`;

export const translateDiscoveredEndpoints = (
  sourceEndpoints: EndpointMonitorSourceEndpoint[] | undefined,
  options: { baseUrl: string; authToken?: string },
): EndpointMonitorImportCandidate[] => {
  const identitySet = new Set<string>();

  return (sourceEndpoints || []).reduce<EndpointMonitorImportCandidate[]>((acc, endpoint, index) => {
    const method = ensureMethod(endpoint?.method);
    const routeOrUrl = endpoint?.url || endpoint?.route || endpoint?.path || '';
    const url = buildFullEndpointUrl(options.baseUrl, routeOrUrl);
    if (!url) return acc;

    const headers: EndpointMonitorHeaders = {
      ...(endpoint?.headers || {}),
    };

    if (options.authToken && !headers.Authorization) {
      headers.Authorization = `Bearer ${options.authToken}`;
    }

    const sourceKey = getEndpointIdentity(method, url);
    if (identitySet.has(sourceKey)) return acc;
    identitySet.add(sourceKey);

    acc.push({
      id: `candidate-${index}-${sourceKey}`,
      label: `${method} ${routeOrUrl || url}`,
      url,
      method,
      headers,
      payload: endpoint?.payload,
      sourceKey,
    });

    return acc;
  }, []);
};
