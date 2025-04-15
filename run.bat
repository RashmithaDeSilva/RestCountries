@echo off
setlocal enabledelayedexpansion

:: Get the directory where this batch file is located
set "SCRIPT_DIR=%~dp0"

:: Configuration - Set your project paths relative to the batch file location
set "FRONTEND_PATH=%SCRIPT_DIR%frontend"
set "BACKEND_PATH=%SCRIPT_DIR%backend"

:: Verify paths exist
if not exist "%FRONTEND_PATH%" (
    echo Error: Frontend path not found at %FRONTEND_PATH%
    pause
    exit /b 1
)

if not exist "%BACKEND_PATH%" (
    echo Error: Backend path not found at %BACKEND_PATH%
    pause
    exit /b 1
)

:: Ask for environment
:env_prompt
echo Select environment:
echo 1. Development (npm run dev)
echo 2. Production (npm run start)
set /p ENV_CHOICE="Enter choice (1 or 2): "

if "%ENV_CHOICE%"=="1" (
    set FRONTEND_CMD=npm run dev
    set BACKEND_CMD=npm run dev
) else if "%ENV_CHOICE%"=="2" (
    set FRONTEND_CMD=npm run start
    set BACKEND_CMD=npm run start
) else (
    echo Invalid choice, please try again
    goto env_prompt
)

:: Update repositories
echo Updating repositories...
cd /d "%FRONTEND_PATH%"
git pull
cd /d "%BACKEND_PATH%"
git pull

:: Run frontend
start "Frontend" cmd /k "cd /d "%FRONTEND_PATH%" && echo Installing frontend dependencies... && npm install && echo Starting frontend... && %FRONTEND_CMD% && pause"

:: Run backend
timeout /t 2 /nobreak >nul
start "Backend" cmd /k "cd /d "%BACKEND_PATH%" && echo Installing backend dependencies... && npm install && echo Starting backend... && %BACKEND_CMD% && pause"

echo Both projects are starting in separate windows...
endlocal