@echo off
setlocal enabledelayedexpansion
title Backend Server
color 0B
cd /d "%~dp0backend"

set "JAVA_HOME=C:\Program Files\Java\jdk-17"
set "MAVEN_HOME=C:\Program Files\apache-maven-3.9.11"
set "PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\bin;%PATH%"

REM Set MySQL credentials (update these if needed)
REM If your MySQL root has no password, leave DB_PASSWORD empty
REM If your MySQL root has a password, set it here:
if not defined DB_PASSWORD set "DB_PASSWORD=Roghan@123$"
if not defined DB_USERNAME set "DB_USERNAME=root"

echo ========================================
echo    Backend Server Starting...
echo ========================================
echo.
echo Java: %JAVA_HOME%
echo Maven: %MAVEN_HOME%
echo Lombok: 1.18.34 (Java 17 compatible)
echo.
echo This may take 2-5 minutes on first run
echo Wait for "Started JobPortalApplication" message
echo.
echo If you see errors, this window will stay open
echo so you can read them.
echo.
echo ========================================
echo.

REM Check if port 8080 is already in use
echo Checking if port 8080 is available...
netstat -ano | findstr :8080 >nul 2>&1
if errorlevel 1 goto port_available

echo.
echo WARNING: Port 8080 is already in use!
echo.
echo Attempting to stop the process using port 8080...
echo.

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do (
    set PID=%%a
    echo Found process with PID: %%a
    tasklist /FI "PID eq %%a" 2>nul | findstr /I "java.exe javaw.exe" >nul
    if not errorlevel 1 (
        echo Stopping Java process (likely previous backend instance)...
        taskkill /PID %%a /F >nul 2>&1
        if not errorlevel 1 (
            echo Successfully stopped process on port 8080.
            echo Waiting 2 seconds for port to be released...
            timeout /t 2 /nobreak >nul
            goto port_available
        ) else (
            echo Failed to stop process. You may need to run as Administrator.
            echo.
            echo Please manually stop the process:
            echo 1. Run: netstat -ano ^| findstr :8080
            echo 2. Note the PID (last number)
            echo 3. Run: taskkill /PID [PID_NUMBER] /F
            echo.
            echo Press any key to close this window...
            pause >nul
            exit /b 1
        )
    ) else (
        echo Process %%a is not a Java process. Please stop it manually.
        echo.
        echo To stop the process:
        echo 1. Run: netstat -ano ^| findstr :8080
        echo 2. Note the PID (last number)
        echo 3. Run: taskkill /PID [PID_NUMBER] /F
        echo.
        echo Press any key to close this window...
        pause >nul
        exit /b 1
    )
)
echo.

:port_available

REM Run Maven and capture errors
echo Port 8080 is available.
echo Compiling and starting backend...
echo.
mvn clean spring-boot:run 2>&1
set EXIT_CODE=%ERRORLEVEL%

echo.
echo ========================================
if %EXIT_CODE% EQU 0 (
    echo Backend stopped normally
) else (
    echo ERROR: Backend failed with exit code %EXIT_CODE%
    echo.
    echo Common issues:
    echo - Compilation error: Check error messages above
    echo - MySQL not running: Start MySQL service
    echo - Port 8080 in use: Close other applications using port 8080
    echo - Database connection: Check application.yml database settings
    echo.
    echo Scroll up to see the full error message.
)
echo ========================================
echo.
echo Press any key to close this window...
pause >nul

