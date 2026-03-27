import { CSSProperties } from 'react';
import { tokens, ThemeTokens } from '../../../SharedTool/style/tokens.shared.style';

export const createBannerStudioStyles = (theme: ThemeTokens) => ({
    container: {
        width: '100vw',
        height: '100vh',
        background: '#040506',
        backgroundImage: `
            radial-gradient(circle at 0% 0%, ${theme.colors.accentGreen}0d 0%, transparent 50%),
            radial-gradient(circle at 100% 100%, ${theme.colors.accentPurple}0d 0%, transparent 50%),
            linear-gradient(to bottom, transparent, #080a0b 80%)
        `,
        color: theme.colors.textMain,
        display: 'flex',
        flexDirection: 'column' as const,
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
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
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '32px',
        paddingRight: '32px',
        zIndex: 100,
        background: 'rgba(10, 10, 15, 0.4)',
        backdropFilter: 'blur(32px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    } as CSSProperties,

    mainLayout: {
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        padding: '20px',
        gap: '20px',
        background: 'transparent',
    } as CSSProperties,

    sidebar: {
        width: '80px',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        paddingTop: '32px',
        paddingBottom: '32px',
        gap: '24px',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(40px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
    } as CSSProperties,

    canvasAreaContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '20px',
    } as CSSProperties,

    canvasArea: {
        flex: 1,
        position: 'relative' as const,
        background: '#0c0d10',
        backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
        `,
        backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
        borderRadius: '32px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'inset 0 0 100px rgba(0,0,0,0.4)',
    } as CSSProperties,

    propertiesWrapper: {
        width: '340px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '20px',
    } as CSSProperties,

    bottomSelector: {
        height: '80px',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(40px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: '16px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
    } as CSSProperties,

    logoContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
    } as CSSProperties,

    logoIcon: {
        width: '48px',
        height: '48px',
        background: `linear-gradient(135deg, ${theme.colors.accentGreen}, ${theme.colors.accentTeal})`,
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#080a0b',
        fontWeight: 900,
        fontSize: '22px',
        boxShadow: `0 10px 25px ${theme.colors.accentGreen}40`,
    } as CSSProperties,

    historyControls: {
        display: 'flex',
        background: 'rgba(255,255,255,0.04)',
        padding: '6px',
        borderRadius: '14px',
        border: '1px solid rgba(255,255,255,0.06)',
    } as CSSProperties,

    perfBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(46, 229, 157, 0.08)',
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
        bottom: '32px',
        padding: '10px 24px',
        background: 'rgba(10, 10, 15, 0.4)',
        backdropFilter: 'blur(24px)',
        borderRadius: '100px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
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
        background: 'rgba(255,255,255,0.05)',
        border: 'none',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
    } as CSSProperties,

    libraryPanel: {
        flex: 1,
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column' as const,
        overflow: 'hidden',
    } as CSSProperties,

    libraryHeader: {
        padding: '24px',
        fontSize: '10px',
        fontWeight: 900,
        letterSpacing: '2px',
        color: theme.colors.accentGreen,
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    } as CSSProperties,

    libraryScroll: {
        flex: 1,
        overflowY: 'auto' as const,
        padding: '20px',
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
        gap: '12px',
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
        gap: '8px',
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
