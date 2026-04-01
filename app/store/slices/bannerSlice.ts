import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StudioProject, BannerDesign, BannerLayer } from '../../BannerStudioTool/modules/BannerStudio/types/types';
import { createProjectTemplate } from '../../BannerStudioTool/modules/BannerStudio/types/constants';

// Sincronización V7+: Referencias Normalizadas

interface BannerState {
    project: StudioProject;
    selectedLayerId: string | null;
    activeBannerId: string;
    undoStack: StudioProject[];
    redoStack: StudioProject[];
}

const initialProject = createProjectTemplate('prj-default');

const initialState: BannerState = {
    project: initialProject,
    selectedLayerId: null,
    activeBannerId: initialProject.banners[0].id,
    undoStack: [],
    redoStack: [],
};

const bannerSlice = createSlice({
    name: 'banner',
    initialState,
    reducers: {
        setProject: (state, action: PayloadAction<StudioProject>) => {
            state.project = action.payload;
            state.activeBannerId = action.payload.activeBannerId || action.payload.banners[0].id;
        },
        updateProject: (state, action: PayloadAction<Partial<StudioProject>>) => {
            // Push to undo before change
            state.undoStack.push(JSON.parse(JSON.stringify(state.project)));
            if (state.undoStack.length > 50) state.undoStack.shift();
            state.redoStack = [];

            state.project = { ...state.project, ...action.payload };
            state.project.updatedAt = new Date().toISOString();
        },
        setActiveBanner: (state, action: PayloadAction<string>) => {
            state.activeBannerId = action.payload;
            state.project.activeBannerId = action.payload;
        },
        setSelectedLayer: (state, action: PayloadAction<string | null>) => {
            state.selectedLayerId = action.payload;
        },
        updateLayer: (state, action: PayloadAction<{ bannerId: string, layerId: string, updates: Partial<BannerLayer> }>) => {
             // Basic state update for performance (don't push to undo on every pixel movement, maybe handle that in components)
             const banner = state.project.banners.find(b => b.id === action.payload.bannerId);
             if (banner) {
                 const layer = banner.layers.find(l => l.id === action.payload.layerId);
                 if (layer) {
                     Object.assign(layer, action.payload.updates);
                 }
             }
        },
        undo: (state) => {
            if (state.undoStack.length === 0) return;
            const prev = state.undoStack.pop()!;
            state.redoStack.push(JSON.parse(JSON.stringify(state.project)));
            state.project = prev;
            state.activeBannerId = prev.activeBannerId;
        },
        redo: (state) => {
            if (state.redoStack.length === 0) return;
            const next = state.redoStack.pop()!;
            state.undoStack.push(JSON.parse(JSON.stringify(state.project)));
            state.project = next;
            state.activeBannerId = next.activeBannerId;
        }
    },
});

export const { setProject, updateProject, setActiveBanner, setSelectedLayer, updateLayer, undo, redo } = bannerSlice.actions;
export default bannerSlice.reducer;
