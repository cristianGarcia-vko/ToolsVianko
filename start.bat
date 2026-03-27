@echo off
title Vianko Unified Tool Hub
echo ===================================================
echo   VIANKO HUB - INICIANDO SISTEMA TODO-EN-UNO
echo ===================================================

echo [1/2] Levantando el Backend de K6...
start "K6 Backend" /min cmd /c "cd k6-backend && node server.js"

echo [2/2] Levantando el Frontend...
start "Vianko Hub" /min cmd /c "npm run web"

echo.
echo Los servicios se estan levantando de forma silenciosa...
echo.
echo - Banner Studio + K6 Hub: http://localhost:8081
echo ===================================================
timeout /t 5 >nul
exit
