const EventEmitter = require('events')
const PythonMonitor = require('./PythonMonitor')
const BrowserMonitor = require('./BrowserMonitor')
const {
  ConsoleReporter,
  FileReporter,
  HtmlReporter,
  NotificationReporter
} = require('./reporters')

/**
 * MonitorController - 监控系统主控制器
 * 协调所有监控器和报告器
 */
class MonitorController extends EventEmitter {
  constructor(config = {}) {
    super()
    this.config = config
    this.monitors = new Map()
    this.reporters = []
    this.isRunning = false
    this.metricsInterval = null
  }

  /**
   * 初始化控制器
   */
  async init() {
    console.log('[MonitorController] Initializing...')

    // 初始化报告器
    await this.initReporters()

    // 初始化监控器
    await this.initMonitors()

    console.log('[MonitorController] Initialized')
    this.emit('initialized')
  }

  /**
   * 初始化报告器
   */
  async initReporters() {
    const reporterConfigs = this.config.reporters || {}

    // Console Reporter - 默认启用
    if (reporterConfigs.console !== false) {
      const consoleReporter = new ConsoleReporter(reporterConfigs.console || {})
      await consoleReporter.init()
      this.reporters.push(consoleReporter)
    }

    // File Reporter
    if (reporterConfigs.file !== false) {
      const fileReporter = new FileReporter(reporterConfigs.file || {})
      await fileReporter.init()
      this.reporters.push(fileReporter)
    }

    // HTML Reporter
    if (reporterConfigs.html !== false) {
      const htmlReporter = new HtmlReporter(reporterConfigs.html || {})
      await htmlReporter.init()
      this.reporters.push(htmlReporter)
    }

    // Notification Reporter
    if (reporterConfigs.notification) {
      const notificationReporter = new NotificationReporter(reporterConfigs.notification)
      await notificationReporter.init()
      this.reporters.push(notificationReporter)
    }

    console.log(`[MonitorController] Initialized ${this.reporters.length} reporter(s)`)
  }

  /**
   * 初始化监控器
   */
  async initMonitors() {
    const monitorConfigs = this.config.monitors || {}

    // Python 监控器
    if (monitorConfigs.python && Array.isArray(monitorConfigs.python)) {
      for (const pythonConfig of monitorConfigs.python) {
        await this.addPythonMonitor(pythonConfig.name || 'python', pythonConfig)
      }
    }

    // 浏览器监控器
    if (monitorConfigs.browser && Array.isArray(monitorConfigs.browser)) {
      for (const browserConfig of monitorConfigs.browser) {
        await this.addBrowserMonitor(browserConfig.name || 'browser', browserConfig)
      }
    }

    console.log(`[MonitorController] Initialized ${this.monitors.size} monitor(s)`)
  }

  /**
   * 添加 Python 监控器
   */
  async addPythonMonitor(name, config) {
    const monitor = new PythonMonitor(config)
    this.setupMonitorListeners(name, monitor)
    this.monitors.set(name, monitor)
    console.log(`[MonitorController] Added Python monitor: ${name}`)
    return monitor
  }

  /**
   * 添加浏览器监控器
   */
  async addBrowserMonitor(name, config) {
    const monitor = new BrowserMonitor(config)
    this.setupMonitorListeners(name, monitor)
    this.monitors.set(name, monitor)
    console.log(`[MonitorController] Added Browser monitor: ${name}`)
    return monitor
  }

  /**
   * 设置监控器事件监听
   */
  setupMonitorListeners(name, monitor) {
    // 监听日志
    monitor.on('log', (level, message, meta = {}) => {
      this.handleLog(name, level, message, meta)
    })

    // 监听错误
    monitor.on('error', (error, context = {}) => {
      this.handleError(name, error, context)
    })

    // 监听性能指标
    monitor.on('metrics', (metrics) => {
      this.handleMetrics(name, metrics)
    })

    // 监听启动
    monitor.on('started', (data) => {
      this.handleLog(name, 'info', `Monitor started`, data)
    })

    // 监听停止
    monitor.on('stopped', () => {
      this.handleLog(name, 'info', `Monitor stopped`)
    })

    // 监听退出
    monitor.on('exited', (data) => {
      this.handleLog(name, 'info', `Monitor exited`, data)
    })
  }

