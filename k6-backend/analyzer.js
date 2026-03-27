const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

// Recursive file search
const getAllFiles = (dirPath, arrayOfFiles) => {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.js') || file.endsWith('.ts')) {
          arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
};

// Parser to find endpoints and payloads
const analyzeProject = (zipFilePath, extractPath) => {
  // Extract zip
  try {
      const zip = new AdmZip(zipFilePath);
      zip.extractAllTo(extractPath, true);
  } catch(e) {
      throw new Error("El archivo no es un ZIP valido o esta corrupto");
  }

  const jsFiles = getAllFiles(extractPath);
  const endpointsToTest = [];

  // Regex para encontrar rutas de express: app.post('...', o router.get('...'
  const routeRegex = /(?:app|router)\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/g;
  
  // Regex para payloads desestructurados: const { email, password } = req.body
  const destructureBodyRegex = /const\s+\{([^}]+)\}\s*=\s*req\.body/g;
  
  // Regex para accesos directos: req.body.username
  const directBodyRegex = /req\.body\.([a-zA-Z0-9_]+)/g;

  jsFiles.forEach(file => {
      // Ignorar modulos, dist, build, etc.
      if (file.includes('node_modules') || file.includes('dist') || file.includes('.test')) return;

      const content = fs.readFileSync(file, 'utf-8');
      
      let routeMatch;
      while ((routeMatch = routeRegex.exec(content)) !== null) {
          const method = routeMatch[1].toUpperCase();
          const routePath = routeMatch[2];
          
          let payload = null;

          // Si es un metodo que usualmente lleva body, buscamos campos
          if (['POST', 'PUT', 'PATCH'].includes(method)) {
              payload = {};
              
              // Empezar a buscar desde donde encontramos la ruta (esto es muy basico pero sirve de MVP)
              const startIndex = routeMatch.index;
              const snippet = content.slice(startIndex, startIndex + 1000); // tomar los sig 1000 chars

              // Buscar desestructuraciones en el bloque
              let dMatch;
              while ((dMatch = destructureBodyRegex.exec(snippet)) !== null) {
                  const vars = dMatch[1].split(',').map(v => v.trim()).filter(Boolean);
                  vars.forEach(v => {
                    // ignorar asignaciones con : como "const { a: b } = req.body" por ahora
                    const keyName = v.split(':')[0].trim();
                     payload[keyName] = `mock_${keyName}`; 
                  });
              }

              // Buscar accesos directos
              let bMatch;
              while ((bMatch = directBodyRegex.exec(snippet)) !== null) {
                  const keyName = bMatch[1].trim();
                  payload[keyName] = `mock_${keyName}`;
              }

              // Si no encontramos nada, dejamos un body vacio de ejemplo
              if (Object.keys(payload).length === 0) {
                  payload = { "ejemplo": "reemplazar_con_datos_reales" };
              }
          }

          endpointsToTest.push({
              method,
              route: routePath,
              payload
          });
      }
  });

  return endpointsToTest;
};

module.exports = { analyzeProject };
