const express = require('express');
const multer = require('multer');
const { faker } = require('@faker-js/faker');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const SQLGEN_UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(SQLGEN_UPLOADS_DIR)) {
  fs.mkdirSync(SQLGEN_UPLOADS_DIR, { recursive: true });
}

const upload = multer({ dest: SQLGEN_UPLOADS_DIR });

function extractEnumBlocks(schema) {
  const blocks = [];
  const re = /\benum\s+(\w+)\s*\{/g;
  let match;

  while ((match = re.exec(schema)) !== null) {
    const enumName = match[1];
    let idx = re.lastIndex;
    let depth = 1;

    while (idx < schema.length && depth > 0) {
      const ch = schema[idx];
      if (ch === '{') depth += 1;
      else if (ch === '}') depth -= 1;
      idx += 1;
    }

    const body = schema.slice(re.lastIndex, Math.max(re.lastIndex, idx - 1));
    blocks.push({ enumName, body });
    re.lastIndex = idx;
  }

  return blocks;
}

function parseEnums(content) {
  const enums = {};
  const schema = String(content || '');
  const blocks = extractEnumBlocks(schema);

  blocks.forEach(({ enumName, body }) => {
    const values = [];
    const lines = String(body || '').split(/\r?\n/);
    lines.forEach((line) => {
      const trimmed = String(line || '').trim();
      if (!trimmed || trimmed.startsWith('//')) return;
      // Prisma enum values are simple identifiers, but allow attributes/comments after.
      const token = trimmed.split(/\s+/)[0];
      if (!token || token.startsWith('@')) return;
      values.push(token);
    });

    if (values.length > 0) {
      enums[enumName] = values;
    }
  });

  return enums;
}

function extractModelBlocks(schema) {
  const blocks = [];
  const re = /\bmodel\s+(\w+)\s*\{/g;
  let match;

  while ((match = re.exec(schema)) !== null) {
    const modelName = match[1];
    let idx = re.lastIndex;
    let depth = 1;

    while (idx < schema.length && depth > 0) {
      const ch = schema[idx];
      if (ch === '{') depth += 1;
      else if (ch === '}') depth -= 1;
      idx += 1;
    }

    const body = schema.slice(re.lastIndex, Math.max(re.lastIndex, idx - 1));
    blocks.push({ modelName, body });
    re.lastIndex = idx;
  }

  return blocks;
}

function parsePrisma(content) {
  const models = {};
  const blocks = extractModelBlocks(String(content || ''));

  blocks.forEach(({ modelName, body }) => {
    let tableName = modelName;
    const uniques = [];
    const indexes = [];
    const fields = [];
    const relations = [];

    const lines = String(body || '').split(/\r?\n/);
    lines.forEach((line) => {
      const trimmed = String(line || '').trim();
      if (!trimmed || trimmed.startsWith('//')) return;

      // Model mapping: @@map("table_name")
      if (trimmed.startsWith('@@map')) {
        const mapped = trimmed.match(/@@map\(\s*\"([^\"]+)\"\s*\)/);
        if (mapped && mapped[1]) tableName = mapped[1];
        return;
      }

      // Composite unique/index
      if (trimmed.startsWith('@@unique') || trimmed.startsWith('@@index')) {
        const match = trimmed.match(/@@(unique|index)\(\s*\[([^\]]+)\]/);
        if (match) {
          const list = String(match[2] || '')
            .split(',')
            .map((entry) => entry.trim())
            .filter(Boolean)
            .map((entry) => entry.split(/\s+/)[0]) // drop sort/order tokens
            .filter(Boolean);
          if (list.length > 0) {
            if (match[1] === 'unique') uniques.push(list);
            else indexes.push(list);
          }
        }
        return;
      }

      // Ignore other model-level directives
      if (trimmed.startsWith('@@')) return;

      const noComment = trimmed.split('//')[0].trim();
      const parts = noComment.split(/\s+/);
      if (parts.length < 2) return;

      const name = parts[0];
      const rawTypeToken = parts[1];
      const isOptional = rawTypeToken.endsWith('?');
      const type = rawTypeToken.replace('?', '').replace('[]', '');
      const isId = noComment.includes('@id');
      const isUnique = noComment.includes('@unique');
      const mappedField = noComment.match(/@map\(\s*\"([^\"]+)\"\s*\)/);
      const dbName = mappedField && mappedField[1] ? mappedField[1] : undefined;
      const relationMatch = noComment.match(
        /@relation\((?:[^)]*?)fields:\s*\[([^\]]+)\]\s*,\s*references:\s*\[([^\]]+)\]([^)]*)\)/
      );

      if (relationMatch) {
        const relationFields = String(relationMatch[1] || '')
          .split(',')
          .map((entry) => entry.trim())
          .filter(Boolean);
        const relationReferences = String(relationMatch[2] || '')
          .split(',')
          .map((entry) => entry.trim())
          .filter(Boolean);

        relations.push({
          fieldName: name,
          targetModel: type,
          sourceFields: relationFields,
          targetFields: relationReferences,
          isOptional,
        });
      }

      fields.push({ name, type, isId, isOptional, isUnique, dbName, raw: noComment });
    });

    models[modelName] = { tableName, fields, uniques, indexes, relations };
  });

  return models;
}

function normalizeModels(input) {
  const out = {};
  if (!input || typeof input !== 'object') return out;

  Object.entries(input).forEach(([modelName, entry]) => {
    if (Array.isArray(entry)) {
      out[modelName] = { tableName: modelName, fields: entry };
      return;
    }
    if (entry && typeof entry === 'object') {
      const tableName = entry.tableName || entry.table || entry.dbName || modelName;
      const fields = Array.isArray(entry.fields) ? entry.fields : [];
      const uniques = Array.isArray(entry.uniques) ? entry.uniques : [];
      const indexes = Array.isArray(entry.indexes) ? entry.indexes : [];
      const relations = Array.isArray(entry.relations) ? entry.relations : [];
      out[modelName] = { tableName, fields, uniques, indexes, relations };
    }
  });

  return out;
}

const escapeSqlString = (value) => String(value ?? '').replace(/'/g, "''");
const asSqlString = (value) => `'${escapeSqlString(value)}'`;

const isNil = (v) => v === undefined || v === null;

const makeUniqueSuffix = (rowKey, attempt) => `_u${rowKey}${attempt ? '_' + attempt : ''}`;

const shouldNull = (field, isIndexed) => {
  // Optional fields can be NULL sometimes.
  // For indexed columns, reduce NULLs to keep the dataset more useful for querying.
  if (!field || !field.isOptional) return false;
  const p = isIndexed ? 0.02 : 0.08;
  return Math.random() < p;
};

const pickEnum = (values) => {
  if (!Array.isArray(values) || values.length === 0) return null;
  return faker.helpers.arrayElement(values);
};

function buildModelConstraints(model, fields) {
  const uniqueSingles = new Set();

  (fields || []).forEach((f) => {
    if (f && (f.isId || f.isUnique)) uniqueSingles.add(f.name);
  });

  (model.uniques || []).forEach((group) => {
    if (Array.isArray(group) && group.length === 1) uniqueSingles.add(group[0]);
  });

  const uniqueGroups = (model.uniques || []).filter((g) => Array.isArray(g) && g.length > 1);
  const indexedFields = new Set();
  (model.indexes || []).forEach((group) => {
    if (!Array.isArray(group)) return;
    group.forEach((name) => {
      if (name) indexedFields.add(name);
    });
  });

  return { uniqueSingles, uniqueGroups, indexedFields };
}

function ensureUniqueSingle(usedByField, fieldName, raw, rowKey, isEnum = false) {
  if (raw == null) return raw;
  const set = usedByField[fieldName] || (usedByField[fieldName] = new Set());
  if (typeof raw === 'number') {
    let nextNum = raw;
    while (set.has(String(nextNum))) nextNum += 1;
    set.add(String(nextNum));
    return nextNum;
  }

  if (!set.has(String(raw))) {
    set.add(String(raw));
    return raw;
  }
  // Collision: append suffix.
  // CRITICAL: Enums cannot have suffixes in Postgres.
  if (isEnum) {
    // For enums, we just return the raw value and let the DB handle the potential unique constraint error,
    // or we could try picking another one, but we must NOT corrupt the string.
    return raw;
  }
  const next = `${raw}${makeUniqueSuffix(rowKey, set.size)}`;
  set.add(String(next));
  return next;
}

function isCompositeKeyEnforceable(parts) {
  // If any part is NULL, most DBs allow duplicates on UNIQUE (Postgres does), so we won't enforce.
  return parts.every((p) => p != null);
}

function getFiniteFieldDomain(field, normalizedEnums) {
  if (!field) return null;

  if (normalizedEnums[field.type] && Array.isArray(normalizedEnums[field.type])) {
    const values = [...normalizedEnums[field.type]];
    if (field.isOptional) values.unshift(null);
    return values;
  }

  if (field.type === 'Boolean') {
    const values = [true, false];
    if (field.isOptional) values.unshift(null);
    return values;
  }

  return null;
}

function buildCompositeUniquePlans(model, fields, count, normalizedEnums) {
  const plans = new Map();
  if (!Array.isArray(model?.uniques) || !count) return plans;

  (model.uniques || []).forEach((group) => {
    if (!Array.isArray(group) || group.length < 2) return;

    const fieldMetas = group
      .map((name) => fields.find((field) => field.name === name))
      .filter(Boolean);
    if (fieldMetas.length !== group.length) return;

    const domains = fieldMetas.map((field) => getFiniteFieldDomain(field, normalizedEnums));
    if (domains.some((domain) => !domain || domain.length === 0)) return;

    const combos = [];
    const build = (index, current) => {
      if (combos.length >= count) return;
      if (index >= domains.length) {
        combos.push([...current]);
        return;
      }

      for (const value of domains[index]) {
        current.push(value);
        build(index + 1, current);
        current.pop();
        if (combos.length >= count) return;
      }
    };

    build(0, []);

    const maxNonNullCombos = domains.reduce((acc, domain) => {
      const usable = domain.filter((value) => value !== null).length;
      return acc * Math.max(usable, 1);
    }, 1);

    plans.set(group.join('|'), {
      group,
      combos,
      exhausted: count > maxNonNullCombos,
    });
  });

  return plans;
}

function buildRelationMetadata(models) {
  const byModel = {};
  const graph = {};

  Object.entries(models || {}).forEach(([modelName, model]) => {
    const fields = Array.isArray(model?.fields) ? model.fields : [];
    const fieldByName = new Map(fields.map((field) => [field.name, field]));
    const idField =
      fields.find((field) => field.isId) ||
      fields.find((field) => field.name === 'id') ||
      null;
    const relationBySourceField = {};
    const deps = new Set();

    (model.relations || []).forEach((relation) => {
      if (!relation || !relation.targetModel || !Array.isArray(relation.sourceFields)) return;

      relation.sourceFields.forEach((sourceField, index) => {
        relationBySourceField[sourceField] = {
          ...relation,
          sourceField,
          targetField: relation.targetFields?.[index] || relation.targetFields?.[0] || 'id',
          sourceFieldMeta: fieldByName.get(sourceField) || null,
        };
      });

      if (relation.targetModel !== modelName) deps.add(relation.targetModel);
    });

    byModel[modelName] = {
      idField,
      relationBySourceField,
    };
    graph[modelName] = deps;
  });

  return { byModel, graph };
}

function orderModelsByDependencies(models, counts) {
  const entries = Object.entries(models || {});
  const { graph } = buildRelationMetadata(models);
  const active = new Set(
    entries
      .filter(([modelName]) => Number((counts && counts[modelName]) || 0) > 0)
      .map(([modelName]) => modelName)
  );
  const pendingDeps = new Map();
  const dependents = new Map();

  active.forEach((modelName) => {
    const deps = new Set(
      Array.from(graph[modelName] || []).filter((dep) => active.has(dep) && dep !== modelName)
    );
    pendingDeps.set(modelName, deps);
    deps.forEach((dep) => {
      const set = dependents.get(dep) || new Set();
      set.add(modelName);
      dependents.set(dep, set);
    });
  });

  const originalOrder = entries.map(([modelName]) => modelName);
  const queue = originalOrder.filter((modelName) => active.has(modelName) && pendingDeps.get(modelName)?.size === 0);
  const ordered = [];
  const visited = new Set();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current)) continue;
    visited.add(current);
    ordered.push(current);

    (dependents.get(current) || []).forEach((next) => {
      const deps = pendingDeps.get(next);
      if (!deps) return;
      deps.delete(current);
      if (deps.size === 0) queue.push(next);
    });
  }

  originalOrder.forEach((modelName) => {
    if (active.has(modelName) && !visited.has(modelName)) ordered.push(modelName);
  });

  return ordered.map((modelName) => [modelName, models[modelName]]);
}

