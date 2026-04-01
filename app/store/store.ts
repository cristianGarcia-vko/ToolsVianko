import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import { createTransform } from 'redux-persist';
import uiReducer from './slices/uiSlice';
import bannerReducer from './slices/bannerSlice';
import k6Reducer from './slices/k6Slice';

/**
 * Vianko Elite IndexedDB Storage Adapter
 * Solves the 5MB LocalStorage limit by using Browser's IndexedDB (Storage capacity in GBs).
 */
const viankoIndexedDBStorage = {
    getItem: (key: string): Promise<string | null> => {
        return new Promise((resolve) => {
            try {
                const request = indexedDB.open('VIANKO_SENTINEL_DB', 1);
                request.onupgradeneeded = () => request.result.createObjectStore('keyval');
                request.onsuccess = () => {
                    const db = request.result;
                    const tx = db.transaction('keyval', 'readonly');
                    const store = tx.objectStore('keyval');
                    const getRequest = store.get(key);
                    getRequest.onsuccess = () => resolve(getRequest.result || null);
                    getRequest.onerror = () => resolve(null);
                    tx.oncomplete = () => db.close();
                };
                request.onerror = () => resolve(null);
            } catch (e) { resolve(null); }
        });
    },
    setItem: (key: string, value: string): Promise<void> => {
        return new Promise((resolve) => {
            try {
                const request = indexedDB.open('VIANKO_SENTINEL_DB', 1);
                request.onupgradeneeded = () => request.result.createObjectStore('keyval');
                request.onsuccess = () => {
                    const db = request.result;
                    const tx = db.transaction('keyval', 'readwrite');
                    const store = tx.objectStore('keyval');
                    const putRequest = store.put(value, key);
                    putRequest.onsuccess = () => resolve();
                    putRequest.onerror = () => resolve();
                    tx.oncomplete = () => db.close();
                };
                request.onerror = () => resolve();
            } catch (e) { resolve(); }
        });
    },
    removeItem: (key: string): Promise<void> => {
        return new Promise((resolve) => {
            try {
                const request = indexedDB.open('VIANKO_SENTINEL_DB', 1);
                request.onsuccess = () => {
                    const db = request.result;
                    const tx = db.transaction('keyval', 'readwrite');
                    tx.objectStore('keyval').delete(key);
                    tx.oncomplete = () => { db.close(); resolve(); };
                };
                request.onerror = () => resolve();
            } catch (e) { resolve(); }
        });
    }
};

// Transform: aggressively strip heavy data before persisting for performance.
const stripHeavyDataTransform = createTransform(
    // inbound: state → storage (Filtering data before it hits disk)
    (inboundState: any, key) => {
        if (key === 'banner') {
            const { undoStack, redoStack, ...rest } = inboundState;
            return rest;
        }
        if (key === 'k6') {
            const { historyData, currentReport, ...rest } = inboundState;
            
            // Limit and minimize history entries
            const minimizedHistory = (historyData || []).slice(0, 5).map((h: any) => ({
                timestamp: h.timestamp,
                projectName: h.projectName,
                healthScore: h.healthScore,
                kpis: { successRate: h.kpis?.successRate }
            }));

            // Strip timeSeries from currentReport for smoother writing
            const optimizedReport = currentReport ? {
                ...currentReport,
                timeSeries: (currentReport.timeSeries || []).slice(-1)
            } : null;

            return { ...rest, historyData: minimizedHistory, currentReport: optimizedReport };
        }
        return inboundState;
    },
    // outbound: storage → state
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
    storage: viankoIndexedDBStorage, // Migrated from LocalStorage to IndexedDB
    whitelist: ['ui', 'banner', 'k6'],
    transforms: [stripHeavyDataTransform],
    throttle: 1000,
};

const persistedReducer = persistReducer(persistConfig, rootReducer as any);

export const store = configureStore({
    reducer: persistedReducer as any,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
