@echo off
setlocal
cd /d "%~dp0"

echo ===========================================
echo  Cuando Vence? - Setup del proyecto
echo  (ejecutar una sola vez por maquina)
echo ===========================================

rem --- 1. Localizar Python ---
set "PY="
where py >nul 2>nul && set "PY=py -3.13"
if not defined PY (
    where python >nul 2>nul && set "PY=python"
)
if not defined PY (
    echo [ERROR] No se encontro Python. Instalalo desde https://www.python.org/downloads/
    exit /b 1
)

rem --- 2. Crear el entorno virtual si no existe ---
if not exist "entorno\Scripts\python.exe" (
    echo Creando el entorno virtual en .\entorno ...
    %PY% -m venv entorno
    if errorlevel 1 (
        echo [ERROR] No se pudo crear el entorno virtual.
        exit /b 1
    )
)

set "VPY=entorno\Scripts\python.exe"

rem --- 3. Instalar dependencias de Python ---
echo Instalando dependencias de Python (requirements.txt) ...
"%VPY%" -m pip install --upgrade pip
"%VPY%" -m pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Fallo la instalacion de dependencias de Python.
    exit /b 1
)

rem --- 4. Dependencias y build del frontend ---
where npm >nul 2>nul
if errorlevel 1 (
    echo [AVISO] Node.js no encontrado: se omite el build del frontend.
    echo          Hace falta Node al menos una vez para generar src\frontend\dist.
) else (
    echo Instalando dependencias del frontend ...
    pushd src\frontend
    call npm install
    if errorlevel 1 (
        popd
        echo [ERROR] Fallo npm install.
        exit /b 1
    )
    echo Compilando el frontend ^(npm run build^) ...
    call npm run build
    if errorlevel 1 (
        popd
        echo [ERROR] Fallo npm run build.
        exit /b 1
    )
    popd
)

rem --- 5. Migraciones de la base de datos ---
echo Aplicando migraciones de la base de datos ...
"%VPY%" src\backend\manage.py migrate
if errorlevel 1 (
    echo [ERROR] Fallo la migracion de la base de datos.
    exit /b 1
)

echo.
echo ===========================================
echo  Listo! Para usar la app ejecutar: iniciar.bat
echo  (la app queda en http://127.0.0.1:8000)
echo ===========================================
endlocal
