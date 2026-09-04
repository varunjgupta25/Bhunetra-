@echo off
title BHUNETRA Local Dev Launcher
cls
echo ========================================================
echo   BHUNETRA - Land Record Digitization & Validation System
echo   Ministry of Rural Development & DoLR (SIH26018)
echo ========================================================
echo.

where python >nul 2>nul
if errorlevel 1 (
  echo Python was not found in PATH. Install Python and retry.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found in PATH. Install Node.js and retry.
  pause
  exit /b 1
)

echo [1/2] Launching FastAPI Backend Server on http://localhost:8000...
start "BHUNETRA Backend (FastAPI)" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo [2/2] Launching Vite Frontend Server on http://localhost:5173...
start "BHUNETRA Frontend (Vite + React)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo   🚀 BHUNETRA Local Servers Successfully Started!
echo.
echo   ➜ Frontend App:  http://localhost:5173
echo   ➜ Backend Docs:  http://localhost:8000/docs
echo.
echo   Keep the newly opened console windows open while testing.
echo ========================================================
pause
