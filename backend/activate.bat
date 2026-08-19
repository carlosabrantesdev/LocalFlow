@echo off
color 0A
echo      INICIANDO LOCALFLOW - WINDOWS
echo.

echo [1/2] Ligando o Backend...
start "Backend IA - Uvicorn" cmd /k ".\venv\Scripts\activate.bat && python -m uvicorn main:app --reload"

echo Aguardando o servidor respirar e abrir a porta 8000...
timeout /t 3 /nobreak >nul

echo [2/2] Conectando o Tunel (Ngrok)...
echo URL: shortcut-retaining-folk.ngrok-free.dev
echo.
ngrok http --url=shortcut-retaining-folk.ngrok-free.dev 8000