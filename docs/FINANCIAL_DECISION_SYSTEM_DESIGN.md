# 金融决策系统设计方案

## 📋 项目概述

基于 TradingAgents 的多智能体架构设计思想，为 Motrix 项目设计一个独立的**金融决策系统模块**。该系统将采用现代化的多智能体协作机制，为用户提供专业的股票分析和投资决策建议。

### 🎯 核心目标

1. **智能分析**: 利用多个专业 AI 智能体协同工作，提供全方位的股票分析
2. **实时决策**: 基于实时市场数据和新闻，快速生成投资建议
3. **风险控制**: 多层次风险评估体系，保护用户投资安全
4. **用户友好**: 简洁直观的界面，适合各层次投资者使用

### 🌟 系统特色

- **🤖 多智能体协作**: 4类分析师 + 3类研究员 + 交易决策系统
- **📊 多市场支持**: 美股、A股、港股全覆盖
- **🧠 智能模型**: 支持多种大语言模型（OpenAI、阿里百炼、DeepSeek、Google AI等）
- **📈 5级分析深度**: 从快速概览到深度研究，满足不同需求
- **💾 智能缓存**: 多层缓存机制，降低API成本，提升响应速度
- **📄 专业报告**: 支持导出 Markdown、Word、PDF 格式的分析报告

## 🏗️ 系统架构设计

### 1. 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      前端展示层 (Vue.js)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ 市场分析 │  │ 股票搜索 │  │ 分析报告 │  │ 配置管理 │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ API调用
┌─────────────────────────────────────────────────────────────┐
│                    业务逻辑层 (Node.js)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          任务管理器 (Task Manager)                    │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ 分析调度 │  │ 结果聚合 │  │ 进度管理 │  │ 缓存管理 │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ IPC通信
┌─────────────────────────────────────────────────────────────┐
│                 智能体协作层 (Python Service)                 │
│  ┌────────────────────────────────────────────────────┐     │
│  │              分析师团队 (Analysts)                  │     │
│  │  📈 市场分析师  💰 基本面分析师  📰 新闻分析师       │     │
│  │  💬 社交媒体分析师                                  │     │
│  └────────────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────────┐     │
│  │              研究员团队 (Researchers)               │     │
│  │  🐂 看涨研究员  🐻 看跌研究员  🎯 交易决策员        │     │
│  └────────────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────────┐     │
│  │           管理层 (Management Layer)                 │     │
│  │  👔 研究主管  🛡️ 风险管理员                        │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕ API调用
┌─────────────────────────────────────────────────────────────┐
│                     数据服务层                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ 市场数据 │  │ 新闻数据 │  │ 财务数据 │  │ 社交数据 │   │
│  │ (实时行情)│  │(Google等)│  │ (财报等) │  │(Twitter等)│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │  MongoDB  │  │  Redis   │  │ LLM API  │                 │
│  │  (持久化) │  │  (缓存)  │  │(AI模型)  │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

### 2. 智能体协作流程

```
用户输入股票代码 → 任务创建
                    ↓
    ┌───────────────┴───────────────┐
    │                               │
    ↓                               ↓
【并行阶段1: 数据收集】        【配置加载】
    ├─ 📈 市场技术分析师           - LLM模型选择
    ├─ 💰 基本面分析师             - 分析深度设置
    ├─ 📰 新闻情绪分析师           - 风险参数配置
    └─ 💬 社交媒体分析师
                    ↓
            【数据汇总与整合】
                    ↓
    ┌───────────────┴───────────────┐
    │                               │
    ↓                               ↓
【并行阶段2: 研究辩论】        【风险评估】
    ├─ 🐂 看涨研究员               🛡️ 风险管理员
    └─ 🐻 看跌研究员               - 市场风险分析
                    ↓               - 个股风险评估
            【多轮辩论机制】         - 组合风险计算
            (1-3轮，可配置)
                    ↓
    ┌───────────────┴───────────────┐
    │                               │
    ↓                               ↓
【决策阶段】                   【报告生成】
    🎯 交易决策员                   📄 结构化报告
    - 综合所有意见                  - 投资建议
    - 给出最终建议                  - 目标价位
    - 置信度评分                    - 风险提示
    - 风险评级                      - 详细分析
                    ↓
            【结果输出】
    ├─ 📊 实时界面展示
    ├─ 💾 数据库存储
    └─ 📤 报告导出
```

### 3. 技术栈

#### 前端 (Motrix 现有技术栈)
- **框架**: Vue.js 2.7 + Vuex
- **UI**: Element UI
- **通信**: Electron IPC
- **图表**: ECharts / TradingView

#### 后端服务 (新增)
- **主服务**: Node.js (与 Electron 主进程集成)
- **AI服务**: Python FastAPI (微服务架构)
- **数据库**: MongoDB (数据持久化) + Redis (缓存)
- **消息队列**: (可选) Bull / RabbitMQ

