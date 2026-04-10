import React, { memo } from 'react';
import { useMonitorPanelLogic } from './MonitorPanel.logic';
import { styles } from './MonitorPanel.web.styles';
import type { MonitorPanelProps } from './MonitorPanel.types';

export const MonitorPanel: React.FC<MonitorPanelProps> = memo((props) => {
  const logic = useMonitorPanelLogic(props);

  return (
    <div style={styles.container}>
      <div>
        <h3 style={styles.title}>Panel de Monitoreo Proactivo</h3>
        <p style={styles.subtitle}>
          Consume el listado de endpoints detectados por K6StressTool y los ejecuta contra el backend de monitoreo.
        </p>
      </div>

      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Configuracion general</h4>
        <input
          type="text"
          placeholder="Nombre del proyecto"
          value={logic.projectName}
          onChange={(event) => logic.handleProjectNameChange(event.target.value)}
          style={styles.input}
        />
        <div style={styles.configGrid}>
          <input
            type="text"
            placeholder="URL base general. Ej: https://api.midominio.com"
            value={logic.sharedBaseUrl}
            onChange={(event) => logic.handleSharedBaseUrlChange(event.target.value)}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Token general"
            value={logic.sharedToken}
            onChange={(event) => logic.handleSharedTokenChange(event.target.value)}
            style={styles.input}
          />
        </div>
        <span style={styles.helperMuted}>
          Si un endpoint tiene solo ruta o no tiene token individual, este panel usara la URL base y el token general automaticamente.
        </span>
        <div style={styles.inlineActionsRow}>
          <button onClick={logic.applySharedConfigToEndpoints} style={styles.buttonPrimary} type="button">
            Aplicar datos comunes a todos
          </button>
        </div>
        {logic.importedCount > 0 && (
          <span style={styles.helper}>{logic.importedCount} endpoints fueron precargados desde el analisis actual.</span>
        )}
      </div>

      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Endpoints a monitorear</h4>
        {logic.endpoints.map((endpoint) => (
          <div key={endpoint.id} style={styles.section}>
            <div style={styles.row}>
              <select
                value={endpoint.method}
                onChange={(event) => logic.updateEndpoint(endpoint.id, 'method', event.target.value)}
                style={styles.select}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>

              <input
                type="text"
                placeholder="URL completa o ruta. Ej: /health"
                value={endpoint.url}
                onChange={(event) => logic.updateEndpoint(endpoint.id, 'url', event.target.value)}
                style={styles.input}
              />

              <input
                type="text"
                placeholder="Token individual opcional"
                value={endpoint.token || ''}
                onChange={(event) => logic.updateEndpoint(endpoint.id, 'token', event.target.value)}
                style={styles.input}
              />

              <input
                type="text"
                value={endpoint.source === 'k6-discovery' ? 'K6 discovery' : 'Manual'}
                readOnly
                style={styles.input}
              />

              <button onClick={() => logic.removeEndpoint(endpoint.id)} style={styles.buttonDanger} type="button">
                X
              </button>
            </div>

            <textarea
              placeholder="Payload JSON opcional"
              value={endpoint.payloadText || ''}
              onChange={(event) => logic.updateEndpoint(endpoint.id, 'payloadText', event.target.value)}
              style={styles.textarea}
              spellCheck={false}
            />
          </div>
        ))}

        <button onClick={logic.addEmptyEndpoint} style={styles.buttonPrimary} type="button">
          + Agregar endpoint
        </button>
      </div>

      <div style={styles.actionsRow}>
        <button onClick={logic.startMonitoring} disabled={logic.isRunning} style={styles.buttonPrimary} type="button">
          {logic.isRunning ? 'Evaluando...' : 'Iniciar monitoreo'}
        </button>

        {logic.results && (
          <button onClick={logic.saveReport} style={styles.buttonSuccess} type="button">
            Guardar registro
          </button>
        )}
      </div>

      {logic.results && (
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Resultados del analisis</h4>
          {logic.results.map((result, index) => (
            <div key={`${result.method}-${result.url}-${index}`} style={styles.resultItem}>
              <span>
                <strong>{result.method}</strong> {result.url}
              </span>
              <span>{result.latency}ms</span>
              <span style={result.ok ? styles.statusOk : styles.statusError}>
                {result.status} {result.error ? `(${result.error})` : ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
