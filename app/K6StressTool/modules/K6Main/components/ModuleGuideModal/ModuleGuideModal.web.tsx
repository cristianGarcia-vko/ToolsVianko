import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleHelp, X } from 'lucide-react';
import { ModuleGuide } from '../../K6Main.guides';
import { k6Styles as styles } from '../../K6Main.web.styles';

interface ModuleGuideModalProps {
    guide: ModuleGuide | null;
    onClose: () => void;
}

export const ModuleGuideModal: React.FC<ModuleGuideModalProps> = memo(({ guide, onClose }) => {
    return (
        <AnimatePresence>
            {guide && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={styles.guideOverlay} onClick={onClose}>
                    <motion.div
                        initial={{ y: 16, opacity: 0, scale: 0.98 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 16, opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        style={styles.guideModal}
                        onClick={(event) => event.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                    >
                        <div style={styles.guideHeader}>
                            <div>
                                <div style={styles.guideBadge}>
                                    <CircleHelp size={13} />
                                    {guide.badge}
                                </div>
                                <h2 style={styles.guideTitle}>{guide.title}</h2>
                                <p style={styles.guideSummary}>{guide.summary}</p>
                            </div>

                            <button type="button" onClick={onClose} style={styles.guideCloseButton} aria-label="Cerrar ayuda">
                                <X size={18} />
                            </button>
                        </div>

                        <div style={styles.guideContent}>
                            {guide.sections.map((section) => (
                                <section key={section.title} style={styles.guideSection}>
                                    <h3 style={styles.guideSectionTitle}>{section.title}</h3>
                                    <div style={styles.guideBulletList}>
                                        {section.items.map((item) => (
                                            <div key={item} style={styles.guideBulletItem}>
                                                <span style={styles.guideBulletDot} />
                                                <span>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            ))}

                            {guide.exampleCode && (
                                <section style={styles.guideSection}>
                                    <h3 style={styles.guideSectionTitle}>{guide.exampleTitle || 'Ejemplo'}</h3>
                                    <pre style={styles.guideExample}>{guide.exampleCode}</pre>
                                </section>
                            )}

                            {guide.note && <div style={styles.guideNote}>{guide.note}</div>}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
});
