# SQLite3 Native Binding Fix

## Problem
The error occurs because `sqlite3` package needs native bindings that must be compiled for your specific Node.js version.

## Solution 1: Rebuild sqlite3 (Recommended for production)

### On Ubuntu/Debian:
```bash
# Install build dependencies
sudo apt-get update
sudo apt-get install -y build-essential python3

# Rebuild sqlite3
pnpm rebuild sqlite3

# Or navigate to the sqlite3 directory and rebuild
cd node_modules/.pnpm/sqlite3@5.1.7/node_modules/sqlite3
npm install --build-from-source
cd /srv/dashboard-license-management
```

### On CentOS/RHEL:
```bash
# Install build dependencies
sudo yum groupinstall "Development Tools"
sudo yum install python3

# Rebuild sqlite3
pnpm rebuild sqlite3
```

## Solution 2: Use better-sqlite3 (Alternative)

Better-sqlite3 is faster and more reliable. To switch:

```bash
# Remove sqlite3
pnpm remove sqlite3

# Install better-sqlite3
pnpm add better-sqlite3

# Then update the database config file
# (A new config file is provided below)
```

## Solution 3: Use Docker (Easiest)

Create a `Dockerfile`:
```dockerfile
FROM node:22-alpine

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install

COPY . .

EXPOSE 3000
CMD ["pnpm", "start"]
```

Then run:
```bash
docker build -t license-manager .
docker run -p 3000:3000 license-manager
```

## Quick Fix (Current Session)

Run this command from your project root:

```bash
# Install build tools first
sudo apt-get install -y build-essential python3

# Then rebuild
pnpm rebuild sqlite3
```

After rebuild completes, run:
```bash
pnpm init-db
```

## If All Else Fails

Use the alternative better-sqlite3 implementation provided in the repository.
