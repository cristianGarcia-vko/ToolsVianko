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
        background: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: `blur(${blurMap[intensity]})`,
        WebkitBackdropFilter: `blur(${blurMap[intensity]})`,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
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
    background: active ? `linear-gradient(135deg, ${color}, ${color}dd)` : 'rgba(255, 255, 255, 0.05)',
    border: active ? `1px solid ${color}` : '1px solid rgba(255, 255, 255, 0.05)',
    color: active ? 'white' : 'rgba(255, 255, 255, 0.7)',
    fontSize: '11px',
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: active ? `0 10px 25px ${color}40` : 'none',
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
    background: active ? `linear-gradient(135deg, ${color}, ${color}dd)` : 'rgba(255, 255, 255, 0.03)',
    border: active ? `1px solid ${color}80` : '1px solid rgba(255, 255, 255, 0.05)',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: active ? `0 12px 24px ${color}30` : 'none',
    opacity: active ? 1 : 0.6,
    ...extra,
});
