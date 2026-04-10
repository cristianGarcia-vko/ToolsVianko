import { CSSProperties } from 'react';
import { tokens } from '../../../../../SharedTool/style/tokens.shared.style';

/* ─── Tokens ──────────────────────────────────────────────────────────────── */

const CONSOLE_BG = 'rgba(8, 10, 16, 0.97)';
const CONSOLE_SURFACE = 'rgba(255, 255, 255, 0.03)';
const CONSOLE_BORDER = 'rgba(255, 255, 255, 0.06)';
const TERMINAL_BG = 'rgba(0, 0, 0, 0.4)';
const GREEN = tokens.colors.accentGreen;
const TEAL = tokens.colors.accentTeal;
const RED = tokens.colors.accentError;
const ORANGE = tokens.colors.accentOrange;
const BLUE = tokens.colors.accentBlue;
const PURPLE = tokens.colors.accentPurple;

/* ─── Styles ──────────────────────────────────────────────────────────────── */

export const consoleStyles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        animation: 'consoleOverlayIn 0.25s ease-out',
    } as CSSProperties,

    container: {
        width: '100%',
        maxWidth: '820px',
        maxHeight: '85vh',
        background: CONSOLE_BG,
        borderRadius: '20px',
        border: `1px solid ${CONSOLE_BORDER}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 40px 100px rgba(0,0,0,0.7), 0 0 1px rgba(255,255,255,0.1)',
        animation: 'consolePanelIn 0.3s ease-out',
    } as CSSProperties,

    /* ── Header ─────────────────────────────────────────────────────────── */
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px 12px',
        borderBottom: `1px solid ${CONSOLE_BORDER}`,
    } as CSSProperties,

    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    } as CSSProperties,

    headerDot: (color: string): CSSProperties => ({
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 8px ${color}`,
    }),

    headerTitle: {
        fontFamily: '"Inter", "SF Pro", system-ui, sans-serif',
        fontSize: '11px',
        fontWeight: 800,
        letterSpacing: '1.5px',
        color: 'rgba(255,255,255,0.65)',
        textTransform: 'uppercase',
    } as CSSProperties,

    closeButton: {
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid rgba(255,255,255,0.08)`,
        borderRadius: '8px',
        color: 'rgba(255,255,255,0.35)',
        fontSize: '11px',
        fontWeight: 700,
        padding: '4px 12px',
        cursor: 'pointer',
        transition: 'all 0.15s',
    } as CSSProperties,

    /* ── Progress bar ───────────────────────────────────────────────────── */
    progressContainer: {
        padding: '0 20px',
        paddingTop: '12px',
    } as CSSProperties,

    progressTrack: {
        height: '4px',
        borderRadius: '4px',
        background: 'rgba(255,255,255,0.04)',
        overflow: 'hidden',
        position: 'relative',
    } as CSSProperties,

    progressFill: (percent: number, isError: boolean): CSSProperties => ({
        height: '100%',
        borderRadius: '4px',
        width: `${Math.min(100, percent)}%`,
        background: isError
            ? `linear-gradient(90deg, ${RED}, ${ORANGE})`
            : `linear-gradient(90deg, ${TEAL}, ${GREEN})`,
        boxShadow: isError
            ? `0 0 12px ${RED}`
            : `0 0 12px ${GREEN}`,
        transition: 'width 0.5s ease-out',
    }),

    progressLabel: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 0 0',
    } as CSSProperties,

    progressPhase: (isError: boolean): CSSProperties => ({
        fontSize: '9px',
        fontWeight: 700,
        letterSpacing: '1.2px',
        textTransform: 'uppercase',
        color: isError ? RED : TEAL,
    }),

    progressPercent: {
        fontSize: '10px',
        fontWeight: 800,
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        color: 'rgba(255,255,255,0.5)',
    } as CSSProperties,

    /* ── Live metrics bar ───────────────────────────────────────────────── */
    metricsBar: {
        display: 'flex',
        gap: '2px',
        padding: '10px 20px 8px',
    } as CSSProperties,

    metricChip: (accent: string): CSSProperties => ({
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px',
        padding: '8px 6px',
        borderRadius: '10px',
        background: `${accent}08`,
        border: `1px solid ${accent}18`,
    }),

    metricChipLabel: {
        fontSize: '8px',
        fontWeight: 700,
        letterSpacing: '0.8px',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.3)',
    } as CSSProperties,

    metricChipValue: (accent: string): CSSProperties => ({
        fontSize: '14px',
        fontWeight: 900,
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        color: accent,
    }),

    /* ── Terminal ────────────────────────────────────────────────────────── */
    terminalContainer: {
        flex: 1,
        minHeight: 0,
        padding: '8px 20px 12px',
        display: 'flex',
        flexDirection: 'column',
    } as CSSProperties,

    terminal: {
        flex: 1,
        background: TERMINAL_BG,
        borderRadius: '12px',
        border: `1px solid ${CONSOLE_BORDER}`,
        padding: '12px 14px',
        overflowY: 'auto',
        overflowX: 'hidden',
        fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
        fontSize: '11px',
        lineHeight: '1.7',
        maxHeight: '320px',
    } as CSSProperties,

    terminalLine: (level: string): CSSProperties => ({
        display: 'flex',
        gap: '8px',
        alignItems: 'flex-start',
        color:
            level === 'error' ? RED :
            level === 'warn' ? ORANGE :
            level === 'phase' ? TEAL :
            level === 'metric' ? BLUE :
            'rgba(255,255,255,0.5)',
        marginBottom: '1px',
    }),

    terminalTimestamp: {
        flexShrink: 0,
        fontSize: '9px',
        color: 'rgba(255,255,255,0.18)',
        fontWeight: 600,
        minWidth: '44px',
    } as CSSProperties,

    terminalPhaseTag: (phase: string): CSSProperties => {
        const colorMap: Record<string, string> = {
            init: PURPLE,
            'warm-up': ORANGE,
            running: GREEN,
            teardown: BLUE,
            complete: GREEN,
            error: RED,
        };
        const c = colorMap[phase] || 'rgba(255,255,255,0.3)';
        return {
            flexShrink: 0,
            fontSize: '8px',
            fontWeight: 900,
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
            background: `${c}18`,
            color: c,
            padding: '1px 6px',
            borderRadius: '4px',
            minWidth: '52px',
            textAlign: 'center',
        };
    },

    terminalText: {
        flex: 1,
        wordBreak: 'break-word',
    } as CSSProperties,

    /* ── Result summary ─────────────────────────────────────────────────── */
    resultBox: (success: boolean): CSSProperties => ({
        margin: '0 20px 12px',
        padding: '14px 16px',
        borderRadius: '12px',
        background: success ? `${GREEN}08` : `${RED}08`,
        border: `1px solid ${success ? GREEN : RED}22`,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    }),

    resultIcon: {
        fontSize: '20px',
        flexShrink: 0,
    } as CSSProperties,

    resultStats: {
        flex: 1,
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '11px',
        fontFamily: '"Inter", system-ui, sans-serif',
        color: 'rgba(255,255,255,0.6)',
    } as CSSProperties,

    resultStatItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    } as CSSProperties,

    resultStatValue: {
        fontWeight: 900,
        color: 'rgba(255,255,255,0.85)',
        fontFamily: '"JetBrains Mono", monospace',
    } as CSSProperties,

    /* ── Actions footer ─────────────────────────────────────────────────── */
    footer: {
        display: 'flex',
        gap: '8px',
        padding: '12px 20px 16px',
        borderTop: `1px solid ${CONSOLE_BORDER}`,
    } as CSSProperties,

    actionButton: (accent: string, outlined = false): CSSProperties => ({
        flex: 1,
        padding: '10px 16px',
        borderRadius: '10px',
        fontSize: '10px',
        fontWeight: 800,
        fontFamily: '"Inter", system-ui, sans-serif',
        letterSpacing: '0.8px',
        textTransform: 'uppercase',
        border: outlined ? `1px solid ${accent}40` : 'none',
        background: outlined ? 'transparent' : accent,
        color: outlined ? accent : '#fff',
        cursor: 'pointer',
        transition: 'all 0.15s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
    }),

    /* ── CSS Keyframes injection ─────────────────────────────────────── */
    keyframes: `
        @keyframes consoleOverlayIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes consolePanelIn {
            from { transform: translateY(30px) scale(0.97); opacity: 0; }
            to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes consolePulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    `,
};
