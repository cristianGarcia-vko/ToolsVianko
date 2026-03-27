import React from 'react';
import { 
    X, Download, Package, FileJson, Layers, Monitor, HardDrive, 
    CheckCircle2, AlertCircle, Loader2, Sparkles, Zap, Film, 
    ChevronLeft, ChevronRight, Play, Image as ImageIcon, MonitorPlay
} from 'lucide-react';
import { tokens } from '../../../SharedTool/style/tokens.shared.style';
import { StudioProject, BannerDesign, BannerLayer } from './types';
import { LayerItemRenderer } from './LayerItemRenderer.web';
import { useExportModalLogic } from './ExportModal.web.logics';
import { exportStyles as styles } from './ExportModal.web.styles';

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

interface Props {
    project: StudioProject;
    onClose: () => void;
    onExport: (config: any) => void;
}

export const ExportModal: React.FC<Props> = ({ project, onClose, onExport }) => {
    const {
        view, setView,
        exportStep,
        progress,
        activeBannerId, setActiveBannerId,
        handleStartZipExport,
        handleStartVprjExport,
        handleStartJsonExport,
        handleRoleExport,
        handleLocalSave,
        handleImageExport,
    } = useExportModalLogic({ project, onClose, onExport });

    const previewBanner = project.banners.find(b => b.id === activeBannerId) || project.banners[0];

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                        <Package color={tokens.colors.accentPurple} size={20} />
                        <span style={styles.title}>ORQUESTADOR DE EXPORTACIÓN</span>
                    </div>
                    <button onClick={onClose} style={styles.closeBtn}><X size={20}/></button>
                </div>

                <div style={styles.content}>
                    {exportStep === 'config' && view === 'menu' && (
                        <div style={styles.grid}>
                            <ExportOption 
                                icon={<FileJson size={32} color={tokens.colors.accentPurple}/>}
                                label="VPRJ PROJECT"
                                desc="Respaldo nativo Vianko"
                                onClick={handleStartVprjExport}
                            />
                            <ExportOption 
                                icon={<Package size={32} color="#f472b6"/>}
                                label="ZIP BUNDLE"
                                desc="Empaquetado total (Banners + Assets)"
                                onClick={handleStartZipExport}
                            />
                            <ExportOption 
                                icon={<Layers size={32} color="#22d3ee"/>}
                                label="ROLE SPECIFIC"
                                desc="Exportación segmentada (RH/Admin)"
                                onClick={() => setView('mosaic')}
                            />
                            <ExportOption 
                                icon={<Film size={32} color="#fbbf24"/>}
                                label="LIVE PLAYER"
                                desc="Previsualización Inmersiva"
                                onClick={() => setView('player')}
                            />
                            <ExportOption 
                                icon={<Monitor size={32} color="#a855f7"/>}
                                label="JSON METADATA"
                                desc="Esquema puro para Backend"
                                onClick={handleStartJsonExport}
                            />
                             <ExportOption 
                                icon={<HardDrive size={32} color="#10b981"/>}
                                label="LOCAL BACKUP"
                                desc="Guardado rápido en Browser"
                                onClick={handleLocalSave}
                            />
                            <div style={styles.gridDivider} />
                            <ExportOption 
                                icon={<ImageIcon size={32} color={tokens.colors.accentMint}/>}
                                label="PNG SNAPSHOT"
                                desc="Imagen de alta fidelidad"
                                onClick={() => handleImageExport('png')}
                            />
                            <ExportOption 
                                icon={<MonitorPlay size={32} color={tokens.colors.accentMint}/>}
                                label="JPG COMPRESS"
                                desc="Optimizado para Web"
                                onClick={() => handleImageExport('jpg')}
                            />
                             <ExportOption 
                                icon={<Film size={32} color={tokens.colors.accentMint}/>}
                                label="GIF ANIMATION"
                                desc="Captura de Movimiento"
                                onClick={() => handleImageExport('gif')}
                            />
                        </div>
                    )}

                    {view === 'player' && (
                        <div style={styles.playerView}>
                            <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                                <button onClick={() => setView('menu')} style={styles.backBtn}><ChevronLeft size={16}/> VOLVER AL MENÚ</button>
                                <span style={{fontSize: '10px', fontWeight: 900, color: tokens.colors.accentPurple}}>{previewBanner?.name?.toUpperCase()} PREVIEW</span>
                            </header>
                            <div style={styles.previewContainer}>
                                <div style={{
                                    transform: `scale(${Math.min(1, 600 / (previewBanner?.designWidth || 1))})`,
                                    width: previewBanner?.designWidth,
                                    height: previewBanner?.designHeight,
                                    ...(previewBanner?.background.type === 'color'
                                        ? { backgroundColor: previewBanner?.background.color || '#fff' }
                                        : previewBanner?.background.type === 'gradient'
                                            ? { backgroundImage: `linear-gradient(${previewBanner?.background.gradient?.angle + 'deg' || '90deg'}, ${previewBanner?.background.gradient?.c1}, ${previewBanner?.background.gradient?.c2})` }
                                            : previewBanner?.background.type === 'image'
                                                ? { backgroundImage: `url(${previewBanner?.background.image})`, backgroundSize: previewBanner?.background.fit || 'cover', backgroundPosition: previewBanner?.background.position || 'center', backgroundRepeat: 'no-repeat' }
                                                : previewBanner?.background.type === 'pattern'
                                                    ? { background: buildPatternBackgroundCss(previewBanner?.background) }
                                                    : { backgroundColor: '#fff' }),
                                    position: 'relative',
                                    boxShadow: '0 40px 80px rgba(0,0,0,0.5)'
                                }}>
                                    {(previewBanner?.layers || []).filter(l=>l.visible).map(layer => (
                                        <LayerItemRenderer 
                                            key={layer.id} 
                                            layer={layer} 
                                            isSelected={false}
                                            onSelect={()=>{}}
                                            onUpdate={()=>{}}
                                            onDelete={()=>{}}
                                            onDuplicate={()=>{}}
                                            onReorder={()=>{}}
                                            zoom={1}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div style={{marginTop: '20px', display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px'}}>
                                {project.banners.map(b => (
                                    <button key={b.id} onClick={() => setActiveBannerId(b.id)} style={{...styles.formatBtn, background: activeBannerId === b.id ? tokens.colors.accentPurple : 'rgba(255,255,255,0.05)', whiteSpace: 'nowrap'}}>
                                        {b.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {view === 'mosaic' && (
                        <div style={styles.roleGrid}>
                            <button onClick={() => setView('menu')} style={styles.backBtn}><ChevronLeft size={16}/> VOLVER AL MENÚ</button>
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '20px'}}>
                                {['RH', 'ADMIN', 'COORDINADOR', 'CLIENTE'].map(role => (
                                    <div key={role} style={styles.roleCard} onClick={() => handleRoleExport(role)}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                            <div style={styles.roleIconBox}>
                                                <Zap size={20} color={tokens.colors.accentPurple}/>
                                            </div>
                                            <div style={{display: 'flex', flexDirection: 'column'}}>
                                                <span style={{fontSize: '12px', fontWeight: 900}}>BUNDLE {role}</span>
                                                <span style={{fontSize: '9px', opacity: 0.4}}>Solo capas asignadas</span>
                                            </div>
                                        </div>
                                        <Download size={16} opacity={0.3}/>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {exportStep === 'exporting' && (
                        <div style={styles.statusView}>
                            <Loader2 size={48} className="animate-spin" color={tokens.colors.accentPurple} />
                            <span style={styles.statusText}>COMPILANDO ESTRUCTURA ELITE...</span>
                            <div style={styles.progressBar}>
                                <div style={{...styles.progressFill, width: `${progress}%`}} />
                            </div>
                            <span style={styles.progressText}>{progress}%</span>
                        </div>
                    )}

                    {exportStep === 'complete' && (
                        <div style={styles.statusView}>
                            <div style={styles.successIcon}>
                                <CheckCircle2 size={32} color={tokens.colors.accentSuccess} />
                            </div>
                            <span style={styles.statusText}>OPERACIÓN COMPLETADA</span>
                            <p style={{fontSize: '11px', opacity: 0.5, maxWidth: '300px'}}>El archivo ha sido procesado y descargado. Los activos están listos para distribución V7+.</p>
                            <button onClick={onClose} style={styles.finalBtn}>VOLVER AL HUB</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* --- SUBCOMPONENTS --- */

const ExportOption: React.FC<{icon: React.ReactNode, label: string, desc: string, onClick: ()=>void}> = ({icon, label, desc, onClick}) => (
    <button onClick={onClick} style={styles.optionBtn}>
        {icon}
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'}}>
            <span style={styles.optionLabel}>{label}</span>
            <span style={styles.optionDesc}>{desc}</span>
        </div>
    </button>
);
