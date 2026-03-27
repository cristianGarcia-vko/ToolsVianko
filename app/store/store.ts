import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import { createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import uiReducer from './slices/uiSlice';
import bannerReducer from './slices/bannerSlice';
import k6Reducer from './slices/k6Slice';

// Transform: strip undo/redo stacks before persisting (they contain
// deep clones of the full project with base64 images and blow up localStorage).
const stripHeavyDataTransform = createTransform(
    // inbound: state → storage
    (inboundState: any, key) => {
        if (key === 'banner') {
            const { undoStack, redoStack, ...rest } = inboundState;
            return rest;
        }
        if (key === 'k6') {
            const { historyData, ...rest } = inboundState;
            // Keep only last 5 entries to avoid quota issues
            return { ...rest, historyData: (historyData || []).slice(0, 5) };
        }
        return inboundState;
    },
    // outbound: storage → state (rehydrate with empty stacks)
    (outboundState: any, key) => {
        if (key === 'banner') {
            return { ...outboundState, undoStack: [], redoStack: [] };
        }
        return outboundState;
    },
    { whitelist: ['banner', 'k6'] }
);

const rootReducer = combineReducers({
    ui: uiReducer,
    banner: bannerReducer,
    k6: k6Reducer,
});

const persistConfig = {
    key: 'vianko-studio-elite',
    storage,
    whitelist: ['ui', 'banner', 'k6'],
    transforms: [stripHeavyDataTransform],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // essential for redux-persist compatibility
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
