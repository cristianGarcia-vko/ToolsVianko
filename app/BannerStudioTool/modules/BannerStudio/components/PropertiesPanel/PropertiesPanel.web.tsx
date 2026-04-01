import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Layout, ChevronDown, ChevronUp, Eye, EyeOff, Lock, Unlock,
    Trash2, Image as ImageIcon, Bold, Italic, Type,
    Square, Paintbrush, Maximize, RotateCw, Palette,
    Type as Typography, Baseline, Wand2,
    FileImage, FilePlus, Scaling,
    Grid3X3, Layers2, Users, Link as LinkIcon
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

/**
 * Pure View for PropertiesPanel.
 * No business logic, only declarative UI and event orchestration.
 * Complies with Vianko Architecture Contract (Zero Logic in View).
 */
export const PropertiesPanel: React.FC<PropertiesPanelProps> = memo(({
    project, activeBanner, selectedLayer,
    onUpdateProject, onUpdateBanner, onUpdateLayer, onDeleteLayer,
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

    return (
        <div style={panelRoot}>
            <div style={tabBar}>
                <TabBtn active={tab === 'props'} onClick={() => setTab('props')} label="PROPIEDADES" icon={<Wand2 size={14}/>} />
                <TabBtn active={tab === 'layers'} onClick={() => setTab('layers')} label="JERARQUÍA" icon={<Layers2 size={14}/>} />
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
                                            <div style={{...iconBox, background: tokens.colors.accentGreen + '20', color: tokens.colors.accentGreen}}>
                                                {selectedLayer.type === 'text' ? <Typography size={18}/> : selectedLayer.type === 'image' ? <ImageIcon size={18}/> : <Square size={18}/>}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <input 
                                                    value={selectedLayer.name} 
                                                    onChange={e => onUpdateLayer(selectedLayer.id, { name: e.target.value })}
                                                    style={{...ghostInput, fontSize: '14px', fontWeight: 900, color: 'white'}}
                                                />
                                                <span style={{ fontSize: '9px', fontWeight: 900, opacity: 0.3, letterSpacing: '1px' }}>ID: {selectedLayer.id.substring(0, 8)}</span>
                                            </div>
                                        </div>
                                        <div style={headerActionGroup}>
                                            <IconAction onClick={() => updateLayerValue({ visible: !selectedLayer.visible })} active={selectedLayer.visible}>
                                                {selectedLayer.visible ? <Eye size={14} /> : <EyeOff size={14}/>}
                                            </IconAction>
                                            <IconAction onClick={() => onDeleteLayer(selectedLayer.id)} color={tokens.colors.accentError}>
                                                <Trash2 size={14}/>
                                            </IconAction>
                                        </div>
                                    </header>
        
                                    <PropSection label="TRANSFORMACIÓN ELITE" icon={<Maximize size={12}/>}>
                                        <div style={row}>
                                            <PropInput label="X" value={readStylePxSafe(selectedLayer.styles.left)} onChange={v => updateLayerStyle({ left: parseInt(v) || 0 })} unit="PX" />
                                            <PropInput label="Y" value={readStylePxSafe(selectedLayer.styles.top)} onChange={v => updateLayerStyle({ top: parseInt(v) || 0 })} unit="PX" />
                                        </div>
                                        <div style={row}>
                                            <PropInput label="ANCHO" value={readStylePxSafe(selectedLayer.styles.width) || 100} onChange={v => updateLayerStyle({ width: parseInt(v) || 1 })} unit="PX" />
                                            <PropInput label="ALTO" value={readStylePxSafe(selectedLayer.styles.height) || 100} onChange={v => updateLayerStyle({ height: parseInt(v) || 1 })} unit="PX" />
                                        </div>
                                        <div style={row}>
                                            <PropInput label="ROTAR" value={parseInt(selectedLayer.styles.transform?.match(/\d+/)?.[0] || '0') || 0} onChange={v => updateLayerStyle({ transform: `rotate(${v}deg)` })} unit="DEG" icon={<RotateCw size={10}/>} />
                                            <PropInput label="Z-INDEX" value={selectedLayer.styles.zIndex ?? 0} onChange={v => updateLayerStyle({ zIndex: parseInt(v) || 0 })} unit="IDX" />
                                        </div>
                                    </PropSection>
        
                                    {selectedLayer.type === 'text' && (
                                        <PropSection label="LITOGRAFÍA Y FUENTES" icon={<Baseline size={12}/>}>
                                            <textarea 
                                                value={selectedLayer.content || ''} 
                                                onChange={e => updateLayerValue({ content: e.target.value })}
                                                placeholder="Contenido del texto..."
                                                style={textAreaStyle}
                                            />
                                            <div style={fontSelectWrapper}>
                                                <label style={miniLabel}>FAMILIA DE FUENTE</label>
                                                <select 
                                                    value={selectedLayer.styles.fontFamily || 'Inter'}
                                                    onChange={e => updateLayerStyle({ fontFamily: e.target.value })}
                                                    style={selectStyle}
                                                >
                                                    <option value="'Inter', sans-serif">Inter (Moderno)</option>
                                                    <option value="'Poppins', sans-serif">Poppins (Geométrico)</option>
                                                    <option value="'Roboto Mono', monospace">Roboto Mono (Tech)</option>
                                                </select>
                                            </div>
                                            <div style={row}>
                                                <PropInput label="TAMAÑO" value={readStylePxSafe(selectedLayer.styles.fontSize) || 16} onChange={v => updateLayerStyle({ fontSize: v + 'px' })} unit="PX" />
                                                <PropInput label="ESPACIO" value={readStylePxSafe(selectedLayer.styles.letterSpacing)} onChange={v => updateLayerStyle({ letterSpacing: v + 'px' })} unit="PX" />
                                            </div>
                                            <div style={row}>
                                                <div style={{flex: 1}}>
                                                    <label style={miniLabel}>COLOR</label>
                                                    <div style={colorPickerContainer}>
                                                        <input type="color" value={selectedLayer.styles.color as string || '#ffffff'} onChange={e => updateLayerStyle({ color: e.target.value })} style={colorInput} />
                                                        <span style={colorValue}>{selectedLayer.styles.color || '#FFFFFF'}</span>
                                                    </div>
                                                </div>
                                                <div style={weightBtnGroup}>
                                                    <GlassMiniBtn onClick={() => updateLayerStyle({ fontWeight: 400 })} active={selectedLayer.styles.fontWeight === 400}><Type size={14} opacity={0.4}/></GlassMiniBtn>
                                                    <GlassMiniBtn onClick={() => updateLayerStyle({ fontWeight: 900 })} active={selectedLayer.styles.fontWeight === 900}><Bold size={14}/></GlassMiniBtn>
                                                    <GlassMiniBtn onClick={() => updateLayerStyle({ fontStyle: 'italic' })} active={selectedLayer.styles.fontStyle === 'italic'}><Italic size={14}/></GlassMiniBtn>
                                                </div>
                                            </div>
                                        </PropSection>
                                    )}
        
                                    {selectedLayer.type === 'image' && (
                                        <PropSection label="RECURSOS MULTIMEDIA" icon={<FileImage size={12}/>}>
                                            <div style={fileDropArea} onClick={() => fileRef.current?.click()}>
                                                <FilePlus size={24} opacity={0.4}/>
                                                <span style={{fontSize: '10px', fontWeight: 900, opacity: 0.5}}>CARGAR IMAGEN</span>
                                                <input type="file" ref={fileRef} accept="image/*" onChange={handleFileChange} style={{display: 'none'}} />
                                            </div>
                                            <div style={externalUrlWrapper}>
                                                <label style={miniLabel}>URL EXTERNA</label>
                                                <input 
                                                    value={selectedLayer.src || ''} 
                                                    onChange={e => updateLayerValue({ src: e.target.value })}
                                                    placeholder="https://..."
                                                    style={inputStyle}
                                                />
                                            </div>
                                        </PropSection>
                                    )}

                                    <PropSection label="ANIMACIÓN" icon={<Wand2 size={12}/>}>
                                        <label style={miniLabel}>PRESET</label>
                                        <select
                                            value={selectedLayer.animation?.name || ''}
                                            onChange={e => updateLayerValue({ animation: { ...(selectedLayer.animation || {}), name: e.target.value } as any })}
                                            style={selectStyle}
                                        >
                                            <option value="">SIN ANIMACIÓN</option>
                                            {['fadeIn', 'zoomIn', 'slideUp', 'float', 'pulse', 'glow'].map(name => (
                                                <option key={name} value={name}>{name}</option>
                                            ))}
                                        </select>
                                    </PropSection>

                                    <PropSection label="EFECTOS CINEMÁTICOS" icon={<Palette size={12}/>}>
                                        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                                            <SlideControl label="OPACIDAD" value={selectedLayer.styles.opacity as number ?? 1} min={0} max={1} step={0.01} onChange={v => updateLayerStyle({ opacity: v })} />
                                            <SlideControl label="DESENFOQUE (BLUR)" value={parseInt(selectedLayer.styles.filter?.match(/\d+/)?.[0] || '0') || 0} min={0} max={20} step={1} onChange={v => updateLayerStyle({ filter: `blur(${v}px)` })} />
                                        </div>
                                    </PropSection>

                                    <PropSection label="ROLES DE VISIBILIDAD" icon={<Users size={12}/>}>
                                        <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                                            {ROLES.map(role => (
                                                <Chip 
                                                    key={role} 
                                                    label={role} 
                                                    active={selectedLayer.visibilityRoles?.includes(role)} 
                                                    onClick={() => {
                                                        const roles = selectedLayer.visibilityRoles || [];
                                                        const next = roles.includes(role) ? roles.filter(r => r !== role) : [...roles, role];
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
                                        <div style={{...iconBox, background: tokens.colors.accentGreen + '20', color: tokens.colors.accentGreen}}>
                                            <Layout size={18}/>
                                        </div>
                                        <h3 style={{ fontSize: '14px', fontWeight: 900, color: 'white' }}>ORQUESTACIÓN BANNER</h3>
                                    </header>
        
                                    <PropSection label="CANVAS DIMENSIONES" icon={<Scaling size={12}/>}>
                                        <div style={row}>
                                            <PropInput label="ANCHO" value={activeBanner.designWidth} onChange={v => onUpdateBanner(activeBanner.id, { designWidth: parseInt(v) || 800 })} unit="PX" />
                                            <PropInput label="ALTO" value={activeBanner.designHeight} onChange={v => onUpdateBanner(activeBanner.id, { designHeight: parseInt(v) || 200 })} unit="PX" />
                                        </div>
                                    </PropSection>
        
                                    <PropSection label="ESTILO DE FONDO" icon={<Palette size={12}/>}>
                                        <div style={bgTypeSelector}>
                                            {['color', 'gradient', 'image', 'pattern'].map(type => (
                                                <GlassMiniBtn key={type} onClick={() => updateBannerBg({ type: type as any })} active={activeBanner.background.type === type}>
                                                    <span style={{fontSize: '9px'}}>{type.toUpperCase()}</span>
                                                </GlassMiniBtn>
                                            ))}
                                        </div>
        
                                        {activeBanner.background.type === 'color' && (
                                            <div style={colorPickerContainer}>
                                                <input type="color" value={activeBanner.background.color || '#000000'} onChange={e => updateBannerBg({ color: e.target.value })} style={colorInput} />
                                                <span style={colorValue}>{activeBanner.background.color || '#000000'}</span>
                                            </div>
                                        )}
        
                                        {activeBanner.background.type === 'image' && (
                                            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                                                <div style={fileDropArea} onClick={() => bgFileRef.current?.click()}>
                                                    <FileImage size={24} opacity={0.4}/>
                                                    <span style={{fontSize: '10px', fontWeight: 900, opacity: 0.5}}>CARGAR FONDO</span>
                                                    <input type="file" ref={bgFileRef} accept="image/*" onChange={handleBgFileChange} style={{display: 'none'}} />
                                                </div>
                                                <input value={activeBanner.background.image || ''} onChange={e => updateBannerBg({ image: e.target.value })} placeholder="URL Fondo..." style={inputStyle} />
                                            </div>
                                        )}

                                        {activeBanner.background.type === 'pattern' && (
                                            <div style={patternConfigStack}>
                                                <div style={patternBtnGroup}>
                                                    {['dots', 'grid', 'waves', 'noise'].map(p => (
                                                        <GlassMiniBtn key={p} onClick={() => updateBannerBg({ pattern: p as any })} active={(activeBanner.background.pattern || 'dots') === p}>
                                                            <span style={{fontSize: '9px'}}>{p.toUpperCase()}</span>
                                                        </GlassMiniBtn>
                                                    ))}
                                                </div>
                                                <SlideControl label="ESCALA" value={activeBanner.background.scale || 18} min={6} max={64} step={1} onChange={v => updateBannerBg({ scale: v })} />
                                                <SlideControl label="OPACIDAD" value={activeBanner.background.opacity ?? 0.15} min={0} max={1} step={0.01} onChange={v => updateBannerBg({ opacity: v })} />
                                            </div>
                                        )}
                                    </PropSection>

                                    <PropSection label="CONFIGURACIÓN GLOBAL" icon={<Grid3X3 size={12}/>}>
                                        <div style={globalSettingsRow}>
                                            <GlassMiniBtn onClick={() => updateSettings({ autoplay: !project.settings.autoplay })} active={project.settings.autoplay}>
                                                <span style={{fontSize: '9px'}}>AUTOPLAY</span>
                                            </GlassMiniBtn>
                                        </div>
                                    </PropSection>
                                </div>
                            )
                        ) : (
                            <div style={hierarchyStack}>
                                <div style={hierarchyHeader}>
                                    <h3 style={{ fontSize: '12px', fontWeight: 900, color: 'white', letterSpacing: '1px' }}>JERARQUÍA</h3>
                                    <div style={hierarchyReorderGroup}>
                                        <IconAction onClick={() => onMoveLayer('up')}><ChevronUp size={14}/></IconAction>
                                        <IconAction onClick={() => onMoveLayer('down')}><ChevronDown size={14}/></IconAction>
                                    </div>
                                </div>
                                <div style={layersListStack}>
                                    {activeBanner.layers.map((layer, index) => (
                                        <div 
                                            key={layer.id} 
                                            onClick={() => onUpdateLayer(layer.id, {})}
                                            style={getLayerRowStyle(selectedLayer?.id === layer.id)}
                                        >
                                            <div style={layerIconBox}>
                                                {layer.type === 'text' ? <Typography size={16}/> : layer.type === 'image' ? <ImageIcon size={16}/> : <Square size={16}/>}
                                            </div>
                                            <div style={layerItemLabelStack}>
                                                <span style={{fontSize: '11px', fontWeight: 900, color: 'white'}}>{layer.name}</span>
                                                <span style={{fontSize: '8px', opacity: 0.4, letterSpacing: '1px'}}>{layer.type.toUpperCase()}</span>
                                            </div>
                                            <div style={layerItemVisibilityGroup}>
                                                <button onClick={(e) => { e.stopPropagation(); onUpdateLayer(layer.id, { visible: !layer.visible }); }} style={miniIconBtn}>
                                                    {layer.visible ? <Eye size={12}/> : <EyeOff size={12} opacity={0.3}/>}
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); onUpdateLayer(layer.id, { locked: !layer.locked }); }} style={miniIconBtn}>
                                                    {layer.locked ? <Lock size={12} color={tokens.colors.accentGreen}/> : <Unlock size={12} opacity={0.3}/>}
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

const PropSection: React.FC<{ label: string; icon: React.ReactNode; children: React.ReactNode }> = memo(({ label, icon, children }) => (
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
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <label style={miniLabel}>{label}</label>
                {icon}
            </div>
            <div style={{ position: 'relative' }}>
                <input 
                    type="number" 
                    value={safeValue} 
                    onChange={e => onChange(e.target.value)} 
                    style={{...inputStyle, paddingRight: unit ? '36px' : '16px'}} 
                />
                {unit && <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '8px', fontWeight: 900, opacity: 0.2 }}>{unit}</span>}
            </div>
        </div>
    );
});

const SlideControl: React.FC<{ label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void }> = memo(({ label, value, min, max, step = 1, onChange }) => {
    const safeValue = (value != null && !Number.isNaN(value)) ? value : min;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <label style={miniLabel}>{label}</label>
                <span style={{fontSize: '9px', fontWeight: 900, opacity: 0.5}}>{safeValue}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={safeValue} onChange={e => onChange(parseFloat(e.target.value))} style={rangeStyle} />
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
