#!/bin/bash

# ============================================
# Prepare Offline Deployment Package
# ============================================
# This script creates a complete offline deployment package
# that can be transferred to machines without internet access
#
# Usage: ./prepare-offline-package.sh
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "============================================"
echo "Prepare Offline Deployment Package"
echo "============================================"
echo ""

# Configuration
PACKAGE_NAME="saudi-english-club-offline-$(date +%Y%m%d)"
PACKAGE_DIR="offline-packages/$PACKAGE_NAME"

# ============================================
# Pre-flight Checks
# ============================================

echo -e "${BLUE}[INFO]${NC} Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js is not installed${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}ERROR: npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}[SUCCESS]${NC} Prerequisites check passed"
echo ""

# ============================================
# Create Package Directory
# ============================================

echo -e "${BLUE}[INFO]${NC} Creating package directory..."
mkdir -p "$PACKAGE_DIR"
echo -e "${GREEN}[SUCCESS]${NC} Package directory created: $PACKAGE_DIR"
echo ""

# ============================================
# Install Dependencies
# ============================================

echo -e "${BLUE}[INFO]${NC} Installing frontend dependencies..."
npm ci --production
echo -e "${GREEN}[SUCCESS]${NC} Frontend dependencies installed"
echo ""

echo -e "${BLUE}[INFO]${NC} Installing backend dependencies..."
cd auth-backend
npm ci --production
cd ..
echo -e "${GREEN}[SUCCESS]${NC} Backend dependencies installed"
echo ""

# ============================================
# Copy Source Code
# ============================================

echo -e "${BLUE}[INFO]${NC} Copying source code..."

# Create directory structure
mkdir -p "$PACKAGE_DIR/source"

# Copy frontend files
cp -r src "$PACKAGE_DIR/source/"
cp -r public "$PACKAGE_DIR/source/"
cp package.json "$PACKAGE_DIR/source/"
cp package-lock.json "$PACKAGE_DIR/source/"
cp tsconfig.json "$PACKAGE_DIR/source/"
cp tsconfig.node.json "$PACKAGE_DIR/source/"
cp vite.config.ts "$PACKAGE_DIR/source/"
cp index.html "$PACKAGE_DIR/source/"
cp tailwind.config.js "$PACKAGE_DIR/source/"
cp postcss.config.js "$PACKAGE_DIR/source/" 2>/dev/null || true

# Copy backend files
mkdir -p "$PACKAGE_DIR/source/auth-backend"
cp -r auth-backend/src "$PACKAGE_DIR/source/auth-backend/"
cp -r auth-backend/migrations "$PACKAGE_DIR/source/auth-backend/"
cp -r auth-backend/scripts "$PACKAGE_DIR/source/auth-backend/"
cp auth-backend/package.json "$PACKAGE_DIR/source/auth-backend/"
cp auth-backend/package-lock.json "$PACKAGE_DIR/source/auth-backend/"
cp auth-backend/tsconfig.json "$PACKAGE_DIR/source/auth-backend/"
cp auth-backend/ecosystem.config.js "$PACKAGE_DIR/source/auth-backend/"
cp auth-backend/Dockerfile "$PACKAGE_DIR/source/auth-backend/"

# Copy environment examples
cp .env.example "$PACKAGE_DIR/source/" 2>/dev/null || cp .env "$PACKAGE_DIR/source/.env.example"
cp auth-backend/.env.example "$PACKAGE_DIR/source/auth-backend/" 2>/dev/null || cp auth-backend/.env "$PACKAGE_DIR/source/auth-backend/.env.example"

# Copy documentation
cp README.md "$PACKAGE_DIR/source/" 2>/dev/null || true
cp LOCAL_DEPLOYMENT_GUIDE.md "$PACKAGE_DIR/source/" 2>/dev/null || true
cp DEPLOYMENT_GUIDE.md "$PACKAGE_DIR/source/" 2>/dev/null || true

