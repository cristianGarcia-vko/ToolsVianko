import { CSSProperties } from 'react';
import { ThemeTokens, tokens } from '../../style/tokens.shared.style';
import { hubStyles } from '../../modules/HubModule/HubModule.web.styles';

export const createContainerStyles = (theme: ThemeTokens) => ({
    overlay: {
        ...hubStyles.moduleOverlay,
        backgroundColor: theme.colors.bg,
        backgroundImage: `
            radial-gradient(circle at 12% 18%, ${theme.colors.glowDeep} 0%, transparent 55%),
            radial-gradient(circle at 88% 22%, ${theme.colors.glowPurple} 0%, transparent 60%),
            radial-gradient(circle at 45% 120%, ${theme.colors.glowGreen} 0%, transparent 60%),
            linear-gradient(180deg, rgba(255,255,255,0.06), transparent 45%),
            radial-gradient(rgba(255, 255, 255, 0.045) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%, 46px 46px',
        overflow: 'hidden',
        willChange: 'transform, opacity',
    } as CSSProperties,

    header: {
        ...hubStyles.moduleHeader,
        border: '1px solid transparent',
        background: `
            linear-gradient(180deg, rgba(15,15,25,0.75), rgba(15,15,25,0.42)) padding-box,
            linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06), ${theme.colors.glowDeep}) border-box
        `,
        borderBottom: `1px solid rgba(255,255,255,0.10)`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        height: '52px', // Compact height
        padding: '0 12px',
        boxShadow: '0 25px 70px rgba(0,0,0,0.45)',
        WebkitAppRegion: 'drag' as any, // Allow dragging the window from here
        cursor: 'default',
    } as CSSProperties,

    backButton: {
        ...hubStyles.backButton,
        border: '1px solid transparent',
        borderRadius: '12px',
        padding: '8px 16px',
        background: `
            linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04)) padding-box,
            linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.05)) border-box
        `,
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
        height: 'calc(100% - 52px)',
        width: '100%',
        overflowY: 'auto', // Enable vertical scroll
        overflowX: 'hidden',
    } as CSSProperties,
});

export const containerStyles = createContainerStyles(tokens);
