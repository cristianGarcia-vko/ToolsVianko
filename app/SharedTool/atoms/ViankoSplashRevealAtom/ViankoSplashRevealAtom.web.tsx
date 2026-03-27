import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  VIANKO_SPLASH_DEFAULTS,
  type ViankoSplashRevealProps,
} from './ViankoSplashRevealAtom.shared';
import { createViankoSplashRevealWebStyles, splashRevealAnimations } from './ViankoSplashRevealAtom.web.styles';
import { tokens } from '../../style/tokens.shared.style';

const sanitizeWord = (raw?: string) =>
  (raw || VIANKO_SPLASH_DEFAULTS.word).replace(/[^a-zA-Z0-9 ]/g, '').toUpperCase() || 'VIANKO';

export const ViankoSplashReveal: React.FC<ViankoSplashRevealProps> = ({
  enabled = true,
  word = VIANKO_SPLASH_DEFAULTS.word,
  delayMs = 400,
  onComplete,
}) => {
  const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handler = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const [hidden, setHidden] = useState(!enabled);
  const [phase, setPhase] = useState<'idle' | 'moving' | 'expanding'>('idle');

  const safeWord = useMemo(() => sanitizeWord(word), [word]);
  const letters = useMemo(() => safeWord.split(''), [safeWord]);

  const circleMask = useMemo(() => {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='black'/></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const timers: NodeJS.Timeout[] = [];
    // Entrance / Moving Letters phase
    timers.push(setTimeout(() => setPhase('moving'), delayMs));
    // Expansion phase (reveal background)
    timers.push(setTimeout(() => setPhase('expanding'), delayMs + 1800));
    return () => timers.forEach(clearTimeout);
  }, [enabled, delayMs]);

  const s = useMemo(
    () => createViankoSplashRevealWebStyles(tokens, circleMask, viewportWidth),
    [circleMask, viewportWidth]
  );

  const handleAnimationEnd = useCallback((e: React.AnimationEvent) => {
    // Check if the source animation is the expansion one
    if (e.animationName === 'vkoExpandCircleHole') {
      setHidden(true);
      if (onComplete) onComplete();
    }
  }, [onComplete]);

  const getOffset = (index: number) => {
    const center = (letters.length - 1) / 2;
    const factor = index - center;
    return `${factor * 12}vw`;
  };

  if (!enabled || hidden) return null;

  return (
    <div style={s.root} aria-hidden="true">
      <style>{splashRevealAnimations}</style>
      <div
        style={{
          ...s.overlay,
          ...(phase === 'expanding' ? { animation: 'vkoExpandCircleHole 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' } : {})
        }}
        onAnimationEnd={handleAnimationEnd}
      />
      <div style={s.letters}>
        {letters.map((char, i) => (
          <span
            key={i}
            style={{
              ...s.char,
              '--vko-letter-offset': getOffset(i),
              animationDelay: `${i * 30}ms`,
              ...(phase !== 'idle' ? { animation: 'vkoLetterToCenter 1.6s cubic-bezier(0.5, 0, 0.5, 1) forwards' } : {})
            } as any}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
};
