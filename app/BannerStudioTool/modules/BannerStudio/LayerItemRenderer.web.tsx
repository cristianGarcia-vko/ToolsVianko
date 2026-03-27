import React, { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { BannerLayer } from './types';
import { ImageIcon, Type, Star, Activity, Maximize2, Zap, CloudRain, Sun, Moon, RotateCw, Move, Copy, ChevronRight, Trash2 } from 'lucide-react';
import { tokens } from '../../../SharedTool/style/tokens.shared.style';
import { useLayerItemLogic, readStylePx } from './LayerItemRenderer.web.logics';
import {
    getContentBase, imagePlaceholder,
    getLayerWrapperStyle, getInnerContainerStyle,
    rotateConnector, rotateHandleOuter, rotateHandleCircle,
    coordsLabel, contextMenu, menuDivider, menuBtnStyle,
    getResizeHandleStyle
} from './LayerItemRenderer.web.styles';
import './BannerAnimations.css';

const resolveAnimationKeyframesName = (name: string) => {
    const normalized = String(name || '').trim();
    if (!normalized) return '';
    const compact = normalized.replace(/[\s_]/g, '').toLowerCase();
    const map: Record<string, string> = {
        glow: 'glowPulse',
        glowpulse: 'glowPulse',
        bouncein: 'bounce',
        bounceinout: 'bounce',
        'bounce-in': 'bounce',
    };
    return map[compact] || normalized;
};

const resolveAnimationStyle = (animation?: BannerLayer['animation']): React.CSSProperties => {
    if (!animation?.name) return {};
    const keyframes = resolveAnimationKeyframesName(animation.name);
    if (!keyframes || keyframes === 'none') return {};
    return {
        animationName: keyframes,
        animationDuration: animation.duration || '1s',
        animationDelay: animation.delay || '0s',
        animationTimingFunction: (animation as any).easing || animation.timingFunction || 'ease',
        animationIterationCount: (animation as any).iterationCount ?? 1,
        animationFillMode: (animation as any).fillMode || 'forwards',
    };
};

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
            return () => {
                cancelAnimationFrame(frame);
                observer.disconnect();
            };
        }

        const onResize = () => {
            const rect = node.getBoundingClientRect();
            schedulePaint(rect.width, rect.height);
        };
        onResize();
        window.addEventListener('resize', onResize, { passive: true });
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('resize', onResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                opacity,
            }}
        />
    );
};

const ParticleEffect: React.FC<{ effect?: string; density?: number; color?: string }> = ({ effect, density, color }) => {
    const normalizedEffect = String(effect || 'rain').trim().toLowerCase();
    const rawDensity = density == null ? 0.5 : density;
    const normalizedDensity = rawDensity > 1 ? Math.min(rawDensity, 100) / 100 : Math.max(0, rawDensity);
    const count = Math.max(1, Math.floor(normalizedDensity * 140));

    const particles = useMemo(
        () =>
            Array.from({ length: count }, (_, index) => ({
                id: index,
                left: `${Math.random() * 100}%`,
                opacity: 0.15 + Math.random() * 0.5,
                delay: `${Math.random() * 5}s`,
                duration: `${2.5 + Math.random() * 3}s`,
            })),
        [count]
    );

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                background: 'transparent',
                color: color || 'white',
            }}
        >
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    style={{
                        position: 'absolute',
                        width: normalizedEffect === 'snow' ? '4px' : normalizedEffect === 'stars' ? '2px' : '1px',
                        height: normalizedEffect === 'snow' ? '4px' : normalizedEffect === 'stars' ? '2px' : '14px',
                        background: 'currentColor',
                        borderRadius: '50%',
                        left: particle.left,
                        top: '-20px',
                        opacity: particle.opacity,
                        animation:
                            normalizedEffect === 'stars'
                                ? `fadeIn 1.2s alternate infinite ${particle.delay}`
                                : `vko-particle-fall ${particle.duration} linear infinite ${particle.delay}`,
                    }}
                />
            ))}
        </div>
    );
};

interface LayerProps {
    layer: BannerLayer;
    isSelected: boolean;
    onSelect: (e: React.MouseEvent) => void;
    onUpdate: (id: string, updates: Partial<BannerLayer>) => void;
    onDelete: (id: string) => void;
    onDuplicate: () => void;
    onReorder: (id: string, action: 'front' | 'back' | 'forward' | 'backward') => void;
    zoom: number;
}

