import { BannerLayer } from './types';

export interface LayerPropsBase {
    layer: BannerLayer;
    isSelected: boolean;
    onSelect: (multi: boolean) => void;
    onUpdate: (updates: Partial<BannerLayer>) => void;
    onDelete: () => void;
    onDuplicate: () => void;
    onReorder: (action: 'front' | 'back' | 'forward' | 'backward') => void;
    zoom: number;
}
