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
        padding: '4px',
        gap: '6px',
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
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '20px',
        paddingRight: '20px',
        zIndex: 100,
        background: '#0b0f14',
        backdropFilter: 'none',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
    } as CSSProperties,

    mainLayout: {
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        padding: '10px',
        gap: '10px',
        background: '#050608',
    } as CSSProperties,

    sidebar: {
        width: '64px',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        padding: '12px 0',
        gap: '6px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.08)',
        background: '#0d1117',
        backdropFilter: 'none',
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
        borderRadius: '14px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'inset 0 0 48px rgba(0,0,0,0.55)',
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
        background: '#0d1117',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '12px',
        backdropFilter: 'none',
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
        borderRadius: '8px',
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
        gap: '10px',
    } as CSSProperties,

    historyControls: {
        display: 'flex',
        gap: '4px',
        padding: '4px',
        background: '#10161f',
        borderRadius: '8px',
    } as CSSProperties,

    historyBtn: {
        width: '32px',
        height: '32px',
        borderRadius: '8px',
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
        boxShadow: '0 32px 80px rgba(0,0,0,0.55)',
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
        borderRadius: '8px',
        background: '#10161f',
        border: '1px solid rgba(255,255,255,0.08)',
        cursor: 'pointer',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        transition: 'all 0.3s',
    } as CSSProperties,

    formatPillActive: {
        padding: '8px 20px',
        borderRadius: '8px',
        background: 'rgba(46,229,157,0.12)',
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
        background: '#0d1117',
        backdropFilter: 'none',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 14px 30px rgba(0,0,0,0.35)',
    } as CSSProperties,

    iconBtn: {
        width: '36px',
        height: '36px',
        borderRadius: '8px',
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
        borderRadius: '8px',
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
        border: '1px solid rgba(255,255,255,0.08)',
        background: '#0d1117',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column' as const,
        overflow: 'hidden',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        boxShadow: 'none',
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
        background: '#10161f',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px',
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
