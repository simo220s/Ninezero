@echo off
REM ============================================
REM Prepare Offline Deployment Package (Windows)
REM ============================================
REM This script creates a complete offline deployment package
REM that can be transferred to machines without internet access
REM
REM Usage: prepare-offline-package.bat
REM ============================================

setlocal enabledelayedexpansion

echo ============================================
echo Prepare Offline Deployment Package
echo ============================================
echo.

REM Configuration
set PACKAGE_NAME=saudi-english-club-offline-%date:~-4,4%%date:~-10,2%%date:~-7,2%
set PACKAGE_DIR=offline-packages\%PACKAGE_NAME%

REM ============================================
REM Pre-flight Checks
REM ============================================

echo [INFO] Checking prerequisites...

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed
    pause
    exit /b 1
)

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed
    pause
    exit /b 1
)

echo [SUCCESS] Prerequisites check passed
echo.

REM ============================================
REM Create Package Directory
REM ============================================

echo [INFO] Creating package directory...
if not exist "offline-packages" mkdir offline-packages
if not exist "%PACKAGE_DIR%" mkdir "%PACKAGE_DIR%"
if not exist "%PACKAGE_DIR%\source" mkdir "%PACKAGE_DIR%\source"
echo [SUCCESS] Package directory created: %PACKAGE_DIR%
echo.

REM ============================================
REM Install Dependencies
REM ============================================

echo [INFO] Installing frontend dependencies...
call npm ci --production
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Frontend dependencies installed
echo.

echo [INFO] Installing backend dependencies...
cd auth-backend
call npm ci --production
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install backend dependencies
    cd ..
    pause
    exit /b 1
)
cd ..
echo [SUCCESS] Backend dependencies installed
echo.

REM ============================================
REM Copy Source Code
REM ============================================

echo [INFO] Copying source code...

REM Copy frontend files
xcopy /E /I /Y src "%PACKAGE_DIR%\source\src" >nul
xcopy /E /I /Y public "%PACKAGE_DIR%\source\public" >nul
copy package.json "%PACKAGE_DIR%\source\" >nul
copy package-lock.json "%PACKAGE_DIR%\source\" >nul
copy tsconfig.json "%PACKAGE_DIR%\source\" >nul
copy tsconfig.node.json "%PACKAGE_DIR%\source\" >nul
copy vite.config.ts "%PACKAGE_DIR%\source\" >nul
copy index.html "%PACKAGE_DIR%\source\" >nul
copy tailwind.config.js "%PACKAGE_DIR%\source\" >nul
if exist postcss.config.js copy postcss.config.js "%PACKAGE_DIR%\source\" >nul

REM Copy backend files
mkdir "%PACKAGE_DIR%\source\auth-backend"
xcopy /E /I /Y auth-backend\src "%PACKAGE_DIR%\source\auth-backend\src" >nul
xcopy /E /I /Y auth-backend\migrations "%PACKAGE_DIR%\source\auth-backend\migrations" >nul
xcopy /E /I /Y auth-backend\scripts "%PACKAGE_DIR%\source\auth-backend\scripts" >nul
copy auth-backend\package.json "%PACKAGE_DIR%\source\auth-backend\" >nul
copy auth-backend\package-lock.json "%PACKAGE_DIR%\source\auth-backend\" >nul
copy auth-backend\tsconfig.json "%PACKAGE_DIR%\source\auth-backend\" >nul
copy auth-backend\ecosystem.config.js "%PACKAGE_DIR%\source\auth-backend\" >nul
copy auth-backend\Dockerfile "%PACKAGE_DIR%\source\auth-backend\" >nul

REM Copy environment examples
if exist .env.example (
    copy .env.example "%PACKAGE_DIR%\source\" >nul
) else (
    copy .env "%PACKAGE_DIR%\source\.env.example" >nul
)

if exist auth-backend\.env.example (
    copy auth-backend\.env.example "%PACKAGE_DIR%\source\auth-backend\" >nul
) else (
    copy auth-backend\.env "%PACKAGE_DIR%\source\auth-backend\.env.example" >nul
)

