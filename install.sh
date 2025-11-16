#!/bin/bash

# License Management System - Installer Script
# This script sets up the entire application with one command

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check Node.js installation
check_nodejs() {
    print_header "Checking Node.js Installation"

    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        echo "Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi

    NODE_VERSION=$(node -v)
    print_success "Node.js $NODE_VERSION is installed"
}

# Detect package manager
detect_package_manager() {
    print_header "Detecting Package Manager"

    if command -v pnpm &> /dev/null; then
        PKG_MANAGER="pnpm"
        PNPM_VERSION=$(pnpm -v)
        print_success "pnpm $PNPM_VERSION detected (recommended)"
    elif command -v npm &> /dev/null; then
        PKG_MANAGER="npm"
        NPM_VERSION=$(npm -v)
        print_warning "npm $NPM_VERSION detected (pnpm is recommended)"
        print_info "To use pnpm, install it with: npm install -g pnpm"
    else
        print_error "Neither pnpm nor npm is installed"
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_header "Installing Dependencies"

    if [ "$PKG_MANAGER" = "pnpm" ]; then
        print_info "Installing packages with pnpm..."
        pnpm install
    else
        print_info "Installing packages with npm..."
        npm install
    fi

    print_success "Dependencies installed successfully"
}

# Create .env file if not exists
setup_env() {
    print_header "Setting Up Environment Variables"

    if [ -f ".env" ]; then
        print_info ".env file already exists, skipping..."
    else
        print_info "Creating .env file..."
        cat > .env << 'EOF'
# Database Configuration (SQLite)
# Database file will be created at: ./data/license_management.db
DB_TYPE=sqlite

# Server Configuration
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345678
JWT_EXPIRE=7d

# Logging
LOG_LEVEL=info

# Application
APP_NAME=License Management System
APP_VERSION=1.0.0
EOF
        print_success ".env file created"
        print_warning "Remember to change JWT_SECRET in production!"
    fi
}

# Create .env.example if not exists
setup_env_example() {
    if [ ! -f ".env.example" ]; then
        cp .env .env.example
        print_success ".env.example created"
    fi
}

# Run database migration
migrate_database() {
    print_header "Initializing Database"

    if [ "$PKG_MANAGER" = "pnpm" ]; then
        print_info "Running database migration..."
        pnpm migrate
    else
        print_info "Running database migration..."
        npm run migrate
    fi

    print_success "Database initialized successfully"
}

# Create necessary directories
create_directories() {
    print_info "Creating necessary directories..."

    mkdir -p data
    mkdir -p logs

    print_success "Directories created"
}

# Final instructions
print_instructions() {
    print_header "Installation Complete! 🎉"

    echo ""
    echo "Your License Management System is ready to use!"
    echo ""

    if [ "$PKG_MANAGER" = "pnpm" ]; then
        echo -e "${GREEN}To start the development server:${NC}"
        echo "  ${YELLOW}pnpm dev${NC}"
        echo ""
        echo -e "${GREEN}To start the production server:${NC}"
        echo "  ${YELLOW}pnpm start${NC}"
    else
        echo -e "${GREEN}To start the development server:${NC}"
        echo "  ${YELLOW}npm run dev${NC}"
        echo ""
        echo -e "${GREEN}To start the production server:${NC}"
        echo "  ${YELLOW}npm start${NC}"
    fi

    echo ""
    echo -e "${BLUE}Default Access Credentials:${NC}"
    echo "  Email:    admin@test.com"
    echo "  Password: password123"
    echo ""
    echo -e "${BLUE}API Documentation:${NC}"
    echo "  See README.md for complete API documentation"
    echo ""
    echo -e "${BLUE}Default URL:${NC}"
    echo "  http://localhost:3000"
    echo ""
    echo -e "${BLUE}Health Check:${NC}"
    echo "  http://localhost:3000/api/health"
    echo ""
}

# Main installation flow
main() {
    echo ""
    print_header "License Management System Installer"
    echo ""

    check_nodejs
    detect_package_manager
    create_directories
    install_dependencies
    setup_env
    setup_env_example
    migrate_database
    print_instructions

    echo ""
    print_success "Setup complete! Happy coding! 🚀"
    echo ""
}

# Run main function
main
