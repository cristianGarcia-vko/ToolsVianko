import { useCallback, useMemo, useState } from 'react';
import type {
  DataMigratorAnalysis,
  DataMigratorGraph,
  DataMigratorGraphEdge,
  DataMigratorGraphNode,
  DataMigratorGraphPosition,
  DataMigratorGraphValidation,
  DataMigratorMappingConfig,
  DataMigratorOutputFormat,
  DataMigratorPrismaField,
  DataMigratorPrismaModelPrediction,
} from './DataMigratorPanel.types';
import {
  DATA_MIGRATOR_DEFAULT_MAPPING,
  DATA_MIGRATOR_ENDPOINTS,
  DATA_MIGRATOR_FORMAT_OPTIONS,
} from './DataMigratorPanel.shared';

const SOURCE_X = 40;
const TARGET_X = 520;
const NODE_Y_GAP = 86;

const EMPTY_GRAPH: DataMigratorGraph = {
  nodes: [],
  edges: [],
  validation: {
    missingRequiredTargets: [],
    duplicateTargets: [],
    invalidEdges: [],
    warnings: [],
  },
};

const parseMappingOrNull = (text: string): DataMigratorMappingConfig | null => {
  if (!text || !text.trim()) return null;
  return JSON.parse(text) as DataMigratorMappingConfig;
};

const sourceNodeId = (fieldName: string) => `source:${fieldName}`;
const targetTableNodeId = (tableName: string) => `target-table:${tableName}`;
const targetNodeId = (tableName: string, fieldName: string) => `target:${tableName}.${fieldName}`;
const edgeIdFor = (sourceId: string, targetId: string) => `edge:${sourceId}->${targetId}`;
const targetSelectionKey = (tableName: string, fieldName: string) => `${tableName}.${fieldName}`;

const normalizeType = (type?: string) => String(type || '').toLowerCase();
const normalizeMatchKey = (value?: string) => String(value || '').trim().toLowerCase();
const normalizePrismaSqlType = (prismaType?: string) => {
  const clean = String(prismaType || '').replace('?', '').replace('[]', '');
  if (clean === 'Int' || clean === 'BigInt') return 'INT';
  if (clean === 'Float' || clean === 'Decimal') return 'DECIMAL';
  if (clean === 'Boolean') return 'BOOLEAN';
  if (clean === 'DateTime') return 'TIMESTAMP';
  if (clean === 'Json') return 'JSON';
  return 'TEXT';
};

const extractModelBlocksFromSchema = (schema: string) => {
  const blocks: Array<{ modelName: string; body: string }> = [];
  const regex = /\bmodel\s+(\w+)\s*\{/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(schema)) !== null) {
    const modelName = match[1];
    let index = regex.lastIndex;
    let depth = 1;
    while (index < schema.length && depth > 0) {
      const char = schema[index];
      if (char === '{') depth += 1;
      if (char === '}') depth -= 1;
      index += 1;
    }
    blocks.push({ modelName, body: schema.slice(regex.lastIndex, Math.max(regex.lastIndex, index - 1)) });
    regex.lastIndex = index;
  }

  return blocks;
};

