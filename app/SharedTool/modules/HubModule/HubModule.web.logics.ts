import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { setModule as setReduxModule, StudioModule } from '../../../store/slices/uiSlice';

export type AppState = 'home' | 'banner' | 'k6';

export const useHubLogic = () => {
    const dispatch = useDispatch();
    const activeReduxModule = useSelector((state: RootState) => state.ui.activeModule);

    const currentApp: AppState = activeReduxModule === 'hub' ? 'home' : 
                               (activeReduxModule === 'banner-studio' ? 'banner' : 'k6');

    const navigateTo = (app: AppState) => {
        const next: StudioModule = app === 'home' ? 'hub' : 
                                   (app === 'banner' ? 'banner-studio' : 'k6-stress');
        dispatch(setReduxModule(next));
    };

    const goBack = () => {
        dispatch(setReduxModule('hub'));
    };

    return {
        currentApp,
        isLoaded: true,
        navigateTo,
        goBack
    };
};
