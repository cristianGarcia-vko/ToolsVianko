import { useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { 
    updateProject as updateReduxProject, 
    setActiveBanner as setActiveReduxBanner, 
    setSelectedLayer as setSelectedReduxLayer,
    undo as reduxUndo, redo as reduxRedo
} from '../../../store/slices/bannerSlice';
import { 
    BannerLayer, BannerDesign, StudioProject, 
    LayerType, ProjectMeta 
} from './types/types';
import { 
    createBannerTemplate, createLayerTemplate,
    STORAGE_KEYS 
} from './types/constants';

/**
 * Base Agnostic Logic for BannerStudio.
 * Orchestrates Redux state, project management, and layer operations.
 */
export const useBannerStudioBaseLogic = () => {
    const dispatch = useDispatch();
    
    const project = useSelector((state: RootState) => 
        state.banner?.project || { 
            id: 'default', name: 'Nuevo Proyecto', 
            banners: [], settings: {} as any, 
            version: '1.0', activeBannerId: '', updatedAt: '' 
        } as StudioProject
    );
    
    const selectedLayerId = useSelector((state: RootState) => state.banner?.selectedLayerId);
    const activeBannerId = useSelector((state: RootState) => state.banner?.activeBannerId);
    const canUndo = useSelector((state: RootState) => (state.banner?.undoStack?.length || 0) > 0);
    const canRedo = useSelector((state: RootState) => (state.banner?.redoStack?.length || 0) > 0);

    const [layerSearch, setLayerSearch] = useState('');
    const [projectMeta, setProjectMeta] = useState<ProjectMeta>({ id: project.id, name: project.name, dirty: false });
    const [isLoading, setIsLoading] = useState(false);
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);

    const activeBanner = useMemo(() => {
        return project.banners.find(b => b.id === activeBannerId) || project.banners[0];
    }, [project.banners, activeBannerId]);

    const selectedLayer = useMemo(() => {
        if (!selectedLayerId) return null;
        return activeBanner.layers.find(l => l.id === selectedLayerId) || null;
    }, [activeBanner.layers, selectedLayerId]);

    const selectedLayerIds = useMemo(() => 
        selectedLayerId ? [selectedLayerId] : [], 
        [selectedLayerId]
    );

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

    const addLayer = (type: LayerType) => {
        if (type === 'drawing') {
            setIsDrawingMode(true);
            return;
        }
        const newLayer = createLayerTemplate(type);
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

    const handleApplyDrawing = (dataUrl: string) => {
        const newLayer = createLayerTemplate('drawing');
        newLayer.src = dataUrl;
        newLayer.styles = { 
            ...newLayer.styles, 
            width: `${activeBanner.designWidth}px`, 
            height: `${activeBanner.designHeight}px` 
        };
        updateBanner(activeBanner.id, { layers: [...activeBanner.layers, newLayer] });
        setIsDrawingMode(false);
        dispatch(setSelectedReduxLayer(newLayer.id));
    };

    const toggleSelectedLayer = (id: string, multi: boolean) => {
        dispatch(setSelectedReduxLayer(id));
    };

    const handleSave = () => {
        const projectRecord = { ...project, updatedAt: new Date().toISOString() };
        localStorage.setItem(`${STORAGE_KEYS.projectPrefix}${project.id}`, JSON.stringify({ 
            id: project.id, 
            name: project.name, 
            payload: projectRecord 
        }));
        setProjectMeta(prev => ({ ...prev, dirty: false }));
    };

    const undo = () => dispatch(reduxUndo());
    const redo = () => dispatch(reduxRedo());

    return {
        dispatch,
        project, activeBanner, selectedLayer,
        selectedLayerId, selectedLayerIds,
        layerSearch, setLayerSearch,
        projectMeta, isLoading, 
        isDrawingMode, setIsDrawingMode,
        isPreviewMode, setIsPreviewMode,
        toggleSelectedLayer,
        // Actions
        updateProject, updateBanner, updateLayer, deleteLayer,
        addBanner, duplicateBanner, deleteBanner,
        addLayer, duplicateLayer, moveLayer, renameLayer, reorderLayer,
        handleApplyDrawing, handleSave, undo, redo,
        canUndo, canRedo
    };
};
