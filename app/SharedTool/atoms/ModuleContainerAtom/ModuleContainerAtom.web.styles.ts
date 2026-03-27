import { CSSProperties } from 'react';
import { ThemeTokens, tokens } from '../../style/tokens.shared.style';
import { hubStyles } from '../../modules/HubModule/HubModule.web.styles';

export const createContainerStyles = (theme: ThemeTokens) => ({
    overlay: {
        ...hubStyles.moduleOverlay,
        background: theme.colors.bg,
        willChange: 'transform, opacity',
    } as CSSProperties,

    header: {
        ...hubStyles.moduleHeader,
        background: theme.colors.bgHeader,
        borderBottom: `1px solid ${theme.colors.border}`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        height: '64px', // More premium height
        padding: '0 30px',
        WebkitAppRegion: 'drag' as any, // Allow dragging the window from here
        cursor: 'default',
    } as CSSProperties,

    backButton: {
        ...hubStyles.backButton,
        border: 'none',
        borderRadius: '12px',
        padding: '8px 16px',
        background: theme.colors.border,
        fontWeight: 600,
        transition: 'all 0.2s cubic-bezier(0.19, 1, 0.22, 1)',
        WebkitAppRegion: 'no-drag' as any, // Button must be interactable
    } as CSSProperties,

    title: {
        ...hubStyles.moduleTitle,
        fontSize: '13px',
        fontWeight: 800,
        letterSpacing: '2px',
        WebkitAppRegion: 'no-drag' as any,
    } as CSSProperties,

    meta: {
        ...hubStyles.versionInfo,
        fontSize: '11px',
        opacity: 0.4,
        letterSpacing: '1px',
        fontWeight: 700,
        WebkitAppRegion: 'no-drag' as any,
    } as CSSProperties,

    body: {
        height: 'calc(100% - 64px)',
        width: '100%',
        overflowY: 'auto', // Enable vertical scroll
        overflowX: 'hidden',
    } as CSSProperties,
});

export const containerStyles = createContainerStyles(tokens);