#### AI 智能体
- **框架**: LangChain / LangGraph
- **模型**:
  - 阿里百炼 (qwen-turbo, qwen-plus, qwen-max)
  - DeepSeek (deepseek-chat)
  - Google AI (gemini-2.0-flash, gemini-2.5-pro)
  - OpenAI (gpt-4o, gpt-4o-mini)
  - OpenRouter (60+ 模型)

#### 数据源
- **美股**: FinnHub, Yahoo Finance
- **A股**: Tushare, AkShare, 通达信
- **港股**: AkShare, Yahoo Finance
- **新闻**: Google News, 财经新闻API
- **社交**: Twitter API, Reddit API

## 📁 项目目录结构

```
Motrix/
├── src/
│   ├── main/                          # Electron 主进程
│   │   └── services/
│   │       └── financial/             # 🆕 金融服务模块
│   │           ├── index.js           # 服务入口
│   │           ├── TaskManager.js     # 任务管理器
│   │           ├── PythonBridge.js    # Python服务桥接
│   │           ├── CacheManager.js    # 缓存管理
│   │           └── ConfigManager.js   # 配置管理
│   │
│   ├── renderer/                      # 渲染进程
│   │   ├── components/
│   │   │   └── Financial/             # 🆕 金融决策UI组件
│   │   │       ├── Dashboard.vue      # 主仪表板
│   │   │       ├── StockAnalyzer.vue  # 股票分析器
│   │   │       ├── ReportViewer.vue   # 报告查看器
│   │   │       ├── ConfigPanel.vue    # 配置面板
│   │   │       └── ProgressTracker.vue # 进度跟踪
│   │   │
│   │   ├── store/
│   │   │   └── modules/
│   │   │       └── financial.js       # 🆕 Vuex 状态管理
│   │   │
│   │   └── views/
│   │       └── Financial.vue          # 🆕 金融分析主页面
│   │
│   └── shared/
│       └── financial/                 # 🆕 共享配置
│           ├── constants.js           # 常量定义
│           └── schemas.js             # 数据结构定义
│
├── financial-service/                 # 🆕 Python AI 服务 (独立微服务)
│   ├── agents/                        # 智能体模块
│   │   ├── analysts/                  # 分析师团队
│   │   │   ├── market_analyst.py      # 市场技术分析师
│   │   │   ├── fundamental_analyst.py # 基本面分析师
│   │   │   ├── news_analyst.py        # 新闻情绪分析师
│   │   │   └── social_analyst.py      # 社交媒体分析师
│   │   │
│   │   ├── researchers/               # 研究员团队
│   │   │   ├── bull_researcher.py     # 看涨研究员
│   │   │   ├── bear_researcher.py     # 看跌研究员
│   │   │   └── debate_manager.py      # 辩论管理器
│   │   │
│   │   ├── trader/                    # 交易决策
│   │   │   ├── decision_maker.py      # 决策制定器
│   │   │   └── risk_manager.py        # 风险管理器
│   │   │
│   │   └── managers/                  # 管理层
│   │       ├── research_supervisor.py # 研究主管
│   │       └── coordinator.py         # 协调器
│   │
│   ├── data/                          # 数据处理
│   │   ├── sources/                   # 数据源
│   │   │   ├── stock_data.py          # 股票数据
│   │   │   ├── news_data.py           # 新闻数据
│   │   │   ├── financial_data.py      # 财务数据
│   │   │   └── social_data.py         # 社交数据
│   │   │
│   │   ├── processors/                # 数据处理器
│   │   │   ├── cleaner.py             # 数据清洗
│   │   │   ├── transformer.py         # 数据转换
│   │   │   └── validator.py           # 数据验证
│   │   │
│   │   └── cache/                     # 缓存管理
│   │       ├── redis_cache.py         # Redis缓存
│   │       └── mongodb_cache.py       # MongoDB缓存
│   │
│   ├── core/                          # 核心模块
│   │   ├── graph/                     # LangGraph 工作流
│   │   │   ├── trading_graph.py       # 交易决策图
│   │   │   └── workflow_builder.py    # 工作流构建器
│   │   │
│   │   ├── llm/                       # LLM 适配器
│   │   │   ├── openai_adapter.py      # OpenAI适配
│   │   │   ├── dashscope_adapter.py   # 阿里百炼适配
│   │   │   ├── deepseek_adapter.py    # DeepSeek适配
│   │   │   ├── google_adapter.py      # Google AI适配
│   │   │   └── router_adapter.py      # OpenRouter适配
│   │   │
│   │   └── utils/                     # 工具函数
│   │       ├── logger.py              # 日志系统
│   │       ├── config.py              # 配置管理
│   │       └── helpers.py             # 辅助函数
│   │
│   ├── api/                           # FastAPI 服务
│   │   ├── main.py                    # API 入口
│   │   ├── routes/                    # 路由
│   │   │   ├── analyze.py             # 分析接口
│   │   │   ├── config.py              # 配置接口
│   │   │   └── report.py              # 报告接口
│   │   │
│   │   └── models/                    # 数据模型
│   │       ├── request.py             # 请求模型
│   │       └── response.py            # 响应模型
│   │
│   ├── reports/                       # 报告生成
│   │   ├── generator.py               # 报告生成器
│   │   ├── templates/                 # 报告模板
│   │   │   ├── markdown.jinja2
│   │   │   ├── html.jinja2
│   │   │   └── pdf.jinja2
│   │   │
│   │   └── exporters/                 # 导出器
│   │       ├── markdown_exporter.py
│   │       ├── word_exporter.py
│   │       └── pdf_exporter.py
│   │
│   ├── config/                        # 配置文件
│   │   ├── default.yaml               # 默认配置
│   │   ├── llm_models.yaml            # LLM模型配置
│   │   └── data_sources.yaml          # 数据源配置
│   │
│   ├── tests/                         # 测试
│   │   ├── unit/                      # 单元测试
│   │   ├── integration/               # 集成测试
│   │   └── e2e/                       # 端到端测试
│   │
│   ├── requirements.txt               # Python依赖
│   ├── Dockerfile                     # Docker配置
│   └── README.md                      # 服务文档
│
├── docs/                              # 🆕 文档目录
│   ├── FINANCIAL_DECISION_SYSTEM_DESIGN.md  # 本设计文档
│   ├── INTEGRATION_GUIDE.md           # 集成指南
│   ├── API_DOCUMENTATION.md           # API文档
│   ├── USER_MANUAL.md                 # 用户手册
│   └── DEVELOPMENT_GUIDE.md           # 开发指南
│
├── scripts/                           # 🆕 脚本工具
│   ├── setup_financial_service.sh     # 安装脚本
│   ├── start_services.sh              # 启动服务
│   └── deploy.sh                      # 部署脚本
│
└── docker/                            # 🆕 Docker配置
    ├── docker-compose.yml             # Docker Compose
    ├── Dockerfile.financial           # Python服务镜像
    └── nginx.conf                     # (可选) Nginx配置
```

