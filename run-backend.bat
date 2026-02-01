@echo off
cd /d "%~dp0backend"
if not exist venv (
    echo Creating venv...
    python -m venv venv
)
call venv\Scripts\activate.bat
pip install -r ..\requirements.txt -q
echo.
echo Backend starting at http://localhost:8000
echo Press Ctrl+C to stop.
uvicorn main:app --reload --host 0.0.0.0 --port 8000
