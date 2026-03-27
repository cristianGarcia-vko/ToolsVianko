import { BannerDesign, BannerLayer, StudioProject } from './types';
import { tokens } from '../../../SharedTool/style/tokens.shared.style';

export const STORAGE_KEYS = {
    projectPrefix: 'vstudio_prj_',
    bannerPrefix: 'vstudio_bnr_',
    projectIndex: 'vstudio_prj_index',
    bannerIndex: 'vstudio_bnr_index',
    draft: 'vstudio_draft',
    lastProject: 'vstudio_last_id'
};

export const MIN_LAYER_SIZE = 10;
export const DEFAULT_DESIGN_WIDTH = 800;
export const DEFAULT_DESIGN_HEIGHT = 220;

export const createBannerTemplate = (idNum: number = 1): BannerDesign => ({
    id: `bnr-${Date.now()}-${idNum}`,
    name: `Banner Sin Nombre ${idNum}`,
    designWidth: DEFAULT_DESIGN_WIDTH,
    designHeight: DEFAULT_DESIGN_HEIGHT,
    background: {
        type: 'color',
        color: '#111827',
        gradient: { angle: 90, c1: '#1e293b', c2: '#0f172a' },
        fit: 'cover',
        position: 'center'
    },
    layers: [],
    visibilityRoles: [],
    styles: { borderRadius: '24px' }
});

export const createProjectTemplate = (id: string = ''): StudioProject => {
    const banner = createBannerTemplate(1);
    return {
        id: id || `prj-${Date.now()}`,
        version: 'studio-v8',
        name: 'Nuevo Proyecto Vianko',
        banners: [banner],
        activeBannerId: banner.id,
        settings: {
            mode: 'auto',
            transitionTime: 6,
            intervalMs: 6000,
            autoplay: true,
            loop: true,
            transition: 'fade',
            globalWidth: DEFAULT_DESIGN_WIDTH,
            globalHeight: DEFAULT_DESIGN_HEIGHT
        },
        updatedAt: new Date().toISOString()
    };
};

export const createLayerTemplate = (type: string, id: string = ''): BannerLayer => {
    const finalId = id || `layer-${Date.now()}-${Math.floor(Math.random() * 99999)}`;
    switch (type) {
        case 'text':
            return {
                id: finalId,
                type: 'text',
                tag: 'div',
                name: 'Nuevo Texto',
                visible: true,
                locked: false,
                content: 'Editable Text',
                styles: {
                    position: 'absolute',
                    top: '50px',
                    left: '50px',
                    color: '#ffffff',
                    fontSize: '32px',
                    fontWeight: '800',
                    fontFamily: 'Outfit, sans-serif'
                }
            };
        case 'image':
            return {
                id: finalId,
                type: 'image',
                name: 'Nueva Imagen',
                visible: true,
                locked: false,
                src: '',
                fit: 'contain',
                position: 'center',
                styles: {
                    position: 'absolute',
                    top: '0px',
                    left: '0px',
                    width: '300px',
                    height: '200px'
                }
            };
        case 'particles':
            return {
                id: finalId,
                type: 'particles',
                name: 'Efecto Partículas',
                visible: true,
                locked: false,
                effect: 'snow',
                density: 0.35,
                color: '#9ecbff',
                styles: {
                    position: 'absolute',
                    top: '0px',
                    left: '0px',
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none'
                }
            };
        case 'canvas':
            return {
                id: finalId,
                type: 'canvas',
                name: 'Nodos Dinámicos',
                visible: true,
                locked: false,
                effect: 'nodes',
                intensity: 0.5,
                styles: {
                    position: 'absolute',
                    top: '0px',
                    left: '0px',
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none'
                }
            };
        case 'drawing':
            return {
                id: finalId,
                type: 'drawing',
                name: 'Capa de Dibujo',
                visible: true,
                locked: false,
                src: '',
                styles: {
                    position: 'absolute',
                    top: '0px',
                    left: '0px',
                    width: '800px',
                    height: '220px'
                }
            };
        case 'shape':
            return {
                id: finalId,
                type: 'shape',
                name: 'Rectángulo',
                visible: true,
                locked: false,
                styles: {
                    position: 'absolute',
                    top: '100px',
                    left: '100px',
                    width: '150px',
                    height: '100px',
                    backgroundColor: tokens.colors.accentPurple,
                    borderRadius: '8px'
                }
            };
        case 'animated':
        case 'video':
            return {
                id: finalId,
                type: 'animated',
                tag: 'div',
                assetType: 'image',
                name: type === 'video' ? 'Video (Animated)' : 'Animated Asset',
                visible: true,
                locked: false,
                src: '',
                fit: 'contain',
                position: 'center',
                styles: {
                    position: 'absolute',
                    top: '0px',
                    left: '0px',
                    width: '100%',
                    height: '100%'
                }
            };
        case 'lottie':
            return {
                id: finalId,
                type: 'lottie',
                name: 'Lottie / JSON',
                visible: true,
                locked: false,
                source: '',
                loop: true,
                autoPlay: true,
                speed: 1,
                styles: {
                    position: 'absolute',
                    top: '0px',
                    left: '0px',
                    width: '200px',
                    height: '200px'
                }
            };
        default:
            return {
                id: finalId,
                type: 'text',
                name: 'Layer',
                visible: true,
                locked: false,
                styles: { position: 'absolute' }
            };
    }
};
