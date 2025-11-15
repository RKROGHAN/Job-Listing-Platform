@echo off
title Frontend Server
color 0E
cd /d "%~dp0frontend"

echo ========================================
echo    Frontend Server Starting...
echo ========================================
echo.

if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

echo Starting React development server...
echo.
npm start
pause

