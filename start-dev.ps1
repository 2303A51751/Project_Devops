# PropManageHub - Startup Script for PowerShell
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "   PropManageHub - Property Rental Platform" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Starting Express Backend on port 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev"

Start-Sleep -Seconds 2

Write-Host "Starting Vite Frontend on port 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host ""
Write-Host "===================================================" -ForegroundColor Green
Write-Host "  Both services launched in separate windows!" -ForegroundColor Green
Write-Host "  Frontend URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Backend API:  http://localhost:5000/api" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Green

