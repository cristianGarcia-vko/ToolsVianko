const { BaseParser } = require('./baseParser');
const { normalizeColumnName, toUtf8, uniq } = require('../utils');

const splitCsvLine = (line, delimiter) => {
  const values = [];
  let cursor = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cursor += '"';
        i += 1;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }

    if (!inQuotes && char === delimiter) {
      values.push(cursor.trim());
      cursor = '';
      continue;
    }

    cursor += char;
  }

  values.push(cursor.trim());
  return values;
};

const guessDelimiter = (firstLine) => {
  const candidates = [',', ';', '\t', '|'];
  let best = ',';
  let bestCount = -1;
  for (const candidate of candidates) {
    const count = splitCsvLine(firstLine, candidate).length;
    if (count > bestCount) {
      best = candidate;
      bestCount = count;
    }
  }
  return best;
};

class CsvParser extends BaseParser {
  constructor() {
    super('csv');
  }

  canParse(context) {
    return context.format === 'csv';
  }

  parse(context) {
    const text = toUtf8(context.buffer);
    const lines = text.split(/\r?\n/).filter((line) => String(line).trim().length > 0);
    if (lines.length === 0) {
      return { format: this.format, rows: [], columns: [], meta: { delimiter: ',' } };
    }

    const delimiter = guessDelimiter(lines[0]);
    const rawHeaders = splitCsvLine(lines[0], delimiter);
    const headers = rawHeaders.map((header, index) => normalizeColumnName(header) || `column_${index + 1}`);

    const rows = lines.slice(1).map((line) => {
      const values = splitCsvLine(line, delimiter);
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] ?? null;
      });
      return row;
    });

    return {
      format: this.format,
      rows,
      columns: uniq(headers),
      meta: { delimiter },
    };
  }
}

module.exports = { CsvParser };
