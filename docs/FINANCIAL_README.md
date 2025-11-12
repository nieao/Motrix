# 💰 Motrix 金融决策系统

> 基于多智能体 AI 的股票分析和投资决策系统

## 🎯 快速导航

| 文档 | 说明 | 适合人群 |
|------|------|----------|
| **[📘 设计文档](./FINANCIAL_DECISION_SYSTEM_DESIGN.md)** | 完整的系统架构和设计方案 | 开发者、架构师 |
| **[🚀 快速开始](./QUICKSTART_FINANCIAL.md)** | 5分钟快速部署指南 | 所有用户 |

## 📋 项目概述

这是一个集成到 Motrix 项目中的金融决策系统模块，采用多智能体 AI 协作架构，为用户提供专业的股票分析和投资建议。

### 核心特性

- **🤖 多智能体协作**: 4类专业分析师 + 辩论研究机制
- **🌍 多市场支持**: 美股、A股、港股全覆盖
- **🧠 智能模型**: 支持阿里百炼、DeepSeek、Google AI等多种大模型
- **⚡ 智能缓存**: 多层缓存策略，降低成本，提升速度
- **📊 5级分析深度**: 从快速概览到深度研究
- **📄 专业报告**: 支持导出 Markdown/Word/PDF 格式

## 🚀 快速开始

### Docker 一键部署 (推荐)

```bash
# 1. 配置环境变量
cp .env.example .env
# 编辑 .env，填入 API 密钥

# 2. 启动服务
docker-compose -f docker/docker-compose.yml up -d

# 3. 访问应用
# 应用会自动启动
```

### 本地部署

```bash
# 1. 安装 Python 依赖
cd financial-service
pip install -r requirements.txt

# 2. 启动 AI 服务
python -m uvicorn api.main:app --reload

# 3. 启动 Motrix
cd ..
yarn run dev
```

详细安装步骤请查看 **[🚀 快速开始指南](./QUICKSTART_FINANCIAL.md)**

## 📚 系统架构

```
┌─────────────┐
│  Motrix App │  ← Electron + Vue.js
└──────┬──────┘
       ↓ IPC
┌──────────────┐
│ Node.js 服务 │  ← 任务管理、进度跟踪
└──────┬───────┘
       ↓ HTTP API
┌──────────────┐
│ Python AI 服务│  ← 多智能体协作分析
└──────┬───────┘
       ↓
┌──────────────┐
│ Redis/MongoDB │  ← 缓存和持久化
└──────────────┘
```

完整架构说明请查看 **[📘 设计文档](./FINANCIAL_DECISION_SYSTEM_DESIGN.md)**

## 🎓 智能体团队

### 分析师团队 (Analysts)
- **📈 市场技术分析师**: K线、技术指标、趋势分析
- **💰 基本面分析师**: 财务数据、估值分析、行业地位
- **📰 新闻情绪分析师**: 新闻事件、市场情绪、舆情分析
- **💬 社交媒体分析师**: Twitter、Reddit等社交媒体情绪

### 研究员团队 (Researchers)
- **🐂 看涨研究员**: 寻找买入理由和机会
- **🐻 看跌研究员**: 识别风险和卖出信号
- **🎯 交易决策员**: 综合所有信息，给出最终建议

### 管理层 (Management)
- **👔 研究主管**: 协调各智能体工作
- **🛡️ 风险管理员**: 多维度风险评估

## 📊 使用示例

### 分析苹果公司 (AAPL)

```javascript
// 在 Motrix 应用中
const analysis = await financialService.analyze({
  symbol: 'AAPL',
  market: 'US',
  depth: 3,  // Level 3 分析
  agents: ['market', 'fundamental', 'news'],
  llmConfig: {
    provider: 'dashscope',
    model: 'qwen-plus'
  }
})

console.log(analysis)
// {
//   action: 'BUY',
//   confidence: 0.85,
//   risk_score: 0.35,
//   target_price: 195.50,
//   reasoning: '...'
// }
```

### 批量分析

```javascript
const stocks = ['AAPL', 'TSLA', 'MSFT']

for (const symbol of stocks) {
  const result = await financialService.analyze({
    symbol,
    depth: 2,
    enableCache: true
  })
  console.log(`${symbol}: ${result.action}`)
}
```

## 💰 成本控制

### 典型成本

| 分析级别 | 耗时 | 成本 (使用阿里百炼) |
|---------|------|-------------------|
| Level 1 | 2-4分钟 | ≈ ¥0.03 |
| Level 3 | 6-10分钟 | ≈ ¥0.10 |
| Level 5 | 15-25分钟 | ≈ ¥0.30 |

