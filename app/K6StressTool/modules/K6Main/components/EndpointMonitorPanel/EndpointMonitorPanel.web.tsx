import React, { memo } from 'react';
import { Activity, Plus, Radar, Siren, Wand2 } from 'lucide-react';
import { endpointMonitorStyles as styles } from './EndpointMonitorPanel.web.styles';
import { useEndpointMonitorPanelLogic } from './EndpointMonitorPanel.logic';
import type { EndpointMonitorMethod, EndpointMonitorSourceEndpoint } from './EndpointMonitorPanel.types';

type EndpointMonitorPanelProps = {
  sourceEndpoints?: EndpointMonitorSourceEndpoint[];
  baseUrl: string;
  authToken?: string;
};

const STATUS_LABELS = {
  pending: 'Pendiente',
  ok: 'En linea',
  error: 'Anomalia',
} as const;

export const EndpointMonitorPanel: React.FC<EndpointMonitorPanelProps> = memo(
  ({ sourceEndpoints, baseUrl, authToken }) => {
    const {
      draft,
      items,
      alerts,
      formError,
      importCandidates,
      handleDraftChange,
      handleSubmit,
      removeEndpoint,
      applyCandidateToDraft,
      importAllCandidates,
    } = useEndpointMonitorPanelLogic({
      sourceEndpoints,
      baseUrl,
      authToken,
    });

    return (
      <section style={styles.card}>
        <div style={styles.topRow}>
          <div style={styles.titleWrap}>
            <h3 style={styles.title}>Endpoint Monitor</h3>
            <p style={styles.subtitle}>
              Traduce endpoints descubiertos por K6Stress a un monitor activo reutilizable en React + TypeScript.
            </p>
          </div>

          {importCandidates.length > 0 && (
            <div style={styles.importBadge}>{importCandidates.length} endpoints detectados listos para traducir</div>
          )}
        </div>

        <div style={styles.layout}>
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>
              <Plus size={14} /> Alta manual o precargada
            </h4>

            <form onSubmit={handleSubmit}>
              <div style={styles.fieldGrid}>
                <div>
                  <label style={styles.fieldLabel}>URL del endpoint</label>
                  <input
                    style={styles.input}
                    value={draft.url}
                    onChange={(event) => handleDraftChange('url', event.target.value)}
                    placeholder={`${baseUrl || 'https://api.example.com'}/health`}
                  />
                </div>

                <div>
                  <label style={styles.fieldLabel}>Metodo</label>
                  <select
                    style={styles.input}
                    value={draft.method}
                    onChange={(event) => handleDraftChange('method', event.target.value as EndpointMonitorMethod)}
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
              </div>

              <div style={styles.fieldGrid}>
                <div>
                  <label style={styles.fieldLabel}>Tiempo maximo esperado (ms)</label>
                  <input
                    style={styles.input}
                    type="number"
                    value={draft.maxTime}
                    onChange={(event) => handleDraftChange('maxTime', Number(event.target.value))}
                  />
                </div>

                <div>
                  <label style={styles.fieldLabel}>Intervalo (s)</label>
                  <input
                    style={styles.input}
                    type="number"
                    value={draft.intervalSeconds}
                    onChange={(event) => handleDraftChange('intervalSeconds', Number(event.target.value))}
                  />
                </div>
              </div>

              <div>
                <label style={styles.fieldLabel}>Headers JSON</label>
                <textarea
                  style={styles.textarea}
                  value={draft.headersText}
                  onChange={(event) => handleDraftChange('headersText', event.target.value)}
                  spellCheck={false}
                  placeholder='{"Authorization":"Bearer token","Content-Type":"application/json"}'
                />
              </div>

              <div>
                <label style={styles.fieldLabel}>Payload JSON opcional</label>
                <textarea
                  style={styles.textarea}
                  value={draft.payloadText}
                  onChange={(event) => handleDraftChange('payloadText', event.target.value)}
                  spellCheck={false}
                  placeholder='{"limit":25}'
                />
              </div>

              <div style={styles.actionRow}>
                <button type="submit" style={styles.primaryButton}>
                  Agregar al monitor
                </button>

                {importCandidates.length > 0 && (
                  <button type="button" style={styles.secondaryButton} onClick={importAllCandidates}>
                    Importar detectados
                  </button>
                )}
              </div>
            </form>

            {formError && <p style={styles.errorText}>{formError}</p>}

            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>
                <Wand2 size={14} /> Traduccion desde auto-discovery
              </h4>

              {importCandidates.length === 0 ? (
                <p style={styles.emptyState}>
                  Cuando analices un ZIP, los endpoints detectados apareceran aqui para cargarlos al input o importarlos.
                </p>
              ) : (
                <div style={styles.candidateList}>
                  {importCandidates.map((candidate) => (
                    <div key={candidate.id} style={styles.candidateRow}>
                      <div style={styles.candidateLabel}>
                        <span style={styles.candidateTitle}>{candidate.label}</span>
                        <span style={styles.candidateMeta}>{candidate.url}</span>
                      </div>

                      <button
                        type="button"
                        style={styles.miniButton}
                        onClick={() => applyCandidateToDraft(candidate)}
                      >
                        Cargar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>
              <Activity size={14} /> Estado en tiempo real
            </h4>

            {items.length === 0 ? (
              <p style={styles.emptyState}>
                Aun no hay endpoints monitoreados. Puedes agregarlos manualmente o importar los que detecte K6Stress.
              </p>
            ) : (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Metodo</th>
                      <th style={styles.th}>URL</th>
                      <th style={styles.th}>Ultima revision</th>
                      <th style={styles.th}>Latencia</th>
                      <th style={styles.th}>Estado</th>
                      <th style={styles.th}>Origen</th>
                      <th style={styles.th}>Accion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td style={styles.td}>
                          <strong>{item.method}</strong>
                        </td>
                        <td style={{ ...styles.td, ...styles.urlCell }} title={item.url}>
                          {item.url}
                        </td>
                        <td style={styles.td}>{item.lastCheckLabel}</td>
                        <td style={styles.td}>{item.latencyMs == null ? '-' : `${item.latencyMs} ms`}</td>
                        <td style={styles.td}>
                          <span style={styles.statusBadge(item.status)}>{STATUS_LABELS[item.status]}</span>
                        </td>
                        <td style={styles.td}>{item.source === 'manual' ? 'Manual' : 'K6 discovery'}</td>
                        <td style={styles.td}>
                          <button type="button" style={styles.miniButton} onClick={() => removeEndpoint(item.id)}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>
                <Siren size={14} /> Registro de anomalias
              </h4>

              {alerts.length === 0 ? (
                <p style={styles.emptyState}>Las alertas apareceran aqui cuando falle el endpoint o supere la latencia permitida.</p>
              ) : (
                <div style={styles.alertsPanel}>
                  {alerts.map((alert) => (
                    <div key={alert.id} style={styles.alertItem}>
                      <Radar size={12} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                      {alert.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  },
);