## 🔧 核心模块详细设计

### 1. 任务管理器 (TaskManager.js)

```javascript
/**
 * 金融分析任务管理器
 * 负责任务的创建、调度、进度跟踪和结果管理
 */
class FinancialTaskManager {
  constructor() {
    this.activeTasks = new Map()
    this.taskQueue = []
    this.pythonBridge = new PythonBridge()
    this.cacheManager = new CacheManager()
  }

  /**
   * 创建新的分析任务
   * @param {Object} options - 任务配置
   * @returns {Promise<String>} taskId
   */
  async createAnalysisTask(options) {
    const taskId = this.generateTaskId()
    const task = {
      id: taskId,
      symbol: options.symbol,
      market: options.market,
      depth: options.depth,
      agents: options.agents,
      llmConfig: options.llmConfig,
      status: 'pending',
      progress: 0,
      createdAt: Date.now()
    }

    this.activeTasks.set(taskId, task)
    await this.executeTask(task)
    return taskId
  }

  /**
   * 执行分析任务
   */
  async executeTask(task) {
    try {
      task.status = 'running'

      // 检查缓存
      const cached = await this.cacheManager.get(task.symbol)
      if (cached && this.isCacheValid(cached)) {
        task.result = cached
        task.status = 'completed'
        return
      }

      // 调用 Python 服务
      const result = await this.pythonBridge.analyze({
        symbol: task.symbol,
        market: task.market,
        depth: task.depth,
        agents: task.agents,
        llm_config: task.llmConfig,
        callback: (progress) => {
          task.progress = progress
          this.notifyProgress(task)
        }
      })

      task.result = result
      task.status = 'completed'

      // 缓存结果
      await this.cacheManager.set(task.symbol, result)

    } catch (error) {
      task.status = 'failed'
      task.error = error.message
    }
  }

  /**
   * 获取任务状态
   */
  getTaskStatus(taskId) {
    return this.activeTasks.get(taskId)
  }

  /**
   * 通知进度更新
   */
  notifyProgress(task) {
    // 通过 IPC 发送进度更新到渲染进程
    const mainWindow = require('./WindowManager').getMainWindow()
    mainWindow.webContents.send('financial-task-progress', {
      taskId: task.id,
      progress: task.progress,
      status: task.status
    })
  }
}
```

### 2. Python 服务桥接 (PythonBridge.js)

