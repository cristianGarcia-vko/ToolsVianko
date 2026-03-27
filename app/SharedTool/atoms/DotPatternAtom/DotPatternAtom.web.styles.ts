import { CSSProperties } from 'react';

export const dotStyles = {
    container: {
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.6,
    } as CSSProperties,
};
