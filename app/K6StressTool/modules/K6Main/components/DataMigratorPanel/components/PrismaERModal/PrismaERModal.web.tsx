import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, X, Maximize2, Minimize2 } from 'lucide-react';
import { PrismaERDiagram } from '../PrismaERDiagram/PrismaERDiagram.web';
import type { DataMigratorPrismaModelPrediction } from '../../DataMigratorPanel.types';
import { k6Styles as styles } from '../../../../K6Main.web.styles';
import { tokens } from '../../../../../../../SharedTool/style/tokens.shared.style';

interface PrismaERModalProps {
  isOpen: boolean;
  onClose: () => void;
  models: DataMigratorPrismaModelPrediction[];
}

export const PrismaERModal: React.FC<PrismaERModalProps> = memo(({ isOpen, onClose, models }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          style={styles.guideOverlay} 
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              ...styles.guideModal,
              width: '95vw',
              maxWidth: '1400px',
              height: '90vh',
              padding: '0',
              display: 'flex',
              flexDirection: 'column',
              background: '#080d14',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.02)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  background: tokens.colors.accentBlue + '22',
                  color: tokens.colors.accentBlue,
                  padding: '8px',
                  borderRadius: '10px',
                  display: 'flex',
                }}>
                  <Database size={20} />
                </div>
                <div>
                  <h2 style={{ ...styles.guideTitle, margin: 0 }}>Modelo Entidad-Relación (Prisma)</h2>
                  <p style={{ ...styles.guideSummary, margin: 0 }}>Visualización gráfica de tablas y relaciones detectadas en el esquema.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  type="button" 
                  onClick={onClose} 
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    color: 'white',
                    padding: '8px',
                    cursor: 'pointer',
                  }}
                  aria-label="Cerrar"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', padding: '12px' }}>
              <PrismaERDiagram models={models} />
            </div>

            <div style={{
              padding: '12px 24px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.01)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: tokens.colors.accentOrange }} />
                  <span>Primary Key</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: tokens.colors.accentTeal }} />
                  <span>Foreign Key</span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={onClose} 
                style={{
                  background: tokens.colors.accentBlue,
                  color: '#000',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 20px',
                  fontSize: '11px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Cerrar Diagrama
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

PrismaERModal.displayName = 'PrismaERModal';
