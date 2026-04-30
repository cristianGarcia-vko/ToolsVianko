import React from 'react';
import { 
    X, FileJson, Package, Layers, Film, Monitor, HardDrive, 
    ImageIcon, MonitorPlay, ChevronLeft, Loader2, CheckCircle2,
    Zap, Download
} from 'lucide-react';
import { tokens } from '../../../../../SharedTool/style/tokens.shared.style';
import { ExportModalProps } from './ExportModal.shared';
import { useExportModalLogic } from './ExportModal.web.logics';
import { exportStyles as styles } from './ExportModal.web.styles';
import { LayerItemRenderer } from '../LayerItemRenderer/LayerItemRenderer.web';
import { buildBackgroundStyle } from '../../BannerStudio.shared';
import { BannerLayer, BannerDesign } from '../../types/types';

/**
 * Pure View for ExportModal.
 * No internal business logic, only declarative UI and event binding.
 * Complies with Vianko Architecture Contract (Zero Logic in View).
 */
export const ExportModal: React.FC<ExportModalProps> = ({ 
    isOpen, onClose, project, activeBanner, projectName 
}) => {
    const logic = useExportModalLogic({ project, onClose, onExport: () => {} });
    const {
        view, setView,
        exportStep, setExportStep,
        progress,
        activeBannerId, setActiveBannerId,
        handleStartZipExport,
        handleStartVprjExport,
        handleStartJsonExport,
        handleStartSeparateExport,
        handleRoleExport,
        handleLocalSave,
        handleImageExport,
        separateExport,
        updateSeparateAssetName,
        updateSeparateConfigFilename,
        errorMessage,
    } = logic;

    if (!isOpen) return null;

    const previewBanner = project.banners.find((b: any) => b.id === activeBannerId) || activeBanner || project.banners[0];

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <div style={styles.headerTitleGroup}>
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
                                icon={<Package size={32} color={tokens.colors.accentPurple}/>}
                                label="ZIP BUNDLE"
                                desc="Empaquetado total (V8+)"
                                onClick={handleStartZipExport}
                            />
                            <ExportOption
                                icon={<Download size={32} color="#38bdf8"/>}
                                label="ARCHIVOS SEPARADOS"
                                desc="Assets primero + JSON final"
                                onClick={handleStartSeparateExport}
                            />
                            <ExportOption 
                                icon={<Layers size={32} color="#22d3ee"/>}
                                label="ROLE SPECIFIC"
                                desc="Exportación segmentada"
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
                                icon={<ImageIcon size={32} color={tokens.colors.accentGreen}/>}
                                label="PNG SNAPSHOT"
                                desc="Imagen de alta fidelidad"
                                onClick={() => handleImageExport('png')}
                            />
                            <ExportOption 
                                icon={<MonitorPlay size={32} color={tokens.colors.accentGreen}/>}
                                label="JPG COMPRESS"
                                desc="Optimizado para Web"
                                onClick={() => handleImageExport('jpg')}
                            />
                             <ExportOption 
                                icon={<Film size={32} color={tokens.colors.accentGreen}/>}
                                label="GIF ANIMATION"
                                desc="Captura de Movimiento"
                                onClick={() => handleImageExport('gif')}
                            />
                        </div>
                    )}

                    {exportStep === 'config' && view === 'separate' && separateExport && (
                        <div style={styles.separateView}>
                            <header style={styles.separateHeader}>
                                <button onClick={() => setView('menu')} style={styles.backBtn}><ChevronLeft size={16}/> VOLVER AL MENU</button>
                                <span style={styles.playerBannerTitle}>EXPORTACION SEPARADA</span>
                            </header>

                            <div style={styles.separateConfigRow}>
                                <FileJson size={18} color={tokens.colors.accentPurple} />
                                <div style={styles.separateConfigContent}>
                                    <span style={styles.separateAssetTitle}>CONFIGURADOR</span>
                                    <input
                                        value={separateExport.configFilename}
                                        onChange={(e) => updateSeparateConfigFilename(e.target.value)}
                                        placeholder="dashboard-banner.json"
                                        style={styles.separateInput}
                                    />
                                </div>
                            </div>

                            <div style={styles.separateAssetList} className="no-scrollbar">
                                {separateExport.assets.length ? separateExport.assets.map((asset, index) => (
                                    <div key={`${asset.defaultName}-${index}`} style={styles.separateAssetRow}>
                                        <ImageIcon size={16} color={tokens.colors.accentGreen} />
                                        <div style={styles.separateAssetContent}>
                                            <span style={styles.separateAssetTitle}>{asset.defaultName}</span>
                                            <input
                                                value={asset.finalName}
                                                onChange={(e) => updateSeparateAssetName(index, e.target.value)}
                                                placeholder={asset.defaultName}
                                                style={styles.separateInput}
                                            />
                                        </div>
                                    </div>
                                )) : (
                                    <div style={styles.separateEmptyState}>
                                        <FileJson size={24} color={tokens.colors.accentPurple} />
                                        <span style={styles.optionLabel}>SIN RECURSOS VISUALES EMBEBIDOS</span>
                                    </div>
                                )}
                            </div>

                            <button onClick={handleStartSeparateExport} style={styles.separateExportBtn}>
                                GUARDAR RECURSOS Y CONFIGURADOR
                            </button>
                        </div>
                    )}

                    {view === 'player' && (
                        <div style={styles.playerView}>
                            <header style={styles.playerHeader}>
                                <button onClick={() => setView('menu')} style={styles.backBtn}><ChevronLeft size={16}/> VOLVER AL MENÚ</button>
                                <span style={styles.playerBannerTitle}>{previewBanner?.name?.toUpperCase()} PREVIEW</span>
                            </header>
                            <div style={styles.previewContainer}>
                                <div id="vianko-export-preview" style={{
                                    ...styles.previewCanvasArea,
                                    transform: `scale(${Math.min(1, 600 / (previewBanner?.designWidth || 1))})`,
                                    width: previewBanner?.designWidth,
                                    height: previewBanner?.designHeight,
                                    ...(previewBanner ? buildBackgroundStyle(previewBanner.background) : { backgroundColor: '#000' }),
                                    ...(previewBanner?.styles || {}),
                                }}>
                                    {(previewBanner?.layers || []).filter((l: BannerLayer)=>l.visible).map((layer: BannerLayer) => (
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
                            <div style={styles.formatSelectorRow} className="no-scrollbar">
                                {project.banners.map((b: BannerDesign) => (
                                    <button 
                                        key={b.id} 
                                        onClick={() => setActiveBannerId(b.id)} 
                                        style={{
                                            ...styles.formatBtn, 
                                            background: activeBannerId === b.id ? tokens.colors.accentPurple : 'rgba(255,255,255,0.05)',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {b.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {view === 'mosaic' && (
                        <div style={styles.roleGrid}>
                            <button onClick={() => setView('menu')} style={styles.backBtn}><X size={16}/> CERRAR</button>
                            <div style={styles.roleGridContainer}>
                                {['RH', 'ADMIN', 'COORDINADOR', 'CLIENTE'].map(role => (
                                    <div key={role} style={styles.roleCard} onClick={() => handleRoleExport(role)}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                            <div style={styles.roleIconBox}>
                                                <Zap size={20} color={tokens.colors.accentPurple}/>
                                            </div>
                                            <div style={styles.roleLabelStack}>
                                                <span style={styles.roleCardTitle}>BUNDLE {role}</span>
                                                <span style={styles.roleCardDesc}>Solo capas asignadas</span>
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
                            <button onClick={onClose} style={styles.finalBtn}>CERRAR</button>
                        </div>
                    )}

                    {exportStep === 'error' && (
                        <div style={styles.statusView}>
                            <span style={styles.statusText}>NO SE PUDO COMPLETAR LA EXPORTACION</span>
                            <span style={styles.errorText}>{errorMessage || 'Revisa la consola para mas detalle.'}</span>
                            <button onClick={() => { setExportStep('config'); setView('menu'); }} style={styles.finalBtn}>VOLVER</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ExportOption: React.FC<{icon: React.ReactNode, label: string, desc: string, onClick: ()=>void}> = ({icon, label, desc, onClick}) => (
    <button onClick={onClick} style={styles.optionBtn}>
        {icon}
        <div style={styles.optionContent}>
            <span style={styles.optionLabel}>{label}</span>
            <span style={styles.optionDesc}>{desc}</span>
        </div>
    </button>
);
