@echo off
REM 金融决策系统 - 启动脚本 (Windows)

echo Starting Financial Decision System...

REM 检查 Python 是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed. Please install Python 3.10 or higher.
    pause
    exit /b 1
)

REM 检查虚拟环境
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM 激活虚拟环境
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM 安装/更新依赖
echo Installing dependencies...
pip install -r requirements.txt --quiet

REM 启动服务
echo Starting FastAPI service...
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload

REM 清理
deactivate