```javascript
/**
 * Python AI 服务桥接器
 * 负责与 Python FastAPI 服务通信
 */
class PythonBridge {
  constructor() {
    this.serviceUrl = 'http://localhost:8000'
    this.connected = false
  }

  /**
   * 启动 Python 服务
   */
  async startService() {
    const { spawn } = require('child_process')
    const path = require('path')

    const servicePath = path.join(__dirname, '../../../financial-service')
    const pythonExecutable = process.platform === 'win32' ? 'python' : 'python3'

    this.pythonProcess = spawn(pythonExecutable, ['-m', 'uvicorn', 'api.main:app', '--port', '8000'], {
      cwd: servicePath,
      stdio: 'pipe'
    })

    this.pythonProcess.stdout.on('data', (data) => {
      console.log(`Python Service: ${data}`)
    })

    // 等待服务启动
    await this.waitForService()
    this.connected = true
  }

  /**
   * 调用分析接口
   */
  async analyze(options) {
    const response = await fetch(`${this.serviceUrl}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(options)
    })

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.statusText}`)
    }

    return await response.json()
  }

  /**
   * 健康检查
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.serviceUrl}/health`)
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * 关闭服务
   */
  async shutdown() {
    if (this.pythonProcess) {
      this.pythonProcess.kill()
    }
  }
}
```

### 3. 前端主组件 (StockAnalyzer.vue)

```vue
<template>
  <div class="stock-analyzer">
    <!-- 配置面板 -->
    <el-card class="config-panel">
      <h3>📊 股票分析配置</h3>

      <!-- 股票输入 -->
      <el-form :model="form" label-width="120px">
        <el-form-item label="股票代码">
          <el-input
            v-model="form.symbol"
            placeholder="输入股票代码，如: AAPL, 000001, 0700.HK"
            @keyup.enter="startAnalysis"
          >
            <template #prepend>
              <el-select v-model="form.market" style="width: 100px">
                <el-option label="美股" value="US" />
                <el-option label="A股" value="CN" />
                <el-option label="港股" value="HK" />
              </el-select>
            </template>
          </el-input>
        </el-form-item>

        <!-- 分析深度 -->
        <el-form-item label="研究深度">
          <el-radio-group v-model="form.depth">
            <el-radio :label="1">1级 (2-4分钟) 快速概览</el-radio>
            <el-radio :label="2">2级 (4-6分钟) 标准分析</el-radio>
            <el-radio :label="3">3级 (6-10分钟) 深度分析 ⭐</el-radio>
            <el-radio :label="4">4级 (10-15分钟) 全面分析</el-radio>
            <el-radio :label="5">5级 (15-25分钟) 最深度分析</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- LLM 模型选择 -->
        <el-form-item label="AI 模型">
          <el-select v-model="form.llmProvider" @change="onProviderChange">
            <el-option label="阿里百炼 (推荐)" value="dashscope" />
            <el-option label="DeepSeek" value="deepseek" />
            <el-option label="Google AI" value="google" />
            <el-option label="OpenAI" value="openai" />
            <el-option label="OpenRouter" value="openrouter" />
          </el-select>

          <el-select v-model="form.llmModel" style="margin-left: 10px">
            <el-option
              v-for="model in availableModels"
              :key="model.value"
              :label="model.label"
              :value="model.value"
            />
          </el-select>
        </el-form-item>

        <!-- 智能体选择 -->
        <el-form-item label="分析师选择">
          <el-checkbox-group v-model="form.agents">
            <el-checkbox label="market">📈 市场技术分析</el-checkbox>
            <el-checkbox label="fundamental">💰 基本面分析</el-checkbox>
            <el-checkbox label="news">📰 新闻情绪分析</el-checkbox>
            <el-checkbox label="social">💬 社交媒体分析</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            @click="startAnalysis"
            :loading="analyzing"
            :disabled="!canAnalyze"
          >
            🚀 {{ analyzing ? '分析中...' : '开始分析' }}
          </el-button>

          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 进度跟踪 -->
    <progress-tracker
      v-if="analyzing"
      :task-id="currentTaskId"
      :progress="analysisProgress"
    />

    <!-- 结果展示 -->
    <report-viewer
      v-if="analysisResult"
      :result="analysisResult"
      :symbol="form.symbol"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import ProgressTracker from './ProgressTracker.vue'
import ReportViewer from './ReportViewer.vue'

