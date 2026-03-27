import { CSSProperties } from 'react';
import { tokens } from '../../../SharedTool/style/tokens.shared.style';

/* ============================
   PropertiesPanel Style Tokens
   ============================ */

export const iconBox: CSSProperties = {
    width: '44px', height: '44px', borderRadius: '14px',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
};

export const row: CSSProperties = { display: 'flex', gap: '12px', width: '100%' };

export const miniLabel: CSSProperties = {
    fontSize: '8px', fontWeight: 900, opacity: 0.3,
    letterSpacing: '1px', textTransform: 'uppercase'
};

export const ghostInput: CSSProperties = {
    background: 'none', border: 'none', outline: 'none',
    padding: 0, margin: 0, width: '100%'
};

export const textAreaStyle: CSSProperties = {
    width: '100%', height: '80px', padding: '16px',
    borderRadius: '16px', background: 'rgba(0,0,0,0.25)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: 'white', fontSize: '13px', resize: 'none',
    outline: 'none', boxSizing: 'border-box'
};

export const inputStyle: CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: '14px',
    background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)',
    color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box'
};

export const selectStyle: CSSProperties = { ...inputStyle, appearance: 'none' };

export const fileDropArea: CSSProperties = {
    height: '100px', border: '1px dashed rgba(255,255,255,0.1)',
    borderRadius: '20px', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '10px',
    cursor: 'pointer', background: 'rgba(255,255,255,0.02)'
};

export const colorPickerContainer: CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '12px', padding: '8px',
    borderRadius: '12px', background: 'rgba(0,0,0,0.2)',
    border: '1px solid rgba(255,255,255,0.08)'
};

export const colorInput: CSSProperties = {
    width: '32px', height: '32px', border: 'none',
    borderRadius: '8px', background: 'none', cursor: 'pointer', padding: 0
};

export const colorValue: CSSProperties = {
    fontSize: '11px', fontWeight: 900, opacity: 0.5, letterSpacing: '1px'
};

export const rangeStyle: CSSProperties = {
    width: '100%', accentColor: tokens.colors.accentGreen,
    height: '4px', cursor: 'pointer'
};

export const miniIconBtn: CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
};

/* --- Composite / Container styles --- */

export const panelRoot: CSSProperties = {
    flex: 1, display: 'flex', flexDirection: 'column',
    height: '100%', background: 'transparent'
};

export const tabBar: CSSProperties = {
    display: 'flex', height: '64px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    padding: '0 8px'
};

export const scrollBody: CSSProperties = {
    flex: 1, overflowY: 'auto', padding: '24px'
};

export const sectionGap: CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: '32px'
};

export const sectionBox: CSSProperties = {
    padding: '20px', borderRadius: '24px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.04)'
};

export const sectionLabelBar: CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.4
};

export const sectionLabelLine: CSSProperties = {
    width: '24px', height: '1px', background: 'white'
};

export const sectionLabelText: CSSProperties = {
    fontSize: '9px', fontWeight: 900, letterSpacing: '2px'
};

/* --- Dynamic style helpers --- */

export const getTabBtnStyle = (active: boolean): CSSProperties => ({
    flex: 1, display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '10px',
    border: 'none', background: 'transparent',
    cursor: 'pointer', position: 'relative',
    color: active ? tokens.colors.accentGreen : 'rgba(255,255,255,0.4)',
    transition: 'all 0.3s'
});

export const tabUnderline: CSSProperties = {
    position: 'absolute', bottom: 0, left: '20%', right: '20%',
    height: '3px', background: tokens.colors.accentGreen,
    borderRadius: '4px 4px 0 0'
};

export const getChipStyle = (active?: boolean): CSSProperties => ({
    padding: '8px 16px', borderRadius: '12px',
    fontSize: '9px', fontWeight: 900, cursor: 'pointer',
    transition: 'all 0.3s',
    background: active ? tokens.colors.accentGreen : 'rgba(255,255,255,0.05)',
    border: `1px solid ${active ? tokens.colors.accentGreen : 'rgba(255,255,255,0.1)'}`,
    color: active ? '#080a0b' : 'rgba(255,255,255,0.6)'
});

export const getGlassMiniBtnStyle = (active?: boolean): CSSProperties => ({
    padding: '10px 14px', borderRadius: '12px',
    background: active ? tokens.colors.accentGreen : 'rgba(255,255,255,0.03)',
    border: `1px solid ${active ? tokens.colors.accentGreen : 'rgba(255,255,255,0.05)'}`,
    color: active ? '#080a0b' : 'white',
    cursor: 'pointer', transition: 'all 0.3s',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1
});

export const getIconActionStyle = (active?: boolean, color?: string): CSSProperties => ({
    width: '36px', height: '36px', borderRadius: '12px',
    background: active ? tokens.colors.accentGreen + '20' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${active ? tokens.colors.accentGreen : 'rgba(255,255,255,0.06)'}`,
    color: active ? tokens.colors.accentGreen : (color || 'white'),
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'all 0.2s'
});

export const getLayerRowStyle = (isSelected: boolean): CSSProperties => ({
    padding: '16px', borderRadius: '20px',
    background: isSelected ? `${tokens.colors.accentGreen}15` : 'rgba(255,255,255,0.03)',
    border: `1px solid ${isSelected ? tokens.colors.accentGreen : 'rgba(255,255,255,0.05)'}`,
    display: 'flex', alignItems: 'center', gap: '16px',
    transition: 'all 0.3s', cursor: 'pointer'
});

export const layerIconBox: CSSProperties = {
    width: '40px', height: '40px', borderRadius: '12px',
    background: 'rgba(255,255,255,0.05)',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
};
