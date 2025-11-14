const { spawn } = require('child_process')
const EventEmitter = require('events')

/**
 * PythonMonitor - Python 程序监控器
 * 监控 Python 程序的输出、错误和性能
 */
class PythonMonitor extends EventEmitter {
  constructor(config = {}) {
    super()
    this.config = config
    this.pythonPath = config.pythonPath || 'python3'
    this.scriptPath = config.scriptPath
    this.args = config.args || []
    this.env = config.env || {}
    this.cwd = config.cwd || process.cwd()
    this.process = null
    this.startTime = null
    this.metrics = {
      linesOutput: 0,
      linesError: 0,
      restarts: 0,
      uptime: 0,
      memoryUsage: 0
    }
    this.autoRestart = config.autoRestart !== false
    this.maxRestarts = config.maxRestarts || 3
    this.restartDelay = config.restartDelay || 5000
  }

  /**
   * 启动监控
   */
  async start() {
    if (!this.scriptPath) {
      throw new Error('Python script path is required')
    }

    this.emit('log', 'info', `Starting Python monitor for: ${this.scriptPath}`)
    await this.startProcess()
  }

  /**
   * 启动 Python 进程
   */
  async startProcess() {
    this.startTime = Date.now()

    const spawnArgs = [this.scriptPath, ...this.args]
    const spawnOptions = {
      cwd: this.cwd,
      env: { ...process.env, ...this.env }
    }

    this.emit('log', 'info', `Spawning: ${this.pythonPath} ${spawnArgs.join(' ')}`)

    this.process = spawn(this.pythonPath, spawnArgs, spawnOptions)

    // 监控标准输出
    this.process.stdout.on('data', (data) => {
      this.handleStdout(data)
    })

    // 监控标准错误
    this.process.stderr.on('data', (data) => {
      this.handleStderr(data)
    })

    // 监控进程退出
    this.process.on('exit', (code, signal) => {
      this.handleExit(code, signal)
    })

    // 监控进程错误
    this.process.on('error', (error) => {
      this.handleError(error)
    })

    // 定期收集性能指标
    this.metricsInterval = setInterval(() => {
      this.collectMetrics()
    }, 5000)

    this.emit('started', { scriptPath: this.scriptPath, pid: this.process.pid })
  }

  /**
   * 处理标准输出
   */
  handleStdout(data) {
    const output = data.toString()
    const lines = output.split('\n').filter(line => line.trim())

    lines.forEach(line => {
      this.metrics.linesOutput++
      this.emit('log', 'info', line, { source: 'stdout' })

      // 检查是否包含性能相关信息
      this.parsePerformanceInfo(line)
    })
  }

  /**
   * 处理标准错误
   */
  handleStderr(data) {
    const output = data.toString()
    const lines = output.split('\n').filter(line => line.trim())

    lines.forEach(line => {
      this.metrics.linesError++

      // 判断是否为真正的错误还是警告
      if (this.isError(line)) {
        this.emit('error', new Error(line), { source: 'stderr' })
      } else {
        this.emit('log', 'warn', line, { source: 'stderr' })
      }
    })
  }

  /**
   * 处理进程退出
   */
  handleExit(code, signal) {
    this.emit('log', 'info', `Process exited with code ${code}, signal ${signal}`)

    if (this.metricsInterval) {
      clearInterval(this.metricsInterval)
      this.metricsInterval = null
    }

    this.emit('exited', { code, signal })

    // 自动重启
    if (this.autoRestart && code !== 0 && this.metrics.restarts < this.maxRestarts) {
      this.metrics.restarts++
      this.emit('log', 'info', `Restarting process (attempt ${this.metrics.restarts}/${this.maxRestarts})`)

      setTimeout(() => {
        this.startProcess()
      }, this.restartDelay)
    } else if (this.metrics.restarts >= this.maxRestarts) {
      this.emit('log', 'error', 'Max restart attempts reached')
      this.emit('error', new Error('Max restart attempts reached'))
    }
  }

  /**
   * 处理进程错误
   */
  handleError(error) {
    this.emit('error', error, { source: 'process' })
  }

  /**
   * 收集性能指标
   */
  collectMetrics() {
    if (this.startTime) {
      this.metrics.uptime = Date.now() - this.startTime
    }

    // 尝试获取进程内存使用情况（在某些平台上可用）
    if (this.process && this.process.pid) {
      try {
        const usage = process.memoryUsage()
        this.metrics.memoryUsage = usage.rss
      } catch (error) {
        // 忽略错误
      }
    }

    this.emit('metrics', { ...this.metrics })
  }

  /**
   * 解析性能信息
   */
  parsePerformanceInfo(line) {
    // 尝试解析 Python 程序输出的性能信息
    // 例如: "Performance: 123.45ms" 或 "Memory: 1024MB"
    const perfRegex = /Performance:\s*(\d+(?:\.\d+)?)\s*(ms|s)/i
    const memRegex = /Memory:\s*(\d+(?:\.\.\d+)?)\s*(MB|KB|GB)/i

    let match = line.match(perfRegex)
    if (match) {
      const value = parseFloat(match[1])
      const unit = match[2].toLowerCase()
      this.metrics.performanceMs = unit === 's' ? value * 1000 : value
    }

    match = line.match(memRegex)
    if (match) {
      const value = parseFloat(match[1])
      const unit = match[2].toUpperCase()
      const multiplier = { KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 }
      this.metrics.memoryMB = (value * (multiplier[unit] || 1)) / (1024 * 1024)
    }
  }

  /**
   * 判断是否为错误
   */
  isError(line) {
    const errorPatterns = [
      /error/i,
      /exception/i,
      /traceback/i,
      /failed/i,
      /fatal/i
    ]

    return errorPatterns.some(pattern => pattern.test(line))
  }

  /**
   * 停止监控
   */
  async stop() {
    this.emit('log', 'info', 'Stopping Python monitor')

    if (this.metricsInterval) {
      clearInterval(this.metricsInterval)
      this.metricsInterval = null
    }

    if (this.process) {
      this.process.kill()
      this.process = null
    }

    this.emit('stopped')
  }

  /**
   * 获取当前指标
   */
  getMetrics() {
    return { ...this.metrics }
  }

  /**
   * 向 Python 进程发送输入
   */
  sendInput(data) {
    if (this.process && this.process.stdin) {
      this.process.stdin.write(data + '\n')
    }
  }
}

module.exports = PythonMonitor
