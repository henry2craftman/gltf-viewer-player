@echo off
title GLTF Player Development Server

echo ========================================
echo   GLTF Player Server Starting...
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [WARNING] node_modules folder not found.
    echo Installing dependencies...
    echo.
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed
        pause
        exit /b 1
    )
    echo.
)

echo [INFO] Starting Vite development server...
echo [INFO] Browser will open automatically
echo [INFO] Press Ctrl+C to stop the server
echo.

REM Start Vite dev server
npm run dev

if errorlevel 1 (
    echo.
    echo [ERROR] Server failed to start
    pause
    exit /b 1
)
