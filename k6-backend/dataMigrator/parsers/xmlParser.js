const { BaseParser } = require('./baseParser');
const { normalizeColumnName, uniq, toUtf8 } = require('../utils');

const removeXmlNoise = (text) =>
  String(text || '')
    .replace(/<\?xml[\s\S]*?\?>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();

const extractRecordChunks = (xml) => {
  const matchRoot = xml.match(/^<([\w:-]+)[^>]*>([\s\S]*)<\/\1>\s*$/);
  const body = matchRoot ? matchRoot[2] : xml;
  const regex = /<([\w:-]+)[^>]*>([\s\S]*?)<\/\1>/g;
  const chunks = [];
  let match;
  while ((match = regex.exec(body)) !== null) {
    chunks.push({ tag: match[1], body: match[2] });
  }

  if (chunks.length === 0) return [];

  const frequency = chunks.reduce((acc, chunk) => {
    acc[chunk.tag] = (acc[chunk.tag] || 0) + 1;
    return acc;
  }, {});
  const preferredTag = Object.entries(frequency).sort((a, b) => b[1] - a[1])[0]?.[0];
  return chunks.filter((chunk) => chunk.tag === preferredTag).map((chunk) => chunk.body);
};

const parseFieldsFromChunk = (chunk) => {
  const row = {};
  const regex = /<([\w:-]+)[^>]*>([\s\S]*?)<\/\1>/g;
  let match;
  while ((match = regex.exec(chunk)) !== null) {
    const key = normalizeColumnName(match[1]);
    const value = String(match[2] || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
    row[key] = value;
  }
  return row;
};

class XmlParser extends BaseParser {
  constructor() {
    super('xml');
  }

  canParse(context) {
    return context.format === 'xml';
  }

  parse(context) {
    const text = removeXmlNoise(toUtf8(context.buffer));
    const chunks = extractRecordChunks(text);
    const rows = chunks.map(parseFieldsFromChunk).filter((row) => Object.keys(row).length > 0);
    const columns = uniq(rows.flatMap((row) => Object.keys(row)));

    return {
      format: this.format,
      rows,
      columns,
      meta: { recordCount: rows.length },
    };
  }
}

module.exports = { XmlParser };
