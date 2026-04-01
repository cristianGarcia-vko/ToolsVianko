import { useRef, useCallback } from 'react';
import { BannerLayer, BannerDesign, BannerBackground } from '../../types/types';
import { readStylePxSafe } from './PropertiesPanel.logics';
import { optimizeImageFileToDataUrl } from '../../utils/optimizeImageDataUrl.web';

/**
 * Web-specific Logic for PropertiesPanel.
 * Orchestrates file uploads (FileReader API) and specific DOM refs.
 */
export const usePropertiesPanelWebLogic = ({
    selectedLayer,
    activeBanner,
    onUpdateLayer,
    onUpdateBanner,
}: {
    selectedLayer: BannerLayer | null;
    activeBanner: BannerDesign;
    onUpdateLayer: (id: string, updates: Partial<BannerLayer>) => void;
    onUpdateBanner: (id: string, updates: Partial<BannerDesign>) => void;
}) => {
    const fileRef = useRef<HTMLInputElement>(null);
    const bgFileRef = useRef<HTMLInputElement>(null);

    const updateLayerValue = useCallback((updates: Partial<BannerLayer>) => {
        if (!selectedLayer) return;
        onUpdateLayer(selectedLayer.id, updates);
    }, [selectedLayer, onUpdateLayer]);

    const updateLayerStyle = useCallback((updates: Partial<React.CSSProperties>) => {
        if (!selectedLayer) return;
        onUpdateLayer(selectedLayer.id, {
            styles: { ...selectedLayer.styles, ...updates }
        });
    }, [selectedLayer, onUpdateLayer]);

    const updateBannerBg = useCallback((updates: Partial<BannerBackground>) => {
        onUpdateBanner(activeBanner.id, {
            background: { ...activeBanner.background, ...updates }
        });
    }, [activeBanner, onUpdateBanner]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Async + optimized: reduce base64 payload size to keep the editor responsive
        void (async () => {
            try {
                const { dataUrl } = await optimizeImageFileToDataUrl(file, {
                    maxWidth: 1800,
                    maxHeight: 1800,
                    maxPixels: 2_600_000, // ~2.6MP
                    quality: 0.82,
                    sizeBypassBytes: 250_000,
                });
                updateLayerValue({ src: dataUrl });
            } catch {
                // Fallback to legacy behavior if optimize path fails
                const reader = new FileReader();
                reader.onload = (ev) => {
                    updateLayerValue({ src: ev.target?.result as string });
                };
                reader.readAsDataURL(file);
            }
        })();
    }, [updateLayerValue]);

    const handleBgFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        void (async () => {
            try {
                const { dataUrl } = await optimizeImageFileToDataUrl(file, {
                    maxWidth: 2600,
                    maxHeight: 2600,
                    maxPixels: 4_000_000, // ~4MP
                    quality: 0.82,
                    sizeBypassBytes: 300_000,
                });
                updateBannerBg({ image: dataUrl });
            } catch {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    updateBannerBg({ image: ev.target?.result as string });
                };
                reader.readAsDataURL(file);
            }
        })();
    }, [updateBannerBg]);

    return {
        fileRef,
        bgFileRef,
        updateLayerValue,
        updateLayerStyle,
        updateBannerBg,
        handleFileChange,
        handleBgFileChange,
        readStylePxSafe,
    };
};
