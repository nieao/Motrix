const BaseReporter = require('./BaseReporter')

/**
 * ConsoleReporter - 控制台输出报告器
 * 将监控数据输出到控制台，支持颜色标记
 */
class ConsoleReporter extends BaseReporter {
  constructor(config = {}) {
    super(config)
    this.colors = config.colors !== false
    this.verbose = config.verbose || false
  }

  async init() {
    console.log('[ConsoleReporter] Initialized')
  }

  /**
   * 报告数据
   */
  async report(data) {
    if (!this.enabled) {
      return
    }

    const timestamp = this.formatTimestamp(new Date(data.timestamp))

    switch (data.type) {
      case 'error':
        this.logError(timestamp, data)
        break
      case 'metrics':
        this.logMetrics(timestamp, data)
        break
      case 'log':
        this.logMessage(timestamp, data)
        break
      default:
        this.logDefault(timestamp, data)
    }
  }

  /**
   * 输出错误日志
   */
  logError(timestamp, data) {
    const prefix = this.colorize('[ERROR]', '\x1b[31m') // 红色
    console.error(`${prefix} [${timestamp}] ${data.error.message}`)

    if (this.verbose && data.error.stack) {
      console.error(data.error.stack)
    }

    if (this.verbose && data.context && Object.keys(data.context).length > 0) {
      console.error('Context:', this.formatData(data.context))
    }
  }

  /**
   * 输出性能指标
   */
  logMetrics(timestamp, data) {
    const prefix = this.colorize('[METRICS]', '\x1b[36m') // 青色
    console.log(`${prefix} [${timestamp}]`)

    if (data.metrics) {
      Object.entries(data.metrics).forEach(([key, value]) => {
        console.log(`  ${key}: ${this.formatMetricValue(value)}`)
      })
    }
  }

  /**
   * 输出日志消息
   */
  logMessage(timestamp, data) {
    let prefix
    let method = console.log

    switch (data.level) {
      case 'error':
        prefix = this.colorize('[ERROR]', '\x1b[31m')
        method = console.error
        break
      case 'warn':
        prefix = this.colorize('[WARN]', '\x1b[33m') // 黄色
        method = console.warn
        break
      case 'debug':
        prefix = this.colorize('[DEBUG]', '\x1b[90m') // 灰色
        if (!this.verbose) return
        break
      case 'info':
      default:
        prefix = this.colorize('[INFO]', '\x1b[32m') // 绿色
    }

    method(`${prefix} [${timestamp}] ${data.message}`)

    if (this.verbose && data.meta && Object.keys(data.meta).length > 0) {
      method('Meta:', this.formatData(data.meta))
    }
  }

  /**
   * 输出默认数据
   */
  logDefault(timestamp, data) {
    const prefix = this.colorize('[DATA]', '\x1b[34m') // 蓝色
    console.log(`${prefix} [${timestamp}]`)
    console.log(this.formatData(data))
  }

  /**
   * 为文本添加颜色
   */
  colorize(text, colorCode) {
    if (!this.colors) {
      return text
    }
    return `${colorCode}${text}\x1b[0m`
  }

  /**
   * 格式化指标值
   */
  formatMetricValue(value) {
    if (typeof value === 'number') {
      // 如果是时间相关的指标（毫秒），格式化为可读形式
      if (value > 1000) {
        return `${(value / 1000).toFixed(2)}s`
      }
      return `${value.toFixed(2)}ms`
    }
    return value
  }

  async close() {
    console.log('[ConsoleReporter] Closed')
  }
}

module.exports = ConsoleReporter
