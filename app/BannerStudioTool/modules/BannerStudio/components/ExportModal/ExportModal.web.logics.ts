import { useState, useCallback } from 'react';
import JSZip from 'jszip';
import html2canvas from 'html2canvas';
import { StudioProject } from '../../types/types';
import {
    buildDashboardBannerContractFromProject,
    type DashboardBannerContractPayload,
    type ExtractedAsset,
} from '../../types/dashboardBannerContract';

type ExportView = 'menu' | 'player' | 'mosaic' | 'separate';
type ExportStep = 'config' | 'exporting' | 'complete' | 'error';

type SeparateExportAsset = ExtractedAsset & {
    defaultName: string;
    finalName: string;
};

type SeparateExportDraft = {
    payload: DashboardBannerContractPayload;
    warnings: string[];
    assets: SeparateExportAsset[];
    configFilename: string;
};

interface ExportLogicArgs {
    project: StudioProject;
    onClose: () => void;
    onExport: (config: any) => void;
}

const sanitizeFilename = (value: string, fallback: string) => {
    const raw = String(value || '').trim().replace(/[\\/]+/g, '_');
    const cleaned = raw
        .replace(/[<>:"|?*\u0000-\u001f]+/g, '_')
        .replace(/\s+/g, ' ')
        .replace(/^\.+/, '')
        .trim();
    return cleaned || fallback;
};

const ensureExtension = (filename: string, fallbackExt: string) => {
    if (/\.[a-z0-9]{2,8}$/i.test(filename)) return filename;
    return `${filename}.${fallbackExt.replace(/^\./, '') || 'png'}`;
};

const getExtension = (filename: string, fallback = 'png') => {
    const match = filename.match(/\.([a-z0-9]{2,8})$/i);
    return (match?.[1] || fallback).toLowerCase();
};

const mimeFromFilename = (filename: string, fallback?: string) => {
    if (fallback) return fallback;
    const ext = getExtension(filename);
    if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
    if (ext === 'webp') return 'image/webp';
    if (ext === 'gif') return 'image/gif';
    if (ext === 'svg') return 'image/svg+xml';
    if (ext === 'avif') return 'image/avif';
    return 'image/png';
};

const uniqueFilename = (filename: string, used: Set<string>) => {
    const ext = filename.match(/(\.[a-z0-9]{2,8})$/i)?.[1] || '';
    const base = ext ? filename.slice(0, -ext.length) : filename;
    let candidate = filename;
    let index = 2;
    while (used.has(candidate.toLowerCase())) {
        candidate = `${base}_${index}${ext}`;
        index += 1;
    }
    used.add(candidate.toLowerCase());
    return candidate;
};

const finalizeAssets = (assets: SeparateExportAsset[]) => {
    const used = new Set<string>();
    return assets.map((asset) => {
        const fallbackExt = getExtension(asset.defaultName);
        const safeName = ensureExtension(sanitizeFilename(asset.finalName, asset.defaultName), fallbackExt);
        return {
            ...asset,
            finalName: uniqueFilename(safeName, used),
        };
    });
};

const base64ToBlob = (base64: string, mime: string) => {
    const binary = window.atob(base64);
    const chunks: Uint8Array[] = [];
    for (let offset = 0; offset < binary.length; offset += 1024) {
        const slice = binary.slice(offset, offset + 1024);
        const bytes = new Uint8Array(slice.length);
        for (let i = 0; i < slice.length; i += 1) {
            bytes[i] = slice.charCodeAt(i);
        }
        chunks.push(bytes);
    }
    return new Blob(chunks, { type: mime });
};

const remapPayloadAssetRefs = (
    payload: DashboardBannerContractPayload,
    assets: SeparateExportAsset[]
): DashboardBannerContractPayload => {
    const replacements = assets.map((asset) => ({
        from: `/banner/assets/${asset.defaultName}`,
        to: `/banner/assets/${encodeURIComponent(asset.finalName)}`,
    }));

    const walk = (value: any): any => {
        if (typeof value === 'string') {
            return replacements.reduce((current, replacement) => (
                current.split(replacement.from).join(replacement.to)
            ), value);
        }
        if (Array.isArray(value)) return value.map(walk);
        if (value && typeof value === 'object') {
            return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, walk(child)]));
        }
        return value;
    };

    return walk(payload);
};

const createSeparateExportDraft = (project: StudioProject): SeparateExportDraft => {
    const { payload, assets, warnings } = buildDashboardBannerContractFromProject(project, { externalizeAssets: true });
    return {
        payload,
        warnings,
        assets: assets.map((asset) => ({
            ...asset,
            defaultName: asset.filename,
            finalName: asset.filename,
        })),
        configFilename: 'dashboard-banner.json',
    };
};

