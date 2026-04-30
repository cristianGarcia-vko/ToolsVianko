import type { BannerBackground, BannerDesign, BannerLayer, LayerType, StudioProject } from '../types/types';
import type { ContractBanner, ContractLayer, DashboardBannerContractPayload } from '../types/dashboardBannerContract';
import { createProjectTemplate } from '../types/constants';

type ResourceEntry = {
    file: File;
    path: string;
};

export type ProjectImportResult = {
    project: StudioProject;
    configPath: string;
    hydratedAssets: number;
    missingAssets: string[];
    externalRefs: string[];
};

const SUPPORTED_LAYER_TYPES: LayerType[] = [
    'text',
    'image',
    'animated',
    'particles',
    'canvas',
    'lottie',
    'drawing',
    'shape',
    'group',
    'components',
    'background',
];

const ASSET_REF_EXT = /\.(png|jpe?g|webp|gif|svg|avif|json)(?:[?#].*)?$/i;
const CONFIG_REF_EXT = /\.(vprj|json)$/i;

const isRecord = (value: unknown): value is Record<string, any> =>
    Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const toSafeNumber = (value: unknown, fallback: number) => {
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const safeNameFromFile = (path: string) => {
    const name = path.split(/[\\/]/).pop() || 'Proyecto Importado';
    return name.replace(/\.(vprj|json)$/i, '').replace(/[_-]+/g, ' ').trim() || 'Proyecto Importado';
};

const normalizeRoleList = (value: unknown): string[] => {
    if (!Array.isArray(value)) return [];
    return Array.from(new Set(value.map((role) => String(role || '').trim().toUpperCase()).filter(Boolean)));
};

const normalizeLayerType = (value: unknown): LayerType => {
    const raw = String(value || '').trim().toLowerCase();
    if (raw === 'video') return 'animated';
    return SUPPORTED_LAYER_TYPES.includes(raw as LayerType) ? raw as LayerType : 'text';
};

const defaultLayerStyles = (type: LayerType, index: number): Record<string, any> => ({
    position: 'absolute',
    top: `${24 + index * 12}px`,
    left: `${24 + index * 12}px`,
    width: type === 'text' ? '240px' : '180px',
    height: type === 'text' ? '48px' : '120px',
});

const normalizeBackground = (raw: unknown): BannerBackground => {
    if (!isRecord(raw)) {
        return { type: 'color', color: '#111827', fit: 'cover', position: 'center' };
    }

    const type = String(raw.type || raw.bgType || 'color').trim().toLowerCase();
    if (type === 'image') {
        const image = typeof raw.image === 'string' ? raw.image : typeof raw.value === 'string' ? raw.value : '';
        return {
            type: 'image',
            image,
            color: typeof raw.color === 'string' ? raw.color : '#111827',
            fit: raw.fit || 'cover',
            position: typeof raw.position === 'string' ? raw.position : 'center',
        };
    }

    if (type === 'gradient') {
        const gradient = isRecord(raw.gradient) ? raw.gradient : {};
        return {
            type: 'gradient',
            gradient: {
                angle: toSafeNumber(gradient.angle, 90),
                c1: typeof gradient.c1 === 'string' ? gradient.c1 : '#1e293b',
                c2: typeof gradient.c2 === 'string' ? gradient.c2 : '#0f172a',
            },
            fit: 'cover',
            position: 'center',
        };
    }

    if (type === 'pattern') {
        return {
            type: 'pattern',
            color: typeof raw.color === 'string' ? raw.color : '#111827',
            pattern: ['dots', 'grid', 'waves', 'noise'].includes(String(raw.pattern)) ? raw.pattern : 'dots',
            scale: toSafeNumber(raw.scale, 18),
            opacity: toSafeNumber(raw.opacity, 0.15),
            fit: 'cover',
            position: 'center',
        };
    }

    return {
        type: 'color',
        color: typeof raw.color === 'string'
            ? raw.color
            : typeof raw.value === 'string'
                ? raw.value
                : '#111827',
        fit: 'cover',
        position: 'center',
    };
};

const normalizeLayer = (raw: unknown, index: number): BannerLayer => {
    const layer = isRecord(raw) ? raw : {};
    const type = normalizeLayerType(layer.type);
    const fallbackStyles = defaultLayerStyles(type, index);
    const styles = isRecord(layer.styles) ? { ...fallbackStyles, ...layer.styles } : fallbackStyles;
    const components = Array.isArray(layer.components)
        ? layer.components.map((child, childIndex) => normalizeLayer(child, childIndex))
        : undefined;

    return {
        ...layer,
        id: String(layer.id || `layer-import-${Date.now()}-${index}`),
        type,
        name: String(layer.name || `Capa ${index + 1}`),
        visible: typeof layer.visible === 'boolean' ? layer.visible : true,
        locked: typeof layer.locked === 'boolean' ? layer.locked : false,
        styles,
        visibilityRoles: normalizeRoleList(layer.visibilityRoles),
        ...(components ? { components } : {}),
    } as BannerLayer;
};

const normalizeBanner = (raw: unknown, index: number, fallbackName?: string): BannerDesign => {
    const banner = isRecord(raw) ? raw : {};
    const id = String(banner.id || `bnr-import-${Date.now()}-${index}`);
    const styles = isRecord(banner.styles) ? banner.styles : { borderRadius: '12px' };
    const layers = Array.isArray(banner.layers)
        ? banner.layers.map((layer, layerIndex) => normalizeLayer(layer, layerIndex))
        : [];

    return {
        ...banner,
        id,
        name: String(banner.name || fallbackName || `Banner Importado ${index + 1}`),
        designWidth: toSafeNumber(banner.designWidth, toSafeNumber(banner.width, 800)),
        designHeight: toSafeNumber(banner.designHeight, toSafeNumber(banner.height, 220)),
        background: normalizeBackground(banner.background),
        layers,
        visibilityRoles: normalizeRoleList(banner.visibilityRoles || banner.visibleFor),
        styles,
    } as BannerDesign;
};

const normalizeStudioProject = (raw: unknown, fallbackName: string): StudioProject => {
    const template = createProjectTemplate(`prj-import-${Date.now()}`);
    const source = isRecord(raw) ? raw : {};
    const rawBanners = Array.isArray(source.banners) && source.banners.length
        ? source.banners
        : isRecord(source.banner)
            ? [source.banner]
            : template.banners;
    const banners = rawBanners.map((banner, index) => normalizeBanner(banner, index));
    const desiredActiveId = String(source.activeBannerId || '').trim();
    const activeBannerId = banners.some((banner) => banner.id === desiredActiveId)
        ? desiredActiveId
        : banners[0].id;
    const settings = isRecord(source.settings) ? source.settings : {};

    return {
        ...template,
        ...source,
        id: String(source.id || template.id),
        version: String(source.version || template.version),
        name: String(source.name || fallbackName || template.name),
        banners,
        activeBannerId,
        settings: {
            ...template.settings,
            ...settings,
            globalWidth: toSafeNumber(settings.globalWidth, banners[0]?.designWidth || template.settings.globalWidth),
            globalHeight: toSafeNumber(settings.globalHeight, banners[0]?.designHeight || template.settings.globalHeight),
        },
        updatedAt: new Date().toISOString(),
    } as StudioProject;
};

const contractBackgroundToStudio = (raw: unknown): BannerBackground => {
    if (!isRecord(raw)) return { type: 'color', color: '#111827', fit: 'cover', position: 'center' };
    const kind = String(raw.bgType || raw.type || 'solid').trim().toLowerCase();
    const value = typeof raw.image === 'string' ? raw.image : typeof raw.value === 'string' ? raw.value : '';

    if (kind === 'image') {
        return {
            type: 'image',
            image: value,
            color: '#111827',
            fit: raw.fit || 'cover',
            position: typeof raw.position === 'string' ? raw.position : 'center',
        };
    }

    if (kind === 'gradient' && value.startsWith('linear-gradient')) {
        return {
            type: 'gradient',
            gradient: { angle: 90, c1: '#1e293b', c2: '#0f172a' },
            fit: 'cover',
            position: 'center',
        };
    }

    return {
        type: 'color',
        color: value || '#111827',
        fit: 'cover',
        position: 'center',
    };
};

const contractLayerToStudio = (raw: ContractLayer, index: number): BannerLayer => {
    const contractType = String(raw.type || 'text').trim().toLowerCase();
    const studioType = contractType === 'background' ? 'shape' : normalizeLayerType(contractType);
    const styles = isRecord(raw.styles) ? { ...raw.styles } : defaultLayerStyles(studioType, index);

    if (studioType === 'shape') {
        styles.backgroundColor = raw.value || styles.backgroundColor || '#ffffff';
        styles.width = styles.width || '100%';
        styles.height = styles.height || '100%';
        styles.top = styles.top || '0px';
        styles.left = styles.left || '0px';
    }

    return normalizeLayer({
        ...raw,
        type: studioType,
        name: raw.id || `Capa ${index + 1}`,
        visible: raw.visible ?? true,
        locked: false,
        styles,
    }, index);
};

const contractBannerToStudio = (raw: ContractBanner, index: number, fallbackName?: string): BannerDesign => {
    const layers = Array.isArray(raw.layers)
        ? raw.layers.map((layer, layerIndex) => contractLayerToStudio(layer, layerIndex))
        : [];

    return normalizeBanner({
        id: raw.id || `bnr-import-${Date.now()}-${index}`,
        name: fallbackName || raw.id || `Banner Importado ${index + 1}`,
        designWidth: raw.designWidth || 800,
        designHeight: raw.designHeight || Number(String(raw.height || '').replace(/[^\d.]/g, '')) || 220,
        actionUrl: raw.actionUrl,
        background: contractBackgroundToStudio(raw.background),
        styles: raw.styles,
        nativeStyles: raw.nativeStyles,
        visibilityRoles: raw.visibleFor,
        layers,
    }, index, fallbackName);
};

const contractToProject = (payload: DashboardBannerContractPayload, fallbackName: string): StudioProject => {
    const bannerItems = Array.isArray(payload.bannerItems) && payload.bannerItems.length
        ? payload.bannerItems.map((item, index) => ({
            banner: item.banner,
            name: item.name || item.id || `Banner Importado ${index + 1}`,
        }))
        : Array.isArray(payload.banners) && payload.banners.length
            ? payload.banners.map((banner, index) => ({
                banner,
                name: payload.availableBanners?.[index]?.name || banner.id || `Banner Importado ${index + 1}`,
            }))
            : isRecord(payload.banner)
                ? [{ banner: payload.banner as ContractBanner, name: (payload.banner as ContractBanner).id || 'Banner Importado' }]
                : [];

    const banners = bannerItems.map((item, index) => contractBannerToStudio(item.banner, index, item.name));
    const settings = payload.bannerTools || {};

    return normalizeStudioProject({
        id: `prj-import-${Date.now()}`,
        version: 'studio-v8',
        name: fallbackName,
        activeBannerId: payload.activeBannerId,
        settings: {
            mode: settings.mode || 'auto',
            transitionTime: Math.max(1, Math.round((settings.intervalMs || 6000) / 1000)),
            intervalMs: settings.intervalMs || 6000,
            autoplay: Boolean(settings.autoplay),
            loop: true,
            transition: settings.transition || 'fade',
            globalWidth: banners[0]?.designWidth || 800,
            globalHeight: banners[0]?.designHeight || 220,
        },
        banners,
    }, fallbackName);
};

const parseProjectConfig = async (entry: ResourceEntry): Promise<StudioProject> => {
    const raw = await entry.file.text();
    const parsed = JSON.parse(raw);
    const fallbackName = safeNameFromFile(entry.path);

    if (isRecord(parsed) && isRecord(parsed.payload)) {
        return normalizeStudioProject(parsed.payload, parsed.name || fallbackName);
    }

    if (isRecord(parsed) && Array.isArray(parsed.banners) && isRecord(parsed.settings)) {
        return normalizeStudioProject(parsed, fallbackName);
    }

    if (isRecord(parsed) && (Array.isArray(parsed.bannerItems) || Array.isArray(parsed.banners) || isRecord(parsed.banner))) {
        return contractToProject(parsed as DashboardBannerContractPayload, fallbackName);
    }

    throw new Error('El archivo seleccionado no parece ser un proyecto Vianko compatible.');
};

const isLocalAssetRef = (value: unknown) => {
    const raw = String(value || '').trim();
    if (!raw) return false;
    if (raw.startsWith('data:') || raw.startsWith('blob:')) return false;
    if (/^https?:\/\//i.test(raw)) return false;
    if (raw.startsWith('#') || raw.startsWith('linear-gradient') || raw.startsWith('radial-gradient')) return false;
    if (/^[a-zA-Z]:[\\/]/.test(raw)) return true;
    return raw.includes('/banner/assets/') || raw.includes('assets/') || ASSET_REF_EXT.test(raw);
};

const normalizedPath = (value: string) =>
    value.replace(/\\/g, '/').replace(/^\.\/+/, '').replace(/^\/+/, '').toLowerCase();

const basename = (value: string) => normalizedPath(value).split('/').pop() || '';

const assetCandidatesForRef = (ref: string) => {
    let clean = String(ref || '').trim().replace(/\\/g, '/');
    try {
        if (/^(file|https?):\/\//i.test(clean)) {
            clean = decodeURIComponent(new URL(clean).pathname || clean);
        }
    } catch {
        // Keep original path if URL parsing fails.
    }
    clean = clean.split(/[?#]/)[0];
    const normalized = normalizedPath(clean);
    const candidates = new Set<string>([normalized, basename(normalized)]);
    const assetsIndex = normalized.lastIndexOf('assets/');
    if (assetsIndex >= 0) {
        candidates.add(normalized.slice(assetsIndex));
    }
    const bannerAssetsIndex = normalized.lastIndexOf('banner/assets/');
    if (bannerAssetsIndex >= 0) {
        candidates.add(normalized.slice(bannerAssetsIndex + 'banner/'.length));
    }
    const fileOnly = basename(normalized);
    if (fileOnly) candidates.add(`assets/${fileOnly}`);
    return Array.from(candidates).filter(Boolean);
};

const buildResourceMap = (entries: ResourceEntry[]) => {
    const map = new Map<string, ResourceEntry>();
    entries.forEach((entry) => {
        const normalized = normalizedPath(entry.path || entry.file.name);
        const fileOnly = basename(entry.file.name);
        const keys = new Set<string>([normalized, fileOnly, `assets/${fileOnly}`]);
        const assetsIndex = normalized.lastIndexOf('assets/');
        if (assetsIndex >= 0) keys.add(normalized.slice(assetsIndex));
        keys.forEach((key) => {
            if (key && !map.has(key)) map.set(key, entry);
        });
    });
    return map;
};

const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(reader.error || new Error('No se pudo leer el recurso.'));
        reader.readAsDataURL(file);
    });

const hydrateProjectAssets = async (project: StudioProject, resources: ResourceEntry[]): Promise<ProjectImportResult> => {
    const resourceMap = buildResourceMap(resources);
    const missingAssets = new Set<string>();
    const externalRefs = new Set<string>();
    let hydratedAssets = 0;

    const hydrateValue = async (value: unknown) => {
        const raw = String(value || '').trim();
        if (!isLocalAssetRef(raw)) return value as string | undefined;
        externalRefs.add(raw);
        const match = assetCandidatesForRef(raw).map((key) => resourceMap.get(key)).find(Boolean);
        if (!match) {
            missingAssets.add(raw);
            return raw;
        }
        hydratedAssets += 1;
        return fileToDataUrl(match.file);
    };

    const hydrateLayer = async (layer: BannerLayer): Promise<BannerLayer> => {
        const next: BannerLayer = {
            ...layer,
            styles: isRecord(layer.styles) ? { ...layer.styles } : layer.styles,
        };

        if (isLocalAssetRef(next.src)) next.src = await hydrateValue(next.src);
        if (isLocalAssetRef(next.source)) next.source = await hydrateValue(next.source);
        if (isLocalAssetRef(next.value)) next.value = await hydrateValue(next.value);
        if (Array.isArray(next.components)) {
            next.components = await Promise.all(next.components.map(hydrateLayer));
        }
        return next;
    };

    const banners = await Promise.all(project.banners.map(async (banner) => {
        const background = { ...banner.background };
        if (isLocalAssetRef(background.image)) {
            background.image = await hydrateValue(background.image);
        }
        return {
            ...banner,
            background,
            layers: await Promise.all((banner.layers || []).map(hydrateLayer)),
        };
    }));

    return {
        project: { ...project, banners, updatedAt: new Date().toISOString() },
        configPath: '',
        hydratedAssets,
        missingAssets: Array.from(missingAssets),
        externalRefs: Array.from(externalRefs),
    };
};

export const importBannerProjectFromFile = async (
    configEntry: ResourceEntry,
    resources: ResourceEntry[] = []
): Promise<ProjectImportResult> => {
    const project = await parseProjectConfig(configEntry);
    const hydrated = await hydrateProjectAssets(project, resources);
    return { ...hydrated, configPath: configEntry.path };
};

const collectDirectoryEntries = async (directoryHandle: any, prefix = ''): Promise<ResourceEntry[]> => {
    const entries: ResourceEntry[] = [];
    for await (const [name, handle] of directoryHandle.entries()) {
        const path = prefix ? `${prefix}/${name}` : name;
        if (handle.kind === 'file') {
            entries.push({ file: await handle.getFile(), path });
        } else if (handle.kind === 'directory') {
            entries.push(...await collectDirectoryEntries(handle, path));
        }
    }
    return entries;
};

const pickDirectoryEntries = async (): Promise<ResourceEntry[]> => {
    const showDirectoryPicker = (window as any).showDirectoryPicker;
    if (typeof showDirectoryPicker === 'function') {
        const directoryHandle = await showDirectoryPicker({ mode: 'read' });
        return collectDirectoryEntries(directoryHandle);
    }

    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        (input as any).webkitdirectory = true;
        input.onchange = () => {
            const files = Array.from(input.files || []);
            input.remove();
            resolve(files.map((file) => ({
                file,
                path: (file as any).webkitRelativePath || file.name,
            })));
        };
        input.onerror = () => {
            input.remove();
            reject(new Error('No se pudo abrir la carpeta.'));
        };
        input.click();
    });
};

const pickConfigEntry = async (): Promise<ResourceEntry> => {
    const showOpenFilePicker = (window as any).showOpenFilePicker;
    if (typeof showOpenFilePicker === 'function') {
        const [handle] = await showOpenFilePicker({
            multiple: false,
            types: [{
                description: 'Vianko Banner Project',
                accept: {
                    'application/json': ['.vprj', '.json'],
                },
            }],
        });
        return { file: await handle.getFile(), path: handle.name };
    }

    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.vprj,.json,application/json';
        input.onchange = () => {
            const file = input.files?.[0];
            input.remove();
            if (!file) {
                reject(new DOMException('Importacion cancelada', 'AbortError'));
                return;
            }
            resolve({ file, path: file.name });
        };
        input.onerror = () => {
            input.remove();
            reject(new Error('No se pudo abrir el archivo de configuracion.'));
        };
        input.click();
    });
};

