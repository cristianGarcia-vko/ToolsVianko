import React, { memo } from 'react';
import { DatabaseZap, Link2, Sparkles } from 'lucide-react';
import { tokens } from '../../../../../SharedTool/style/tokens.shared.style';
import { k6Styles as styles } from '../../K6Main.web.styles';

type EndpointDiscoveryPanelProps = {
  loading: boolean;
  zipFile: File | null;
  handleZipUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleAnalyze: () => void;
  handleApplyZipEndpointsToPlan: () => void;
  analysisResult: any;
};

export const EndpointDiscoveryPanel: React.FC<EndpointDiscoveryPanelProps> = memo(
  ({ loading, zipFile, handleZipUpload, handleAnalyze, handleApplyZipEndpointsToPlan, analysisResult }) => {
    const detectedCount = Array.isArray(analysisResult?.endpoints) ? analysisResult.endpoints.length : 0;

    return (
      <section style={styles.discoveryCard}>
        <div style={styles.discoveryHeader}>
          <div>
            <div style={styles.discoveryEyebrow}>
              <DatabaseZap size={12} />
              Endpoint Discovery Hub
            </div>
            <h3 style={styles.discoveryTitle}>Descubridor central de endpoints</h3>
            <p style={styles.discoverySubtitle}>
              Este modulo alimenta al plan K6, al monitor proactivo y al analisis QA. La salida queda disponible para toda herramienta conectada.
            </p>
          </div>

          <div style={styles.discoveryBadge}>
            <Link2 size={12} />
            Fuente compartida
          </div>
        </div>

        <div style={styles.discoveryGrid}>
          <div style={styles.discoveryUploadBox}>
            <span style={styles.inputLabel}>ZIP DEL SERVIDOR</span>
            <input
              type="file"
              onChange={handleZipUpload}
              style={{ ...styles.input, fontSize: '10px', padding: '6px' }}
              accept=".zip"
            />

            {zipFile && <div style={styles.zipDiscoveryLabel}>Archivo listo: {zipFile.name}</div>}

            <div style={styles.zipActionRow}>
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading || !zipFile}
                style={{ ...styles.button(tokens.colors.accentTeal), flex: 1, height: '36px', fontSize: '10px' }}
              >
                Analizar ZIP
              </button>

              {analysisResult?.type === 'analysis' && (
                <button
                  type="button"
                  onClick={handleApplyZipEndpointsToPlan}
                  style={{ ...styles.button(tokens.colors.accentGreen), flex: 1, height: '36px', fontSize: '10px' }}
                >
                  Pasar a plan
                </button>
              )}
            </div>
          </div>

          <div style={styles.discoveryConsumerBox}>
            <div style={styles.discoveryConsumerHeader}>
              <span style={styles.inputLabel}>HERRAMIENTAS CONECTADAS</span>
              <span style={styles.discoveryCount}>{detectedCount} endpoints detectados</span>
            </div>

            <div style={styles.discoveryPillRow}>
              <span style={styles.discoveryPill(tokens.colors.accentTeal)}>Plan Runner</span>
              <span style={styles.discoveryPill(tokens.colors.accentGreen)}>Monitor Proactivo</span>
              <span style={styles.discoveryPill(tokens.colors.accentOrange)}>QA Analysis</span>
            </div>

            <div style={styles.discoveryTerminal}>
              {analysisResult?.type === 'analysis' && detectedCount > 0 ? (
                analysisResult.endpoints.slice(0, 8).map((endpoint: any, index: number) => (
                  <div key={`${endpoint.method}-${endpoint.route}-${index}`} style={styles.endpointFoundRow}>
                    <span style={{ fontWeight: 900 }}>[DISCOVERED]</span> {endpoint.method} {endpoint.route}
                  </div>
                ))
              ) : (
                <div style={styles.discoveryEmptyState}>
                  <Sparkles size={14} />
                  Cuando analices un ZIP, aqui veras la salida compartida que consumen los demas modulos.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  },
);
