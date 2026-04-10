import { CSSProperties } from 'react';
import { tokens } from '../../../../../SharedTool/style/tokens.shared.style';

export const historyStyles = {
    glassCard: {
        background: 'rgba(17, 19, 26, 0.6)',
        border: '1px solid rgba(255,255,255,0.04)',
        borderRadius: '24px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column' as const,
        boxShadow: '0 40px 100px rgba(0,0,0,0.4)',
        position: 'relative' as const,
        flex: 1,
        maxHeight: '200px',
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

    terminal: {
        background: '#090a0f',
        borderRadius: '16px',
        padding: '12px',
        fontSize: '10px',
        overflowY: 'auto' as const,
        fontFamily: "'JetBrains Mono', monospace",
        border: '1px solid rgba(255,255,255,0.03)',
        height: '100%',
    } as CSSProperties,

    historyLineItem: (hasFailed: boolean) => ({
        marginBottom: '8px',
        borderLeft: `2px solid ${hasFailed ? tokens.colors.accentError : tokens.colors.accentGreen}`,
        paddingLeft: '8px'
    }) as CSSProperties,

    historyTimestamp: {
        fontSize: '9px',
        opacity: 0.4
    } as CSSProperties,

    historyProjectName: {
        fontWeight: 900,
        fontSize: '10px'
    } as CSSProperties,
};
