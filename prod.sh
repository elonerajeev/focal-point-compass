#!/bin/bash

# Quick Production Test Script - Fast Version

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

PASSED=0
FAILED=0

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; ((PASSED++)); }
log_fail() { echo -e "${RED}[✗]${NC} $1"; ((FAILED++)); }
log_section() { echo ""; echo -e "${CYAN}═══════════════════════════════════════${NC}"; echo -e "${CYAN}  $1${NC}"; echo -e "${CYAN}═══════════════════════════════════════${NC}"; }

check_cmd() { command -v "$1" >/dev/null 2>&1; }

log_section "PRE-FLIGHT"
check_cmd node && log_success "Node.js: $(node --version)" || log_fail "Node.js"
check_cmd npm && log_success "npm: $(npm --version)" || log_fail "npm"
check_cmd curl && log_success "curl" || log_fail "curl"

# Backend
log_section "BACKEND"
cd backend
log_info "Building..."
npm run build >/dev/null 2>&1 && log_success "Build" || log_fail "Build"

log_info "Linting..."
npm run lint >/dev/null 2>&1 && log_success "Lint" || log_fail "Lint"
cd ..

# Frontend
log_section "FRONTEND"
cd frontend
log_info "Building..."
npm run build >/dev/null 2>&1 && log_success "Build" || log_fail "Build"

log_info "Linting..."
npm run lint >/dev/null 2>&1 && log_success "Lint" || log_fail "Lint"
cd ..

log_section "SUMMARY"
echo -e "  ${GREEN}PASSED: ${PASSED}${NC}"
echo -e "  ${RED}FAILED: ${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}ALL CHECKS PASSED ✓${NC}"
    exit 0
else
    echo -e "${RED}SOME CHECKS FAILED ✗${NC}"
    exit 1
fi
