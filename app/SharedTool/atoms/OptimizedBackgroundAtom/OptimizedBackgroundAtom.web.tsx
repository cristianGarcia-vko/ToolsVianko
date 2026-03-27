import React from 'react';
import { optimizedStyles } from './OptimizedBackgroundAtom.web.styles';

export const OptimizedBackgroundAtom: React.FC = () => (
    <div style={optimizedStyles.overlay}>
        <div style={optimizedStyles.ribbonLeft} />
        <div style={optimizedStyles.ribbonRight} />
    </div>
);
