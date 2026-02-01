@echo off
cd /d "%~dp0frontend"
echo Serving frontend... Open http://localhost:3000 in browser.
echo Press Ctrl+C to stop.
npx serve .
