import React, { memo, useMemo } from 'react';
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { dataMigratorStyles as styles } from './DataMigratorPanel.web.styles';
import { useDataMigratorPanelLogic } from './DataMigratorPanel.logic';
import type { DataMigratorGraphNode } from './DataMigratorPanel.types';
import { PrismaERModal } from './components/PrismaERModal/PrismaERModal.web';
import { tokens } from '../../../../../SharedTool/style/tokens.shared.style';

type MappingNodeData = DataMigratorGraphNode & Record<string, unknown>;

const MappingNode = memo(({ data }: NodeProps<Node<MappingNodeData>>) => {
  const isSource = data.kind === 'source_field';
  const isTable = data.kind === 'target_table';

  return (
    <div style={data.selectedForConnection ? styles.graphNodeSelected : isSource ? styles.graphNodeSource : isTable ? styles.graphNodeTable : styles.graphNodeTarget}>
      {isSource ? <Handle type="source" position={Position.Right} /> : isTable ? null : <Handle type="target" position={Position.Left} />}
      <div style={styles.graphNodeKind}>{isSource ? 'Origen' : isTable ? 'Tabla Prisma' : data.table || 'Destino'}</div>
      <div style={styles.graphNodeLabel}>{data.label}</div>
      <div style={styles.graphNodeMeta}>
        {isTable ? `${data.selectedCount || 0} columnas seleccionadas - ${data.expanded ? 'abierta' : 'click para abrir'}` : (data.dataType || 'tipo desconocido')}
        {data.required ? ' · requerido' : ''}
      </div>
    </div>
  );
});

MappingNode.displayName = 'MappingNode';

const nodeTypes = { mappingField: MappingNode };

