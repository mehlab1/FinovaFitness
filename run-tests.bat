@echo off
REM Walk-In Sales E2E Test Runner for Windows
REM This script runs comprehensive tests for the walk-in sales functionality

echo 🚀 Starting Walk-In Sales E2E Tests...
echo ======================================

REM Check if backend is running
echo 📡 Checking backend server...
curl -s http://localhost:3001/api/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend server is not running on port 3001
    echo Please start the backend server first:
    echo cd backend ^&^& npm start
    pause
    exit /b 1
)
echo ✅ Backend server is running

REM Check if frontend is running
echo 🌐 Checking frontend server...
curl -s http://localhost:5173 >nul 2>&1
if errorlevel 1 (
    echo ❌ Frontend server is not running on port 5173
    echo Please start the frontend server first:
    echo cd client ^&^& npm run dev
    pause
    exit /b 1
)
echo ✅ Frontend server is running

REM Install Playwright if not already installed
echo 📦 Installing Playwright dependencies...
cd client
call npm install @playwright/test

REM Install Playwright browsers
echo 🌐 Installing Playwright browsers...
call npx playwright install

REM Create auth directory
if not exist "playwright\.auth" mkdir playwright\.auth

REM Run the tests
echo 🧪 Running Walk-In Sales E2E Tests...
echo ======================================

REM Run tests with different options based on arguments
if "%1"=="headed" (
    echo Running tests in headed mode (visible browser)...
    call npx playwright test --headed
) else if "%1"=="ui" (
    echo Running tests with Playwright UI...
    call npx playwright test --ui
) else if "%1"=="debug" (
    echo Running tests in debug mode...
    call npx playwright test --debug
) else if "%1"=="mobile" (
    echo Running tests on mobile browsers...
    call npx playwright test --project="Mobile Chrome"
) else if "%1"=="all" (
    echo Running tests on all browsers...
    call npx playwright test
) else (
    echo Running tests on Chromium (default)...
    echo Available options:
    echo   run-tests.bat          - Run on Chromium
    echo   run-tests.bat all      - Run on all browsers
    echo   run-tests.bat mobile   - Run on mobile browsers
    echo   run-tests.bat headed   - Run with visible browser
    echo   run-tests.bat ui       - Run with Playwright UI
    echo   run-tests.bat debug    - Run in debug mode
    call npx playwright test --project="chromium"
)

REM Show test results
echo.
echo 📊 Test Results:
echo =================
echo HTML Report: file://%cd%/playwright-report/index.html
echo Test Results: %cd%/test-results/

echo.
echo ✅ Test run completed!
pause
