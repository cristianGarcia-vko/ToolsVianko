import { useState, useCallback, useMemo } from 'react';

/* ─── Types ───────────────────────────────────────────────────────────────── */

export type WizardStep = 'connection' | 'endpoints' | 'profile' | 'execute' | 'results';

export const WIZARD_STEPS: { key: WizardStep; label: string; icon: string }[] = [
    { key: 'connection', label: 'Conexión', icon: '🌐' },
    { key: 'endpoints', label: 'Endpoints', icon: '📡' },
    { key: 'profile', label: 'Perfil', icon: '⚡' },
    { key: 'execute', label: 'Ejecutar', icon: '🚀' },
    { key: 'results', label: 'Resultados', icon: '📊' },
];

export type WizardPresetId = 'smoke' | 'load' | 'stress' | 'soak';

export type WizardEndpoint = {
    method: string;
    path: string;
    enabled: boolean;
    group?: string;
    payload?: any;
    requiresAuth?: boolean;
};

export type WizardConnectionData = {
    protocol: string;
    host: string;
    port: string;
    authToken: string;
};

export type WizardProfileData = {
    preset: WizardPresetId;
    vus: number;
    duration: number; // seconds
};

export type WizardEnvImportInfo = {
    fileName: string;
    keysCount: number;
    appliedKeys: string[];
    detectedBaseUrl?: string;
    detectedTokenKey?: string;
};

const JWT_LIKE_REGEX = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
const URL_KEY_REGEX = /(base.?url|api.?url|backend.?url|server.?url|public.?url|origin|api.?base)/i;
const HOST_KEY_REGEX = /(api.?host|backend.?host|server.?host|host(name)?)/i;
const PORT_KEY_REGEX = /(api.?port|backend.?port|server.?port|port)/i;
const TOKEN_KEY_REGEX = /(bearer|jwt|token|auth)/i;

const cleanEnvValue = (raw: string) => {
    const trimmed = raw.trim();
    if (
        (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
        (trimmed.startsWith('`') && trimmed.endsWith('`'))
    ) {
        return trimmed.slice(1, -1).trim();
    }
    return trimmed;
};

const parseEnvFile = (text: string) => {
    const entries: Record<string, string> = {};
    const lines = text.split(/\r?\n/);

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;

        const normalizedLine = line.startsWith('export ') ? line.slice(7).trim() : line;
        const separatorIndex = normalizedLine.indexOf('=');
        if (separatorIndex <= 0) continue;

        const key = normalizedLine.slice(0, separatorIndex).trim();
        const value = cleanEnvValue(normalizedLine.slice(separatorIndex + 1));
        if (key) entries[key] = value;
    }

    return entries;
};

const stripBearerPrefix = (value: string) => value.replace(/^Bearer\s+/i, '').trim();

const findUrlCandidate = (entries: Record<string, string>) => {
    for (const [key, value] of Object.entries(entries)) {
        if (!value) continue;
        if (URL_KEY_REGEX.test(key) && /^https?:\/\//i.test(value)) {
            return { key, value };
        }
    }

    for (const [key, value] of Object.entries(entries)) {
        if (!value) continue;
        if (/^https?:\/\//i.test(value) && /(api|back|server|url|host)/i.test(key)) {
            return { key, value };
        }
    }

    return null;
};

const findTokenCandidate = (entries: Record<string, string>) => {
    const ranked = Object.entries(entries)
        .filter(([key, value]) => TOKEN_KEY_REGEX.test(key) && Boolean(value))
        .sort(([keyA, valueA], [keyB, valueB]) => {
            const score = (key: string, value: string) =>
                (/(bearer|jwt)/i.test(key) ? 4 : /(token|auth)/i.test(key) ? 2 : 0) +
                (/^Bearer\s+/i.test(value) ? 3 : JWT_LIKE_REGEX.test(stripBearerPrefix(value)) ? 2 : value.length > 24 ? 1 : 0);
            return score(keyB, valueB) - score(keyA, valueA);
        });

    if (!ranked.length) return null;
    const [key, value] = ranked[0];
    return { key, value: stripBearerPrefix(value) };
};

