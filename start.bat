@echo off
title BHUNETRA Unified Server Launcher
cls
echo ========================================================
echo   BHUNETRA - Unified Single-Port Application (SIH26018)
echo   FastAPI + React SPA Unified on Port 8000
echo ========================================================
echo.

echo Launching Unified BHUNETRA Application on http://localhost:8000...
start "BHUNETRA Unified Application" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

echo.
echo ========================================================
echo   🚀 BHUNETRA Successfully Started on Single Port!
echo.
echo   ➜ Application (All-in-One): http://localhost:8000
echo   ➜ Login Portal:             http://localhost:8000/login
echo   ➜ Citizen Portal:           http://localhost:8000/citizen
echo   ➜ Officer Dashboard:        http://localhost:8000/dashboard
echo   ➜ Interactive API Docs:     http://localhost:8000/docs
echo.
echo   One common port for everything. No CORS or port mismatch!
echo ========================================================
timeout /t 3 >nul
start http://localhost:8000/login