function pickForeignKeyValue({
  relation,
  field,
  modelName,
  generatedIds,
  currentId,
}) {
  if (!relation) return { handled: false };

  const targetModel = relation.targetModel;
  const targetIds = generatedIds[targetModel] || [];
  const targetField = relation.targetField || 'id';
  const isSelfRelation = targetModel === modelName;
  const canUseGeneratedId = targetField === 'id';

  if (canUseGeneratedId && targetIds.length > 0) {
    if (isSelfRelation) {
      const eligible = currentId == null ? targetIds : targetIds.filter((id) => id !== currentId);
      if (eligible.length > 0) {
        const raw = faker.helpers.arrayElement(eligible);
        return { handled: true, raw, sqlValue: typeof raw === 'number' ? String(raw) : asSqlString(raw) };
      }
    } else {
      const raw = faker.helpers.arrayElement(targetIds);
      return { handled: true, raw, sqlValue: typeof raw === 'number' ? String(raw) : asSqlString(raw) };
    }
  }

  if (field.isOptional || relation.isOptional) {
    return { handled: true, raw: null, sqlValue: 'NULL' };
  }

  return { handled: true, raw: null, sqlValue: 'NULL' };
}

router.post('/upload', upload.single('schema'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });

    const content = fs.readFileSync(req.file.path, 'utf-8');
    const models = parsePrisma(content);
    const enums = parseEnums(content);
    fs.unlinkSync(req.file.path);
    res.json({ success: true, models, enums });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/generate', (req, res) => {
  try {
    const { models, counts, startIds, enums } = req.body || {};
    if (!models || typeof models !== 'object') {
      return res.status(400).json({ success: false, error: 'Missing models in body' });
    }

    const doTag = `vko_seed_${Date.now().toString(16)}`;
    const doDollar = `$${doTag}$`;

    // Wrap each statement in a DO block with EXCEPTION handling so one invalid/failed insert
    // does not abort the execution of the remaining document (PostgreSQL).
    const wrapSafe = (statement) => `DO ${doDollar}
BEGIN
  BEGIN
    ${statement};
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'SKIP statement due to error: % [%]', SQLERRM, SQLSTATE;
  END;
END
${doDollar};
`;

    let sqlFile =
      '-- Archivo de insercion SQL generado automaticamente para PostgreSQL (pgAdmin)\n' +
      '-- Nota: cada sentencia se ejecuta dentro de un DO/EXCEPTION para que los errores no detengan el resto del script.\n\n' +
      "SET client_min_messages TO NOTICE;\n\n";
    const warnings = [];
    const generatedIds = {};

    const normalized = normalizeModels(models);
    const normalizedEnums = enums && typeof enums === 'object' ? enums : {};
    const relationMetadata = buildRelationMetadata(normalized);
    const orderedModels = orderModelsByDependencies(normalized, counts);

    for (const [modelName, model] of orderedModels) {
      const tableName = model.tableName || modelName;
      const fields = Array.isArray(model.fields) ? model.fields : [];
      const count = (counts && counts[modelName]) || 0;
      if (!count) continue;

      const startId = parseInt((startIds && startIds[modelName]) || '1', 10) || 1;
      generatedIds[modelName] = [];
      const usedByField = {};
      const usedByGroup = new Map();
      const { uniqueSingles, uniqueGroups, indexedFields } = buildModelConstraints(model, fields);
      const compositePlans = buildCompositeUniquePlans(model, fields, count, normalizedEnums);

      compositePlans.forEach((plan, key) => {
        if (plan.exhausted) {
          warnings.push(
            `-- WARNING: ${model.tableName || modelName} solicita ${count} filas, pero la combinacion unica (${plan.group.join(
              ', '
            )}) solo tiene ${plan.combos.length} combinaciones distintas generables sin repetir valores.`
          );
        }
        usedByGroup.set(key, new Set());
      });

      sqlFile += `-- --------------------------------------------------------\n`;
      sqlFile += `-- Insertando datos para la tabla: ${tableName}\n`;
      sqlFile += `-- --------------------------------------------------------\n`;

      for (let i = 0; i < count; i++) {
        const columns = [];
        const values = [];
        let currentId = null;
        const rowKey = startId + i;
        const rawByField = {};
        const modelRelations = relationMetadata.byModel[modelName]?.relationBySourceField || {};
        const plannedValues = {};

        compositePlans.forEach((plan) => {
          const combo = plan.combos[i];
          if (!combo) return;
          plan.group.forEach((fieldName, index) => {
            plannedValues[fieldName] = combo[index];
          });
        });

        (fields || []).forEach((field) => {
          if (normalized[field.type]) return; // skip relations

          const isIndexed = indexedFields.has(field.name);
          const relation = modelRelations[field.name] || null;
          let raw = null;
          let sqlValue = 'NULL';

          if (Object.prototype.hasOwnProperty.call(plannedValues, field.name)) {
            raw = plannedValues[field.name];
            if (raw == null) sqlValue = 'NULL';
            else if (typeof raw === 'number') sqlValue = String(raw);
            else if (raw === true) sqlValue = 'true';
            else if (raw === false) sqlValue = 'false';
            else sqlValue = asSqlString(raw);
          } else if (shouldNull(field, isIndexed)) {
            raw = null;
            sqlValue = 'NULL';
          } else if (field.isId && field.type === 'Int') {
            raw = startId + i;
            sqlValue = String(raw);
            currentId = raw;
          } else if (field.isId && field.type === 'String') {
            raw = faker.string.uuid();
            sqlValue = asSqlString(raw);
            currentId = raw;
          } else if (
            normalizedEnums[field.type] &&
            Array.isArray(normalizedEnums[field.type]) &&
            normalizedEnums[field.type].length
          ) {
            const picked = pickEnum(normalizedEnums[field.type]);
            raw = isNil(picked) ? 'UNKNOWN' : String(picked);
            sqlValue = asSqlString(raw);
          } else if (field.type === 'String') {
            const lower = String(field.name || '').toLowerCase();
            const isEmail = lower.includes('email');
            const isName = lower.includes('name') || lower.includes('nombre');

            if (uniqueSingles.has(field.name)) {
              if (isEmail) raw = `user${rowKey}@example.com`;
              else if (isName) raw = `${faker.person.fullName()}${makeUniqueSuffix(rowKey)}`;
              else raw = `${faker.lorem.word()}${makeUniqueSuffix(rowKey)}`;
            } else {
              if (isEmail) raw = faker.internet.email();
              else if (isName) raw = faker.person.fullName();
              else raw = faker.lorem.word();
            }
            sqlValue = asSqlString(raw);
          } else if (field.type === 'Int' || field.type === 'Float') {
            if (uniqueSingles.has(field.name)) {
              raw = rowKey;
              sqlValue = String(raw);
            } else {
              const relationValue = pickForeignKeyValue({
                relation,
                field,
                modelName,
                generatedIds,
                currentId,
              });
              if (relationValue.handled) {
                raw = relationValue.raw;
                sqlValue = relationValue.sqlValue;
              } else {
                raw = faker.number.int({ min: 1, max: 1000 });
                sqlValue = String(raw);
              }
            }
          } else if (field.type === 'BigInt') {
            const relationValue = pickForeignKeyValue({
              relation,
              field,
              modelName,
              generatedIds,
              currentId,
            });
            if (relationValue.handled) {
              raw = relationValue.raw;
              sqlValue = relationValue.sqlValue;
            } else if (uniqueSingles.has(field.name)) {
              raw = rowKey;
              sqlValue = String(raw);
            } else {
              raw = faker.number.int({ min: 1, max: 100000 });
              sqlValue = String(raw);
            }
          } else if (field.type === 'Boolean') {
            raw = faker.datatype.boolean();
            sqlValue = raw ? 'true' : 'false';
          } else if (field.type === 'DateTime') {
            raw = faker.date.recent().toISOString();
            sqlValue = asSqlString(raw);
          } else if (field.type === 'Json') {
            const payload = { seed: rowKey, ts: new Date().toISOString() };
            raw = JSON.stringify(payload);
            sqlValue = asSqlString(raw);
          } else {
            if (field.isOptional) {
              raw = null;
              sqlValue = 'NULL';
            } else {
              raw = `${field.type || 'value'}${makeUniqueSuffix(rowKey)}`;
              sqlValue = asSqlString(raw);
            }
          }

          if (uniqueSingles.has(field.name) && raw != null) {
            const isEnum = Boolean(normalizedEnums[field.type]);
            raw = ensureUniqueSingle(usedByField, field.name, raw, rowKey, isEnum);
            if (raw == null) sqlValue = 'NULL';
            else if (typeof raw === 'number') sqlValue = String(raw);
            else if (raw === true) sqlValue = 'true';
            else if (raw === false) sqlValue = 'false';
            else sqlValue = asSqlString(raw);
          }

          columns.push(`"${field.dbName || field.name}"`);
          values.push(sqlValue);
          rawByField[field.name] = raw;
        });

        uniqueGroups.forEach((group) => {
          const groupKey = group.join('|');
          const set = usedByGroup.get(groupKey) || new Set();
          usedByGroup.set(groupKey, set);

          const parts = group.map((name) => rawByField[name]);
          if (!isCompositeKeyEnforceable(parts)) return;
          let key = parts.map((p) => String(p)).join('|');
          if (!set.has(key)) {
            set.add(key);
            return;
          }

          const targetField =
            group.find((name) => {
              const f = fields.find((f) => f.name === name);
              const isEnum = f && Boolean(normalizedEnums[f.type]);
              return typeof rawByField[name] === 'string' && !isEnum;
            }) || group.find((name) => typeof rawByField[name] === 'number') || group[0];

          const curr = rawByField[targetField];
          const fMeta = fields.find((f) => f.name === targetField);
          const isEnum = fMeta && Boolean(normalizedEnums[fMeta.type]);

          const mutated =
            typeof curr === 'number'
              ? curr + 1
              : isEnum
                ? curr // cannot mutate enums with suffixes
                : `${String(curr)}${makeUniqueSuffix(rowKey, set.size)}`;
          rawByField[targetField] = mutated;

          const colName = `"${(fields.find((f) => f.name === targetField)?.dbName) || targetField}"`;
          const idx = columns.indexOf(colName);
          if (idx >= 0) {
            values[idx] = typeof mutated === 'number' ? String(mutated) : asSqlString(mutated);
          }

          key = group.map((name) => String(rawByField[name])).join('|');
          set.add(key);
        });

        if (currentId !== null) {
          generatedIds[modelName].push(currentId);
        }

        const insertSql = `INSERT INTO "${tableName}" (${columns.join(', ')}) VALUES (${values.join(
          ', '
        )})`;
        sqlFile += wrapSafe(insertSql) + '\n';
      }

      sqlFile += '\n';
    }

    if (warnings.length > 0) {
      sqlFile = `${warnings.join('\n')}\n\n${sqlFile}`;
    }

    res.setHeader('Content-Type', 'text/sql; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=seed_pgadmin.sql');
    res.send(sqlFile);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = { sqlGeneratorRouter: router };
