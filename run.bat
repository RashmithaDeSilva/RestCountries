@echo off

cd backend
:: Install necessary dependencies
npm install

:: Check if an argument is provided
set ENV=%1
if "%ENV%"=="" set ENV=dev

echo Starting application in %ENV% mode...

:: Run the corresponding script based on the environment
if "%ENV%"=="dev" (
    npm run dev
) else if "%ENV%"=="prod" (
    npm run start
) else if "%ENV%"=="test" (
    npm run test
) else (
    echo Invalid environment. Use 'dev', 'prod', or 'test'.
    exit /b 1
)
