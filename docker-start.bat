@echo off
echo ========================================================
echo   Property Rental Platform - Docker Multi-Container Run
echo ========================================================
echo.
echo Checking for Docker...
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker was not found in your system PATH.
    echo Please install Docker Desktop for Windows or ensure Docker service is running.
    pause
    exit /b 1
)

echo Building and starting containers (MongoDB + Backend + Frontend)...
docker compose up --build -d

echo.
echo Containers started successfully!
echo   Frontend Web Portal:  http://localhost
echo   Backend Health API:   http://localhost:5000/api/health
echo   MongoDB Port:         localhost:27017
echo.
echo Use "docker compose logs -f" to stream live logs.
echo Use "docker-stop.bat" or "docker compose down" to stop containers.
echo.
pause
