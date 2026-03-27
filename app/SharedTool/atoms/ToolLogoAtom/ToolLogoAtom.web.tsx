import React from 'react';
import { toolLogoStyles } from './ToolLogoAtom.web.styles';

import bannerDesignerLogo from '../../../../assets/Designer.png';
import overdriveStressLogo from '../../../../assets/Stress.png';

export type ToolLogoVariant = 'bannerDesigner' | 'overdriveStress';

interface ToolLogoProps {
    variant: ToolLogoVariant;
    size?: number;
}

const logoByVariant: Record<ToolLogoVariant, string> = {
    bannerDesigner: bannerDesignerLogo,
    overdriveStress: overdriveStressLogo,
};

export const ToolLogoAtom: React.FC<ToolLogoProps> = ({ variant, size = 56 }) => (
    <div style={toolLogoStyles.frame(size)}>
        <img
            src={logoByVariant[variant]}
            alt={variant === 'bannerDesigner' ? 'Banner Designer' : 'Overdrive Stress'}
            style={toolLogoStyles.img}
            draggable={false}
        />
    </div>
);
