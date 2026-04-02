#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🛑 Stopping CRM Application...${NC}\n"

# Kill processes on ports
BACKEND_PIDS=$(lsof -ti:3000)
FRONTEND_PIDS=$(lsof -ti:8080)

if [ ! -z "$BACKEND_PIDS" ]; then
    echo -e "${RED}Stopping Backend (Port 3000)...${NC}"
    kill -9 $BACKEND_PIDS 2>/dev/null
    echo -e "${GREEN}✓ Backend stopped${NC}"
else
    echo -e "${YELLOW}No backend process found${NC}"
fi

if [ ! -z "$FRONTEND_PIDS" ]; then
    echo -e "${RED}Stopping Frontend (Port 8080)...${NC}"
    kill -9 $FRONTEND_PIDS 2>/dev/null
    echo -e "${GREEN}✓ Frontend stopped${NC}"
else
    echo -e "${YELLOW}No frontend process found${NC}"
fi

echo -e "\n${GREEN}✅ All services stopped${NC}"
