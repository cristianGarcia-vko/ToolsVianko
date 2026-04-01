import React, { Suspense, lazy, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, X, ArrowUpRight } from 'lucide-react';
import { tokens } from '../../../../../SharedTool/style/tokens.shared.style';
import { k6Styles as styles } from '../../K6Main.web.styles';
import { sqlSeedStyles } from './SQLSeedGeneratorPanel.web.styles';

const SQLGeneratorMain = lazy(() =>
  import('../../../../../SQLGeneratorTool/modules/SQLGeneratorMain/SQLGeneratorMain.web')
);

export const SQLSeedGeneratorPanel: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div style={styles.glassCard}>
        <div style={styles.chartTitle}>
          <Database size={14} /> SQL SEED GENERATOR
        </div>

        <p style={sqlSeedStyles.teaser}>
          Genera inserts SQL desde <strong>schema.prisma</strong> (IDs iniciales + volumen por modelo). Util para poblar
          data antes de pruebas de carga.
        </p>

        <button style={styles.button(tokens.colors.accentOrange)} onClick={() => setOpen(true)}>
          ABRIR GENERADOR <ArrowUpRight size={14} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            style={sqlSeedStyles.overlay}
          >
            <motion.div
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 18, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] }}
              style={sqlSeedStyles.container}
              role="dialog"
              aria-modal="true"
            >
              <header style={sqlSeedStyles.header}>
                <div style={sqlSeedStyles.titleRow}>
                  <h3 style={sqlSeedStyles.title}>SQL Seed Generator</h3>
                  <p style={sqlSeedStyles.subtitle}>Se integra al backend de Overdrive (puerto 3001).</p>
                </div>

                <button style={sqlSeedStyles.closeBtn} onClick={() => setOpen(false)} aria-label="Cerrar">
                  <X size={18} />
                </button>
              </header>

              <div style={sqlSeedStyles.body}>
                <Suspense fallback={<div style={{ padding: 18 }}>Cargando generador...</div>}>
                  <SQLGeneratorMain />
                </Suspense>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
