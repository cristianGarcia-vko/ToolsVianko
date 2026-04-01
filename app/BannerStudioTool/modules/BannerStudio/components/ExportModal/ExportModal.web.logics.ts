import { useState, useCallback } from 'react';
import JSZip from 'jszip';
import html2canvas from 'html2canvas';
import { StudioProject } from '../../types/types';
import { buildDashboardBannerContractFromProject } from '../../types/dashboardBannerContract';

type ExportView = 'menu' | 'player' | 'mosaic';
type ExportStep = 'config' | 'exporting' | 'complete' | 'error';

interface ExportLogicArgs {
    project: StudioProject;
    onClose: () => void;
    onExport: (config: any) => void;
}

/**
 * Web-specific Logic for ExportModal.
 * Handles ZIP bundles, VPRJ project files, and Canvas snapshots via html2canvas.
 */
export const useExportModalLogic = ({ project, onClose, onExport }: ExportLogicArgs) => {
    const [view, setView] = useState<ExportView>('menu');
    const [exportStep, setExportStep] = useState<ExportStep>('config');
    const [progress, setProgress] = useState(0);
    const [activeBannerId, setActiveBannerId] = useState(project.activeBannerId || project.banners[0].id);

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
        handleRoleExport,
        handleLocalSave,
        handleImageExport,
    };
};
