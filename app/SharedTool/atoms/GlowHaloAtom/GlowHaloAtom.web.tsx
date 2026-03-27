import React from 'react';
import { motion } from 'framer-motion';
import { getHaloStyle } from './GlowHaloAtom.web.styles';

interface GlowHaloAtomProps {
    color: string;
    size: number;
    intensity: number;
    delay?: number;
}

export const GlowHaloAtom: React.FC<GlowHaloAtomProps> = ({ color, size, intensity, delay = 0 }) => (
    <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
            opacity: [0.1, 0.4, 0.1],
            scale: [0.9, 1.1, 0.9]
        }}
        transition={{ 
            duration: 6, 
            repeat: Infinity, 
            delay,
            ease: 'easeInOut' 
        }}
        style={getHaloStyle(size, color, intensity)}
    />
);
