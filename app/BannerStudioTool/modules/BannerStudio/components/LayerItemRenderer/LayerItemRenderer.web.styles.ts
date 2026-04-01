import { CSSProperties } from 'react';
import { tokens } from '../../../../../SharedTool/style/tokens.shared.style';

/* ============================
   LayerItemRenderer Style Tokens
   ============================ */

export const getContentBase = (opacity: number | string = 1, filter = 'none', borderRadius = '0px'): CSSProperties => ({
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    opacity: opacity ?? 1,
    filter: filter || 'none',
    borderRadius: borderRadius || '0px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
});

export const imagePlaceholder: CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px dashed rgba(255,255,255,0.1)'
};

export const getLayerWrapperStyle = (
    resolvedLeft: number,
    resolvedTop: number,
    width: string,
    height: string,
    zIndex: number,
    locked: boolean
): CSSProperties => ({
    position: 'absolute',
    left: `${resolvedLeft}px`,
    top: `${resolvedTop}px`,
    width: width || '100px',
    height: height || '100px',
    zIndex,
    cursor: locked ? 'default' : 'move',
    userSelect: 'none'
});

export const getInnerContainerStyle = (transform: string, isSelected: boolean): CSSProperties => ({
    width: '100%',
    height: '100%',
    transform: transform,
    transformOrigin: '50% 50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: isSelected ? `2px solid ${tokens.colors.accentGreen}` : 'none',
    outlineOffset: '2px',
    position: 'relative'
});

export const rotateConnector: CSSProperties = {
    width: '2px', height: '30px',
    background: tokens.colors.accentGreen,
    opacity: 0.5
};

export const rotateHandleOuter: CSSProperties = {
    position: 'absolute', top: '-60px', left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex', flexDirection: 'column-reverse',
    alignItems: 'center'
};

export const rotateHandleCircle: CSSProperties = {
    width: '24px', height: '24px', borderRadius: '50%',
    border: `2px solid ${tokens.colors.accentGreen}`,
    background: `
        radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(255,255,255,0.65)),
        linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.04))
    `,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'alias', boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
};

export const coordsLabel: CSSProperties = {
    position: 'absolute', bottom: '-22px', left: '50%',
    transform: 'translateX(-50%)',
    border: '1px solid transparent',
    background: `
        linear-gradient(180deg, rgba(15,15,25,0.86), rgba(15,15,25,0.62)) padding-box,
        linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06), ${tokens.colors.glowGreen}) border-box
    `,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    color: tokens.colors.accentGreen,
    fontSize: '8px', fontWeight: 900, padding: '2px 8px',
    borderRadius: '4px', zIndex: 10001, whiteSpace: 'nowrap'
};

export const contextMenu: CSSProperties = {
    position: 'fixed',
    border: '1px solid transparent',
    background: `
        linear-gradient(180deg, rgba(15,15,25,0.86), rgba(15,15,25,0.62)) padding-box,
        linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06), ${tokens.colors.glowDeep}) border-box
    `,
    backdropFilter: 'blur(28px)',
    WebkitBackdropFilter: 'blur(28px)',
    borderRadius: '12px', padding: '6px',
    zIndex: 100000, display: 'flex', flexDirection: 'column',
    minWidth: '180px', boxShadow: '0 40px 120px rgba(0,0,0,0.85)'
};

export const menuDivider: CSSProperties = {
    height: '1px', background: 'rgba(255,255,255,0.05)',
    margin: '3px 6px'
};

export const menuBtnStyle: CSSProperties = {
    padding: '8px 10px', background: 'transparent',
    border: 'none', borderRadius: '8px',
    fontSize: '11px', fontWeight: 700,
    textAlign: 'left', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '8px',
    color: 'rgba(255,255,255,0.85)'
};

export const getTextStyle = (styles: any): CSSProperties => ({
    display: 'block',
    textAlign: (styles.textAlign as any) || 'left',
    whiteSpace: 'pre-wrap',
    letterSpacing: styles.letterSpacing || '0px',
    textShadow: styles.textShadow || 'none',
    color: styles.color || '#fff',
    fontSize: styles.fontSize || '16px',
    fontWeight: styles.fontWeight || 400,
    fontStyle: styles.fontStyle || 'normal',
    fontFamily: styles.fontFamily || 'Inter, sans-serif',
    lineHeight: styles.lineHeight || 1.2,
    wordBreak: 'break-word',
    overflowWrap: 'break-word'
});

export const getImageStyle = (fit: any, position: string): CSSProperties => ({
    width: '100%',
    height: '100%',
    objectFit: fit || 'cover',
    objectPosition: position || 'center',
});

export const lottiePlaceholder: CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px dashed rgba(255,255,255,0.25)',
    borderRadius: '14px',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '10px',
    fontWeight: 900,
    letterSpacing: '1px'
};

export const animationWrapper: CSSProperties = {
    width: '100%',
    height: '100%'
};

export const getParticleContainer = (color?: string): CSSProperties => ({
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    background: 'transparent',
    color: color || 'white',
    contain: 'strict'
});

export const getParticleStyle = (p: any, animation: string): CSSProperties => ({
    position: 'absolute',
    width: '2px',
    height: '10px',
    background: 'currentColor',
    borderRadius: '50%',
    left: p.left,
    top: '-20px',
    opacity: p.opacity,
    willChange: 'transform',
    animation: animation
});

export const canvasOverlay = (opacity: number): CSSProperties => ({
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    opacity
});

export const getResizeHandleStyle = (position: string, isCorner: boolean): CSSProperties => ({
    position: 'absolute',
    width: '14px', height: '14px',
    background: 'white',
    border: `2px solid ${tokens.colors.accentGreen}`,
    borderRadius: isCorner ? '3px' : '50%',
    cursor: `${position}-resize`,
    zIndex: 10003,
    transition: 'transform 0.2s',
    ...(position === 'nw' && { top: '-7px', left: '-7px' }),
    ...(position === 'ne' && { top: '-7px', right: '-7px' }),
    ...(position === 'sw' && { bottom: '-7px', left: '-7px' }),
    ...(position === 'se' && { bottom: '-7px', right: '-7px' }),
    ...(position === 'n' && { top: '-7px', left: '50%', marginLeft: '-7px' }),
    ...(position === 's' && { bottom: '-7px', left: '50%', marginLeft: '-7px' }),
    ...(position === 'e' && { right: '-7px', top: '50%', marginTop: '-7px' }),
    ...(position === 'w' && { left: '-7px', top: '50%', marginTop: '-7px' }),
});
