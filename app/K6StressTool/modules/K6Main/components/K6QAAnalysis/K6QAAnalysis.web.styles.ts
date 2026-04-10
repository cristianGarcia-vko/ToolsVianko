import { CSSProperties } from 'react';
import { tokens } from '../../../../../SharedTool/style/tokens.shared.style';

export const qaAnalysisStyles = {
    sectionHeader: {
        gridColumn: 'span 12',
        fontSize: '10px',
        fontWeight: 900,
        color: tokens.colors.accentTeal,
        letterSpacing: '2px',
        textTransform: 'uppercase' as const,
        marginTop: '20px',
        paddingLeft: '4px',
        borderLeft: `2px solid ${tokens.colors.accentTeal}`,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    } as CSSProperties,

    errorAnalysisGrid: {
        display: 'grid',
        gridTemplateColumns: 'minmax(200px, 300px) 1fr',
        gap: '12px'
    } as CSSProperties,

    glassCard: {
        background: 'rgba(17, 19, 26, 0.6)',
        border: '1px solid rgba(255,255,255,0.04)',
        borderRadius: '24px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column' as const,
        boxShadow: '0 40px 100px rgba(0,0,0,0.4)',
        position: 'relative' as const,
    } as CSSProperties,

    chartTitle: {
        fontSize: '11px',
        fontWeight: 900,
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: '1.5px',
        textTransform: 'uppercase' as const,
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    } as CSSProperties,

    httpCodesCard: {
        width: '100%',
        height: '140px',
        position: 'relative' as const,
        minHeight: '140px',
    } as CSSProperties,

    responsiveScrollContainer: {
        maxHeight: '200px',
        height: '100%',
        overflowY: 'auto' as const,
    } as CSSProperties,

    terminal: {
        background: '#090a0f',
        borderRadius: '16px',
        padding: '12px',
        fontSize: '10px',
        overflowY: 'auto' as const,
        height: '140px',
        fontFamily: "'JetBrains Mono', monospace",
        border: '1px solid rgba(255,255,255,0.03)',
    } as CSSProperties,

    endpointFoundRow: {
        color: tokens.colors.accentTeal,
        marginBottom: '4px',
        fontSize: '10px'
    } as CSSProperties,

    tooltipContainer: {
        background: 'rgba(11, 13, 19, 0.95)',
        border: `1px solid ${tokens.colors.accentTeal}40`,
        borderRadius: '12px',
        padding: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)',
    } as CSSProperties,

    tooltipLabel: {
        margin: '0 0 4px 0',
        fontSize: '10px',
        fontWeight: 800,
        color: 'rgba(255,255,255,0.8)',
        textTransform: 'uppercase' as const,
    } as CSSProperties,

    tooltipValue: {
        margin: '0',
        fontSize: '12px',
        fontWeight: 900,
        color: tokens.colors.accentGreen,
    } as CSSProperties,
};
