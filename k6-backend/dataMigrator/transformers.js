const { inferColumnTypes, normalizeColumnName } = require('./utils');

const coerceValue = (value, type) => {
  if (value === null || value === undefined || value === '') return null;
  const normalizedType = String(type || 'TEXT').toUpperCase();
  if (normalizedType === 'BOOLEAN') {
    if (typeof value === 'boolean') return value;
    const text = String(value).trim().toLowerCase();
    if (['1', 'true', 'yes', 'si'].includes(text)) return true;
    if (['0', 'false', 'no'].includes(text)) return false;
    return null;
  }
  if (normalizedType === 'INT') {
    const parsed = Number.parseInt(String(value), 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (normalizedType === 'DECIMAL') {
    const parsed = Number.parseFloat(String(value));
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (normalizedType === 'TIMESTAMP') {
    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  if (normalizedType === 'JSON') {
    if (typeof value === 'object') return value;
    try {
      return JSON.parse(String(value));
    } catch {
      return { value: String(value) };
    }
  }
  return String(value);
};

const buildDefaultMapping = ({ columns, inferredTypes, prismaTemplate }) => {
  const prismaMap = (prismaTemplate?.fields || []).reduce((acc, field) => {
    acc[normalizeColumnName(field.name)] = field;
    return acc;
  }, {});

  const mappingColumns = {};
  (columns || []).forEach((column) => {
    const key = normalizeColumnName(column);
    const template = prismaMap[key];
    mappingColumns[key] = {
      from: key,
      to: template?.name || key,
      type: template?.sqlType || inferredTypes?.[key] || 'TEXT',
    };
  });

  return {
    tableName: prismaTemplate?.tableName || 'imported_data',
    columns: mappingColumns,
  };
};

const applyMapping = ({ rows, mappingConfig }) => {
  const columnsConfig = mappingConfig?.columns || {};
  const normalizedRows = (rows || []).map((row) => {
    const out = {};
    Object.entries(columnsConfig).forEach(([sourceColumn, config]) => {
      const sourceKey = normalizeColumnName(sourceColumn);
      const targetKey = normalizeColumnName(config?.to || sourceKey);
      const targetType = String(config?.type || 'TEXT').toUpperCase();
      out[targetKey] = coerceValue(row?.[sourceKey], targetType);
    });
    return out;
  });

  const finalColumns = Object.values(columnsConfig).map((config) =>
    normalizeColumnName(config?.to || config?.from || '')
  );
  const finalTypes = {};
  Object.values(columnsConfig).forEach((config) => {
    const key = normalizeColumnName(config?.to || config?.from || '');
    finalTypes[key] = String(config?.type || 'TEXT').toUpperCase();
  });

  return {
    tableName: normalizeColumnName(mappingConfig?.tableName || 'imported_data'),
    rows: normalizedRows,
    columns: finalColumns.filter(Boolean),
    types: finalTypes,
  };
};

const buildNormalizedDataset = ({ rows, columns, prismaTemplate }) => {
  const inferredTypes = inferColumnTypes(rows, columns);
  const mappingConfig = buildDefaultMapping({ columns, inferredTypes, prismaTemplate });
  const transformed = applyMapping({ rows, mappingConfig });
  return {
    ...transformed,
    inferredTypes,
    mappingConfig,
  };
};

module.exports = {
  coerceValue,
  buildDefaultMapping,
  applyMapping,
  buildNormalizedDataset,
};
