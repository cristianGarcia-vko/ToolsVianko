export type DataMigratorOutputFormat = 'sql' | 'json' | 'csv' | 'prisma-migration';

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
    fields: Array<{ name: string; prismaType: string; sqlType: string }>;
  } | null;
  mappingConfig: {
    tableName: string;
    columns: Record<
      string,
      {
        from: string;
        to: string;
        type: string;
      }
    >;
  };
};
