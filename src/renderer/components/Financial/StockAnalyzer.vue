<template>
  <div class="stock-analyzer">
    <!-- 标题 -->
    <div class="header">
      <h2>💰 金融决策系统</h2>
      <p class="subtitle">基于多智能体 AI 的股票分析</p>
    </div>

    <!-- 配置面板 -->
    <el-card class="config-panel">
      <div slot="header" class="card-header">
        <span>📊 分析配置</span>
      </div>

      <el-form ref="form" :model="form" label-width="120px">
        <!-- 股票代码 -->
        <el-form-item label="股票代码">
          <el-input
            v-model="form.symbol"
            placeholder="输入股票代码，如: AAPL, 000001, 0700.HK"
            :disabled="analyzing"
            @keyup.enter.native="startAnalysis"
          >
            <el-select
              slot="prepend"
              v-model="form.market"
              style="width: 100px"
              :disabled="analyzing"
            >
              <el-option label="美股" value="US" />
              <el-option label="A股" value="CN" />
              <el-option label="港股" value="HK" />
            </el-select>
          </el-input>
        </el-form-item>

        <!-- 分析深度 -->
        <el-form-item label="研究深度">
          <el-radio-group v-model="form.depth" :disabled="analyzing">
            <el-radio :label="1">快速分析 (2-4分钟)</el-radio>
            <el-radio :label="3">标准分析 (6-10分钟) ⭐</el-radio>
            <el-radio :label="5">深度分析 (15-25分钟)</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- LLM 模型 -->
        <el-form-item label="AI 模型">
          <el-select
            v-model="form.llmProvider"
            placeholder="选择提供商"
            style="width: 200px; margin-right: 10px"
            :disabled="analyzing"
          >
            <el-option label="阿里百炼 (推荐)" value="dashscope" />
            <el-option label="DeepSeek" value="deepseek" />
            <el-option label="OpenAI" value="openai" />
          </el-select>

          <el-select
            v-model="form.llmModel"
            placeholder="选择模型"
            style="width: 200px"
            :disabled="analyzing"
          >
            <el-option
              v-for="model in availableModels"
              :key="model.value"
              :label="model.label"
              :value="model.value"
            />
          </el-select>
        </el-form-item>

        <!-- 分析师选择 -->
        <el-form-item label="分析师">
          <el-checkbox-group v-model="form.agents" :disabled="analyzing">
            <el-checkbox label="market">📈 市场技术分析</el-checkbox>
            <el-checkbox label="fundamental">💰 基本面分析</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            :loading="analyzing"
            :disabled="!canAnalyze"
            @click="startAnalysis"
          >
            {{ analyzing ? '分析中...' : '🚀 开始分析' }}
          </el-button>

          <el-button @click="resetForm" :disabled="analyzing">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 进度显示 -->
    <el-card v-if="analyzing" class="progress-panel">
      <div slot="header">⏳ 分析进度</div>
      <el-progress
        :percentage="progress"
        :status="progressStatus"
        :stroke-width="20"
      />
      <p class="progress-text">{{ progressText }}</p>
    </el-card>

    <!-- 结果展示 -->
    <el-card v-if="result" class="result-panel">
      <div slot="header" class="card-header">
        <span>📊 分析结果</span>
        <el-button
          type="text"
          size="small"
          @click="copyResult"
        >
          📋 复制
        </el-button>
      </div>

      <!-- 决策摘要 -->
      <div class="decision-summary">
        <div class="decision-item">
          <span class="label">投资建议:</span>
          <el-tag
            :type="actionTagType"
            size="large"
            effect="dark"
          >
            {{ result.action }}
          </el-tag>
        </div>

        <div class="decision-item">
          <span class="label">置信度:</span>
          <el-progress
            :percentage="result.confidence * 100"
            :color="confidenceColor"
            :stroke-width="20"
            :show-text="true"
          />
        </div>

        <div class="decision-item">
          <span class="label">风险评分:</span>
          <el-progress
            :percentage="result.risk_score * 100"
            :color="riskColor"
            :stroke-width="20"
          />
        </div>

        <div class="decision-item" v-if="result.target_price">
          <span class="label">目标价位:</span>
          <span class="value">${{ result.target_price.toFixed(2) }}</span>
        </div>
      </div>

      <!-- 详细分析 -->
      <el-divider>详细分析</el-divider>

      <div class="reasoning">
        <h4>决策理由:</h4>
        <p>{{ result.reasoning }}</p>
      </div>

      <!-- 分析师报告 -->
      <div v-if="result.detailed_analysis" class="analyst-reports">
        <el-collapse accordion>
          <el-collapse-item
            v-for="(report, index) in analystReports"
            :key="index"
            :title="`${report.agent} - ${report.rating}`"
          >
            <div class="report-content">{{ report.analysis }}</div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!-- 股票信息 -->
      <el-divider>股票信息</el-divider>
      <div class="stock-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="股票代码">
            {{ result.symbol }}
          </el-descriptions-item>
          <el-descriptions-item label="市场">
            {{ marketName(result.market) }}
          </el-descriptions-item>
          <el-descriptions-item label="分析时间">
            {{ formatTime(result.timestamp) }}
          </el-descriptions-item>
          <el-descriptions-item label="AI 模型">
            {{ result.detailed_analysis.llm_config.provider }} /
            {{ result.detailed_analysis.llm_config.model }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>
  </div>
</template>

<script>
const { ipcRenderer } = require('electron')

export default {
  name: 'StockAnalyzer',
  data() {
    return {
      form: {
        symbol: '',
        market: 'US',
        depth: 3,
        llmProvider: 'dashscope',
        llmModel: 'qwen-plus',
        agents: ['market', 'fundamental']
      },
      analyzing: false,
      progress: 0,
      progressText: '准备开始分析...',
      progressStatus: null,
      result: null,
      models: {
        dashscope: [
          { label: '通义千问 Turbo (快速)', value: 'qwen-turbo' },
          { label: '通义千问 Plus (平衡)', value: 'qwen-plus' },
          { label: '通义千问 Max (强大)', value: 'qwen-max' }
        ],
        deepseek: [
          { label: 'DeepSeek Chat (推荐)', value: 'deepseek-chat' }
        ],
        openai: [
          { label: 'GPT-4o (推荐)', value: 'gpt-4o' },
          { label: 'GPT-4o Mini (经济)', value: 'gpt-4o-mini' }
        ]
      }
    }
  },
  computed: {
    availableModels() {
      return this.models[this.form.llmProvider] || []
    },
    canAnalyze() {
      return this.form.symbol && this.form.agents.length > 0 && !this.analyzing
    },
    actionTagType() {
      const action = this.result?.action
      if (action === 'BUY') return 'success'
      if (action === 'SELL') return 'danger'
      return 'info'
    },
    confidenceColor() {
      const conf = this.result?.confidence || 0
      if (conf > 0.7) return '#67C23A'
      if (conf > 0.5) return '#E6A23C'
      return '#F56C6C'
    },
    riskColor() {
      const risk = this.result?.risk_score || 0
      if (risk > 0.7) return '#F56C6C'
      if (risk > 0.4) return '#E6A23C'
      return '#67C23A'
    },
    analystReports() {
      return this.result?.detailed_analysis?.analyst_reports || []
    }
  },
  mounted() {
    // 监听分析进度
    ipcRenderer.on('financial-analysis-progress', (event, data) => {
      this.progress = data.progress
      this.progressText = data.message
      this.progressStatus = data.status
    })

    // 监听分析完成
    ipcRenderer.on('financial-analysis-complete', (event, data) => {
      this.analyzing = false
      this.progress = 100
      this.progressStatus = 'success'
      this.progressText = '分析完成！'
      this.result = data
    })

    // 监听分析失败
    ipcRenderer.on('financial-analysis-error', (event, error) => {
      this.analyzing = false
      this.progressStatus = 'exception'
      this.progressText = '分析失败'
      this.$message.error(error.message || '分析失败，请重试')
    })
  },
  beforeDestroy() {
    ipcRenderer.removeAllListeners('financial-analysis-progress')
    ipcRenderer.removeAllListeners('financial-analysis-complete')
    ipcRenderer.removeAllListeners('financial-analysis-error')
  },
  methods: {
    async startAnalysis() {
      if (!this.canAnalyze) return

      this.analyzing = true
      this.progress = 0
      this.progressText = '正在启动分析...'
      this.progressStatus = null
      this.result = null

      try {
        // 发送分析请求
        ipcRenderer.send('financial-analyze-stock', {
          symbol: this.form.symbol,
          market: this.form.market,
          depth: this.form.depth,
          agents: this.form.agents,
          llm_config: {
            provider: this.form.llmProvider,
            model: this.form.llmModel
          }
        })
      } catch (error) {
        this.analyzing = false
        this.$message.error(`分析失败: ${error.message}`)
      }
    },
    resetForm() {
      this.form = {
        symbol: '',
        market: 'US',
        depth: 3,
        llmProvider: 'dashscope',
        llmModel: 'qwen-plus',
        agents: ['market', 'fundamental']
      }
      this.result = null
      this.progress = 0
    },
    copyResult() {
      if (!this.result) return

      const text = `
股票: ${this.result.symbol}
投资建议: ${this.result.action}
置信度: ${(this.result.confidence * 100).toFixed(1)}%
风险评分: ${(this.result.risk_score * 100).toFixed(1)}%
目标价位: $${this.result.target_price?.toFixed(2) || 'N/A'}

决策理由:
${this.result.reasoning}
      `.trim()

      navigator.clipboard.writeText(text).then(() => {
        this.$message.success('已复制到剪贴板')
      })
    },
    marketName(market) {
      const map = { US: '美股', CN: 'A股', HK: '港股' }
      return map[market] || market
    },
    formatTime(timestamp) {
      return new Date(timestamp).toLocaleString('zh-CN')
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

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h2 {
  margin: 0;
  font-size: 28px;
  color: #303133;
}

.subtitle {
  color: #909399;
  margin-top: 8px;
}

.config-panel,
.progress-panel,
.result-panel {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-panel {
  background: #f5f7fa;
}

.progress-text {
  text-align: center;
  margin-top: 15px;
  color: #606266;
  font-size: 14px;
}

.decision-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.decision-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.decision-item .label {
  font-weight: bold;
  color: #606266;
  font-size: 14px;
}

.decision-item .value {
  font-size: 20px;
  font-weight: bold;
  color: #409EFF;
}

.reasoning {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin: 20px 0;
}

.reasoning h4 {
  margin-top: 0;
  color: #303133;
}

.reasoning p {
  margin: 10px 0 0 0;
  line-height: 1.6;
  color: #606266;
}

.analyst-reports {
  margin: 20px 0;
}

.report-content {
  white-space: pre-wrap;
  line-height: 1.6;
  color: #606266;
  padding: 10px;
}

.stock-info {
  margin-top: 20px;
}
</style>
