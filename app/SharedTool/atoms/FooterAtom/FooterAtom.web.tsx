import React from 'react';
import { motion } from 'framer-motion';
import { footerStyles } from './FooterAtom.web.styles';

export const FooterAtom: React.FC = () => (
    <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 1 }}
        style={footerStyles.copyright}
    >
        Desarrollado por Vianko Systems © 2026
    </motion.div>
);
