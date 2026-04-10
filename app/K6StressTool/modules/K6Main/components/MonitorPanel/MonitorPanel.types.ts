export interface EndpointConfig {
    id: string;
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    token?: string;
    payloadText?: string;
    source?: 'manual' | 'k6-discovery';
    sourceKey?: string;
}

export interface MonitorResult {
    url: string;
    method: string;
    status: number;
    latency: number;
    ok: boolean;
    error: string | null;
}

export interface MonitorPanelSourceEndpoint {
    method?: string;
    route?: string;
    path?: string;
    url?: string;
    payload?: unknown;
    headers?: Record<string, string>;
}

export interface MonitorPanelProps {
    sourceEndpoints?: MonitorPanelSourceEndpoint[];
    baseUrl: string;
    authToken?: string;
    initialProjectName?: string;
}

export interface MonitorPanelLogicReturn {
    projectName: string;
    sharedBaseUrl: string;
    sharedToken: string;
    endpoints: EndpointConfig[];
    results: MonitorResult[] | null;
    isRunning: boolean;
    importedCount: number;
    handleProjectNameChange: (name: string) => void;
    handleSharedBaseUrlChange: (value: string) => void;
    handleSharedTokenChange: (value: string) => void;
    applySharedConfigToEndpoints: () => void;
    addEmptyEndpoint: () => void;
    updateEndpoint: (id: string, field: keyof EndpointConfig, value: string) => void;
    removeEndpoint: (id: string) => void;
    startMonitoring: () => Promise<void>;
    saveReport: () => Promise<void>;
}
