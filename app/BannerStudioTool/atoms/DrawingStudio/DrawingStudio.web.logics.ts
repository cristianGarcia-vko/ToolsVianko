import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';

export type DrawingTool = 'brush' | 'pencil' | 'airbrush' | 'neon' | 'eraser' | 'rect' | 'circle' | 'line';

export interface DrawingLayer {
    id: string;
    name: string;
    visible: boolean;
    zIndex: number;
}

interface UseDrawingStudioParams {
    width: number;
    height: number;
    initialData?: string;
    onApply: (dataUrl: string) => void;
}

export const useDrawingStudioLogic = ({ width, height, initialData, onApply }: UseDrawingStudioParams) => {
    const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});
    const overlayRef = useRef<HTMLCanvasElement>(null);
    
    const [tool, setTool] = useState<DrawingTool>('brush');
    const [color, setColor] = useState('#ffffff');
    const [size, setSize] = useState(8);
    const [opacity, setOpacity] = useState(1);
    const [isFill, setIsFill] = useState(false);
    const [symmetry, setSymmetry] = useState(false);
    const [activeTab, setActiveTab] = useState<'tools' | 'layers' | 'settings'>('tools');
    
    const [layers, setLayers] = useState<DrawingLayer[]>([
        { id: 'base', name: 'Capa Base', visible: true, zIndex: 0 }
    ]);
    const [activeLayerId, setActiveLayerId] = useState('base');
    
    const [isDrawing, setIsDrawing] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [history, setHistory] = useState<{ [layerId: string]: string[] }>({ 'base': [] });
    const [lastPoints, setLastPoints] = useState<{x: number, y: number}[]>([]);

    const activeLayer = useMemo(() => layers.find(l => l.id === activeLayerId) || layers[0], [layers, activeLayerId]);

    useEffect(() => {
        if (initialData) {
            const canvas = canvasRefs.current['base'];
            if (!canvas) return;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (ctx) {
                const img = new Image();
                img.onload = () => ctx.drawImage(img, 0, 0, width, height);
                img.src = initialData;
            }
        }
    }, [initialData, width, height]);

    const setupContext = useCallback((ctx: CanvasRenderingContext2D) => {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.globalAlpha = opacity;
        ctx.lineWidth = size;
        
        if (tool === 'pencil') {
            ctx.lineWidth = Math.max(1, size / 4);
        } else if (tool === 'neon') {
            ctx.shadowBlur = size * 1.5;
            ctx.shadowColor = color;
        } else if (tool === 'airbrush') {
            ctx.shadowBlur = size * 2;
            ctx.shadowColor = color;
            ctx.globalAlpha = opacity * 0.2;
        } else if (tool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
        } else {
            ctx.globalCompositeOperation = 'source-over';
        }
    }, [tool, color, size, opacity]);

    const startDrawing = useCallback((e: React.PointerEvent) => {
        const canvas = canvasRefs.current[activeLayerId];
        const overlay = overlayRef.current;
        if (!canvas || !overlay || !activeLayer.visible) return;

        setHistory(prev => ({
            ...prev,
            [activeLayerId]: [...(prev[activeLayerId] || []).slice(-20), canvas.toDataURL()]
        }));
        
        const rect = overlay.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        setStartX(x);
        setStartY(y);
        setIsDrawing(true);
        setLastPoints([{x, y}]);

        if (['brush', 'pencil', 'neon', 'airbrush', 'eraser'].includes(tool)) {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            setupContext(ctx);
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
    }, [activeLayerId, activeLayer.visible, tool, setupContext]);

    const draw = useCallback((e: React.PointerEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRefs.current[activeLayerId];
        const overlay = overlayRef.current;
        if (!canvas || !overlay) return;

        const rect = overlay.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const ctx = canvas.getContext('2d');
        const octx = overlay.getContext('2d');
        if (!ctx || !octx) return;

        octx.clearRect(0, 0, width, height);

        if (['brush', 'pencil', 'neon', 'airbrush', 'eraser'].includes(tool)) {
            setupContext(ctx);
            if (lastPoints.length > 2) {
                const xc = (lastPoints[lastPoints.length - 1].x + x) / 2;
                const yc = (lastPoints[lastPoints.length - 1].y + y) / 2;
                ctx.quadraticCurveTo(lastPoints[lastPoints.length - 1].x, lastPoints[lastPoints.length - 1].y, xc, yc);
                ctx.stroke();
                
                if (symmetry) {
                    const sx = width - x;
                    const sxc = width - xc;
                    const slpx = width - lastPoints[lastPoints.length - 1].x;
                    ctx.beginPath();
                    ctx.moveTo(width - lastPoints[0].x, lastPoints[0].y);
                    ctx.quadraticCurveTo(slpx, lastPoints[lastPoints.length - 1].y, sxc, yc);
                    ctx.stroke();
                }
            }
            setLastPoints(prev => [...prev, {x, y}]);
        } else {
            octx.strokeStyle = color;
            octx.fillStyle = color;
            octx.globalAlpha = opacity * 0.5;
            octx.beginPath();
            if (tool === 'rect') {
                if (isFill) octx.fillRect(startX, startY, x - startX, y - startY);
                octx.strokeRect(startX, startY, x - startX, y - startY);
            } else if (tool === 'circle') {
                const radius = Math.hypot(x - startX, y - startY);
                octx.arc(startX, startY, radius, 0, Math.PI * 2);
                if (isFill) octx.fill();
                octx.stroke();
            } else if (tool === 'line') {
                octx.moveTo(startX, startY);
                octx.lineTo(x, y);
                octx.stroke();
            }
        }
    }, [isDrawing, activeLayerId, width, height, tool, setupContext, lastPoints, symmetry, color, opacity, isFill, startX, startY]);

    const stopDrawing = useCallback((e: React.PointerEvent) => {
        if (!isDrawing) return;
        setIsDrawing(false);
        const canvas = canvasRefs.current[activeLayerId];
        const overlay = overlayRef.current;
        if (!canvas || !overlay) return;

        const ctx = canvas.getContext('2d');
        const octx = overlay.getContext('2d');
        if (!ctx || !octx) return;

        const rect = overlay.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        octx.clearRect(0, 0, width, height);

        if (['rect', 'circle', 'line'].includes(tool)) {
            setupContext(ctx);
            ctx.beginPath();
            if (tool === 'rect') {
                if (isFill) ctx.fillRect(startX, startY, x - startX, y - startY);
                ctx.strokeRect(startX, startY, x - startX, y - startY);
            } else if (tool === 'circle') {
                const radius = Math.hypot(x - startX, y - startY);
                ctx.arc(startX, startY, radius, 0, Math.PI * 2);
                if (isFill) ctx.fill();
                ctx.stroke();
            } else if (tool === 'line') {
                ctx.moveTo(startX, startY);
                ctx.lineTo(x, y);
                ctx.stroke();
            }
        }
        setLastPoints([]);
    }, [isDrawing, activeLayerId, width, height, tool, setupContext, isFill, startX, startY]);

    const undo = useCallback(() => {
        const layerHistory = history[activeLayerId];
        if (!layerHistory || layerHistory.length === 0) return;
        
        const last = layerHistory[layerHistory.length - 1];
        const canvas = canvasRefs.current[activeLayerId];
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = last;
        setHistory(prev => ({
            ...prev,
            [activeLayerId]: prev[activeLayerId].slice(0, -1)
        }));
    }, [activeLayerId, history, width, height]);

    const clearActiveLayer = useCallback(() => {
        const canvas = canvasRefs.current[activeLayerId];
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            setHistory(prev => ({
                ...prev,
                [activeLayerId]: [...(prev[activeLayerId] || []), canvas.toDataURL()]
            }));
            ctx.clearRect(0, 0, width, height);
        }
    }, [activeLayerId, width, height]);

    const addLayer = useCallback(() => {
        const id = `layer-${Date.now()}`;
        setLayers(prev => [...prev, { 
            id, name: `Capa ${prev.length + 1}`, visible: true, zIndex: prev.length 
        }]);
        setHistory(prev => ({ ...prev, [id]: [] }));
        setActiveLayerId(id);
    }, []);

    const handleFinalApply = useCallback(() => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tctx = tempCanvas.getContext('2d');
        if (!tctx) return;

        const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);
        sortedLayers.filter(l => l.visible).forEach(l => {
            const canvas = canvasRefs.current[l.id];
            if (canvas) tctx.drawImage(canvas, 0, 0);
        });
        onApply(tempCanvas.toDataURL());
    }, [width, height, layers, onApply]);

    return {
        canvasRefs, overlayRef,
        tool, setTool, color, setColor, size, setSize, opacity, setOpacity,
        isFill, setIsFill, symmetry, setSymmetry, activeTab, setActiveTab,
        layers, setLayers, activeLayerId, setActiveLayerId,
        startDrawing, draw, stopDrawing, undo, clearActiveLayer, addLayer, handleFinalApply
    };
};
