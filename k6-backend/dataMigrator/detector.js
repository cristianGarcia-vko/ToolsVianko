const path = require('path');
const { toUtf8 } = require('./utils');

const EXTENSION_MAP = {
  '.csv': 'csv',
  '.xml': 'xml',
  '.json': 'json',
  '.sql': 'sql-insert',
  '.prisma': 'prisma-schema',
};

const detectBySignature = (buffer) => {
  if (!buffer || buffer.length === 0) return 'unknown';
  const preview = toUtf8(buffer.slice(0, 1024)).trim();
  if (!preview) return 'unknown';

  if (preview.startsWith('{') || preview.startsWith('[')) return 'json';
  if (preview.startsWith('<?xml') || preview.startsWith('<')) return 'xml';
  if (/^\s*insert\s+into\s+/i.test(preview)) return 'sql-insert';
  if (/^\s*model\s+\w+\s*{/i.test(preview) || /^\s*datasource\s+\w+\s*{/i.test(preview)) {
    return 'prisma-schema';
  }
  if (preview.includes(',') && /\r?\n/.test(preview)) return 'csv';
  return 'unknown';
};

const detectFormat = ({ fileName, buffer }) => {
  const ext = path.extname(String(fileName || '')).toLowerCase();
  const byExtension = EXTENSION_MAP[ext];
  const bySignature = detectBySignature(buffer);

  if (byExtension && bySignature !== 'unknown' && byExtension !== bySignature) {
    return {
      format: bySignature,
      confidence: 'medium',
      reason: `Extensión (${ext}) y firma interna difieren; se prioriza contenido.`,
    };
  }

  if (byExtension) {
    return {
      format: byExtension,
      confidence: bySignature === 'unknown' ? 'medium' : 'high',
      reason: `Detectado por extensión ${ext}${bySignature !== 'unknown' ? ' y validado por firma' : ''}.`,
    };
  }

  return {
    format: bySignature,
    confidence: bySignature === 'unknown' ? 'low' : 'medium',
    reason: bySignature === 'unknown' ? 'No se pudo identificar el formato.' : 'Detectado por firma interna.',
  };
};

module.exports = { detectFormat };