const buildPrismaModelPredictionsFromSchema = (
  schemaText: string,
  sourceColumns: string[],
): DataMigratorPrismaModelPrediction[] => {
  const normalizedColumns = new Set(sourceColumns.map((column) => normalizeMatchKey(column)));

  return extractModelBlocksFromSchema(schemaText)
    .map(({ modelName, body }) => {
      const fields: DataMigratorPrismaField[] = [];
      let tableName = modelName;

      String(body || '').split(/\r?\n/).forEach((line) => {
        const clean = String(line || '').split('//')[0].trim();
        if (!clean || clean.startsWith('@@ignore') || clean.startsWith('@')) return;

        const tableMap = clean.match(/^@@map\(\s*"([^"]+)"\s*\)/);
        if (tableMap?.[1]) {
          tableName = tableMap[1];
          return;
        }

        if (clean.startsWith('@@')) return;
        const [name, rawType] = clean.split(/\s+/);
        if (!name || !rawType || name.startsWith('@')) return;

        const autoIncrement = /@default\(\s*autoincrement\(\s*\)\s*\)/.test(clean);
        const isRequired = !rawType.includes('?') && !rawType.includes('[]') && !autoIncrement;
        const prismaType = rawType.replace('?', '').replace('[]', '');
        fields.push({
          name,
          prismaType,
          sqlType: normalizePrismaSqlType(rawType),
          required: isRequired,
          isRequired,
          autoIncrement,
        });
      });

      const matchedFields = fields
        .filter((field) => normalizedColumns.has(normalizeMatchKey(field.name)))
        .map((field) => field.name);

      return {
        modelName,
        tableName,
        score: matchedFields.length / Math.max(fields.length, 1),
        matchedFields,
        fields,
      };
    })
    .filter((model) => model.fields.length > 0)
    .sort((a, b) => b.score - a.score || a.modelName.localeCompare(b.modelName));
};

const mergePrismaModelOptions = (
  serverModels: DataMigratorPrismaModelPrediction[] | undefined,
  clientModels: DataMigratorPrismaModelPrediction[],
) => {
  const merged = new Map<string, DataMigratorPrismaModelPrediction>();
  [...(serverModels || []), ...clientModels].forEach((model) => {
    const key = normalizeMatchKey(model.tableName || model.modelName);
    const previous = merged.get(key);
    if (!previous) {
      merged.set(key, model);
      return;
    }

    const fieldMap = new Map<string, DataMigratorPrismaField>();
    [...previous.fields, ...model.fields].forEach((field) => {
      fieldMap.set(normalizeMatchKey(field.name), field);
    });
    const matchedFields = Array.from(new Set([...previous.matchedFields, ...model.matchedFields]));
    merged.set(key, {
      ...previous,
      modelName: previous.modelName || model.modelName,
      tableName: previous.tableName || model.tableName,
      score: Math.max(previous.score, model.score),
      matchedFields,
      fields: Array.from(fieldMap.values()),
    });
  });
  return Array.from(merged.values()).sort((a, b) => b.score - a.score || a.modelName.localeCompare(b.modelName));
};

const getPrismaModelOptions = (analysis: DataMigratorAnalysis | null): DataMigratorPrismaModelPrediction[] => {
  if (analysis?.prismaModels?.length) return mergePrismaModelOptions(analysis.prismaModels, []);
  if (!analysis?.prismaTemplate) return [];
  return [{
    modelName: analysis.prismaTemplate.modelName,
    tableName: analysis.prismaTemplate.tableName,
    score: analysis.prismaTemplate.score,
    matchedFields: analysis.prismaTemplate.fields
      .filter((field) => analysis.columns.some((column) => normalizeMatchKey(column) === normalizeMatchKey(field.name)))
      .map((field) => field.name),
    fields: analysis.prismaTemplate.fields,
  }];
};

const areTypesCompatible = (sourceType?: string, targetType?: string) => {
  const source = normalizeType(sourceType);
  const target = normalizeType(targetType);
  if (!source || !target || source === 'unknown' || target === 'unknown') return true;
  if (source === target) return true;

  const sourceIsNumber = ['int', 'integer', 'float', 'decimal', 'double', 'number', 'bigint'].some((item) => source.includes(item));
  const targetIsNumber = ['int', 'integer', 'float', 'decimal', 'double', 'number', 'bigint'].some((item) => target.includes(item));
  if (sourceIsNumber && targetIsNumber) return true;

  const sourceIsDate = ['date', 'datetime', 'timestamp'].some((item) => source.includes(item));
  const targetIsDate = ['date', 'datetime', 'timestamp'].some((item) => target.includes(item));
  if (sourceIsDate && targetIsDate) return true;

  const sourceIsBoolean = ['bool', 'boolean'].some((item) => source.includes(item));
  const targetIsBoolean = ['bool', 'boolean'].some((item) => target.includes(item));
  if (sourceIsBoolean && targetIsBoolean) return true;

  return target.includes('string') || target.includes('text') || target.includes('varchar');
};