  /**
   * 处理日志
   */
  async handleLog(source, level, message, meta = {}) {
    const enrichedMeta = { ...meta, source }

    await Promise.all(
      this.reporters.map(reporter =>
        reporter.reportLog(level, message, enrichedMeta).catch(err =>
          console.error(`[MonitorController] Reporter error:`, err)
        )
      )
    )
  }

  /**
   * 处理错误
   */
  async handleError(source, error, context = {}) {
    const enrichedContext = { ...context, source }

    await Promise.all(
      this.reporters.map(reporter =>
        reporter.reportError(error, enrichedContext).catch(err =>
          console.error(`[MonitorController] Reporter error:`, err)
        )
      )
    )

    this.emit('error', { source, error, context: enrichedContext })
  }

  /**
   * 处理性能指标
   */
  async handleMetrics(source, metrics) {
    const enrichedMetrics = { ...metrics, source }

    await Promise.all(
      this.reporters.map(reporter =>
        reporter.reportMetrics(enrichedMetrics).catch(err =>
          console.error(`[MonitorController] Reporter error:`, err)
        )
      )
    )

    this.emit('metrics', { source, metrics })
  }

  /**
   * 启动所有监控器
   */
  async start() {
    if (this.isRunning) {
      console.warn('[MonitorController] Already running')
      return
    }

    console.log('[MonitorController] Starting all monitors...')
    this.isRunning = true

    const startPromises = Array.from(this.monitors.entries()).map(
      async ([name, monitor]) => {
        try {
          await monitor.start()
          console.log(`[MonitorController] Started monitor: ${name}`)
        } catch (error) {
          console.error(`[MonitorController] Failed to start monitor ${name}:`, error)
          await this.handleError(name, error, { phase: 'start' })
        }
      }
    )

    await Promise.all(startPromises)

    // 定期收集所有监控器的指标
    this.metricsInterval = setInterval(async () => {
      await this.collectAllMetrics()
    }, this.config.metricsInterval || 10000)

    console.log('[MonitorController] All monitors started')
    this.emit('started')
  }

  /**
   * 收集所有监控器的指标
   */
  async collectAllMetrics() {
    for (const [name, monitor] of this.monitors.entries()) {
      try {
        if (typeof monitor.getMetrics === 'function') {
          const metrics = await monitor.getMetrics()
          await this.handleMetrics(name, metrics)
        }
      } catch (error) {
        console.error(`[MonitorController] Failed to collect metrics from ${name}:`, error)
      }
    }
  }

  /**
   * 停止所有监控器
   */
  async stop() {
    if (!this.isRunning) {
      return
    }

    console.log('[MonitorController] Stopping all monitors...')
    this.isRunning = false

    if (this.metricsInterval) {
      clearInterval(this.metricsInterval)
      this.metricsInterval = null
    }

    const stopPromises = Array.from(this.monitors.entries()).map(
      async ([name, monitor]) => {
        try {
          await monitor.stop()
          console.log(`[MonitorController] Stopped monitor: ${name}`)
        } catch (error) {
          console.error(`[MonitorController] Failed to stop monitor ${name}:`, error)
        }
      }
    )

    await Promise.all(stopPromises)

    // 关闭所有报告器
    const closePromises = this.reporters.map(async (reporter) => {
      try {
        await reporter.close()
      } catch (error) {
        console.error('[MonitorController] Failed to close reporter:', error)
      }
    })

    await Promise.all(closePromises)

    console.log('[MonitorController] All monitors stopped')
    this.emit('stopped')
  }

  /**
   * 获取监控器
   */
  getMonitor(name) {
    return this.monitors.get(name)
  }

  /**
   * 获取所有监控器名称
   */
  getMonitorNames() {
    return Array.from(this.monitors.keys())
  }

  /**
   * 移除监控器
   */
  async removeMonitor(name) {
    const monitor = this.monitors.get(name)
    if (monitor) {
      await monitor.stop()
      this.monitors.delete(name)
      console.log(`[MonitorController] Removed monitor: ${name}`)
    }
  }

  /**
   * 获取状态
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      monitors: this.getMonitorNames(),
      reportersCount: this.reporters.length
    }
  }
}

module.exports = MonitorController
