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
            radial-gradient(circle at 12% 30%, ${tokens.colors.glowBlue} 0%, transparent 60%),
            radial-gradient(circle at 88% 28%, ${tokens.colors.glowPurple} 0%, transparent 65%),
            radial-gradient(circle at 45% 120%, ${tokens.colors.glowMint} 0%, transparent 60%),
            linear-gradient(180deg, rgba(255,255,255,0.05), transparent 45%),
            radial-gradient(rgba(255, 255, 255, 0.045) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%, 46px 46px',
    } as CSSProperties,

    ribbonLeft: {
        position: 'absolute',
        width: '1200px',
        height: '1200px',
        left: '-600px',
        top: '0%',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${tokens.colors.glowBlue} 0%, transparent 70%)`,
        filter: 'blur(100px)',
        opacity: 0.4,
    } as CSSProperties,

    ribbonRight: {
        position: 'absolute',
        width: '1200px',
        height: '1200px',
        right: '-600px',
        top: '10%',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${tokens.colors.glowPurple} 0%, transparent 70%)`,
        filter: 'blur(100px)',
        opacity: 0.4,
    } as CSSProperties,
};
