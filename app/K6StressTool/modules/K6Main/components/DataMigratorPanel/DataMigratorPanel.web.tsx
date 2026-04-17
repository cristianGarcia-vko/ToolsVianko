import React, { memo } from 'react';
import { dataMigratorStyles as styles } from './DataMigratorPanel.web.styles';
import { useDataMigratorPanelLogic } from './DataMigratorPanel.logic';

export const DataMigratorPanel: React.FC = memo(() => {
  const logic = useDataMigratorPanelLogic();
  const isBusy = logic.busy !== 'idle';

  return (
    <div style={styles.root}>
      <p style={styles.helper}>
        Traductor universal para CSV, XML, JSON o SQL Inserts con salida SQL/JSON/CSV y soporte opcional de plantilla `schema.prisma`.
      </p>

      <div style={styles.section}>
        <div style={styles.row}>
          <div>
            <div style={styles.label}>Archivo origen</div>
            <input
              type="file"
              style={styles.input}
              onChange={(event) => logic.handleSourceFileChange(event.target.files?.[0] || null)}
              accept=".csv,.xml,.json,.sql"
            />
          </div>
          <div>
            <div style={styles.label}>Schema Prisma (opcional)</div>
            <input
              type="file"
              style={styles.input}
              onChange={(event) => logic.handleSchemaFileChange(event.target.files?.[0] || null)}
              accept=".prisma"
            />
          </div>
        </div>
        <div style={styles.buttonRow}>
          <button type="button" disabled={!logic.canAnalyze} style={styles.buttonPrimary} onClick={logic.analyze}>
            {logic.busy === 'analyzing' ? 'Analizando...' : 'Analizar estructura'}
          </button>
          {logic.analysis ? <span style={styles.statusOk}>Formato detectado: {logic.analysis.detection.format}</span> : null}
        </div>
      </div>

      {logic.analysis ? (
        <div style={styles.section}>
          <div style={styles.label}>Columnas detectadas ({logic.analysis.columns.length})</div>
          <div style={styles.chips}>
            {logic.previewColumns.map((column) => (
              <span key={column} style={styles.chip}>
                {column}
              </span>
            ))}
          </div>
          <p style={styles.helper}>
            Filas detectadas: <strong>{logic.analysis.rowCount}</strong> | Confianza: <strong>{logic.analysis.detection.confidence}</strong>
          </p>
          {logic.analysis.prismaTemplate ? (
            <p style={styles.helper}>
              Plantilla Prisma sugerida: <strong>{logic.analysis.prismaTemplate.modelName}</strong> (match {(logic.analysis.prismaTemplate.score * 100).toFixed(0)}%)
            </p>
          ) : null}
        </div>
      ) : null}

      <div style={styles.section}>
        <div style={styles.label}>MappingConfig (editable)</div>
        <textarea
          style={styles.textarea}
          value={logic.mappingText}
          onChange={(event) => logic.setMappingText(event.target.value)}
          spellCheck={false}
        />
      </div>

      <div style={styles.section}>
        <div style={styles.label}>Salida</div>
        <select
          style={styles.input}
          value={logic.outputFormat}
          onChange={(event) => logic.setOutputFormat(event.target.value as any)}
        >
          {logic.outputFormatOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div style={styles.buttonRow}>
          <button type="button" disabled={!logic.canConvert} style={styles.buttonPrimary} onClick={logic.convert}>
            {logic.busy === 'converting' ? 'Convirtiendo...' : 'Convertir'}
          </button>
          <button
            type="button"
            disabled={!logic.outputText || isBusy}
            style={styles.buttonSecondary}
            onClick={logic.downloadOutput}
          >
            Descargar salida
          </button>
        </div>
        {logic.error ? <span style={styles.statusError}>{logic.error}</span> : null}
      </div>

      {logic.outputText ? (
        <div style={styles.section}>
          <div style={styles.label}>Vista previa de salida ({logic.outputFileName})</div>
          <textarea style={styles.textarea} value={logic.outputText} readOnly />
        </div>
      ) : null}
    </div>
  );
});
