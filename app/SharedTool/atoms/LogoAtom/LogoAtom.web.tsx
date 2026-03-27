import React from 'react';
import { motion } from 'framer-motion';
import { logoStyles } from './LogoAtom.web.styles';

export const LogoAtom: React.FC = () => (
    <div style={logoStyles.container}>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        >
            <h1 style={logoStyles.heroTitle}>
                Vianko Studio <br />
                <span style={logoStyles.creativeText}>Creative</span> <span style={logoStyles.automationText}>Automation</span>
            </h1>

            <p style={logoStyles.heroSub}>
                Sistema unificado para el diseño reactivo y auditoría masiva de resiliencia <br /> en infraestructuras críticas.
            </p>
        </motion.div>
    </div>
);
