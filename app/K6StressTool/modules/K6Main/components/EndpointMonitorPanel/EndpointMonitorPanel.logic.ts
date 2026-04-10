import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createDraftFromCandidate,
  createMonitorItem,
  getEndpointIdentity,
  parseJsonRecord,
  parseJsonValue,
  translateDiscoveredEndpoints,
} from './EndpointMonitorPanel.shared';
import type {
  EndpointMonitorAlert,
  EndpointMonitorDraft,
  EndpointMonitorImportCandidate,
  EndpointMonitorItem,
  EndpointMonitorSourceEndpoint,
} from './EndpointMonitorPanel.types';

type UseEndpointMonitorLogicParams = {
  sourceEndpoints?: EndpointMonitorSourceEndpoint[];
  baseUrl: string;
  authToken?: string;
};

export const useEndpointMonitorPanelLogic = ({
  sourceEndpoints,
  baseUrl,
  authToken,
}: UseEndpointMonitorLogicParams) => {
  const [draft, setDraft] = useState<EndpointMonitorDraft>(createDraftFromCandidate());
  const [items, setItems] = useState<EndpointMonitorItem[]>([]);
  const [alerts, setAlerts] = useState<EndpointMonitorAlert[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const timersRef = useRef<Record<string, number>>({});
  const pendingChecksRef = useRef<Record<string, boolean>>({});
  const itemsRef = useRef<EndpointMonitorItem[]>([]);

  const importCandidates = useMemo(
    () => translateDiscoveredEndpoints(sourceEndpoints, { baseUrl, authToken }),
    [authToken, baseUrl, sourceEndpoints],
  );

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    setDraft((current) => {
      if (current.url.trim()) return current;
      return createDraftFromCandidate(importCandidates[0]);
    });
  }, [importCandidates]);

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach((timerId) => window.clearInterval(timerId));
    };
  }, []);

  const pushAlert = (endpointId: string, message: string) => {
    setAlerts((current) => [
      {
        id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        endpointId,
        message,
        createdAt: Date.now(),
      },
      ...current,
    ]);
  };

  const updateItem = (endpointId: string, updater: (current: EndpointMonitorItem) => EndpointMonitorItem) => {
    setItems((current) => current.map((item) => (item.id === endpointId ? updater(item) : item)));
  };

  const checkEndpoint = async (endpointId: string) => {
    const endpoint = itemsRef.current.find((item) => item.id === endpointId);
    if (!endpoint || pendingChecksRef.current[endpointId]) return;

    pendingChecksRef.current[endpointId] = true;
    const start = performance.now();

    try {
      const headers = { ...endpoint.headers };
      const hasPayload = endpoint.payload !== undefined && endpoint.payload !== null;

      if (hasPayload && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers,
        cache: 'no-cache',
        body: hasPayload && endpoint.method !== 'GET' ? JSON.stringify(endpoint.payload) : undefined,
      });

      const latencyMs = Math.round(performance.now() - start);
      const isAnomaly = !response.ok || latencyMs > endpoint.maxTime;
      const lastCheckLabel = new Date().toLocaleTimeString();

      updateItem(endpointId, (current) => ({
        ...current,
        latencyMs,
        lastCheckLabel,
        status: isAnomaly ? 'error' : 'ok',
      }));

      if (isAnomaly) {
        const details = !response.ok
          ? `Codigo HTTP inesperado: ${response.status}`
          : `Latencia alta (${latencyMs}ms > ${endpoint.maxTime}ms permitidos)`;
        pushAlert(endpointId, `[${lastCheckLabel}] ALERTA ${endpoint.method} ${endpoint.url} - ${details}`);
      }
    } catch (error) {
      const lastCheckLabel = new Date().toLocaleTimeString();
      const message = error instanceof Error ? error.message : 'Error de conexion';

      updateItem(endpointId, (current) => ({
        ...current,
        latencyMs: null,
        lastCheckLabel,
        status: 'error',
      }));

      pushAlert(endpointId, `[${lastCheckLabel}] ALERTA ${endpoint.method} ${endpoint.url} - ${message}`);
    } finally {
      pendingChecksRef.current[endpointId] = false;
    }
  };

  const startMonitoring = (item: EndpointMonitorItem) => {
    checkEndpoint(item.id);
    timersRef.current[item.id] = window.setInterval(() => {
      checkEndpoint(item.id);
    }, item.intervalMs);
  };

  const stopMonitoring = (endpointId: string) => {
    const timerId = timersRef.current[endpointId];
    if (timerId) {
      window.clearInterval(timerId);
      delete timersRef.current[endpointId];
    }
    delete pendingChecksRef.current[endpointId];
  };

  const handleDraftChange = <K extends keyof EndpointMonitorDraft>(key: K, value: EndpointMonitorDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    if (formError) setFormError(null);
  };

  const addEndpointFromDraft = (source: EndpointMonitorItem['source']) => {
    try {
      const headers = parseJsonRecord(draft.headersText, 'Headers');
      const payload = parseJsonValue(draft.payloadText, 'Payload');
      if (!draft.url.trim()) {
        throw new Error('La URL del endpoint es obligatoria.');
      }

      const identity = getEndpointIdentity(draft.method, draft.url);
      const alreadyExists = itemsRef.current.some((item) => getEndpointIdentity(item.method, item.url) === identity);
      if (alreadyExists) {
        throw new Error('Ese endpoint ya esta en monitoreo.');
      }

      const nextItem = createMonitorItem(draft, headers, payload, source);
      itemsRef.current = [...itemsRef.current, nextItem];
      setItems((current) => [...current, nextItem]);
      startMonitoring(nextItem);
      setDraft(createDraftFromCandidate());
      setFormError(null);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo agregar el endpoint.');
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    addEndpointFromDraft('manual');
  };

  const removeEndpoint = (endpointId: string) => {
    stopMonitoring(endpointId);
    itemsRef.current = itemsRef.current.filter((item) => item.id !== endpointId);
    setItems((current) => current.filter((item) => item.id !== endpointId));
    setAlerts((current) => current.filter((alert) => alert.endpointId !== endpointId));
  };

  const applyCandidateToDraft = (candidate: EndpointMonitorImportCandidate) => {
    setDraft(createDraftFromCandidate(candidate));
    setFormError(null);
  };

  const importAllCandidates = () => {
    const pendingItems = importCandidates
      .filter((candidate) => !itemsRef.current.some((item) => getEndpointIdentity(item.method, item.url) === candidate.sourceKey))
      .map((candidate) =>
        createMonitorItem(
          createDraftFromCandidate(candidate),
          candidate.headers,
          candidate.payload,
          'k6-discovery',
        ),
      );

    if (!pendingItems.length) return;

    itemsRef.current = [...itemsRef.current, ...pendingItems];
    setItems((current) => [...current, ...pendingItems]);
    pendingItems.forEach(startMonitoring);
  };

  return {
    draft,
    items,
    alerts,
    formError,
    importCandidates,
    handleDraftChange,
    handleSubmit,
    removeEndpoint,
    applyCandidateToDraft,
    importAllCandidates,
  };
};
