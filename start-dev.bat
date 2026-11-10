@echo off
title PropManageHub - Startup Script
echo ===================================================
echo   PropManageHub - Property Rental Platform
echo ===================================================
echo Starting Express.js Backend on port 5000...
start "PropManageHub Backend (Port 5000)" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Vite React Frontend on port 3000...
start "PropManageHub Frontend (Port 3000)" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo   Both services launched in separate windows!
echo   Frontend URL: http://localhost:3000
echo   Backend API:  http://localhost:5000/api
echo ===================================================
pause
