import React from 'react';
import { BannerLayer } from './types/types';

/**
 * Builds CSS properties for the banner background.
 * Now handles color, gradient, image and pattern types for maximum optimization.
 */
export const buildBackgroundStyle = (bg: any): React.CSSProperties => {
    if (!bg) return { backgroundColor: '#0b1220' };

    const type = bg.type || 'pattern';
    const baseColor = String(bg?.color || '#0b1220').trim();

    if (type === 'image' && bg.image) {
        return {
            backgroundImage: `url(${bg.image})`,
            backgroundSize: bg.fit || 'cover',
            backgroundPosition: bg.position || 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: baseColor
        };
    }

    if (type === 'gradient' && bg.gradient) {
        return {
            background: `linear-gradient(${bg.gradient.angle || 0}deg, ${bg.gradient.c1 || '#0b1220'}, ${bg.gradient.c2 || '#1e293b'})`
        };
    }

    if (type === 'color') {
        return { backgroundColor: baseColor };
    }

    // Pattern Logic (Standard Vianko Aesthetics)
    const pattern = String(bg?.pattern || 'dots').trim().toLowerCase();
    const scale = Math.max(4, Number(bg?.scale) || 18);
    const opacity = Math.min(1, Math.max(0, Number(bg?.opacity ?? 0.15)));
    const ink = `rgba(255,255,255,${opacity})`;

    let patternCss = '';
    if (pattern === 'grid') {
        patternCss = `linear-gradient(to right, ${ink} 1px, transparent 1px) 0 0 / ${scale}px ${scale}px repeat, linear-gradient(to bottom, ${ink} 1px, transparent 1px) 0 0 / ${scale}px ${scale}px repeat`;
    } else if (pattern === 'waves') {
        patternCss = `repeating-radial-gradient(circle at 20% 20%, ${ink} 0 1px, transparent 1px ${scale}px)`;
    } else if (pattern === 'noise') {
        patternCss = `repeating-linear-gradient(45deg, ${ink} 0 1px, transparent 1px 3px)`;
    } else {
        patternCss = `radial-gradient(circle, ${ink} 1px, transparent 1px) 0 0 / ${scale}px ${scale}px repeat`;
    }

    return { 
        background: `${patternCss}, ${baseColor}`
    };
};

/**
 * Resolves logical animation names to CSS keyframes.
 */
export const resolveAnimationKeyframesName = (name: string) => {
    const normalized = String(name || '').trim();
    if (!normalized) return '';
    const compact = normalized.replace(/[\s_]/g, '').toLowerCase();
    const map: Record<string, string> = {
        slideinleft: 'slideRight',
        slideinright: 'slideLeft',
        slideinup: 'slideUp',
        slideindown: 'slideDown',
        slideacrossright: 'slideLeft',
        glow: 'glowPulse',
        glowpulse: 'glowPulse',
        bouncein: 'bounce',
        bounceinout: 'bounce',
        'bounce-in': 'bounce',
    };
    return map[compact] || normalized;
};

/**
 * Builds CSS Properties for a layer's animation.
 */
export const resolveAnimationStyle = (animation?: BannerLayer['animation']): React.CSSProperties => {
    if (!animation?.name) return {};
    const keyframes = resolveAnimationKeyframesName(animation.name);
    if (!keyframes || keyframes === 'none') return {};
    return {
        animationName: keyframes,
        animationDuration: animation.duration || '1s',
        animationDelay: animation.delay || '0s',
        animationTimingFunction: (animation as any).easing || animation.timingFunction || 'ease',
        animationIterationCount: (animation as any).iterationCount ?? 1,
        animationFillMode: (animation as any).fillMode || 'forwards',
        willChange: 'transform, opacity'
    };
};
