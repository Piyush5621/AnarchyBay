@echo off
echo 🚀 Setting up ngrok for Vite HMR...
echo.

REM Check if ngrok is installed
ngrok version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ngrok is not installed. Please install it from https://ngrok.com/download
    echo    Then run this script again.
    pause
    exit /b 1
)
echo ✅ ngrok is installed

REM Check if ngrok is running
curl -s http://localhost:4040/api/tunnels > temp_ngrok.json 2>nul
if %errorlevel% neq 0 (
    echo ❌ ngrok is not running. Please start it with: ngrok http 5173
    echo    Then run this script again.
    del temp_ngrok.json 2>nul
    pause
    exit /b 1
)

REM Parse ngrok URL from the JSON response
for /f "tokens=*" %%i in ('powershell -Command "(Get-Content temp_ngrok.json | ConvertFrom-Json).tunnels | Where-Object {$_.proto -eq 'https'} | Select-Object -ExpandProperty public_url"') do set NGROK_URL=%%i

if "%NGROK_URL%"=="" (
    echo ❌ Could not find ngrok HTTPS tunnel
    del temp_ngrok.json 2>nul
    pause
    exit /b 1
)

REM Remove https:// prefix
set NGROK_HOST=%NGROK_URL:https://=%

echo ✅ ngrok is running at: %NGROK_URL%

REM Update .env file
if exist .env (
    REM Remove existing VITE_NGROK_HOST line
    powershell -Command "(Get-Content .env) | Where-Object { $_ -notmatch '^VITE_NGROK_HOST=' } | Set-Content .env.tmp"
    move .env.tmp .env >nul
)

REM Add new VITE_NGROK_HOST
echo VITE_NGROK_HOST=%NGROK_HOST%>> .env

del temp_ngrok.json 2>nul

echo ✅ Updated .env with VITE_NGROK_HOST=%NGROK_HOST%
echo.
echo 🎉 Setup complete! You can now run: npm run dev
echo    Your app will be available at: %NGROK_URL%
echo    HMR WebSocket will connect properly through ngrok!
echo.
pause