const getConfigCandidates = (entries: ResourceEntry[]) =>
    entries
        .filter((entry) => CONFIG_REF_EXT.test(entry.file.name))
        .filter((entry) => !/package-lock|package\.json|warnings/i.test(entry.file.name))
        .sort((a, b) => {
            const aScore = /\.vprj$/i.test(a.file.name) ? 0 : /dashboard-banner/i.test(a.file.name) ? 1 : 2;
            const bScore = /\.vprj$/i.test(b.file.name) ? 0 : /dashboard-banner/i.test(b.file.name) ? 1 : 2;
            return aScore - bScore || a.path.localeCompare(b.path);
        });

const chooseConfigCandidate = (candidates: ResourceEntry[]) => {
    if (candidates.length === 1) return candidates[0];
    const options = candidates.map((candidate, index) => `${index + 1}. ${candidate.path}`).join('\n');
    const selected = window.prompt(`Selecciona el archivo de configuracion a importar:\n\n${options}`, '1');
    const index = Math.max(0, Math.min(candidates.length - 1, Number(selected || 1) - 1));
    return candidates[index];
};

export const isProjectImportAbort = (error: unknown) =>
    error instanceof DOMException && error.name === 'AbortError';

export const pickAndImportBannerProject = async (): Promise<ProjectImportResult> => {
    const supportsFolderPicker = typeof (window as any).showDirectoryPicker === 'function' || 'webkitdirectory' in document.createElement('input');
    const useFolder = supportsFolderPicker
        ? window.confirm('Selecciona la carpeta del proyecto para importar automaticamente project.vprj/dashboard-banner.json y los recursos visuales. Presiona Cancelar para elegir solo el archivo de configuracion.')
        : false;

    if (useFolder) {
        const entries = await pickDirectoryEntries();
        const candidates = getConfigCandidates(entries);
        if (!candidates.length) {
            throw new Error('No se encontro ningun archivo .vprj o .json de configuracion en la carpeta seleccionada.');
        }
        const config = chooseConfigCandidate(candidates);
        return importBannerProjectFromFile(config, entries);
    }

    const config = await pickConfigEntry();
    const initialImport = await importBannerProjectFromFile(config, [config]);
    if (initialImport.missingAssets.length && supportsFolderPicker) {
        const shouldSelectAssets = window.confirm(`Se detectaron ${initialImport.missingAssets.length} recurso(s) externo(s). Selecciona la carpeta del proyecto o de assets para importarlos automaticamente.`);
        if (shouldSelectAssets) {
            const entries = await pickDirectoryEntries();
            return importBannerProjectFromFile(config, [config, ...entries]);
        }
    }
    return initialImport;
};
