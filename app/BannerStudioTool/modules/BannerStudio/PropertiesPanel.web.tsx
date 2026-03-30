import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Layers, Palette, Layout,
    ChevronDown, ChevronUp, Eye, EyeOff, Lock, Unlock,
    Trash2, Image as ImageIcon, Bold, Italic, Type,
    Square, Paintbrush, Maximize, RotateCw,
    Type as Typography, Baseline, Wand2,
    FileImage, FilePlus, Scaling,
    Grid3X3, Layers2, Users, Link as LinkIcon
} from 'lucide-react';
import { tokens } from '../../../SharedTool/style/tokens.shared.style';
import { StudioProject, BannerDesign, BannerLayer, BannerBackground, ROLES } from './types';
import { usePropertiesPanelLogic, readStylePxSafe } from './PropertiesPanel.web.logics';
import {
    iconBox, row, miniLabel, ghostInput, textAreaStyle, inputStyle,
    selectStyle, fileDropArea, colorPickerContainer, colorInput,
    colorValue, rangeStyle, miniIconBtn,
    panelRoot, tabBar, scrollBody, sectionGap, sectionBox,
    sectionLabelBar, sectionLabelLine, sectionLabelText,
    getTabBtnStyle, tabUnderline, getChipStyle, getGlassMiniBtnStyle,
    getIconActionStyle, getLayerRowStyle, layerIconBox
} from './PropertiesPanel.web.styles';

interface Props {
    project: StudioProject;
    activeBanner: BannerDesign;
    selectedLayer: BannerLayer | null;
    onUpdateProject: (updates: Partial<StudioProject>) => void;
    onUpdateBanner: (id: string, updates: Partial<BannerDesign>) => void;
    onUpdateLayer: (id: string, updates: Partial<BannerLayer>) => void;
    onDeleteLayer: (id: string) => void;
    onAddBanner: () => void;
    onDuplicateBanner: (id: string) => void;
    onDeleteBanner: (id: string) => void;
    onMoveLayer: (direction: 'up' | 'down') => void;
    onRenameLayer: (id: string, name: string) => void;
    onDuplicateLayer: () => void;
    tab: 'props' | 'layers';
    setTab: (t: 'props' | 'layers') => void;
}

