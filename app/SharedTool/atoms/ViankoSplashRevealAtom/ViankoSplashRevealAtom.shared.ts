export type ViankoSplashRevealProps = {
  enabled?: boolean;
  word?: string;
  delayMs?: number;
  durationMs?: number;
  onComplete?: () => void;
};

export const VIANKO_SPLASH_DEFAULTS = {
  word: 'VIANKO',
  delayMs: 600,
  durationMs: 3200,
} as const;
