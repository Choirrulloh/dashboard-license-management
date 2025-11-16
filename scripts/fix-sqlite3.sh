#!/bin/bash

echo "=========================================="
echo "Fixing SQLite3 Native Bindings"
echo "=========================================="

# Check if build tools are available
if ! command -v node-gyp &> /dev/null; then
    echo "Installing node-gyp globally..."
    npm install -g node-gyp
fi

# Navigate to sqlite3 package
cd node_modules/.pnpm/sqlite3@5.1.7/node_modules/sqlite3

echo "Rebuilding sqlite3 for Node.js $(node --version)..."
npm run install

echo "=========================================="
echo "SQLite3 rebuild complete!"
echo "=========================================="
