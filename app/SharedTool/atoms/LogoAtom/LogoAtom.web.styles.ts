import { CSSProperties } from 'react';
import { tokens } from '../../style/tokens.shared.style';

export const logoStyles = {
    container: {
        marginBottom: '64px',
        textAlign: 'center',
        zIndex: 10,
        position: 'relative',
    } as CSSProperties,

    heroTitle: {
        fontSize: '72px',
        color: 'white',
        fontWeight: 900,
        letterSpacing: '-3px',
        lineHeight: 1.1,
        marginBottom: '24px',
        fontFamily: "'Inter', sans-serif",
    } as CSSProperties,

    creativeText: {
        color: tokens.colors.accentBlue,
        fontWeight: 900,
    } as CSSProperties,

    automationText: {
        background: `linear-gradient(to right, ${tokens.colors.accentBlue}, ${tokens.colors.accentGreen})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 900,
    } as CSSProperties,

    heroSub: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: '16px',
        maxWidth: '600px',
        margin: '0 auto',
        lineHeight: 1.6,
        fontWeight: 600,
        letterSpacing: '0.5px',
    } as CSSProperties,
};