export default {
  name: 'StockAnalyzer',
  components: {
    ProgressTracker,
    ReportViewer
  },
  data() {
    return {
      form: {
        symbol: '',
        market: 'US',
        depth: 3,
        llmProvider: 'dashscope',
        llmModel: 'qwen-plus',
        agents: ['market', 'fundamental', 'news']
      },
      analyzing: false,
      currentTaskId: null,
      analysisProgress: 0,
      analysisResult: null
    }
  },
  computed: {
    ...mapState('financial', ['llmModels']),
    availableModels() {
      return this.llmModels[this.form.llmProvider] || []
    },
    canAnalyze() {
      return this.form.symbol && this.form.agents.length > 0 && !this.analyzing
    }
  },
  methods: {
    ...mapActions('financial', ['createAnalysisTask', 'getTaskStatus']),

    async startAnalysis() {
      if (!this.canAnalyze) return

      this.analyzing = true
      this.analysisProgress = 0
      this.analysisResult = null

      try {
        // 创建分析任务
        this.currentTaskId = await this.createAnalysisTask({
          symbol: this.form.symbol,
          market: this.form.market,
          depth: this.form.depth,
          agents: this.form.agents,
          llmConfig: {
            provider: this.form.llmProvider,
            model: this.form.llmModel
          }
        })

        // 监听进度更新
        this.startProgressMonitoring()

      } catch (error) {
        this.$message.error(`分析失败: ${error.message}`)
        this.analyzing = false
      }
    },

    startProgressMonitoring() {
      const { ipcRenderer } = require('electron')

      ipcRenderer.on('financial-task-progress', (event, data) => {
        if (data.taskId === this.currentTaskId) {
          this.analysisProgress = data.progress

          if (data.status === 'completed') {
            this.onAnalysisComplete(data)
          } else if (data.status === 'failed') {
            this.onAnalysisFailed(data)
          }
        }
      })
    },

    async onAnalysisComplete(data) {
      this.analyzing = false

      // 获取完整结果
      const result = await this.getTaskStatus(this.currentTaskId)
      this.analysisResult = result.result

      this.$message.success('分析完成！')
    },

    onAnalysisFailed(data) {
      this.analyzing = false
      this.$message.error(`分析失败: ${data.error}`)
    },

    onProviderChange() {
      // 切换提供商时，重置模型选择为第一个可用模型
      if (this.availableModels.length > 0) {
        this.form.llmModel = this.availableModels[0].value
      }
    },

    resetForm() {
      this.form = {
        symbol: '',
        market: 'US',
        depth: 3,
        llmProvider: 'dashscope',
        llmModel: 'qwen-plus',
        agents: ['market', 'fundamental', 'news']
      }
      this.analysisResult = null
    }
  }
}
</script>

