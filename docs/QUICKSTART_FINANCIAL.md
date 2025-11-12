# 金融决策系统快速开始指南

## 📋 目录

- [系统要求](#系统要求)
- [5分钟快速体验](#5分钟快速体验)
- [详细安装步骤](#详细安装步骤)
- [基础使用教程](#基础使用教程)
- [常见问题](#常见问题)

## 🖥️ 系统要求

### 硬件要求
- **CPU**: 双核 2.0 GHz 以上
- **内存**: 最低 4GB，推荐 8GB+
- **硬盘**: 至少 2GB 可用空间
- **网络**: 稳定的互联网连接

### 软件要求
- **Node.js**: v16.0.0 或更高
- **Python**: 3.10 或更高
- **Docker**: (可选) 用于容器化部署
- **操作系统**: Windows 10+, macOS 10.15+, Ubuntu 20.04+

## 🚀 5分钟快速体验

### 方式一：Docker 一键部署 (推荐)

```bash
# 1. 克隆项目
git clone https://github.com/agalwood/Motrix.git
cd Motrix

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的 API 密钥

# 3. 启动所有服务
docker-compose -f docker/docker-compose.yml up -d

# 4. 等待服务启动 (约1分钟)
# 访问 http://localhost:8501
```

就这么简单！🎉

### 方式二：本地快速部署

```bash
# 1. 安装 Python 依赖
cd financial-service
pip install -r requirements.txt

# 2. 启动 Python 服务
python -m uvicorn api.main:app --reload &

# 3. 安装 Node 依赖并启动
cd ..
yarn install
yarn run dev

# 4. 访问应用
# Electron 应用会自动打开
```

## 📦 详细安装步骤

### 步骤 1: 准备环境

#### 安装 Node.js
```bash
# macOS (使用 Homebrew)
brew install node

# Windows (使用 Chocolatey)
choco install nodejs

# Ubuntu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 安装 Python
```bash
# macOS
brew install python@3.10

# Windows
choco install python --version=3.10

# Ubuntu
sudo apt update
sudo apt install python3.10 python3.10-venv python3-pip
```

#### 安装 Docker (可选)
```bash
# macOS
brew install --cask docker

# Windows
choco install docker-desktop

# Ubuntu
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### 步骤 2: 克隆项目

```bash
# HTTPS
git clone https://github.com/agalwood/Motrix.git

# SSH
git clone git@github.com:agalwood/Motrix.git

cd Motrix
```

### 步骤 3: 配置 API 密钥

#### 3.1 创建配置文件
```bash
cp .env.example .env
```

#### 3.2 编辑 .env 文件

```bash
# 使用你喜欢的编辑器打开
# Windows
notepad .env

# macOS/Linux
nano .env
# 或
vim .env
```

#### 3.3 填入 API 密钥

**推荐配置 (使用国产大模型)**：
```env
# ============ 必需配置 ============
# 阿里百炼 (推荐，国内速度快)
DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx

# FinnHub (免费，用于获取股票数据)
FINNHUB_API_KEY=your_finnhub_key

# ============ 可选配置 ============
# DeepSeek (性价比高)
DEEPSEEK_API_KEY=your_deepseek_key

# Tushare (专业A股数据，需要积分)
TUSHARE_TOKEN=your_tushare_token
```

**如何获取 API 密钥**：

1. **阿里百炼** (推荐):
   - 访问: https://dashscope.console.aliyun.com/
   - 注册/登录阿里云账号
   - 开通"模型服务灵积"
   - 创建 API Key
   - 新用户有免费额度

2. **FinnHub**:
   - 访问: https://finnhub.io/
   - 注册账号
   - 免费 API 每分钟 60 次调用

3. **DeepSeek**:
   - 访问: https://platform.deepseek.com/
   - 注册账号
   - 获取 API Key
   - 新用户有免费额度

4. **Tushare** (可选):
   - 访问: https://tushare.pro/
   - 注册账号
   - 完成积分任务获取权限

### 步骤 4: 安装依赖

#### 4.1 安装 Python 依赖
```bash
cd financial-service

# 创建虚拟环境 (推荐)
python -m venv venv

# 激活虚拟环境
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# 升级 pip
python -m pip install --upgrade pip

# 安装依赖
pip install -r requirements.txt

# 如果安装速度慢，使用国内镜像
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

#### 4.2 安装 Node 依赖
```bash
cd ..

# 使用 yarn (推荐)
yarn install

# 或使用 npm
npm install
```

### 步骤 5: 启动数据库 (可选)

如果要使用完整功能，需要启动 Redis 和 MongoDB：

#### 使用 Docker (推荐)
```bash
docker-compose -f docker/docker-compose.yml up -d redis mongodb
```

#### 本地安装

**Redis**:
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu
sudo apt install redis-server
sudo systemctl start redis

# Windows
# 下载: https://github.com/tporadowski/redis/releases
```

**MongoDB**:
```bash
# macOS
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Ubuntu
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
sudo apt-get install -y mongodb-org
sudo systemctl start mongod

# Windows
# 下载: https://www.mongodb.com/try/download/community
```

### 步骤 6: 启动服务

#### 6.1 启动 Python AI 服务
```bash
cd financial-service
source venv/bin/activate  # Windows: venv\Scripts\activate

# 开发模式
python -m uvicorn api.main:app --reload --host 0.0.0.0 --port 8000

# 或后台运行
nohup python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 > ../logs/python-service.log 2>&1 &
```

#### 6.2 启动 Motrix 应用
```bash
cd ..

# 开发模式
yarn run dev

# 或生产构建
yarn run build
```

### 步骤 7: 验证安装

#### 7.1 检查 Python 服务
```bash
curl http://localhost:8000/health
```

期望输出：
```json
{
  "status": "healthy",
  "redis": true,
  "mongodb": true
}
```

#### 7.2 检查可用模型
```bash
curl http://localhost:8000/api/models
```

#### 7.3 访问应用
- Electron 应用会自动打开
- 或手动访问: http://localhost:8501 (如果使用 Web 版)

## 📚 基础使用教程

### 第一次分析

1. **打开金融分析模块**
   - 点击侧边栏的 "💰 金融分析" 菜单

2. **输入股票代码**
   ```
   美股示例: AAPL, TSLA, MSFT, NVDA
   A股示例: 000001, 600519, 300750
   港股示例: 0700.HK, 9988.HK
   ```

3. **选择分析深度**
   - 首次使用推荐选择 **Level 3** (6-10分钟)
   - 可以获得完整的分析体验

4. **选择 AI 模型**
   - 推荐使用 **阿里百炼 - 通义千问 Plus**
   - 中文用户速度快，成本低

5. **选择分析师**
   - ✅ 市场技术分析
   - ✅ 基本面分析
   - ✅ 新闻情绪分析
   - (首次使用推荐全选)

6. **开始分析**
   - 点击 "🚀 开始分析" 按钮
   - 等待分析完成 (6-10分钟)
   - 可以实时查看分析进度

7. **查看报告**
   - 分析完成后自动显示结果
   - 包含投资建议、目标价位、风险评分等
   - 可以导出 PDF/Word/Markdown 格式

### 示例分析：苹果公司 (AAPL)

```
输入配置:
- 股票代码: AAPL
- 市场: 美股
- 研究深度: Level 3
- AI 模型: 阿里百炼 - qwen-plus
- 分析师: 全选

预期结果:
- 分析时间: 6-8分钟
- 投资建议: BUY / HOLD / SELL
- 置信度: 75-90%
- 风险评分: 低-中等
- 目标价位: $XXX.XX
- 详细分析: 包含技术面、基本面、新闻情绪等
```

## 🎯 进阶使用

### 自定义分析配置

```javascript
// 在配置面板中
const customConfig = {
  // 使用更经济的模型组合
  quickThinkLLM: 'qwen-turbo',
  deepThinkLLM: 'qwen-plus',

  // 调整辩论轮次
  maxDebateRounds: 2,

  // 启用缓存优化
  enableCache: true,
  cacheTTL: 3600,

  // 自定义分析师组合
  agents: ['market', 'fundamental', 'news']
}
```

### 批量分析

```javascript
// 使用批量分析功能
const stocks = ['AAPL', 'TSLA', 'MSFT', 'GOOGL']

for (const symbol of stocks) {
  await analyzeStock(symbol, {
    depth: 2,  // 使用较快的深度
    enableCache: true
  })
}
```

### 定时分析

```javascript
// 设置定时任务
const schedule = {
  frequency: 'daily',
  time: '09:30',  // 每天9:30
  stocks: ['AAPL', 'TSLA'],
  depth: 3
}
```

## ❓ 常见问题

### Q1: API 密钥无效？

**A**: 检查以下几点：
1. 密钥是否正确复制 (注意不要有空格)
2. 密钥是否已激活 (有些需要充值才能使用)
3. 账户是否有足够余额
4. 检查 .env 文件格式是否正确

```bash
# 正确格式
DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx

# 错误格式 (有引号)
DASHSCOPE_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxx"
```

### Q2: Python 服务无法启动？

**A**: 常见原因：
1. **端口被占用**
   ```bash
   # 检查端口
   lsof -i :8000  # macOS/Linux
   netstat -ano | findstr :8000  # Windows

   # 更换端口
   python -m uvicorn api.main:app --port 8001
   ```

2. **依赖未安装**
   ```bash
   pip install -r requirements.txt
   ```

3. **Python 版本过低**
   ```bash
   python --version  # 需要 3.10+
   ```

### Q3: 分析速度太慢？

**A**: 优化建议：
1. **使用缓存**
   - 启用 Redis 缓存
   - 设置合理的 TTL

2. **选择更快的模型**
   - qwen-turbo (最快)
   - gemini-2.0-flash (很快)
   - deepseek-chat (快)

3. **降低分析深度**
   - Level 1-2: 更快，适合日常监控
   - Level 3-4: 平衡
   - Level 5: 最慢，仅用于重要决策

4. **减少智能体数量**
   - 只选择核心分析师
   - 最少选 2 个即可

### Q4: 数据库连接失败？

**A**: 检查步骤：
1. **确认服务运行**
   ```bash
   # Redis
   redis-cli ping
   # 期望输出: PONG

   # MongoDB
   mongosh --eval "db.adminCommand('ping')"
   # 期望输出: { ok: 1 }
   ```

2. **检查连接配置**
   ```env
   REDIS_HOST=localhost
   REDIS_PORT=6379

   MONGODB_HOST=localhost
   MONGODB_PORT=27017
   ```

3. **防火墙设置**
   - 确保端口未被防火墙阻止

### Q5: 分析结果不准确？

**A**: 说明：
1. **这是 AI 分析，不是投资建议**
   - AI 可能出错
   - 需要结合自己的判断
   - 不要盲目相信

2. **提高准确性**
   - 使用更高级的模型 (qwen-max, gpt-4o)
   - 增加分析深度 (Level 4-5)
   - 多次分析对比
   - 关注置信度和风险评分

3. **数据时效性**
   - 实时数据可能有延迟
   - 新闻可能不够及时
   - 建议自己验证关键信息

### Q6: 成本控制？

**A**: 成本优化策略：

1. **使用经济型模型**
   ```yaml
   # 成本对比 (每1K tokens)
   qwen-turbo:  ¥0.002  # 最便宜
   qwen-plus:   ¥0.008  # 推荐
   qwen-max:    ¥0.02   # 最贵
   ```

2. **启用缓存**
   - 同一股票 1 小时内使用缓存
   - 可节省 50-80% 成本

3. **控制分析深度**
   ```
   Level 1: ~¥0.03/次
   Level 3: ~¥0.10/次
   Level 5: ~¥0.30/次
   ```

4. **批量分析优化**
   - 避免短时间内重复分析
   - 使用定时任务统一分析

### Q7: Windows 上安装失败？

**A**: Windows 特殊处理：

1. **使用管理员权限**
   - 右键 "以管理员身份运行" PowerShell

2. **Python 编译问题**
   ```bash
   # 安装 Visual C++ 构建工具
   # 下载: https://visualstudio.microsoft.com/downloads/
   ```

3. **路径问题**
   ```bash
   # 避免使用中文路径
   # 避免路径过长
   ```

4. **使用 WSL2** (推荐)
   ```bash
   # 安装 WSL2
   wsl --install

   # 在 WSL2 中运行
   ```

### Q8: 如何更新系统？

**A**: 更新步骤：

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 更新 Python 依赖
cd financial-service
pip install -r requirements.txt --upgrade

# 3. 更新 Node 依赖
cd ..
yarn install

# 4. 重启服务
# 方式1: 重启 Docker
docker-compose restart

# 方式2: 手动重启
# 停止旧服务，启动新服务
```

## 🔧 故障排除

### 日志查看

```bash
# Python 服务日志
tail -f logs/python-service.log

# Electron 日志
# macOS
~/Library/Logs/Motrix/
# Windows
%APPDATA%\Motrix\logs\
# Linux
~/.config/Motrix/logs/
```

### 重置系统

```bash
# 清理缓存
redis-cli FLUSHDB

# 重置配置
rm -rf ~/.config/motrix-financial
cp .env.example .env

# 重新安装依赖
rm -rf node_modules financial-service/venv
yarn install
cd financial-service && python -m venv venv && pip install -r requirements.txt
```

### 完全卸载

```bash
# 停止所有服务
docker-compose down -v  # Docker 方式
# 或手动停止服务

# 删除数据
rm -rf data/
rm -rf logs/

# 删除配置
rm .env
rm -rf ~/.config/motrix-financial
```

## 📞 获取帮助

### 文档资源
- [详细设计文档](./FINANCIAL_DECISION_SYSTEM_DESIGN.md)
- [API 文档](./API_DOCUMENTATION.md)
- [开发指南](./DEVELOPMENT_GUIDE.md)

### 社区支持
- **GitHub Issues**: [提交问题](https://github.com/agalwood/Motrix/issues)
- **讨论区**: [GitHub Discussions](https://github.com/agalwood/Motrix/discussions)
- **邮件**: agalwood.net@gmail.com

### 贡献代码
欢迎提交 Pull Request！请先阅读 [贡献指南](../CONTRIBUTING.md)。

## 🎓 学习资源

### 推荐阅读
1. [TradingAgents 论文](https://arxiv.org/abs/xxx)
2. [LangChain 官方文档](https://python.langchain.com/)
3. [多智能体系统设计](https://www.anthropic.com/multi-agent)

### 视频教程
- (待添加) YouTube 教程链接
- (待添加) B站教程链接

### 示例项目
- [TradingAgents-CN](https://github.com/hsliuping/TradingAgents-CN)
- [LangGraph Examples](https://github.com/langchain-ai/langgraph/tree/main/examples)

---

## 🚀 下一步

现在你已经成功安装并运行了金融决策系统！

建议你：
1. ✅ 尝试分析几只不同的股票
2. ✅ 试验不同的分析深度和模型组合
3. ✅ 导出分析报告，查看详细内容
4. ✅ 阅读详细设计文档，了解系统架构
5. ✅ 加入社区，分享你的使用体验

**祝你投资顺利！💰📈**

---

**文档版本**: v1.0.0
**最后更新**: 2025-01-12
