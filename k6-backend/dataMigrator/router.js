const express = require('express');
const multer = require('multer');
const { ViankoDataMigrator } = require('./engine');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
const migrator = new ViankoDataMigrator();

const parseMappingConfig = (raw) => {
  if (!raw) return null;
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(String(raw));
  } catch {
    return null;
  }
};

router.post(
  '/analyze',
  upload.fields([
    { name: 'sourceFile', maxCount: 1 },
    { name: 'schemaFile', maxCount: 1 },
  ]),
  (req, res) => {
    try {
      const sourceFile = req.files?.sourceFile?.[0];
      const schemaFile = req.files?.schemaFile?.[0];
      if (!sourceFile) return res.status(400).json({ error: 'sourceFile es requerido' });

      const result = migrator.analyze({
        sourceFileName: sourceFile.originalname,
        sourceBuffer: sourceFile.buffer,
        schemaBuffer: schemaFile?.buffer || null,
      });

      return res.json({ success: true, ...result });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'No se pudo analizar el archivo',
      });
    }
  }
);

router.post(
  '/convert',
  upload.fields([
    { name: 'sourceFile', maxCount: 1 },
    { name: 'schemaFile', maxCount: 1 },
  ]),
  (req, res) => {
    try {
      const sourceFile = req.files?.sourceFile?.[0];
      const schemaFile = req.files?.schemaFile?.[0];
      if (!sourceFile) return res.status(400).json({ error: 'sourceFile es requerido' });

      const mappingConfig = parseMappingConfig(req.body?.mappingConfig);
      const outputFormat = String(req.body?.outputFormat || 'sql');

      const result = migrator.convert({
        sourceFileName: sourceFile.originalname,
        sourceBuffer: sourceFile.buffer,
        schemaBuffer: schemaFile?.buffer || null,
        mappingConfig,
        outputFormat,
      });

      const baseName = sourceFile.originalname.replace(/\.[^.]+$/, '');
      return res.json({
        success: true,
        outputFormat,
        fileName: `${baseName}.${result.export.extension}`,
        mimeType: result.export.mimeType,
        content: result.export.content,
        dataset: {
          tableName: result.dataset.tableName,
          rowCount: result.dataset.rows.length,
          columns: result.dataset.columns,
          types: result.dataset.types,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'No se pudo convertir el archivo',
      });
    }
  }
);

module.exports = { dataMigratorRouter: router };
