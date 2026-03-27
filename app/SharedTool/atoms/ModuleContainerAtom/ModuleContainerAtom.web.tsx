import React from 'react';
import { motion } from 'framer-motion';
import { Home, ChevronLeft } from 'lucide-react';
import { hubStyles } from '../../modules/HubModule/HubModule.web.styles';
import { containerStyles } from './ModuleContainerAtom.web.styles';

interface ModuleContainerProps {
    children: React.ReactNode;
    onBack: () => void;
    title: string;
    color: string;
    logo?: React.ReactNode;
}

// Cubic bezier for silk-smooth premium motion
const transition = {
    duration: 0.5,
    ease: [0.19, 1, 0.22, 1],
};

export const ModuleContainerAtom: React.FC<ModuleContainerProps> = ({ 
    children, 
    onBack, 
    title, 
    color,
    logo,
}) => (
    <motion.div 
        initial={{ opacity: 0, scale: 1.02, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: -10 }}
        transition={transition}
        style={containerStyles.overlay}
    >
        <div style={containerStyles.header}>
            <div style={hubStyles.moduleHeaderLeft}>
                <motion.button 
                    whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.1)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onBack} 
                    style={containerStyles.backButton}
                >
                    <ChevronLeft size={16} /> Volver al Hub
                </motion.button>
                <div style={hubStyles.divider} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {logo}
                    <span style={{ ...containerStyles.title, color }}>{title}</span>
                </div>
            </div>
            <div style={containerStyles.meta}>
                Vianko Elite Tools // Optimized Stack
            </div>
        </div>
        <div style={containerStyles.body}>{children}</div>
    </motion.div>
);


