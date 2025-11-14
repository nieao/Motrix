const BaseReporter = require('./BaseReporter')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const writeFile = promisify(fs.writeFile)
const mkdir = promisify(fs.mkdir)
const access = promisify(fs.access)

/**
 * HtmlReporter - HTML报告生成器
 * 生成美观的HTML格式监控报告
 */
class HtmlReporter extends BaseReporter {
  constructor(config = {}) {
    super(config)
    this.reportDir = config.reportDir || path.join(process.cwd(), 'reports')
    this.reportFileName = config.reportFileName || 'monitor-report.html'
    this.data = []
    this.maxEntries = config.maxEntries || 1000
    this.autoSaveInterval = config.autoSaveInterval || 30000 // 30秒
    this.timer = null
  }

  async init() {
    // 确保报告目录存在
    try {
      await access(this.reportDir)
    } catch (error) {
      await mkdir(this.reportDir, { recursive: true })
    }

    this.reportFilePath = path.join(this.reportDir, this.reportFileName)

    // 定期自动保存报告
    this.timer = setInterval(() => {
      this.generateReport().catch(err => {
        console.error('[HtmlReporter] Auto-save failed:', err.message)
      })
    }, this.autoSaveInterval)

    console.log(`[HtmlReporter] Initialized, reports will be saved to: ${this.reportFilePath}`)
  }

  /**
   * 报告数据
   */
  async report(data) {
    if (!this.enabled) {
      return
    }

    // 添加数据到缓存
    this.data.push(data)

    // 限制数据量
    if (this.data.length > this.maxEntries) {
      this.data = this.data.slice(-this.maxEntries)
    }
  }

  /**
   * 生成HTML报告
   */
  async generateReport() {
    const html = this.generateHtml()
    await writeFile(this.reportFilePath, html, 'utf8')
  }

  /**
   * 生成HTML内容
   */
  generateHtml() {
    const errors = this.data.filter(d => d.type === 'error')
    const metrics = this.data.filter(d => d.type === 'metrics')
    const logs = this.data.filter(d => d.type === 'log')

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>监控报告 - ${new Date().toLocaleString()}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f5f5f5;
            padding: 20px;
            line-height: 1.6;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header h1 { font-size: 28px; margin-bottom: 10px; }
        .header p { opacity: 0.9; font-size: 14px; }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stat-card h3 { font-size: 14px; color: #666; margin-bottom: 10px; }
        .stat-card .value { font-size: 32px; font-weight: bold; color: #333; }
        .stat-card.errors .value { color: #e74c3c; }
        .stat-card.metrics .value { color: #3498db; }
        .stat-card.logs .value { color: #2ecc71; }
        .section {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .section h2 {
            font-size: 20px;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #f0f0f0;
        }
        .entry {
            padding: 12px;
            margin-bottom: 10px;
            border-left: 4px solid #ddd;
            background: #f9f9f9;
            border-radius: 4px;
        }
        .entry.error { border-left-color: #e74c3c; background: #fef5f5; }
        .entry.warn { border-left-color: #f39c12; background: #fef9f3; }
        .entry.info { border-left-color: #3498db; background: #f3f8fc; }
        .entry .timestamp {
            font-size: 12px;
            color: #999;
            margin-bottom: 5px;
        }
        .entry .message {
            color: #333;
            word-wrap: break-word;
        }
        .entry .stack {
            margin-top: 10px;
            padding: 10px;
            background: #f5f5f5;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            white-space: pre-wrap;
            overflow-x: auto;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 10px;
        }
        .metric-item {
            padding: 10px;
            background: #f9f9f9;
            border-radius: 4px;
        }
        .metric-item .name { font-size: 12px; color: #666; }
        .metric-item .value { font-size: 18px; font-weight: bold; color: #333; }
        .footer {
            text-align: center;
            padding: 20px;
            color: #999;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 系统监控报告</h1>
            <p>生成时间: ${new Date().toLocaleString()}</p>
            <p>总条目数: ${this.data.length}</p>
        </div>

        <div class="stats">
            <div class="stat-card errors">
                <h3>错误数量</h3>
                <div class="value">${errors.length}</div>
            </div>
            <div class="stat-card metrics">
                <h3>性能指标</h3>
                <div class="value">${metrics.length}</div>
            </div>
            <div class="stat-card logs">
                <h3>日志条目</h3>
                <div class="value">${logs.length}</div>
            </div>
            <div class="stat-card">
                <h3>总计</h3>
                <div class="value">${this.data.length}</div>
            </div>
        </div>

        ${errors.length > 0 ? this.generateErrorSection(errors) : ''}
        ${metrics.length > 0 ? this.generateMetricsSection(metrics) : ''}
        ${logs.length > 0 ? this.generateLogsSection(logs) : ''}

        <div class="footer">
            <p>Motrix 多重监控系统 © ${new Date().getFullYear()}</p>
        </div>
    </div>
</body>
</html>`
  }

  /**
   * 生成错误部分
   */
  generateErrorSection(errors) {
    const recentErrors = errors.slice(-20).reverse()
    return `
        <div class="section">
            <h2>🔴 错误报告 (最近20条)</h2>
            ${recentErrors.map(e => `
                <div class="entry error">
                    <div class="timestamp">${this.formatTimestamp(new Date(e.timestamp))}</div>
                    <div class="message"><strong>${this.escapeHtml(e.error.message)}</strong></div>
                    ${e.error.stack ? `<div class="stack">${this.escapeHtml(e.error.stack)}</div>` : ''}
                </div>
            `).join('')}
        </div>
    `
  }

  /**
   * 生成性能指标部分
   */
  generateMetricsSection(metrics) {
    const latestMetrics = metrics[metrics.length - 1]
    if (!latestMetrics || !latestMetrics.metrics) {
      return ''
    }

    return `
        <div class="section">
            <h2>📈 最新性能指标</h2>
            <div class="metrics-grid">
                ${Object.entries(latestMetrics.metrics).map(([key, value]) => `
                    <div class="metric-item">
                        <div class="name">${this.escapeHtml(key)}</div>
                        <div class="value">${this.escapeHtml(String(value))}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `
  }

  /**
   * 生成日志部分
   */
  generateLogsSection(logs) {
    const recentLogs = logs.slice(-50).reverse()
    return `
        <div class="section">
            <h2>📝 日志记录 (最近50条)</h2>
            ${recentLogs.map(l => `
                <div class="entry ${l.level || 'info'}">
                    <div class="timestamp">${this.formatTimestamp(new Date(l.timestamp))}</div>
                    <div class="message">${this.escapeHtml(l.message)}</div>
                </div>
            `).join('')}
        </div>
    `
  }

  /**
   * 转义HTML特殊字符
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }
    return String(text).replace(/[&<>"']/g, m => map[m])
  }

  async close() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }

    // 保存最终报告
    await this.generateReport()
    console.log('[HtmlReporter] Closed and final report saved')
  }
}

module.exports = HtmlReporter
