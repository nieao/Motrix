# Financial Decision System - AI Service

基于多智能体的金融决策系统 Python AI 服务

## 🚀 快速开始

### 1. 安装依赖

```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp ../.env.example ../.env

# 编辑 .env 文件，填入 API 密钥
# 至少需要配置一个 LLM 提供商的 API Key:
# - DASHSCOPE_API_KEY (阿里百炼，推荐)
# - DEEPSEEK_API_KEY (DeepSeek)
# - OPENAI_API_KEY (OpenAI)
```

### 3. 启动服务

```bash
# 方式 1: 使用启动脚本
# Windows:
start.bat
# Linux/macOS:
chmod +x start.sh
./start.sh

# 方式 2: 直接启动
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. 测试服务

```bash
# 健康检查
curl http://localhost:8000/health

# 运行测试脚本
python test_service.py
```

## 📁 目录结构

```
financial-service/
├── api/                    # FastAPI 服务
│   └── main.py            # 主服务入口
├── agents/                 # 智能体
│   ├── base_agent.py      # 基础智能体类
│   ├── analysts/          # 分析师团队
│   │   ├── market_analyst.py        # 市场技术分析师
│   │   └── fundamental_analyst.py   # 基本面分析师
│   └── trader/            # 交易决策
│       └── decision_maker.py        # 交易决策员
├── core/                   # 核心模块
│   ├── analyzer.py        # 分析编排器
│   ├── llm/               # LLM 适配器
│   │   ├── base_adapter.py
│   │   ├── openai_adapter.py
│   │   └── dashscope_adapter.py
│   └── utils/             # 工具函数
│       ├── config.py      # 配置管理
│       └── logger.py      # 日志管理
├── data/                   # 数据处理
│   └── sources/           # 数据源
│       └── stock_data.py  # 股票数据提供者
├── config/                 # 配置文件
│   └── default.yaml       # 默认配置
├── requirements.txt        # Python 依赖
├── Dockerfile             # Docker 镜像
├── start.sh               # 启动脚本 (Linux/macOS)
├── start.bat              # 启动脚本 (Windows)
└── test_service.py        # 测试脚本
```

## 🔧 配置说明

### LLM 提供商配置

支持以下 LLM 提供商：

1. **阿里百炼 (DashScope)** - 推荐国内用户
   ```env
   DASHSCOPE_API_KEY=your_api_key
   ```

2. **DeepSeek**
   ```env
   DEEPSEEK_API_KEY=your_api_key
   ```

3. **OpenAI**
   ```env
   OPENAI_API_KEY=your_api_key
   ```

### 数据源配置

使用 `yfinance` 获取股票数据（无需 API key）

可选数据源：
- **FinnHub**: `FINNHUB_API_KEY`
- **Tushare**: `TUSHARE_TOKEN`

## 📊 API 接口

### 健康检查
```bash
GET /health
```

### 股票分析
```bash
POST /api/analyze
Content-Type: application/json

{
  "symbol": "AAPL",
  "market": "US",
  "depth": 3,
  "agents": ["market", "fundamental"],
  "llm_config": {
    "provider": "dashscope",
    "model": "qwen-plus"
  }
}
```

### 获取可用模型
```bash
GET /api/models
```

### 获取支持的市场
```bash
GET /api/markets
```

## 🧪 测试

```bash
# 运行测试脚本
python test_service.py

# 测试 API
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "market": "US",
    "depth": 3,
    "agents": ["market", "fundamental"]
  }'
```

## 🐛 故障排除

### 1. Python 版本过低
```bash
python --version  # 需要 3.10+
```

### 2. 依赖安装失败
```bash
# 升级 pip
python -m pip install --upgrade pip

# 使用国内镜像
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

### 3. API Key 无效
- 检查 .env 文件格式
- 确认 API Key 是否有效
- 检查账户余额

### 4. 端口被占用
```bash
# 更换端口
python -m uvicorn api.main:app --port 8001
```

## 📝 日志

日志文件位置：`./logs/financial-service.log`

```bash
# 查看日志
tail -f logs/financial-service.log
```

## 🔒 安全注意事项

1. **不要提交 .env 文件到 Git**
2. **保护 API 密钥安全**
3. **生产环境使用 HTTPS**
4. **限制服务访问权限**

## 📞 支持

遇到问题？查看：
- [快速开始指南](../docs/QUICKSTART_FINANCIAL.md)
- [完整设计文档](../docs/FINANCIAL_DECISION_SYSTEM_DESIGN.md)
- [GitHub Issues](https://github.com/agalwood/Motrix/issues)

## 📄 许可证

MIT License
