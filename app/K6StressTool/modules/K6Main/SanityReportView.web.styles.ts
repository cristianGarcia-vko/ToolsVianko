import React from 'react';
import { tokens } from '../../../SharedTool/style/tokens.shared.style';

export const reportStyles = {
    overlay: { 
        position: 'fixed' as const, 
        inset: 0, 
        background: 'rgba(0,0,0,0.85)', 
        backdropFilter: 'blur(20px)', 
        zIndex: 10000, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '40px' 
    },
    container: { 
        width: '100%', 
        maxWidth: '1200px', 
        maxHeight: '100%', 
        background: 'rgba(15,15,25,0.8)', 
        border: '1px solid rgba(255,255,255,0.1)', 
        borderRadius: '32px', 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden', 
        boxShadow: '0 40px 100px rgba(0,0,0,0.8)' 
    },
    header: { 
        padding: '32px', 
        borderBottom: '1px solid rgba(255,255,255,0.08)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
    },
    contentGrid: { 
        flex: 1, 
        overflowY: 'auto' as const, 
        padding: '32px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '32px' 
    },
    kpiRow: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '20px' 
    },
    kpiCard: (color: string): React.CSSProperties => ({ 
        background: 'rgba(255,255,255,0.02)', 
        padding: '24px', 
        borderRadius: '24px', 
        border: `1px solid rgba(255,255,255,0.05)`, 
        borderLeft: `4px solid ${color}` 
    }),
    badge: (color: string): React.CSSProperties => ({ 
        padding: '4px 12px', 
        borderRadius: '100px', 
        background: color + '22', 
        color: color, 
        fontSize: '11px', 
        fontWeight: 900, 
        letterSpacing: '1px' 
    }),
    btnAlt: { 
        background: 'rgba(255,255,255,0.05)', 
        border: '1px solid rgba(255,255,255,0.1)', 
        color: 'white', 
        padding: '10px 20px', 
        borderRadius: '12px', 
        fontSize: '12px', 
        fontWeight: 900, 
        cursor: 'pointer', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px' 
    },
    closeBtn: { 
        background: 'transparent', 
        border: 'none', 
        color: tokens.colors.textMuted, 
        cursor: 'pointer' 
    },
    sectionTitle: { 
        fontSize: '12px', 
        fontWeight: 900, 
        letterSpacing: '2px', 
        color: tokens.colors.accentPurple 
    },
    chartSection: { 
        background: 'rgba(255,255,255,0.02)', 
        padding: '32px', 
        borderRadius: '24px', 
        border: '1px solid rgba(255,255,255,0.03)' 
    },
    tableSection: { 
        background: 'rgba(255,255,255,0.02)', 
        padding: '32px', 
        borderRadius: '24px', 
        border: '1px solid rgba(255,255,255,0.03)' 
    },
    table: { 
        width: '100%', 
        borderCollapse: 'collapse' as const, 
        marginTop: '20px', 
        minWidth: '600px' 
    },
    th: { 
        textAlign: 'left' as const, 
        padding: '16px', 
        fontSize: '11px', 
        fontWeight: 900, 
        color: tokens.colors.textMuted, 
        borderBottom: '1px solid rgba(255,255,255,0.05)' 
    },
    td: { 
        padding: '20px 16px', 
        fontSize: '13px', 
        borderBottom: '1px solid rgba(255,255,255,0.03)' 
    },
    statusBadge: (color: string): React.CSSProperties => ({ 
        padding: '4px 10px', 
        borderRadius: '8px', 
        background: color + '1A', 
        color: color, 
        fontSize: '10px', 
        fontWeight: 900 
    }),

    headerTitleRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    } as React.CSSProperties,

    headerActions: {
        display: 'flex',
        gap: '12px',
    } as React.CSSProperties,

    chartBox: {
        height: '240px',
        width: '100%',
        marginTop: '20px',
    } as React.CSSProperties,

    tableScroll: {
        overflowX: 'auto' as const,
    } as React.CSSProperties,

    epMain: {
        fontWeight: 800,
    } as React.CSSProperties,

    epSub: {
        fontSize: '10px',
        opacity: 0.5,
    } as React.CSSProperties,

    kpiHeader: {
        display: 'flex',
        justifyContent: 'space-between',
    } as React.CSSProperties,

    kpiLabel: {
        fontSize: '10px',
        fontWeight: 900,
        letterSpacing: '2px',
        opacity: 0.6,
    } as React.CSSProperties,

    kpiMain: {
        fontSize: '24px',
        fontWeight: 900,
        marginTop: '12px',
    } as React.CSSProperties,
};
