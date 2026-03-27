import { CSSProperties } from 'react';
import { tokens } from '../../style/tokens.shared.style';

export const nebulaStyles = {
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        background: tokens.colors.bg,
    } as CSSProperties,

    leftRibbon: {
        position: 'absolute',
        width: '1000px',
        height: '1200px',
        left: '-400px',
        top: '5%',
        borderLeft: `4px solid ${tokens.colors.accentOrange}73`,
        borderRadius: '50%',
        filter: 'blur(15px)',
        zIndex: 5,
        boxShadow: `-20px 0 100px ${tokens.colors.accentOrange}4D`,
        transform: 'rotate(-2deg)',
    } as CSSProperties,

    rightRibbon: {
        position: 'absolute',
        width: '1000px',
        height: '1200px',
        right: '-400px',
        top: '5%',
        borderRight: `4px solid ${tokens.colors.accentPurple}73`,
        borderRadius: '50%',
        filter: 'blur(15px)',
        zIndex: 5,
        boxShadow: `20px 0 100px ${tokens.colors.accentPurple}4D`,
        transform: 'rotate(2deg)',
    } as CSSProperties,

    orangeSpot: {
        position: 'absolute',
        width: '800px',
        height: '800px',
        left: '-200px',
        top: '20%',
        background: `radial-gradient(circle, ${tokens.colors.accentOrange}33 0%, transparent 70%)`,
        filter: 'blur(80px)',
        zIndex: 2,
    } as CSSProperties,

    purpleSpot: {
        position: 'absolute',
        width: '800px',
        height: '800px',
        right: '-200px',
        top: '20%',
        background: `radial-gradient(circle, ${tokens.colors.accentPurple}40 0%, transparent 70%)`,
        filter: 'blur(80px)',
        zIndex: 2,
    } as CSSProperties,

    focalCenter: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: `radial-gradient(circle at 50% 30%, ${tokens.colors.accentPurple}1F 0%, transparent 60%)`,
        zIndex: 1,
    } as CSSProperties,
};
