#!/bin/bash

# Walk-In Sales E2E Test Runner
# This script runs comprehensive tests for the walk-in sales functionality

echo "🚀 Starting Walk-In Sales E2E Tests..."
echo "======================================"

# Check if backend is running
echo "📡 Checking backend server..."
if ! curl -s http://localhost:3001/api/health > /dev/null; then
    echo "❌ Backend server is not running on port 3001"
    echo "Please start the backend server first:"
    echo "cd backend && npm start"
    exit 1
fi
echo "✅ Backend server is running"

# Check if frontend is running
echo "🌐 Checking frontend server..."
if ! curl -s http://localhost:5173 > /dev/null; then
    echo "❌ Frontend server is not running on port 5173"
    echo "Please start the frontend server first:"
    echo "cd client && npm run dev"
    exit 1
fi
echo "✅ Frontend server is running"

# Install Playwright if not already installed
echo "📦 Installing Playwright dependencies..."
cd client
npm install @playwright/test

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
npx playwright install

# Create auth directory
mkdir -p playwright/.auth

# Run the tests
echo "🧪 Running Walk-In Sales E2E Tests..."
echo "======================================"

# Run tests with different options based on arguments
if [ "$1" = "headed" ]; then
    echo "Running tests in headed mode (visible browser)..."
    npx playwright test --headed
elif [ "$1" = "ui" ]; then
    echo "Running tests with Playwright UI..."
    npx playwright test --ui
elif [ "$1" = "debug" ]; then
    echo "Running tests in debug mode..."
    npx playwright test --debug
elif [ "$1" = "mobile" ]; then
    echo "Running tests on mobile browsers..."
    npx playwright test --project="Mobile Chrome"
elif [ "$1" = "all" ]; then
    echo "Running tests on all browsers..."
    npx playwright test
else
    echo "Running tests on Chromium (default)..."
    echo "Available options:"
    echo "  ./run-tests.sh          - Run on Chromium"
    echo "  ./run-tests.sh all      - Run on all browsers"
    echo "  ./run-tests.sh mobile   - Run on mobile browsers"
    echo "  ./run-tests.sh headed   - Run with visible browser"
    echo "  ./run-tests.sh ui       - Run with Playwright UI"
    echo "  ./run-tests.sh debug    - Run in debug mode"
    npx playwright test --project="chromium"
fi

# Show test results
echo ""
echo "📊 Test Results:"
echo "================="
echo "HTML Report: file://$(pwd)/playwright-report/index.html"
echo "Test Results: $(pwd)/test-results/"

echo ""
echo "✅ Test run completed!"
