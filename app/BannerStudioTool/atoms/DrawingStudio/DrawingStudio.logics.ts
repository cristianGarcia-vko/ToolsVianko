import { useState, useMemo, useCallback } from 'react';
import { 
    type DrawingTool, 
    type DrawingLayer, 
    type DrawingTab, 
    type DrawingStudioPropsBase 
} from './DrawingStudio.shared';

/**
 * Base Agnostic Logic for DrawingStudio.
 * Manages general state, tool selection, and layer hierarchy.
 */
export const useDrawingStudioBaseLogic = ({ 
    initialData, 
    onApply, 
    onCancel 
}: DrawingStudioPropsBase) => {
    const [tool, setTool] = useState<DrawingTool>('brush');
    const [color, setColor] = useState('#ffffff');
    const [size, setSize] = useState(8);
    const [opacity, setOpacity] = useState(1);
    const [isFill, setIsFill] = useState(false);
    const [symmetry, setSymmetry] = useState(false);
    const [activeTab, setActiveTab] = useState<DrawingTab>('tools');
    const [patternImage, setPatternImage] = useState<string | null>(null);
    
    const [layers, setLayers] = useState<DrawingLayer[]>([
        { id: 'base', name: 'Capa Base', visible: true, zIndex: 0 }
    ]);
    const [activeLayerId, setActiveLayerId] = useState('base');
    const [history, setHistory] = useState<{ [layerId: string]: string[] }>({ 'base': [] });

    const activeLayer = useMemo(
        () => layers.find(l => l.id === activeLayerId) || layers[0], 
        [layers, activeLayerId]
    );

    const toggleLayerVisibility = (id: string) => {
        setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
    };

    const deleteLayer = (id: string) => {
        if (layers.length <= 1) return;
        setLayers(prev => prev.filter(l => l.id !== id));
        if (activeLayerId === id) {
            setActiveLayerId(layers.find(l => l.id !== id)?.id || 'base');
        }
    };

    return {
        tool, setTool,
        color, setColor,
        size, setSize,
        opacity, setOpacity,
        isFill, setIsFill,
        symmetry, setSymmetry,
        activeTab, setActiveTab,
        patternImage, setPatternImage,
        layers, setLayers,
        activeLayerId, setActiveLayerId,
        activeLayer,
        history, setHistory,
        toggleLayerVisibility,
        deleteLayer,
        onApply,
        onCancel
    };
};
