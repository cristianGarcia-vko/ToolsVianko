import React from 'react';
import { tokens } from '../../../../../SharedTool/style/tokens.shared.style';

export const sqlSeedStyles = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(4,6,8,0.78)',
    backdropFilter: 'blur(28px)',
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '14px',
  } as React.CSSProperties,
  container: {
    width: '100%',
    maxWidth: '1120px',
    maxHeight: '100%',
    border: '1px solid transparent',
    background: `
      radial-gradient(circle at 12% 18%, ${tokens.colors.glowDeep} 0%, transparent 60%) padding-box,
      linear-gradient(180deg, rgba(15,15,25,0.86), rgba(15,15,25,0.62)) padding-box,
      linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06), ${tokens.colors.glowDeep}) border-box
    `,
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    borderRadius: '28px',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    boxShadow: '0 60px 160px rgba(0,0,0,0.85)',
  } as React.CSSProperties,
  header: {
    padding: '14px 14px 12px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  } as React.CSSProperties,
  titleRow: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
    minWidth: 240,
  } as React.CSSProperties,
  title: {
    margin: 0,
    fontSize: 14,
    letterSpacing: 0.6,
    fontWeight: 900,
    textTransform: 'uppercase' as const,
    color: 'rgba(255,255,255,0.82)',
  } as React.CSSProperties,
  subtitle: {
    margin: 0,
    fontSize: 12,
    color: 'rgba(255,255,255,0.52)',
  } as React.CSSProperties,
  closeBtn: {
    border: '1px solid rgba(255,255,255,0.10)',
    background: 'rgba(0,0,0,0.25)',
    color: 'rgba(255,255,255,0.85)',
    width: 36,
    height: 36,
    borderRadius: 12,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,
  body: {
    flex: 1,
    overflowY: 'auto' as const,
  } as React.CSSProperties,
  teaser: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    lineHeight: 1.35,
    margin: 0,
  } as React.CSSProperties,
};