const getNodeById = (nodes: DataMigratorGraphNode[], id: string) => nodes.find((node) => node.id === id);

const validateGraph = (nodes: DataMigratorGraphNode[], edges: DataMigratorGraphEdge[]): DataMigratorGraphValidation => {
  const targetCount = new Map<string, number>();
  const invalidEdges: string[] = [];
  const warnings: string[] = [];

  edges.forEach((edge) => {
    targetCount.set(edge.targetId, (targetCount.get(edge.targetId) || 0) + 1);
    const source = getNodeById(nodes, edge.sourceId);
    const target = getNodeById(nodes, edge.targetId);
    if (!source || !target) {
      invalidEdges.push(edge.id);
      warnings.push(`Mapeo incompleto: ${edge.id}`);
      return;
    }
    if (!areTypesCompatible(source.dataType, target.dataType)) {
      invalidEdges.push(edge.id);
      warnings.push(`${source.label} (${source.dataType || 'sin tipo'}) no parece compatible con ${target.label} (${target.dataType || 'sin tipo'}).`);
    }
  });

  const duplicateTargets = Array.from(targetCount.entries())
    .filter(([, count]) => count > 1)
    .map(([targetId]) => targetId);

  duplicateTargets.forEach((targetId) => {
    const target = getNodeById(nodes, targetId);
    warnings.push(`El campo destino ${target?.label || targetId} tiene mas de un origen.`);
  });

  const mappedTargets = new Set(edges.map((edge) => edge.targetId));
  const mappedTables = new Set(
    edges
      .map((edge) => getNodeById(nodes, edge.targetId)?.table)
      .filter(Boolean) as string[],
  );
  const missingRequiredTargets = nodes
    .filter((node) => (
      node.kind === 'target_field' &&
      node.required &&
      !node.autoIncrement &&
      Boolean(node.table && mappedTables.has(node.table)) &&
      !mappedTargets.has(node.id)
    ))
    .map((node) => node.id);

  missingRequiredTargets.forEach((targetId) => {
    const target = getNodeById(nodes, targetId);
    warnings.push(`Falta mapear el campo requerido ${target?.label || targetId}.`);
  });

  return {
    missingRequiredTargets,
    duplicateTargets,
    invalidEdges,
    warnings,
  };
};

const applyEdgeValidation = (nodes: DataMigratorGraphNode[], edges: DataMigratorGraphEdge[]) => {
  const validation = validateGraph(nodes, edges);
  const invalidSet = new Set(validation.invalidEdges);
  const duplicateSet = new Set(validation.duplicateTargets);

  return {
    validation,
    edges: edges.map((edge) => {
      const warnings: string[] = [];
      const source = getNodeById(nodes, edge.sourceId);
      const target = getNodeById(nodes, edge.targetId);

      if (!source || !target) warnings.push('Mapeo incompleto.');
      if (source && target && !areTypesCompatible(source.dataType, target.dataType)) {
        warnings.push('Tipos posiblemente incompatibles.');
      }
      if (duplicateSet.has(edge.targetId)) warnings.push('Destino duplicado.');

      return {
        ...edge,
        status: invalidSet.has(edge.id) ? 'invalid' : warnings.length ? 'warning' : 'valid',
        warnings,
      } satisfies DataMigratorGraphEdge;
    }),
  };
};

const buildGraph = (nodes: DataMigratorGraphNode[], edges: DataMigratorGraphEdge[]): DataMigratorGraph => {
  const { validation, edges: validatedEdges } = applyEdgeValidation(nodes, edges);
  return { nodes, edges: validatedEdges, validation };
};

