import React, { memo, useState, useRef, useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import {
    Plus, MousePointer2, Type, Image as ImageIcon, Star,
    Layout, Zap, Monitor, Save, Undo, Redo,
    Move, Paintbrush, MonitorPlay, Film,
    Square
} from 'lucide-react';
import { tokens } from '../../../SharedTool/style/tokens.shared.style';
import { studioStyles } from './BannerStudio.web.styles';
import { useBannerStudioWebLogic } from './BannerStudio.web.logics';
import { useDrawingStudioWebLogic } from '../../atoms/DrawingStudio/DrawingStudio.web.logics';
import { LayerItemRenderer } from './components/LayerItemRenderer/LayerItemRenderer.web';
import { 
    GlassIconButtonAtom, 
    GlassButtonAtom,
    GlassCardAtom
} from '../../../SharedTool/components/atoms/GlassAtoms';
import { buildBackgroundStyle } from './BannerStudio.shared';
import { BannerLayer, BannerDesign } from './types/types';

// Lazy loading heavy UI fragments for optimal performance
const PropertiesPanel = lazy(() => import('./components/PropertiesPanel/PropertiesPanel.web').then(m => ({ default: m.PropertiesPanel })));
const ExportModal = lazy(() => import('./components/ExportModal/ExportModal.web').then(m => ({ default: m.ExportModal })));
const DrawingToolsSidebar = lazy(() => import('../../atoms/DrawingStudio/DrawingStudio.web').then(m => ({ default: m.DrawingToolsSidebar })));
const DrawingCanvasLayer = lazy(() => import('../../atoms/DrawingStudio/DrawingStudio.web').then(m => ({ default: m.DrawingCanvasLayer })));

/**
 * Skeleton Loader Atom for Elite Architecture Vianko.
 */
const BannerSkeleton: React.FC<{ height?: number | string, width?: string }> = ({ height = '100%', width = '100%' }) => (
    <div style={{
        height, width,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 75%)',
        backgroundSize: '200% 100%',
        borderRadius: '16px',
        animation: 'banner-skeleton-loading 1.5s infinite linear',
    }} className="skeleton-vko" />
);

/**
 * Fragmented & Asynchronous Module for BannerStudio.
 * Complies with Vianko Architecture Contract (Zero Logic in View + Maximum Optimization).
 */
