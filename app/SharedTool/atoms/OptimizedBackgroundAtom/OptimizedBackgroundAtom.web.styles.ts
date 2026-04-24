import { CSSProperties } from 'react';
import { tokens } from '../../style/tokens.shared.style';

export const optimizedStyles = {
    overlay: {
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        backgroundColor: tokens.colors.bg,
        backgroundImage: `
            radial-gradient(circle at 12% 30%, ${tokens.colors.glowBlue} 0%, transparent 50%),
            radial-gradient(circle at 88% 28%, ${tokens.colors.glowPurple} 0%, transparent 55%),
            linear-gradient(180deg, rgba(255,255,255,0.03), transparent 40%),
            radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 100% 100%, 46px 46px',
        transform: 'translate3d(0,0,0)',
    } as CSSProperties,

    ribbonLeft: {
        position: 'absolute',
        width: '1000px',
        height: '1000px',
        left: '-500px',
        top: '0%',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${tokens.colors.glowBlue} 0%, transparent 70%)`,
        filter: 'blur(80px)',
        opacity: 0.3,
        transform: 'translate3d(0,0,0)',
    } as CSSProperties,

    ribbonRight: {
        position: 'absolute',
        width: '1000px',
        height: '1000px',
        right: '-500px',
        top: '10%',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${tokens.colors.glowPurple} 0%, transparent 70%)`,
        filter: 'blur(80px)',
        opacity: 0.3,
        transform: 'translate3d(0,0,0)',
    } as CSSProperties,
};