REM Copy documentation
if exist README.md copy README.md "%PACKAGE_DIR%\source\" >nul
if exist LOCAL_DEPLOYMENT_GUIDE.md copy LOCAL_DEPLOYMENT_GUIDE.md "%PACKAGE_DIR%\source\" >nul
if exist DEPLOYMENT_GUIDE.md copy DEPLOYMENT_GUIDE.md "%PACKAGE_DIR%\source\" >nul
if exist QUICK_START.md copy QUICK_START.md "%PACKAGE_DIR%\source\" >nul

REM Copy scripts
mkdir "%PACKAGE_DIR%\source\scripts"
xcopy /Y scripts\*.sh "%PACKAGE_DIR%\source\scripts\" >nul 2>nul
xcopy /Y scripts\*.bat "%PACKAGE_DIR%\source\scripts\" >nul 2>nul

echo [SUCCESS] Source code copied
echo.

REM ============================================
REM Package node_modules
REM ============================================

echo [INFO] Packaging frontend dependencies...
echo This may take a few minutes...
tar -czf "%PACKAGE_DIR%\frontend-node_modules.tar.gz" node_modules
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] tar command failed, trying alternative method...
    powershell -command "Compress-Archive -Path node_modules -DestinationPath '%PACKAGE_DIR%\frontend-node_modules.zip' -Force"
)
echo [SUCCESS] Frontend dependencies packaged
echo.

echo [INFO] Packaging backend dependencies...
cd auth-backend
tar -czf "..\%PACKAGE_DIR%\backend-node_modules.tar.gz" node_modules
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] tar command failed, trying alternative method...
    powershell -command "Compress-Archive -Path node_modules -DestinationPath '..\%PACKAGE_DIR%\backend-node_modules.zip' -Force"
)
cd ..
echo [SUCCESS] Backend dependencies packaged
echo.

REM ============================================
REM Create Installation Scripts
REM ============================================

echo [INFO] Creating installation scripts...

REM Create Windows installation script
(
echo @echo off
echo ============================================
echo Saudi English Club - Offline Installation
echo ============================================
echo.
echo.
echo where node ^>nul 2^>nul
echo if %%ERRORLEVEL%% NEQ 0 ^(
echo     echo ERROR: Node.js is not installed
echo     echo Please install Node.js 18+ before running this script
echo     pause
echo     exit /b 1
echo ^)
echo.
echo echo Node.js version:
echo node --version
echo echo.
echo.
echo echo [INFO] Extracting source code...
echo xcopy /E /I /Y source\* .
echo echo [SUCCESS] Source code extracted
echo echo.
echo.
echo echo [INFO] Extracting frontend dependencies...
echo if exist frontend-node_modules.tar.gz ^(
echo     tar -xzf frontend-node_modules.tar.gz
echo ^) else ^(
echo     powershell -command "Expand-Archive -Path frontend-node_modules.zip -DestinationPath . -Force"
echo ^)
echo echo [SUCCESS] Frontend dependencies extracted
echo echo.
echo.
echo echo [INFO] Extracting backend dependencies...
echo cd auth-backend
echo if exist ..\backend-node_modules.tar.gz ^(
echo     tar -xzf ..\backend-node_modules.tar.gz
echo ^) else ^(
echo     powershell -command "Expand-Archive -Path ..\backend-node_modules.zip -DestinationPath . -Force"
echo ^)
echo cd ..
echo echo [SUCCESS] Backend dependencies extracted
echo echo.
echo.
echo echo [INFO] Configuring environment...
echo if not exist ".env" ^(
echo     copy .env.example .env
echo     echo [INFO] Created .env file - please configure it
echo ^)
echo.
echo if not exist "auth-backend\.env" ^(
echo     copy auth-backend\.env.example auth-backend\.env
echo     echo [INFO] Created auth-backend\.env file - please configure it
echo ^)
echo echo.
echo.
echo echo ============================================
echo echo Installation completed!
echo echo ============================================
echo echo.
echo echo Next steps:
echo echo 1. Configure .env files with your settings
echo echo 2. Run: cd auth-backend ^&^& npm run migrate
echo echo 3. Start backend: cd auth-backend ^&^& npm run dev
echo echo 4. Start frontend: npm run dev
echo echo.
echo echo ============================================
echo echo.
echo.
echo pause
) > "%PACKAGE_DIR%\INSTALL.bat"

