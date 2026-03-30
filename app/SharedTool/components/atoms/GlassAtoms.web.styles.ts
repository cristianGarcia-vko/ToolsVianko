import { CSSProperties } from 'react';
import { tokens } from '../../style/tokens.shared.style';

/* GlassCardAtom Styles */
export const getGlassCardStyle = (
    intensity: 'light' | 'medium' | 'strong',
    borderRadius: string,
    isClickable: boolean,
    extra?: CSSProperties
): CSSProperties => {
    const blurMap = { light: '12px', medium: '24px', strong: '40px' };
    return {
        border: '1px solid transparent',
        background: `
            linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02)) padding-box,
            linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06), ${tokens.colors.glowDeep}) border-box
        `,
        backdropFilter: `blur(${blurMap[intensity]})`,
        WebkitBackdropFilter: `blur(${blurMap[intensity]})`,
        borderRadius,
        boxShadow: '0 35px 90px rgba(0, 0, 0, 0.55)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: isClickable ? 'pointer' : 'default',
        overflow: 'hidden',
        position: 'relative',
        ...extra,
    };
};

/* GlassButtonAtom Styles */
export const getGlassButtonStyle = (
    active: boolean,
    color: string,
    extra?: CSSProperties
): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '12px 24px',
    borderRadius: '16px',
    border: '1px solid transparent',
    background: active
        ? `
            linear-gradient(135deg, ${color}, ${color}dd) padding-box,
            linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0.10)) border-box
        `
        : `
            linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03)) padding-box,
            linear-gradient(135deg, rgba(255,255,255,0.20), rgba(255,255,255,0.04)) border-box
        `,
    color: active ? 'white' : 'rgba(255, 255, 255, 0.7)',
    fontSize: '11px',
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: active ? `0 18px 45px ${color}33` : '0 10px 30px rgba(0,0,0,0.35)',
    whiteSpace: 'nowrap',
    ...extra,
});

/* GlassIconButtonAtom Styles */
export const getGlassIconButtonStyle = (
    active: boolean,
    color: string,
    extra?: CSSProperties
): CSSProperties => ({
    width: '44px',
    height: '44px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid transparent',
    background: active
        ? `
            linear-gradient(135deg, ${color}, ${color}dd) padding-box,
            linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0.10)) border-box
        `
        : `
            linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03)) padding-box,
            linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04)) border-box
        `,
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: active ? `0 18px 45px ${color}28` : '0 10px 30px rgba(0,0,0,0.35)',
    opacity: active ? 1 : 0.6,
    ...extra,
});