export const graphToMappingConfig = (graph: DataMigratorGraph): DataMigratorMappingConfig => {
  const firstTarget = graph.nodes.find((node) => node.kind === 'target_field');
  const tableName = firstTarget?.table || 'imported_data';
  const columns: DataMigratorMappingConfig['columns'] = {};

  graph.edges.forEach((edge) => {
    if (edge.status === 'invalid') return;
    const source = getNodeById(graph.nodes, edge.sourceId);
    const target = getNodeById(graph.nodes, edge.targetId);
    if (!source || !target) return;

    columns[target.label] = {
      from: source.label,
      to: target.label,
      type: target.dataType || source.dataType || 'string',
      ...(edge.transform ? { transform: edge.transform } : {}),
      ...(edge.defaultValue !== undefined ? { defaultValue: edge.defaultValue } : {}),
    };
  });

  return { tableName, columns };
};

export const mappingConfigToGraph = (
  mapping: DataMigratorMappingConfig | null,
  analysis: DataMigratorAnalysis | null,
  previousGraph?: DataMigratorGraph,
  selectedTargetFields?: Set<string>,
  expandedTargetTables: Set<string> = new Set(),
): DataMigratorGraph => {
  const tableName = mapping?.tableName || analysis?.prismaTemplate?.tableName || analysis?.tableNameHint || 'imported_data';
  const previousPositions = new Map(previousGraph?.nodes.map((node) => [node.id, node.position]) || []);
  const sourceFields = analysis?.columns || Array.from(new Set(Object.values(mapping?.columns || {}).map((column) => column.from)));
  const mappedTargets = new Set(
    Object.values(mapping?.columns || {}).map((column) => targetSelectionKey(tableName, column.to)),
  );
  const selectedTargets = new Set([...(selectedTargetFields || []), ...mappedTargets]);
  const prismaModels = getPrismaModelOptions(analysis);
  const selectedModelTargets = prismaModels
    .flatMap((model) => model.fields.map((field) => ({ model, field })))
    .filter(({ model, field }) => selectedTargets.has(targetSelectionKey(model.tableName, field.name)))
    .map(({ model, field }) => ({
      name: field.name,
      type: field.prismaType || field.sqlType,
      tableName: model.tableName,
      required: Boolean(field.required || field.isRequired),
      autoIncrement: Boolean(field.autoIncrement),
    }));
  const modelTargets = selectedModelTargets.filter((field) => expandedTargetTables.has(field.tableName));
  const targetFields =
    selectedTargetFields !== undefined && prismaModels.length > 0
      ? modelTargets
      : modelTargets.length > 0
      ? modelTargets
      : analysis?.prismaTemplate?.fields.map((field) => ({
          name: field.name,
          type: field.prismaType || field.sqlType,
          tableName,
          required: Boolean(field.required || field.isRequired),
          autoIncrement: Boolean(field.autoIncrement),
        })) ||
        Object.values(mapping?.columns || {}).map((column) => ({
          name: column.to,
          type: column.type,
          tableName,
          required: false,
          autoIncrement: false,
        }));
  const selectedTableNodes = prismaModels
    .map((model) => ({
      model,
      selectedCount: model.fields.filter((field) => selectedTargets.has(targetSelectionKey(model.tableName, field.name))).length,
    }))
    .filter(({ selectedCount }) => selectedCount > 0);

  const nodes: DataMigratorGraphNode[] = [
    ...sourceFields.map((fieldName, index) => {
      const id = sourceNodeId(fieldName);
      return {
        id,
        kind: 'source_field' as const,
        label: fieldName,
        dataType: analysis?.inferredTypes?.[fieldName],
        position: previousPositions.get(id) || { x: SOURCE_X, y: index * NODE_Y_GAP },
      };
    }),
    ...selectedTableNodes.map(({ model, selectedCount }, index) => {
      const id = targetTableNodeId(model.tableName);
      return {
        id,
        kind: 'target_table' as const,
        label: model.modelName,
        table: model.tableName,
        expanded: expandedTargetTables.has(model.tableName),
        selectedCount,
        position: previousPositions.get(id) || { x: TARGET_X + 320, y: index * NODE_Y_GAP },
      };
    }),
    ...targetFields.map((field, index) => {
      const id = targetNodeId(field.tableName, field.name);
      return {
        id,
        kind: 'target_field' as const,
        label: field.name,
        dataType: field.type,
        table: field.tableName,
        required: field.required,
        autoIncrement: field.autoIncrement,
        position: previousPositions.get(id) || { x: TARGET_X, y: index * NODE_Y_GAP },
      };
    }),
  ];

  const edges: DataMigratorGraphEdge[] = Object.values(mapping?.columns || {})
    .map((column) => {
      const sourceId = sourceNodeId(column.from);
      const targetId = targetNodeId(tableName, column.to);
      if (!getNodeById(nodes, sourceId) || !getNodeById(nodes, targetId)) return null;
      return {
        id: edgeIdFor(sourceId, targetId),
        sourceId,
        targetId,
        transform: column.transform,
        defaultValue: column.defaultValue,
        status: 'valid' as const,
        warnings: [],
      };
    })
    .filter(Boolean) as DataMigratorGraphEdge[];

  return buildGraph(nodes, edges);
};

