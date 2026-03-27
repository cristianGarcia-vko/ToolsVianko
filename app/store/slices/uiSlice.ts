import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type StudioModule = 'hub' | 'banner-studio' | 'k6-stress';

interface UIState {
    activeModule: StudioModule;
    lastVisited: string;
}

const initialState: UIState = {
    activeModule: 'hub',
    lastVisited: new Date().toISOString(),
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setModule: (state, action: PayloadAction<StudioModule>) => {
            state.activeModule = action.payload;
            state.lastVisited = new Date().toISOString();
        },
    },
});

export const { setModule } = uiSlice.actions;
export default uiSlice.reducer;
