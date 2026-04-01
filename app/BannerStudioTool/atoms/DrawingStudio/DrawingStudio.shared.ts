export type DrawingTool = 
    | 'brush' 
    | 'pencil' 
    | 'airbrush' 
    | 'neon' 
    | 'eraser' 
    | 'rect' 
    | 'circle' 
    | 'line' 
    | 'bucket' 
    | 'pattern';

export interface DrawingLayer {
    id: string;
    name: string;
    visible: boolean;
    zIndex: number;
}

export interface DrawingStudioPropsBase {
    width: number;
    height: number;
    initialData?: string;
    onApply: (dataUrl: string) => void;
    onCancel: () => void;
}

export type DrawingTab = 'tools' | 'layers' | 'settings';