# Copy scripts
mkdir -p "$PACKAGE_DIR/source/scripts"
cp scripts/*.sh "$PACKAGE_DIR/source/scripts/" 2>/dev/null || true
cp scripts/*.bat "$PACKAGE_DIR/source/scripts/" 2>/dev/null || true

echo -e "${GREEN}[SUCCESS]${NC} Source code copied"
echo ""

# ============================================
# Package node_modules
# ============================================

echo -e "${BLUE}[INFO]${NC} Packaging frontend dependencies..."
tar -czf "$PACKAGE_DIR/frontend-node_modules.tar.gz" node_modules
echo -e "${GREEN}[SUCCESS]${NC} Frontend dependencies packaged"
echo ""

echo -e "${BLUE}[INFO]${NC} Packaging backend dependencies..."
cd auth-backend
tar -czf "../$PACKAGE_DIR/backend-node_modules.tar.gz" node_modules
cd ..
echo -e "${GREEN}[SUCCESS]${NC} Backend dependencies packaged"
echo ""

# ============================================
# Create Installation Script
# ============================================

echo -e "${BLUE}[INFO]${NC} Creating installation script..."

cat > "$PACKAGE_DIR/INSTALL.sh" << 'EOF'
#!/bin/bash

echo "============================================"
echo "Saudi English Club - Offline Installation"
echo "============================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js 18+ before running this script"
    exit 1
fi

echo "Node.js version: $(node --version)"
echo ""

# Extract source code
echo "[INFO] Extracting source code..."
cp -r source/* .
echo "[SUCCESS] Source code extracted"
echo ""

# Extract dependencies
echo "[INFO] Extracting frontend dependencies..."
tar -xzf frontend-node_modules.tar.gz
echo "[SUCCESS] Frontend dependencies extracted"
echo ""

echo "[INFO] Extracting backend dependencies..."
cd auth-backend
tar -xzf ../backend-node_modules.tar.gz
cd ..
echo "[SUCCESS] Backend dependencies extracted"
echo ""

# Configure environment
echo "[INFO] Configuring environment..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "[INFO] Created .env file - please configure it"
fi

if [ ! -f "auth-backend/.env" ]; then
    cp auth-backend/.env.example auth-backend/.env
    echo "[INFO] Created auth-backend/.env file - please configure it"
fi
echo ""

# Make scripts executable
chmod +x scripts/*.sh 2>/dev/null || true
chmod +x auth-backend/scripts/*.sh 2>/dev/null || true

echo "============================================"
echo "Installation completed!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Configure .env files with your settings"
echo "2. Run: cd auth-backend && npm run migrate"
echo "3. Start backend: cd auth-backend && npm run dev"
echo "4. Start frontend: npm run dev"
echo ""
echo "============================================"
EOF

chmod +x "$PACKAGE_DIR/INSTALL.sh"

# Create Windows installation script
cat > "$PACKAGE_DIR/INSTALL.bat" << 'EOF'
@echo off
echo ============================================
echo Saudi English Club - Offline Installation
echo ============================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js 18+ before running this script
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

echo [INFO] Extracting source code...
xcopy /E /I /Y source\* .
echo [SUCCESS] Source code extracted
echo.

echo [INFO] Extracting frontend dependencies...
tar -xzf frontend-node_modules.tar.gz
echo [SUCCESS] Frontend dependencies extracted
echo.

echo [INFO] Extracting backend dependencies...
cd auth-backend
tar -xzf ..\backend-node_modules.tar.gz
cd ..
echo [SUCCESS] Backend dependencies extracted
echo.

echo [INFO] Configuring environment...
if not exist ".env" (
    copy .env.example .env
    echo [INFO] Created .env file - please configure it
)

if not exist "auth-backend\.env" (
    copy auth-backend\.env.example auth-backend\.env
    echo [INFO] Created auth-backend\.env file - please configure it
)
echo.

echo ============================================
echo Installation completed!
echo ============================================
echo.
echo Next steps:
echo 1. Configure .env files with your settings
echo 2. Run: cd auth-backend ^&^& npm run migrate
echo 3. Start backend: cd auth-backend ^&^& npm run dev
echo 4. Start frontend: npm run dev
echo.
echo ============================================
echo.

pause
EOF

echo -e "${GREEN}[SUCCESS]${NC} Installation scripts created"
echo ""

# ============================================
# Create README
# ============================================

echo -e "${BLUE}[INFO]${NC} Creating README..."

cat > "$PACKAGE_DIR/README.txt" << EOF
============================================
Saudi English Club - Offline Package
============================================

This package contains everything needed to deploy Saudi English Club LMS
on a machine without internet access.

CONTENTS:
---------
- source/                    : Application source code
- frontend-node_modules.tar.gz : Frontend dependencies
- backend-node_modules.tar.gz  : Backend dependencies
- INSTALL.sh                 : Linux/Mac installation script
- INSTALL.bat                : Windows installation script
- README.txt                 : This file

REQUIREMENTS:
-------------
- Node.js 18+ LTS
- npm (comes with Node.js)
- 2GB free disk space
- Supabase account (for database)

INSTALLATION:
-------------

Linux/Mac:
  1. Extract this package
  2. Run: chmod +x INSTALL.sh
  3. Run: ./INSTALL.sh
  4. Follow the instructions

Windows:
  1. Extract this package
  2. Double-click INSTALL.bat
  3. Follow the instructions

CONFIGURATION:
--------------

After installation, configure these files:

1. .env (Frontend configuration)
   - Set VITE_SUPABASE_URL
   - Set VITE_SUPABASE_ANON_KEY
   - Set VITE_API_URL=http://localhost:3000

2. auth-backend/.env (Backend configuration)
   - Set SUPABASE_URL
   - Set SUPABASE_SERVICE_ROLE_KEY
   - Set JWT_SECRET (minimum 32 characters)

STARTING THE APPLICATION:
-------------------------

1. Run database migrations:
   cd auth-backend
   npm run migrate

2. Start backend (in one terminal):
   cd auth-backend
   npm run dev

3. Start frontend (in another terminal):
   npm run dev

4. Access at:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

TROUBLESHOOTING:
----------------

If you encounter issues:
1. Check that Node.js 18+ is installed
2. Verify environment files are configured
3. Check that ports 3000 and 5173 are available
4. Review logs in auth-backend/logs/

For detailed documentation, see:
- source/LOCAL_DEPLOYMENT_GUIDE.md
- source/DEPLOYMENT_GUIDE.md

SUPPORT:
--------
For issues or questions, contact your system administrator.

Package created: $(date)
Version: 1.0.0
============================================
EOF

echo -e "${GREEN}[SUCCESS]${NC} README created"
echo ""

# ============================================
# Create Archive
# ============================================

echo -e "${BLUE}[INFO]${NC} Creating final archive..."
cd offline-packages
tar -czf "$PACKAGE_NAME.tar.gz" "$PACKAGE_NAME"
cd ..

ARCHIVE_SIZE=$(du -h "offline-packages/$PACKAGE_NAME.tar.gz" | cut -f1)

echo -e "${GREEN}[SUCCESS]${NC} Archive created: offline-packages/$PACKAGE_NAME.tar.gz"
echo -e "${GREEN}[SUCCESS]${NC} Archive size: $ARCHIVE_SIZE"
echo ""

# ============================================
# Summary
# ============================================

echo "============================================"
echo "Offline Package Created Successfully!"
echo "============================================"
echo ""
echo "Package location: offline-packages/$PACKAGE_NAME.tar.gz"
echo "Package size: $ARCHIVE_SIZE"
echo ""
echo "To use this package:"
echo "1. Transfer the .tar.gz file to the offline machine"
echo "2. Extract: tar -xzf $PACKAGE_NAME.tar.gz"
echo "3. Run: cd $PACKAGE_NAME && ./INSTALL.sh"
echo ""
echo "============================================"
echo ""
