@echo off
REM License Management System - Windows Installer Script

setlocal enabledelayedexpansion

REM Colors (Windows 10+)
set "RESET=[0m"
set "BLUE=[34m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "RED=[31m"

cls
echo.
echo %BLUE%════════════════════════════════════════════════════════%RESET%
echo %BLUE%License Management System Installer%RESET%
echo %BLUE%════════════════════════════════════════════════════════%RESET%
echo.

REM Check Node.js installation
echo %BLUE%Checking Node.js Installation...%RESET%
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%✗ Node.js is not installed%RESET%
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo %GREEN%✓ Node.js %NODE_VERSION% is installed%RESET%
echo.

REM Detect package manager
echo %BLUE%Detecting Package Manager...%RESET%
pnpm -v >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('pnpm -v') do set PNPM_VERSION=%%i
    set PKG_MANAGER=pnpm
    echo %GREEN%✓ pnpm !PNPM_VERSION! detected (recommended)%RESET%
) else (
    npm -v >nul 2>&1
    if %errorlevel% equ 0 (
        for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
        set PKG_MANAGER=npm
        echo %YELLOW%⚠ npm !NPM_VERSION! detected (pnpm is recommended)%RESET%
        echo %BLUE%ℹ To use pnpm, install it with: npm install -g pnpm%RESET%
    ) else (
        echo %RED%✗ Neither pnpm nor npm is installed%RESET%
        pause
        exit /b 1
    )
)
echo.

REM Create directories
echo %BLUE%Creating necessary directories...%RESET%
if not exist "data" mkdir data
if not exist "logs" mkdir logs
echo %GREEN%✓ Directories created%RESET%
echo.

REM Install dependencies
echo %BLUE%Installing Dependencies...%RESET%
if "!PKG_MANAGER!"=="pnpm" (
    echo %BLUE%ℹ Installing packages with pnpm...%RESET%
    call pnpm install
) else (
    echo %BLUE%ℹ Installing packages with npm...%RESET%
    call npm install
)
if %errorlevel% neq 0 (
    echo %RED%✗ Failed to install dependencies%RESET%
    pause
    exit /b 1
)
echo %GREEN%✓ Dependencies installed successfully%RESET%
echo.

REM Setup .env file
echo %BLUE%Setting Up Environment Variables...%RESET%
if exist ".env" (
    echo %BLUE%ℹ .env file already exists, skipping...%RESET%
) else (
    echo %BLUE%ℹ Creating .env file...%RESET%
    (
        echo # Database Configuration (SQLite)
        echo # Database file will be created at: ./data/license_management.db
        echo DB_TYPE=sqlite
        echo.
        echo # Server Configuration
        echo NODE_ENV=development
        echo PORT=3000
        echo APP_URL=http://localhost:3000
        echo.
        echo # JWT Configuration
        echo JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345678
        echo JWT_EXPIRE=7d
        echo.
        echo # Logging
        echo LOG_LEVEL=info
        echo.
        echo # Application
        echo APP_NAME=License Management System
        echo APP_VERSION=1.0.0
    ) > .env
    echo %GREEN%✓ .env file created%RESET%
    echo %YELLOW%⚠ Remember to change JWT_SECRET in production!%RESET%
)
echo.

REM Create .env.example
if not exist ".env.example" (
    copy .env .env.example >nul
    echo %GREEN%✓ .env.example created%RESET%
)
echo.

REM Run database migration
echo %BLUE%Initializing Database...%RESET%
if "!PKG_MANAGER!"=="pnpm" (
    echo %BLUE%ℹ Running database migration...%RESET%
    call pnpm migrate
) else (
    echo %BLUE%ℹ Running database migration...%RESET%
    call npm run migrate
)
if %errorlevel% neq 0 (
    echo %RED%✗ Failed to initialize database%RESET%
    pause
    exit /b 1
)
echo %GREEN%✓ Database initialized successfully%RESET%
echo.

REM Final instructions
echo %BLUE%════════════════════════════════════════════════════════%RESET%
echo %GREEN%Installation Complete! 🎉%RESET%
echo %BLUE%════════════════════════════════════════════════════════%RESET%
echo.
echo Your License Management System is ready to use!
echo.
if "!PKG_MANAGER!"=="pnpm" (
    echo %GREEN%To start the development server:%RESET%
    echo   %YELLOW%pnpm dev%RESET%
    echo.
    echo %GREEN%To start the production server:%RESET%
    echo   %YELLOW%pnpm start%RESET%
) else (
    echo %GREEN%To start the development server:%RESET%
    echo   %YELLOW%npm run dev%RESET%
    echo.
    echo %GREEN%To start the production server:%RESET%
    echo   %YELLOW%npm start%RESET%
)
echo.
echo %BLUE%Default Access Credentials:%RESET%
echo   Email:    admin@test.com
echo   Password: password123
echo.
echo %BLUE%API Documentation:%RESET%
echo   See README.md for complete API documentation
echo.
echo %BLUE%Default URL:%RESET%
echo   http://localhost:3000
echo.
echo %BLUE%Health Check:%RESET%
echo   http://localhost:3000/api/health
echo.
echo %GREEN%Setup complete! Happy coding! 🚀%RESET%
echo.
pause
