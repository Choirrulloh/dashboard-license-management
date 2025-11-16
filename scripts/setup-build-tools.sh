#!/bin/bash

echo "=========================================="
echo "Setup Build Tools untuk better-sqlite3"
echo "=========================================="
echo ""

# Detect OS
if [ -f /etc/debian_version ]; then
    echo "✓ Detected: Debian/Ubuntu"
    echo ""
    echo "Installing build tools..."
    sudo apt-get update
    sudo apt-get install -y build-essential python3
    echo ""
    echo "✓ Build tools installed!"
elif [ -f /etc/redhat-release ]; then
    echo "✓ Detected: Red Hat/CentOS"
    echo ""
    echo "Installing build tools..."
    sudo yum groupinstall -y "Development Tools"
    sudo yum install -y python3
    echo ""
    echo "✓ Build tools installed!"
else
    echo "❌ Unknown OS"
    echo "Please install build-essential and python3 manually."
    exit 1
fi

echo ""
echo "=========================================="
echo "Building better-sqlite3 with pnpm..."
echo "=========================================="
echo ""

cd /srv/dashboard-license-management

# Rebuild better-sqlite3 using pnpm
pnpm rebuild better-sqlite3

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✓ Build completed successfully!"
    echo "=========================================="
    echo ""
    echo "You can now run:"
    echo "  pnpm init-db"
    echo "  pnpm start"
else
    echo ""
    echo "❌ Build failed. Trying force install..."
    pnpm install --force

    if [ $? -eq 0 ]; then
        echo ""
        echo "✓ Force install successful!"
    else
        echo ""
        echo "❌ Still failed. Please check the error messages above."
        exit 1
    fi
fi
