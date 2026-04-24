import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  buildFullEndpointUrl,
  getEndpointIdentity,
  stringifyJsonInput,
} from '../EndpointMonitorPanel/EndpointMonitorPanel.shared';
import type {
  EndpointConfig,
  MonitorPanelLogicReturn,
  MonitorPanelProps,
  MonitorPanelSourceEndpoint,
} from './MonitorPanel.types';

const EMPTY_ENDPOINT: Omit<EndpointConfig, 'id'> = {
  url: '',
  method: 'GET',
  token: '',
  payloadText: '',
  source: 'manual',
  sourceKey: '',
};

const API_BASE =
  process.env.EXPO_PUBLIC_K6_API_BASE_URL ||
  'http://localhost:4001';
const ALLOWED_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);

const createEndpoint = (overrides?: Partial<EndpointConfig>): EndpointConfig => ({
  id: crypto.randomUUID(),
  ...EMPTY_ENDPOINT,
  ...overrides,
});

const normalizeMethod = (value?: string): EndpointConfig['method'] => {
  const normalized = String(value || 'GET').toUpperCase() as EndpointConfig['method'];
  return ALLOWED_METHODS.has(normalized) ? normalized : 'GET';
};

const getTokenFromHeaders = (headers?: Record<string, string>) => {
  if (!headers) return '';
  const authHeader = headers.Authorization || headers.authorization;
  if (!authHeader) return '';
  return authHeader.replace(/^Bearer\s+/i, '').trim();
};

const translateSourceEndpoints = (
  sourceEndpoints: MonitorPanelSourceEndpoint[] | undefined,
  baseUrl: string,
  authToken?: string,
) => {
  const seen = new Set<string>();

  return (sourceEndpoints || []).reduce<EndpointConfig[]>((acc, endpoint) => {
    const method = normalizeMethod(endpoint.method);
    const url = buildFullEndpointUrl(baseUrl, endpoint.url || endpoint.route || endpoint.path || '');
    if (!url) return acc;

    const sourceKey = getEndpointIdentity(method, url);
    if (seen.has(sourceKey)) return acc;
    seen.add(sourceKey);

    const token = getTokenFromHeaders(endpoint.headers) || authToken || '';
    acc.push(
      createEndpoint({
        method,
        url,
        token,
        payloadText: stringifyJsonInput(endpoint.payload),
        source: 'k6-discovery',
        sourceKey,
      }),
    );

    return acc;
  }, []);
};

