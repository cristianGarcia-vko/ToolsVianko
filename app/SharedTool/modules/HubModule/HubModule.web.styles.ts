import { CSSProperties } from 'react';
import { tokens, ThemeTokens } from '../../style/tokens.shared.style';

export const createHubStyles = (theme: ThemeTokens) => ({
    screen: {
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: theme.colors.bg,
        position: 'relative',
        fontFamily: 'Inter, sans-serif',
    } as CSSProperties,

    hubContent: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        height: 'auto',
        minHeight: '100vh',
        zIndex: 10,
        position: 'relative',
        willChange: 'transform, opacity',
    } as CSSProperties,

    dragRegion: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '40px',
        zIndex: 9999,
        WebkitAppRegion: 'drag' as any,
        pointerEvents: 'none',
    } as CSSProperties,

    cardList: {
        display: 'flex',
        gap: '48px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: 'auto',
        maxWidth: '1200px',
        zIndex: 10,
    } as CSSProperties,

    moduleOverlay: {
        position: 'absolute' as any,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: theme.colors.bgGlass,
        zIndex: 100,
    } as CSSProperties,

    moduleHeader: {
        height: '50px',
        background: theme.colors.bgHeader,
        backdropFilter: `blur(${theme.blur.soft})`,
        borderBottom: `1px solid ${theme.colors.border}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        justifyContent: 'space-between',
    } as CSSProperties,

    moduleHeaderLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    } as CSSProperties,

    backButton: {
        background: theme.colors.bgDeep,
        border: `1px solid ${theme.colors.border}`,
        color: theme.colors.textMain,
        padding: '6px 15px',
        borderRadius: theme.borderRadius.inner,
        fontSize: '13px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s ease',
    } as CSSProperties,

    divider: {
        width: '1px',
        height: '20px',
        background: theme.colors.border,
    } as CSSProperties,

    moduleTitle: {
        fontSize: '14px',
        fontWeight: 700,
        letterSpacing: '1px',
        textTransform: 'uppercase',
    } as CSSProperties,

    versionInfo: {
        fontSize: '12px',
        color: theme.colors.textMuted,
        fontWeight: 500,
    } as CSSProperties,

    moduleBody: {
        height: 'calc(100% - 50px)',
        width: '100%',
    } as CSSProperties,
});

export const hubStyles = createHubStyles(tokens);

