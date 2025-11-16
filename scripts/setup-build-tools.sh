#!/bin/bash

echo "=========================================="
echo "Installing Build Tools & Building SQLite"
echo "=========================================="

# Detect OS
if [ -f /etc/debian_version ]; then
    echo "Detected: Debian/Ubuntu"
    sudo apt-get update
    sudo apt-get install -y build-essential python3 python3-pip
elif [ -f /etc/redhat-release ]; then
    echo "Detected: Red Hat/CentOS"
    sudo yum groupinstall -y "Development Tools"
    sudo yum install -y python3
else
    echo "Unknown OS. Please install build-essential and python3 manually."
    exit 1
fi

echo ""
echo "Build tools installed successfully!"
echo ""
echo "Now building better-sqlite3..."
echo ""

cd /srv/dashboard-license-management

# Navigate to better-sqlite3 and build
cd node_modules/.pnpm/better-sqlite3@12.4.1/node_modules/better-sqlite3
echo "Installing better-sqlite3 with build from source..."
npm install --build-from-source

echo ""
echo "=========================================="
echo "✓ Build completed!"
echo "=========================================="
echo ""
echo "Now run: pnpm init-db"
