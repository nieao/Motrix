#!/bin/bash

# 金融决策系统 - 启动脚本 (Linux/macOS)

echo "🚀 Starting Financial Decision System..."

# 检查 Python 是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.10 or higher."
    exit 1
fi

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# 激活虚拟环境
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# 安装/更新依赖
echo "📥 Installing dependencies..."
pip install -r requirements.txt --quiet

# 启动服务
echo "✅ Starting FastAPI service..."
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload

# 清理
deactivate
