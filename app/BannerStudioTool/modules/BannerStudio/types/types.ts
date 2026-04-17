import { CSSProperties } from 'react';

export type LayerType =
    | 'text'
    | 'image'
    | 'animated'
    | 'particles'
    | 'canvas'
    | 'lottie'
    | 'drawing'
    | 'shape'
    | 'group'
    | 'components'
    | 'background';

export interface BannerLayer {
    id: string;
    type: LayerType;
    tag?: string;
    name: string;
    visible: boolean;
    locked: boolean;
    styles: CSSProperties | any;
    nativeStyles?: CSSProperties | any;
    imageStyles?: CSSProperties | any;
    nativeImageStyles?: CSSProperties | any;
    // Core properties
    content?: string;
    src?: string;
    value?: string;
    source?: string;
    assetName?: string;
    alt?: string;
    fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
    position?: string;
    assetType?: 'text' | 'image' | 'tag';
    actionUrl?: string;
    priority?: boolean;
    lcp?: boolean;
    animation?: {
        name: string;
        duration: string;
        timingFunction: string;
        delay: string;
        iterationCount: string | 'infinite';
        easing?: string;
        fillMode?: string;
    };
    // Special Effects
    effect?: string;
    density?: number;
    intensity?: number;
    color?: string;
    mask?: string;
    media?: Record<string, Record<string, string | number>>;
    components?: BannerLayer[];
    loop?: boolean;
    speed?: number;
    autoPlay?: boolean;
    // Drawing specific
    initialWidth?: number;
    initialHeight?: number;
    visibilityRoles?: string[];
}

export interface BannerBackground {
    type: 'color' | 'gradient' | 'image' | 'pattern';
    color?: string;
    gradient?: {
        angle: number;
        c1: string;
        c2: string;
    };
    image?: string;
    pattern?: 'dots' | 'grid' | 'waves' | 'noise';
    scale?: number;
    opacity?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
    position?: string;
}

export interface BannerDesign {
    id: string;
    name: string;
    designWidth: number;
    designHeight: number;
    background: BannerBackground;
    layers: BannerLayer[];
    visibilityRoles: string[];
    actionUrl?: string;
    duration?: number;
    styles?: {
        borderRadius?: string | number;
        [key: string]: any;
    };
    nativeStyles?: {
        borderRadius?: string | number;
        [key: string]: any;
    };
}

export interface StudioProject {
    id: string;
    version: string;
    name: string;
    banners: BannerDesign[];
    activeBannerId: string;
    settings: {
        mode?: 'manual' | 'auto';
        transitionTime: number;
        intervalMs?: number;
        autoplay: boolean;
        loop: boolean;
        transition?: 'fade' | 'slide' | 'zoom' | 'none';
        globalWidth: number;
        globalHeight: number;
    };
    updatedAt: string;
}

export interface ProjectMeta {
    id: string;
    name: string;
    dirty: boolean;
}

export interface BannerStudioState {
    project: StudioProject;
    selectedLayerIds: string[];
    zoom: number;
    activeTab: 'props' | 'layers';
    history: {
        past: StudioProject[];
        future: StudioProject[];
    };
}

export const ROLES = [
    "ADMIN", "ADMINISTRADOR", "GERENTE", "GERENCIA", 
    "SUPERVISOR", "EMPLEADO", "RH", "COORDINADOR", "CLIENTE"
];
