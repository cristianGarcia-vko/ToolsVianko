const { app, BrowserWindow } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow;
let k6ServerProcess;
const K6_BACKEND_PORT = process.env.K6_BACKEND_PORT || process.env.PORT || '4001';
const K6_BACKEND_URL = `http://localhost:${K6_BACKEND_PORT}`;
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: http: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${K6_BACKEND_URL} http://127.0.0.1:${K6_BACKEND_PORT} ws://localhost:${K6_BACKEND_PORT} ws://127.0.0.1:${K6_BACKEND_PORT}`,
  "media-src 'self' data: blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'"
].join('; ');

// We will initialize this once app is ready or at least after we verify app exists
let logPath = '';
function log(msg) {
  const timestamp = new Date().toISOString();
  if (!logPath && app && app.getPath) {
    try {
      logPath = path.join(app.getPath('userData'), 'vianko-studio.log');
    } catch(e) { /* ignore */ }
  }
  const line = `[${timestamp}] ${msg}\n`;
  console.log(line.trim());
  if (logPath) {
    try {
      fs.appendFileSync(logPath, line);
    } catch (err) { /* ignore */ }
  }
}

log(`--- Application Starting (Log: ${logPath}) ---`);

function startLocalServer(callback) {
  const distPath = path.join(__dirname, 'dist');
  
  if (!fs.existsSync(distPath)) {
    log(`CRITICAL ERROR: 'dist' directory not found at ${distPath}`);
  } else {
    log(`'dist' directory found at ${distPath}`);
    const files = fs.readdirSync(distPath);
    log(`'dist' contains: ${files.join(', ')}`);
  }

  const server = http.createServer((req, res) => {
    res.setHeader('Content-Security-Policy', CONTENT_SECURITY_POLICY);
    res.setHeader('X-Content-Type-Options', 'nosniff');

    let requestUrl = req.url.split('?')[0].split('#')[0];
    const normalizedUrl = requestUrl.startsWith('/') ? requestUrl.slice(1) : requestUrl;
    let filePath = path.join(distPath, normalizedUrl === '' ? 'index.html' : normalizedUrl);

    log(`Request: ${req.url} -> ${filePath}`);

    const extname = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpg',
      '.jpeg': 'image/jpg',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.ttf': 'font/ttf',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2'
    };
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        log(`File not found: ${filePath}, falling back to index.html`);
        fs.readFile(path.join(distPath, 'index.html'), (err, fallback) => {
          if (err) {
            log(`Fallback failed: ${err.message}`);
            res.writeHead(404);
            res.end('Not Found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(fallback, 'utf-8');
          }
        });
        return;
      }

      fs.readFile(filePath, (error, content) => {
        if (error) {
          log(`Error reading file ${filePath}: ${error.code}`);
          res.writeHead(500);
          res.end('Server Error: ' + error.code);
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content, 'utf-8');
        }
      });
    });
  });

  server.listen(0, '127.0.0.1', () => {
    const port = server.address().port;
    log(`Local server running at http://127.0.0.1:${port}`);
    callback(`http://127.0.0.1:${port}`);
  });
}

function createWindow (serverUrl) {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    backgroundColor: '#020205',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#020205',
      symbolColor: '#74b1be',
      height: 35
    },
    autoHideMenuBar: true, 
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    }
  });

  // DevTools disabled by user request
  // mainWindow.webContents.openDevTools();

  mainWindow.loadURL(serverUrl);
  
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    log(`[Renderer] ${message} (${sourceId}:${line})`);
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    log(`Failed to load URL: ${validatedURL}. Error: ${errorDescription} (${errorCode})`);
  });
}

if (app) {
  app.whenReady().then(() => {
    log('App Ready.');
    
    const serverPath = path.join(__dirname, 'k6-backend', 'server.js');
    if (fs.existsSync(serverPath)) {
      log(`Found k6-backend at ${serverPath}. Starting...`);
      k6ServerProcess = spawn('node', [serverPath], {
        stdio: 'inherit',
        env: { ...process.env, PORT: K6_BACKEND_PORT },
      });
      k6ServerProcess.on('error', (err) => {
        log(`Failed to start k6-backend: ${err.message}`);
      });
    } else {
      log('k6-backend/server.js not found.');
      // Intenta buscar index.js si server.js no existe
      const indexBackend = path.join(__dirname, 'k6-backend', 'index.js');
      if (fs.existsSync(indexBackend)) {
        log(`Found k6-backend at ${indexBackend}. Starting...`);
        k6ServerProcess = spawn('node', [indexBackend], {
          stdio: 'inherit',
          env: { ...process.env, PORT: K6_BACKEND_PORT },
        });
      }
    }

    startLocalServer((url) => {
      createWindow(url);
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        startLocalServer((url) => createWindow(url));
      }
    });
  });
} else {
  console.error('[FATAL] No se pudo cargar Electron. Asegúrate de ejecutar este script con "electron main.js"');
}

app.on('window-all-closed', () => {
  log('App closing.');
  if (k6ServerProcess) k6ServerProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (k6ServerProcess) k6ServerProcess.kill();
});
