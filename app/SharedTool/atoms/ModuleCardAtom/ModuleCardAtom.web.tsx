import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowUpRight } from 'lucide-react';
import { cardStyles } from './ModuleCardAtom.web.styles';
import { tokens } from '../../style/tokens.shared.style';

interface ModuleCardProps {
    title: string;
    desc: string;
    icon: React.ReactNode;
    accent: string;
    delay: number;
    onClick: () => void;
}

export const ModuleCardAtom: React.FC<ModuleCardProps> = ({ 
    title, 
    desc, 
    icon, 
    accent, 
    delay, 
    onClick 
}) => {
    return (
        <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            whileHover={{ y: -12, transition: { duration: 0.3 } }}
            onClick={onClick}
            style={cardStyles.card}
        >
            <div style={cardStyles.innerContent}>
                <div style={cardStyles.topRow}>
                    <div style={cardStyles.iconContainer}>
                        {icon}
                    </div>
                    <div style={cardStyles.arrowContainer}>
                        <ArrowUpRight size={20} opacity={0.3} />
                    </div>
                </div>

                <h3 style={cardStyles.title}>{title}</h3>
                <p style={cardStyles.desc}>{desc}</p>
                
                <div style={cardStyles.buttonArea}>
                    <motion.button 
                        whileHover={{ scale: 1.05, filter: 'brightness(1.1)' }}
                        whileTap={{ scale: 0.95 }}
                        style={cardStyles.getMainButton(accent)}
                    >
                        ABRIR MÓDULO <ChevronRight size={14} strokeWidth={3} />
                    </motion.button>
                    
                    <div style={cardStyles.secondaryAvatars}>
                        <div style={cardStyles.avatar} />
                        <div style={cardStyles.avatar} />
                    </div>
                </div>
            </div>

            {/* Inmersive Glow Corner - Sincronizado */}
            <div style={cardStyles.getGlowCorner(accent)} />
        </motion.div>
    );
};
