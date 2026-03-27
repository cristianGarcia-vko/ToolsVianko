import { CSSProperties } from 'react';

export const toolLogoStyles = {
    frame: (size: number): CSSProperties => ({
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    }),
    img: {
        width: '100%',
        height: '100%',
        display: 'block',
        objectFit: 'contain',
        filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.28))',
    } as CSSProperties,
};
