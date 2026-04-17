import React, { memo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Layout, ChevronDown, ChevronUp, Eye, EyeOff, Lock, Unlock,
    Trash2, Image as ImageIcon, Bold, Italic, Type,
    Square, Maximize, RotateCw, Palette,
    Type as Typography, Baseline, Wand2,
    FileImage, FilePlus, Scaling,
    Grid3X3, Layers2, Users, Link as LinkIcon, Settings2,
    CopyPlus, Plus, Box, Orbit, Film
} from 'lucide-react';
import { tokens } from '../../../../../SharedTool/style/tokens.shared.style';
import { ROLES } from '../../types/types';
import { usePropertiesPanelWebLogic } from './PropertiesPanel.web.logics';
import { PropertiesPanelProps } from './PropertiesPanel.shared';
import {
    iconBox, row, miniLabel, ghostInput, textAreaStyle, inputStyle,
    selectStyle, fileDropArea, colorPickerContainer, colorInput,
    colorValue, rangeStyle, miniIconBtn,
    panelRoot, tabBar, scrollBody, sectionGap, sectionBox,
    sectionLabelBar, sectionLabelLine, sectionLabelText,
    getTabBtnStyle, tabUnderline, getChipStyle, getGlassMiniBtnStyle,
    getIconActionStyle, getLayerRowStyle, layerIconBox,
    tabContentWrapper, layerHeader, layerInfoStack, headerActionGroup,
    fontSelectWrapper, weightBtnGroup, externalUrlWrapper, globalHeader,
    bgTypeSelector, patternConfigStack, patternBtnGroup, globalSettingsRow,
    hierarchyStack, hierarchyHeader, hierarchyReorderGroup, layersListStack,
    layerItemLabelStack, layerItemVisibilityGroup
} from './PropertiesPanel.web.styles';

const ANIMATION_PRESETS = [
    '',
    'fadeIn',
    'zoomIn',
    'slideInLeft',
    'slideInRight',
    'slideInUp',
    'slideInDown',
    'slideAcrossRight',
    'slideUp',
    'slideDown',
    'slideLeft',
    'slideRight',
    'float',
    'pulse',
    'glow',
];

const FILL_MODES = ['forwards', 'backwards', 'both', 'none'];
const FIT_OPTIONS = ['cover', 'contain', 'fill', 'none', 'scale-down'];
const LAYER_TYPES = ['text', 'image', 'animated', 'particles', 'canvas', 'lottie', 'shape', 'group', 'background'];
const LAYER_TAGS = ['div', 'span', 'h1', 'h2', 'h3', 'p', 'button', 'section', 'article', 'header', 'footer', 'main'];
const ASSET_TYPES = ['text', 'image', 'tag'];
const BORDER_STYLES = ['none', 'solid', 'dashed', 'dotted', 'double'];

const readTransformNumeric = (transformValue: unknown, fn: string, fallback: number) => {
    const transform = String(transformValue || '');
    const safeFn = fn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = transform.match(new RegExp(`${safeFn}\\((-?\\d+(?:\\.\\d+)?)`));
    const value = match ? Number(match[1]) : NaN;
    return Number.isFinite(value) ? value : fallback;
};

const upsertTransform = (transformValue: unknown, fn: string, numericValue: number, unit: 'deg' | 'px' | '') => {
    const nextValue = Number.isFinite(numericValue) ? numericValue : 0;
    const normalized = String(transformValue || '').trim();
    const safeFn = fn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const token = `${fn}(${nextValue}${unit})`;
    if (!normalized) return token;
    const pattern = new RegExp(`${safeFn}\\([^)]*\\)`);
    if (pattern.test(normalized)) {
        return normalized.replace(pattern, token).trim();
    }
    return `${normalized} ${token}`.trim();
};

const parseBoxShadow = (shadowValue: unknown) => {
    const raw = String(shadowValue || '').trim();
    if (!raw || raw === 'none') {
        return { x: 0, y: 0, blur: 0, spread: 0, color: '#000000' };
    }
    const numericTokens = raw.match(/-?\d+(\.\d+)?/g) || [];
    const colorMatch = raw.match(/(rgba?\([^)]+\)|#[0-9a-fA-F]{3,8})/);
    return {
        x: Number(numericTokens[0] || 0),
        y: Number(numericTokens[1] || 0),
        blur: Number(numericTokens[2] || 0),
        spread: Number(numericTokens[3] || 0),
        color: colorMatch ? colorMatch[1] : '#000000',
    };
};

const parseJsonObject = (raw: string) => {
    try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            return null;
        }
        return parsed as Record<string, any>;
    } catch {
        return null;
    }
};

/**
 * Pure View for PropertiesPanel.
 * No business logic, only declarative UI and event orchestration.
 * Complies with Vianko Architecture Contract (Zero Logic in View).
 */
