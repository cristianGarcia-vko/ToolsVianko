import React, { useEffect, useMemo, useRef, memo } from 'react';
import { motion } from 'framer-motion';
import { 
    ImageIcon, RotateCw, Copy, ChevronRight, Trash2 
} from 'lucide-react';
import { tokens } from '../../../../../SharedTool/style/tokens.shared.style';
import { useLayerItemLogic } from './LayerItemRenderer.web.logics';
import { LayerPropsBase } from './LayerItemRenderer.shared';
import { resolveAnimationStyle } from '../../BannerStudio.shared';
import {
    getContentBase, imagePlaceholder,
    getLayerWrapperStyle, getInnerContainerStyle,
    rotateConnector, rotateHandleOuter, rotateHandleCircle,
    coordsLabel, contextMenu, menuDivider, menuBtnStyle,
    getResizeHandleStyle, getTextStyle, getImageStyle, lottiePlaceholder,
    animationWrapper, getParticleContainer, getParticleStyle, canvasOverlay
} from './LayerItemRenderer.web.styles';
import '../../styles/BannerAnimations.css';

/**
 * Pure View for LayerItemRenderer.
 * No business logic, only declarative UI and event orchestration.
 * Complies with Vianko Architecture Contract (Zero Logic in View).
 */
export const LayerItemRenderer: React.FC<LayerPropsBase> = memo((props) => {
    const { layer, isSelected, zoom, onDuplicate, onReorder, onDelete } = props;
    
    const logic = useLayerItemLogic(props);
    const {
        menu, setMenu,
        resolvedLeft, resolvedTop,
        resolvedWidth, resolvedHeight,
        resolvedTransform,
        handleContextMenu,
        handleLayerPointerDown,
        handleResizeDetailed,
        handleRotate,
        handleWheelResize,
    } = logic;

    const wrapperRef = useRef<HTMLDivElement>(null);

    // Orchestration of local wheel resize
    useEffect(() => {
        const el = wrapperRef.current;
        if (!el) return;
        el.addEventListener('wheel', handleWheelResize, { passive: false });
        return () => el.removeEventListener('wheel', handleWheelResize);
    }, [handleWheelResize]);

    if (!layer.visible) return null;

    const layerStyles = (layer.styles || {}) as Record<string, any>;
    const passthroughVisualStyle: Record<string, any> = {
        ...layerStyles,
    };
    [
        'position',
        'left',
        'top',
        'right',
        'bottom',
        'width',
        'height',
        'minWidth',
        'minHeight',
        'maxWidth',
        'maxHeight',
        'zIndex',
        'cursor',
        'userSelect',
        'pointerEvents',
        'transform',
    ].forEach((key) => {
        delete passthroughVisualStyle[key];
    });

    const textStyleFromLayer = getTextStyle(layerStyles);
    const imageStyleFromLayer = getImageStyle(layer.fit, layer.position || 'center');
    const imageStyleOverrides = ((layer as any).imageStyles || {}) as Record<string, any>;
    const transformOrigin = String(layerStyles.transformOrigin || '50% 50%');
    const customOutline =
        layerStyles.outline
        || (
            layerStyles.outlineWidth
            ? `${layerStyles.outlineWidth} ${layerStyles.outlineStyle || 'solid'} ${layerStyles.outlineColor || '#ffffff'}`
            : undefined
        );
    const customOutlineOffset = layerStyles.outlineOffset;

    const renderContent = () => {
        const contentStyle = getContentBase(
            layerStyles.opacity,
            layerStyles.filter,
            layerStyles.borderRadius?.toString()
        );

        switch (layer.type) {
            case 'text': {
                const Tag: any = (layer.tag as any) || 'div';
                return React.createElement(
                    Tag,
                    {
                        style: {
                            ...contentStyle,
                            ...textStyleFromLayer
                        }
                    },
                    layer.content
                );
            }
            case 'image':
            case 'drawing':
                return layer.src ? (
                    <img
                        src={layer.src}
                        decoding="async"
                        loading="lazy"
                        style={{
                            ...contentStyle,
                            ...imageStyleFromLayer,
                            ...imageStyleOverrides
                        }}
                        alt={layer.alt || layer.name}
                    />
                ) : (
                    <div style={{ ...contentStyle, ...imagePlaceholder }}>
                        <ImageIcon size={24} style={{ opacity: 0.1 }} />
                    </div>
                );
            case 'particles':
                return <ParticleEffect effect={layer.effect} density={(layer as any).density} color={layerStyles.color} />;
            case 'canvas':
                return <NodeCanvas opacity={layerStyles.opacity as number} />;
            case 'lottie':
                return (
                    <div style={{ ...contentStyle, ...lottiePlaceholder }}>
                        LOTTIE
                    </div>
                );
            default:
                return <div style={contentStyle}>{layer.name}</div>;
        }
    };

    const wrapperZIndex = isSelected ? 1000 : (layerStyles.zIndex as number) || 1;
    const animationStyle = resolveAnimationStyle(layer.animation);

    return (
        <motion.div
            ref={wrapperRef}
            onPointerDown={handleLayerPointerDown}
            onContextMenu={handleContextMenu}
            whileHover={!isSelected && !layer.locked ? { scale: 1.02, boxShadow: '0 10px 30px rgba(0,255,130,0.1)' } : {}}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
                ...getLayerWrapperStyle(
                    resolvedLeft, resolvedTop,
                    `${resolvedWidth}px`,
                    `${resolvedHeight}px`,
                    wrapperZIndex as number,
                    layer.locked
                ),
                willChange: isSelected ? 'transform, left, top, width, height' : 'auto'
            }}
        >
            <div style={{ ...animationWrapper, ...animationStyle }}>
                <div style={{
                    ...getInnerContainerStyle(
                        resolvedTransform,
                        isSelected,
                        transformOrigin,
                        customOutline,
                        customOutlineOffset
                    ),
                    ...passthroughVisualStyle,
                }}>
                    {renderContent()}

                    {isSelected && !layer.locked && (
                        <>
                            <div style={rotateHandleOuter}>
                                <div style={rotateConnector} />
                                <RotateHandle onRotate={handleRotate} />
                            </div>
                            
                            <ResizeHandle position="nw" zoom={zoom} onResize={handleResizeDetailed} />
                            <ResizeHandle position="ne" zoom={zoom} onResize={handleResizeDetailed} />
                            <ResizeHandle position="sw" zoom={zoom} onResize={handleResizeDetailed} />
                            <ResizeHandle position="se" zoom={zoom} onResize={handleResizeDetailed} />
                            
                            <ResizeHandle position="n" zoom={zoom} onResize={handleResizeDetailed} />
                            <ResizeHandle position="s" zoom={zoom} onResize={handleResizeDetailed} />
                            <ResizeHandle position="e" zoom={zoom} onResize={handleResizeDetailed} />
                            <ResizeHandle position="w" zoom={zoom} onResize={handleResizeDetailed} />
                            
                            <div style={coordsLabel}>
                                {Math.round(resolvedLeft)},{Math.round(resolvedTop)} • {Math.round(resolvedWidth)}x{Math.round(resolvedHeight)}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {menu && (
                <div style={{ ...contextMenu, top: menu.y, left: menu.x }}>
                    <MenuBtn label="Duplicar Capa" icon={<Copy size={12}/>} onClick={() => { onDuplicate(); setMenu(null); }} />
                    <div style={menuDivider} />
                    <MenuBtn label="Enviar al Frente" icon={<ChevronRight size={12}/>} onClick={() => { onReorder('front'); setMenu(null); }} />
                    <MenuBtn label="Enviar al Fondo" icon={<ChevronRight size={12} style={{transform: 'rotate(180deg)'}}/>} onClick={() => { onReorder('back'); setMenu(null); }} />
                    <div style={menuDivider} />
                    <MenuBtn label="Eliminar" icon={<Trash2 size={12}/>} onClick={() => { onDelete(); setMenu(null); }} color={tokens.colors.accentError} />
                </div>
            )}
        </motion.div>
    );
});

