import { CSSProperties } from 'react';
import { tokens } from '../../../SharedTool/style/tokens.shared.style';

export const drawingStyles = {
    container: {
        position: 'fixed', inset: 0, zIndex: 3000,
        display: 'flex', background: 'rgba(0,0,0,0.95)',
        backdropFilter: 'blur(40px)',
    } as CSSProperties,

    sidebar: {
        width: '200px',
        display: 'flex',
        flexDirection: 'column' as const,
        padding: '16px',
        gap: '12px',
        background: 'rgba(15, 20, 30, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '20px 0 60px rgba(0,0,0,0.5)',
    } as CSSProperties,

    header: {
        padding: '0 8px',
        display: 'flex', alignItems: 'center', gap: '8px',
        fontSize: '10px', fontWeight: 900, letterSpacing: '2px',
        color: tokens.colors.accentGreen,
    } as CSSProperties,

    tabNav: {
        display: 'flex', background: 'rgba(255,255,255,0.02)',
        margin: '16px', borderRadius: '14px',
        border: `1px solid ${tokens.colors.border}`, padding: '4px',
    } as CSSProperties,

    tab: (active: boolean): CSSProperties => ({
        flex: 1, height: '36px', border: 'none', borderRadius: '10px',
        background: active ? tokens.colors.accentPurple : 'transparent',
        color: active ? 'white' : 'rgba(255,255,255,0.4)',
        cursor: 'pointer', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
    }),

    scrollArea: {
        flex: 1, overflowY: 'auto', padding: '16px',
        display: 'flex', flexDirection: 'column', gap: '24px',
    } as CSSProperties,

    group: {
        display: 'flex', flexDirection: 'column',
    } as CSSProperties,

    label: {
        fontSize: '9px', fontWeight: 900, letterSpacing: '2px',
        opacity: 0.3, marginBottom: '12px', textTransform: 'uppercase',
    } as CSSProperties,

    grid: {
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px',
    } as CSSProperties,

    toolBtn: (active: boolean): CSSProperties => ({
        aspectRatio: '1', borderRadius: '12px',
        background: active ? `${tokens.colors.accentPurple}20` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${active ? tokens.colors.accentPurple : tokens.colors.border}`,
        color: active ? tokens.colors.accentPurple : 'white',
        cursor: 'pointer', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
    }),

    miniPlus: {
        width: '24px', height: '24px', borderRadius: '6px',
        border: `1px solid ${tokens.colors.border}`,
        background: 'none', color: tokens.colors.accentPurple,
        cursor: 'pointer',
    } as CSSProperties,

    layerRow: (active: boolean): CSSProperties => ({
        padding: '12px', borderRadius: '12px',
        border: `1px solid ${active ? tokens.colors.accentPurple : tokens.colors.border}`,
        background: active ? `${tokens.colors.accentPurple}10` : 'rgba(255,255,255,0.02)',
        cursor: 'pointer', display: 'flex',
        alignItems: 'center', gap: '12px',
    }),

    layerActionBtn: (color: string): CSSProperties => ({
        background: 'none', border: 'none', cursor: 'pointer',
        color, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
    }),

    colorPicker: {
        width: '100%', height: '44px', border: 'none',
        borderRadius: '14px', background: 'none', cursor: 'pointer',
    } as CSSProperties,

    mainArea: {
        flex: 1, display: 'flex', flexDirection: 'column',
    } as CSSProperties,

    viewportHeader: {
        height: '80px', padding: '0 40px',
        borderBottom: `1px solid ${tokens.colors.border}`,
        display: 'flex', alignItems: 'center',
        justifyContent: 'flex-end', gap: '12px',
    } as CSSProperties,

    applyBtn: {
        padding: '12px 24px', background: tokens.colors.accentSuccess,
        color: 'white', border: 'none', borderRadius: '16px',
        fontWeight: 900, fontSize: '11px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '10px',
    } as CSSProperties,

    cancelBtn: {
        padding: '12px 24px', background: 'none',
        border: `1px solid ${tokens.colors.border}`,
        borderRadius: '16px', color: 'white',
        fontWeight: 900, fontSize: '11px', cursor: 'pointer',
    } as CSSProperties,

    canvasArea: {
        flex: 1, padding: '40px', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
    } as CSSProperties,

    canvasWrapper: {
        background: 'white', position: 'relative',
        boxShadow: '0 50px 100px rgba(0,0,0,0.8)',
        overflow: 'hidden', borderRadius: '8px',
    } as CSSProperties,

    layerCanvas: (zIndex: number, visible: boolean): CSSProperties => ({
        position: 'absolute', inset: 0,
        zIndex: zIndex + 1,
        visibility: visible ? 'visible' : 'hidden',
        pointerEvents: 'none',
    }),

    overlayCanvas: {
        position: 'absolute', inset: 0,
        zIndex: 1000, cursor: 'crosshair',
    } as CSSProperties,

    layerName: {
        flex: 1, fontSize: '10px', fontWeight: 900,
    } as CSSProperties,

    layerHeader: {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '16px',
    } as CSSProperties,

    layerList: {
        display: 'flex', flexDirection: 'column', gap: '8px',
    } as CSSProperties,
};
