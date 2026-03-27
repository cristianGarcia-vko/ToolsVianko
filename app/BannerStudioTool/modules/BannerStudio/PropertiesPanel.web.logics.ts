import { useRef, useCallback } from 'react';
import { BannerLayer, BannerDesign, BannerBackground } from './types';

/**
 * Safely reads a numeric px value from a CSS style property.
 * Handles strings like "120px", raw numbers, undefined, and NaN.
 */
export const readStylePxSafe = (value: unknown): number => {
    if (value == null) return 0;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    const parsed = parseFloat(String(value));
    return Number.isFinite(parsed) ? parsed : 0;
};

interface PropertiesPanelLogicProps {
    selectedLayer: BannerLayer | null;
    activeBanner: BannerDesign;
    onUpdateLayer: (id: string, updates: Partial<BannerLayer>) => void;
    onUpdateBanner: (id: string, updates: Partial<BannerDesign>) => void;
}

export const usePropertiesPanelLogic = ({
    selectedLayer,
    activeBanner,
    onUpdateLayer,
    onUpdateBanner,
}: PropertiesPanelLogicProps) => {
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
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                updateLayerValue({ src: ev.target?.result as string });
            };
            reader.readAsDataURL(file);
        }
    }, [updateLayerValue]);

    const handleBgFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                updateBannerBg({ image: ev.target?.result as string });
            };
            reader.readAsDataURL(file);
        }
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
