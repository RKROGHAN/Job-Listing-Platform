@echo off
title Job Portal System - Starting Servers
color 0A

echo ========================================
echo    Job Portal System - Quick Start
echo ========================================
echo.

REM Set Java and Maven paths
set "JAVA_HOME=C:\Program Files\Java\jdk-17"
set "MAVEN_HOME=C:\Program Files\apache-maven-3.9.11"
set "PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\bin;%PATH%"

echo Checking prerequisites...
echo.

REM Check Java
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Java is not installed or not in PATH
    echo Please install Java 17+ from: https://adoptium.net/
    pause
    exit /b 1
) else (
    echo [OK] Java is installed
    java -version 2>&1 | findstr /i "version"
)

echo.
REM Check Maven
mvn -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Maven is not installed or not in PATH
    echo Please install Maven from: https://maven.apache.org/download.cgi
    pause
    exit /b 1
) else (
    echo [OK] Maven is installed
    mvn -version 2>&1 | findstr /i "Apache Maven"
)

echo.
REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
) else (
    echo [OK] Node.js is installed
    node --version
)

echo.
echo ========================================
echo All prerequisites are installed!
echo ========================================
echo.

REM Get the script directory
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo Starting Backend Server...
echo This will open in a new window...
echo.

REM Start backend in new CMD window
start "Job Portal Backend" cmd /k "cd /d %SCRIPT_DIR%backend && set JAVA_HOME=%JAVA_HOME% && set MAVEN_HOME=%MAVEN_HOME% && set PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\bin;%PATH% && echo ======================================== && echo Backend Server Starting... && echo ======================================== && echo. && echo Java: %JAVA_HOME% && echo Maven: %MAVEN_HOME% && echo Lombok: 1.18.34 (Java 17 compatible) && echo. && echo This may take 2-5 minutes on first run && echo Wait for 'Started JobPortalApplication' message && echo. && echo If errors occur, this window will stay open && echo. && echo ======================================== && echo. && mvn clean spring-boot:run && echo. && echo ======================================== && if %ERRORLEVEL% EQU 0 (echo Backend stopped normally) else (echo ERROR: Backend failed - Check errors above) && echo ======================================== && echo. && echo Press any key to close... && pause >nul"

echo Waiting 15 seconds for backend to initialize...
timeout /t 15 /nobreak >nul

echo.
echo Starting Frontend Server...
echo This will open in a new window...
echo.

REM Check if node_modules exists
if not exist "%SCRIPT_DIR%frontend\node_modules" (
    echo Installing frontend dependencies first...
    start "Frontend - Installing" cmd /k "cd /d %SCRIPT_DIR%frontend && echo Installing dependencies... && npm install && echo. && echo Dependencies installed! && echo Starting frontend server... && echo. && npm start"
) else (
    REM Start frontend in new CMD window
    start "Job Portal Frontend" cmd /k "cd /d %SCRIPT_DIR%frontend && echo ======================================== && echo Frontend Server Starting... && echo ======================================== && echo. && npm start"
)

echo.
echo ========================================
echo    Application Started!
echo ========================================
echo.
echo Backend API: http://localhost:8080/api
echo Frontend UI: http://localhost:3000
echo API Docs: http://localhost:8080/swagger-ui.html
echo.
echo Note: Backend may take 2-5 minutes to start on first run
echo Wait for "Started JobPortalApplication" message in backend window
echo.
echo Default Login Credentials (after database setup):
echo - Admin: admin@jobportal.com / admin123
echo - Job Seeker: john.doe@email.com / user123
echo - Employer: jane.smith@company.com / employer123
echo.
echo Two new windows have opened:
echo - One for Backend Server
echo - One for Frontend Server
echo.
echo You can close this window now.
echo.
pause