const inferConnectionFromEnv = (entries: Record<string, string>) => {
    const nextConnection: Partial<WizardConnectionData> = {};
    const appliedKeys: string[] = [];

    const urlCandidate = findUrlCandidate(entries);
    if (urlCandidate) {
        try {
            const parsed = new URL(urlCandidate.value);
            nextConnection.protocol = parsed.protocol === 'https:' ? 'https://' : 'http://';
            nextConnection.host = parsed.hostname;
            nextConnection.port = parsed.port || (parsed.protocol === 'https:' ? '443' : '80');
            appliedKeys.push(urlCandidate.key);
        } catch {
        }
    }

    if (!nextConnection.host) {
        const hostEntry = Object.entries(entries).find(([key, value]) => HOST_KEY_REGEX.test(key) && Boolean(value));
        if (hostEntry) {
            nextConnection.host = hostEntry[1]
                .replace(/^https?:\/\//i, '')
                .replace(/\/.*$/, '')
                .replace(/:\d+$/, '')
                .trim();
            appliedKeys.push(hostEntry[0]);
        }
    }

    if (!nextConnection.port) {
        const portEntry = Object.entries(entries).find(([key, value]) => PORT_KEY_REGEX.test(key) && /^\d{2,5}$/.test(value.trim()));
        if (portEntry) {
            nextConnection.port = portEntry[1].trim();
            appliedKeys.push(portEntry[0]);
        }
    }

    if (!nextConnection.protocol) {
        const httpsKey = Object.entries(entries).find(([key, value]) =>
            /(https|ssl|secure)/i.test(key) && /^(true|1|https)$/i.test(value)
        );
        nextConnection.protocol = httpsKey ? 'https://' : 'http://';
        if (httpsKey) appliedKeys.push(httpsKey[0]);
    }

    const tokenCandidate = findTokenCandidate(entries);
    if (tokenCandidate) {
        nextConnection.authToken = tokenCandidate.value;
        appliedKeys.push(tokenCandidate.key);
    }

    return {
        connection: nextConnection,
        info: {
            keysCount: Object.keys(entries).length,
            appliedKeys: Array.from(new Set(appliedKeys)),
            detectedBaseUrl:
                nextConnection.host
                    ? `${nextConnection.protocol || 'http://'}${nextConnection.host}${nextConnection.port ? `:${nextConnection.port}` : ''}`
                    : undefined,
            detectedTokenKey: tokenCandidate?.key,
        },
    };
};

/* ─── Hook ────────────────────────────────────────────────────────────────── */

export const useK6Wizard = () => {
    const [currentStep, setCurrentStep] = useState<WizardStep>('connection');
    const [connection, setConnection] = useState<WizardConnectionData>({
        protocol: 'http://',
        host: 'localhost',
        port: '3000',
        authToken: '',
    });
    const [endpoints, setEndpoints] = useState<WizardEndpoint[]>([]);
    const [manualEndpoint, setManualEndpoint] = useState({ method: 'GET', path: '' });
    const [profile, setProfile] = useState<WizardProfileData>({
        preset: 'smoke',
        vus: 3,
        duration: 30,
    });
    const [envFile, setEnvFile] = useState<File | null>(null);
    const [envImportInfo, setEnvImportInfo] = useState<WizardEnvImportInfo | null>(null);
    const [envImportError, setEnvImportError] = useState('');
    const [zipFile, setZipFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const stepIndex = useMemo(() => WIZARD_STEPS.findIndex(s => s.key === currentStep), [currentStep]);

    const baseUrl = useMemo(() => {
        return `${connection.protocol}${connection.host}${connection.port ? ':' + connection.port : ''}`;
    }, [connection]);

    // ─── Navigation ──────────────────────────────────────────────────
    const canGoNext = useMemo(() => {
        switch (currentStep) {
            case 'connection':
                return connection.host.trim().length > 0;
            case 'endpoints':
                return endpoints.filter(e => e.enabled).length > 0;
            case 'profile':
                return profile.vus >= 1 && profile.duration >= 5;
            case 'execute':
                return true; // always allowed — execute step
            case 'results':
                return false; // last step
        }
    }, [currentStep, connection, endpoints, profile]);

    const goNext = useCallback(() => {
        const idx = WIZARD_STEPS.findIndex(s => s.key === currentStep);
        if (idx < WIZARD_STEPS.length - 1) setCurrentStep(WIZARD_STEPS[idx + 1].key);
    }, [currentStep]);

    const goBack = useCallback(() => {
        const idx = WIZARD_STEPS.findIndex(s => s.key === currentStep);
        if (idx > 0) setCurrentStep(WIZARD_STEPS[idx - 1].key);
    }, [currentStep]);

    const goToStep = useCallback((step: WizardStep) => {
        setCurrentStep(step);
    }, []);

    // ─── Connection ──────────────────────────────────────────────────
    const updateConnection = useCallback((partial: Partial<WizardConnectionData>) => {
        setConnection(prev => ({ ...prev, ...partial }));
    }, []);

    const handleEnvFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setEnvFile(e.target.files[0]);
            setEnvImportError('');
        }
    }, []);

    const importEnvFile = useCallback(async () => {
        if (!envFile) return;
        setEnvImportError('');
        try {
            const text = await envFile.text();
            const entries = parseEnvFile(text);
            const { connection: inferredConnection, info } = inferConnectionFromEnv(entries);

            if (!inferredConnection.host && !inferredConnection.authToken && !inferredConnection.port) {
                setEnvImportError('No pude inferir host, puerto o token desde ese .env.');
                return;
            }

            setConnection(prev => ({
                ...prev,
                ...inferredConnection,
            }));

            setEnvImportInfo({
                fileName: envFile.name,
                keysCount: info.keysCount,
                appliedKeys: info.appliedKeys,
                detectedBaseUrl: info.detectedBaseUrl,
                detectedTokenKey: info.detectedTokenKey,
            });
        } catch {
            setEnvImportError('No pude leer ese archivo .env.');
        }
    }, [envFile]);

    // ─── Endpoints ───────────────────────────────────────────────────
    const addManualEndpoint = useCallback(() => {
        if (!manualEndpoint.path.trim()) return;
        const clean = manualEndpoint.path.startsWith('/') ? manualEndpoint.path : `/${manualEndpoint.path}`;
        setEndpoints(prev => [...prev, {
            method: manualEndpoint.method,
            path: clean.trim(),
            enabled: true,
            group: 'manual',
        }]);
        setManualEndpoint({ method: 'GET', path: '' });
    }, [manualEndpoint]);

    const toggleEndpoint = useCallback((index: number) => {
        setEndpoints(prev => prev.map((e, i) =>
            i === index ? { ...e, enabled: !e.enabled } : e
        ));
    }, []);

    const removeEndpoint = useCallback((index: number) => {
        setEndpoints(prev => prev.filter((_, i) => i !== index));
    }, []);

    const handleWizardZipUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setZipFile(e.target.files[0]);
        }
    }, []);

    const analyzeZip = useCallback(async () => {
        if (!zipFile) return;
        setIsAnalyzing(true);
        try {
            const formData = new FormData();
            formData.append('projectFile', zipFile);
            const res = await fetch('http://localhost:3001/api/analyze-zip', {
                method: 'POST', body: formData,
            });
            const data = await res.json();
            if (data.config && Array.isArray(data.config)) {
                const mapped: WizardEndpoint[] = data.config.map((ep: any) => ({
                    method: String(ep.method || 'GET').toUpperCase(),
                    path: String(ep.route || ep.path || '').trim(),
                    enabled: true,
                    group: 'zip',
                    payload: ep.payload || undefined,
                    requiresAuth: false,
                }));
                setEndpoints(prev => [...prev, ...mapped]);
            }
        } catch {
            // silently fail — toast can be triggered at component level
        } finally {
            setIsAnalyzing(false);
        }
    }, [zipFile]);

    // ─── Profile ─────────────────────────────────────────────────────
    const updateProfile = useCallback((partial: Partial<WizardProfileData>) => {
        setProfile(prev => ({ ...prev, ...partial }));
    }, []);

    const selectPreset = useCallback((preset: WizardPresetId) => {
        const configs: Record<WizardPresetId, { vus: number; duration: number }> = {
            smoke: { vus: 3, duration: 60 },
            load: { vus: 75, duration: 600 },
            stress: { vus: 300, duration: 600 },
            soak: { vus: 25, duration: 7200 },
        };
        setProfile({ preset, ...configs[preset] });
    }, []);

    // ─── Build plan JSON from wizard state ───────────────────────────
    const buildPlanFromWizard = useCallback((): any => {
        const enabledEndpoints = endpoints.filter(e => e.enabled);
        const scenario = profile.preset === 'stress' || profile.preset === 'load'
            ? {
                executor: 'ramping-vus',
                startVUs: 0,
                stages: [
                    { duration: `${Math.round(profile.duration * 0.25)}s`, target: profile.vus },
                    { duration: `${Math.round(profile.duration * 0.5)}s`, target: profile.vus },
                    { duration: `${Math.round(profile.duration * 0.25)}s`, target: 0 },
                ],
            }
            : { executor: 'constant-vus', vus: profile.vus, duration: `${profile.duration}s` };

        return {
            version: 'k6-plan-v1',
            projectName: `Wizard ${profile.preset.charAt(0).toUpperCase() + profile.preset.slice(1)} Test`,
            baseUrl,
            scenario,
            auth: connection.authToken
                ? { mode: 'staticToken', token: connection.authToken, headerName: 'Authorization', headerPrefix: 'Bearer ' }
                : { mode: 'none' },
            steps: enabledEndpoints.map(ep => ({
                id: `${ep.method}:${ep.path}`.toLowerCase().replace(/[^a-z0-9:/_-]+/g, '_'),
                name: `${ep.method} ${ep.path}`,
                method: ep.method,
                path: ep.path,
                enabled: true,
                group: ep.group || 'wizard',
                requiresAuth: Boolean(connection.authToken),
                payload: ep.payload,
            })),
            thresholds: {
                http_req_failed: ['rate<0.01'],
                http_req_duration: ['p(95)<800'],
            },
        };
    }, [endpoints, profile, baseUrl, connection.authToken]);

    // ─── Reset ───────────────────────────────────────────────────────
    const resetWizard = useCallback(() => {
        setCurrentStep('connection');
        setEndpoints([]);
        setProfile({ preset: 'smoke', vus: 3, duration: 30 });
        setEnvFile(null);
        setEnvImportInfo(null);
        setEnvImportError('');
    }, []);

    return {
        currentStep, stepIndex, canGoNext,
        goNext, goBack, goToStep,
        connection, updateConnection, baseUrl,
        envFile, envImportInfo, envImportError, handleEnvFileUpload, importEnvFile,
        endpoints, manualEndpoint, setManualEndpoint,
        addManualEndpoint, toggleEndpoint, removeEndpoint,
        zipFile, handleWizardZipUpload, analyzeZip, isAnalyzing,
        profile, updateProfile, selectPreset,
        buildPlanFromWizard, resetWizard,
    };
};