echo [SUCCESS] Installation scripts created
echo.

REM ============================================
REM Create README
REM ============================================

echo [INFO] Creating README...

(
echo ============================================
echo Saudi English Club - Offline Package
echo ============================================
echo.
echo This package contains everything needed to deploy Saudi English Club LMS
echo on a machine without internet access.
echo.
echo CONTENTS:
echo ---------
echo - source/                    : Application source code
echo - frontend-node_modules.tar.gz : Frontend dependencies
echo - backend-node_modules.tar.gz  : Backend dependencies
echo - INSTALL.bat                : Windows installation script
echo - README.txt                 : This file
echo.
echo REQUIREMENTS:
echo -------------
echo - Node.js 18+ LTS
echo - npm ^(comes with Node.js^)
echo - 2GB free disk space
echo - Supabase account ^(for database^)
echo.
echo INSTALLATION:
echo -------------
echo.
echo Windows:
echo   1. Extract this package
echo   2. Double-click INSTALL.bat
echo   3. Follow the instructions
echo.
echo CONFIGURATION:
echo --------------
echo.
echo After installation, configure these files:
echo.
echo 1. .env ^(Frontend configuration^)
echo    - Set VITE_SUPABASE_URL
echo    - Set VITE_SUPABASE_ANON_KEY
echo    - Set VITE_API_URL=http://localhost:3000
echo.
echo 2. auth-backend\.env ^(Backend configuration^)
echo    - Set SUPABASE_URL
echo    - Set SUPABASE_SERVICE_ROLE_KEY
echo    - Set JWT_SECRET ^(minimum 32 characters^)
echo.
echo STARTING THE APPLICATION:
echo -------------------------
echo.
echo 1. Run database migrations:
echo    cd auth-backend
echo    npm run migrate
echo.
echo 2. Start backend ^(in one terminal^):
echo    cd auth-backend
echo    npm run dev
echo.
echo 3. Start frontend ^(in another terminal^):
echo    npm run dev
echo.
echo 4. Access at:
echo    - Frontend: http://localhost:5173
echo    - Backend: http://localhost:3000
echo.
echo TROUBLESHOOTING:
echo ----------------
echo.
echo If you encounter issues:
echo 1. Check that Node.js 18+ is installed
echo 2. Verify environment files are configured
echo 3. Check that ports 3000 and 5173 are available
echo 4. Review logs in auth-backend\logs\
echo.
echo For detailed documentation, see:
echo - source\LOCAL_DEPLOYMENT_GUIDE.md
echo - source\DEPLOYMENT_GUIDE.md
echo.
echo SUPPORT:
echo --------
echo For issues or questions, contact your system administrator.
echo.
echo Package created: %date% %time%
echo Version: 1.0.0
echo ============================================
) > "%PACKAGE_DIR%\README.txt"

echo [SUCCESS] README created
echo.

REM ============================================
REM Create Archive
REM ============================================

echo [INFO] Creating final archive...
echo This may take several minutes...

cd offline-packages
if exist "%PACKAGE_NAME%.zip" del "%PACKAGE_NAME%.zip"
powershell -command "Compress-Archive -Path '%PACKAGE_NAME%' -DestinationPath '%PACKAGE_NAME%.zip' -Force"
cd ..

for %%A in ("offline-packages\%PACKAGE_NAME%.zip") do set ARCHIVE_SIZE=%%~zA
set /a ARCHIVE_SIZE_MB=%ARCHIVE_SIZE% / 1048576

echo [SUCCESS] Archive created: offline-packages\%PACKAGE_NAME%.zip
echo [SUCCESS] Archive size: %ARCHIVE_SIZE_MB% MB
echo.

REM ============================================
REM Summary
REM ============================================

echo ============================================
echo Offline Package Created Successfully!
echo ============================================
echo.
echo Package location: offline-packages\%PACKAGE_NAME%.zip
echo Package size: %ARCHIVE_SIZE_MB% MB
echo.
echo To use this package:
echo 1. Transfer the .zip file to the offline machine
echo 2. Extract the archive
echo 3. Run: INSTALL.bat
echo.
echo ============================================
echo.

pause
