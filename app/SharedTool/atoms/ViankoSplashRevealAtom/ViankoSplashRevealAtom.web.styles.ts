import { CSSProperties } from 'react';
import { tokens, ThemeTokens } from '../../style/tokens.shared.style';

const rgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const createViankoSplashRevealWebStyles = (theme: ThemeTokens, circleMask: string, width: number) => {
  const isMobile = width <= 768;
  return {
    root: {
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    } as CSSProperties,
    overlay: {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'auto',
      background: `
        radial-gradient(circle at 0% 0%, ${rgba(theme.colors.accentOrange, 0.12)} 0%, transparent 60%),
        radial-gradient(circle at 100% 100%, ${rgba(theme.colors.accentPurple, 0.12)} 0%, transparent 60%),
        ${theme.colors.bg}
      `,
      WebkitMaskImage: `linear-gradient(#000, #000), url("${circleMask}")`,
      maskImage: `linear-gradient(#000, #000), url("${circleMask}")`,
      WebkitMaskPosition: 'center, center',
      maskPosition: 'center, center',
      WebkitMaskRepeat: 'no-repeat, no-repeat',
      maskRepeat: 'no-repeat, no-repeat',
      WebkitMaskComposite: 'destination-out',
      maskComposite: 'exclude',
      WebkitMaskSize: '100% 100%, 0% 0%',
      maskSize: '100% 100%, 0% 0%',
      willChange: 'mask-size, opacity',
    } as CSSProperties,
    letters: {
      position: 'relative',
      display: 'flex',
      gap: isMobile ? '3vw' : '1.5vw',
      zIndex: 100000,
      pointerEvents: 'none',
    } as CSSProperties,
    char: {
      display: 'inline-block',
      fontFamily: '"Arial Black", Arial, sans-serif',
      fontSize: isMobile ? '16vw' : '7.5vw',
      fontWeight: 900,
      color: theme.colors.textMain,
      textTransform: 'uppercase',
      userSelect: 'none',
      willChange: 'transform, opacity',
      opacity: 0,
      textShadow: `0 10px 30px rgba(0,0,0,0.5)`,
    } as CSSProperties,
  };
};

export const splashRevealAnimations = `
@keyframes vkoLetterToCenter {
  0% { transform: translateX(var(--vko-letter-offset)) scale(1.2); opacity: 0; filter: blur(15px); }
  20% { transform: translateX(var(--vko-letter-offset)) scale(1); opacity: 1; filter: blur(0); }
  80% { transform: translateX(0) scale(1); opacity: 1; filter: blur(0); }
  100% { transform: translateX(0) scale(0.3); opacity: 0; filter: blur(8px); }
}

@keyframes vkoExpandCircleHole {
  0% { 
    -webkit-mask-size: 100% 100%, 0% 0%;
    mask-size: 100% 100%, 0% 0%;
    opacity: 1;
  }
  15% {
    -webkit-mask-size: 100% 100%, 15vw 15vw;
    mask-size: 100% 100%, 15vw 15vw;
    opacity: 1;
  }
  100% { 
    -webkit-mask-size: 100% 100%, 1200vw 1200vw;
    mask-size: 100% 100%, 1200vw 1200vw;
    opacity: 0;
  }
}
`;
