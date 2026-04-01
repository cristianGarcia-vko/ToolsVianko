import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { setModule as setReduxModule, StudioModule } from '../../../store/slices/uiSlice';

export type AppState = 'home' | 'banner' | 'k6' | 'sql';

export const useHubLogic = () => {
    const dispatch = useDispatch();
    const activeReduxModule = useSelector((state: RootState) => state.ui.activeModule);

    const currentApp: AppState =
        activeReduxModule === 'hub'
            ? 'home'
            : activeReduxModule === 'banner-studio'
                ? 'banner'
                : activeReduxModule === 'k6-stress'
                    ? 'k6'
                    : 'sql';

    const navigateTo = (app: AppState) => {
        const next: StudioModule =
            app === 'home'
                ? 'hub'
                : app === 'banner'
                    ? 'banner-studio'
                    : app === 'k6'
                        ? 'k6-stress'
                        : 'sql-generator';
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
