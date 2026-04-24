import React, { memo } from 'react';
import { Database, FileUp, Wand2 } from 'lucide-react';
import { tokens } from '../../../SharedTool/style/tokens.shared.style';
import { sqlStyles } from './SQLGeneratorMain.web.styles';
import { useSQLGeneratorMainLogic } from './SQLGeneratorMain.web.logics';

const ACCENT = tokens.colors.accentOrange;
const K6_API_BASE_URL =
  process.env.EXPO_PUBLIC_K6_API_BASE_URL ||
  'http://localhost:4001';

const SQLGeneratorMainModule: React.FC = memo(() => {
  const logic = useSQLGeneratorMainLogic();
  const {
    schemaFile,
    setSchemaFile,
    modelEntries,
    counts,
    startIds,
    loading,
    error,
    hasModels,
    handleAnalyzeSchema,
    handleGenerateSQL,
    updateCount,
    updateStartId,
    models,
  } = logic;

  return (
    <div style={sqlStyles.container}>
      <div style={sqlStyles.header}>
        <h2 style={sqlStyles.title}>Prisma to SQL Seed</h2>
        <p style={sqlStyles.subtitle}>
          Sube tu <strong>schema.prisma</strong>, define ID inicial y cantidad por modelo, y descarga un archivo SQL listo para pgAdmin.
        </p>
      </div>

      <div style={sqlStyles.card}>
        <div style={sqlStyles.row}>
          <span style={sqlStyles.badge(ACCENT)}>
            <FileUp size={16} /> 1. Subir schema.prisma
          </span>
          <span style={{ ...sqlStyles.hint, marginLeft: 'auto' }}>
            Backend: <strong>{K6_API_BASE_URL}</strong>
          </span>
        </div>

        <div style={{ marginTop: 12 }}>
          <input
            type="file"
            accept=".prisma"
            style={sqlStyles.fileInput}
            onChange={(e) => setSchemaFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div style={{ ...sqlStyles.row, marginTop: 12 }}>
          <button
            style={sqlStyles.button(ACCENT, loading || !schemaFile)}
            disabled={loading || !schemaFile}
            onClick={handleAnalyzeSchema}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Database size={14} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            ANALIZAR SCHEMA
          </button>

          {schemaFile && (
            <span style={sqlStyles.hint}>
              Archivo: <strong>{schemaFile.name}</strong>
            </span>
          )}
        </div>

        {error && <div style={sqlStyles.error}>{error}</div>}
      </div>

      {hasModels && (
        <div style={sqlStyles.card}>
          <div style={sqlStyles.row}>
            <span style={sqlStyles.badge(ACCENT)}>
              <Wand2 size={16} /> 2. Configurar volumen
            </span>
            <span style={sqlStyles.hint}>
              Tip: ajusta <strong>ID Inicial</strong> si ya existen datos para evitar conflictos de PK.
            </span>
          </div>

          <div style={sqlStyles.modelList}>
            {modelEntries.map(([modelName, modelPayload]) => {
              const fields = Array.isArray(modelPayload)
                ? modelPayload
                : (modelPayload?.fields || []);
              const tableName = Array.isArray(modelPayload)
                ? modelName
                : (modelPayload?.tableName || modelName);

              const relations = (fields || [])
                .filter((f) => Boolean((models as any)?.[f.type]))
                .map((f) => f.type);

              return (
                <div key={modelName} style={sqlStyles.modelRow}>
                  <div style={{ minWidth: 260 }}>
                    <p style={sqlStyles.modelName}>{modelName}</p>
                    <div style={sqlStyles.modelMeta}>
                      <div>
                        Tabla: <strong>{tableName}</strong>
                      </div>
                      {relations.length > 0 ? (
                        <span>
                          Relacionado con: <strong>{relations.join(', ')}</strong>
                        </span>
                      ) : (
                        <span>Independiente</span>
                      )}
                    </div>
                  </div>

                  <div style={sqlStyles.inputs}>
                    <div style={sqlStyles.inputBox}>
                      <span style={sqlStyles.label}>ID Inicial</span>
                      <input
                        type="number"
                        min={1}
                        value={startIds[modelName] ?? 1}
                        style={sqlStyles.number}
                        onChange={(e) => updateStartId(modelName, parseInt(e.target.value, 10))}
                      />
                    </div>

                    <div style={sqlStyles.inputBox}>
                      <span style={sqlStyles.label}>Cantidad</span>
                      <input
                        type="number"
                        min={0}
                        value={counts[modelName] ?? 0}
                        style={sqlStyles.number}
                        onChange={(e) => updateCount(modelName, parseInt(e.target.value, 10))}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ ...sqlStyles.row, marginTop: 14 }}>
            <button
              style={sqlStyles.button(ACCENT, loading)}
              disabled={loading}
              onClick={handleGenerateSQL}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Wand2 size={14} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              GENERAR Y DESCARGAR .SQL
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default SQLGeneratorMainModule;
