import React from 'react';
import { motion } from 'framer-motion';
import { tokens } from '../../style/tokens.shared.style';
import {
    getContainerStyle, spinnerContainer,
    getSpinnerRing, getSpinnerCore, labelStyle
} from './AsyncLoaderAtom.web.styles';

export const AsyncLoaderAtom: React.FC<{ color?: string, label?: string }> = ({ 
    color = tokens.colors.accentPurple, 
    label = "Sincronizando Módulo..." 
}) => (
    <div style={getContainerStyle(tokens.blur.strong)}>
        <div style={spinnerContainer}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                style={getSpinnerRing(color)}
            />
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                style={getSpinnerCore(color)}
            />
        </div>
        
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={labelStyle}
        >
            {label}
        </motion.div>
    </div>
);
