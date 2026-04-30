const express = require('express');
const { runAnalysis } = require('./index.js');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const router = express.Router();

// Estado en memoria de los escaneos (simplificado para la demo)
const scansInProgress = new Map();

router.post('/scan', async (req, res) => {
  const { targetPath } = req.body;

  if (!targetPath) {
    return res.status(400).json({ error: 'Falta targetPath' });
  }

  const absolutePath = path.resolve(targetPath);

  if (!fs.existsSync(absolutePath)) {
    return res.status(404).json({ error: 'La ruta especificada no existe en el servidor' });
  }

  const scanId = `scan_${Date.now()}`;
  scansInProgress.set(scanId, { status: 'running', progress: null, results: null });

  // Ejecutamos en background
  runAnalysis(absolutePath, (progressData) => {
    // Callback de progreso
    const currentScan = scansInProgress.get(scanId);
    if (currentScan) {
      currentScan.progress = progressData;
    }
  }).then(results => {
    const currentScan = scansInProgress.get(scanId);
    if (currentScan) {
      currentScan.status = 'completed';
      currentScan.results = results;
    }
  }).catch(error => {
    const currentScan = scansInProgress.get(scanId);
    if (currentScan) {
      currentScan.status = 'error';
      currentScan.error = error.message;
    }
  });

  return res.json({ scanId, message: 'Analisis iniciado' });
});

router.get('/status/:scanId', (req, res) => {
  const { scanId } = req.params;
  const scanData = scansInProgress.get(scanId);

  if (!scanData) {
    return res.status(404).json({ error: 'Scan no encontrado' });
  }

  return res.json(scanData);
});

router.get('/pick-folder', (req, res) => {
  // Use PowerShell to open a FolderBrowserDialog
  const psCommand = `
    Add-Type -AssemblyName System.windows.forms
    $folderBrowser = New-Object System.Windows.Forms.FolderBrowserDialog
    $folderBrowser.Description = "Selecciona el directorio a escanear"
    $folderBrowser.ShowNewFolderButton = $false
    $result = $folderBrowser.ShowDialog()
    if ($result -eq [System.Windows.Forms.DialogResult]::OK) {
        Write-Output $folderBrowser.SelectedPath
    }
  `;

  exec(`powershell.exe -NoProfile -Command "${psCommand.replace(/\n/g, ';')}"`, (error, stdout) => {
    if (error) {
      return res.status(500).json({ error: 'Error abriendo el selector de carpetas' });
    }
    const selectedPath = stdout.trim();
    return res.json({ path: selectedPath });
  });
});

module.exports = { imageAnalyzerRouter: router };
