export const tokens = {
    colors: {
        // Core Backgrounds
        bg: '#080a0b',          // True Obsidian
        bgDeep: '#0d0d14',      // Midnight Grey
        bgElevated: '#111118',  // Elevated Surface
        bgHeader: 'rgba(10, 10, 15, 0.85)',
        bgGlass: 'rgba(10, 10, 15, 0.6)',
        bgCard: 'rgba(255, 255, 255, 0.03)',
        
        // --- PRIMARY PALETTE: GREEN & BLUE (SYNCHRONIZED) ---
        accentGreen: '#2ee59d',  // Mint / Green Focus
        accentBlue: '#22d3ee',   // Cyan / Blue Focus
        accentDeepBlue: '#3b82f6',
        accentTeal: '#2dd4bf',
        
        // Supporting Colors
        accentSuccess: '#10b981', 
        accentError: '#ef4444',
        accentOrange: '#f97316', // Keeping for specific highlights if needed but focusing on G/B
        accentPurple: '#a855f7', // Keeping but focusing on G/B

        // Glows (Corrected colors to Green & Blue)
        glowGreen: 'rgba(46, 229, 157, 0.3)',
        glowBlue: 'rgba(34, 211, 238, 0.3)',
        glowTeal: 'rgba(45, 212, 191, 0.3)',
        glowDeep: 'rgba(59, 130, 246, 0.2)',
        
        // Borders
        border: 'rgba(255, 255, 255, 0.08)',
        borderWhite: 'rgba(255, 255, 255, 0.15)',
        borderHighlight: 'rgba(255, 255, 255, 0.25)',
        
        // Text
        textMain: '#FFFFFF',
        textSecondary: '#D1D5DB',
        textMuted: '#64748B',
    },
    blur: {
        micro: '4px',
        soft: '8px',
        medium: '20px',
        strong: '40px',
        halo: '60px',
        nebulae: '100px',
    },
    borderRadius: {
        pill: '100px',
        card: '32px',
        inner: '16px',
        button: '14px',
        xl: '40px',
    },
    shadows: {
        card: '0 40px 100px rgba(0, 0, 0, 0.8)',
    }
};

export type ThemeTokens = typeof tokens;
