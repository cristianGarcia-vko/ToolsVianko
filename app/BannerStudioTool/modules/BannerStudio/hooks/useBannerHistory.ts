import { useState, useCallback } from 'react';
import { StudioProject } from '../types';

export const useBannerHistory = (initialState: StudioProject) => {
    const [current, setCurrent] = useState<StudioProject>(initialState);
    const [past, setPast] = useState<StudioProject[]>([]);
    const [future, setFuture] = useState<StudioProject[]>([]);

    const push = useCallback((next: StudioProject) => {
        // PERF: Avoid stringify comparison on heavy objects
        setPast(prev => [...prev.slice(-20), current]);
        setFuture([]);
        setCurrent(next);
    }, [current]);

    const undo = useCallback(() => {
        if (past.length === 0) return;
        const previous = past[past.length - 1];
        const newPast = past.slice(0, -1);
        setPast(newPast);
        setFuture(prev => [current, ...prev]);
        setCurrent(previous);
    }, [past, current]);

    const redo = useCallback(() => {
        if (future.length === 0) return;
        const next = future[0];
        const newFuture = future.slice(1);
        setFuture(newFuture);
        setPast(prev => [...prev, current]);
        setCurrent(next);
    }, [future, current]);

    return {
        project: current,
        setProject: setCurrent,
        push, undo, redo,
        canUndo: past.length > 0,
        canRedo: future.length > 0
    };
};
