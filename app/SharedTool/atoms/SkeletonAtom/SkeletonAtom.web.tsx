import React from 'react';
import { motion } from 'framer-motion';
import { getSkeletonStyle } from './SkeletonAtom.web.styles';

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    radius?: string | number;
    style?: React.CSSProperties;
}

export const SkeletonAtom: React.FC<SkeletonProps> = ({ 
    width = '100%', 
    height = '20px', 
    radius = '8px',
    style 
}) => (
    <motion.div
        animate={{ opacity: [0.05, 0.12, 0.05] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={getSkeletonStyle(width, height, radius, style)}
    />
);
