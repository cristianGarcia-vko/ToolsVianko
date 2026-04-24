import React from 'react';
import { tokens } from './tokens.shared.style';

/**
 * GlobalStyles handles the injection of Design Tokens into CSS variables.
 * This allows the browser to handle theme/style logic natively (Elite Performance).
 */
export const GlobalStyles = () => {
    // Generate CSS variable string from tokens
    const generateVars = (obj: Record<string, any>, prefix = '--vko-'): string => {
        let css = '';
        Object.entries(obj).forEach(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
                css += generateVars(value, `${prefix}${key}-`);
            } else {
                css += `${prefix}${key}: ${value};\n`;
            }
        });
        return css;
    };

    const cssVars = generateVars(tokens);

    return (
        <style dangerouslySetInnerHTML={{ __html: `
            :root {
                ${cssVars}
            }
            
            * {
                box-sizing: border-box;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }

            body {
                margin: 0;
                padding: 0;
                background-color: var(--vko-colors-bg);
                color: var(--vko-colors-textMain);
                font-family: 'Inter', system-ui, -apple-system, sans-serif;
                overflow: hidden;
            }

            /* Optimized Scrollbar */
            ::-webkit-scrollbar {
                width: 6px;
                height: 6px;
            }
            ::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.05);
            }
            ::-webkit-scrollbar-thumb {
                background: var(--vko-colors-accentGreen);
                border-radius: 10px;
            }
            ::-webkit-scrollbar-thumb:hover {
                background: var(--vko-colors-accentBlue);
            }
        `}} />
    );
};
