import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { 
    setProject, updateProject as updateReduxProject, 
    setActiveBanner as setActiveReduxBanner, 
    setSelectedLayer as setSelectedReduxLayer,
    undo as reduxUndo, redo as reduxRedo
} from '../../../store/slices/bannerSlice';
import { 
    BannerLayer, BannerDesign, StudioProject, 
    LayerType, ProjectMeta 
} from './types';
import { 
    createBannerTemplate, createLayerTemplate,
    STORAGE_KEYS 
} from './constants';

export const useBannerStudioLogic = () => {
    const dispatch = useDispatch();
    const project = useSelector((state: RootState) => state.banner.project);
    const selectedLayerId = useSelector((state: RootState) => state.banner.selectedLayerId);
    const activeBannerId = useSelector((state: RootState) => state.banner.activeBannerId);
    const canUndo = useSelector((state: RootState) => state.banner.undoStack.length > 0);
    const canRedo = useSelector((state: RootState) => state.banner.redoStack.length > 0);

    const [layerSearch, setLayerSearch] = useState('');
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [activeTab, setActiveTab] = useState<'props' | 'layers'>('props');
    const [projectMeta, setProjectMeta] = useState<ProjectMeta>({ id: project.id, name: project.name, dirty: false });
    const [showGrid, setShowGrid] = useState(true);
    const [isLoading, setIsLoading] = useState(false); // No loader if it persists
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [isSpacePressed, setIsSpacePressed] = useState(false);

    const resetView = useCallback(() => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    }, []);

    // --- COMPUTED (Memoized for Performance) ---
    const activeBanner = useMemo(() => {
        return project.banners.find(b => b.id === activeBannerId) || project.banners[0];
    }, [project.banners, activeBannerId]);

    const selectedLayer = useMemo(() => {
        if (!selectedLayerId) return null;
        return activeBanner.layers.find(l => l.id === selectedLayerId) || null;
    }, [activeBanner.layers, selectedLayerId]);

    const selectedLayerIds = useMemo(() => selectedLayerId ? [selectedLayerId] : [], [selectedLayerId]);

    // --- ACTIONS: BANNERS ---
    const updateProject = useCallback((updates: Partial<StudioProject>) => {
        dispatch(updateReduxProject(updates));
        setProjectMeta(prev => ({ ...prev, dirty: true }));
    }, [dispatch]);

    const updateBanner = useCallback((id: string, updates: Partial<BannerDesign>) => {
        const nextBanners = project.banners.map(b => b.id === id ? { ...b, ...updates } : b);
        dispatch(updateReduxProject({ banners: nextBanners }));
        setProjectMeta(prev => ({ ...prev, dirty: true }));
    }, [project.banners, dispatch]);

    const addBanner = () => {
        const newBanner = createBannerTemplate(project.banners.length + 1);
        dispatch(updateReduxProject({ 
            banners: [...project.banners, newBanner],
            activeBannerId: newBanner.id
        }));
        dispatch(setActiveReduxBanner(newBanner.id));
    };

    const duplicateBanner = (id: string) => {
        const source = project.banners.find(b => b.id === id);
        if (!source) return;
        const copy = { ...source, id: `bnr-${Date.now()}`, name: `${source.name} (Copia)` };
        dispatch(updateReduxProject({ 
            banners: [...project.banners, copy],
            activeBannerId: copy.id
        }));
        dispatch(setActiveReduxBanner(copy.id));
    };

    const deleteBanner = (id: string) => {
        if (project.banners.length <= 1) return;
        const nextBanners = project.banners.filter(b => b.id !== id);
        dispatch(updateReduxProject({ 
            banners: nextBanners,
            activeBannerId: nextBanners[0].id
        }));
        dispatch(setActiveReduxBanner(nextBanners[0].id));
    };

    // --- ACTIONS: LAYERS ---
    const addLayer = (type: LayerType) => {
        if (type === 'drawing') {
            setIsDrawingMode(true);
            return;
        }
        const newLayer = createLayerTemplate(type);
        // Normalize full-canvas layers to px so resize/drag logic stays deterministic.
        if (type === 'particles' || type === 'canvas' || type === 'animated') {
            newLayer.styles = {
                ...newLayer.styles,
                top: '0px',
                left: '0px',
                width: `${activeBanner.designWidth}px`,
                height: `${activeBanner.designHeight}px`,
            };
        }
        const nextLayers = [...activeBanner.layers, newLayer];
        updateBanner(activeBanner.id, { layers: nextLayers });
        dispatch(setSelectedReduxLayer(newLayer.id));
    };

    const updateLayer = useCallback((id: string, updates: Partial<BannerLayer>) => {
        const nextLayers = activeBanner.layers.map(l => l.id === id ? { ...l, ...updates } : l);
        updateBanner(activeBanner.id, { layers: nextLayers });
    }, [activeBanner, updateBanner]);

    const deleteLayer = (id: string) => {
        const nextLayers = activeBanner.layers.filter(l => l.id !== id);
        updateBanner(activeBanner.id, { layers: nextLayers });
        dispatch(setSelectedReduxLayer(null));
    };

    const duplicateLayer = () => {
        if (!selectedLayer) return;
        const copy = { ...selectedLayer, id: `layer-${Date.now()}`, name: `${selectedLayer.name} (Copia)` };
        const nextLayers = [...activeBanner.layers, copy];
        updateBanner(activeBanner.id, { layers: nextLayers });
        dispatch(setSelectedReduxLayer(copy.id));
    };

    const moveLayer = (direction: 'up' | 'down') => {
        if (!selectedLayer) return;
        const index = activeBanner.layers.findIndex(l => l.id === selectedLayer.id);
        if (index === -1) return;
        const nextLayers = [...activeBanner.layers];
        if (direction === 'up' && index < nextLayers.length - 1) {
            [nextLayers[index], nextLayers[index + 1]] = [nextLayers[index + 1], nextLayers[index]];
        } else if (direction === 'down' && index > 0) {
            [nextLayers[index], nextLayers[index - 1]] = [nextLayers[index - 1], nextLayers[index]];
        }
        updateBanner(activeBanner.id, { layers: nextLayers });
    };

    const renameLayer = (id: string, name: string) => {
        const nextLayers = activeBanner.layers.map(l => l.id === id ? { ...l, name } : l);
        updateBanner(activeBanner.id, { layers: nextLayers });
    };

    const reorderLayer = (id: string, action: 'front' | 'back' | 'forward' | 'backward') => {
        const nextLayers = [...activeBanner.layers];
        const index = nextLayers.findIndex(l => l.id === id);
        if (index === -1) return;

        const layer = nextLayers.splice(index, 1)[0];
        if (action === 'front') nextLayers.push(layer);
        else if (action === 'back') nextLayers.unshift(layer);
        else if (action === 'forward') nextLayers.splice(Math.min(nextLayers.length, index + 1), 0, layer);
        else if (action === 'backward') nextLayers.splice(Math.max(0, index - 1), 0, layer);

        updateBanner(activeBanner.id, { layers: nextLayers });
    };

    // --- DRAWING ---
    const handleApplyDrawing = (dataUrl: string) => {
        const newLayer = createLayerTemplate('drawing');
        newLayer.src = dataUrl;
        newLayer.styles = { ...newLayer.styles, width: `${activeBanner.designWidth}px`, height: `${activeBanner.designHeight}px` };
        updateBanner(activeBanner.id, { layers: [...activeBanner.layers, newLayer] });
        setIsDrawingMode(false);
        dispatch(setSelectedReduxLayer(newLayer.id));
    };

    // --- PERSISTENCE (Backup manually if needed, but Redux Persist handles it) ---
    const handleSave = () => {
        const projectRecord = { ...project, updatedAt: new Date().toISOString() };
        localStorage.setItem(`${STORAGE_KEYS.projectPrefix}${project.id}`, JSON.stringify({ 
            id: project.id, 
            name: project.name, 
            payload: projectRecord 
        }));
        setProjectMeta(prev => ({ ...prev, dirty: false }));
    };

    const toggleSelectedLayer = (id: string, multi: boolean) => {
        dispatch(setSelectedReduxLayer(id));
    };

    const undo = () => dispatch(reduxUndo());
    const redo = () => dispatch(reduxRedo());

    // --- EVENT LISTENERS (Optimized for performance) ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && e.target === document.body) {
                setIsSpacePressed(true); 
            }
            if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
            if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
            if (e.ctrlKey && (e.key === 's' || e.key === 'g')) { e.preventDefault(); handleSave(); }
            if (e.ctrlKey && e.key === 'd') { e.preventDefault(); duplicateLayer(); }
            
            if (selectedLayerId) {
                const layer = activeBanner.layers.find(l => l.id === selectedLayerId);
                if (e.key === 'Delete' || e.key === 'Backspace') { 
                    if (e.target instanceof HTMLBodyElement) {
                        e.preventDefault();
                        deleteLayer(selectedLayerId); 
                    }
                }

                if (layer && !layer.locked) {
                    const step = e.shiftKey ? 10 : 1;
                    const l = parseFloat(String(layer.styles.left)) || 0;
                    const t = parseFloat(String(layer.styles.top)) || 0;

                    if (e.key === 'ArrowLeft') { e.preventDefault(); updateLayer(selectedLayerId, { styles: { ...layer.styles, left: `${l - step}px` } }); }
                    if (e.key === 'ArrowRight') { e.preventDefault(); updateLayer(selectedLayerId, { styles: { ...layer.styles, left: `${l + step}px` } }); }
                    if (e.key === 'ArrowUp') { e.preventDefault(); updateLayer(selectedLayerId, { styles: { ...layer.styles, top: `${t - step}px` } }); }
                    if (e.key === 'ArrowDown') { e.preventDefault(); updateLayer(selectedLayerId, { styles: { ...layer.styles, top: `${t + step}px` } }); }
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
    }, [project, selectedLayerId, activeBannerId]);

    return {
        project, activeBanner, selectedLayer,
        selectedLayerIds, setSelectedLayerIds: (ids: string[]) => dispatch(setSelectedReduxLayer(ids[0])), 
        toggleSelectedLayer,
        zoom, setZoom,
        pan, setPan,
        resetView,
        activeTab, setActiveTab,
        layerSearch, setLayerSearch,
        showGrid, setShowGrid,
        projectMeta, isLoading, isDrawingMode, setIsDrawingMode,
        isPreviewMode, setIsPreviewMode,
        isSpacePressed,
        
        // Actions
        updateProject, updateBanner, updateLayer, deleteLayer,
        addBanner, duplicateBanner, deleteBanner,
        addLayer, duplicateLayer, moveLayer, renameLayer, reorderLayer,
        handleApplyDrawing, handleSave, undo, redo,
        canUndo, canRedo
    };
};