/* --- SUBCOMPONENTS (RESOURCES) --- */

const NodeCanvas: React.FC<{ opacity?: number }> = ({ opacity = 0.2 }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const node = canvasRef.current;
        if (!node) return;
        let frame = 0;
        const paint = (width: number, height: number) => {
            if (width <= 0 || height <= 0) return;
            const dpr = window.devicePixelRatio || 1;
            const targetWidth = Math.max(1, Math.round(width * dpr));
            const targetHeight = Math.max(1, Math.round(height * dpr));
            if (node.width !== targetWidth) node.width = targetWidth;
            if (node.height !== targetHeight) node.height = targetHeight;
            const ctx = node.getContext('2d');
            if (!ctx) return;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            for (let i = 0; i < 35; i += 1) {
                ctx.beginPath();
                ctx.arc(Math.random() * width, Math.random() * height, 1.1, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        const schedulePaint = (width: number, height: number) => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => paint(width, height));
        };

        if (typeof ResizeObserver !== 'undefined') {
            const observer = new ResizeObserver((entries) => {
                const entry = entries[0];
                if (!entry) return;
                schedulePaint(entry.contentRect.width, entry.contentRect.height);
            });
            observer.observe(node);
            return () => { cancelAnimationFrame(frame); observer.disconnect(); };
        }
        return () => cancelAnimationFrame(frame);
    }, []);

    return <canvas ref={canvasRef} style={canvasOverlay(opacity || 0.2)} />;
};

