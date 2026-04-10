import React, { memo, useEffect, useState, useCallback, useRef } from 'react';
import { tokens } from '../../../../../SharedTool/style/tokens.shared.style';

/* ─── Types ───────────────────────────────────────────────────────────────── */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type ToastItem = {
    id: number;
    type: ToastType;
    message: string;
    duration?: number;
};

/* ─── Hook ────────────────────────────────────────────────────────────────── */

let toastIdCounter = 0;

export const useToast = () => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const addToast = useCallback((type: ToastType, message: string, duration = 4000) => {
        const id = ++toastIdCounter;
        setToasts(prev => [...prev, { id, type, message, duration }]);
        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return { toasts, addToast, removeToast };
};

/* ─── Styles ──────────────────────────────────────────────────────────────── */

const accentMap: Record<ToastType, string> = {
    success: tokens.colors.accentGreen,
    error: tokens.colors.accentError,
    warning: tokens.colors.accentOrange,
    info: tokens.colors.accentTeal,
};

const iconMap: Record<ToastType, string> = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
};

const toastContainerStyle: React.CSSProperties = {
    position: 'fixed',
    top: '16px',
    right: '16px',
    zIndex: 99999,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    pointerEvents: 'none',
    maxWidth: '380px',
};

const toastItemStyle = (type: ToastType): React.CSSProperties => {
    const accent = accentMap[type];
    return {
        background: 'rgba(10, 12, 20, 0.95)',
        backdropFilter: 'blur(12px)',
        borderRadius: '14px',
        border: `1px solid ${accent}35`,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        boxShadow: `0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px ${accent}10`,
        animation: 'toastSlideIn 0.3s ease-out',
        pointerEvents: 'auto',
        cursor: 'pointer',
    };
};

const toastKeyframes = `
    @keyframes toastSlideIn {
        from { transform: translateX(80px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;

/* ─── Component ───────────────────────────────────────────────────────────── */

interface K6ToastContainerProps {
    toasts: ToastItem[];
    removeToast: (id: number) => void;
}

export const K6ToastContainer: React.FC<K6ToastContainerProps> = memo(({ toasts, removeToast }) => {
    if (toasts.length === 0) return null;

    return (
        <div style={toastContainerStyle}>
            <style>{toastKeyframes}</style>
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    style={toastItemStyle(toast.type)}
                    onClick={() => removeToast(toast.id)}
                >
                    <span style={{ fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>
                        {iconMap[toast.type]}
                    </span>
                    <div style={{ flex: 1 }}>
                        <div style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: accentMap[toast.type],
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                            marginBottom: '2px',
                        }}>
                            {toast.type}
                        </div>
                        <div style={{
                            fontSize: '12px',
                            lineHeight: 1.5,
                            color: 'rgba(255,255,255,0.8)',
                            fontFamily: "'Inter', system-ui, sans-serif",
                        }}>
                            {toast.message}
                        </div>
                    </div>
                    <span style={{
                        fontSize: '10px', color: 'rgba(255,255,255,0.2)',
                        flexShrink: 0, cursor: 'pointer', padding: '2px',
                    }}>
                        ✕
                    </span>
                </div>
            ))}
        </div>
    );
});
