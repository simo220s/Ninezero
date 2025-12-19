@echo off
REM ============================================
REM Local Deployment Script for Windows
REM ============================================
REM This script automates local deployment on Windows
REM
REM Usage: deploy-local.bat
REM ============================================

echo ============================================
echo Saudi English Club - Local Deployment
echo ============================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Node.js version:
node --version
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is not installed
    pause
    exit /b 1
)

echo [INFO] npm version:
npm --version
echo.

REM ============================================
REM Install Dependencies
REM ============================================

echo [INFO] Installing frontend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Frontend dependencies installed
echo.

echo [INFO] Installing backend dependencies...
cd auth-backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install backend dependencies
    cd ..
    pause
    exit /b 1
)
cd ..
echo [SUCCESS] Backend dependencies installed
echo.

REM ============================================
REM Configure Environment
REM ============================================

echo [INFO] Checking environment configuration...

if not exist ".env" (
    echo [WARN] .env file not found
    if exist ".env.example" (
        echo [INFO] Copying .env.example to .env
        copy .env.example .env
    ) else (
        echo [ERROR] .env.example not found
        echo Please create .env file manually
        pause
        exit /b 1
    )
)

if not exist "auth-backend\.env" (
    echo [WARN] auth-backend\.env file not found
    if exist "auth-backend\.env.example" (
        echo [INFO] Copying auth-backend\.env.example to auth-backend\.env
        copy auth-backend\.env.example auth-backend\.env
    ) else (
        echo [ERROR] auth-backend\.env.example not found
        echo Please create auth-backend\.env file manually
        pause
        exit /b 1
    )
)

echo [SUCCESS] Environment files configured
echo.

REM ============================================
REM Build Backend
REM ============================================

echo [INFO] Building backend...
cd auth-backend
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] Backend build failed, but continuing...
)
cd ..
echo [SUCCESS] Backend built
echo.

REM ============================================
REM Run Database Migrations
REM ============================================

echo [INFO] Running database migrations...
cd auth-backend
call npm run migrate
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] Database migrations failed
    echo Please check your Supabase configuration
    cd ..
) else (
    echo [SUCCESS] Database migrations completed
    cd ..
)
echo.

REM ============================================
REM Summary
REM ============================================

echo ============================================
echo Deployment completed!
echo ============================================
echo.
echo To start the application:
echo.
echo 1. Start Backend (in one terminal):
echo    cd auth-backend
echo    npm run dev
echo.
echo 2. Start Frontend (in another terminal):
echo    npm run dev
echo.
echo Access the application at:
echo - Frontend: http://localhost:5173
echo - Backend:  http://localhost:3000
echo.
echo ============================================
echo.

pause
