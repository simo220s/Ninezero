#!/bin/bash

# ============================================
# Start Local Development Servers (Linux/Mac)
# ============================================
# This script starts both frontend and backend servers
#
# Usage: ./start-local.sh
# ============================================

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo "============================================"
echo "Saudi English Club - Starting Servers"
echo "============================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js is not installed${NC}"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${RED}ERROR: Frontend dependencies not installed${NC}"
    echo "Please run: npm install"
    exit 1
fi

if [ ! -d "auth-backend/node_modules" ]; then
    echo -e "${RED}ERROR: Backend dependencies not installed${NC}"
    echo "Please run: cd auth-backend && npm install"
    exit 1
fi

# Check if environment files exist
if [ ! -f ".env" ]; then
    echo -e "${RED}ERROR: .env file not found${NC}"
    echo "Please copy .env.example to .env and configure it"
    exit 1
fi

if [ ! -f "auth-backend/.env" ]; then
    echo -e "${RED}ERROR: auth-backend/.env file not found${NC}"
    echo "Please copy auth-backend/.env.example to auth-backend/.env and configure it"
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

echo -e "${BLUE}[INFO]${NC} Starting backend server..."
echo -e "${BLUE}[INFO]${NC} Backend will run on http://localhost:3000"
echo ""

# Start backend in background
cd auth-backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

echo -e "${BLUE}[INFO]${NC} Starting frontend server..."
echo -e "${BLUE}[INFO]${NC} Frontend will run on http://localhost:5173"
echo ""

# Start frontend in background
npm run dev &
FRONTEND_PID=$!

echo ""
echo "============================================"
echo "Servers are running!"
echo "============================================"
echo ""
echo -e "${GREEN}Backend:${NC}  http://localhost:3000"
echo -e "${GREEN}Frontend:${NC} http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "============================================"
echo ""

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID
