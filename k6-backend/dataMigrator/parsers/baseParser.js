class BaseParser {
  constructor(format) {
    this.format = format;
  }

  canParse(_context) {
    return false;
  }

  parse(_context) {
    throw new Error('Parser no implementado');
  }
}

module.exports = { BaseParser };
