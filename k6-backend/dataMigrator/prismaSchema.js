const { toUtf8, normalizeColumnName } = require('./utils');

const extractModelBlocks = (schema) => {
  const blocks = [];
  const regex = /\bmodel\s+(\w+)\s*\{/g;
  let match;
  while ((match = regex.exec(schema)) !== null) {
    const modelName = match[1];
    let index = regex.lastIndex;
    let depth = 1;
    while (index < schema.length && depth > 0) {
      const char = schema[index];
      if (char === '{') depth += 1;
      if (char === '}') depth -= 1;
      index += 1;
    }
    const body = schema.slice(regex.lastIndex, Math.max(regex.lastIndex, index - 1));
    blocks.push({ modelName, body });
    regex.lastIndex = index;
  }
  return blocks;
};

const normalizePrismaType = (prismaType) => {
  const clean = String(prismaType || '').replace('?', '').replace('[]', '');
  if (clean === 'Int' || clean === 'BigInt') return 'INT';
  if (clean === 'Float' || clean === 'Decimal') return 'DECIMAL';
  if (clean === 'Boolean') return 'BOOLEAN';
  if (clean === 'DateTime') return 'TIMESTAMP';
  if (clean === 'Json') return 'JSON';
  return 'TEXT';
};

const parsePrismaSchema = (bufferOrText) => {
  const schema = toUtf8(bufferOrText);
  const models = [];
  const blocks = extractModelBlocks(schema);

  blocks.forEach(({ modelName, body }) => {
    const fields = [];
    const lines = String(body || '').split(/\r?\n/);
    let tableName = modelName;

    lines.forEach((line) => {
      const trimmed = String(line || '').trim();
      if (!trimmed || trimmed.startsWith('//')) return;

      if (trimmed.startsWith('@@map')) {
        const mapped = trimmed.match(/@@map\(\s*\"([^\"]+)\"\s*\)/);
        if (mapped && mapped[1]) tableName = mapped[1];
        return;
      }

      if (trimmed.startsWith('@@')) return;
      const clean = trimmed.split('//')[0].trim();
      const [name, rawType] = clean.split(/\s+/);
      if (!name || !rawType || name.startsWith('@')) return;
      fields.push({
        name: normalizeColumnName(name),
        prismaType: rawType.replace('?', '').replace('[]', ''),
        sqlType: normalizePrismaType(rawType),
      });
    });

    if (fields.length > 0) {
      models.push({
        modelName,
        tableName,
        fields,
      });
    }
  });

  return { models };
};

const pickBestModelTemplate = ({ models, columns }) => {
  const normalizedColumns = new Set((columns || []).map((col) => normalizeColumnName(col)));
  let best = null;
  let bestScore = -1;

  (models || []).forEach((model) => {
    const modelColumns = model.fields.map((field) => field.name);
    const overlap = modelColumns.filter((field) => normalizedColumns.has(field)).length;
    const score = overlap / Math.max(modelColumns.length, 1);
    if (score > bestScore) {
      bestScore = score;
      best = {
        modelName: model.modelName,
        tableName: model.tableName,
        score,
        fields: model.fields,
      };
    }
  });

  return best;
};

module.exports = {
  parsePrismaSchema,
  pickBestModelTemplate,
};
