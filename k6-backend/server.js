const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { analyzeProject } = require('./analyzer.js');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });
const HISTORY_FILE = path.join(__dirname, 'test_history.json');

const saveToHistory = (testData) => {
    let history = [];
    if (fs.existsSync(HISTORY_FILE)) {
        try { history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8')); } catch (e) { }
    }
    history.unshift({ id: Date.now().toString(), timestamp: new Date().toISOString(), ...testData });
    // Limitar historial a los ultimos 50 para rendimiento
    if(history.length > 50) history = history.slice(0, 50);
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
};

app.get('/api/history', (req, res) => {
    if (fs.existsSync(HISTORY_FILE)) {
        try {
            res.json(JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8')));
        } catch (e) { res.status(500).json({ error: 'Error leyendo historial' }); }
    } else {
        res.json([]);
    }
});

// Ruta 1: Modo Singular
app.post('/api/run-test', (req, res) => {
    const { url, vus, duration } = req.body;
    
    if (!url) return res.status(400).json({ error: 'Falta la URL' });

    const k6Bin = fs.existsSync('C:\\Program Files\\k6\\k6.exe') ? '"C:\\Program Files\\k6\\k6.exe"' : 'k6';
    const command = `${k6Bin} run script.js --summary-export=summary.json`;
    
    exec(command, { env: { ...process.env, TARGET_URL: url, VUS: vus, DURATION: duration } }, (error, stdout, stderr) => {
        try {
            if (fs.existsSync('summary.json')) {
                const summary = JSON.parse(fs.readFileSync('summary.json', 'utf8'));
                saveToHistory({ type: 'single', url, vus, duration, metrics: summary.metrics });
                res.json({ metrics: summary.metrics });
            } else {
                res.status(500).json({ error: 'No se generaron las métricas (summary.json no encontrado).' });
            }
        } catch (e) {
            res.status(500).json({ error: 'Error procesando resultado: ' + e.message });
        }
    });
});

// Ruta 2: Auto Discovery, Sube ZIP y Analiza
app.post('/api/analyze-zip', upload.single('projectFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const zipPath = req.file.path;
    const extractPath = path.join(__dirname, 'unzipped', req.file.filename);
    
    try {
        const endpoints = analyzeProject(zipPath, extractPath);
        fs.writeFileSync('endpoints_encontrados.txt', JSON.stringify(endpoints, null, 2));
        res.json({ config: endpoints });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Ruta 3: Batería Múltiple (Auto Discovery)
app.post('/api/run-multiple', (req, res) => {
    const { endpoints, baseUrl, vus, duration } = req.body;
    
    if (!endpoints || !endpoints.length) {
        return res.status(400).json({ error: 'No endpoints' });
    }

    let scriptContent = `
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: ${vus || 10},
  duration: '${duration || 5}s',
};

const BASE_URL = '${baseUrl || 'http://localhost:3000'}';

export default function () {
    let res;
    let url;
    let payload;
    let params = { headers: { 'Content-Type': 'application/json' } };
`;

    endpoints.forEach(ep => {
        // Reemplazar parametros como :id, :usuarioId por 1 para el testing dummy
        const cleanRoute = (ep.route || '').replace(/:[a-zA-Z0-9_]+/g, '1').replace(/\(\.\*\)/g, '');
        
        scriptContent += `\n    // Method: ${ep.method}\n`;
        scriptContent += `    url = BASE_URL + '${cleanRoute.startsWith('/') ? cleanRoute : '/' + cleanRoute}';\n`;
        
        if (['POST', 'PUT', 'PATCH'].includes(ep.method)) {
            const pl = ep.payload ? JSON.stringify(ep.payload) : '{}';
            scriptContent += `    payload = JSON.stringify(${pl});\n`;
            scriptContent += `    res = http.${ep.method.toLowerCase()}(url, payload, params);\n`;
        } else if (ep.method === 'DELETE') {
            scriptContent += `    res = http.del(url, null, params);\n`;
        } else {
            scriptContent += `    res = http.get(url, params);\n`;
        }
        
        scriptContent += `    check(res, { '${cleanRoute} responds with ok target': (r) => r.status >= 200 && r.status < 500 });\n`;
    });

    scriptContent += `\n    sleep(1);\n}\n`;

    fs.writeFileSync('generated_script.js', scriptContent);

    const k6Bin = fs.existsSync('C:\\Program Files\\k6\\k6.exe') ? '"C:\\Program Files\\k6\\k6.exe"' : 'k6';
    const command = `${k6Bin} run generated_script.js --summary-export=summary.json`;
    
    exec(command, (error, stdout, stderr) => {
        try {
            if (fs.existsSync('summary.json')) {
                const summary = JSON.parse(fs.readFileSync('summary.json', 'utf8'));
                saveToHistory({ type: 'multi', endpointsCount: endpoints.length, baseUrl, vus, duration, metrics: summary.metrics });
                res.json({ metrics: summary.metrics });
            } else {
                const k6Log = stderr || stdout || (error ? error.message : "Desconocido");
                res.status(500).json({ error: 'K6 fallo al ejecutar:\n' + k6Log });
            }
        } catch (e) {
            res.status(500).json({ error: 'Error procesando resultados multiples: ' + e.message });
        }
    });
});

app.listen(3001, () => {
    console.log('Backend K6 Dashboard escuchando puerto 3001...');
});
