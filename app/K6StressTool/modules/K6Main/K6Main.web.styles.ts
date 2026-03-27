import { CSSProperties } from 'react';
import { tokens, ThemeTokens } from '../../../SharedTool/style/tokens.shared.style';

export const createK6Styles = (theme: ThemeTokens) => ({
    container: {
        width: '100%',
        minHeight: '100vh',
        background: 'transparent', // Hub provides the bg
        color: theme.colors.textMain,
        fontFamily: "'Inter', sans-serif",
        padding: '32px',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '32px',
        boxSizing: 'border-box' as const,
    } as CSSProperties,

    dashboardGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '24px',
        flex: 1,
    } as CSSProperties,

    kpiRow: {
        gridColumn: 'span 12',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
    } as CSSProperties,

    kpiCard: (accent: string = theme.colors.accentPurple) => ({
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '12px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        position: 'relative' as const,
        overflow: 'hidden',
    }) as CSSProperties,

    kpiAccent: (accent: string) => ({
        position: 'absolute' as const,
        top: 0,
        left: 0,
        width: '4px',
        height: '100%',
        background: accent,
        boxShadow: `0 0 20px ${accent}80`,
    }) as CSSProperties,

    kpiTitle: {
        fontSize: '10px',
        fontWeight: 900,
        color: 'rgba(255, 255, 255, 0.4)',
        textTransform: 'uppercase' as const,
        letterSpacing: '2px',
    } as CSSProperties,

    kpiValue: {
        fontSize: '32px',
        fontWeight: 900,
        color: 'white',
    } as CSSProperties,

    mainSection: {
        gridColumn: 'span 8',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '24px',
    } as CSSProperties,

    sidebarSection: {
        gridColumn: 'span 4',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '24px',
    } as CSSProperties,

    glassCard: {
        background: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(40px)',
        borderRadius: '32px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column' as const,
        boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
    } as CSSProperties,

    panelTitle: {
        fontSize: '14px',
        fontWeight: 900,
        letterSpacing: '2px',
        textTransform: 'uppercase' as const,
        color: 'white',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    } as CSSProperties,

    input: {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        padding: '16px 20px',
        color: 'white',
        fontSize: '13px',
        outline: 'none',
        transition: 'all 0.3s',
        width: '100%',
        boxSizing: 'border-box' as const,
    } as CSSProperties,

    button: (color: string) => ({
        background: `linear-gradient(135deg, ${color}, ${color}dd)`,
        color: '#080a0b',
        border: 'none',
        borderRadius: '16px',
        padding: '16px 32px',
        fontWeight: 900,
        fontSize: '12px',
        cursor: 'pointer',
        boxShadow: `0 15px 30px ${color}30`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        transition: 'all 0.4s',
        textTransform: 'uppercase' as const,
        letterSpacing: '1px',
    }) as CSSProperties,

    terminal: {
        background: 'rgba(0, 0, 0, 0.4)',
        borderRadius: '24px',
        padding: '24px',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '11px',
        color: theme.colors.accentMint,
        maxHeight: '300px',
        overflowY: 'auto' as const,
        border: '1px solid rgba(255, 255, 255, 0.05)',
    } as CSSProperties,

    chartContainer: {
        height: '300px',
    } as CSSProperties,

    formGroup: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '20px',
    } as CSSProperties,

    fieldLabel: {
        fontSize: '9px',
        fontWeight: 900,
        opacity: 0.4,
        letterSpacing: '1px',
        textTransform: 'uppercase' as const,
        display: 'block',
        marginBottom: '8px',
    } as CSSProperties,

    historyList: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '12px',
        overflowY: 'auto' as const,
    } as CSSProperties,

    historyCard: {
        padding: '16px',
        borderRadius: '16px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
    } as CSSProperties,

    historyName: {
        fontSize: '11px',
        fontWeight: 900,
    } as CSSProperties,

    historyScore: {
        fontSize: '9px',
        color: theme.colors.accentMint,
        fontWeight: 700,
    } as CSSProperties,
});

export const k6Styles = createK6Styles(tokens);
