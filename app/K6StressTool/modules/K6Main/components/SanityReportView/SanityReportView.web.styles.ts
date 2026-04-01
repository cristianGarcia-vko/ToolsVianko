import React from 'react';
import { tokens } from '../../../../../SharedTool/style/tokens.shared.style';

export const reportStyles = {
    overlay: { 
        position: 'fixed' as const, 
        inset: 0, 
        background: 'rgba(4,6,8,0.78)', 
        backdropFilter: 'blur(28px)', 
        zIndex: 10000, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '16px', 
    } as React.CSSProperties,
    container: { 
        width: '100%', 
        maxWidth: '1200px', 
        maxHeight: '100%', 
        border: '1px solid transparent', 
        background: `
            radial-gradient(circle at 12% 18%, ${tokens.colors.glowDeep} 0%, transparent 60%) padding-box,
            linear-gradient(180deg, rgba(15,15,25,0.82), rgba(15,15,25,0.62)) padding-box,
            linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06), ${tokens.colors.glowDeep}) border-box
        `, 
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        borderRadius: '32px', 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden', 
        boxShadow: '0 60px 160px rgba(0,0,0,0.85)' 
    } as React.CSSProperties,
    header: { 
        padding: '16px', 
        borderBottom: '1px solid rgba(255,255,255,0.08)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
    } as React.CSSProperties,
    contentGrid: { 
        flex: 1, 
        overflowY: 'auto' as const, 
        padding: '16px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px' 
    } as React.CSSProperties,
    kpiRow: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '10px' 
    } as React.CSSProperties,
    kpiCard: (color: string): React.CSSProperties => ({ 
        border: '1px solid transparent',
        background: `
            radial-gradient(circle at 12% 18%, ${color}22 0%, transparent 55%) padding-box,
            linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02)) padding-box,
            linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06), ${color}22) border-box
        `,
        padding: '12px', 
        borderRadius: '16px', 
        boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
    }),
    badge: (color: string): React.CSSProperties => ({ 
        padding: '4px 10px', 
        borderRadius: '100px', 
        background: color + '22', 
        color: color, 
        fontSize: '10px', 
        fontWeight: 900, 
        letterSpacing: '1px' 
    }),
    btnAlt: { 
        border: '1px solid transparent',
        background: `
            linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04)) padding-box,
            linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.06)) border-box
        `,
        color: 'white', 
        padding: '8px 16px', 
        borderRadius: '10px', 
        fontSize: '11px', 
        fontWeight: 900, 
        cursor: 'pointer', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '6px',
        boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
    } as React.CSSProperties,
    closeBtn: { 
        background: 'transparent', 
        border: 'none', 
        color: tokens.colors.textMuted, 
        cursor: 'pointer' 
    } as React.CSSProperties,
    sectionTitle: { 
        fontSize: '11px', 
        fontWeight: 900, 
        letterSpacing: '2px', 
        color: tokens.colors.accentPurple 
    } as React.CSSProperties,
    chartSection: { 
        border: '1px solid transparent',
        background: `
            linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)) padding-box,
            linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04)) border-box
        `,
        padding: '16px', 
        borderRadius: '20px', 
        boxShadow: '0 24px 70px rgba(0,0,0,0.35)',
    } as React.CSSProperties,
    tableSection: { 
        border: '1px solid transparent',
        background: `
            linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)) padding-box,
            linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04)) border-box
        `,
        padding: '16px', 
        borderRadius: '20px', 
        boxShadow: '0 24px 70px rgba(0,0,0,0.35)',
    } as React.CSSProperties,
    table: { 
        width: '100%', 
        borderCollapse: 'collapse' as const, 
        marginTop: '12px', 
        minWidth: '600px' 
    } as React.CSSProperties,
    th: { 
        textAlign: 'left' as const, 
        padding: '10px 12px', 
        fontSize: '10px', 
        fontWeight: 900, 
        color: tokens.colors.textMuted, 
        borderBottom: '1px solid rgba(255,255,255,0.05)' 
    } as React.CSSProperties,
    td: { 
        padding: '12px', 
        fontSize: '12px', 
        borderBottom: '1px solid rgba(255,255,255,0.03)' 
    } as React.CSSProperties,
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

    reportMainTitle: {
        fontSize: '18px',
        fontWeight: 900,
    } as React.CSSProperties,
};