export const useMonitorPanelLogic = ({
  sourceEndpoints,
  baseUrl,
  authToken,
  initialProjectName,
}: MonitorPanelProps): MonitorPanelLogicReturn => {
  const [projectName, setProjectName] = useState(initialProjectName || '');
  const [sharedBaseUrl, setSharedBaseUrl] = useState(baseUrl || '');
  const [sharedToken, setSharedToken] = useState(authToken || '');
  const [endpoints, setEndpoints] = useState<EndpointConfig[]>([]);
  const [results, setResults] = useState<MonitorPanelLogicReturn['results']>(null);
  const [isRunning, setIsRunning] = useState(false);

  const translatedEndpoints = useMemo(
    () => translateSourceEndpoints(sourceEndpoints, sharedBaseUrl, sharedToken),
    [sharedBaseUrl, sharedToken, sourceEndpoints],
  );

  useEffect(() => {
    if (initialProjectName) {
      setProjectName((current) => current || initialProjectName);
    }
  }, [initialProjectName]);

  useEffect(() => {
    if (baseUrl) {
      setSharedBaseUrl((current) => current || baseUrl);
    }
  }, [baseUrl]);

  useEffect(() => {
    if (authToken) {
      setSharedToken((current) => current || authToken);
    }
  }, [authToken]);

  useEffect(() => {
    if (!translatedEndpoints.length) return;

    setEndpoints((previous) => {
      const existingKeys = new Set(previous.map((endpoint) => endpoint.sourceKey || getEndpointIdentity(endpoint.method, endpoint.url)));
      const pending = translatedEndpoints.filter((endpoint) => !existingKeys.has(endpoint.sourceKey || ''));
      return pending.length ? [...previous, ...pending] : previous;
    });
  }, [translatedEndpoints]);

  const handleProjectNameChange = useCallback((name: string) => {
    setProjectName(name);
  }, []);

  const handleSharedBaseUrlChange = useCallback((value: string) => {
    setSharedBaseUrl(value);
  }, []);

  const handleSharedTokenChange = useCallback((value: string) => {
    setSharedToken(value);
  }, []);

  const applySharedConfigToEndpoints = useCallback(() => {
    setEndpoints((previous) =>
      previous.map((endpoint) => ({
        ...endpoint,
        url: buildFullEndpointUrl(sharedBaseUrl, endpoint.url.trim()) || endpoint.url,
        token: sharedToken.trim() || endpoint.token || '',
      })),
    );
  }, [sharedBaseUrl, sharedToken]);

  const addEmptyEndpoint = useCallback(() => {
    setEndpoints((previous) => [...previous, createEndpoint()]);
  }, []);

  const updateEndpoint = useCallback((id: string, field: keyof EndpointConfig, value: string) => {
    setEndpoints((previous) =>
      previous.map((endpoint) =>
        endpoint.id === id
          ? {
              ...endpoint,
              [field]: field === 'method' ? normalizeMethod(value) : value,
            }
          : endpoint,
      ),
    );
  }, []);

  const removeEndpoint = useCallback((id: string) => {
    setEndpoints((previous) => previous.filter((endpoint) => endpoint.id !== id));
  }, []);

  const startMonitoring = useCallback(async () => {
    const validEndpoints = endpoints
      .map((endpoint) => {
        const resolvedUrl = buildFullEndpointUrl(sharedBaseUrl, endpoint.url.trim());
        return {
          ...endpoint,
          resolvedUrl,
          resolvedToken: endpoint.token?.trim() || sharedToken.trim() || undefined,
        };
      })
      .filter((endpoint) => endpoint.resolvedUrl.trim());

    if (validEndpoints.length === 0) {
      alert('Agrega al menos un endpoint');
      return;
    }

    setIsRunning(true);
    setResults(null);

    try {
      const response = await fetch(`${API_BASE}/api/monitor/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoints: validEndpoints.map((endpoint) => ({
            url: endpoint.resolvedUrl.trim(),
            method: endpoint.method,
            token: endpoint.resolvedToken,
            payload: endpoint.payloadText?.trim() ? JSON.parse(endpoint.payloadText) : undefined,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo ejecutar el monitoreo');
      }

      setResults(data.results || []);
    } catch (error) {
      console.error('Error al ejecutar monitoreo', error);
      alert(error instanceof Error ? error.message : 'No se pudo ejecutar el monitoreo');
    } finally {
      setIsRunning(false);
    }
  }, [endpoints, sharedBaseUrl, sharedToken]);

  const saveReport = useCallback(async () => {
    if (!projectName.trim()) {
      alert('Debes ingresar el nombre del proyecto');
      return;
    }

    if (!results) {
      alert('No hay resultados para guardar');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/monitor/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName: projectName.trim(), results }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo guardar el reporte');
      }
      alert(`Guardado: ${data.fileName}`);
    } catch (error) {
      console.error('Error al guardar', error);
      alert(error instanceof Error ? error.message : 'No se pudo guardar el reporte');
    }
  }, [projectName, results]);

  return {
    projectName,
    sharedBaseUrl,
    sharedToken,
    endpoints,
    results,
    isRunning,
    importedCount: translatedEndpoints.length,
    handleProjectNameChange,
    handleSharedBaseUrlChange,
    handleSharedTokenChange,
    applySharedConfigToEndpoints,
    addEmptyEndpoint,
    updateEndpoint,
    removeEndpoint,
    startMonitoring,
    saveReport,
  };
};
