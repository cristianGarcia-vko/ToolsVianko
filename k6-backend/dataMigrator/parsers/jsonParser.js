const { BaseParser } = require('./baseParser');
const { normalizeColumnName, uniq, toUtf8 } = require('../utils');

const normalizeRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    const candidate = Object.values(payload).find((value) => Array.isArray(value));
    if (Array.isArray(candidate)) return candidate;
    return [payload];
  }
  return [];
};

class JsonParser extends BaseParser {
  constructor() {
    super('json');
  }

  canParse(context) {
    return context.format === 'json';
  }

  parse(context) {
    const text = toUtf8(context.buffer);
    const parsed = JSON.parse(text);
    const rows = normalizeRows(parsed)
      .filter((entry) => entry && typeof entry === 'object' && !Array.isArray(entry))
      .map((entry) => ({ ...entry }));

    const columns = uniq(
      rows.flatMap((row) => Object.keys(row).map((col) => normalizeColumnName(col)))
    );

    const normalizedRows = rows.map((row) => {
      const normalized = {};
      Object.entries(row).forEach(([key, value]) => {
        normalized[normalizeColumnName(key)] = value;
      });
      return normalized;
    });

    return {
      format: this.format,
      rows: normalizedRows,
      columns,
      meta: { source: 'json' },
    };
  }
}

module.exports = { JsonParser };
