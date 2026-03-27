import { CSSProperties } from 'react';
import { tokens } from '../../style/tokens.shared.style';

export const getContainerStyle = (blur: string): CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    gap: '24px',
    background: 'rgba(2,2,5,0.4)',
    backdropFilter: `blur(${blur})`,
    borderRadius: '32px',
});

export const spinnerContainer: CSSProperties = {
    position: 'relative',
    width: '80px',
    height: '80px',
};

export const getSpinnerRing = (color: string): CSSProperties => ({
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.05)',
    borderTopColor: color,
    boxShadow: `0 0 20px ${color}22`,
});

export const getSpinnerCore = (color: string): CSSProperties => ({
    position: 'absolute',
    inset: '20px',
    borderRadius: '50%',
    background: color,
    filter: 'blur(15px)',
});

export const labelStyle: CSSProperties = {
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '2px',
    color: 'white',
    textTransform: 'uppercase',
    textAlign: 'center',
    opacity: 0.6,
};
