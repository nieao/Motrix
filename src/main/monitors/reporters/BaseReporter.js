/**
 * BaseReporter - 基础报告器抽象类
 * 所有报告器都需要继承此类并实现相应方法
 */
class BaseReporter {
  constructor(config = {}) {
    this.config = config
    this.enabled = config.enabled !== false
  }

  /**
   * 初始化报告器
   */
  async init() {
    throw new Error('init() must be implemented by subclass')
  }

  /**
   * 报告信息
   * @param {Object} data - 监控数据
   */
  async report(data) {
    if (!this.enabled) {
      return
    }
    throw new Error('report() must be implemented by subclass')
  }

  /**
   * 报告错误
   * @param {Error} error - 错误对象
   * @param {Object} context - 错误上下文
   */
  async reportError(error, context = {}) {
    if (!this.enabled) {
      return
    }
    await this.report({
      type: 'error',
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      context
    })
  }

  /**
   * 报告性能指标
   * @param {Object} metrics - 性能指标
   */
  async reportMetrics(metrics) {
    if (!this.enabled) {
      return
    }
    await this.report({
      type: 'metrics',
      timestamp: new Date().toISOString(),
      metrics
    })
  }

  /**
   * 报告日志
   * @param {String} level - 日志级别 (info, warn, error, debug)
   * @param {String} message - 日志消息
   * @param {Object} meta - 元数据
   */
  async reportLog(level, message, meta = {}) {
    if (!this.enabled) {
      return
    }
    await this.report({
      type: 'log',
      level,
      timestamp: new Date().toISOString(),
      message,
      meta
    })
  }

  /**
   * 关闭报告器
   */
  async close() {
    // 子类可选实现
  }

  /**
   * 格式化时间戳
   * @param {Date} date
   * @returns {String}
   */
  formatTimestamp(date = new Date()) {
    return date.toISOString().replace('T', ' ').substring(0, 19)
  }

  /**
   * 格式化数据为可读字符串
   * @param {Object} data
   * @returns {String}
   */
  formatData(data) {
    try {
      return JSON.stringify(data, null, 2)
    } catch (e) {
      return String(data)
    }
  }
}

module.exports = BaseReporter
