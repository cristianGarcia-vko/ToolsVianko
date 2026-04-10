import { CSSProperties } from 'react';
import { tokens } from '../../../../../SharedTool/style/tokens.shared.style';

export const dashboardStyles = {
    mainPanel: {
        gridColumn: 'span 8',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '12px',
        overflowY: 'auto' as const,
        maxHeight: 'calc(100vh - 100px)',
        paddingRight: '6px',
    } as CSSProperties,

    tickerRow: {
        display: 'flex',
        gap: '20px',
        overflowX: 'auto' as const,
        paddingBottom: '8px',
        borderBottom: '1px solid rgba(255,255,255,0.03)',
    } as CSSProperties,

    tickerItem: {
        display: 'flex',
        flexDirection: 'column' as const,
        minWidth: '120px',
        gap: '2px',
    } as CSSProperties,

    tickerLabelGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '9px',
        fontWeight: 900,
        opacity: 0.4,
        color: 'white',
        textTransform: 'uppercase' as const,
    } as CSSProperties,

    tickerValueGroup: {
        display: 'flex',
        alignItems: 'baseline',
        gap: '6px'
    } as CSSProperties,

    tickerValue: (color: string) => ({
        fontSize: '18px',
        fontWeight: 900,
        color
    }) as CSSProperties,

    tickerTrend: {
        fontSize: '9px',
        color: tokens.colors.accentGreen,
        fontWeight: 900
    } as CSSProperties,

    tickerSparkline: {
        height: '24px',
        width: '100%',
        opacity: 0.5,
        position: 'relative' as const,
        minHeight: '24px',
        marginTop: '2px',
    } as CSSProperties,

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

    dashboardLayout: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
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

    chartContainer: {
        width: '100%',
        height: '240px',
        position: 'relative' as const,
        minHeight: '240px',
    } as CSSProperties,

    tooltipContainer: {
        background: 'rgba(11, 13, 19, 0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)',
    } as CSSProperties,

    tooltipLabel: {
        margin: '0 0 8px 0',
        fontSize: '10px',
        fontWeight: 800,
        color: 'rgba(255,255,255,0.5)',
        textTransform: 'uppercase' as const,
    } as CSSProperties,

    tooltipItem: {
        fontSize: '12px',
        fontWeight: 700,
        margin: '4px 0',
        display: 'flex',
        justifyContent: 'space-between',
        gap: '12px',
    } as CSSProperties,
};