export const PropertiesPanel: React.FC<PropertiesPanelProps> = memo(({
    project, activeBanner, selectedLayer,
    onUpdateProject, onUpdateBanner, onUpdateLayer, onDeleteLayer,
    onAddBanner, onDuplicateBanner, onDeleteBanner,
    onMoveLayer, tab, setTab
}) => {
    const logic = usePropertiesPanelWebLogic({
        selectedLayer, activeBanner, onUpdateLayer, onUpdateBanner
    });
    const {
        fileRef, bgFileRef,
        updateLayerValue, updateLayerStyle, updateBannerBg,
        handleFileChange, handleBgFileChange,
        readStylePxSafe
    } = logic;

    const updateSettings = (updates: any) => {
        onUpdateProject({ settings: { ...project.settings, ...updates } });
    };

    const toggleRoleOnBanner = (role: string) => {
        const roles = activeBanner.visibilityRoles || [];
        const next = roles.includes(role) ? roles.filter((r) => r !== role) : [...roles, role];
        onUpdateBanner(activeBanner.id, { visibilityRoles: next });
    };

    const updateLayerJsonField = (field: 'media' | 'nativeStyles' | 'imageStyles' | 'nativeImageStyles' | 'styles', raw: string) => {
        if (!selectedLayer) return;
        const parsed = parseJsonObject(raw);
        if (!parsed) return;
        onUpdateLayer(selectedLayer.id, { [field]: parsed } as any);
    };

    const selectedLayerRotation = selectedLayer
        ? parseInt(String(selectedLayer.styles?.transform || '').match(/-?\d+/)?.[0] || '0', 10) || 0
        : 0;

    const selectedLayerBlur = selectedLayer
        ? parseInt(String(selectedLayer.styles?.filter || '').match(/\d+/)?.[0] || '0', 10) || 0
        : 0;

    const selectedTransform = String(selectedLayer?.styles?.transform || '');
    const transformScaleX = readTransformNumeric(selectedTransform, 'scaleX', 1);
    const transformScaleY = readTransformNumeric(selectedTransform, 'scaleY', 1);
    const transformSkewX = readTransformNumeric(selectedTransform, 'skewX', 0);
    const transformSkewY = readTransformNumeric(selectedTransform, 'skewY', 0);
    const transformTranslateX = readTransformNumeric(selectedTransform, 'translateX', 0);
    const transformTranslateY = readTransformNumeric(selectedTransform, 'translateY', 0);
    const shadow = parseBoxShadow(selectedLayer?.styles?.boxShadow);

    return (
        <div style={panelRoot}>
            <div style={tabBar}>
                <TabBtn active={tab === 'props'} onClick={() => setTab('props')} label="PROPIEDADES" icon={<Wand2 size={14} />} />
                <TabBtn active={tab === 'layers'} onClick={() => setTab('layers')} label="JERARQUIA" icon={<Layers2 size={14} />} />
            </div>

            <div style={scrollBody} className="no-scrollbar">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={tab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        style={tabContentWrapper}
                    >
                        {tab === 'props' ? (
                            selectedLayer ? (
                                <div style={sectionGap}>
                                    <header style={layerHeader}>
                                        <div style={layerInfoStack}>
                                            <div style={{ ...iconBox, background: tokens.colors.accentGreen + '20', color: tokens.colors.accentGreen }}>
                                                {selectedLayer.type === 'text'
                                                    ? <Typography size={18} />
                                                    : selectedLayer.type === 'image'
                                                        ? <ImageIcon size={18} />
                                                        : selectedLayer.type === 'particles'
                                                            ? <Orbit size={18} />
                                                            : selectedLayer.type === 'lottie'
                                                                ? <Film size={18} />
                                                                : <Square size={18} />}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <input
                                                    value={selectedLayer.name}
                                                    onChange={(e) => onUpdateLayer(selectedLayer.id, { name: e.target.value })}
                                                    style={{ ...ghostInput, fontSize: '14px', fontWeight: 900, color: 'white' }}
                                                />
                                                <span style={{ fontSize: '9px', fontWeight: 900, opacity: 0.35, letterSpacing: '1px' }}>
                                                    ID: {selectedLayer.id.substring(0, 12)}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={headerActionGroup}>
                                            <IconAction onClick={() => updateLayerValue({ visible: !selectedLayer.visible })} active={selectedLayer.visible}>
                                                {selectedLayer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                                            </IconAction>
                                            <IconAction onClick={() => updateLayerValue({ locked: !selectedLayer.locked })} active={selectedLayer.locked}>
                                                {selectedLayer.locked ? <Lock size={14} /> : <Unlock size={14} />}
                                            </IconAction>
                                            <IconAction onClick={() => onDeleteLayer(selectedLayer.id)} color={tokens.colors.accentError}>
                                                <Trash2 size={14} />
                                            </IconAction>
                                        </div>
                                    </header>

                                    <PropSection label="IDENTIDAD Y VINCULO" icon={<LinkIcon size={12} />}>
                                        <div style={row}>
                                            <div style={{ flex: 1 }}>
                                                <label style={miniLabel}>TIPO</label>
                                                <select
                                                    value={selectedLayer.type}
                                                    onChange={(e) => updateLayerValue({ type: e.target.value as any })}
                                                    style={selectStyle}
                                                >
                                                    {LAYER_TYPES.map((type) => (
                                                        <option key={type} value={type}>{type}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <label style={miniLabel}>TAG</label>
                                                <select
                                                    value={selectedLayer.tag || 'div'}
                                                    onChange={(e) => updateLayerValue({ tag: e.target.value })}
                                                    style={selectStyle}
                                                >
                                                    {LAYER_TAGS.map((tag) => (
                                                        <option key={tag} value={tag}>{tag}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        {selectedLayer.type === 'animated' && (
                                            <div style={{ marginTop: '10px' }}>
                                                <label style={miniLabel}>ASSET TYPE</label>
                                                <select
                                                    value={selectedLayer.assetType || 'image'}
                                                    onChange={(e) => updateLayerValue({ assetType: e.target.value as any })}
                                                    style={selectStyle}
                                                >
                                                    {ASSET_TYPES.map((type) => (
                                                        <option key={type} value={type}>{type}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                        <div style={{ marginTop: '10px' }}>
                                            <label style={miniLabel}>ACTION URL</label>
                                            <input
                                                value={selectedLayer.actionUrl || ''}
                                                onChange={(e) => updateLayerValue({ actionUrl: e.target.value })}
                                                placeholder="/dashboard o https://..."
                                                style={inputStyle}
                                            />
                                        </div>
                                        <div style={row}>
                                            <GlassMiniBtn onClick={() => updateLayerValue({ priority: !selectedLayer.priority })} active={Boolean(selectedLayer.priority)}>
                                                <span style={{ fontSize: '9px' }}>PRIORITY</span>
                                            </GlassMiniBtn>
                                            <GlassMiniBtn onClick={() => updateLayerValue({ lcp: !selectedLayer.lcp })} active={Boolean(selectedLayer.lcp)}>
                                                <span style={{ fontSize: '9px' }}>LCP</span>
                                            </GlassMiniBtn>
                                        </div>
                                    </PropSection>

                                    <PropSection label="TRANSFORMACION" icon={<Maximize size={12} />}>
                                        <div style={row}>
                                            <PropInput label="X" value={readStylePxSafe(selectedLayer.styles.left)} onChange={(v) => updateLayerStyle({ left: parseInt(v, 10) || 0 })} unit="PX" />
                                            <PropInput label="Y" value={readStylePxSafe(selectedLayer.styles.top)} onChange={(v) => updateLayerStyle({ top: parseInt(v, 10) || 0 })} unit="PX" />
                                        </div>
                                        <div style={row}>
                                            <PropInput label="ANCHO" value={readStylePxSafe(selectedLayer.styles.width) || 100} onChange={(v) => updateLayerStyle({ width: parseInt(v, 10) || 1 })} unit="PX" />
                                            <PropInput label="ALTO" value={readStylePxSafe(selectedLayer.styles.height) || 100} onChange={(v) => updateLayerStyle({ height: parseInt(v, 10) || 1 })} unit="PX" />
                                        </div>
                                        <div style={row}>
                                            <PropInput
                                                label="ROTAR"
                                                value={selectedLayerRotation}
                                                onChange={(v) => updateLayerStyle({ transform: upsertTransform(selectedLayer.styles?.transform, 'rotate', parseInt(v, 10) || 0, 'deg') })}
                                                unit="DEG"
                                                icon={<RotateCw size={10} />}
                                            />
                                            <PropInput label="Z-INDEX" value={selectedLayer.styles.zIndex ?? 0} onChange={(v) => updateLayerStyle({ zIndex: parseInt(v, 10) || 0 })} unit="IDX" />
                                        </div>
                                        <div style={row}>
                                            <PropInput label="BORDER RADIUS" value={readStylePxSafe(selectedLayer.styles.borderRadius)} onChange={(v) => updateLayerStyle({ borderRadius: `${parseInt(v, 10) || 0}px` })} unit="PX" />
                                            <PropInput label="BORDER WIDTH" value={readStylePxSafe(selectedLayer.styles.borderWidth)} onChange={(v) => updateLayerStyle({ borderWidth: `${parseInt(v, 10) || 0}px` })} unit="PX" />
                                        </div>
                                        <div style={row}>
                                            <PropInput
                                                label="SCALE X"
                                                value={transformScaleX}
                                                onChange={(v) => updateLayerStyle({ transform: upsertTransform(selectedLayer.styles?.transform, 'scaleX', Number(v) || 1, '') })}
                                            />
                                            <PropInput
                                                label="SCALE Y"
                                                value={transformScaleY}
                                                onChange={(v) => updateLayerStyle({ transform: upsertTransform(selectedLayer.styles?.transform, 'scaleY', Number(v) || 1, '') })}
                                            />
                                        </div>
                                        <div style={row}>
                                            <PropInput
                                                label="SKEW X"
                                                value={transformSkewX}
                                                onChange={(v) => updateLayerStyle({ transform: upsertTransform(selectedLayer.styles?.transform, 'skewX', Number(v) || 0, 'deg') })}
                                                unit="DEG"
                                            />
                                            <PropInput
                                                label="SKEW Y"
                                                value={transformSkewY}
                                                onChange={(v) => updateLayerStyle({ transform: upsertTransform(selectedLayer.styles?.transform, 'skewY', Number(v) || 0, 'deg') })}
                                                unit="DEG"
                                            />
                                        </div>
                                        <div style={row}>
                                            <PropInput
                                                label="TX"
                                                value={transformTranslateX}
                                                onChange={(v) => updateLayerStyle({ transform: upsertTransform(selectedLayer.styles?.transform, 'translateX', Number(v) || 0, 'px') })}
                                                unit="PX"
                                            />
                                            <PropInput
                                                label="TY"
                                                value={transformTranslateY}
                                                onChange={(v) => updateLayerStyle({ transform: upsertTransform(selectedLayer.styles?.transform, 'translateY', Number(v) || 0, 'px') })}
                                                unit="PX"
                                            />
                                        </div>
                                        <div style={{ marginTop: '10px' }}>
                                            <label style={miniLabel}>TRANSFORM ORIGIN</label>
                                            <input
                                                value={String(selectedLayer.styles.transformOrigin || 'center center')}
                                                onChange={(e) => updateLayerStyle({ transformOrigin: e.target.value })}
                                                placeholder="center center"
                                                style={inputStyle}
                                            />
                                        </div>
                                        <div style={{ marginTop: '10px' }}>
                                            <label style={miniLabel}>BORDER STYLE</label>
                                            <select
                                                value={String(selectedLayer.styles.borderStyle || 'solid')}
                                                onChange={(e) => updateLayerStyle({ borderStyle: e.target.value })}
                                                style={selectStyle}
                                            >
                                                {BORDER_STYLES.map((style) => (
                                                    <option key={style} value={style}>{style}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div style={row}>
                                            <PropInput
                                                label="RADIUS TL"
                                                value={readStylePxSafe(selectedLayer.styles.borderTopLeftRadius)}
                                                onChange={(v) => updateLayerStyle({ borderTopLeftRadius: `${parseInt(v, 10) || 0}px` })}
                                                unit="PX"
                                            />
                                            <PropInput
                                                label="RADIUS TR"
                                                value={readStylePxSafe(selectedLayer.styles.borderTopRightRadius)}
                                                onChange={(v) => updateLayerStyle({ borderTopRightRadius: `${parseInt(v, 10) || 0}px` })}
                                                unit="PX"
                                            />
                                        </div>
                                        <div style={row}>
                                            <PropInput
                                                label="RADIUS BL"
                                                value={readStylePxSafe(selectedLayer.styles.borderBottomLeftRadius)}
                                                onChange={(v) => updateLayerStyle({ borderBottomLeftRadius: `${parseInt(v, 10) || 0}px` })}
                                                unit="PX"
                                            />
                                            <PropInput
                                                label="RADIUS BR"
                                                value={readStylePxSafe(selectedLayer.styles.borderBottomRightRadius)}
                                                onChange={(v) => updateLayerStyle({ borderBottomRightRadius: `${parseInt(v, 10) || 0}px` })}
                                                unit="PX"
                                            />
                                        </div>
                                        <div style={{ marginTop: '10px' }}>
                                            <label style={miniLabel}>BORDER COLOR</label>
                                            <div style={colorPickerContainer}>
                                                <input type="color" value={String(selectedLayer.styles.borderColor || '#ffffff')} onChange={(e) => updateLayerStyle({ borderColor: e.target.value })} style={colorInput} />
                                                <span style={colorValue}>{String(selectedLayer.styles.borderColor || '#FFFFFF')}</span>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '10px' }}>
                                            <label style={miniLabel}>OUTLINE WIDTH</label>
                                            <input
                                                value={String(selectedLayer.styles.outlineWidth || '0px')}
                                                onChange={(e) => updateLayerStyle({ outlineWidth: e.target.value, outlineStyle: (parseFloat(e.target.value) || 0) > 0 ? 'solid' : 'none' })}
                                                placeholder="0px"
                                                style={inputStyle}
                                            />
                                        </div>
                                        <div style={{ marginTop: '10px' }}>
                                            <label style={miniLabel}>OUTLINE COLOR</label>
                                            <div style={colorPickerContainer}>
                                                <input type="color" value={String(selectedLayer.styles.outlineColor || '#ffffff')} onChange={(e) => updateLayerStyle({ outlineColor: e.target.value })} style={colorInput} />
                                                <span style={colorValue}>{String(selectedLayer.styles.outlineColor || '#FFFFFF')}</span>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '10px' }}>
                                            <label style={miniLabel}>BOX SHADOW</label>
                                            <div style={row}>
                                                <PropInput label="X" value={shadow.x} onChange={(v) => updateLayerStyle({ boxShadow: `${Number(v) || 0}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}` })} unit="PX" />
                                                <PropInput label="Y" value={shadow.y} onChange={(v) => updateLayerStyle({ boxShadow: `${shadow.x}px ${Number(v) || 0}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}` })} unit="PX" />
                                            </div>
                                            <div style={row}>
                                                <PropInput label="BLUR" value={shadow.blur} onChange={(v) => updateLayerStyle({ boxShadow: `${shadow.x}px ${shadow.y}px ${Number(v) || 0}px ${shadow.spread}px ${shadow.color}` })} unit="PX" />
                                                <PropInput label="SPREAD" value={shadow.spread} onChange={(v) => updateLayerStyle({ boxShadow: `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${Number(v) || 0}px ${shadow.color}` })} unit="PX" />
                                            </div>
                                            <div style={{ marginTop: '10px' }}>
                                                <label style={miniLabel}>SHADOW COLOR</label>
                                                <div style={colorPickerContainer}>
                                                    <input type="color" value={shadow.color} onChange={(e) => updateLayerStyle({ boxShadow: `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${e.target.value}` })} style={colorInput} />
                                                    <span style={colorValue}>{shadow.color}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </PropSection>

                                    {selectedLayer.type === 'text' && (
                                        <PropSection label="TIPOGRAFIA" icon={<Baseline size={12} />}>
                                            <textarea
                                                value={selectedLayer.content || ''}
                                                onChange={(e) => updateLayerValue({ content: e.target.value })}
                                                placeholder="Contenido del texto..."
                                                style={textAreaStyle}
                                            />
                                            <div style={fontSelectWrapper}>
                                                <label style={miniLabel}>FAMILIA DE FUENTE</label>
                                                <select
                                                    value={String(selectedLayer.styles.fontFamily || "'Inter', sans-serif")}
                                                    onChange={(e) => updateLayerStyle({ fontFamily: e.target.value })}
                                                    style={selectStyle}
                                                >
                                                    <option value="'Inter', sans-serif">Inter (Moderno)</option>
                                                    <option value="'Poppins', sans-serif">Poppins (Geometrico)</option>
                                                    <option value="'Roboto Mono', monospace">Roboto Mono (Tech)</option>
                                                    <option value="'Outfit', sans-serif">Outfit (UI)</option>
                                                </select>
                                            </div>
                                            <div style={row}>
                                                <PropInput label="TAMANO" value={readStylePxSafe(selectedLayer.styles.fontSize) || 16} onChange={(v) => updateLayerStyle({ fontSize: `${parseInt(v, 10) || 16}px` })} unit="PX" />
                                                <PropInput label="LINE HEIGHT" value={readStylePxSafe(selectedLayer.styles.lineHeight)} onChange={(v) => updateLayerStyle({ lineHeight: `${parseInt(v, 10) || 16}px` })} unit="PX" />
                                            </div>
                                            <div style={row}>
                                                <PropInput label="LETTER" value={readStylePxSafe(selectedLayer.styles.letterSpacing)} onChange={(v) => updateLayerStyle({ letterSpacing: `${parseInt(v, 10) || 0}px` })} unit="PX" />
                                                <div style={weightBtnGroup}>
                                                    <GlassMiniBtn onClick={() => updateLayerStyle({ fontWeight: 400 })} active={selectedLayer.styles.fontWeight === 400}><Type size={14} opacity={0.4} /></GlassMiniBtn>
                                                    <GlassMiniBtn onClick={() => updateLayerStyle({ fontWeight: 700 })} active={selectedLayer.styles.fontWeight === 700}><Bold size={14} /></GlassMiniBtn>
                                                    <GlassMiniBtn onClick={() => updateLayerStyle({ fontStyle: selectedLayer.styles.fontStyle === 'italic' ? 'normal' : 'italic' })} active={selectedLayer.styles.fontStyle === 'italic'}><Italic size={14} /></GlassMiniBtn>
                                                </div>
                                            </div>
                                            <div>
                                                <label style={miniLabel}>COLOR</label>
                                                <div style={colorPickerContainer}>
                                                    <input type="color" value={String(selectedLayer.styles.color || '#ffffff')} onChange={(e) => updateLayerStyle({ color: e.target.value })} style={colorInput} />
                                                    <span style={colorValue}>{String(selectedLayer.styles.color || '#FFFFFF')}</span>
                                                </div>
                                            </div>
                                        </PropSection>
                                    )}

                                    {(selectedLayer.type === 'image' || (selectedLayer.type === 'animated' && selectedLayer.assetType === 'image')) && (
                                        <PropSection label="RECURSO DE IMAGEN" icon={<FileImage size={12} />}>
                                            <div style={fileDropArea} onClick={() => fileRef.current?.click()}>
                                                <FilePlus size={24} opacity={0.4} />
                                                <span style={{ fontSize: '10px', fontWeight: 900, opacity: 0.6 }}>CARGAR IMAGEN</span>
                                                <input type="file" ref={fileRef} accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                                            </div>
                                            <div style={externalUrlWrapper}>
                                                <label style={miniLabel}>SRC / URL</label>
                                                <input
                                                    value={selectedLayer.src || ''}
                                                    onChange={(e) => updateLayerValue({ src: e.target.value })}
                                                    placeholder="/banner/assets/archivo.webp"
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div style={row}>
                                                <div style={{ flex: 1 }}>
                                                    <label style={miniLabel}>FIT</label>
                                                    <select
                                                        value={selectedLayer.fit || 'contain'}
                                                        onChange={(e) => updateLayerValue({ fit: e.target.value as any })}
                                                        style={selectStyle}
                                                    >
                                                        {FIT_OPTIONS.map((fit) => (
                                                            <option key={fit} value={fit}>{fit}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <label style={miniLabel}>POSITION</label>
                                                    <input
                                                        value={selectedLayer.position || 'center'}
                                                        onChange={(e) => updateLayerValue({ position: e.target.value })}
                                                        placeholder="center"
                                                        style={inputStyle}
                                                    />
                                                </div>
                                            </div>
                                            <div style={{ marginTop: '10px' }}>
                                                <label style={miniLabel}>ALT</label>
                                                <input
                                                    value={selectedLayer.alt || ''}
                                                    onChange={(e) => updateLayerValue({ alt: e.target.value })}
                                                    placeholder="Descripcion imagen"
                                                    style={inputStyle}
                                                />
                                            </div>
                                        </PropSection>
                                    )}

                                    {selectedLayer.type === 'lottie' && (
                                        <PropSection label="LOTTIE / JSON" icon={<Film size={12} />}>
                                            <div style={{ marginBottom: '10px' }}>
                                                <label style={miniLabel}>SOURCE</label>
                                                <input
                                                    value={selectedLayer.source || ''}
                                                    onChange={(e) => updateLayerValue({ source: e.target.value })}
                                                    placeholder="/banner/assets/animacion.json"
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div style={row}>
                                                <GlassMiniBtn onClick={() => updateLayerValue({ loop: !selectedLayer.loop })} active={Boolean(selectedLayer.loop)}>
                                                    <span style={{ fontSize: '9px' }}>LOOP</span>
                                                </GlassMiniBtn>
                                                <GlassMiniBtn onClick={() => updateLayerValue({ autoPlay: !selectedLayer.autoPlay })} active={Boolean(selectedLayer.autoPlay)}>
                                                    <span style={{ fontSize: '9px' }}>AUTO PLAY</span>
                                                </GlassMiniBtn>
                                            </div>
                                            <div style={{ marginTop: '10px' }}>
                                                <PropInput label="SPEED" value={selectedLayer.speed ?? 1} onChange={(v) => updateLayerValue({ speed: Number(v) || 1 })} />
                                            </div>
                                        </PropSection>
                                    )}

                                    {(selectedLayer.type === 'particles' || selectedLayer.type === 'canvas') && (
                                        <PropSection label="EFECTOS DE CAPA" icon={<Orbit size={12} />}>
                                            <div style={{ marginBottom: '10px' }}>
                                                <label style={miniLabel}>EFFECT</label>
                                                <select
                                                    value={selectedLayer.effect || (selectedLayer.type === 'canvas' ? 'nodes' : 'snow')}
                                                    onChange={(e) => updateLayerValue({ effect: e.target.value })}
                                                    style={selectStyle}
                                                >
                                                    {['nodes', 'particles', 'hearts', 'rain', 'snow', 'fire', 'stars'].map((effect) => (
                                                        <option key={effect} value={effect}>{effect}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <SlideControl label="DENSIDAD" value={Number(selectedLayer.density ?? 0.35)} min={0} max={1} step={0.01} onChange={(v) => updateLayerValue({ density: v })} />
                                            {selectedLayer.type === 'canvas' && (
                                                <SlideControl label="INTENSIDAD" value={Number(selectedLayer.intensity ?? 0.5)} min={0} max={1} step={0.01} onChange={(v) => updateLayerValue({ intensity: v })} />
                                            )}
                                            <div style={{ marginTop: '10px' }}>
                                                <label style={miniLabel}>COLOR</label>
                                                <div style={colorPickerContainer}>
                                                    <input type="color" value={String(selectedLayer.color || '#9ecbff')} onChange={(e) => updateLayerValue({ color: e.target.value })} style={colorInput} />
                                                    <span style={colorValue}>{String(selectedLayer.color || '#9ECBFF')}</span>
                                                </div>
                                            </div>
                                        </PropSection>
                                    )}

                                    <PropSection label="ANIMACION AVANZADA" icon={<Wand2 size={12} />}>
                                        <label style={miniLabel}>PRESET / KEYFRAME</label>
                                        <select
                                            value={selectedLayer.animation?.name || ''}
                                            onChange={(e) => updateLayerValue({ animation: { ...(selectedLayer.animation || {}), name: e.target.value } as any })}
                                            style={selectStyle}
                                        >
                                            <option value="">SIN ANIMACION</option>
                                            {ANIMATION_PRESETS.filter(Boolean).map((name) => (
                                                <option key={name} value={name}>{name}</option>
                                            ))}
                                        </select>
                                        <div style={{ marginTop: '12px' }}>
                                            <div style={row}>
                                                <TextPropInput label="DURATION" value={selectedLayer.animation?.duration || '0.9s'} onChange={(v) => updateLayerValue({ animation: { ...(selectedLayer.animation || {}), duration: v } as any })} placeholder="0.9s" />
                                                <TextPropInput label="DELAY" value={selectedLayer.animation?.delay || '0s'} onChange={(v) => updateLayerValue({ animation: { ...(selectedLayer.animation || {}), delay: v } as any })} placeholder="0s" />
                                            </div>
                                            <div style={row}>
                                                <TextPropInput label="EASING" value={(selectedLayer.animation as any)?.easing || selectedLayer.animation?.timingFunction || 'ease'} onChange={(v) => updateLayerValue({ animation: { ...(selectedLayer.animation || {}), easing: v, timingFunction: v } as any })} placeholder="ease" />
                                                <TextPropInput label="ITERATION" value={String(selectedLayer.animation?.iterationCount ?? 1)} onChange={(v) => updateLayerValue({ animation: { ...(selectedLayer.animation || {}), iterationCount: v } as any })} placeholder="1 o infinite" />
                                            </div>
                                            <div style={{ marginTop: '10px' }}>
                                                <label style={miniLabel}>FILL MODE</label>
                                                <select
                                                    value={(selectedLayer.animation as any)?.fillMode || 'forwards'}
                                                    onChange={(e) => updateLayerValue({ animation: { ...(selectedLayer.animation || {}), fillMode: e.target.value } as any })}
                                                    style={selectStyle}
                                                >
                                                    {FILL_MODES.map((fillMode) => (
                                                        <option key={fillMode} value={fillMode}>{fillMode}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </PropSection>

                                    <PropSection label="ESTILOS CONTRATO (JSON)" icon={<Settings2 size={12} />}>
                                        <JsonEditor
                                            label="NATIVE STYLES"
                                            value={selectedLayer.nativeStyles}
                                            placeholder='{"borderRadius":12,"overflow":"hidden"}'
                                            onCommit={(raw) => updateLayerJsonField('nativeStyles', raw)}
                                        />
                                        <JsonEditor
                                            label="IMAGE STYLES"
                                            value={selectedLayer.imageStyles}
                                            placeholder='{"objectFit":"cover"}'
                                            onCommit={(raw) => updateLayerJsonField('imageStyles', raw)}
                                        />
                                        <JsonEditor
                                            label="NATIVE IMAGE STYLES"
                                            value={selectedLayer.nativeImageStyles}
                                            placeholder='{"borderRadius":8}'
                                            onCommit={(raw) => updateLayerJsonField('nativeImageStyles', raw)}
                                        />
                                        <JsonEditor
                                            label="MEDIA BREAKPOINTS"
                                            value={selectedLayer.media}
                                            placeholder='{"768":{"fontSize":22},"480":{"fontSize":18}}'
                                            onCommit={(raw) => updateLayerJsonField('media', raw)}
                                        />
                                        <div style={{ marginTop: '10px' }}>
                                            <label style={miniLabel}>MASK (WEB)</label>
                                            <input
                                                value={selectedLayer.mask || ''}
                                                onChange={(e) => updateLayerValue({ mask: e.target.value })}
                                                placeholder="radial-gradient(circle,#000 70%,transparent 72%)"
                                                style={inputStyle}
                                            />
                                        </div>
                                    </PropSection>

                                    <PropSection label="EFECTOS VISUALES" icon={<Palette size={12} />}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            <SlideControl label="OPACIDAD" value={Number(selectedLayer.styles.opacity ?? 1)} min={0} max={1} step={0.01} onChange={(v) => updateLayerStyle({ opacity: v })} />
                                            <SlideControl label="BLUR" value={selectedLayerBlur} min={0} max={20} step={1} onChange={(v) => updateLayerStyle({ filter: `blur(${v}px)` })} />
                                        </div>
                                    </PropSection>

                                    <PropSection label="ROLES DE VISIBILIDAD" icon={<Users size={12} />}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {ROLES.map((role) => (
                                                <Chip
                                                    key={role}
                                                    label={role}
                                                    active={selectedLayer.visibilityRoles?.includes(role)}
                                                    onClick={() => {
                                                        const roles = selectedLayer.visibilityRoles || [];
                                                        const next = roles.includes(role) ? roles.filter((r) => r !== role) : [...roles, role];
                                                        updateLayerValue({ visibilityRoles: next });
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </PropSection>
                                </div>
                            ) : (
                                <div style={sectionGap}>
                                    <header style={globalHeader}>
                                        <div style={{ ...iconBox, background: tokens.colors.accentGreen + '20', color: tokens.colors.accentGreen }}>
                                            <Layout size={18} />
                                        </div>
                                        <h3 style={{ fontSize: '14px', fontWeight: 900, color: 'white' }}>ORQUESTACION BANNER</h3>
                                    </header>

                                    <PropSection label="BANNERS" icon={<Box size={12} />}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {project.banners.map((banner) => (
                                                <button
                                                    key={banner.id}
                                                    onClick={() => onUpdateProject({ activeBannerId: banner.id })}
                                                    style={getChipStyle(project.activeBannerId === banner.id)}
                                                >
                                                    {banner.name}
                                                </button>
                                            ))}
                                        </div>
                                        <div style={{ ...row, marginTop: '10px' }}>
                                            <GlassMiniBtn onClick={onAddBanner} active={false}>
                                                <span style={{ fontSize: '9px', display: 'flex', gap: '6px', alignItems: 'center' }}><Plus size={12} /> AGREGAR</span>
                                            </GlassMiniBtn>
                                            <GlassMiniBtn onClick={() => onDuplicateBanner(activeBanner.id)} active={false}>
                                                <span style={{ fontSize: '9px', display: 'flex', gap: '6px', alignItems: 'center' }}><CopyPlus size={12} /> DUPLICAR</span>
                                            </GlassMiniBtn>
                                            <GlassMiniBtn onClick={() => onDeleteBanner(activeBanner.id)} active={false}>
                                                <span style={{ fontSize: '9px', display: 'flex', gap: '6px', alignItems: 'center' }}><Trash2 size={12} /> ELIMINAR</span>
                                            </GlassMiniBtn>
                                        </div>
                                        <div style={{ marginTop: '10px' }}>
                                            <label style={miniLabel}>NOMBRE BANNER</label>
                                            <input
                                                value={activeBanner.name}
                                                onChange={(e) => onUpdateBanner(activeBanner.id, { name: e.target.value })}
                                                placeholder="Banner principal"
                                                style={inputStyle}
                                            />
                                        </div>
                                    </PropSection>

                                    <PropSection label="CANVAS Y METRICA" icon={<Scaling size={12} />}>
                                        <div style={row}>
                                            <PropInput label="ANCHO" value={activeBanner.designWidth} onChange={(v) => onUpdateBanner(activeBanner.id, { designWidth: parseInt(v, 10) || 800 })} unit="PX" />
                                            <PropInput label="ALTO" value={activeBanner.designHeight} onChange={(v) => onUpdateBanner(activeBanner.id, { designHeight: parseInt(v, 10) || 220 })} unit="PX" />
                                        </div>
                                        <div style={row}>
                                            <PropInput label="BORDER RADIUS" value={readStylePxSafe(activeBanner.styles?.borderRadius)} onChange={(v) => onUpdateBanner(activeBanner.id, { styles: { ...(activeBanner.styles || {}), borderRadius: `${parseInt(v, 10) || 0}px` } })} unit="PX" />
                                            <PropInput label="DURATION" value={activeBanner.duration ?? 5} onChange={(v) => onUpdateBanner(activeBanner.id, { duration: Number(v) || 5 })} unit="S" />
                                        </div>
                                        <div style={row}>
                                            <PropInput
                                                label="BORDER WIDTH"
                                                value={readStylePxSafe(activeBanner.styles?.borderWidth)}
                                                onChange={(v) => onUpdateBanner(activeBanner.id, { styles: { ...(activeBanner.styles || {}), borderWidth: `${parseInt(v, 10) || 0}px` } })}
                                                unit="PX"
                                            />
                                            <div style={{ flex: 1 }}>
                                                <label style={miniLabel}>BORDER STYLE</label>
                                                <select
                                                    value={String(activeBanner.styles?.borderStyle || 'solid')}
                                                    onChange={(e) => onUpdateBanner(activeBanner.id, { styles: { ...(activeBanner.styles || {}), borderStyle: e.target.value } })}
                                                    style={selectStyle}
                                                >
                                                    {BORDER_STYLES.map((style) => (
                                                        <option key={style} value={style}>{style}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '10px' }}>
                                            <label style={miniLabel}>BORDER COLOR</label>
                                            <div style={colorPickerContainer}>
                                                <input
                                                    type="color"
                                                    value={String(activeBanner.styles?.borderColor || '#ffffff')}
                                                    onChange={(e) => onUpdateBanner(activeBanner.id, { styles: { ...(activeBanner.styles || {}), borderColor: e.target.value } })}
                                                    style={colorInput}
                                                />
                                                <span style={colorValue}>{String(activeBanner.styles?.borderColor || '#FFFFFF')}</span>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '10px' }}>
                                            <label style={miniLabel}>BANNER ACTION URL</label>
                                            <input
                                                value={activeBanner.actionUrl || ''}
                                                onChange={(e) => onUpdateBanner(activeBanner.id, { actionUrl: e.target.value })}
                                                placeholder="/dashboard"
                                                style={inputStyle}
                                            />
                                        </div>
                                    </PropSection>

                                    <PropSection label="ESTILO DE FONDO" icon={<Palette size={12} />}>
                                        <div style={bgTypeSelector}>
                                            {['color', 'gradient', 'image', 'pattern'].map((type) => (
                                                <GlassMiniBtn key={type} onClick={() => updateBannerBg({ type: type as any })} active={activeBanner.background.type === type}>
                                                    <span style={{ fontSize: '9px' }}>{type.toUpperCase()}</span>
                                                </GlassMiniBtn>
                                            ))}
                                        </div>

                                        {activeBanner.background.type === 'color' && (
                                            <div style={colorPickerContainer}>
                                                <input type="color" value={activeBanner.background.color || '#000000'} onChange={(e) => updateBannerBg({ color: e.target.value })} style={colorInput} />
                                                <span style={colorValue}>{activeBanner.background.color || '#000000'}</span>
                                            </div>
                                        )}

                                        {activeBanner.background.type === 'gradient' && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                <SlideControl
                                                    label="ANGULO"
                                                    value={Number(activeBanner.background.gradient?.angle ?? 90)}
                                                    min={0}
                                                    max={360}
                                                    step={1}
                                                    onChange={(value) => updateBannerBg({ gradient: { ...(activeBanner.background.gradient || { c1: '#1e293b', c2: '#0f172a' }), angle: value } })}
                                                />
                                                <div style={row}>
                                                    <div style={{ flex: 1 }}>
                                                        <label style={miniLabel}>COLOR 1</label>
                                                        <div style={colorPickerContainer}>
                                                            <input type="color" value={activeBanner.background.gradient?.c1 || '#1e293b'} onChange={(e) => updateBannerBg({ gradient: { ...(activeBanner.background.gradient || { angle: 90, c2: '#0f172a' }), c1: e.target.value } })} style={colorInput} />
                                                            <span style={colorValue}>{activeBanner.background.gradient?.c1 || '#1E293B'}</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <label style={miniLabel}>COLOR 2</label>
                                                        <div style={colorPickerContainer}>
                                                            <input type="color" value={activeBanner.background.gradient?.c2 || '#0f172a'} onChange={(e) => updateBannerBg({ gradient: { ...(activeBanner.background.gradient || { angle: 90, c1: '#1e293b' }), c2: e.target.value } })} style={colorInput} />
                                                            <span style={colorValue}>{activeBanner.background.gradient?.c2 || '#0F172A'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeBanner.background.type === 'image' && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                <div style={fileDropArea} onClick={() => bgFileRef.current?.click()}>
                                                    <FileImage size={24} opacity={0.4} />
                                                    <span style={{ fontSize: '10px', fontWeight: 900, opacity: 0.5 }}>CARGAR FONDO</span>
                                                    <input type="file" ref={bgFileRef} accept="image/*" onChange={handleBgFileChange} style={{ display: 'none' }} />
                                                </div>
                                                <input value={activeBanner.background.image || ''} onChange={(e) => updateBannerBg({ image: e.target.value })} placeholder="URL Fondo..." style={inputStyle} />
                                                <div style={row}>
                                                    <div style={{ flex: 1 }}>
                                                        <label style={miniLabel}>FIT</label>
                                                        <select
                                                            value={activeBanner.background.fit || 'cover'}
                                                            onChange={(e) => updateBannerBg({ fit: e.target.value as any })}
                                                            style={selectStyle}
                                                        >
                                                            {FIT_OPTIONS.map((fit) => (
                                                                <option key={fit} value={fit}>{fit}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <label style={miniLabel}>POSITION</label>
                                                        <input
                                                            value={activeBanner.background.position || 'center'}
                                                            onChange={(e) => updateBannerBg({ position: e.target.value })}
                                                            placeholder="center"
                                                            style={inputStyle}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeBanner.background.type === 'pattern' && (
                                            <div style={patternConfigStack}>
                                                <div style={patternBtnGroup}>
                                                    {['dots', 'grid', 'waves', 'noise'].map((pattern) => (
                                                        <GlassMiniBtn key={pattern} onClick={() => updateBannerBg({ pattern: pattern as any })} active={(activeBanner.background.pattern || 'dots') === pattern}>
                                                            <span style={{ fontSize: '9px' }}>{pattern.toUpperCase()}</span>
                                                        </GlassMiniBtn>
                                                    ))}
                                                </div>
                                                <SlideControl label="ESCALA" value={activeBanner.background.scale || 18} min={6} max={64} step={1} onChange={(v) => updateBannerBg({ scale: v })} />
                                                <SlideControl label="OPACIDAD" value={activeBanner.background.opacity ?? 0.15} min={0} max={1} step={0.01} onChange={(v) => updateBannerBg({ opacity: v })} />
                                            </div>
                                        )}
                                    </PropSection>

                                    <PropSection label="ROLES DE BANNER" icon={<Users size={12} />}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {ROLES.map((role) => (
                                                <Chip
                                                    key={role}
                                                    label={role}
                                                    active={activeBanner.visibilityRoles?.includes(role)}
                                                    onClick={() => toggleRoleOnBanner(role)}
                                                />
                                            ))}
                                        </div>
                                    </PropSection>

                                    <PropSection label="BANNER TOOLS / PLAYER" icon={<Grid3X3 size={12} />}>
                                        <div style={globalSettingsRow}>
                                            <GlassMiniBtn onClick={() => updateSettings({ autoplay: !project.settings.autoplay })} active={project.settings.autoplay}>
                                                <span style={{ fontSize: '9px' }}>AUTOPLAY</span>
                                            </GlassMiniBtn>
                                            <GlassMiniBtn onClick={() => updateSettings({ loop: !project.settings.loop })} active={project.settings.loop}>
                                                <span style={{ fontSize: '9px' }}>LOOP</span>
                                            </GlassMiniBtn>
                                        </div>
                                        <div style={{ marginTop: '10px' }}>
                                            <label style={miniLabel}>MODO</label>
                                            <select
                                                value={project.settings.mode || 'auto'}
                                                onChange={(e) => updateSettings({ mode: e.target.value })}
                                                style={selectStyle}
                                            >
                                                <option value="auto">auto</option>
                                                <option value="manual">manual</option>
                                            </select>
                                        </div>
                                        <div style={{ marginTop: '10px' }}>
                                            <label style={miniLabel}>TRANSICION</label>
                                            <select
                                                value={project.settings.transition || 'fade'}
                                                onChange={(e) => updateSettings({ transition: e.target.value })}
                                                style={selectStyle}
                                            >
                                                <option value="fade">fade</option>
                                                <option value="slide">slide</option>
                                                <option value="zoom">zoom</option>
                                                <option value="none">none</option>
                                            </select>
                                        </div>
                                        <div style={{ marginTop: '10px' }}>
                                            <PropInput label="INTERVAL MS" value={project.settings.intervalMs ?? 6000} onChange={(v) => updateSettings({ intervalMs: Math.max(1000, parseInt(v, 10) || 6000) })} unit="MS" />
                                        </div>
                                    </PropSection>
                                </div>
                            )
                        ) : (
                            <div style={hierarchyStack}>
                                <div style={hierarchyHeader}>
                                    <h3 style={{ fontSize: '12px', fontWeight: 900, color: 'white', letterSpacing: '1px' }}>
                                        JERARQUIA ({activeBanner.layers.length})
                                    </h3>
                                    <div style={hierarchyReorderGroup}>
                                        <IconAction onClick={() => onMoveLayer('up')}><ChevronUp size={14} /></IconAction>
                                        <IconAction onClick={() => onMoveLayer('down')}><ChevronDown size={14} /></IconAction>
                                    </div>
                                </div>
                                <div style={layersListStack}>
                                    {activeBanner.layers.map((layer) => (
                                        <div
                                            key={layer.id}
                                            onClick={() => onUpdateLayer(layer.id, {})}
                                            style={getLayerRowStyle(selectedLayer?.id === layer.id)}
                                        >
                                            <div style={layerIconBox}>
                                                {layer.type === 'text'
                                                    ? <Typography size={16} />
                                                    : layer.type === 'image'
                                                        ? <ImageIcon size={16} />
                                                        : layer.type === 'particles'
                                                            ? <Orbit size={16} />
                                                            : <Square size={16} />}
                                            </div>
                                            <div style={layerItemLabelStack}>
                                                <span style={{ fontSize: '11px', fontWeight: 900, color: 'white' }}>{layer.name}</span>
                                                <span style={{ fontSize: '8px', opacity: 0.4, letterSpacing: '1px' }}>{layer.type.toUpperCase()}</span>
                                            </div>
                                            <div style={layerItemVisibilityGroup}>
                                                <button onClick={(e) => { e.stopPropagation(); onUpdateLayer(layer.id, { visible: !layer.visible }); }} style={miniIconBtn}>
                                                    {layer.visible ? <Eye size={12} /> : <EyeOff size={12} opacity={0.3} />}
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); onUpdateLayer(layer.id, { locked: !layer.locked }); }} style={miniIconBtn}>
                                                    {layer.locked ? <Lock size={12} color={tokens.colors.accentGreen} /> : <Unlock size={12} opacity={0.3} />}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
});

const TabBtn: React.FC<{ active: boolean; label: string; icon: React.ReactNode; onClick: () => void }> = memo(({ active, label, icon, onClick }) => (
    <button onClick={onClick} style={getTabBtnStyle(active)}>
        {icon}
        <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '2px' }}>{label}</span>
        {active && <motion.div layoutId="tab-underline" style={tabUnderline} />}
    </button>
));

const PropSection: React.FC<{ label: string; icon: React.ReactNode; children: React.ReactNode }> = memo(({ label, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={sectionLabelBar}>
            <div style={sectionLabelLine} />
            <span style={sectionLabelText}>{label}</span>
        </div>
        <div style={sectionBox}>
            {children}
        </div>
    </div>
));

const PropInput: React.FC<{ label: string; value: any; onChange: (v: string) => void; unit?: string; icon?: React.ReactNode }> = memo(({ label, value, onChange, unit, icon }) => {
    const safeValue = (value != null && !Number.isNaN(value)) ? value : 0;
    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label style={miniLabel}>{label}</label>
                {icon}
            </div>
            <div style={{ position: 'relative' }}>
                <input
                    type="number"
                    value={safeValue}
                    onChange={(e) => onChange(e.target.value)}
                    style={{ ...inputStyle, paddingRight: unit ? '36px' : '16px' }}
                />
                {unit && (
                    <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '8px', fontWeight: 900, opacity: 0.2 }}>
                        {unit}
                    </span>
                )}
            </div>
        </div>
    );
});

const TextPropInput: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder?: string }> = memo(({ label, value, onChange, placeholder }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={miniLabel}>{label}</label>
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
    </div>
));

const SlideControl: React.FC<{ label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void }> = memo(({ label, value, min, max, step = 1, onChange }) => {
    const safeValue = (value != null && !Number.isNaN(value)) ? value : min;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label style={miniLabel}>{label}</label>
                <span style={{ fontSize: '9px', fontWeight: 900, opacity: 0.5 }}>{safeValue}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={safeValue} onChange={(e) => onChange(parseFloat(e.target.value))} style={rangeStyle} />
        </div>
    );
});

const Chip: React.FC<{ label: string; active?: boolean; onClick: () => void }> = memo(({ label, active, onClick }) => (
    <button onClick={onClick} style={getChipStyle(active)}>
        {label}
    </button>
));

const IconAction: React.FC<{ children: React.ReactNode; onClick: () => void; active?: boolean; color?: string }> = memo(({ children, onClick, active, color }) => (
    <button onClick={onClick} style={getIconActionStyle(active, color)}>
        {children}
    </button>
));

const GlassMiniBtn: React.FC<{ children: React.ReactNode; onClick: () => void; active?: boolean }> = memo(({ children, onClick, active }) => (
    <button onClick={onClick} style={getGlassMiniBtnStyle(active)}>
        {children}
    </button>
));

const JsonEditor: React.FC<{
    label: string;
    value: unknown;
    placeholder: string;
    onCommit: (value: string) => void;
}> = memo(({ label, value, placeholder, onCommit }) => {
    const [raw, setRaw] = useState('');
    const [isValid, setIsValid] = useState(true);

    useEffect(() => {
        if (!value || typeof value !== 'object') {
            setRaw('');
            setIsValid(true);
            return;
        }
        try {
            setRaw(JSON.stringify(value, null, 2));
            setIsValid(true);
        } catch {
            setRaw('');
            setIsValid(false);
        }
    }, [value]);

    return (
        <div style={{ marginTop: '10px' }}>
            <label style={miniLabel}>{label}</label>
            <textarea
                value={raw}
                placeholder={placeholder}
                onChange={(e) => {
                    const nextRaw = e.target.value;
                    setRaw(nextRaw);
                    if (!nextRaw.trim()) {
                        setIsValid(true);
                        return;
                    }
                    setIsValid(Boolean(parseJsonObject(nextRaw)));
                }}
                onBlur={() => {
                    if (!raw.trim()) return;
                    const parsed = parseJsonObject(raw);
                    if (!parsed) {
                        setIsValid(false);
                        return;
                    }
                    onCommit(raw);
                    setIsValid(true);
                }}
                style={{
                    ...textAreaStyle,
                    minHeight: '88px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    border: `1px solid ${isValid ? 'rgba(255,255,255,0.14)' : tokens.colors.accentError}`,
                    marginTop: '6px'
                }}
            />
        </div>
    );
});
