import { StudioProject, BannerDesign, BannerLayer } from './types';

export interface PropertiesPanelProps {
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
    onSelectLayer: (id: string) => void;
    onDeselectLayer: () => void;
    tab: 'props' | 'layers';
    setTab: (t: 'props' | 'layers') => void;
}
