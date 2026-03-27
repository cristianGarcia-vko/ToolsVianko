import { CSSProperties } from 'react';
import { tokens } from '../../../SharedTool/style/tokens.shared.style';

/* ============================
   ExportModal Style Tokens
   ============================ */

export const exportStyles = {
    overlay: {
        position: 'fixed', inset: 0, zIndex: 4000,
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    } as CSSProperties,

    modal: {
        width: '800px', background: tokens.colors.bgDeep,
        borderRadius: '32px', border: `1px solid ${tokens.colors.border}`,
        overflow: 'hidden', boxShadow: '0 50px 100px rgba(0,0,0,0.5)'
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
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${tokens.colors.border}`,
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
        padding: '12px 32px', background: tokens.colors.accentPurple,
        borderRadius: '12px', color: 'white', border: 'none',
        fontWeight: 900, cursor: 'pointer', marginTop: '10px'
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
        padding: '20px', background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${tokens.colors.border}`,
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

    roleIconBox: {
        width: '40px', height: '40px', borderRadius: '12px',
        background: tokens.colors.accentPurple + '20',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    } as CSSProperties,
};