export const DataMigratorPanel: React.FC = memo(() => {
  const logic = useDataMigratorPanelLogic();
  const isBusy = logic.busy !== 'idle';

  const flowNodes = useMemo<Node<MappingNodeData>[]>(() => (
    logic.graph.nodes.map((node) => ({
      id: node.id,
      type: 'mappingField',
      position: node.position,
      data: {
        ...node,
        selectedForConnection: logic.pendingConnectionNodeId === node.id,
      },
      draggable: true,
    }))
  ), [logic.graph.nodes, logic.pendingConnectionNodeId]);

  const flowEdges = useMemo<Edge[]>(() => (
    logic.graph.edges.map((edge) => ({
      id: edge.id,
      source: edge.sourceId,
      target: edge.targetId,
      animated: edge.status !== 'valid',
      label: edge.transform || edge.defaultValue ? 'fx' : undefined,
      title: 'Click para seleccionar. Doble click para eliminar.',
      style: {
        stroke: edge.status === 'invalid' ? '#ff647c' : edge.status === 'warning' ? '#ffbf47' : '#36d399',
        strokeWidth: logic.selectedEdgeId === edge.id ? 3 : 2,
      },
      labelStyle: { fill: '#e8eef8', fontWeight: 800, fontSize: 10 },
    }))
  ), [logic.graph.edges, logic.selectedEdgeId]);

  const handleConnect = (connection: Connection) => {
    if (!connection.source || !connection.target) return;
    logic.addEdge(connection.source, connection.target);
  };

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
          {logic.prismaModelOptions.length > 0 && (
            <button 
              type="button" 
              style={{ ...styles.buttonSecondary, borderColor: tokens.colors.accentBlue + '44', color: tokens.colors.accentBlue }} 
              onClick={() => logic.setShowERDiagram(true)}
            >
              Modelo Relación
            </button>
          )}
          {logic.analysis ? <span style={styles.statusOk}>Formato detectado: {logic.analysis.detection.format}</span> : null}
        </div>
      </div>

      <PrismaERModal 
        isOpen={logic.showERDiagram} 
        onClose={() => logic.setShowERDiagram(false)} 
        models={logic.prismaModelOptions} 
      />

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

      {logic.prismaModelOptions.length ? (
        <div style={styles.section}>
          <div style={styles.predictionHeader}>
            <div>
              <div style={styles.label}>Tablas y columnas Prisma</div>
              <p style={styles.helper}>
                Puedes seleccionar cualquier tabla y cualquier columna del schema. Las coincidencias solo son una pista.
              </p>
            </div>
            <div style={styles.tableActions}>
              <button
                type="button"
                style={styles.tableActionButton}
                onClick={() => logic.selectAllTargetFieldsForSchema(true)}
              >
                Seleccionar todo
              </button>
              <button
                type="button"
                style={styles.tableActionButton}
                onClick={() => logic.selectAllTargetFieldsForSchema(false)}
              >
                Limpiar todo
              </button>
            </div>
          </div>
          <div style={styles.predictionGrid}>
            <div style={styles.predictionTextPanel}>
              {logic.predictionSummary.slice(0, 6).map((summary) => (
                <p key={summary} style={styles.predictionText}>{summary}</p>
              ))}
            </div>
            <div style={styles.tableScroll}>
              {logic.prismaModelOptions.map((model) => {
                const selectedCount = model.fields.filter((field) =>
                  logic.selectedTargetFields.has(`${model.tableName}.${field.name}`),
                ).length;

                return (
                  <details key={`${model.tableName}.${model.modelName}`} style={styles.tableAccordion} open>
                    <summary style={styles.tableSummary}>
                      <span>
                        {model.modelName}
                        <span style={styles.tableName}> · {model.tableName}</span>
                      </span>
                      <span style={styles.tableScore}>
                        {selectedCount}/{model.fields.length} · {(model.score * 100).toFixed(0)}%
                      </span>
                    </summary>
                    <div style={styles.tableActions}>
                      <button
                        type="button"
                        style={styles.tableActionButton}
                        onClick={() => logic.selectAllTargetFieldsForTable(model.tableName, model.fields, true)}
                      >
                        Seleccionar tabla
                      </button>
                      <button
                        type="button"
                        style={styles.tableActionButton}
                        onClick={() => logic.selectAllTargetFieldsForTable(model.tableName, model.fields, false)}
                      >
                        Limpiar tabla
                      </button>
                    </div>
                    <div style={styles.fieldList}>
                      {model.fields.map((field) => {
                        const key = `${model.tableName}.${field.name}`;
                        const checked = logic.selectedTargetFields.has(key);
                        const matched = model.matchedFields.includes(field.name);

                        return (
                          <label key={key} style={checked ? styles.fieldRowSelected : styles.fieldRow}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(event) => logic.toggleTargetField(model.tableName, field, event.target.checked)}
                            />
                            <span style={styles.fieldName}>{field.name}</span>
                            <span style={styles.fieldType}>{field.prismaType || field.sqlType}</span>
                            {matched ? <span style={styles.matchBadge}>match</span> : null}
                          </label>
                        );
                      })}
                    </div>
                  </details>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      <div style={styles.section}>
        <div style={styles.label}>Mapeo visual</div>
        <div style={styles.graphToolbar}>
          <span style={styles.graphLegend}>Izquierda: campos origen · derecha: campos Prisma · arrastra para conectar</span>
          <span style={styles.graphLegend}>
            {logic.graph.edges.length} mapeos · {logic.graph.validation.warnings.length} avisos
          </span>
        </div>
        <div style={styles.graphCanvas}>
          {flowNodes.length ? (
            <ReactFlowProvider>
              <ReactFlow
                nodes={flowNodes}
                edges={flowEdges}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.25 }}
                onConnect={handleConnect}
                onNodeDragStop={(_, node) => logic.updateNodePosition(node.id, node.position)}
                onNodeClick={(_, node) => logic.handleGraphNodeClick(node.id)}
                onEdgeClick={(_, edge) => logic.setSelectedEdgeId(edge.id)}
                onEdgeDoubleClick={(_, edge) => logic.removeEdge(edge.id)}
                onEdgesDelete={(edges) => edges.forEach((edge) => logic.removeEdge(edge.id))}
                deleteKeyCode={['Backspace', 'Delete']}
              >
                <Background color="rgba(255,255,255,0.12)" gap={18} />
                <Controls />
                <MiniMap pannable zoomable />
              </ReactFlow>
            </ReactFlowProvider>
          ) : (
            <div style={styles.graphEmpty}>Analiza un archivo para construir el mapa visual.</div>
          )}
        </div>
        {logic.graph.edges.length > 0 && logic.graph.validation.warnings.length ? (
          <div style={styles.warningList}>
            {logic.graph.validation.warnings.map((warning) => (
              <div key={warning}>{warning}</div>
            ))}
          </div>
        ) : null}
        {logic.selectedEdge ? (
          <div style={styles.edgeEditor}>
            <div style={styles.label}>Mapeo seleccionado</div>
            <input
              style={styles.input}
              placeholder="Transform function, ej. trim|lowercase"
              value={logic.selectedEdge.transform || ''}
              onChange={(event) => logic.updateSelectedEdgeTransform({ transform: event.target.value })}
            />
            <input
              style={styles.input}
              placeholder="Default value opcional"
              value={String(logic.selectedEdge.defaultValue || '')}
              onChange={(event) => logic.updateSelectedEdgeTransform({ defaultValue: event.target.value })}
            />
            <button type="button" style={styles.buttonSecondary} onClick={() => logic.removeEdge(logic.selectedEdge!.id)}>
              Eliminar mapeo
            </button>
          </div>
        ) : null}
      </div>

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
