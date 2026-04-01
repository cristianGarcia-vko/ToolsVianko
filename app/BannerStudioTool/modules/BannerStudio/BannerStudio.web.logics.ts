import React, { useState, useRef, useEffect, useCallback } from 'react';
import { setSelectedLayer as setSelectedReduxLayer } from '../../../store/slices/bannerSlice';
import { useBannerStudioBaseLogic } from './BannerStudio.logics';

/**
 * Web-specific Logic for BannerStudio.
 * Orchestrates keyboard shortcuts, canvas pan/zoom, and DOM effects.
 */
export const useBannerStudioWebLogic = () => {
    const base = useBannerStudioBaseLogic();
    const { 
        dispatch, 
        selectedLayerId, 
        activeBanner, 
        updateLayer, 
        deleteLayer, 
        duplicateLayer, 
        handleSave, 
        undo, 
        redo 
    } = base;

    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [activeTab, setActiveTab] = useState<'props' | 'layers'>('props');
    const [showGrid, setShowGrid] = useState(true);
    const [isSpacePressed, setIsSpacePressed] = useState(false);

    const resetView = useCallback(() => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    }, []);

    // Refs for optimization in event listeners
    const undoRef = useRef(undo);
    const redoRef = useRef(redo);
    const handleSaveRef = useRef(handleSave);
    const deleteLayerRef = useRef(deleteLayer);
    const updateLayerRef = useRef(updateLayer);
    const duplicateLayerRef = useRef(duplicateLayer);
    const activeBannerRef = useRef(activeBanner);

    useEffect(() => {
        undoRef.current = undo;
        redoRef.current = redo;
        handleSaveRef.current = handleSave;
        deleteLayerRef.current = deleteLayer;
        updateLayerRef.current = updateLayer;
        duplicateLayerRef.current = duplicateLayer;
        activeBannerRef.current = activeBanner;
    }, [undo, redo, handleSave, deleteLayer, updateLayer, duplicateLayer, activeBanner]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const currentSelectedLayerId = (window as any)._vko_selectedLayerId;
            const currentBanner = activeBannerRef.current;

            if (e.code === 'Space' && e.target === document.body) {
                setIsSpacePressed(true); 
            }
            if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undoRef.current(); }
            if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redoRef.current(); }
            if (e.ctrlKey && (e.key === 's' || e.key === 'g')) { e.preventDefault(); handleSaveRef.current(); }
            if (e.ctrlKey && e.key === 'd') { e.preventDefault(); duplicateLayerRef.current(); }
            
            if (currentSelectedLayerId) {
                const layer = currentBanner.layers.find(l => l.id === currentSelectedLayerId);
                if (e.key === 'Delete' || e.key === 'Backspace') { 
                    if (e.target instanceof HTMLBodyElement) {
                        e.preventDefault();
                        deleteLayerRef.current(currentSelectedLayerId); 
                    }
                }

                if (layer && !layer.locked) {
                    const step = e.shiftKey ? 10 : 1;
                    const l = parseFloat(String(layer.styles.left)) || 0;
                    const t = parseFloat(String(layer.styles.top)) || 0;

                    if (e.key === 'ArrowLeft') { e.preventDefault(); updateLayerRef.current(currentSelectedLayerId, { styles: { ...layer.styles, left: `${l - step}px` } }); }
                    if (e.key === 'ArrowRight') { e.preventDefault(); updateLayerRef.current(currentSelectedLayerId, { styles: { ...layer.styles, left: `${l + step}px` } }); }
                    if (e.key === 'ArrowUp') { e.preventDefault(); updateLayerRef.current(currentSelectedLayerId, { styles: { ...layer.styles, top: `${t - step}px` } }); }
                    if (e.key === 'ArrowDown') { e.preventDefault(); updateLayerRef.current(currentSelectedLayerId, { styles: { ...layer.styles, top: `${t + step}px` } }); }
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') { 
                setIsSpacePressed(false); 
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useEffect(() => {
        (window as any)._vko_selectedLayerId = selectedLayerId;
    }, [selectedLayerId]);

    return {
        ...base,
        zoom, setZoom,
        pan, setPan,
        activeTab, setActiveTab,
        showGrid, setShowGrid,
        isSpacePressed,
        resetView,
        setSelectedLayerIds: (ids: string[]) => dispatch(setSelectedReduxLayer(ids[0]))
    };
};
