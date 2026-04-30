export type DataMigratorOutputFormat = 'sql' | 'json' | 'csv' | 'prisma-migration';

export type DataMigratorMappingColumn = {
  from: string;
  to: string;
  type: string;
  transform?: string;
  defaultValue?: unknown;
};

export type DataMigratorMappingConfig = {
  tableName: string;
  columns: Record<string, DataMigratorMappingColumn>;
};

export type DataMigratorPrismaField = {
  name: string;
  prismaType: string;
  sqlType: string;
  required?: boolean;
  isRequired?: boolean;
  isId?: boolean;
  autoIncrement?: boolean;
  relation?: {
    to: string;
    fields: string[];
    references: string[];
  };
};

export type DataMigratorPrismaModelPrediction = {
  modelName: string;
  tableName: string;
  score: number;
  matchedFields: string[];
  fields: DataMigratorPrismaField[];
};

export type DataMigratorAnalysis = {
  detection: {
    format: string;
    confidence: string;
    reason: string;
  };
  columns: string[];
  inferredTypes: Record<string, string>;
  rowCount: number;
  previewRows: Record<string, any>[];
  tableNameHint: string;
  prismaTemplate?: {
    modelName: string;
    tableName: string;
    score: number;
    fields: DataMigratorPrismaField[];
  } | null;
  prismaModels?: DataMigratorPrismaModelPrediction[];
  mappingConfig: DataMigratorMappingConfig;
};

export type DataMigratorGraphNodeKind = 'source_field' | 'target_table' | 'target_field';

export type DataMigratorGraphPosition = {
  x: number;
  y: number;
};

export type DataMigratorGraphNode = {
  id: string;
  kind: DataMigratorGraphNodeKind;
  label: string;
  dataType?: string;
  table?: string;
  required?: boolean;
  autoIncrement?: boolean;
  expanded?: boolean;
  selectedCount?: number;
  position: DataMigratorGraphPosition;
};

export type DataMigratorGraphEdgeStatus = 'valid' | 'warning' | 'invalid';

export type DataMigratorGraphEdge = {
  id: string;
  sourceId: string;
  targetId: string;
  transform?: string;
  defaultValue?: unknown;
  status: DataMigratorGraphEdgeStatus;
  warnings: string[];
};

export type DataMigratorGraphValidation = {
  missingRequiredTargets: string[];
  duplicateTargets: string[];
  invalidEdges: string[];
  warnings: string[];
};

export type DataMigratorGraph = {
  nodes: DataMigratorGraphNode[];
  edges: DataMigratorGraphEdge[];
  validation: DataMigratorGraphValidation;
};
