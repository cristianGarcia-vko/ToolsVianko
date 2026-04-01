import { StudioProject, BannerDesign } from './types';

export interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    activeBanner: BannerDesign | null;
    projectName: string;
    project: StudioProject;
}
