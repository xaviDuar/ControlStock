@echo off
setlocal
cd /d "%~dp0"

if not exist "entorno\Scripts\python.exe" (
    echo [ERROR] No existe el entorno virtual. Ejecuta primero: setup.bat
    exit /b 1
)
if not exist "src\frontend\dist\index.html" (
    echo [ERROR] No existe el build del frontend. Ejecuta primero: setup.bat
    exit /b 1
)

echo Cuando Vence? - http://127.0.0.1:8000  (Ctrl+C para detener)
entorno\Scripts\python.exe src\backend\manage.py runserver
endlocal
