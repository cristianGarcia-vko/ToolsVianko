const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const Tesseract = require('tesseract.js');

// Configuracion
const BATCH_SIZE = 5; // Lote de procesamiento para no saturar memoria RAM
const SUPPORTED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const OUTPUT_FILE = 'analisis_repositorio.json';

// Utilidad para escanear directorios de forma recursiva
async function scanDirectory(dir, fileList = []) {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);

    if (stat.isDirectory()) {
      await scanDirectory(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (SUPPORTED_EXTENSIONS.has(ext)) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

// Procesa una imagen individual: Metadatos y OCR
async function processImage(filePath, worker) {
  try {
    // 1. Extraer Metadatos y pre-procesar para OCR (Mejora precision)
    // El buffer devuelto es en escala de grises y con contraste aumentado
    const { data: preprocessedBuffer, info: metadata } = await sharp(filePath)
      .grayscale()
      .normalize()
      .toBuffer({ resolveWithObject: true });

    // Obtenemos metadatos originales
    const originalMetadata = await sharp(filePath).metadata();

    // 2. OCR con Tesseract.js usando el buffer pre-procesado
    const { data: { text, confidence } } = await worker.recognize(preprocessedBuffer);

    return {
      archivo: path.basename(filePath),
      rutaCompleta: filePath,
      metadatos: {
        formato: originalMetadata.format,
        ancho: originalMetadata.width,
        alto: originalMetadata.height,
        espacioColor: originalMetadata.space,
        densidad: originalMetadata.density || null,
        pesoBytes: originalMetadata.size,
      },
      ocr: {
        textoExtraido: text.trim(),
        confianza: confidence
      },
      estado: 'exito'
    };
  } catch (error) {
    return {
      archivo: path.basename(filePath),
      rutaCompleta: filePath,
      estado: 'error',
      mensajeError: error.message
    };
  }
}

// Lógica principal
async function runAnalysis(targetDir, progressCallback = null) {
  let worker = null;
  const results = [];

  try {
    console.log(`\n🔍 Iniciando escaneo en: ${targetDir}`);
    const files = await scanDirectory(targetDir);
    
    if (files.length === 0) {
      console.log('⚠️ No se encontraron imagenes soportadas en el directorio.');
      return [];
    }

    console.log(`📸 Se encontraron ${files.length} imagenes. Iniciando inicializacion de OCR...`);
    
    // Inicializar Tesseract Worker (se reutiliza para todas las imagenes)
    worker = await Tesseract.createWorker('spa+eng');
    console.log('✅ Motor OCR listo. Iniciando procesamiento por lotes...\n');

    let processedCount = 0;

    // Procesamiento secuencial de lotes para optimizar memoria RAM
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(async (filePath) => {
        const result = await processImage(filePath, worker);
        processedCount++;
        
        const logMsg = `[${processedCount}/${files.length}] Procesado: ${path.basename(filePath)} | Estado: ${result.estado}`;
        console.log(logMsg);
        if (progressCallback) {
          progressCallback({
            total: files.length,
            current: processedCount,
            file: path.basename(filePath),
            status: result.estado
          });
        }
        
        return result;
      });

      // Esperar a que el lote completo termine antes del siguiente
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    const outputFilePath = path.join(targetDir, OUTPUT_FILE);
    await fs.writeFile(outputFilePath, JSON.stringify(results, null, 2), 'utf-8');
    
    console.log(`\n🎉 Analisis completado con exito.`);
    console.log(`💾 Resultados guardados en: ${outputFilePath}`);

    return results;

  } catch (error) {
    console.error('❌ Error fatal durante el analisis:', error);
    throw error;
  } finally {
    // Es critico terminar el worker para liberar recursos
    if (worker) {
      await worker.terminate();
      console.log('♻️ Recursos de OCR liberados.');
    }
  }
}

// Modo CLI: Detecta si el script se ejecuta directamente desde consola
if (require.main === module) {
  const args = process.argv.slice(2);
  const targetDir = args[0] ? path.resolve(args[0]) : process.cwd();

  runAnalysis(targetDir).catch(() => process.exit(1));
}

module.exports = { runAnalysis };