const ParticleEffect: React.FC<{ effect?: string; density?: number; color?: string }> = ({ effect, density, color }) => {
    const normalizedEffect = String(effect || 'rain').trim().toLowerCase();
    const count = Math.max(1, Math.floor((density || 0.5) * 140));
    const particles = useMemo(() => Array.from({ length: count }, (_, idx) => ({
        id: idx,
        left: `${Math.random() * 100}%`,
        opacity: 0.15 + Math.random() * 0.5,
        delay: `${Math.random() * 5}s`,
        duration: `${2.5 + Math.random() * 3}s`,
    })), [count]);

    return (
        <div style={getParticleContainer(color)}>
            {particles.map((p) => {
                const anim = normalizedEffect === 'stars' ? `fadeIn 1.2s alternate infinite ${p.delay}` : `vko-particle-fall ${p.duration} linear infinite ${p.delay}`;
                return <div key={p.id} style={getParticleStyle(p, anim)} />;
            })}
        </div>
    );
};

const ResizeHandle: React.FC<{ 
    position: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w', 
    onResize: (updates: any) => void, 
    zoom: number 
}> = ({ position, onResize, zoom }) => {
    const handlePointerDown = (e: React.PointerEvent) => {
        e.stopPropagation();
        const startX = e.clientX;
        const startY = e.clientY;
        const onPointerMove = (moveEvt: PointerEvent) => {
            const dx = (moveEvt.clientX - startX) / zoom;
            const dy = (moveEvt.clientY - startY) / zoom;
            let dw = 0, dh = 0, dl = false, dt = false;
            switch (position) {
                case 'se': dw = dx; dh = dy; break;
                case 'sw': dw = -dx; dh = dy; dl = true; break;
                case 'ne': dw = dx; dh = -dy; dt = true; break;
                case 'nw': dw = -dx; dh = -dy; dl = true; dt = true; break;
                case 'n': dh = -dy; dt = true; break;
                case 's': dh = dy; break;
                case 'e': dw = dx; break;
                case 'w': dw = -dx; dl = true; break;
            }
            onResize({ dw, dh, dl, dt });
        };
        const onPointerUp = () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    };
    return <div data-layer-handle="true" onPointerDown={handlePointerDown} style={getResizeHandleStyle(position, position.length === 2)} />;
};

const RotateHandle: React.FC<{ onRotate: (angle: number) => void }> = ({ onRotate }) => {
    const handlePointerDown = (e: React.PointerEvent) => {
        e.stopPropagation();
        const parent = (e.currentTarget.parentElement?.parentElement as HTMLElement);
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const onPointerMove = (moveEvt: PointerEvent) => {
            const dx = moveEvt.clientX - centerX;
            const dy = moveEvt.clientY - centerY;
            const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
            onRotate(Math.round(angle));
        };
        const onPointerUp = () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    };
    return (
        <div data-layer-handle="true" onPointerDown={handlePointerDown} style={rotateHandleCircle}>
            <RotateCw size={12} color={tokens.colors.accentGreen} />
        </div>
    );
};

const MenuBtn: React.FC<{ label: string, icon: React.ReactNode, onClick: () => void, color?: string }> = ({ label, icon, onClick, color }) => (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} style={{ ...menuBtnStyle, color: color || 'white' }}>
        {icon} {label}
    </button>
);
