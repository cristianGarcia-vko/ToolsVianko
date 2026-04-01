import React, { useRef, useState, useCallback, useEffect } from 'react';
import { 
    type DrawingStudioPropsBase 
} from './DrawingStudio.shared';
import { useDrawingStudioBaseLogic } from './DrawingStudio.logics';

/**
 * Web-specific Logic for DrawingStudio.
 * Orchestrates Canvas API, mouse events, and pixel manipulation algorithms.
 */
export const useDrawingStudioWebLogic = (props: DrawingStudioPropsBase) => {
    const { width, height, initialData, onApply, onCancel } = props;
    const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});
    const overlayRef = useRef<HTMLCanvasElement>(null);
    
    // Base Logic
    const base = useDrawingStudioBaseLogic(props);
    const {
        tool, setTool, color, setColor, size, setSize, opacity, setOpacity,
        isFill, setIsFill, symmetry, setSymmetry, activeTab, setActiveTab,
        layers, setLayers, activeLayerId, setActiveLayerId, activeLayer,
        history, setHistory, patternImage, setPatternImage
    } = base;

    const [isDrawing, setIsDrawing] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [lastPoints, setLastPoints] = useState<{x: number, y: number}[]>([]);

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

        if (tool === 'pattern' && patternImage) {
            const img = new Image();
            img.src = patternImage;
            if (img.complete) {
                const pattern = ctx.createPattern(img, 'repeat');
                if (pattern) ctx.fillStyle = pattern;
            }
        }

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
    }, [tool, color, size, opacity, patternImage]);

    const floodFill = (ctx: CanvasRenderingContext2D, sX: number, sY: number, fillColor: string) => {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const stack: [number, number][] = [[Math.round(sX), Math.round(sY)]];
        
        const targetColor = getPixel(data, Math.round(sX), Math.round(sY));
        const fillRGB = hexToRgb(fillColor);

        if (colorsMatch(targetColor, fillRGB)) return;

        while (stack.length > 0) {
            const [x, y] = stack.pop()!;
            let currentColor = getPixel(data, x, y);

            if (colorsMatch(currentColor, targetColor)) {
                setPixel(data, x, y, fillRGB);
                if (x > 0) stack.push([x - 1, y]);
                if (x < width - 1) stack.push([x + 1, y]);
                if (y > 0) stack.push([x, y - 1]);
                if (y < height - 1) stack.push([x, y + 1]);
            }
        }
        ctx.putImageData(imageData, 0, 0);
    };

    const getPixel = (data: Uint8ClampedArray, x: number, y: number) => {
        const index = (y * width + x) * 4;
        return [data[index], data[index + 1], data[index + 2], data[index + 3]];
    };

    const setPixel = (data: Uint8ClampedArray, x: number, y: number, clr: number[]) => {
        const index = (y * width + x) * 4;
        data[index] = clr[0];
        data[index + 1] = clr[1];
        data[index + 2] = clr[2];
        data[index + 3] = 255;
    };

    const colorsMatch = (a: number[], b: number[]) => {
        return a[0] === b[1] || (a[0] === b[0] && a[1] === b[1] && a[2] === b[2]);
    };

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : [0, 0, 0];
    };

    const startDrawing = useCallback((e: React.PointerEvent) => {
        const canvas = canvasRefs.current[activeLayerId];
        const overlay = overlayRef.current;
        if (!canvas || !overlay || !activeLayer.visible) return;

        const rect = overlay.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (tool === 'bucket') {
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (ctx) {
                setHistory(prev => ({ 
                    ...prev, 
                    [activeLayerId]: [...(prev[activeLayerId] || []), canvas.toDataURL()] 
                }));
                floodFill(ctx, x, y, color);
            }
            return;
        }

        setHistory(prev => ({
            ...prev,
            [activeLayerId]: [...(prev[activeLayerId] || []).slice(-20), canvas.toDataURL()]
        }));
        
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
    }, [activeLayerId, activeLayer.visible, tool, setupContext, color, width, height, setHistory]);

    const handlePatternUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setPatternImage(ev.target?.result as string);
                setTool('pattern');
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

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
                    const sxc = width - xc;
                    const slpx = width - lastPoints[lastPoints.length - 1].x;
                    ctx.beginPath();
                    ctx.moveTo(width - lastPoints[0].x, lastPoints[0].y);
                    ctx.quadraticCurveTo(slpx, lastPoints[lastPoints.length - 1].y, sxc, yc);
                    ctx.stroke();
                }
            }
            setLastPoints(prev => [...prev, {x, y}]);
        } else if (['rect', 'circle', 'line', 'pattern'].includes(tool)) {
            octx.strokeStyle = color;
            octx.fillStyle = color;
            
            if (tool === 'pattern' && patternImage) {
                const img = new Image();
                img.src = patternImage;
                if (img.complete) {
                    const pattern = octx.createPattern(img, 'repeat');
                    if (pattern) octx.fillStyle = pattern;
                }
            }

            octx.globalAlpha = opacity * 0.5;
            octx.beginPath();
            if (tool === 'rect' || tool === 'pattern') {
                if (isFill || tool === 'pattern') octx.fillRect(startX, startY, x - startX, y - startY);
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
    }, [isDrawing, activeLayerId, width, height, tool, setupContext, lastPoints, symmetry, color, opacity, isFill, startX, startY, patternImage]);

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

        if (['rect', 'circle', 'line', 'pattern'].includes(tool)) {
            setupContext(ctx);
            ctx.beginPath();
            if (tool === 'rect' || tool === 'pattern') {
                if (isFill || tool === 'pattern') ctx.fillRect(startX, startY, x - startX, y - startY);
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
    }, [activeLayerId, history, width, height, setHistory]);

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
    }, [activeLayerId, width, height, setHistory]);

    const addLayer = useCallback(() => {
        const id = `layer-${Date.now()}`;
        setLayers(prev => [...prev, { 
            id, name: `Capa ${prev.length + 1}`, visible: true, zIndex: prev.length 
        }]);
        setHistory(prev => ({ ...prev, [id]: [] }));
        setActiveLayerId(id);
    }, [setLayers, setHistory, setActiveLayerId]);

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
        ...base,
        canvasRefs, overlayRef,
        startDrawing, draw, stopDrawing, 
        undo, clearActiveLayer, addLayer, 
        handleFinalApply, onCancel,
        handlePatternUpload
    };
};

