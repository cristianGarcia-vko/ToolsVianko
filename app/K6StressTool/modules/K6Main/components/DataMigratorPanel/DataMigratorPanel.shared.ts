import type { DataMigratorOutputFormat } from './DataMigratorPanel.types';

export const DATA_MIGRATOR_FORMAT_OPTIONS: Array<{
  value: DataMigratorOutputFormat;
  label: string;
}> = [
  { value: 'sql', label: 'SQL (Create + Inserts)' },
  { value: 'json', label: 'JSON' },
  { value: 'csv', label: 'CSV' },
  { value: 'prisma-migration', label: 'Prisma migration SQL' },
];

export const DATA_MIGRATOR_DEFAULT_MAPPING = `{
  "tableName": "imported_data",
  "columns": {}
}`;

const K6_API_BASE_URL =
  process.env.EXPO_PUBLIC_K6_API_BASE_URL ||
  'http://localhost:4001';

export const DATA_MIGRATOR_ENDPOINTS = {
  analyze: `${K6_API_BASE_URL}/api/data-migrator/analyze`,
  convert: `${K6_API_BASE_URL}/api/data-migrator/convert`,
};
