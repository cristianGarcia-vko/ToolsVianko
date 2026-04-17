const { detectFormat } = require('./detector');
const { JsonParser } = require('./parsers/jsonParser');
const { CsvParser } = require('./parsers/csvParser');
const { XmlParser } = require('./parsers/xmlParser');
const { SqlInsertParser } = require('./parsers/sqlInsertParser');
const { parsePrismaSchema, pickBestModelTemplate } = require('./prismaSchema');
const { buildNormalizedDataset, applyMapping, buildDefaultMapping } = require('./transformers');
const { exportDataset } = require('./exporters');
const { inferColumnTypes, takePreviewRows } = require('./utils');

class ViankoDataMigrator {
  constructor() {
    this.parsers = [new JsonParser(), new CsvParser(), new XmlParser(), new SqlInsertParser()];
  }

  registerParser(parser) {
    this.parsers.push(parser);
  }

  detect(fileName, buffer) {
    return detectFormat({ fileName, buffer });
  }

  parseSource({ fileName, buffer }) {
    const detection = this.detect(fileName, buffer);
    const parser = this.parsers.find((candidate) => candidate.canParse({ format: detection.format }));
    if (!parser) {
      throw new Error(`No existe parser para formato detectado: ${detection.format}`);
    }
    const parsed = parser.parse({ fileName, buffer, format: detection.format });
    return { detection, parsed };
  }

  parsePrismaTemplate(schemaBuffer) {
    if (!schemaBuffer) return null;
    const schema = parsePrismaSchema(schemaBuffer);
    return schema;
  }

  analyze({ sourceFileName, sourceBuffer, schemaBuffer }) {
    const { detection, parsed } = this.parseSource({
      fileName: sourceFileName,
      buffer: sourceBuffer,
    });
    const prismaSchema = this.parsePrismaTemplate(schemaBuffer);
    const template = pickBestModelTemplate({
      models: prismaSchema?.models || [],
      columns: parsed.columns,
    });
    const inferredTypes = inferColumnTypes(parsed.rows, parsed.columns);
    const mappingConfig = buildDefaultMapping({
      columns: parsed.columns,
      inferredTypes,
      prismaTemplate: template,
    });

    return {
      detection,
      format: parsed.format,
      columns: parsed.columns,
      inferredTypes,
      rowCount: parsed.rows.length,
      previewRows: takePreviewRows(parsed.rows, 25),
      tableNameHint: parsed.meta?.tableName || mappingConfig.tableName || 'imported_data',
      prismaTemplate: template,
      mappingConfig,
    };
  }

  convert({ sourceFileName, sourceBuffer, schemaBuffer, mappingConfig, outputFormat }) {
    const { parsed } = this.parseSource({ fileName: sourceFileName, buffer: sourceBuffer });
    const prismaSchema = this.parsePrismaTemplate(schemaBuffer);
    const template = pickBestModelTemplate({
      models: prismaSchema?.models || [],
      columns: parsed.columns,
    });

    let dataset;
    if (mappingConfig && Object.keys(mappingConfig).length > 0) {
      dataset = applyMapping({ rows: parsed.rows, mappingConfig });
    } else {
      dataset = buildNormalizedDataset({
        rows: parsed.rows,
        columns: parsed.columns,
        prismaTemplate: template,
      });
    }

    const exported = exportDataset({ format: outputFormat, dataset });
    return {
      dataset,
      export: exported,
    };
  }
}

module.exports = { ViankoDataMigrator };
