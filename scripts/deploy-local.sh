#!/bin/bash

# ============================================
# Local Deployment Script for Linux/Mac
# ============================================
# This script automates local deployment
#
# Usage: ./deploy-local.sh
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# Functions
# ============================================

log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ============================================
# Header
# ============================================

echo "============================================"
echo "Saudi English Club - Local Deployment"
echo "============================================"
echo ""

# ============================================
# Pre-flight Checks
# ============================================

log "Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    error "Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

log "Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    error "npm is not installed"
    exit 1
fi

log "npm version: $(npm --version)"
echo ""

# ============================================
# Install Dependencies
# ============================================

log "Installing frontend dependencies..."
if npm install; then
    success "Frontend dependencies installed"
else
    error "Failed to install frontend dependencies"
    exit 1
fi
echo ""

log "Installing backend dependencies..."
cd auth-backend
if npm install; then
    success "Backend dependencies installed"
else
    error "Failed to install backend dependencies"
    exit 1
fi
cd ..
echo ""

# ============================================
# Configure Environment
# ============================================

log "Checking environment configuration..."

# Frontend environment
if [ ! -f ".env" ]; then
    warn ".env file not found"
    if [ -f ".env.example" ]; then
        log "Copying .env.example to .env"
        cp .env.example .env
        success ".env file created"
    else
        error ".env.example not found"
        echo "Please create .env file manually"
        exit 1
    fi
else
    success ".env file exists"
fi

# Backend environment
if [ ! -f "auth-backend/.env" ]; then
    warn "auth-backend/.env file not found"
    if [ -f "auth-backend/.env.example" ]; then
        log "Copying auth-backend/.env.example to auth-backend/.env"
        cp auth-backend/.env.example auth-backend/.env
        success "auth-backend/.env file created"
    else
        error "auth-backend/.env.example not found"
        echo "Please create auth-backend/.env file manually"
        exit 1
    fi
else
    success "auth-backend/.env file exists"
fi
echo ""

# ============================================
# Build Backend
# ============================================

log "Building backend..."
cd auth-backend
if npm run build; then
    success "Backend built successfully"
else
    warn "Backend build failed, but continuing..."
fi
cd ..
echo ""

# ============================================
# Run Database Migrations
# ============================================

log "Running database migrations..."
cd auth-backend
if npm run migrate; then
    success "Database migrations completed"
else
    warn "Database migrations failed"
    echo "Please check your Supabase configuration"
fi
cd ..
echo ""

# ============================================
# Summary
# ============================================

echo "============================================"
echo "Deployment completed!"
echo "============================================"
echo ""
echo "To start the application:"
echo ""
echo "1. Start Backend (in one terminal):"
echo "   cd auth-backend"
echo "   npm run dev"
echo ""
echo "2. Start Frontend (in another terminal):"
echo "   npm run dev"
echo ""
echo "Access the application at:"
echo "- Frontend: http://localhost:5173"
echo "- Backend:  http://localhost:3000"
echo ""
echo "============================================"
echo ""