export const useDataMigratorPanelLogic = () => {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [schemaFile, setSchemaFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<DataMigratorAnalysis | null>(null);
  const [mappingText, setMappingText] = useState(DATA_MIGRATOR_DEFAULT_MAPPING);
  const [graph, setGraph] = useState<DataMigratorGraph>(EMPTY_GRAPH);
  const [selectedTargetFields, setSelectedTargetFields] = useState<Set<string>>(new Set());
  const [expandedTargetTables, setExpandedTargetTables] = useState<Set<string>>(new Set());
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [pendingConnectionNodeId, setPendingConnectionNodeId] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<DataMigratorOutputFormat>('sql');
  const [outputText, setOutputText] = useState('');
  const [outputFileName, setOutputFileName] = useState('migracion.sql');
  const [busy, setBusy] = useState<'idle' | 'analyzing' | 'converting'>('idle');
  const [error, setError] = useState<string | null>(null);

  const canAnalyze = !!sourceFile && busy === 'idle';
  const canConvert = !!sourceFile && busy === 'idle';
  const previewColumns = useMemo(() => analysis?.columns || [], [analysis]);
  const selectedEdge = useMemo(
    () => graph.edges.find((edge) => edge.id === selectedEdgeId) || null,
    [graph.edges, selectedEdgeId],
  );
  const prismaModelOptions = useMemo(() => getPrismaModelOptions(analysis), [analysis]);
  const predictionSummary = useMemo(() => {
    if (!prismaModelOptions.length) return [];
    return prismaModelOptions.map((model) => {
      const matched = model.matchedFields.length
        ? `Coinciden: ${model.matchedFields.join(', ')}.`
        : 'Sin coincidencias directas por nombre.';
      return `${model.modelName} (${model.tableName}) podria sincronizar ${model.matchedFields.length}/${model.fields.length} columnas. ${matched}`;
    });
  }, [prismaModelOptions]);

  const syncMappingFromGraph = useCallback((nextGraph: DataMigratorGraph) => {
    setGraph(nextGraph);
    setMappingText(JSON.stringify(graphToMappingConfig(nextGraph), null, 2));
  }, []);

  const handleSourceFileChange = (file: File | null) => {
    setSourceFile(file);
    setAnalysis(null);
    setGraph(EMPTY_GRAPH);
    setSelectedTargetFields(new Set());
    setExpandedTargetTables(new Set());
    setSelectedEdgeId(null);
    setPendingConnectionNodeId(null);
    setOutputText('');
    setError(null);
  };

  const handleSchemaFileChange = (file: File | null) => {
    setSchemaFile(file);
    setError(null);
  };

  const handleMappingTextChange = (text: string) => {
    setMappingText(text);
    try {
      const parsed = parseMappingOrNull(text);
      setGraph(mappingConfigToGraph(parsed, analysis, graph, selectedTargetFields, expandedTargetTables));
      setError(null);
    } catch {
      setError('El MappingConfig aun no es JSON valido.');
    }
  };

  const updateNodePosition = useCallback((nodeId: string, position: DataMigratorGraphPosition) => {
    setGraph((current) => buildGraph(
      current.nodes.map((node) => (node.id === nodeId ? { ...node, position } : node)),
      current.edges,
    ));
  }, []);

  const toggleTargetTableExpansion = useCallback((tableName: string) => {
    setExpandedTargetTables((current) => {
      const nextExpanded = new Set(current);
      if (nextExpanded.has(tableName)) nextExpanded.delete(tableName);
      else nextExpanded.add(tableName);

      let parsedMapping: DataMigratorMappingConfig | null = null;
      try {
        parsedMapping = parseMappingOrNull(mappingText);
      } catch {
        parsedMapping = null;
      }
      setGraph((currentGraph) => mappingConfigToGraph(parsedMapping, analysis, currentGraph, selectedTargetFields, nextExpanded));
      return nextExpanded;
    });
  }, [analysis, mappingText, selectedTargetFields]);

  const seedTargetSelection = (nextAnalysis: DataMigratorAnalysis) => {
    const seeded = new Set<string>();
    const models = getPrismaModelOptions(nextAnalysis);
    models.forEach((model) => {
      model.fields.forEach((field) => {
        seeded.add(targetSelectionKey(model.tableName, field.name));
      });
    });

    if (seeded.size === 0) {
      const tableName = nextAnalysis.mappingConfig?.tableName || nextAnalysis.prismaTemplate?.tableName || nextAnalysis.tableNameHint;
      Object.values(nextAnalysis.mappingConfig?.columns || {}).forEach((column) => {
        if (tableName && column.to) seeded.add(targetSelectionKey(tableName, column.to));
      });
    }

    return seeded;
  };

  const toggleTargetField = useCallback((tableName: string, field: DataMigratorPrismaField, checked?: boolean) => {
    setSelectedTargetFields((current) => {
      const nextSelection = new Set(current);
      const key = targetSelectionKey(tableName, field.name);
      const shouldSelect = checked ?? !nextSelection.has(key);
      if (shouldSelect) nextSelection.add(key);
      else nextSelection.delete(key);
      let parsedMapping: DataMigratorMappingConfig | null = null;
      try {
        parsedMapping = parseMappingOrNull(mappingText);
      } catch {
        parsedMapping = null;
      }
      setGraph((currentGraph) => mappingConfigToGraph(parsedMapping, analysis, currentGraph, nextSelection, expandedTargetTables));
      return nextSelection;
    });
  }, [analysis, expandedTargetTables, mappingText]);

  const selectAllTargetFieldsForTable = useCallback((tableName: string, fields: DataMigratorPrismaField[], checked: boolean) => {
    setSelectedTargetFields((current) => {
      const nextSelection = new Set(current);
      fields.forEach((field) => {
        const key = targetSelectionKey(tableName, field.name);
        if (checked) nextSelection.add(key);
        else nextSelection.delete(key);
      });
      let parsedMapping: DataMigratorMappingConfig | null = null;
      try {
        parsedMapping = parseMappingOrNull(mappingText);
      } catch {
        parsedMapping = null;
      }
      setGraph((currentGraph) => mappingConfigToGraph(parsedMapping, analysis, currentGraph, nextSelection, expandedTargetTables));
      return nextSelection;
    });
  }, [analysis, expandedTargetTables, mappingText]);

  const selectAllTargetFieldsForSchema = useCallback((checked: boolean) => {
    setSelectedTargetFields((current) => {
      const nextSelection = new Set(current);
      prismaModelOptions.forEach((model) => {
        model.fields.forEach((field) => {
          const key = targetSelectionKey(model.tableName, field.name);
          if (checked) nextSelection.add(key);
          else nextSelection.delete(key);
        });
      });

      let parsedMapping: DataMigratorMappingConfig | null = null;
      try {
        parsedMapping = parseMappingOrNull(mappingText);
      } catch {
        parsedMapping = null;
      }
      setGraph((currentGraph) => mappingConfigToGraph(parsedMapping, analysis, currentGraph, nextSelection, expandedTargetTables));
      return nextSelection;
    });
  }, [analysis, expandedTargetTables, mappingText, prismaModelOptions]);

  const addEdge = useCallback((sourceId: string, targetId: string) => {
    setGraph((current) => {
      const source = getNodeById(current.nodes, sourceId);
      const target = getNodeById(current.nodes, targetId);
      if (!source || !target || source.kind !== 'source_field' || target.kind !== 'target_field') return current;
      if (current.edges.some((edge) => edge.sourceId === sourceId && edge.targetId === targetId)) return current;
      if (current.edges.some((edge) => edge.targetId === targetId)) {
        setError(`El campo destino ${target.label} ya tiene un origen asignado.`);
        return current;
      }
      const nextGraph = buildGraph(current.nodes, [
        ...current.edges,
        { id: edgeIdFor(sourceId, targetId), sourceId, targetId, status: 'valid', warnings: [] },
      ]);
      setMappingText(JSON.stringify(graphToMappingConfig(nextGraph), null, 2));
      setError(null);
      return nextGraph;
    });
  }, []);

  const handleGraphNodeClick = useCallback((nodeId: string) => {
    const node = getNodeById(graph.nodes, nodeId);
    if (!node) return;

    if (node.kind === 'target_table' && node.table) {
      toggleTargetTableExpansion(node.table);
      setPendingConnectionNodeId(null);
      return;
    }

    if (node.kind !== 'source_field' && node.kind !== 'target_field') return;

    const pendingNode = pendingConnectionNodeId ? getNodeById(graph.nodes, pendingConnectionNodeId) : null;
    if (!pendingNode) {
      setPendingConnectionNodeId(node.id);
      return;
    }

    if (pendingNode.id === node.id) {
      setPendingConnectionNodeId(null);
      return;
    }

    if (pendingNode.kind === 'source_field' && node.kind === 'target_field') {
      addEdge(pendingNode.id, node.id);
      setPendingConnectionNodeId(null);
      return;
    }

    if (pendingNode.kind === 'target_field' && node.kind === 'source_field') {
      addEdge(node.id, pendingNode.id);
      setPendingConnectionNodeId(null);
      return;
    }

    setPendingConnectionNodeId(node.id);
  }, [addEdge, graph.nodes, pendingConnectionNodeId, toggleTargetTableExpansion]);

  const removeEdge = useCallback((edgeId: string) => {
    setGraph((current) => {
      const nextGraph = buildGraph(current.nodes, current.edges.filter((edge) => edge.id !== edgeId));
      setMappingText(JSON.stringify(graphToMappingConfig(nextGraph), null, 2));
      return nextGraph;
    });
    setSelectedEdgeId((current) => (current === edgeId ? null : current));
  }, []);

  const updateSelectedEdgeTransform = useCallback((patch: { transform?: string; defaultValue?: string }) => {
    if (!selectedEdgeId) return;
    setGraph((current) => {
      const nextGraph = buildGraph(
        current.nodes,
        current.edges.map((edge) => (
          edge.id === selectedEdgeId
            ? {
                ...edge,
                ...(patch.transform !== undefined ? { transform: patch.transform } : {}),
                ...(patch.defaultValue !== undefined ? { defaultValue: patch.defaultValue || undefined } : {}),
              }
            : edge
        )),
      );
      setMappingText(JSON.stringify(graphToMappingConfig(nextGraph), null, 2));
      return nextGraph;
    });
  }, [selectedEdgeId]);

  const buildFormData = (withOutputFormat = false) => {
    const formData = new FormData();
    if (sourceFile) formData.append('sourceFile', sourceFile);
    if (schemaFile) formData.append('schemaFile', schemaFile);
    formData.append('mappingConfig', mappingText);
    if (withOutputFormat) formData.append('outputFormat', outputFormat);
    return formData;
  };

  const analyze = async () => {
    if (!sourceFile) return;
    setBusy('analyzing');
    setError(null);
    try {
      const response = await fetch(DATA_MIGRATOR_ENDPOINTS.analyze, {
        method: 'POST',
        body: buildFormData(false),
      });
      const data = await response.json();
      if (!response.ok || data?.success === false) {
        throw new Error(data?.error || 'No se pudo analizar el archivo.');
      }
      const serverAnalysis = data as DataMigratorAnalysis;
      const clientPrismaModels = schemaFile
        ? buildPrismaModelPredictionsFromSchema(await schemaFile.text(), serverAnalysis.columns || [])
        : [];
      const nextAnalysis: DataMigratorAnalysis = {
        ...serverAnalysis,
        prismaModels: mergePrismaModelOptions(serverAnalysis.prismaModels, clientPrismaModels),
      };
      const nextMappingText = JSON.stringify(nextAnalysis.mappingConfig, null, 2);
      const nextTargetSelection = seedTargetSelection(nextAnalysis);
      const nextExpandedTables = new Set<string>();
      setAnalysis(nextAnalysis);
      setMappingText(nextMappingText);
      setSelectedTargetFields(nextTargetSelection);
      setExpandedTargetTables(nextExpandedTables);
      setGraph(mappingConfigToGraph(nextAnalysis.mappingConfig, nextAnalysis, graph, nextTargetSelection, nextExpandedTables));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Error analizando archivo');
    } finally {
      setBusy('idle');
    }
  };

  const convert = async () => {
    if (!sourceFile) return;
    setBusy('converting');
    setError(null);
    try {
      parseMappingOrNull(mappingText);
      const response = await fetch(DATA_MIGRATOR_ENDPOINTS.convert, {
        method: 'POST',
        body: buildFormData(true),
      });
      const data = await response.json();
      if (!response.ok || data?.success === false) {
        throw new Error(data?.error || 'No se pudo convertir el archivo.');
      }
      setOutputText(String(data?.content || ''));
      setOutputFileName(String(data?.fileName || `output.${outputFormat}`));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Error convirtiendo archivo');
    } finally {
      setBusy('idle');
    }
  };

  const downloadOutput = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = outputFileName || `output.${outputFormat}`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return {
    sourceFile,
    schemaFile,
    analysis,
    mappingText,
    graph,
    selectedTargetFields,
    expandedTargetTables,
    pendingConnectionNodeId,
    prismaModelOptions,
    selectedEdge,
    selectedEdgeId,
    outputFormat,
    outputText,
    outputFileName,
    busy,
    error,
    canAnalyze,
    canConvert,
    previewColumns,
    predictionSummary,
    outputFormatOptions: DATA_MIGRATOR_FORMAT_OPTIONS,
    setMappingText: handleMappingTextChange,
    setOutputFormat,
    setSelectedEdgeId,
    handleSourceFileChange,
    handleSchemaFileChange,
    addEdge,
    removeEdge,
    updateNodePosition,
    toggleTargetTableExpansion,
    handleGraphNodeClick,
    toggleTargetField,
    selectAllTargetFieldsForTable,
    selectAllTargetFieldsForSchema,
    updateSelectedEdgeTransform,
    syncMappingFromGraph,
    analyze,
    convert,
    downloadOutput,
  };
};
