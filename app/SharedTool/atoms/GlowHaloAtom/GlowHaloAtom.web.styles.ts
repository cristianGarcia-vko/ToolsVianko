import { CSSProperties } from 'react';
import { tokens } from '../../style/tokens.shared.style';

export const getHaloStyle = (size: number, color: string, intensity: number): CSSProperties => ({
    position: 'absolute',
    width: `${size}px`,
    height: `${size}px`,
    background: `radial-gradient(circle, ${color} ${intensity * 100}%, transparent 70%)`,
    filter: 'blur(40px)',
    zIndex: -1,
    pointerEvents: 'none',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
});
