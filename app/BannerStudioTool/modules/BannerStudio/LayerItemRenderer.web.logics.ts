import React, { useCallback, useRef, useState, useEffect } from 'react';
import { BannerLayer } from './types';

/**
 * Safely reads a numeric px value from a CSS style property.
 */
export const readStylePx = (value: unknown): number => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    const parsed = parseFloat(String(value ?? '0'));
    return Number.isFinite(parsed) ? parsed : 0;
};

interface LayerDragState {
    active: boolean;
    startClientX: number;
    startClientY: number;
    startLeft: number;
    startTop: number;
}

interface LayerLogicArgs {
    layer: BannerLayer;
    zoom: number;
    onSelect: (e: React.MouseEvent) => void;
    onUpdate: (id: string, updates: Partial<BannerLayer>) => void;
    onDelete: (id: string) => void;
    onDuplicate: () => void;
    onReorder: (id: string, action: 'front' | 'back' | 'forward' | 'backward') => void;
}

export const useLayerItemLogic = ({
    layer, zoom, onSelect, onUpdate, onDelete, onDuplicate, onReorder
}: LayerLogicArgs) => {
    const [menu, setMenu] = useState<{ x: number, y: number } | null>(null);
    const [dragPreview, setDragPreview] = useState<{ left: number; top: number; width?: number; height?: number; transform?: string } | null>(null);
    const previewRef = useRef<{ left: number; top: number; width?: number; height?: number; transform?: string } | null>(null);
    const dragStateRef = useRef<LayerDragState>({
        active: false,
        startClientX: 0,
        startClientY: 0,
        startLeft: 0,
        startTop: 0,
    });

    const currentLeft = readStylePx(layer.styles.left);
    const currentTop = readStylePx(layer.styles.top);
    const currentWidth = readStylePx(layer.styles.width);
    const currentHeight = readStylePx(layer.styles.height);
    const currentTransform = layer.styles.transform || 'rotate(0deg)';

    useEffect(() => {
        previewRef.current = dragPreview;
    }, [dragPreview]);

    useEffect(() => {
        if (!dragStateRef.current.active) {
            setDragPreview(null);
        }
    }, [currentLeft, currentTop, currentWidth, currentHeight, currentTransform]);

    // Context menu
    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setMenu({ x: e.clientX, y: e.clientY });
    }, []);

    useEffect(() => {
        const close = () => setMenu(null);
        if (menu) window.addEventListener('click', close);
        return () => window.removeEventListener('click', close);
    }, [menu]);

    // Drag commit
    const commitPreview = useCallback(() => {
        const prev = previewRef.current;
        if (!prev) return;

        const updates: any = { styles: { ...layer.styles } };
        if (prev.left !== undefined) updates.styles.left = `${Math.round(prev.left)}px`;
        if (prev.top !== undefined) updates.styles.top = `${Math.round(prev.top)}px`;
        if (prev.width !== undefined) updates.styles.width = `${Math.round(prev.width)}px`;
        if (prev.height !== undefined) updates.styles.height = `${Math.round(prev.height)}px`;
        if (prev.transform !== undefined) updates.styles.transform = prev.transform;

        onUpdate(layer.id, updates);
    }, [layer.id, layer.styles, onUpdate]);

    // Pointer drag
    const handleLayerPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        onSelect(e as any);
        if (layer.locked || e.button !== 0) return;
        if ((e.target as HTMLElement | null)?.closest('[data-layer-handle="true"]')) return;

        e.preventDefault();
        e.stopPropagation();

        dragStateRef.current = {
            active: true,
            startClientX: e.clientX,
            startClientY: e.clientY,
            startLeft: currentLeft,
            startTop: currentTop,
        };
        const initialPreview = { left: currentLeft, top: currentTop };
        previewRef.current = initialPreview;
        setDragPreview(initialPreview);

        const handlePointerMove = (moveEvt: PointerEvent) => {
            if (!dragStateRef.current.active) return;
            const safeZoom = zoom > 0 ? zoom : 1;
            const dx = (moveEvt.clientX - dragStateRef.current.startClientX) / safeZoom;
            const dy = (moveEvt.clientY - dragStateRef.current.startClientY) / safeZoom;
            const nextPreview = {
                ...previewRef.current,
                left: dragStateRef.current.startLeft + dx,
                top: dragStateRef.current.startTop + dy,
            };
            previewRef.current = nextPreview;
            setDragPreview(nextPreview);
        };

        const handlePointerUp = () => {
            dragStateRef.current.active = false;
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            commitPreview();
            setDragPreview(null);
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp, { once: true });
    }, [layer.locked, currentLeft, currentTop, zoom, onSelect, commitPreview]);

    // Resize Preview
    const handleResizeDetailed = useCallback((updates: { dw?: number, dh?: number, dl?: boolean, dt?: boolean }) => {
        const curW = currentWidth;
        const curH = currentHeight;
        const curL = currentLeft;
        const curT = currentTop;

        const nextW = Math.max(10, curW + (updates.dw || 0));
        const nextH = Math.max(10, curH + (updates.dh || 0));
        const dw = nextW - curW;
        const dh = nextH - curH;
        const nextL = updates.dl ? curL - dw : curL;
        const nextT = updates.dt ? curT - dh : curT;

        const nextPreview = {
            ...previewRef.current,
            width: nextW,
            height: nextH,
            left: nextL,
            top: nextT
        };
        previewRef.current = nextPreview;
        setDragPreview(nextPreview);
    }, [currentWidth, currentHeight, currentLeft, currentTop]);

    // Rotate Preview
    const handleRotate = useCallback((angle: number) => {
        const nextPreview = {
            left: previewRef.current?.left ?? currentLeft,
            top: previewRef.current?.top ?? currentTop,
            ...previewRef.current,
            transform: `rotate(${angle}deg)`
        };
        previewRef.current = nextPreview;
        setDragPreview(nextPreview);
    }, [currentLeft, currentTop]);

    // Pointer Up for Resize/Rotate handles (since they are separate in JSX)
    useEffect(() => {
        const handleGlobalPointerUp = () => {
            if (previewRef.current && !dragStateRef.current.active) {
                commitPreview();
                setDragPreview(null);
            }
        };
        window.addEventListener('pointerup', handleGlobalPointerUp);
        return () => window.removeEventListener('pointerup', handleGlobalPointerUp);
    }, [commitPreview]);

    const wheelCommitTimer = useRef<any>(null);

    // Wheel Resize
    const handleWheelResize = useCallback((e: WheelEvent) => {
        if (layer.locked) return;
        e.preventDefault();
        e.stopPropagation();
        
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        const factor = 1 + delta;
        
        const nextW = Math.max(10, (previewRef.current?.width ?? currentWidth) * factor);
        const nextH = Math.max(10, (previewRef.current?.height ?? currentHeight) * factor);
        
        const dw = nextW - (previewRef.current?.width ?? currentWidth);
        const dh = nextH - (previewRef.current?.height ?? currentHeight);
        
        const nextPreview = {
            ...previewRef.current,
            left: (previewRef.current?.left ?? currentLeft) - dw / 2,
            top: (previewRef.current?.top ?? currentTop) - dh / 2,
            width: nextW,
            height: nextH,
        };
        
        previewRef.current = nextPreview;
        setDragPreview(nextPreview);

        if (wheelCommitTimer.current) clearTimeout(wheelCommitTimer.current);
        wheelCommitTimer.current = setTimeout(() => {
            commitPreview();
            setDragPreview(null);
            wheelCommitTimer.current = null;
        }, 500);
    }, [layer.locked, currentWidth, currentHeight, currentLeft, currentTop, commitPreview]);

    // Computed
    const animationClass = layer.animation?.name ? `animate-${layer.animation.name}` : '';
    const resolvedLeft = dragPreview?.left ?? currentLeft;
    const resolvedTop = dragPreview?.top ?? currentTop;
    const resolvedWidth = dragPreview?.width ?? currentWidth;
    const resolvedHeight = dragPreview?.height ?? currentHeight;
    const resolvedTransform = dragPreview?.transform ?? currentTransform;

    return {
        menu, setMenu,
        resolvedLeft, resolvedTop,
        resolvedWidth, resolvedHeight,
        resolvedTransform,
        animationClass,
        handleContextMenu,
        handleLayerPointerDown,
        handleResizeDetailed,
        handleRotate,
        handleWheelResize,
    };
};
