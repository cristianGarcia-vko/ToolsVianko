import { CSSProperties } from 'react';
import { tokens, ThemeTokens } from '../../../SharedTool/style/tokens.shared.style';

export const createBannerStudioStyles = (theme: ThemeTokens) => ({
    container: {
        width: '100%',
        height: '100%',
        minHeight: '100%',
        background: 'transparent',
        color: theme.colors.textMain,
        display: 'flex',
        flexDirection: 'column' as const,
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
        padding: '6px',
        gap: '8px',
        boxSizing: 'border-box' as const,
        maxWidth: '100%',
        margin: '0px',
    } as CSSProperties,

    loadingOverlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 5, 8, 0.9)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
    } as CSSProperties,

    loadingIcon: {
        width: '80px',
        height: '80px',
        background: `linear-gradient(135deg, ${theme.colors.accentGreen}, ${theme.colors.accentPurple})`,
        borderRadius: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 0 50px ${theme.colors.accentGreen}30`,
        animation: 'pulse 2s infinite ease-in-out',
    } as CSSProperties,

    loadingText: {
        marginTop: '30px',
        color: 'white',
        fontSize: '10px',
        fontWeight: 900,
        letterSpacing: '5px',
        opacity: 0.8,
    } as CSSProperties,

    header: {
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '20px',
        paddingRight: '20px',
        zIndex: 100,
        background: 'rgba(10, 10, 15, 0.4)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
    } as CSSProperties,

    mainLayout: {
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        padding: '12px',
        gap: '12px',
        background: '#050608',
    } as CSSProperties,

    sidebar: {
        width: '64px',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        padding: '12px 0',
        gap: '6px',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
        zIndex: 10,
        willChange: 'transform',
    } as CSSProperties,

    drawingSidebar: {
        width: '200px',
        display: 'flex',
        flexDirection: 'column' as const,
        zIndex: 9,
        marginLeft: '-12px', 
        willChange: 'transform',
    } as CSSProperties,

    canvasAreaContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '12px',
    } as CSSProperties,

    canvasArea: {
        flex: 1,
        position: 'relative' as const,
        background: '#0c0d10',
        backgroundImage: `radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)`,
        backgroundSize: '30px 30px',
        borderRadius: '32px',
        border: '1px solid rgba(255, 255, 255, 0.03)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)',
        willChange: 'transform',
    } as CSSProperties,

    propertiesWrapper: {
        width: '320px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '12px',
    } as CSSProperties,

    bottomSelector: {
        height: '56px',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '12px',
        backdropFilter: 'blur(10px)',
    } as CSSProperties,

    logoContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    } as CSSProperties,

    logoIcon: {
        width: '32px',
        height: '32px',
        background: theme.colors.accentGreen,
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#000',
        fontWeight: 900,
        fontSize: '14px',
    } as CSSProperties,

    logoSubtitleContainer: {
        display: 'flex',
        gap: '8px',
        alignItems: 'baseline',
    } as CSSProperties,

    logoTitle: {
        fontSize: '12px',
        fontWeight: 900,
        letterSpacing: '2px',
    } as CSSProperties,

    logoAutomation: {
        fontSize: '8px',
        color: theme.colors.accentGreen,
        opacity: 0.6,
        fontWeight: 900,
        letterSpacing: '4px',
    } as CSSProperties,

    headerActions: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    } as CSSProperties,

    historyControls: {
        display: 'flex',
        gap: '4px',
        padding: '4px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '12px',
    } as CSSProperties,

    historyBtn: {
        width: '32px',
        height: '32px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        border: 'none',
        background: 'transparent',
        color: 'white',
        transition: 'opacity 0.2s',
    } as CSSProperties,

    toolsetWrapper: {
        display: 'flex',
        gap: '8px',
        alignItems: 'flex-start',
    } as CSSProperties,

    sidebarStack: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '4px',
        alignItems: 'center',
    } as CSSProperties,

    sidebarDivider: {
        width: '24px',
        height: '1px',
        background: 'rgba(255,255,255,0.05)',
        margin: '4px 0',
    } as CSSProperties,

    canvasWrapper: {
        transformOrigin: 'center center',
        transition: 'transform 0.1s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative' as const,
        boxShadow: '0 80px 160px rgba(0,0,0,0.8)',
        overflow: 'hidden' as const,
    } as CSSProperties,

    zoomDivider: {
        width: '1px',
        height: '20px',
        background: 'rgba(255,255,255,0.1)',
    } as CSSProperties,

    formatLabelArea: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginRight: '12px',
    } as CSSProperties,

    formatScrollArea: {
        display: 'flex',
        gap: '12px',
        overflowX: 'auto' as const,
        flex: 1,
        padding: '4px',
    } as CSSProperties,

    formatPill: {
        padding: '8px 20px',
        borderRadius: '14px',
        background: 'rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.05)',
        cursor: 'pointer',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        transition: 'all 0.3s',
    } as CSSProperties,

    formatPillActive: {
        padding: '8px 20px',
        borderRadius: '14px',
        background: 'rgba(255,255,255,0.08)',
        border: `1px solid ${theme.colors.accentGreen}80`,
        cursor: 'pointer',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        transition: 'all 0.3s',
    } as CSSProperties,

    formatPillDot: {
        width: '6px',
        height: '6px',
        borderRadius: '3px',
        transition: 'background 0.3s',
    } as CSSProperties,

    perfBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(46, 229, 157, 0.10)',
        color: theme.colors.accentGreen,
        padding: '6px 16px',
        border: '1px solid rgba(46, 229, 157, 0.15)',
        borderRadius: '100px',
        fontSize: '10px',
        fontWeight: 900,
        letterSpacing: '1px',
    } as CSSProperties,

    zoomControls: {
        position: 'absolute' as const,
        bottom: '24px',
        padding: '6px 16px',
        background: 'rgba(10, 15, 25, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '100px',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
    } as CSSProperties,

    iconBtn: {
        width: '48px',
        height: '48px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: 'none',
        color: 'rgba(255, 255, 255, 0.4)',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    } as CSSProperties,

    miniBtn: {
        width: '32px',
        height: '32px',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.10)',
        background: 'rgba(255,255,255,0.06)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
    } as CSSProperties,

    libraryPanel: {
        flex: 1,
        border: '1px solid transparent',
        background: `
            linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)) padding-box,
            linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04)) border-box
        `,
        borderRadius: '26px',
        display: 'flex',
        flexDirection: 'column' as const,
        overflow: 'hidden',
        backdropFilter: 'blur(44px)',
        WebkitBackdropFilter: 'blur(44px)',
        boxShadow: '0 40px 110px rgba(0,0,0,0.45)',
    } as CSSProperties,

    libraryHeader: {
        padding: '12px',
        fontSize: '10px',
        fontWeight: 900,
        letterSpacing: '2px',
        color: theme.colors.accentGreen,
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    } as CSSProperties,

    libraryScroll: {
        flex: 1,
        overflowY: 'auto' as const,
        padding: '10px',
    } as CSSProperties,

    librarySectionHeader: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'none',
        border: 'none',
        padding: '8px 0',
        color: 'white',
        fontSize: '9px',
        fontWeight: 900,
        textTransform: 'uppercase' as const,
        letterSpacing: '1px',
        cursor: 'pointer',
        opacity: 0.6,
    } as CSSProperties,

    libraryGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        marginTop: '12px',
    } as CSSProperties,

    libraryItem: {
        aspectRatio: '1',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        color: 'white',
    } as CSSProperties,

    assetPreview: {
        width: '32px',
        height: '32px',
        background: theme.colors.accentGreen,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: 900,
        color: '#080a0b',
    } as CSSProperties,
});

export const studioStyles = createBannerStudioStyles(tokens);