### 优化建议

1. **启用缓存** - 节省 50-80% 成本
2. **使用经济型模型** - qwen-turbo, deepseek-chat
3. **合理选择分析深度** - 日常监控用 Level 1-2
4. **批量分析优化** - 避免重复分析

## 📁 项目结构

```
Motrix/
├── src/
│   ├── renderer/components/Financial/  # 前端 UI 组件
│   └── main/services/financial/        # Node.js 服务
├── financial-service/                  # Python AI 服务
│   ├── agents/                         # 智能体
│   ├── data/                           # 数据处理
│   ├── core/                           # 核心模块
│   └── api/                            # FastAPI 接口
├── docs/                               # 文档
│   ├── FINANCIAL_DECISION_SYSTEM_DESIGN.md
│   └── QUICKSTART_FINANCIAL.md
└── docker/                             # Docker 配置
    └── docker-compose.yml
```

## 🔧 技术栈

### 前端
- **Electron** + **Vue.js 2.7** + **Element UI**

### 后端
- **Node.js** (主服务)
- **Python FastAPI** (AI 服务)

### AI 框架
- **LangChain** + **LangGraph**

### 数据库
- **Redis** (缓存)
- **MongoDB** (持久化)

### 数据源
- **美股**: FinnHub, Yahoo Finance
- **A股**: Tushare, AkShare, 通达信
- **港股**: AkShare, Yahoo Finance

## 📖 完整文档

### 核心文档
1. **[📘 系统设计文档](./FINANCIAL_DECISION_SYSTEM_DESIGN.md)**
   - 完整的系统架构设计
   - 智能体协作机制详解
   - 目录结构和模块设计
   - 实施步骤和时间表

2. **[🚀 快速开始指南](./QUICKSTART_FINANCIAL.md)**
   - 5分钟快速部署
   - 详细安装步骤
   - 常见问题解答
   - 故障排除

### 即将推出
- API 接口文档
- 开发者指南
- 用户使用手册
- 性能优化指南

## 🎯 应用场景

### 个人投资者
- 📊 日常股票监控
- 💰 投资决策辅助
- 📈 组合管理优化

### 专业交易者
- 🔍 深度研究分析
- ⚡ 实时市场监控
- 🎯 交易策略验证

### 金融机构
- 📊 批量股票筛选
- 🤖 自动化分析报告
- 📈 风险管理系统

## ⚠️ 重要声明

**本系统仅用于研究和教育目的，不构成投资建议。**

- ✋ AI 分析可能存在错误
- 📊 历史表现不代表未来
- 💰 投资有风险，决策需谨慎
- 👨‍💼 重要决策请咨询专业财务顾问

## 🤝 贡献指南

欢迎贡献代码、文档和建议！

### 如何贡献
1. Fork 项目
2. 创建特性分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 创建 Pull Request

### 开发规范
- 遵循 ESLint 代码规范
- 编写单元测试
- 更新相关文档

## 📞 获取帮助

### 文档资源
- **设计文档**: [FINANCIAL_DECISION_SYSTEM_DESIGN.md](./FINANCIAL_DECISION_SYSTEM_DESIGN.md)
- **快速开始**: [QUICKSTART_FINANCIAL.md](./QUICKSTART_FINANCIAL.md)

### 社区支持
- **GitHub Issues**: [提交问题](https://github.com/agalwood/Motrix/issues)
- **讨论区**: [GitHub Discussions](https://github.com/agalwood/Motrix/discussions)

### 联系方式
- **邮件**: agalwood.net@gmail.com
- **项目主页**: https://motrix.app

## 📜 许可证

本项目遵循 [MIT 许可证](../LICENSE)。

## 🙏 致谢

本项目设计受以下项目启发：
- **[TradingAgents](https://github.com/TauricResearch/TradingAgents)** - 多智能体交易框架
- **[TradingAgents-CN](https://github.com/hsliuping/TradingAgents-CN)** - 中文增强版本
- **[LangChain](https://github.com/langchain-ai/langchain)** - LLM 应用框架
- **[LangGraph](https://github.com/langchain-ai/langgraph)** - AI 工作流框架

感谢开源社区的贡献！

---

## 🚀 立即开始

准备好体验 AI 驱动的股票分析了吗？

👉 **[开始安装](./QUICKSTART_FINANCIAL.md)**

👉 **[阅读完整设计](./FINANCIAL_DECISION_SYSTEM_DESIGN.md)**

**祝你投资顺利！💰📈**

---

**版本**: v1.0.0 | **更新日期**: 2025-01-12 | **状态**: 设计阶段
