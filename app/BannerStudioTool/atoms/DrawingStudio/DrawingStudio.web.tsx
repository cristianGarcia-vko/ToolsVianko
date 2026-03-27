import React from 'react';
import { 
    Paintbrush, Eraser, Check, X, Square, Circle, 
    Layers as LayersIcon, Settings2, Palette,
    Zap, Sparkles, Pencil, Maximize2, Eye, EyeOff, Plus, Minus
} from 'lucide-react';
import { tokens } from '../../../SharedTool/style/tokens.shared.style';
import { drawingStyles as styles } from './DrawingStudio.web.styles';
import { useDrawingStudioLogic } from './DrawingStudio.web.logics';

interface Props {
    width: number;
    height: number;
    initialData?: string;
    onApply: (dataUrl: string) => void;
    onCancel: () => void;
}

export const DrawingStudioAtom: React.FC<Props> = ({ 
    width, height, initialData, onApply, onCancel 
}) => {
    const {
        canvasRefs, overlayRef,
        tool, setTool, color, setColor, size, setSize, opacity, setOpacity,
        isFill, setIsFill, symmetry, setSymmetry, activeTab, setActiveTab,
        layers, setLayers, activeLayerId, setActiveLayerId,
        startDrawing, draw, stopDrawing, undo, clearActiveLayer, addLayer, handleFinalApply
    } = useDrawingStudioLogic({ width, height, initialData, onApply });

    return (
        <div style={styles.container}>
            <div style={styles.sidebar}>
                <div style={styles.header}>
                    <Sparkles size={16} color={tokens.colors.accentPurple} />
                    <span>ELITE ART-PROCESSOR</span>
                </div>
                <div style={styles.tabNav}>
                    <button onClick={() => setActiveTab('tools')} style={styles.tab(activeTab === 'tools')}><Palette size={14}/></button>
                    <button onClick={() => setActiveTab('layers')} style={styles.tab(activeTab === 'layers')}><LayersIcon size={14}/></button>
                    <button onClick={() => setActiveTab('settings')} style={styles.tab(activeTab === 'settings')}><Settings2 size={14}/></button>
                </div>
                <div style={styles.scrollArea}>
                    {activeTab === 'tools' && (
                        <>
                            <div style={styles.group}>
                                <span style={styles.label}>PEN ENGINE</span>
                                <div style={styles.grid}>
                                    <ToolBtn active={tool==='brush'} icon={<Paintbrush size={16}/>} onClick={()=>setTool('brush')} title="Suave" />
                                    <ToolBtn active={tool==='pencil'} icon={<Pencil size={16}/>} onClick={()=>setTool('pencil')} title="Fino" />
                                    <ToolBtn active={tool==='neon'} icon={<Zap size={16}/>} onClick={()=>setTool('neon')} title="Glow" />
                                    <ToolBtn active={tool==='airbrush'} icon={<Maximize2 size={16}/>} onClick={()=>setTool('airbrush')} title="Air" />
                                    <ToolBtn active={tool==='eraser'} icon={<Eraser size={16}/>} onClick={()=>setTool('eraser')} title="Borrador" />
                                </div>
                            </div>
                            <div style={styles.group}>
                                <span style={styles.label}>GEOMETRY</span>
                                <div style={styles.grid}>
                                    <ToolBtn active={tool==='rect'} icon={<Square size={16}/>} onClick={()=>setTool('rect')} title="Caja" />
                                    <ToolBtn active={tool==='circle'} icon={<Circle size={16}/>} onClick={()=>setTool('circle')} title="Óvalo" />
                                    <ToolBtn active={tool==='line'} icon={<Minus size={16}/>} onClick={()=>setTool('line')} title="Línea" />
                                </div>
                            </div>
                        </>
                    )}
                    {activeTab === 'layers' && (
                        <div style={styles.group}>
                            <div style={styles.layerHeader}>
                                <span style={styles.label}>LAYERS SYSTEM</span>
                                <button onClick={addLayer} style={styles.miniPlus}><Plus size={12}/></button>
                            </div>
                            <div style={styles.layerList}>
                                {layers.slice().sort((a, b) => b.zIndex - a.zIndex).map((l) => (
                                    <div key={l.id} onClick={() => setActiveLayerId(l.id)} style={styles.layerRow(activeLayerId === l.id)}>
                                        <button onClick={(e) => { e.stopPropagation(); setLayers(prev => prev.map(ly => ly.id === l.id ? {...ly, visible: !ly.visible} : ly)) }} style={styles.layerActionBtn(l.visible ? 'white' : 'rgba(255,255,255,0.2)')}>
                                            {l.visible ? <Eye size={12}/> : <EyeOff size={12}/>}
                                        </button>
                                        <span style={styles.layerName}>{l.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div style={styles.group}>
                        <span style={styles.label}>CHROMATIC CORE</span>
                        <input type="color" value={color} onChange={e=>setColor(e.target.value)} style={styles.colorPicker} />
                    </div>
                </div>
            </div>

            <div style={styles.mainArea}>
                <div style={styles.viewportHeader}>
                    <button onClick={handleFinalApply} style={styles.applyBtn}><Check size={14}/> COMMIT ARCHIVE</button>
                    <button onClick={onCancel} style={styles.cancelBtn}><X size={14}/> ABORT</button>
                </div>
                <div style={styles.canvasArea}>
                    <div style={{...styles.canvasWrapper, width: `${width}px`, height: `${height}px`}}>
                        {layers.sort((a, b) => a.zIndex - b.zIndex).map((l) => (
                            <canvas key={l.id} ref={el => canvasRefs.current[l.id] = el} width={width} height={height} style={styles.layerCanvas(l.zIndex, l.visible)} />
                        ))}
                        <canvas ref={overlayRef} width={width} height={height} onPointerDown={startDrawing} onPointerMove={draw} onPointerUp={stopDrawing} onPointerLeave={stopDrawing} style={styles.overlayCanvas} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const ToolBtn: React.FC<{active: boolean, icon: React.ReactNode, onClick: ()=>void, title?: string}> = ({active, icon, onClick, title}) => (
    <button onClick={onClick} title={title} style={styles.toolBtn(active)}>{icon}</button>
);
