const toUtf8 = (buffer) => {
  if (!buffer) return '';
  if (Buffer.isBuffer(buffer)) return buffer.toString('utf8');
  return String(buffer);
};

const normalizeColumnName = (value) =>
  String(value || '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w$]/g, '')
    .replace(/^(\d)/, '_$1');

const uniq = (values) => Array.from(new Set(values.filter(Boolean)));

const takePreviewRows = (rows, max = 20) => rows.slice(0, max);

const detectPrimitiveType = (value) => {
  if (value === null || value === undefined || value === '') return 'TEXT';
  if (typeof value === 'boolean') return 'BOOLEAN';
  if (typeof value === 'number') return Number.isInteger(value) ? 'INT' : 'DECIMAL';
  if (value instanceof Date) return 'TIMESTAMP';
  const text = String(value).trim();
  if (/^(true|false)$/i.test(text)) return 'BOOLEAN';
  if (/^-?\d+$/.test(text)) return 'INT';
  if (/^-?\d+\.\d+$/.test(text)) return 'DECIMAL';
  if (/^\d{4}-\d{2}-\d{2}(?:[tT ][\d:.+-Z]+)?$/.test(text)) return 'TIMESTAMP';
  if ((text.startsWith('{') && text.endsWith('}')) || (text.startsWith('[') && text.endsWith(']'))) {
    return 'JSON';
  }
  return 'TEXT';
};

const inferColumnTypes = (rows, columns) => {
  const result = {};
  for (const col of columns) {
    const candidates = rows.slice(0, 100).map((row) => row?.[col]);
    const votes = candidates.reduce((acc, value) => {
      const type = detectPrimitiveType(value);
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    const ordered = Object.entries(votes).sort((a, b) => b[1] - a[1]);
    result[col] = ordered[0]?.[0] || 'TEXT';
  }
  return result;
};

const splitSqlValues = (chunk) => {
  const values = [];
  let cursor = '';
  let inQuote = false;
  let quoteChar = '';
  let depth = 0;

  for (let i = 0; i < chunk.length; i += 1) {
    const char = chunk[i];
    const next = chunk[i + 1];

    if ((char === "'" || char === '"') && !inQuote) {
      inQuote = true;
      quoteChar = char;
      cursor += char;
      continue;
    }

    if (inQuote && char === quoteChar) {
      if (next === quoteChar) {
        cursor += char + next;
        i += 1;
        continue;
      }
      inQuote = false;
      quoteChar = '';
      cursor += char;
      continue;
    }

    if (!inQuote && char === '(') depth += 1;
    if (!inQuote && char === ')') depth -= 1;

    if (!inQuote && depth === 0 && char === ',') {
      values.push(cursor.trim());
      cursor = '';
      continue;
    }

    cursor += char;
  }

  if (cursor.trim()) values.push(cursor.trim());
  return values;
};

const parseSqlLiteral = (raw) => {
  if (!raw || /^null$/i.test(raw)) return null;
  if (/^(true|false)$/i.test(raw)) return /^true$/i.test(raw);
  if (/^-?\d+$/.test(raw)) return Number(raw);
  if (/^-?\d+\.\d+$/.test(raw)) return Number(raw);
  const quotedSingle = raw.match(/^'(.*)'$/s);
  if (quotedSingle) return quotedSingle[1].replace(/''/g, "'");
  const quotedDouble = raw.match(/^"(.*)"$/s);
  if (quotedDouble) return quotedDouble[1].replace(/""/g, '"');
  return raw;
};

module.exports = {
  toUtf8,
  normalizeColumnName,
  uniq,
  takePreviewRows,
  detectPrimitiveType,
  inferColumnTypes,
  splitSqlValues,
  parseSqlLiteral,
};
