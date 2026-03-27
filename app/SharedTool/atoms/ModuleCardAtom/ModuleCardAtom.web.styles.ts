import { CSSProperties } from 'react';
import { ThemeTokens, tokens } from '../../style/tokens.shared.style';

export const createCardStyles = (theme: ThemeTokens) => ({
    card: {
        background: 'rgba(255, 255, 255, 0.02)',
        border: `1px solid rgba(255, 255, 255, 0.05)`,
        padding: '0',
        borderRadius: '40px',
        width: '450px',
        minHeight: '400px',
        textAlign: 'left',
        cursor: 'pointer',
        backdropFilter: 'blur(40px)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 40px 100px rgba(0, 0, 0, 0.6)',
        transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
        display: 'flex',
        flexDirection: 'column',
    } as CSSProperties,

    innerContent: {
        background: 'rgba(0, 0, 0, 0.2)',
        padding: '48px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 2,
        position: 'relative',
        justifyContent: 'space-between',
        flex: 1,
    } as CSSProperties,

    topRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
    } as CSSProperties,

    iconContainer: {
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(46, 229, 157, 0.05)',
        border: '1px solid rgba(46, 229, 157, 0.1)',
        boxShadow: '0 0 40px rgba(46, 229, 157, 0.15)',
    } as CSSProperties,

    arrowContainer: { 
        color: 'white',
        opacity: 0.2
    } as CSSProperties,

    title: {
        color: 'white',
        fontSize: '28px',
        fontWeight: 900,
        marginBottom: '16px',
        letterSpacing: '-1px',
        fontFamily: "'Inter', sans-serif",
    } as CSSProperties,

    desc: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: '15px',
        lineHeight: 1.6,
        marginBottom: '0px',
        fontWeight: 500,
        fontFamily: "'Inter', sans-serif",
    } as CSSProperties,

    buttonArea: {
        marginTop: 'auto',
        paddingTop: '32px',
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
    } as CSSProperties,

    mainButton: {
        flex: 1,
        padding: '16px 24px',
        borderRadius: '14px',
        fontSize: '11px',
        fontWeight: 900,
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        position: 'relative',
    } as CSSProperties,

    getMainButton: (accent: string) => ({
        flex: 1,
        padding: '16px 24px',
        borderRadius: '14px',
        fontSize: '11px',
        fontWeight: 900,
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
        textTransform: 'uppercase' as const,
        letterSpacing: '1.5px',
        position: 'relative' as const,
        background: accent,
        color: '#080a0b',
        boxShadow: `0 20px 40px ${accent}40`,
    }) as CSSProperties,

    secondaryAvatars: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
    } as CSSProperties,

    avatar: { 
        width: '36px', 
        height: '36px', 
        borderRadius: '50%', 
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.03)',
    } as CSSProperties,

    glowCorner: {
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '60%',
        height: '60%',
        pointerEvents: 'none',
        filter: 'blur(50px)',
    } as CSSProperties,

    getGlowCorner: (accent: string) => ({
        position: 'absolute' as const,
        bottom: '-10%',
        right: '-10%',
        width: '60%',
        height: '60%',
        pointerEvents: 'none' as const,
        filter: 'blur(50px)',
        background: `radial-gradient(circle, ${accent}30 0%, transparent 70%)`,
    }) as CSSProperties,
});

export const cardStyles = createCardStyles(tokens);