export const PropertiesPanel: React.FC<Props> = memo(({
    project, activeBanner, selectedLayer,
    onUpdateProject, onUpdateBanner, onUpdateLayer, onDeleteLayer,
    onAddBanner, onDuplicateBanner, onDeleteBanner, onMoveLayer, onRenameLayer, onDuplicateLayer,
    tab, setTab
}) => {
    const {
        fileRef, bgFileRef,
        updateLayerValue, updateLayerStyle, updateBannerBg,
        handleFileChange, handleBgFileChange
    } = usePropertiesPanelLogic({ selectedLayer, activeBanner, onUpdateLayer, onUpdateBanner });

    const updateSettings = (updates: Partial<StudioProject['settings']>) => {
        onUpdateProject({ settings: { ...project.settings, ...updates } });
    };

    return (
        <div style={panelRoot}>
             {/* --- APP HEADER TAB --- */}
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
                        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                    >
                        {tab === 'props' ? (
                            selectedLayer ? (
                                <div style={sectionGap}>
                                    {/* 1. SECCIÓN: IDENTIDAD Y ESTADO */}
                                    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <IconAction onClick={() => updateLayerValue({ visible: !selectedLayer.visible })} active={selectedLayer.visible}>
                                                {selectedLayer.visible ? <Eye size={14} /> : <EyeOff size={14}/>}
                                            </IconAction>
                                            <IconAction onClick={() => onDeleteLayer(selectedLayer.id)} color={tokens.colors.accentError}>
                                                <Trash2 size={14}/>
                                            </IconAction>
                                        </div>
                                    </header>
        
                                    {/* 2. AREA DE TRANSFORMACIÓN (POSICIÓN Y TAMAÑO) */}
                                    <PropSection label="TRANSFORMACIÓN ELITE" icon={<Maximize size={12}/>}>
                                        <div style={row}>
                                            <PropInput label="X" value={readStylePxSafe(selectedLayer.styles.left)} onChange={v => updateLayerStyle({ left: parseInt(v) })} unit="PX" />
                                            <PropInput label="Y" value={readStylePxSafe(selectedLayer.styles.top)} onChange={v => updateLayerStyle({ top: parseInt(v) })} unit="PX" />
                                        </div>
                                        <div style={row}>
                                            <PropInput label="ANCHO" value={readStylePxSafe(selectedLayer.styles.width) || 100} onChange={v => updateLayerStyle({ width: parseInt(v) })} unit="PX" />
                                            <PropInput label="ALTO" value={readStylePxSafe(selectedLayer.styles.height) || 100} onChange={v => updateLayerStyle({ height: parseInt(v) })} unit="PX" />
                                        </div>
                                        <div style={row}>
                                            <PropInput label="ROTAR" value={parseInt(selectedLayer.styles.transform?.match(/\d+/)?.[0] || '0') || 0} onChange={v => updateLayerStyle({ transform: `rotate(${v}deg)` })} unit="DEG" icon={<RotateCw size={10}/>} />
                                            <PropInput label="Z-INDEX" value={selectedLayer.styles.zIndex ?? 0} onChange={v => updateLayerStyle({ zIndex: parseInt(v) })} unit="IDX" />
                                        </div>
                                    </PropSection>
        
                                    {/* 3. PROPIEDADES ESPECIFICAS POR TIPO */}
                                    {selectedLayer.type === 'text' && (
                                        <PropSection label="LITOGRAFÍA Y FUENTES" icon={<Baseline size={12}/>}>
                                            <textarea 
                                                value={selectedLayer.content || ''} 
                                                onChange={e => updateLayerValue({ content: e.target.value })}
                                                placeholder="Contenido del texto..."
                                                style={textAreaStyle}
                                            />
                                            <div style={{marginTop: '16px'}}>
                                                <label style={miniLabel}>TAG HTML</label>
                                                <select
                                                    value={selectedLayer.tag || 'div'}
                                                    onChange={e => updateLayerValue({ tag: e.target.value })}
                                                    style={selectStyle}
                                                >
                                                    {['div', 'span', 'p', 'h1', 'h2', 'h3', 'button'].map(tag => (
                                                        <option key={tag} value={tag}>{tag}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div style={{marginTop: '16px'}}>
                                                <label style={miniLabel}>FAMILIA DE FUENTE</label>
                                                <select 
                                                    value={selectedLayer.styles.fontFamily || 'Inter'}
                                                    onChange={e => updateLayerStyle({ fontFamily: e.target.value })}
                                                    style={selectStyle}
                                                >
                                                    <option value="'Inter', sans-serif">Inter (Moderno)</option>
                                                    <option value="'Poppins', sans-serif">Poppins (Geométrico)</option>
                                                    <option value="'Roboto Mono', monospace">Roboto Mono (Tech)</option>
                                                    <option value="serif">Times (Clásico)</option>
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
                                                <div style={{flex: 1, display: 'flex', gap: '4px', alignItems: 'flex-end'}}>
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
                                                <span style={{fontSize: '10px', fontWeight: 900, opacity: 0.5}}>SELECCIONAR ARCHIVO</span>
                                                <input type="file" ref={fileRef} accept="image/*" onChange={handleFileChange} style={{display: 'none'}} />
                                            </div>
                                            <div style={{marginTop: '16px'}}>
                                                <label style={miniLabel}>URL EXTERNA</label>
                                                <input 
                                                    value={selectedLayer.src || ''} 
                                                    onChange={e => updateLayerValue({ src: e.target.value })}
                                                    placeholder="https://..."
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div style={{marginTop: '16px'}}>
                                                <label style={miniLabel}>ALT (ACCESIBILIDAD)</label>
                                                <input 
                                                    value={selectedLayer.alt || ''} 
                                                    onChange={e => updateLayerValue({ alt: e.target.value })}
                                                    placeholder="Descripción corta..."
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div style={{marginTop: '16px'}}>
                                                <label style={miniLabel}>AJUSTE DE IMAGEN (FIT)</label>
                                                <div style={{display: 'flex', gap: '8px', marginTop: '4px'}}>
                                                    {['cover', 'contain', 'fill', 'none', 'scale-down'].map(fit => (
                                                        <GlassMiniBtn key={fit} onClick={() => updateLayerValue({ fit: fit as any })} active={selectedLayer.fit === fit}>
                                                            <span style={{fontSize: '9px'}}>{fit.toUpperCase()}</span>
                                                        </GlassMiniBtn>
                                                    ))}
                                                </div>
                                            </div>
                                            <div style={{marginTop: '16px'}}>
                                                <label style={miniLabel}>POSICIÓN (OBJECT-POSITION)</label>
                                                <input 
                                                    value={selectedLayer.position || 'center'} 
                                                    onChange={e => updateLayerValue({ position: e.target.value })}
                                                    placeholder="center / top / bottom / 20% 50% ..."
                                                    style={inputStyle}
                                                />
                                            </div>
                                        </PropSection>
                                    )}

                                    {selectedLayer.type === 'shape' && (
                                        <PropSection label="FORMA" icon={<Square size={12}/>}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                <div>
                                                    <label style={miniLabel}>COLOR</label>
                                                    <div style={colorPickerContainer}>
                                                        <input
                                                            type="color"
                                                            value={(selectedLayer.styles.backgroundColor as string) || tokens.colors.accentPurple}
                                                            onChange={e => updateLayerStyle({ backgroundColor: e.target.value })}
                                                            style={colorInput}
                                                        />
                                                        <span style={colorValue}>{(selectedLayer.styles.backgroundColor as string) || tokens.colors.accentPurple}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label style={miniLabel}>BORDE (CSS)</label>
                                                    <input
                                                        value={selectedLayer.styles.border || ''}
                                                        onChange={e => updateLayerStyle({ border: e.target.value })}
                                                        placeholder="1px solid rgba(255,255,255,0.2)"
                                                        style={inputStyle}
                                                    />
                                                </div>
                                            </div>
                                        </PropSection>
                                    )}

                                    {(selectedLayer.type === 'particles' || selectedLayer.type === 'canvas') && (
                                        <PropSection label="EFECTO" icon={<Paintbrush size={12}/>}>
                                            <label style={miniLabel}>TIPO</label>
                                            <select
                                                value={selectedLayer.effect || (selectedLayer.type === 'canvas' ? 'nodes' : 'rain')}
                                                onChange={e => updateLayerValue({ effect: e.target.value })}
                                                style={selectStyle}
                                            >
                                                {['nodes', 'particles', 'hearts', 'rain', 'snow', 'fire', 'stars'].map(effect => (
                                                    <option key={effect} value={effect}>{effect}</option>
                                                ))}
                                            </select>

                                            {selectedLayer.type === 'canvas' && (
                                                <div style={{marginTop: '16px'}}>
                                                    <SlideControl
                                                        label="INTENSIDAD"
                                                        value={selectedLayer.intensity ?? 0.5}
                                                        min={0}
                                                        max={1}
                                                        step={0.01}
                                                        onChange={v => updateLayerValue({ intensity: v })}
                                                    />
                                                </div>
                                            )}

                                            <div style={{marginTop: '16px'}}>
                                                <SlideControl
                                                    label="DENSIDAD"
                                                    value={selectedLayer.density ?? 0.5}
                                                    min={0}
                                                    max={1}
                                                    step={0.01}
                                                    onChange={v => updateLayerValue({ density: v })}
                                                />
                                            </div>

                                            <div style={{marginTop: '16px'}}>
                                                <label style={miniLabel}>COLOR</label>
                                                <div style={colorPickerContainer}>
                                                    <input type="color" value={selectedLayer.color || '#ffffff'} onChange={e => updateLayerValue({ color: e.target.value })} style={colorInput} />
                                                    <span style={colorValue}>{selectedLayer.color || '#ffffff'}</span>
                                                </div>
                                            </div>
                                        </PropSection>
                                    )}

                                    {selectedLayer.type === 'animated' && (
                                        <PropSection label="ANIMATED (ASSET)" icon={<Wand2 size={12}/>}>
                                            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                                                <div>
                                                    <label style={miniLabel}>ASSET TYPE</label>
                                                    <select
                                                        value={selectedLayer.assetType || (selectedLayer.src ? 'image' : 'text')}
                                                        onChange={e => updateLayerValue({ assetType: e.target.value as any })}
                                                        style={selectStyle}
                                                    >
                                                        {['image', 'text', 'tag'].map(t => (
                                                            <option key={t} value={t}>{t}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {(selectedLayer.assetType || (selectedLayer.src ? 'image' : 'text')) === 'image' ? (
                                                    <>
                                                        <div style={fileDropArea} onClick={() => fileRef.current?.click()}>
                                                            <FilePlus size={24} opacity={0.4}/>
                                                            <span style={{fontSize: '10px', fontWeight: 900, opacity: 0.5}}>SELECCIONAR ARCHIVO</span>
                                                            <input type="file" ref={fileRef} accept="image/*" onChange={handleFileChange} style={{display: 'none'}} />
                                                        </div>
                                                        <div>
                                                            <label style={miniLabel}>URL EXTERNA</label>
                                                            <input
                                                                value={selectedLayer.src || ''}
                                                                onChange={e => updateLayerValue({ src: e.target.value })}
                                                                placeholder="https://..."
                                                                style={inputStyle}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label style={miniLabel}>FIT</label>
                                                            <div style={{display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap'}}>
                                                                {['cover', 'contain', 'fill', 'none', 'scale-down'].map(fit => (
                                                                    <GlassMiniBtn key={fit} onClick={() => updateLayerValue({ fit: fit as any })} active={selectedLayer.fit === fit}>
                                                                        <span style={{fontSize: '9px'}}>{fit.toUpperCase()}</span>
                                                                    </GlassMiniBtn>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label style={miniLabel}>POSICIÓN</label>
                                                            <input
                                                                value={selectedLayer.position || 'center'}
                                                                onChange={e => updateLayerValue({ position: e.target.value })}
                                                                placeholder="center / top / bottom / 20% 50% ..."
                                                                style={inputStyle}
                                                            />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div>
                                                            <label style={miniLabel}>TAG</label>
                                                            <select
                                                                value={selectedLayer.tag || (selectedLayer.assetType === 'text' ? 'span' : 'div')}
                                                                onChange={e => updateLayerValue({ tag: e.target.value })}
                                                                style={selectStyle}
                                                            >
                                                                {['div', 'span', 'p', 'h1', 'h2', 'h3', 'button'].map(tag => (
                                                                    <option key={tag} value={tag}>{tag}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <textarea
                                                            value={selectedLayer.content || ''}
                                                            onChange={e => updateLayerValue({ content: e.target.value })}
                                                            placeholder="Contenido..."
                                                            style={textAreaStyle}
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </PropSection>
                                    )}

                                    {selectedLayer.type === 'lottie' && (
                                        <PropSection label="LOTTIE" icon={<FileImage size={12}/>}>
                                            <label style={miniLabel}>SOURCE (URL / JSON)</label>
                                            <input
                                                value={selectedLayer.source || ''}
                                                onChange={e => updateLayerValue({ source: e.target.value })}
                                                placeholder="https://... o { ... }"
                                                style={inputStyle}
                                            />
                                            <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px'}}>
                                                <GlassMiniBtn onClick={() => updateLayerValue({ autoPlay: !(selectedLayer.autoPlay ?? true) })} active={selectedLayer.autoPlay ?? true}>
                                                    <span style={{fontSize: '9px'}}>AUTOPLAY</span>
                                                </GlassMiniBtn>
                                                <GlassMiniBtn onClick={() => updateLayerValue({ loop: !(selectedLayer.loop ?? true) })} active={selectedLayer.loop ?? true}>
                                                    <span style={{fontSize: '9px'}}>LOOP</span>
                                                </GlassMiniBtn>
                                            </div>
                                            <div style={{marginTop: '16px'}}>
                                                <SlideControl label="SPEED" value={selectedLayer.speed ?? 1} min={0.1} max={4} step={0.1} onChange={v => updateLayerValue({ speed: v })} />
                                            </div>
                                        </PropSection>
                                    )}

                                    <PropSection label="ACCIONES" icon={<LinkIcon size={12}/>}>
                                        <label style={miniLabel}>ACTION URL</label>
                                        <input
                                            value={selectedLayer.actionUrl || ''}
                                            onChange={e => updateLayerValue({ actionUrl: e.target.value })}
                                            placeholder="/dashboard"
                                            style={inputStyle}
                                        />
                                    </PropSection>

                                    <PropSection label="ANIMACIÓN" icon={<Wand2 size={12}/>}>
                                        <label style={miniLabel}>PRESET</label>
                                        <select
                                            value={selectedLayer.animation?.name || ''}
                                            onChange={e => {
                                                const name = e.target.value;
                                                if (!name) {
                                                    updateLayerValue({ animation: undefined as any });
                                                    return;
                                                }
                                                const current = selectedLayer.animation || { name, duration: '1s', delay: '0s', timingFunction: 'ease', iterationCount: '1' as any };
                                                updateLayerValue({ animation: { ...current, name } as any });
                                            }}
                                            style={selectStyle}
                                        >
                                            <option value="">SIN ANIMACIÓN</option>
                                            {[
                                                'fadeIn', 'fadeOut',
                                                'zoomIn', 'zoomOut',
                                                'slideLeft', 'slideRight', 'slideUp', 'slideDown',
                                                'float', 'pulse', 'bounce', 'spin', 'tilt', 'glow',
                                                'bounce-in'
                                            ].map(name => (
                                                <option key={name} value={name}>{name}</option>
                                            ))}
                                        </select>

                                        {selectedLayer.animation?.name ? (
                                            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                <div style={row}>
                                                    <div style={{ flex: 1 }}>
                                                        <label style={miniLabel}>DURACIÓN</label>
                                                        <input
                                                            value={selectedLayer.animation.duration || '1s'}
                                                            onChange={e => updateLayerValue({ animation: { ...selectedLayer.animation!, duration: e.target.value } as any })}
                                                            placeholder="1s"
                                                            style={inputStyle}
                                                        />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <label style={miniLabel}>DELAY</label>
                                                        <input
                                                            value={selectedLayer.animation.delay || '0s'}
                                                            onChange={e => updateLayerValue({ animation: { ...selectedLayer.animation!, delay: e.target.value } as any })}
                                                            placeholder="0s"
                                                            style={inputStyle}
                                                        />
                                                    </div>
                                                </div>
                                                <div style={row}>
                                                    <div style={{ flex: 1 }}>
                                                        <label style={miniLabel}>TIMING</label>
                                                        <input
                                                            value={selectedLayer.animation.timingFunction || 'ease'}
                                                            onChange={e => updateLayerValue({ animation: { ...selectedLayer.animation!, timingFunction: e.target.value } as any })}
                                                            placeholder="ease"
                                                            style={inputStyle}
                                                        />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <label style={miniLabel}>ITERACIONES</label>
                                                        <input
                                                            value={String(selectedLayer.animation.iterationCount ?? 1)}
                                                            onChange={e => updateLayerValue({ animation: { ...selectedLayer.animation!, iterationCount: e.target.value.trim() || '1' } as any })}
                                                            placeholder="1 / infinite"
                                                            style={inputStyle}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null}
                                    </PropSection>

                                    {/* 4. ESTILO VISUAL (SHADOW, BLUR, OPACITY) */}
                                    <PropSection label="EFECTOS CINEMÁTICOS" icon={<Palette size={12}/>}>
                                        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                                            <SlideControl label="OPACIDAD" value={selectedLayer.styles.opacity ?? 1} min={0} max={1} step={0.01} onChange={v => updateLayerStyle({ opacity: v })} />
                                            <SlideControl label="DESENFOQUE (BLUR)" value={parseInt(selectedLayer.styles.filter?.match(/\d+/)?.[0] || '0') || 0} min={0} max={40} step={1} onChange={v => updateLayerStyle({ filter: `blur(${v}px)` })} />
                                            <SlideControl label="RADIO DE BORDE" value={readStylePxSafe(selectedLayer.styles.borderRadius)} min={0} max={200} step={1} onChange={v => updateLayerStyle({ borderRadius: v + 'px' })} />
                                        </div>
                                    </PropSection>
        
                                    {/* 5. SEGMENTACIÓN (ROLES) */}
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
                                     {/* CONFIGURACIÓN DEL BANNER COMPLETO */}
                                    <header style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                                        <div style={{display: 'flex', gap: '6px', marginBottom: '20px'}}>
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
        
                                        {activeBanner.background.type === 'gradient' && (
                                            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                                                <div style={row}>
                                                    <div style={{flex: 1}}>
                                                        <label style={miniLabel}>COLOR 1</label>
                                                        <input type="color" value={activeBanner.background.gradient?.c1 || '#ff0000'} onChange={e => updateBannerBg({ gradient: { ...activeBanner.background.gradient!, c1: e.target.value } })} style={colorInput} />
                                                    </div>
                                                    <div style={{flex: 1}}>
                                                        <label style={miniLabel}>COLOR 2</label>
                                                        <input type="color" value={activeBanner.background.gradient?.c2 || '#0000ff'} onChange={e => updateBannerBg({ gradient: { ...activeBanner.background.gradient!, c2: e.target.value } })} style={colorInput} />
                                                    </div>
                                                </div>
                                                <SlideControl label="ÁNGULO" value={activeBanner.background.gradient?.angle || 0} min={0} max={360} onChange={v => updateBannerBg({ gradient: { ...activeBanner.background.gradient!, angle: v } })} />
                                            </div>
                                        )}
        
                                        {activeBanner.background.type === 'image' && (
                                            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                                                <div style={fileDropArea} onClick={() => bgFileRef.current?.click()}>
                                                    <FileImage size={24} opacity={0.4}/>
                                                    <span style={{fontSize: '10px', fontWeight: 900, opacity: 0.5}}>CARGAR IMAGEN FONDO</span>
                                                    <input type="file" ref={bgFileRef} accept="image/*" onChange={handleBgFileChange} style={{display: 'none'}} />
                                                </div>
                                                <input value={activeBanner.background.image || ''} onChange={e => updateBannerBg({ image: e.target.value })} placeholder="URL Fondo..." style={inputStyle} />
                                                <div style={{marginTop: '8px'}}>
                                                    <label style={miniLabel}>AJUSTE (FIT)</label>
                                                    <div style={{display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap'}}>
                                                        {['cover', 'contain', 'fill', 'none', 'scale-down'].map(fit => (
                                                            <GlassMiniBtn key={fit} onClick={() => updateBannerBg({ fit: fit as any })} active={activeBanner.background.fit === fit}>
                                                                <span style={{fontSize: '9px'}}>{fit.toUpperCase()}</span>
                                                            </GlassMiniBtn>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div style={{marginTop: '8px'}}>
                                                    <label style={miniLabel}>POSICIÓN</label>
                                                    <input
                                                        value={activeBanner.background.position || 'center'}
                                                        onChange={e => updateBannerBg({ position: e.target.value })}
                                                        placeholder="center / top / bottom / 20% 50% ..."
                                                        style={inputStyle}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {activeBanner.background.type === 'pattern' && (
                                            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                                                <div style={colorPickerContainer}>
                                                    <input type="color" value={activeBanner.background.color || '#0b1220'} onChange={e => updateBannerBg({ color: e.target.value })} style={colorInput} />
                                                    <span style={colorValue}>{activeBanner.background.color || '#0b1220'}</span>
                                                </div>
                                                <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                                                    {(['dots', 'grid', 'waves', 'noise'] as const).map(p => (
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

                                    <PropSection label="ACCIÓN DEL BANNER" icon={<LinkIcon size={12}/>}>
                                        <label style={miniLabel}>ACTION URL</label>
                                        <input
                                            value={activeBanner.actionUrl || ''}
                                            onChange={e => onUpdateBanner(activeBanner.id, { actionUrl: e.target.value })}
                                            placeholder="/dashboard"
                                            style={inputStyle}
                                        />
                                    </PropSection>

                                    <PropSection label="ESTILO WRAPPER" icon={<Palette size={12}/>}>
                                        <SlideControl
                                            label="BORDER RADIUS"
                                            value={readStylePxSafe(activeBanner.styles?.borderRadius)}
                                            min={0}
                                            max={80}
                                            step={1}
                                            onChange={v => onUpdateBanner(activeBanner.id, { styles: { ...(activeBanner.styles || {}), borderRadius: v + 'px' } })}
                                        />
                                    </PropSection>

                                    <PropSection label="ROTACIÓN Y TRANSICIÓN" icon={<Layers size={12}/>}>
                                        <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                                            <GlassMiniBtn onClick={() => updateSettings({ mode: 'manual' })} active={(project.settings.mode || 'auto') === 'manual'}>
                                                <span style={{fontSize: '9px'}}>MANUAL</span>
                                            </GlassMiniBtn>
                                            <GlassMiniBtn onClick={() => updateSettings({ mode: 'auto' })} active={(project.settings.mode || 'auto') === 'auto'}>
                                                <span style={{fontSize: '9px'}}>AUTO</span>
                                            </GlassMiniBtn>
                                            <GlassMiniBtn onClick={() => updateSettings({ autoplay: !project.settings.autoplay })} active={project.settings.autoplay}>
                                                <span style={{fontSize: '9px'}}>AUTOPLAY</span>
                                            </GlassMiniBtn>
                                        </div>

                                        <div style={{marginTop: '16px'}}>
                                            <PropInput
                                                label="INTERVALO"
                                                value={project.settings.intervalMs ?? (project.settings.transitionTime * 1000)}
                                                onChange={v => {
                                                    const ms = Math.max(1000, parseInt(v) || 6000);
                                                    updateSettings({ intervalMs: ms, transitionTime: ms / 1000 });
                                                }}
                                                unit="MS"
                                            />
                                        </div>

                                        <div style={{marginTop: '16px'}}>
                                            <label style={miniLabel}>TRANSICIÓN</label>
                                            <select
                                                value={project.settings.transition || 'fade'}
                                                onChange={e => updateSettings({ transition: e.target.value as any })}
                                                style={selectStyle}
                                            >
                                                {['fade', 'slide', 'zoom', 'none'].map(t => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {project.settings.autoplay && project.banners.length < 2 ? (
                                            <span style={{fontSize: '9px', opacity: 0.55}}>
                                                Autoplay requiere 2+ banners (se exporta mode=manual si no se cumple).
                                            </span>
                                        ) : null}
                                    </PropSection>
        
                                    <PropSection label="SEGMENTACIÓN GLOBAL" icon={<Grid3X3 size={12}/>}>
                                        <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                                            {ROLES.map(role => (
                                                <Chip 
                                                    key={role} 
                                                    label={role} 
                                                    active={activeBanner.visibilityRoles?.includes(role)} 
                                                    onClick={() => {
                                                        const roles = activeBanner.visibilityRoles || [];
                                                        const next = roles.includes(role) ? roles.filter(r => r !== role) : [...roles, role];
                                                        onUpdateBanner(activeBanner.id, { visibilityRoles: next });
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </PropSection>
                                </div>
                            )
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <h3 style={{ fontSize: '12px', fontWeight: 900, color: 'white', letterSpacing: '1px' }}>JERARQUÍA DINÁMICA</h3>
                                    <div style={{display: 'flex', gap: '4px'}}>
                                        <IconAction onClick={() => onMoveLayer('up')}><ChevronUp size={14}/></IconAction>
                                        <IconAction onClick={() => onMoveLayer('down')}><ChevronDown size={14}/></IconAction>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {activeBanner.layers.map((layer, index) => (
                                        <div 
                                            key={layer.id} 
                                            onClick={() => onUpdateLayer(layer.id, {})}
                                            style={getLayerRowStyle(selectedLayer?.id === layer.id)}
                                        >
                                            <div style={layerIconBox}>
                                                {layer.type === 'text' ? <Typography size={16}/> : layer.type === 'image' ? <ImageIcon size={16}/> : <Square size={16}/>}
                                            </div>
                                            <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                                                <span style={{fontSize: '11px', fontWeight: 900, color: 'white'}}>{layer.name}</span>
                                                <span style={{fontSize: '8px', opacity: 0.4, letterSpacing: '1px'}}>{layer.type.toUpperCase()} • Z:{index}</span>
                                            </div>
                                            <div style={{display: 'flex', gap: '8px'}}>
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

/* --- SUBCOMPONENTS --- */

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
    // Guard: ensure value is never NaN for the input
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

const GlassMiniBtn: React.FC<{ children: React.ReactNode; onClick: () => void; active?: boolean }> = memo(({ children, onClick, active }) => (
    <button onClick={onClick} style={getGlassMiniBtnStyle(active)}>
        {children}
    </button>
));

const TabBtnWrapper = TabBtn;
const PropSectionWrapper = PropSection;
const PropInputWrapper = PropInput;
const SlideControlWrapper = SlideControl;
const ChipWrapper = Chip;
const GlassMiniBtnWrapper = GlassMiniBtn;

// Re-map internal usage to wrappers if needed, but here they are named the same anyway.


const IconAction: React.FC<{ children: React.ReactNode; onClick: () => void; active?: boolean; color?: string }> = ({ children, onClick, active, color }) => (
    <button onClick={onClick} style={getIconActionStyle(active, color)}>
        {children}
    </button>
);
