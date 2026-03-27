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
            radial-gradient(circle at 10% 40%, ${tokens.colors.glowMint} 0%, transparent 60%),
            radial-gradient(circle at 90% 40%, ${tokens.colors.glowTeal} 0%, transparent 60%),
            radial-gradient(circle at 50% -10%, ${tokens.colors.glowPurple} 0%, transparent 70%),
            radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 100% 100%, 40px 40px',
    } as CSSProperties,

    ribbonLeft: {
        position: 'absolute',
        width: '1200px',
        height: '1200px',
        left: '-600px',
        top: '0%',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${tokens.colors.glowMint} 0%, transparent 70%)`,
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
        background: `radial-gradient(circle, ${tokens.colors.glowTeal} 0%, transparent 70%)`,
        filter: 'blur(100px)',
        opacity: 0.4,
    } as CSSProperties,
};