export const LayerItemRenderer: React.FC<LayerProps> = React.memo(({ 
    layer, isSelected, onSelect, onUpdate, onDelete, onDuplicate, onReorder, zoom 
}) => {
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
    } = useLayerItemLogic({ layer, zoom, onSelect, onUpdate, onDelete, onDuplicate, onReorder });

    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = wrapperRef.current;
        if (!el) return;
        el.addEventListener('wheel', handleWheelResize, { passive: false });
        return () => el.removeEventListener('wheel', handleWheelResize);
    }, [handleWheelResize]);

    if (!layer.visible) return null;

    const renderContent = () => {
        const contentStyle = getContentBase(
            layer.styles.opacity,
            layer.styles.filter,
            layer.styles.borderRadius?.toString()
        );

        switch (layer.type) {
            case 'text': {
                const Tag: any = (layer.tag as any) || 'div';
                return React.createElement(
                    Tag,
                    {
                        style: {
                            ...contentStyle,
                            display: 'block',
                            textAlign: (layer.styles.textAlign as any) || 'left',
                            whiteSpace: 'pre-wrap',
                            letterSpacing: layer.styles.letterSpacing || '0px',
                            textShadow: layer.styles.textShadow || 'none',
                            color: layer.styles.color || '#fff',
                            fontSize: layer.styles.fontSize || '16px',
                            fontWeight: layer.styles.fontWeight || 400,
                            fontStyle: layer.styles.fontStyle || 'normal',
                            fontFamily: layer.styles.fontFamily || 'Inter, sans-serif',
                            lineHeight: layer.styles.lineHeight || 1.2
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
                        style={{
                            ...contentStyle,
                            objectFit: layer.fit || (layer.type === 'drawing' ? 'contain' : 'contain'),
                            objectPosition: layer.position || 'center',
                        }}
                        alt={layer.alt || layer.name}
                    />
                ) : (
                    <div style={{ ...contentStyle, ...imagePlaceholder }}>
                        <ImageIcon size={24} style={{ opacity: 0.1 }} />
                    </div>
                );
            case 'shape':
                return (
                    <div style={{
                        ...contentStyle,
                        backgroundColor: layer.styles.backgroundColor || tokens.colors.accentGreen,
                        border: layer.styles.border || 'none'
                    }} />
                );
            case 'particles':
                return (
                    <div style={{ ...contentStyle, position: 'relative', background: 'transparent' }}>
                        <ParticleEffect effect={layer.effect} density={layer.density} color={layer.color} />
                    </div>
                );
            case 'canvas': {
                const effect = String(layer.effect || '').toLowerCase();
                return (
                    <div style={{ ...contentStyle, position: 'relative', background: 'transparent' }}>
                        {effect === 'nodes' ? (
                            <NodeCanvas opacity={layer.intensity ?? 0.2} />
                        ) : (
                            <ParticleEffect effect={effect || 'rain'} density={layer.density} color={layer.color} />
                        )}
                    </div>
                );
            }
            case 'animated': {
                const assetType = (layer as any).assetType || (layer.src ? 'image' : 'text');
                const Tag: any = (layer.tag as any) || (assetType === 'text' ? 'span' : 'div');

                if (assetType === 'image') {
                    return layer.src ? (
                        <img
                            src={layer.src}
                            style={{
                                ...contentStyle,
                                objectFit: layer.fit || 'cover',
                                objectPosition: layer.position || 'center',
                            }}
                            alt={layer.alt || layer.name}
                        />
                    ) : (
                        <div style={{ ...contentStyle, ...imagePlaceholder }}>
                            <ImageIcon size={24} style={{ opacity: 0.1 }} />
                        </div>
                    );
                }

                return React.createElement(
                    Tag,
                    {
                        style: {
                            ...contentStyle,
                            display: 'block',
                            textAlign: (layer.styles.textAlign as any) || 'left',
                            whiteSpace: 'pre-wrap',
                            letterSpacing: layer.styles.letterSpacing || '0px',
                            textShadow: layer.styles.textShadow || 'none',
                            color: layer.styles.color || '#fff',
                            fontSize: layer.styles.fontSize || '16px',
                            fontWeight: layer.styles.fontWeight || 400,
                            fontStyle: layer.styles.fontStyle || 'normal',
                            fontFamily: layer.styles.fontFamily || 'Inter, sans-serif',
                            lineHeight: layer.styles.lineHeight || 1.2
                        }
                    },
                    layer.content
                );
            }
            case 'lottie':
                return (
                    <div style={{
                        ...contentStyle,
                        border: '1px dashed rgba(255,255,255,0.25)',
                        borderRadius: '14px',
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '10px',
                        fontWeight: 900,
                        letterSpacing: '1px'
                    }}>
                        LOTTIE
                    </div>
                );
            default:
                return <div style={contentStyle}>{layer.name}</div>;
        }
    };

    const wrapperZIndex = isSelected ? 1000 : (layer.styles.zIndex as number) || 1;
    const animationStyle = resolveAnimationStyle(layer.animation);

    return (
        <motion.div
            ref={wrapperRef}
            onPointerDown={handleLayerPointerDown}
            onContextMenu={handleContextMenu}
            whileHover={!isSelected && !layer.locked ? { scale: 1.02, boxShadow: '0 10px 30px rgba(0,255,130,0.1)' } : {}}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={getLayerWrapperStyle(
                resolvedLeft, resolvedTop,
                `${resolvedWidth}px`,
                `${resolvedHeight}px`,
                wrapperZIndex,
                layer.locked
            )}
        >
            <div style={{ width: '100%', height: '100%', ...animationStyle }}>
                <div style={getInnerContainerStyle(resolvedTransform, isSelected)}>
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
                    <MenuBtn label="Enviar al Frente" icon={<ChevronRight size={12}/>} onClick={() => { onReorder(layer.id, 'front'); setMenu(null); }} />
                    <MenuBtn label="Enviar al Fondo" icon={<ChevronRight size={12} style={{transform: 'rotate(180deg)'}}/>} onClick={() => { onReorder(layer.id, 'back'); setMenu(null); }} />
                    <div style={menuDivider} />
                    <MenuBtn label="Eliminar" icon={<Trash2 size={12}/>} onClick={() => { onDelete(layer.id); setMenu(null); }} color={tokens.colors.accentError} />
                </div>
            )}
        </motion.div>
    );
});

/* --- SUBCOMPONENTS --- */

const ResizeHandle: React.FC<{ 
    position: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w', 
    onResize: (updates: { dw?: number; dh?: number; dl?: boolean; dt?: boolean; }) => void, 
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

    const isCorner = position.length === 2;
    return (
        <div 
            data-layer-handle="true" 
            onPointerDown={handlePointerDown} 
            style={getResizeHandleStyle(position, isCorner)}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            title="Redimensionar"
        />
    );
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
    <button 
        onClick={(e) => { e.stopPropagation(); onClick(); }} 
        style={{ ...menuBtnStyle, color: color || 'white' }} 
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} 
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
        {icon}
        {label}
    </button>
);
