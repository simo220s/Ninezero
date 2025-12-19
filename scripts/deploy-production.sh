#!/bin/bash

# ============================================
# Production Deployment Script
# ============================================
# This script automates the deployment process for Saudi English Club LMS
#
# Usage:
#   ./deploy-production.sh [--skip-backup] [--skip-tests]
#
# Options:
#   --skip-backup    Skip database backup before deployment
#   --skip-tests     Skip running tests before deployment
#
# Prerequisites:
#   - Node.js 18+ installed
#   - PM2 installed globally (npm install -g pm2)
#   - Nginx installed and configured
#   - Environment files configured (.env.production)
# ============================================

set -e  # Exit on error

# ============================================
# Configuration
# ============================================

PROJECT_DIR="/var/www/saudi-english-club"
BACKEND_DIR="$PROJECT_DIR/auth-backend"
FRONTEND_DIR="$PROJECT_DIR"

# Parse arguments
SKIP_BACKUP=false
SKIP_TESTS=false

for arg in "$@"; do
    case $arg in
        --skip-backup)
            SKIP_BACKUP=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
    esac
done

# ============================================
# Functions
# ============================================

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1" >&2
}

# ============================================
# Pre-deployment Checks
# ============================================

log "Starting production deployment..."

# Check if running as correct user
if [ "$EUID" -eq 0 ]; then 
    error "Do not run this script as root"
    exit 1
fi

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    error "Project directory not found: $PROJECT_DIR"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    error "Node.js is not installed"
    exit 1
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    error "PM2 is not installed. Install with: npm install -g pm2"
    exit 1
fi

# Check if environment files exist
if [ ! -f "$BACKEND_DIR/.env.production" ]; then
    error "Backend .env.production not found"
    exit 1
fi

if [ ! -f "$FRONTEND_DIR/.env.production" ]; then
    error "Frontend .env.production not found"
    exit 1
fi

log "Pre-deployment checks passed"

# ============================================
# Backup Database
# ============================================

if [ "$SKIP_BACKUP" = false ]; then
    log "Creating database backup..."
    
    if [ -f "$BACKEND_DIR/scripts/backup-database.sh" ]; then
        bash "$BACKEND_DIR/scripts/backup-database.sh" || {
            error "Database backup failed"
            exit 1
        }
        log "Database backup completed"
    else
        log "Warning: Backup script not found, skipping backup"
    fi
else
    log "Skipping database backup (--skip-backup flag)"
fi

# ============================================
# Pull Latest Code
# ============================================

log "Pulling latest code from repository..."

cd "$PROJECT_DIR"

# Check if git repository
if [ -d ".git" ]; then
    # Stash any local changes
    git stash
    
    # Pull latest changes
    git pull origin main || {
        error "Failed to pull latest code"
        exit 1
    }
    
    log "Code updated successfully"
else
    log "Not a git repository, skipping pull"
fi

# ============================================
# Deploy Backend
# ============================================

log "Deploying backend..."

cd "$BACKEND_DIR"

# Install dependencies
log "Installing backend dependencies..."
npm ci --production || {
    error "Failed to install backend dependencies"
    exit 1
}

# Run tests (optional)
if [ "$SKIP_TESTS" = false ]; then
    log "Running backend tests..."
    npm run test || {
        error "Backend tests failed"
        exit 1
    }
    log "Backend tests passed"
else
    log "Skipping backend tests (--skip-tests flag)"
fi

# Build TypeScript
log "Building backend..."
npm run build || {
    error "Backend build failed"
    exit 1
}

# Run database migrations
log "Running database migrations..."
npm run migrate || {
    error "Database migrations failed"
    exit 1
}

# Reload PM2 process (zero-downtime)
log "Reloading backend with PM2..."
pm2 reload ecosystem.config.js --env production || {
    # If reload fails, try restart
    log "Reload failed, attempting restart..."
    pm2 restart ecosystem.config.js --env production || {
        error "Failed to restart backend"
        exit 1
    }
}

log "Backend deployed successfully"

# ============================================
# Deploy Frontend
# ============================================

log "Deploying frontend..."

cd "$FRONTEND_DIR"

# Install dependencies
log "Installing frontend dependencies..."
npm ci --production || {
    error "Failed to install frontend dependencies"
    exit 1
}

# Build production bundle
log "Building frontend..."
npm run build || {
    error "Frontend build failed"
    exit 1
}

# Copy build to nginx directory
log "Copying frontend build to nginx..."
sudo cp -r dist/* /usr/share/nginx/html/ || {
    error "Failed to copy frontend build"
    exit 1
}

log "Frontend deployed successfully"

# ============================================
# Reload Nginx
# ============================================

log "Reloading Nginx..."

# Test nginx configuration
sudo nginx -t || {
    error "Nginx configuration test failed"
    exit 1
}

# Reload nginx
sudo systemctl reload nginx || {
    error "Failed to reload Nginx"
    exit 1
}

log "Nginx reloaded successfully"

# ============================================
# Post-deployment Verification
# ============================================

log "Running post-deployment verification..."

# Wait for services to start
sleep 5

# Check backend health
log "Checking backend health..."
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)

if [ "$BACKEND_HEALTH" = "200" ]; then
    log "✅ Backend health check passed"
else
    error "❌ Backend health check failed (HTTP $BACKEND_HEALTH)"
    exit 1
fi

# Check frontend
log "Checking frontend..."
FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/)

if [ "$FRONTEND_HEALTH" = "200" ]; then
    log "✅ Frontend health check passed"
else
    error "❌ Frontend health check failed (HTTP $FRONTEND_HEALTH)"
    exit 1
fi

# ============================================
# Cleanup
# ============================================

log "Cleaning up..."

# Clear PM2 logs older than 7 days
pm2 flush

# Clear old build artifacts
cd "$BACKEND_DIR"
find . -name "*.log" -mtime +7 -delete 2>/dev/null || true

log "Cleanup completed"

# ============================================
# Summary
# ============================================

log "=========================================="
log "✅ Deployment completed successfully!"
log "=========================================="
log ""
log "Services Status:"
pm2 status
log ""
log "Backend: http://localhost:3000"
log "Frontend: http://localhost"
log ""
log "Next steps:"
log "  1. Test the application thoroughly"
log "  2. Monitor logs: pm2 logs"
log "  3. Check metrics: pm2 monit"
log ""
log "=========================================="

exit 0
