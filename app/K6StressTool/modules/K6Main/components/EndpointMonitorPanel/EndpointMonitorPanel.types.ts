export type EndpointMonitorMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type EndpointMonitorStatus = 'pending' | 'ok' | 'error';

export type EndpointMonitorHeaders = Record<string, string>;

export type EndpointMonitorSourceEndpoint = {
  method?: string;
  route?: string;
  path?: string;
  url?: string;
  headers?: Record<string, string>;
  payload?: unknown;
};

export type EndpointMonitorDraft = {
  url: string;
  method: EndpointMonitorMethod;
  headersText: string;
  payloadText: string;
  maxTime: number;
  intervalSeconds: number;
};

export type EndpointMonitorItem = {
  id: string;
  url: string;
  method: EndpointMonitorMethod;
  headers: EndpointMonitorHeaders;
  payload?: unknown;
  maxTime: number;
  intervalMs: number;
  source: 'manual' | 'k6-discovery';
  lastCheckLabel: string;
  latencyMs: number | null;
  status: EndpointMonitorStatus;
};

export type EndpointMonitorAlert = {
  id: string;
  endpointId: string;
  message: string;
  createdAt: number;
};

export type EndpointMonitorImportCandidate = {
  id: string;
  label: string;
  url: string;
  method: EndpointMonitorMethod;
  headers: EndpointMonitorHeaders;
  payload?: unknown;
  sourceKey: string;
};