<style scoped>
.stock-analyzer {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.config-panel {
  margin-bottom: 20px;
}
</style>
```

### 4. Python AI 服务主入口 (api/main.py)

```python
"""
金融决策系统 FastAPI 服务
"""
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import logging

from core.graph.trading_graph import TradingGraph
from data.cache.redis_cache import RedisCache
from data.cache.mongodb_cache import MongoDBCache
from core.utils.config import load_config

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 创建 FastAPI 应用
app = FastAPI(
    title="Financial Decision System API",
    description="基于多智能体的金融决策系统",
    version="1.0.0"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 全局变量
trading_graph = None
redis_cache = None
mongodb_cache = None
config = None


# ============ 数据模型 ============

class AnalysisRequest(BaseModel):
    """分析请求模型"""
    symbol: str
    market: str = "US"  # US, CN, HK
    depth: int = 3  # 1-5
    agents: List[str] = ["market", "fundamental", "news"]
    llm_config: Dict[str, str] = {
        "provider": "dashscope",
        "model": "qwen-plus"
    }
    callback_url: Optional[str] = None


class AnalysisResponse(BaseModel):
    """分析响应模型"""
    task_id: str
    symbol: str
    action: str  # BUY, HOLD, SELL
    confidence: float  # 0-1
    risk_score: float  # 0-1
    target_price: Optional[float]
    reasoning: str
    detailed_analysis: Dict[str, Any]
    generated_at: str


# ============ 生命周期管理 ============

@app.on_event("startup")
async def startup_event():
    """应用启动时初始化"""
    global trading_graph, redis_cache, mongodb_cache, config

    logger.info("🚀 Starting Financial Decision System...")

    # 加载配置
    config = load_config()

    # 初始化缓存
    try:
        redis_cache = RedisCache(
            host=config.get("redis", {}).get("host", "localhost"),
            port=config.get("redis", {}).get("port", 6379)
        )
        logger.info("✅ Redis cache initialized")
    except Exception as e:
        logger.warning(f"⚠️  Redis not available: {e}")

    try:
        mongodb_cache = MongoDBCache(
            host=config.get("mongodb", {}).get("host", "localhost"),
            port=config.get("mongodb", {}).get("port", 27017)
        )
        logger.info("✅ MongoDB cache initialized")
    except Exception as e:
        logger.warning(f"⚠️  MongoDB not available: {e}")

    # 初始化交易图
    trading_graph = TradingGraph(config=config)
    logger.info("✅ Trading graph initialized")

    logger.info("🎉 Financial Decision System ready!")


@app.on_event("shutdown")
async def shutdown_event():
    """应用关闭时清理"""
    logger.info("👋 Shutting down Financial Decision System...")

    if redis_cache:
        await redis_cache.close()
    if mongodb_cache:
        await mongodb_cache.close()


# ============ API 路由 ============

@app.get("/")
async def root():
    """根路径"""
    return {
        "name": "Financial Decision System API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """健康检查"""
    return {
        "status": "healthy",
        "redis": redis_cache is not None and await redis_cache.ping(),
        "mongodb": mongodb_cache is not None and await mongodb_cache.ping()
    }


@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_stock(
    request: AnalysisRequest,
    background_tasks: BackgroundTasks
):
    """
    股票分析接口

    Args:
        request: 分析请求参数

    Returns:
        AnalysisResponse: 分析结果
    """
    try:
        logger.info(f"📊 Analyzing {request.symbol} with depth {request.depth}")

        # 检查缓存
        cache_key = f"{request.symbol}:{request.market}:{request.depth}"
        if redis_cache:
            cached_result = await redis_cache.get(cache_key)
            if cached_result:
                logger.info(f"✅ Cache hit for {request.symbol}")
                return AnalysisResponse(**cached_result)

        # 执行分析
        result = await trading_graph.analyze(
            symbol=request.symbol,
            market=request.market,
            depth=request.depth,
            agents=request.agents,
            llm_config=request.llm_config
        )

        # 缓存结果
        if redis_cache:
            background_tasks.add_task(
                redis_cache.set,
                cache_key,
                result,
                expire=3600  # 1小时过期
            )

        if mongodb_cache:
            background_tasks.add_task(
                mongodb_cache.save_analysis,
                request.symbol,
                result
            )

        logger.info(f"✅ Analysis completed for {request.symbol}")
        return AnalysisResponse(**result)

    except Exception as e:
        logger.error(f"❌ Analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/models")
async def get_available_models():
    """获取可用的 LLM 模型列表"""
    return {
        "dashscope": [
            {"label": "通义千问 Turbo (快速)", "value": "qwen-turbo"},
            {"label": "通义千问 Plus (平衡)", "value": "qwen-plus"},
            {"label": "通义千问 Max (强大)", "value": "qwen-max"}
        ],
        "deepseek": [
            {"label": "DeepSeek Chat (推荐)", "value": "deepseek-chat"}
        ],
        "google": [
            {"label": "Gemini 2.0 Flash (推荐)", "value": "gemini-2.0-flash"},
            {"label": "Gemini 2.5 Pro (最新)", "value": "gemini-2.5-pro"},
            {"label": "Gemini 1.5 Pro (稳定)", "value": "gemini-1.5-pro"}
        ],
        "openai": [
            {"label": "GPT-4o (推荐)", "value": "gpt-4o"},
            {"label": "GPT-4o Mini (经济)", "value": "gpt-4o-mini"}
        ],
        "openrouter": [
            {"label": "Claude 4 Opus", "value": "anthropic/claude-4-opus"},
            {"label": "GPT-4o", "value": "openai/gpt-4o"},
            {"label": "Llama 4 Maverick", "value": "meta-llama/llama-4-maverick"}
        ]
    }


@app.get("/api/history/{symbol}")
async def get_analysis_history(symbol: str, limit: int = 10):
    """
    获取股票的历史分析记录

    Args:
        symbol: 股票代码
        limit: 返回数量限制
    """
    if not mongodb_cache:
        raise HTTPException(status_code=503, detail="MongoDB not available")

    try:
        history = await mongodb_cache.get_history(symbol, limit)
        return {"symbol": symbol, "history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ 启动服务 ============

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
```

## 🚀 实施步骤

### 阶段 1: 基础架构搭建 (Week 1-2)

#### 1.1 创建目录结构
```bash
# 创建前端目录
mkdir -p src/renderer/components/Financial
mkdir -p src/renderer/store/modules
mkdir -p src/main/services/financial

# 创建 Python 服务目录
mkdir -p financial-service/{agents,data,core,api,reports,config,tests}
mkdir -p financial-service/agents/{analysts,researchers,trader,managers}
mkdir -p financial-service/data/{sources,processors,cache}
mkdir -p financial-service/core/{graph,llm,utils}
mkdir -p financial-service/api/{routes,models}
```

#### 1.2 配置开发环境
```bash
# Python 环境
cd financial-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Node.js 依赖
cd ../
yarn add axios vue-router vuex element-ui
```

#### 1.3 创建基础配置文件
```yaml
# financial-service/config/default.yaml
app:
  name: "Financial Decision System"
  version: "1.0.0"
  debug: true

llm:
  default_provider: "dashscope"
  default_model: "qwen-plus"

data:
  sources:
    - finnhub
    - akshare
    - tushare

cache:
  redis:
    enabled: true
    host: "localhost"
    port: 6379
    ttl: 3600
  mongodb:
    enabled: true
    host: "localhost"
    port: 27017
    database: "financial_db"
```

### 阶段 2: 核心智能体开发 (Week 3-4)

#### 2.1 实现基础智能体
- 市场技术分析师 (market_analyst.py)
- 基本面分析师 (fundamental_analyst.py)
- 新闻情绪分析师 (news_analyst.py)

#### 2.2 实现研究员和决策系统
- 看涨/看跌研究员
- 辩论管理器
- 交易决策器

#### 2.3 集成 LangGraph 工作流
- 构建完整的分析流程图
- 实现智能体协作机制

### 阶段 3: 数据层开发 (Week 5-6)

#### 3.1 数据源集成
- 接入多个市场数据 API
- 实现数据标准化处理

#### 3.2 缓存系统
- Redis 快速缓存
- MongoDB 持久化存储

#### 3.3 数据处理管道
- 数据清洗
- 数据验证
- 异常处理

### 阶段 4: API 服务开发 (Week 7-8)

#### 4.1 FastAPI 服务
- 实现核心分析接口
- 添加健康检查
- 配置 CORS

#### 4.2 WebSocket 支持
- 实时进度推送
- 结果流式返回

### 阶段 5: 前端集成 (Week 9-10)

#### 5.1 UI 组件开发
- 股票分析器组件
- 进度跟踪组件
- 报告查看器组件

#### 5.2 Vuex 状态管理
- 任务状态管理
- 配置管理
- 结果缓存

#### 5.3 Electron 集成
- IPC 通信
- Python 服务管理
- 窗口管理

### 阶段 6: 测试与优化 (Week 11-12)

#### 6.1 单元测试
- 智能体测试
- 数据处理测试
- API 测试

#### 6.2 集成测试
- 端到端流程测试
- 性能测试

#### 6.3 优化
- 响应速度优化
- 内存使用优化
- API 调用成本优化

### 阶段 7: 部署与文档 (Week 13-14)

#### 7.1 Docker 容器化
```dockerfile
# financial-service/Dockerfile
FROM python:3.10-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 安装 Python 依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制代码
COPY . .

# 暴露端口
EXPOSE 8000

# 启动服务
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 7.2 Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password

  financial-service:
    build:
      context: ./financial-service
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    depends_on:
      - redis
      - mongodb
    environment:
      REDIS_HOST: redis
      MONGODB_HOST: mongodb
    volumes:
      - ./financial-service:/app

volumes:
  redis_data:
  mongo_data:
```

#### 7.3 编写文档
- API 文档
- 用户手册
- 开发指南
- 部署指南

## 📊 功能特性详解

### 1. 5级研究深度说明

| 级别 | 时间 | 分析内容 | 适用场景 |
|-----|------|---------|---------|
| **1级** | 2-4分钟 | 基础技术指标、简单新闻摘要 | 日常监控、快速决策 |
| **2级** | 4-6分钟 | 技术分析 + 基本面概览 | 常规投资决策 |
| **3级** ⭐ | 6-10分钟 | 完整分析 + 新闻情绪 + 1轮辩论 | 重要投资决策 (推荐) |
| **4级** | 10-15分钟 | 深度分析 + 社交媒体 + 2轮辩论 | 重大投资、持仓调整 |
| **5级** | 15-25分钟 | 最全面分析 + 3轮辩论 + 详细报告 | 核心持仓、大额投资 |

### 2. 多市场支持

#### 美股 (US)
- **数据源**: FinnHub, Yahoo Finance
- **代码格式**: AAPL, TSLA, MSFT
- **特色**: 实时行情、期权数据、机构持仓

#### A股 (CN)
- **数据源**: Tushare, AkShare, 通达信
- **代码格式**: 000001, 600519, 300750
- **特色**: 完整财报、资金流向、龙虎榜

#### 港股 (HK)
- **数据源**: AkShare, Yahoo Finance
- **代码格式**: 0700.HK, 9988.HK
- **特色**: 南向资金、AH股比价

### 3. 智能缓存策略

```
查询流程：
1. 检查 Redis (毫秒级响应)
2. 检查 MongoDB (秒级响应)
3. 调用 API (秒级-分钟级)
4. 存入缓存供下次使用

缓存策略：
- Redis: 热点数据，1小时TTL
- MongoDB: 历史数据，永久存储
- 自动更新: 交易时间每15分钟更新
```

### 4. 成本优化

```python
# 成本控制配置
cost_config = {
    # 使用经济型模型
    "quick_think_llm": "qwen-turbo",  # ¥0.002/1K tokens
    "deep_think_llm": "qwen-plus",    # ¥0.008/1K tokens

    # 启用智能缓存
    "enable_cache": True,
    "cache_ttl": 3600,

    # 减少辩论轮次
    "max_debate_rounds": 1,

    # 优先使用缓存数据
    "prefer_cached_data": True
}

# 预估成本 (Level 3 分析)
# - API调用: ~10次 × ¥0.008 = ¥0.08
# - 数据获取: 大部分使用缓存 ≈ ¥0
# - 总成本: < ¥0.10/次
```

## 🔒 安全性考虑

### 1. API 密钥管理
```javascript
// 使用 Electron Store 安全存储
const Store = require('electron-store')
const store = new Store({
  encryptionKey: 'your-encryption-key',
  name: 'financial-config'
})

// 存储 API 密钥
store.set('api.dashscope', process.env.DASHSCOPE_API_KEY)
```

### 2. 数据加密
- 敏感配置使用 AES 加密
- API 通信使用 HTTPS
- 本地数据库加密存储

### 3. 权限控制
- 用户认证系统
- API 访问频率限制
- 资源使用配额

## 📈 性能指标

### 目标性能
- **响应时间**:
  - Level 1: < 3分钟
  - Level 3: < 8分钟
  - Level 5: < 20分钟
- **并发支持**: 10+ 并发分析任务
- **缓存命中率**: > 60%
- **API 成本**: < ¥0.15/次分析

### 监控指标
```python
# 性能监控
metrics = {
    "analysis_duration": 0,      # 分析耗时
    "api_calls": 0,              # API调用次数
    "cache_hits": 0,             # 缓存命中
    "error_rate": 0,             # 错误率
    "cost_per_analysis": 0       # 单次成本
}
```

## 🎓 学习资源

### TradingAgents 相关
- [TradingAgents 论文](https://arxiv.org/abs/xxx) (中文翻译版)
- [LangGraph 官方文档](https://langchain-ai.github.io/langgraph/)
- [多智能体系统设计](https://www.anthropic.com/multi-agent)

### 金融数据
- [Tushare 文档](https://tushare.pro/document/2)
- [AkShare 文档](https://akshare.akfamily.xyz/)
- [FinnHub API](https://finnhub.io/docs/api)

### AI 模型
- [阿里百炼文档](https://help.aliyun.com/zh/dashscope/)
- [DeepSeek API](https://platform.deepseek.com/docs)
- [Google AI Studio](https://ai.google.dev/)

## 🤝 贡献指南

欢迎贡献代码、文档、建议！

### 贡献流程
1. Fork 项目
2. 创建特性分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 创建 Pull Request

### 开发规范
- 遵循 ESLint 代码规范
- 编写单元测试
- 更新相关文档
- 提交前运行测试

## 📞 联系方式

- **GitHub Issues**: [提交问题](https://github.com/agalwood/Motrix/issues)
- **Email**: agalwood.net@gmail.com

## 📄 许可证

本设计方案遵循 MIT 许可证。

---

## 📋 附录

### A. 依赖包清单

#### Python (requirements.txt)
```txt
# Web框架
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0

# AI框架
langchain==0.1.0
langgraph==0.0.20
openai==1.3.5

# 数据处理
pandas==2.1.3
numpy==1.26.2
python-dateutil==2.8.2

# 数据源
tushare==1.3.9
akshare==1.11.70
yfinance==0.2.32

# 数据库
redis==5.0.1
pymongo==4.6.0
motor==3.3.2

# 工具
pyyaml==6.0.1
python-dotenv==1.0.0
requests==2.31.0
aiohttp==3.9.1

# 报告生成
jinja2==3.1.2
markdown==3.5.1
pypandoc==1.12
python-docx==1.1.0

# 测试
pytest==7.4.3
pytest-asyncio==0.21.1
httpx==0.25.2
```

#### Node.js (package.json additions)
```json
{
  "dependencies": {
    "axios": "^1.6.2",
    "element-ui": "^2.15.14",
    "echarts": "^5.4.3",
    "moment": "^2.29.4"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "eslint": "^8.54.0"
  }
}
```

### B. 环境变量配置

```.env
# ============ LLM API Keys ============
# 阿里百炼
DASHSCOPE_API_KEY=your_dashscope_key

# DeepSeek
DEEPSEEK_API_KEY=your_deepseek_key

# Google AI
GOOGLE_API_KEY=your_google_key

# OpenAI
OPENAI_API_KEY=your_openai_key

# OpenRouter
OPENROUTER_API_KEY=your_openrouter_key

# ============ 数据源 API Keys ============
# FinnHub
FINNHUB_API_KEY=your_finnhub_key

# Tushare
TUSHARE_TOKEN=your_tushare_token

# ============ 数据库配置 ============
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# MongoDB
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_USERNAME=admin
MONGODB_PASSWORD=password
MONGODB_DATABASE=financial_db

# ============ 应用配置 ============
# 调试模式
DEBUG=true

# 日志级别
LOG_LEVEL=INFO

# API服务端口
API_PORT=8000

# 缓存配置
CACHE_ENABLED=true
CACHE_TTL=3600
```

### C. 快速启动脚本

#### Windows (start_services.bat)
```batch
@echo off
echo Starting Financial Decision System...

REM 启动 Redis
start "Redis" redis-server

REM 启动 MongoDB
start "MongoDB" mongod --dbpath ./data/mongodb

REM 启动 Python 服务
cd financial-service
call venv\Scripts\activate
start "Python Service" python -m uvicorn api.main:app --reload

REM 启动 Electron 应用
cd ..
yarn run dev

echo All services started!
pause
```

#### Linux/macOS (start_services.sh)
```bash
#!/bin/bash

echo "Starting Financial Decision System..."

# 启动 Redis
redis-server --daemonize yes

# 启动 MongoDB
mongod --fork --logpath ./logs/mongodb.log --dbpath ./data/mongodb

# 启动 Python 服务
cd financial-service
source venv/bin/activate
nohup python -m uvicorn api.main:app --reload > ../logs/python-service.log 2>&1 &

# 启动 Electron 应用
cd ..
yarn run dev

echo "All services started!"
```

---

**文档版本**: v1.0.0
**最后更新**: 2025-01-12
**作者**: Claude & Motrix Team
