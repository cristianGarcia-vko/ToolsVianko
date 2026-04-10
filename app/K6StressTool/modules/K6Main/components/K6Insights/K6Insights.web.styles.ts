import { CSSProperties } from 'react';
import { tokens } from '../../../../../SharedTool/style/tokens.shared.style';

export const insightsStyles = {
    sectionHeader: {
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

    insightCard: {
        background: 'rgba(255,255,50,0.05)',
        border: '1px solid rgba(255,255,50,0.1)',
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '8px',
    } as CSSProperties,

    insightHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    } as CSSProperties,

    insightDot: {
        background: '#FFD700',
        borderRadius: '50%',
        width: '8px',
        height: '8px'
    } as CSSProperties,

    insightTitle: {
        fontSize: '12px',
        fontWeight: 900,
        color: '#FFD700'
    } as CSSProperties,

    insightText: {
        fontSize: '11px',
        lineHeight: '1.6',
        opacity: 0.8,
        color: 'white'
    } as CSSProperties,
};
