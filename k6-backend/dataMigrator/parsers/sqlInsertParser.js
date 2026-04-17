const { BaseParser } = require('./baseParser');
const {
  normalizeColumnName,
  splitSqlValues,
  parseSqlLiteral,
  uniq,
  toUtf8,
} = require('../utils');

const findInsertStatements = (sql) => {
  const regex = /insert\s+into\s+["`]?([\w.]+)["`]?\s*\(([\s\S]*?)\)\s*values\s*([\s\S]*?);/gi;
  const statements = [];
  let match;
  while ((match = regex.exec(sql)) !== null) {
    statements.push({
      table: match[1],
      columnsRaw: match[2],
      valuesRaw: match[3],
    });
  }
  return statements;
};

const splitValueTuples = (valuesRaw) => {
  const tuples = [];
  let cursor = '';
  let inQuote = false;
  let quoteChar = '';
  let depth = 0;

  for (let i = 0; i < valuesRaw.length; i += 1) {
    const char = valuesRaw[i];
    const next = valuesRaw[i + 1];
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
    if (!inQuote && char === '(') {
      depth += 1;
      if (depth === 1) {
        cursor = '';
        continue;
      }
    }
    if (!inQuote && char === ')') {
      depth -= 1;
      if (depth === 0) {
        tuples.push(cursor);
        cursor = '';
        continue;
      }
    }
    if (depth >= 1) cursor += char;
  }
  return tuples;
};

class SqlInsertParser extends BaseParser {
  constructor() {
    super('sql-insert');
  }

  canParse(context) {
    return context.format === 'sql-insert';
  }

  parse(context) {
    const sql = toUtf8(context.buffer);
    const statements = findInsertStatements(sql);
    const rows = [];
    let tableName = '';

    statements.forEach((statement) => {
      tableName = tableName || statement.table;
      const columns = splitSqlValues(statement.columnsRaw).map((col, index) => {
        const cleaned = String(col || '')
          .replace(/^["`]|["`]$/g, '')
          .trim();
        return normalizeColumnName(cleaned) || `column_${index + 1}`;
      });

      const tuples = splitValueTuples(statement.valuesRaw);
      tuples.forEach((tuple) => {
        const rawValues = splitSqlValues(tuple);
        const row = {};
        columns.forEach((column, index) => {
          row[column] = parseSqlLiteral(rawValues[index]);
        });
        rows.push(row);
      });
    });

    const columns = uniq(rows.flatMap((row) => Object.keys(row)));

    return {
      format: this.format,
      rows,
      columns,
      meta: { tableName: tableName || 'imported_data', statementCount: statements.length },
    };
  }
}

module.exports = { SqlInsertParser };