export const BannerStudio: React.FC = memo(() => {
    const logic = useBannerStudioWebLogic();
    const {
        project, activeBanner, selectedLayer,
        selectedLayerIds,
        zoom, setZoom,
        pan, setPan, resetView,
        activeTab, setActiveTab,
        showGrid, setShowGrid,
        isLoading, isDrawingMode, setIsDrawingMode,
        isSpacePressed,
        
        // Actions
        updateProject, updateBanner, updateLayer, deleteLayer,
        addBanner, duplicateBanner, deleteBanner,
        addLayer, duplicateLayer, moveLayer, renameLayer, reorderLayer,
        handleApplyDrawing, handleSave, undo, redo,
        canUndo, canRedo
    } = logic;

    const drawingLogic = useDrawingStudioWebLogic({
        width: activeBanner?.designWidth || 800,
        height: activeBanner?.designHeight || 200,
        onApply: (dataUrl: string) => {
            handleApplyDrawing(dataUrl);
            setIsDrawingMode(false);
        },
        onCancel: () => setIsDrawingMode(false)
    });

    const canvasAreaRef = useRef<HTMLDivElement>(null);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    // Pre-warming standard fragments
    useEffect(() => {
        import('./components/PropertiesPanel/PropertiesPanel.web');
    }, []);

    // Direct DOM orchestration for Wheel (must be here to avoid passive listener issues)
    useEffect(() => {
        const area = canvasAreaRef.current;
        if (!area) return;

        const handleWheelManual = (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                setZoom((z: number) => Math.max(0.1, Math.min(4, z + delta)));
            } else {
                e.preventDefault();
                setPan((p: {x: number, y: number}) => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
            }
        };

        area.addEventListener('wheel', handleWheelManual, { passive: false });
        return () => area.removeEventListener('wheel', handleWheelManual);
    }, [setZoom, setPan]);

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
            <style>{`
                @keyframes banner-skeleton-loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>
            
            {/* Header section with Logo and Global Controls */}
            <header style={studioStyles.header}>
                <div style={studioStyles.logoContainer}>
                    <div style={studioStyles.logoIcon}>V</div>
                    <div style={studioStyles.logoSubtitleContainer}>
                        <span style={studioStyles.logoTitle}>STUDIO</span>
                        <span style={studioStyles.logoAutomation}>AUTOMATION</span>
                    </div>
                </div>

                <div style={studioStyles.headerActions}>
                    <div style={studioStyles.historyControls}>
                        <button 
                            onClick={undo} 
                            disabled={!canUndo} 
                            style={{ ...studioStyles.historyBtn, opacity: canUndo ? 1 : 0.2 }}
                        >
                            <Undo size={14} />
                        </button>
                        <button 
                            onClick={redo} 
                            disabled={!canRedo} 
                            style={{ ...studioStyles.historyBtn, opacity: canRedo ? 1 : 0.2 }}
                        >
                            <Redo size={14} />
                        </button>
                    </div>

                    <GlassButtonAtom onClick={() => setIsExportModalOpen(true)} color={tokens.colors.accentGreen} active style={{ height: '32px', fontSize: '10px' }}>
                        EXPORTAR
                    </GlassButtonAtom>
                </div>
            </header>

            <main style={studioStyles.mainLayout}>
                {/* TOOLSIDEBAR section */}
                <div style={studioStyles.toolsetWrapper}>
                    <motion.aside 
                        initial={{ x: -60, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={studioStyles.sidebar}
                    >
                        <div style={studioStyles.sidebarStack}>
                            <GlassIconButtonAtom icon={<MousePointer2 size={18} />} active={!isSpacePressed && !isDrawingMode} onClick={() => setIsDrawingMode(false)} color={tokens.colors.accentGreen} tooltip="Seleccionar" />
                            <GlassIconButtonAtom icon={<Move size={18} />} active={isSpacePressed} onClick={() => {}} tooltip="Panear (Espacio)" />
                        </div>

                        <div style={studioStyles.sidebarDivider} />

                        <div style={studioStyles.sidebarStack}>
                            <GlassIconButtonAtom icon={<Type size={18} />} onClick={() => addLayer('text')} tooltip="Texto" />
                            <GlassIconButtonAtom icon={<ImageIcon size={18} />} onClick={() => addLayer('image')} tooltip="Imagen" />
                            <GlassIconButtonAtom icon={<Square size={18} />} onClick={() => addLayer('shape')} tooltip="Formas" />
                            <GlassIconButtonAtom icon={<Star size={18} />} onClick={() => addLayer('particles')} tooltip="Partículas" />
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
                            <Suspense fallback={<BannerSkeleton width="60px" />}>
                                <DrawingToolsSidebar logic={drawingLogic} />
                            </Suspense>
                        </motion.div>
                    )}
                </div>

                {/* CANVAS Container section */}
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
                            cursor: isSpacePressed ? 'grab' : (isDrawingMode ? 'crosshair' : 'default'),
                            touchAction: 'none',
                        }}
                        onPointerDown={(e) => {
                            if (isSpacePressed || e.button === 1) {
                                const target = e.currentTarget as HTMLElement;
                                target.setPointerCapture(e.pointerId);
                                target.setAttribute('data-panning', 'true');
                            }
                        }}
                        onPointerMove={(e) => {
                            if (e.currentTarget.getAttribute('data-panning') === 'true') {
                                setPan((p: {x: number, y: number}) => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
                            }
                        }}
                        onPointerUp={(e) => {
                            e.currentTarget.releasePointerCapture(e.pointerId);
                            e.currentTarget.removeAttribute('data-panning');
                        }}
                    >
                        <div style={{
                            ...studioStyles.canvasWrapper,
                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                            width: activeBanner?.designWidth || 800,
                            height: activeBanner?.designHeight || 200,
                            ...(activeBanner ? buildBackgroundStyle(activeBanner.background) : { backgroundColor: '#fff' }),
                            ...(activeBanner?.styles || {}),
                        }}>
                             {(activeBanner?.layers || []).filter((l: BannerLayer) => l.visible).map((layer: BannerLayer) => (
                                <LayerItemRenderer
                                    key={layer.id}
                                    layer={layer}
                                    isSelected={selectedLayerIds.includes(layer.id)}
                                    onSelect={(multi: boolean) => logic.toggleSelectedLayer(layer.id, multi)}
                                    onUpdate={(upds: any) => updateLayer(layer.id, upds)}
                                    onDelete={() => deleteLayer(layer.id)}
                                    onDuplicate={() => duplicateLayer()}
                                    onReorder={(act: any) => reorderLayer(layer.id, act)}
                                    zoom={zoom}
                                />
                            ))}

                            <Suspense fallback={null}>
                                {isDrawingMode && activeBanner && (
                                    <DrawingCanvasLayer 
                                        logic={drawingLogic} 
                                        width={activeBanner.designWidth} 
                                        height={activeBanner.designHeight} 
                                    />
                                )}
                            </Suspense>
                        </div>

                        {/* Visual Helpers section */}
                        <div style={studioStyles.zoomControls}>
                            <button onClick={resetView} style={{...studioStyles.iconBtn, width: 'auto', padding: '0 12px', fontSize: '10px', fontWeight: 900}}>RESET</button>
                            <button onClick={() => setZoom((z: number) => Math.max(0.1, z - 0.1))} style={studioStyles.iconBtn}>-</button>
                            <span style={{ fontSize: '11px', fontWeight: 900, color: tokens.colors.accentGreen }}>{Math.round(zoom * 100)}%</span>
                            <button onClick={() => setZoom((z: number) => Math.min(4, z + 0.1))} style={studioStyles.iconBtn}>+</button>
                            <div style={studioStyles.zoomDivider} />
                            <button onClick={() => setShowGrid(!showGrid)} style={{ ...studioStyles.iconBtn, color: showGrid ? tokens.colors.accentGreen : 'rgba(255,255,255,0.2)' }}><Layout size={18} /></button>
                        </div>
                    </div>

                    {/* FORMAT selector section */}
                    <footer style={studioStyles.bottomSelector}>
                        <div style={studioStyles.formatLabelArea}>
                            <Monitor size={14} opacity={0.4} />
                            <span style={{ fontSize: '9px', fontWeight: 900, opacity: 0.4, letterSpacing: '1px' }}>FORMATOS</span>
                        </div>
                        <div 
                            style={studioStyles.formatScrollArea}
                            className="no-scrollbar"
                            onWheel={(e) => {
                                (e.currentTarget as HTMLElement).scrollLeft += e.deltaY;
                            }}
                        >
                            {project.banners.map((b: BannerDesign) => (
                                <motion.div
                                    key={b.id}
                                    layout
                                    onClick={() => updateProject({ activeBannerId: b.id })}
                                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.08)' }}
                                    whileTap={{ scale: 0.95 }}
                                    style={project.activeBannerId === b.id ? studioStyles.formatPillActive : studioStyles.formatPill}
                                >
                                    <div style={{ 
                                        ...studioStyles.formatPillDot, 
                                        background: project.activeBannerId === b.id ? tokens.colors.accentGreen : 'rgba(255,255,255,0.2)' 
                                    }} />
                                    <span style={{ fontSize: '11px', fontWeight: 900, color: project.activeBannerId === b.id ? 'white' : 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>{b.name}</span>
                                </motion.div>
                            ))}
                        </div>
                        <GlassIconButtonAtom icon={<Plus size={18} />} onClick={addBanner} color={tokens.colors.accentGreen} />
                    </footer>
                </motion.div>

                {/* PROPERTIES PANEL section */}
                <motion.aside 
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    style={studioStyles.propertiesWrapper}
                >
                    <GlassCardAtom intensity="strong" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Suspense fallback={<BannerSkeleton />}>
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
                        </Suspense>
                    </GlassCardAtom>
                </motion.aside>
            </main>

            {/* MODALS section */}
            <Suspense fallback={null}>
                {isExportModalOpen && (
                    <ExportModal 
                        isOpen={isExportModalOpen} 
                        onClose={() => setIsExportModalOpen(false)} 
                        activeBanner={activeBanner} 
                        projectName={project.name}
                        project={project}
                    />
                )}
            </Suspense>
        </div>
    );
});

export default BannerStudio;
