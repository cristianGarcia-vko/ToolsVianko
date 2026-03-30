import React, { useState, useCallback, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import {
    Plus, MousePointer2, Type, Image as ImageIcon, Star,
    Layers, Layout, Search, Filter,
    Download, Play, Zap, Monitor, Save, Undo, Redo,
    Maximize2, Move, Paintbrush, MonitorPlay, Film,
    ChevronRight, Activity, PlayCircle,
    Trash2, Square, Circle, PenTool
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { tokens } from '../../../SharedTool/style/tokens.shared.style';
import { studioStyles } from './BannerStudio.web.styles';
import { useBannerStudioLogic } from './BannerStudio.web.logics';
import { PropertiesPanel } from './PropertiesPanel.web';
import { DrawingStudioAtom } from '../../atoms/DrawingStudio/DrawingStudio.web';
import { ExportModal } from './ExportModal.web';
import { LayerItemRenderer } from './LayerItemRenderer.web';
import { DrawingToolsSidebar, DrawingCanvasLayer } from '../../atoms/DrawingStudio/DrawingStudio.web';
import { useDrawingStudioLogic } from '../../atoms/DrawingStudio/DrawingStudio.web.logics';
import { GlassCardAtom, GlassIconButtonAtom, GlassButtonAtom } from '../../../SharedTool/components/atoms/GlassAtoms';

const buildPatternBackgroundCss = (bg: any) => {
    const pattern = String(bg?.pattern || 'dots').trim().toLowerCase();
    const scale = Math.max(4, Number(bg?.scale) || 18);
    const opacity = Math.min(1, Math.max(0, Number(bg?.opacity ?? 0.15)));
    const base = String(bg?.color || '#0b1220').trim();
    const ink = `rgba(255,255,255,${opacity})`;

    if (pattern === 'grid') {
        return `linear-gradient(to right, ${ink} 1px, transparent 1px) 0 0 / ${scale}px ${scale}px repeat, linear-gradient(to bottom, ${ink} 1px, transparent 1px) 0 0 / ${scale}px ${scale}px repeat, ${base}`;
    }
    if (pattern === 'waves') {
        return `repeating-radial-gradient(circle at 20% 20%, ${ink} 0 1px, transparent 1px ${scale}px), ${base}`;
    }
    if (pattern === 'noise') {
        return `repeating-linear-gradient(45deg, ${ink} 0 1px, transparent 1px 3px), ${base}`;
    }
    return `radial-gradient(circle, ${ink} 1px, transparent 1px) 0 0 / ${scale}px ${scale}px repeat, ${base}`;
};

export const BannerStudio: React.FC = () => {
    const {
        project, activeBanner, selectedLayer,
        selectedLayerIds, toggleSelectedLayer,
        zoom, setZoom,
        pan, setPan, resetView,
        activeTab, setActiveTab,
        layerSearch, setLayerSearch,
        showGrid, setShowGrid,
        isLoading, isDrawingMode, setIsDrawingMode,
        isPreviewMode, setIsPreviewMode,
        isSpacePressed,
        
        // Actions
        updateProject, updateBanner, updateLayer, deleteLayer,
        addBanner, duplicateBanner, deleteBanner,
        addLayer, duplicateLayer, moveLayer, renameLayer, reorderLayer,
        handleApplyDrawing, handleSave, undo, redo,
        canUndo, canRedo
    } = useBannerStudioLogic();

    const drawingLogic = useDrawingStudioLogic({
        width: activeBanner?.designWidth || 800,
        height: activeBanner?.designHeight || 200,
        onApply: (dataUrl: string) => {
            handleApplyDrawing(dataUrl);
            setIsDrawingMode(false);
        },
        onCancel: () => setIsDrawingMode(false)
    });

    const canvasAreaRef = React.useRef<HTMLDivElement>(null);
    const setZoomRef = React.useRef(setZoom);
    const setPanRef = React.useRef(setPan);

    React.useEffect(() => {
        setZoomRef.current = setZoom;
        setPanRef.current = setPan;
    }, [setZoom, setPan]);

    React.useEffect(() => {
        const area = canvasAreaRef.current;
        if (!area) return;

        const handleWheelManual = (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                setZoomRef.current(z => Math.max(0.1, Math.min(4, z + delta)));
            } else {
                e.preventDefault();
                setPanRef.current(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
            }
        };

        area.addEventListener('wheel', handleWheelManual, { passive: false });
        return () => area.removeEventListener('wheel', handleWheelManual);
    }, []);

    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    if (isLoading) {
        return (
            <div style={studioStyles.loadingOverlay}>
                <div style={studioStyles.loadingIcon}>
                    <Zap color={tokens.colors.accentGreen} fill={tokens.colors.accentGreen} size={32} />
                </div>
                <span style={studioStyles.loadingText}>SINCRONIZANDO ECOSISTEMA ELITE...</span>
            </div>
        );
    }

    return (
        <div style={studioStyles.container}>
            {/* --- HEADER --- */}
            <header style={studioStyles.header}>
                <div style={studioStyles.logoContainer}>
                    <div style={studioStyles.logoIcon}>V</div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                        <span style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '2px' }}>STUDIO</span>
                        <span style={{ fontSize: '8px', color: tokens.colors.accentGreen, opacity: 0.6, fontWeight: 900, letterSpacing: '4px' }}>AUTOMATION</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={studioStyles.historyControls}>
                        <button onClick={undo} disabled={!canUndo} style={{ ...studioStyles.miniBtn, opacity: canUndo ? 1 : 0.2, border: 'none', background: 'transparent' }}><Undo size={14} /></button>
                        <button onClick={redo} disabled={!canRedo} style={{ ...studioStyles.miniBtn, opacity: canRedo ? 1 : 0.2, border: 'none', background: 'transparent' }}><Redo size={14} /></button>
                    </div>

                    <GlassButtonAtom onClick={() => setIsExportModalOpen(true)} color={tokens.colors.accentGreen} active style={{ height: '32px', fontSize: '10px' }}>
                        EXPORTAR
                    </GlassButtonAtom>
                </div>
            </header>

            {/* --- MAIN LAYOUT --- */}
            <main style={studioStyles.mainLayout}>
                {/* 1. Sidebar Tools */}
                {/* 1. Sidebar Tools */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <motion.aside 
                        initial={{ x: -60, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={studioStyles.sidebar}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                            <GlassIconButtonAtom icon={<MousePointer2 size={18} />} active={!isSpacePressed && !isDrawingMode} onClick={() => setIsDrawingMode(false)} color={tokens.colors.accentGreen} tooltip="Seleccionar" />
                            <GlassIconButtonAtom icon={<Move size={18} />} active={isSpacePressed} onClick={() => {}} tooltip="Panear (Espacio)" />
                        </div>

                        <div style={{ width: '24px', height: '1px', background: 'rgba(255,255,255,0.05)', margin: '4px 0' }} />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                            <GlassIconButtonAtom icon={<Type size={18} />} onClick={() => addLayer('text')} tooltip="Texto" />
                            <GlassIconButtonAtom icon={<ImageIcon size={18} />} onClick={() => addLayer('image')} tooltip="Imagen" />
                            <GlassIconButtonAtom icon={<Square size={18} />} onClick={() => addLayer('shape')} tooltip="Formas" />
                            <GlassIconButtonAtom icon={<Star size={18} />} onClick={() => addLayer('particles')} tooltip="Partículas" />
                            <GlassIconButtonAtom icon={<Activity size={18} />} onClick={() => addLayer('canvas')} tooltip="Canvas FX" />
                            <GlassIconButtonAtom icon={<Film size={18} />} onClick={() => addLayer('animated')} tooltip="Animated" />
                            <GlassIconButtonAtom icon={<MonitorPlay size={18} />} onClick={() => addLayer('lottie')} tooltip="Lottie" />
                            <GlassIconButtonAtom icon={<Paintbrush size={18} />} active={isDrawingMode} onClick={() => setIsDrawingMode(true)} tooltip="Dibujo" />
                        </div>

                        <div style={{ flex: 1 }} />
                        <GlassIconButtonAtom icon={<Save size={18} />} onClick={handleSave} tooltip="Guardar Proyecto" />
                    </motion.aside>

                    {isDrawingMode && (
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            style={studioStyles.drawingSidebar}
                        >
                            <DrawingToolsSidebar logic={drawingLogic} onCancel={() => setIsDrawingMode(false)} />
                        </motion.div>
                    )}
                </div>

                {/* 2. Canvas Area Container */}
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: 'spring', damping: 30, stiffness: 100 }}
                    style={studioStyles.canvasAreaContainer}
                >
                    <div 
                        ref={canvasAreaRef}
                        style={{
                            ...studioStyles.canvasArea,
                            cursor: isSpacePressed ? 'grab' : 'default',
                            touchAction: 'none', // Prevent browser touch gestures
                        }}
                        onPointerDown={useCallback((e: React.PointerEvent) => {
                            if (isSpacePressed || e.button === 1) { // Space or Middle mouse
                                const target = e.currentTarget as HTMLElement;
                                (target as any).setPointerCapture(e.pointerId);
                                target.setAttribute('data-panning', 'true');
                                target.style.cursor = 'grabbing';
                            }
                        }, [isSpacePressed])}
                        onPointerMove={useCallback((e: React.PointerEvent) => {
                            if (e.currentTarget.getAttribute('data-panning') === 'true') {
                                setPan(p => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
                            }
                        }, [setPan])}
                        onPointerUp={useCallback((e: React.PointerEvent) => {
                            const target = e.currentTarget as HTMLElement;
                            target.setAttribute('data-panning', 'false');
                            target.style.cursor = isSpacePressed ? 'grab' : 'default';
                        }, [isSpacePressed])}
                    >
                        {/* THE RENDERER */}
                        <div id="vianko-canvas-root" style={{
                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                            transformOrigin: 'center center',
                            transition: 'transform 0.1s cubic-bezier(0.16, 1, 0.3, 1)',
                            position: 'relative',
                            width: activeBanner?.designWidth || 800,
                            height: activeBanner?.designHeight || 200,
                            ...(activeBanner?.background.type === 'color'
                                ? { backgroundColor: activeBanner?.background.color || '#fff' }
                                : activeBanner?.background.type === 'gradient'
                                    ? { backgroundImage: `linear-gradient(${activeBanner?.background.gradient?.angle + 'deg' || '90deg'}, ${activeBanner?.background.gradient?.c1}, ${activeBanner?.background.gradient?.c2})` }
                                    : activeBanner?.background.type === 'image'
                                        ? { backgroundImage: `url(${activeBanner?.background.image})`, backgroundSize: activeBanner?.background.fit || 'cover', backgroundPosition: activeBanner?.background.position || 'center', backgroundRepeat: 'no-repeat' }
                                        : activeBanner?.background.type === 'pattern'
                                            ? { background: buildPatternBackgroundCss(activeBanner?.background) }
                                        : { backgroundColor: '#fff' }),
                            boxShadow: '0 80px 160px rgba(0,0,0,0.8)',
                            overflow: 'hidden'
                        }}>
                            {activeBanner?.layers.filter(l => l.visible).map(layer => (
                                <LayerItemRenderer
                                    key={layer.id}
                                    layer={layer}
                                    isSelected={selectedLayerIds.includes(layer.id)}
                                    onSelect={toggleSelectedLayer}
                                    onUpdate={updateLayer}
                                    onDelete={deleteLayer}
                                    onDuplicate={duplicateLayer}
                                    onReorder={reorderLayer}
                                    zoom={zoom}
                                />
                            ))}

                            {/* DRAWING PREVIEW OVERLAY */}
                            {isDrawingMode && (
                                <DrawingCanvasLayer 
                                    logic={drawingLogic} 
                                    width={activeBanner?.designWidth || 800} 
                                    height={activeBanner?.designHeight || 200} 
                                />
                            )}
                        </div>

                        <div style={studioStyles.zoomControls}>
                            <button onClick={resetView} style={{...studioStyles.iconBtn, width: 'auto', padding: '0 12px', fontSize: '10px', fontWeight: 900}}>RESET</button>
                            <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} style={studioStyles.iconBtn}>-</button>
                            <span style={{ fontSize: '11px', fontWeight: 900, color: tokens.colors.accentGreen }}>{Math.round(zoom * 100)}%</span>
                            <button onClick={() => setZoom(z => Math.min(4, z + 0.1))} style={studioStyles.iconBtn}>+</button>
                            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />
                            <button onClick={() => setShowGrid(!showGrid)} style={{ ...studioStyles.iconBtn, color: showGrid ? tokens.colors.accentGreen : 'rgba(255,255,255,0.2)' }}><Layout size={18} /></button>
                        </div>
                    </div>

                    <footer style={studioStyles.bottomSelector}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '12px' }}>
                            <Monitor size={14} opacity={0.4} />
                            <span style={{ fontSize: '9px', fontWeight: 900, opacity: 0.4, letterSpacing: '1px' }}>FORMATOS</span>
                        </div>
                        <div 
                            style={{ display: 'flex', gap: '12px', overflowX: 'auto', flex: 1, padding: '4px' }}
                            className="no-scrollbar"
                            onWheel={(e) => {
                                e.currentTarget.scrollLeft += e.deltaY;
                            }}
                        >
                            {project.banners.map(b => (
                                <motion.div
                                    key={b.id}
                                    layout
                                    onClick={() => updateProject({ activeBannerId: b.id })}
                                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.08)' }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        padding: '8px 20px', borderRadius: '14px',
                                        background: project.activeBannerId === b.id ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.2)',
                                        border: `1px solid ${project.activeBannerId === b.id ? `${tokens.colors.accentGreen}80` : 'rgba(255,255,255,0.05)'}`,
                                        cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center', transition: 'border 0.3s'
                                    }}
                                >
                                    <div style={{ width: '6px', height: '6px', borderRadius: '3px', background: project.activeBannerId === b.id ? tokens.colors.accentGreen : 'rgba(255,255,255,0.2)' }} />
                                    <span style={{ fontSize: '11px', fontWeight: 900, color: project.activeBannerId === b.id ? 'white' : 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>{b.name}</span>
                                </motion.div>
                            ))}
                        </div>
                        <GlassIconButtonAtom icon={<Plus size={18} />} onClick={addBanner} color={tokens.colors.accentGreen} />
                    </footer>
                </motion.div>

                {/* 3. Properties Panel */}
                <motion.aside 
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    style={studioStyles.propertiesWrapper}
                >
                    <GlassCardAtom intensity="strong" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <PropertiesPanel
                            project={project}
                            activeBanner={activeBanner}
                            selectedLayer={selectedLayer}
                            onUpdateProject={updateProject}
                            onUpdateBanner={updateBanner}
                            onUpdateLayer={updateLayer}
                            onDeleteLayer={deleteLayer}
                            onAddBanner={addBanner}
                            onDuplicateBanner={duplicateBanner}
                            onDeleteBanner={deleteBanner}
                            onMoveLayer={moveLayer}
                            onRenameLayer={renameLayer}
                            onDuplicateLayer={duplicateLayer}
                            tab={activeTab}
                            setTab={setActiveTab}
                        />
                    </GlassCardAtom>
                </motion.aside>
            </main>


            {isExportModalOpen && (
                <ExportModal
                    project={project}
                    onClose={() => setIsExportModalOpen(false)}
                    onExport={(config) => {
                        if (config.type === 'png' || config.type === 'gif' || config.type === 'jpg') {
                            const element = document.getElementById('vianko-canvas-root');
                            if (element) {
                                html2canvas(element, { backgroundColor: null, useCORS: true, scale: 2 }).then(canvas => {
                                    const link = document.createElement('a');
                                    link.download = `${project.name.replace(/\s+/g, '_')}_${activeBanner?.name.replace(/\s+/g, '_')}.${config.type}`;
                                    link.href = canvas.toDataURL(`image/${config.type === 'jpg' ? 'jpeg' : config.type}`);
                                    link.click();
                                });
                            }
                        }
                    }}
                />
            )}
        </div>
    );
};

export default BannerStudio;
