@echo off
echo ========================================
echo   Stopping Backend Server (Port 8080)
echo ========================================
echo.

REM Check if port 8080 is in use
echo Checking for processes using port 8080...
netstat -ano | findstr :8080 >nul 2>&1

if %ERRORLEVEL% EQU 0 (
    echo Port 8080 is in use. Finding and stopping processes...
    echo.
    
    REM Find all processes using port 8080
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do (
        set PID=%%a
        echo Found process with PID: %%a
        taskkill /PID %%a /F >nul 2>&1
        if %ERRORLEVEL% EQU 0 (
            echo Successfully stopped process with PID: %%a
        ) else (
            echo Failed to stop process with PID: %%a (may require admin rights)
        )
    )
    
    REM Also check for Java processes specifically
    echo.
    echo Checking for Java processes...
    tasklist | findstr /i "java.exe" >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo Found Java processes. Stopping them...
        taskkill /IM java.exe /F >nul 2>&1
        if %ERRORLEVEL% EQU 0 (
            echo Successfully stopped all Java processes.
        ) else (
            echo Some Java processes may require admin rights to stop.
        )
    ) else (
        echo No Java processes found.
    )
    
    echo.
    echo Waiting 2 seconds for processes to terminate...
    timeout /t 2 /nobreak >nul
    
    REM Verify port is now free
    netstat -ano | findstr :8080 >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo WARNING: Port 8080 is still in use. You may need to run this script as Administrator.
    ) else (
        echo.
        echo SUCCESS: Port 8080 is now free. Backend server stopped.
    )
) else (
    echo Port 8080 is not in use. No processes to stop.
)

echo.
echo ========================================
pause
