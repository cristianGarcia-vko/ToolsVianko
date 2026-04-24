import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    PenTool, Activity, Shield, Sparkles, Zap, 
    MousePointer2, Layout, Timer, Gauge, Palette, Database
} from 'lucide-react';
import { hubStyles } from './HubModule.web.styles';
import { useHubLogic } from './HubModule.web.logics';
import { ModuleCardAtom } from '../../atoms/ModuleCardAtom/ModuleCardAtom.web';
import { ModuleContainerAtom } from '../../atoms/ModuleContainerAtom/ModuleContainerAtom.web';
import { OptimizedBackgroundAtom } from '../../atoms/OptimizedBackgroundAtom/OptimizedBackgroundAtom.web';
import { LogoAtom } from '../../atoms/LogoAtom/LogoAtom.web';
import { FooterAtom } from '../../atoms/FooterAtom/FooterAtom.web';
import { tokens } from '../../style/tokens.shared.style';
import { AsyncLoaderAtom } from '../../atoms/AsyncLoaderAtom/AsyncLoaderAtom.web';
import { ToolLogoAtom } from '../../atoms/ToolLogoAtom/ToolLogoAtom.web';

// --- LAZY-LOADED MODULES (OPTIMIZED BUNDLING) ---
const K6Main = React.lazy(() => import('../../../K6StressTool/modules/K6Main/K6Main.web'));
const BannerStudio = React.lazy(() => import('../../../BannerStudioTool/modules/BannerStudio/BannerStudio.web'));
const SQLGeneratorMain = React.lazy(() => import('../../../SQLGeneratorTool/modules/SQLGeneratorMain/SQLGeneratorMain.web'));

const silkTransition: any = {
    duration: 0.4,
    ease: [0.19, 1, 0.22, 1],
};

export const HubModule: React.FC = () => {
    const { currentApp, navigateTo, goBack } = useHubLogic();

    return (
        <div style={{ ...hubStyles.screen, overflowY: 'auto', background: tokens.colors.bg }}>
            {/* Native Window Dragging Support */}
            <div style={hubStyles.dragRegion} />

            <style dangerouslySetInnerHTML={{
                __html: `
                /* Inter Font is assumed to be loaded via <link> for performance. 
                   If not, consider using expo-font or a non-blocking method. */
                
                * { box-sizing: border-box; }
                
                body, html, #root { 
                    margin: 0; padding: 0; 
                    background: ${tokens.colors.bg}; 
                    min-height: 100vh;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                }
                
                /* Scrollbars (premium + subtle) */
                ::-webkit-scrollbar { width: 10px; height: 10px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { 
                    background: rgba(255,255,255,0.14); 
                    border-radius: 999px; 
                    border: 3px solid transparent;
                    background-clip: content-box;
                }
                ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.20); background-clip: content-box; }
                * { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.18) transparent; }
                
                /* Utility: hide scrollbars for specific containers */
                .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
                .no-scrollbar::-webkit-scrollbar { width: 0 !important; height: 0 !important; }
            `}} />

            <StatusBar style="light" />

            <AnimatePresence mode="wait">
                {currentApp === 'home' && (
                    <motion.div
                        key="hub-home"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={silkTransition}
                        style={{ ...hubStyles.hubContent, willChange: 'transform, opacity' }}
                    >
                        <OptimizedBackgroundAtom />

                        <LogoAtom />

                        <div style={hubStyles.cardList}>
                            <ModuleCardAtom
                                title="Banner Designer"
                                desc="Orquestador avanzado para la orquestación visual de activos multimedia globales."
                                icon={<ToolLogoAtom variant="bannerDesigner" size={42} />}
                                accent={tokens.colors.accentGreen}
                                delay={0.2}
                                onClick={() => navigateTo('banner')}
                                onMouseEnter={() => import('../../../BannerStudioTool/modules/BannerStudio/BannerStudio.web')}
                            />

                             {/* MODULO 2: OVERDRIVE STRESS (BLUE) */}
                            <ModuleCardAtom
                                title="Overdrive Stress"
                                desc="Sistema de telemetría masiva y auditoría de resiliencia para infraestructuras críticas."
                                icon={<ToolLogoAtom variant="overdriveStress" size={42} />}
                                accent={tokens.colors.accentBlue}
                                delay={0.3}
                                onClick={() => navigateTo('k6')}
                                onMouseEnter={() => import('../../../K6StressTool/modules/K6Main/K6Main.web')}
                            />
                        </div>

                        <FooterAtom />
                    </motion.div>
                )}

                {currentApp === 'banner' && (
                    <ModuleContainerAtom title="Banner Designer PRO" color={tokens.colors.accentGreen} onBack={goBack} logo={<ToolLogoAtom variant="bannerDesigner" size={20} />}>
                        <React.Suspense fallback={<AsyncLoaderAtom color={tokens.colors.accentGreen} label="Sincronizando Estudio..." />}>
                            <BannerStudio />
                        </React.Suspense>
                    </ModuleContainerAtom>
                )}

                {currentApp === 'k6' && (
                    <ModuleContainerAtom title="Overdrive Analytics" color={tokens.colors.accentBlue} onBack={goBack} logo={<ToolLogoAtom variant="overdriveStress" size={20} />}>
                        <React.Suspense fallback={<AsyncLoaderAtom color={tokens.colors.accentBlue} label="Sintonizando Telemetría..." />}>
                            <K6Main />
                        </React.Suspense>
                    </ModuleContainerAtom>
                )}

                {currentApp === 'sql' && (
                    <ModuleContainerAtom title="SQL Seed Generator" color={tokens.colors.accentOrange} onBack={goBack} logo={<Database size={18} color={tokens.colors.accentOrange} />}>
                        <React.Suspense fallback={<AsyncLoaderAtom color={tokens.colors.accentOrange} label="Preparando generador..." />}>
                            <SQLGeneratorMain />
                        </React.Suspense>
                    </ModuleContainerAtom>
                )}
            </AnimatePresence>
        </div>
    );
};
