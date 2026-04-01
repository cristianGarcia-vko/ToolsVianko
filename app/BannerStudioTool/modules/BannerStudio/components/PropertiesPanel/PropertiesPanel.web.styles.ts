import { CSSProperties } from 'react';
import { tokens } from '../../../../../SharedTool/style/tokens.shared.style';

/* ============================
   PropertiesPanel Style Tokens
   ============================ */

export const iconBox: CSSProperties = {
    width: '44px', height: '44px', borderRadius: '14px',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
};

export const row: CSSProperties = { display: 'flex', gap: '6px', width: '100%' };

export const miniLabel: CSSProperties = {
    fontSize: '8px', fontWeight: 900, opacity: 0.3,
    letterSpacing: '1px', textTransform: 'uppercase'
};

export const ghostInput: CSSProperties = {
    background: 'none', border: 'none', outline: 'none',
    padding: 0, margin: 0, width: '100%'
};

export const textAreaStyle: CSSProperties = {
    width: '100%', height: '60px', padding: '12px',
    borderRadius: '16px',
    border: '1px solid transparent',
    background: `
        linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)) padding-box,
        linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.05)) border-box
    `,
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    color: 'white', fontSize: '13px', resize: 'none',
    outline: 'none', boxSizing: 'border-box'
};

export const inputStyle: CSSProperties = {
    width: '100%', padding: '8px 12px', borderRadius: '14px',
    border: '1px solid transparent',
    background: `
        linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)) padding-box,
        linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.05)) border-box
    `,
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box'
};

export const selectStyle: CSSProperties = { ...inputStyle, appearance: 'none' };

export const fileDropArea: CSSProperties = {
    height: '100px', border: '1px dashed rgba(255,255,255,0.1)',
    borderRadius: '20px', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '10px',
    cursor: 'pointer',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))'
};

export const colorPickerContainer: CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '12px', padding: '8px',
    borderRadius: '12px',
    border: '1px solid transparent',
    background: `
        linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)) padding-box,
        linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.05)) border-box
    `,
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
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
    display: 'flex', height: '50px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    padding: '0 4px'
};

export const scrollBody: CSSProperties = {
    flex: 1, overflowY: 'auto', padding: '8px'
};

export const sectionGap: CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: '10px'
};

export const sectionBox: CSSProperties = {
    padding: '10px', borderRadius: '24px',
    border: '1px solid transparent',
    background: `
        linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02)) padding-box,
        linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04)) border-box
    `,
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    boxShadow: '0 18px 55px rgba(0,0,0,0.35)',
};

export const sectionLabelBar: CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.4
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
    padding: '6px 12px', borderRadius: '12px',
    fontSize: '9px', fontWeight: 900, cursor: 'pointer',
    transition: 'all 0.3s',
    border: '1px solid transparent',
    background: active
        ? `
            linear-gradient(135deg, ${tokens.colors.accentGreen}, ${tokens.colors.accentGreen}cc) padding-box,
            linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0.10)) border-box
        `
        : `
            linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03)) padding-box,
            linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.05)) border-box
        `,
    color: active ? '#080a0b' : 'rgba(255,255,255,0.65)'
});

export const getGlassMiniBtnStyle = (active?: boolean): CSSProperties => ({
    padding: '8px 12px', borderRadius: '12px',
    border: '1px solid transparent',
    background: active
        ? `
            linear-gradient(135deg, ${tokens.colors.accentGreen}, ${tokens.colors.accentGreen}cc) padding-box,
            linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0.10)) border-box
        `
        : `
            linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02)) padding-box,
            linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.05)) border-box
        `,
    color: active ? '#080a0b' : 'white',
    cursor: 'pointer', transition: 'all 0.3s',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1
});

export const getIconActionStyle = (active?: boolean, color?: string): CSSProperties => ({
    width: '36px', height: '36px', borderRadius: '12px',
    border: '1px solid transparent',
    background: active
        ? `
            linear-gradient(180deg, ${tokens.colors.accentGreen}26, ${tokens.colors.accentGreen}12) padding-box,
            linear-gradient(135deg, rgba(255,255,255,0.26), rgba(255,255,255,0.06)) border-box
        `
        : `
            linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03)) padding-box,
            linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.05)) border-box
        `,
    color: active ? tokens.colors.accentGreen : (color || 'white'),
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'all 0.2s',
    boxShadow: active ? `0 18px 45px ${tokens.colors.glowGreen}` : '0 14px 40px rgba(0,0,0,0.25)',
});

export const getLayerRowStyle = (isSelected: boolean): CSSProperties => ({
    padding: '10px', borderRadius: '20px',
    border: '1px solid transparent',
    background: isSelected
        ? `
            linear-gradient(180deg, ${tokens.colors.accentGreen}20, ${tokens.colors.accentGreen}0d) padding-box,
            linear-gradient(135deg, rgba(255,255,255,0.26), rgba(255,255,255,0.06), ${tokens.colors.glowGreen}) border-box
        `
        : `
            linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02)) padding-box,
            linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04)) border-box
        `,
    display: 'flex', alignItems: 'center', gap: '8px',
    transition: 'all 0.3s', cursor: 'pointer'
});

export const tabContentWrapper: CSSProperties = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
};

export const layerHeader: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
};

export const layerInfoStack: CSSProperties = {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
};

export const headerActionGroup: CSSProperties = {
    display: 'flex',
    gap: '8px'
};

export const fontSelectWrapper: CSSProperties = {
    marginTop: '16px'
};

export const weightBtnGroup: CSSProperties = {
    flex: 1,
    display: 'flex',
    gap: '4px',
    alignItems: 'flex-end'
};

export const externalUrlWrapper: CSSProperties = {
    marginTop: '16px'
};

export const globalHeader: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
};

export const bgTypeSelector: CSSProperties = {
    display: 'flex',
    gap: '6px',
    marginBottom: '20px'
};

export const patternConfigStack: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
};

export const patternBtnGroup: CSSProperties = {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
};

export const globalSettingsRow: CSSProperties = {
    display: 'flex',
    gap: '8px'
};

export const hierarchyStack: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
};

export const hierarchyHeader: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
};

export const hierarchyReorderGroup: CSSProperties = {
    display: 'flex',
    gap: '4px'
};

export const layersListStack: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
};

export const layerItemLabelStack: CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
};

export const layerItemVisibilityGroup: CSSProperties = {
    display: 'flex',
    gap: '8px'
};

export const layerIconBox: CSSProperties = {
    width: '40px', height: '40px', borderRadius: '12px',
    background: 'rgba(255,255,255,0.05)',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
};