const saveBlobWithFilePicker = async (
    blob: Blob,
    suggestedName: string,
    types: any[],
    fallbackDownload: (blob: Blob, filename: string) => void
) => {
    const showSaveFilePicker = (window as any).showSaveFilePicker;
    if (typeof showSaveFilePicker !== 'function') {
        fallbackDownload(blob, suggestedName);
        return suggestedName;
    }

    const fileHandle = await showSaveFilePicker({
        suggestedName,
        types,
        excludeAcceptAllOption: false,
    });
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
    return String(fileHandle.name || suggestedName);
};

/**
 * Web-specific Logic for ExportModal.
 * Handles ZIP bundles, VPRJ project files, and Canvas snapshots via html2canvas.
 */
export const useExportModalLogic = ({ project, onClose, onExport }: ExportLogicArgs) => {
    const [view, setView] = useState<ExportView>('menu');
    const [exportStep, setExportStep] = useState<ExportStep>('config');
    const [progress, setProgress] = useState(0);
    const [activeBannerId, setActiveBannerId] = useState(project.activeBannerId || project.banners[0].id);
    const [separateExport, setSeparateExport] = useState<SeparateExportDraft | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    const downloadBlob = useCallback((blob: Blob, filename: string) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
    }, []);

    const handleStartZipExport = useCallback(async () => {
        setExportStep('exporting');
        setProgress(10);
        try {
            const zip = new JSZip();
            const assetsFolder = zip.folder("assets");
            setProgress(20);

            const { payload: masterPayload, assets, warnings } = buildDashboardBannerContractFromProject(project, { externalizeAssets: true });
            assets.forEach((asset) => {
                if (assetsFolder) assetsFolder.file(asset.filename, asset.base64, { base64: true });
            });

            setProgress(60);
            zip.file("dashboard-banner.json", JSON.stringify(masterPayload, null, 2));
            zip.file("project.vprj", JSON.stringify(project, null, 2));
            if (warnings.length) {
                zip.file("WARNINGS.txt", warnings.join('\n'));
            }

            setProgress(90);
            const content = await zip.generateAsync({ type: "blob" });
            downloadBlob(content, `${project.name.replace(/\s+/g, '_').toLowerCase()}_v8_bundle.zip`);

            setProgress(100);
            setExportStep('complete');
        } catch (err) {
            console.error(err);
            setExportStep('error');
        }
    }, [project, downloadBlob]);

    const handleStartVprjExport = useCallback(() => {
        const data = JSON.stringify(project, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        downloadBlob(blob, `${project.name.replace(/\s+/g, '_').toLowerCase()}.vprj`);
        setExportStep('complete');
    }, [project, downloadBlob]);

    const handleStartJsonExport = useCallback(() => {
        const { payload, warnings } = buildDashboardBannerContractFromProject(project, { externalizeAssets: false });
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        downloadBlob(blob, `dashboard-banner.json`);
        if (warnings.length) {
            console.warn('[BannerStudio] Export warnings:\n' + warnings.join('\n'));
        }
        setExportStep('complete');
    }, [project, downloadBlob]);

    const handlePrepareSeparateExport = useCallback(() => {
        setSeparateExport(createSeparateExportDraft(project));
        setErrorMessage('');
        setExportStep('config');
        setView('separate');
    }, [project]);

    const updateSeparateAssetName = useCallback((index: number, finalName: string) => {
        setSeparateExport((current) => {
            if (!current) return current;
            return {
                ...current,
                assets: current.assets.map((asset, assetIndex) => (
                    assetIndex === index ? { ...asset, finalName } : asset
                )),
            };
        });
    }, []);

    const updateSeparateConfigFilename = useCallback((configFilename: string) => {
        setSeparateExport((current) => current ? { ...current, configFilename } : current);
    }, []);

    const handleStartSeparateExport = useCallback(async () => {
        const exportDraft = separateExport || createSeparateExportDraft(project);

        setExportStep('exporting');
        setErrorMessage('');
        setProgress(8);

        try {
            const finalizedAssets = finalizeAssets(exportDraft.assets);
            const configName = ensureExtension(
                sanitizeFilename(exportDraft.configFilename, 'dashboard-banner.json'),
                'json'
            );
            const totalSteps = finalizedAssets.length + 1;
            let completedSteps = 0;
            const savedAssets: SeparateExportAsset[] = [];

            const bumpProgress = () => {
                completedSteps += 1;
                setProgress(Math.min(95, Math.round(8 + (completedSteps / totalSteps) * 86)));
            };

            for (const asset of finalizedAssets) {
                const assetMime = mimeFromFilename(asset.finalName, asset.mime);
                const assetExt = getExtension(asset.finalName);
                const blob = base64ToBlob(asset.base64, assetMime);
                const savedName = await saveBlobWithFilePicker(
                    blob,
                    asset.finalName,
                    [{
                        description: 'Recurso visual',
                        accept: { [assetMime]: [`.${assetExt}`] },
                    }],
                    downloadBlob
                );
                savedAssets.push({ ...asset, finalName: savedName });
                bumpProgress();
            }

            const payload = remapPayloadAssetRefs(exportDraft.payload, savedAssets);
            const configBlob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
            await saveBlobWithFilePicker(
                configBlob,
                configName,
                [{
                    description: 'Dashboard Banner JSON',
                    accept: { 'application/json': ['.json'] },
                }],
                downloadBlob
            );
            bumpProgress();

            if (exportDraft.warnings.length) {
                console.warn('[BannerStudio] Export warnings:\n' + exportDraft.warnings.join('\n'));
            }
            setProgress(100);
            setExportStep('complete');
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                setExportStep('config');
                return;
            }
            console.error(error);
            setErrorMessage(error instanceof Error ? error.message : 'No se pudo completar la exportacion separada.');
            setExportStep('error');
        }
    }, [downloadBlob, project, separateExport]);

    const handleRoleExport = useCallback(async (role: string) => {
        setExportStep('exporting');
        setProgress(20);
        try {
            const zip = new JSZip();
            const filteredBanners = (project.banners || [])
                .filter((b) => !b.visibilityRoles?.length || b.visibilityRoles.includes(role))
                .map((b) => ({
                    ...b,
                    layers: (b.layers || []).filter((l) => !l.visibilityRoles?.length || l.visibilityRoles.includes(role)),
                }));

            const filteredProject: StudioProject = {
                ...project,
                activeBannerId: filteredBanners.find((b) => b.id === project.activeBannerId)?.id || filteredBanners[0]?.id || project.activeBannerId,
                banners: filteredBanners.length ? filteredBanners : project.banners,
            };

            const { payload, assets, warnings } = buildDashboardBannerContractFromProject(filteredProject, { externalizeAssets: true });
            const assetsFolder = zip.folder("assets");
            assets.forEach((asset) => {
                if (assetsFolder) assetsFolder.file(asset.filename, asset.base64, { base64: true });
            });
            zip.file(`dashboard-banner.${role.toLowerCase()}.json`, JSON.stringify(payload, null, 2));
            if (warnings.length) zip.file(`WARNINGS.${role.toLowerCase()}.txt`, warnings.join('\n'));
            setProgress(70);
            const content = await zip.generateAsync({ type: "blob" });
            downloadBlob(content, `${project.name.replace(/\s+/g, '_').toLowerCase()}_${role.toLowerCase()}_bundle.zip`);
            setProgress(100);
            setExportStep('complete');
        } catch (e) {
            setExportStep('error');
        }
    }, [project, downloadBlob]);

    const handleLocalSave = useCallback(() => {
        onExport({ type: 'local', project });
        setExportStep('complete');
    }, [project, onExport]);

    const handleImageExport = useCallback(async (type: 'png' | 'jpg' | 'gif') => {
        setExportStep('exporting');
        setProgress(30);
        
        // Target can be the main canvas or the preview in the modal
        const element = document.getElementById('vianko-export-preview') || document.getElementById('vianko-canvas-root');
        
        if (element) {
            try {
                const canvas = await html2canvas(element as HTMLElement, { 
                    backgroundColor: null, 
                    useCORS: true, 
                    scale: 2 
                });
                setProgress(80);
                const dataUrl = canvas.toDataURL(`image/${type === 'jpg' ? 'jpeg' : type}`);
                const link = document.createElement('a');
                link.download = `${project.name.replace(/\s+/g, '_')}.${type}`;
                link.href = dataUrl;
                link.click();
                setProgress(100);
                setExportStep('complete');
            } catch (err) {
                console.error("Export Error:", err);
                setExportStep('error');
            }
        } else {
            setExportStep('error');
        }
    }, [project.name]);

    return {
        view, setView,
        exportStep, setExportStep,
        progress,
        activeBannerId, setActiveBannerId,
        handleStartZipExport,
        handleStartVprjExport,
        handleStartJsonExport,
        handlePrepareSeparateExport,
        handleStartSeparateExport,
        handleRoleExport,
        handleLocalSave,
        handleImageExport,
        separateExport,
        updateSeparateAssetName,
        updateSeparateConfigFilename,
        errorMessage,
    };
};
