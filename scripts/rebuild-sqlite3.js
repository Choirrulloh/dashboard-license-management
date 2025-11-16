#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('='.repeat(60));
console.log('SQLite3 Rebuild Script');
console.log('='.repeat(60));

console.log(`\nNode.js version: ${process.version}`);
console.log(`Platform: ${process.platform}`);
console.log(`Architecture: ${process.arch}`);

// Check if build tools exist
console.log('\n1. Checking for build tools...');

try {
  const sqlite3Path = path.join(__dirname, '..', 'node_modules', '.pnpm', 'sqlite3@5.1.7', 'node_modules', 'sqlite3');

  if (!fs.existsSync(sqlite3Path)) {
    console.error('❌ SQLite3 package not found. Please run: pnpm install');
    process.exit(1);
  }

  console.log('✓ SQLite3 package found');

  // Try to rebuild
  console.log('\n2. Rebuilding sqlite3...');

  try {
    execSync('pnpm rebuild sqlite3', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    console.log('✓ SQLite3 rebuilt successfully');
  } catch (error) {
    console.error('❌ Rebuild failed. Trying alternative method...');

    // Try building from source
    console.log('\n3. Building from source...');
    process.chdir(sqlite3Path);
    execSync('npm install --build-from-source', { stdio: 'inherit' });
    console.log('✓ Built from source successfully');
  }

  console.log('\n' + '='.repeat(60));
  console.log('✓ SQLite3 is now ready!');
  console.log('='.repeat(60));
  console.log('\nYou can now run: pnpm init-db');

} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.error('\n📋 Manual Fix Required:');
  console.error('\nOn Ubuntu/Debian:');
  console.error('  sudo apt-get install -y build-essential python3');
  console.error('  pnpm rebuild sqlite3');
  console.error('\nOr switch to better-sqlite3:');
  console.error('  pnpm remove sqlite3');
  console.error('  pnpm add better-sqlite3');
  console.error('  # Then use config/database-better-sqlite3.js');

  process.exit(1);
}
