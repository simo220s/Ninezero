@echo off
REM ============================================
REM Start Local Development Servers (Windows)
REM ============================================
REM This script starts both frontend and backend servers
REM
REM Usage: start-local.bat
REM ============================================

echo ============================================
echo Saudi English Club - Starting Servers
echo ============================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo ERROR: Frontend dependencies not installed
    echo Please run: npm install
    pause
    exit /b 1
)

if not exist "auth-backend\node_modules" (
    echo ERROR: Backend dependencies not installed
    echo Please run: cd auth-backend && npm install
    pause
    exit /b 1
)

REM Check if environment files exist
if not exist ".env" (
    echo ERROR: .env file not found
    echo Please copy .env.example to .env and configure it
    pause
    exit /b 1
)

if not exist "auth-backend\.env" (
    echo ERROR: auth-backend\.env file not found
    echo Please copy auth-backend\.env.example to auth-backend\.env and configure it
    pause
    exit /b 1
)

echo [INFO] Starting backend server...
echo [INFO] Backend will run on http://localhost:3000
echo.

REM Start backend in new window
start "Saudi English Club - Backend" cmd /k "cd auth-backend && npm run dev"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

echo [INFO] Starting frontend server...
echo [INFO] Frontend will run on http://localhost:5173
echo.

REM Start frontend in new window
start "Saudi English Club - Frontend" cmd /k "npm run dev"

echo.
echo ============================================
echo Servers are starting...
echo ============================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Two new windows will open:
echo 1. Backend server window
echo 2. Frontend server window
echo.
echo To stop servers: Close the terminal windows
echo or press Ctrl+C in each window
echo.
echo ============================================
echo.

pause
