@echo off
title Vianko Unified Tool Hub
echo ===================================================
echo   VIANKO HUB - INICIANDO SISTEMA TODO-EN-UNO
echo ===================================================

echo [1/2] Levantando el Backend de K6 (Puerto 4001)...
start "K6 Backend" /min cmd /c "cd k6-backend && set PORT=4001&& node server.js"

echo [2/2] Levantando el Hub de Herramientas (Frontend)...
start "Vianko Hub" /min cmd /c "npm run web"

echo.
echo Los servicios se estan levantando de forma silenciosa...
echo.
echo - Banner Studio + K6 Hub: http://localhost:3013
echo - Backend K6 Directo: http://localhost:4001
echo ===================================================
echo.
echo Esperando 5 segundos para que los puertos se estabilicen...
timeout /t 5 >nul
echo ¡Listo! Ya puedes usar las herramientas.
pause
