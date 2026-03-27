import React from 'react';
import { nebulaStyles } from './NebulaBackgroundAtom.web.styles';

export const NebulaBackgroundAtom: React.FC = () => (
    <div style={nebulaStyles.overlay}>
        <div style={nebulaStyles.focalCenter} />
        
        {/* Static Atmospheric Glows */}
        <div style={nebulaStyles.orangeSpot} />
        <div style={nebulaStyles.purpleSpot} />

        {/* Static Structural V-Frame */}
        <div style={nebulaStyles.leftRibbon} />
        <div style={nebulaStyles.rightRibbon} />
    </div>
);
