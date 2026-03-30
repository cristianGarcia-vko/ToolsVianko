import React from 'react';
import { 
    Paintbrush, Check, X, 
    Layers as LayersIcon, Palette,
    Zap, Sparkles, Pencil, Eraser, 
    PaintBucket, Image as ImageIcon
} from 'lucide-react';
import { tokens } from '../../../SharedTool/style/tokens.shared.style';
import { drawingStyles as styles } from './DrawingStudio.web.styles';

export const DrawingToolsSidebar: React.FC<any> = ({ logic }) => {
    const {
        tool, setTool, color, setColor, activeTab, setActiveTab,
        layers, activeLayerId, setActiveLayerId,
        addLayer, handleFinalApply, onCancel,
        handlePatternUpload, patternImage
    } = logic;

    const fileRef = React.useRef<HTMLInputElement>(null);

    return (
        <div style={styles.sidebar}>
            <div style={styles.header}>
                <Sparkles size={16} color={tokens.colors.accentGreen} />
                <span>ELITE BRUSH</span>
            </div>
            <div style={styles.tabNav}>
                <button onClick={() => setActiveTab('tools')} style={styles.tab(activeTab === 'tools')}><Palette size={14}/></button>
                <button onClick={() => setActiveTab('layers')} style={styles.tab(activeTab === 'layers')}><LayersIcon size={14}/></button>
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
                                <ToolBtn active={tool==='eraser'} icon={<Eraser size={16}/>} onClick={()=>setTool('eraser')} title="Borrador" />
                                <ToolBtn active={tool==='bucket'} icon={<PaintBucket size={16}/>} onClick={()=>setTool('bucket')} title="Llenar" />
                                <ToolBtn active={tool==='pattern'} icon={patternImage ? <img src={patternImage} style={{width: 16, height: 16, borderRadius: 4}} /> : <ImageIcon size={16}/>} onClick={()=>fileRef.current?.click()} title="Imagen" />
                                <input type="file" ref={fileRef} style={{display: 'none'}} onChange={handlePatternUpload} accept="image/*" />
                            </div>
                        </div>
                        <div style={styles.group}>
                            <span style={styles.label}>CHROMATIC</span>
                            <input type="color" value={color} onChange={e=>setColor(e.target.value)} style={styles.colorPicker} />
                        </div>
                    </>
                )}
                {activeTab === 'layers' && (
                    <div style={styles.group}>
                        <div style={styles.layerHeader}>
                            <span style={styles.label}>LAYERS</span>
                            <button onClick={addLayer} style={styles.miniPlus}>+</button>
                        </div>
                        <div style={styles.layerList}>
                            {layers.slice().sort((a: any, b: any) => b.zIndex - a.zIndex).map((l: any) => (
                                <div key={l.id} onClick={() => setActiveLayerId(l.id)} style={styles.layerRow(activeLayerId === l.id)}>
                                    <span style={styles.layerName}>{l.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', padding: '12px' }}>
                <button onClick={handleFinalApply} style={{ ...styles.applyBtn, flex: 2 }}><Check size={14}/> GUARDAR</button>
                <button onClick={onCancel} style={{ ...styles.cancelBtn, flex: 1 }}><X size={14}/></button>
            </div>
        </div>
    );
};

export const DrawingCanvasLayer: React.FC<any> = ({ logic, width, height }) => {
    const {
        canvasRefs, overlayRef,
        layers, startDrawing, draw, stopDrawing
    } = logic;

    return (
        <div style={{...styles.canvasWrapper, width: `${width}px`, height: `${height}px`, pointerEvents: 'auto', position: 'absolute', top: 0, left: 0, zIndex: 1000, boxShadow: 'none', background: 'transparent'}}>
            {layers.sort((a:any, b:any) => a.zIndex - b.zIndex).map((l:any) => (
                <canvas 
                    key={l.id} 
                    ref={el => { if (el) canvasRefs.current[l.id] = el; }} 
                    width={width} 
                    height={height} 
                    style={styles.layerCanvas(l.zIndex, l.visible)} 
                />
            ))}
            <canvas ref={overlayRef} width={width} height={height} onPointerDown={startDrawing} onPointerMove={draw} onPointerUp={stopDrawing} onPointerLeave={stopDrawing} style={styles.overlayCanvas} />
        </div>
    );
};

const ToolBtn: React.FC<{active: boolean, icon: React.ReactNode, onClick: ()=>void, title?: string}> = ({active, icon, onClick, title}) => (
    <button onClick={onClick} title={title} style={styles.toolBtn(active)}>{icon}</button>
);
