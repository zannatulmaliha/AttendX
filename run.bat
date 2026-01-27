@echo off
echo ========================================
echo AttendX React Project Setup
echo ========================================
echo.

echo Step 1: Copying CSS file to src directory...
copy style.css src\style.css
if %errorlevel% neq 0 (
    echo ERROR: Failed to copy CSS file
    pause
    exit /b 1
)
echo CSS file copied successfully!
echo.

echo Step 2: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo Dependencies installed successfully!
echo.

echo Step 3: Starting development server...
echo The app will open at http://localhost:5173
echo Press Ctrl+C to stop the server
echo.
call npm run dev

pause
