import { CSSProperties } from 'react';
import { tokens } from '../../../../../SharedTool/style/tokens.shared.style';

/* ============================
   ExportModal Style Tokens
   ============================ */

export const exportStyles = {
    overlay: {
        position: 'fixed', inset: 0, zIndex: 4000,
        background: 'rgba(4,6,8,0.78)', backdropFilter: 'blur(28px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    } as CSSProperties,

    modal: {
        width: '820px',
        borderRadius: '32px',
        border: '1px solid transparent',
        background: `
            radial-gradient(circle at 12% 18%, ${tokens.colors.glowDeep} 0%, transparent 60%) padding-box,
            linear-gradient(180deg, rgba(15,15,25,0.86), rgba(15,15,25,0.62)) padding-box,
            linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06), ${tokens.colors.glowDeep}) border-box
        `,
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        overflow: 'hidden',
        boxShadow: '0 70px 180px rgba(0,0,0,0.85)'
    } as CSSProperties,

    header: {
        padding: '24px 32px', borderBottom: `1px solid ${tokens.colors.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    } as CSSProperties,

    title: {
        fontSize: '12px', fontWeight: 900, letterSpacing: '2px', color: 'white'
    } as CSSProperties,

    closeBtn: {
        background: 'none', border: 'none',
        color: 'rgba(255,255,255,0.4)', cursor: 'pointer'
    } as CSSProperties,

    content: { padding: '40px' } as CSSProperties,

    grid: {
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px'
    } as CSSProperties,

    optionBtn: {
        aspectRatio: '1', borderRadius: '24px',
        border: '1px solid transparent',
        background: `
            linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)) padding-box,
            linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.05)) border-box
        `,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '20px', cursor: 'pointer', transition: 'all 0.3s'
    } as CSSProperties,

    optionLabel: {
        fontSize: '11px', fontWeight: 900, color: 'white'
    } as CSSProperties,

    optionDesc: {
        fontSize: '9px', opacity: 0.4, color: 'white'
    } as CSSProperties,

    statusView: {
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '24px',
        textAlign: 'center' as const
    } as CSSProperties,

    statusText: {
        fontSize: '14px', fontWeight: 900, color: 'white'
    } as CSSProperties,

    progressBar: {
        width: '100%', height: '6px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '3px', overflow: 'hidden'
    } as CSSProperties,

    progressFill: {
        height: '100%', background: tokens.colors.accentPurple,
        transition: 'width 0.3s'
    } as CSSProperties,

    progressText: {
        fontSize: '10px', fontWeight: 900,
        color: tokens.colors.accentPurple
    } as CSSProperties,

    finalBtn: {
        padding: '12px 32px',
        borderRadius: '14px',
        color: '#080a0b',
        border: '1px solid transparent',
        background: `
            linear-gradient(135deg, ${tokens.colors.accentPurple}, ${tokens.colors.accentPurple}cc) padding-box,
            linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0.10)) border-box
        `,
        fontWeight: 900, cursor: 'pointer', marginTop: '10px',
        boxShadow: `0 22px 60px ${tokens.colors.accentPurple}33`
    } as CSSProperties,

    playerView: {
        display: 'flex', flexDirection: 'column', height: '100%'
    } as CSSProperties,

    backBtn: {
        background: 'none', border: 'none',
        color: tokens.colors.accentPurple,
        fontSize: '10px', fontWeight: 900, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '4px', padding: 0
    } as CSSProperties,

    formatBtn: {
        padding: '8px 16px', borderRadius: '10px',
        border: 'none', color: 'white',
        fontSize: '9px', fontWeight: 900, cursor: 'pointer'
    } as CSSProperties,

    roleGrid: {
        display: 'flex', flexDirection: 'column', gap: '8px'
    } as CSSProperties,

    roleCard: {
        padding: '20px',
        border: '1px solid transparent',
        background: `
            linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)) padding-box,
            linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.05)) border-box
        `,
        borderRadius: '20px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        cursor: 'pointer', transition: 'all 0.2s'
    } as CSSProperties,

    gridDivider: {
        gridColumn: 'span 3', height: '1px',
        background: 'rgba(255,255,255,0.05)', margin: '10px 0'
    } as CSSProperties,

    previewContainer: {
        width: '100%', aspectRatio: '16/9', background: '#000',
        borderRadius: '24px', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', position: 'relative' as const,
        border: `1px solid ${tokens.colors.border}`
    } as CSSProperties,

    successIcon: {
        width: '64px', height: '64px', borderRadius: '32px',
        background: tokens.colors.accentSuccess + '20',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '10px'
    } as CSSProperties,

    headerTitleGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    } as CSSProperties,

    optionContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
    } as CSSProperties,

    playerHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
    } as CSSProperties,

    playerBannerTitle: {
        fontSize: '10px',
        fontWeight: 900,
        color: tokens.colors.accentPurple,
    } as CSSProperties,

    previewCanvasArea: {
        position: 'relative' as const,
        boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
        overflow: 'hidden' as const,
    } as CSSProperties,

    formatSelectorRow: {
        marginTop: '20px',
        display: 'flex',
        gap: '10px',
        overflowX: 'auto' as const,
        paddingBottom: '10px',
    } as CSSProperties,

    roleGridContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        marginTop: '20px'
    } as CSSProperties,

    roleLabelStack: {
        display: 'flex',
        flexDirection: 'column'
    } as CSSProperties,

    roleCardTitle: {
        fontSize: '12px',
        fontWeight: 900
    } as CSSProperties,

    roleCardDesc: {
        fontSize: '9px',
        opacity: 0.4
    } as CSSProperties,

    roleIconBox: {
        width: '40px', height: '40px', borderRadius: '12px',
        background: tokens.colors.accentPurple + '20',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    } as CSSProperties,
};
