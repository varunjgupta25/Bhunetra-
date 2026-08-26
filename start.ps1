# BHUNETRA PowerShell Server Launcher
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  BHUNETRA - Land Record Digitization & Validation System" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent

Write-Host "`n[1/2] Starting FastAPI Backend on http://localhost:8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ScriptDir\backend'; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

Start-Sleep -Seconds 2

Write-Host "[2/2] Starting Vite Frontend on http://localhost:5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ScriptDir\frontend'; npm run dev"

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "  🚀 BHUNETRA Local Dev Servers Live!" -ForegroundColor Green
Write-Host "  ➜ Frontend App:  http://localhost:5173" -ForegroundColor Yellow
Write-Host "  ➜ Backend Docs:  http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
