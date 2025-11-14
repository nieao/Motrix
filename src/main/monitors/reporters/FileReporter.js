const BaseReporter = require('./BaseReporter')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const appendFile = promisify(fs.appendFile)
const mkdir = promisify(fs.mkdir)
const access = promisify(fs.access)

/**
 * FileReporter - 文件日志报告器
 * 将监控数据写入日志文件，支持日志轮转
 */
class FileReporter extends BaseReporter {
  constructor(config = {}) {
    super(config)
    this.logDir = config.logDir || path.join(process.cwd(), 'logs')
    this.logFileName = config.logFileName || 'monitor.log'
    this.errorLogFileName = config.errorLogFileName || 'monitor-error.log'
    this.maxFileSize = config.maxFileSize || 10 * 1024 * 1024 // 10MB
    this.rotateCount = config.rotateCount || 5
    this.writeQueue = []
    this.isWriting = false
  }

  async init() {
    // 确保日志目录存在
    try {
      await access(this.logDir)
    } catch (error) {
      await mkdir(this.logDir, { recursive: true })
    }

    this.logFilePath = path.join(this.logDir, this.logFileName)
    this.errorLogFilePath = path.join(this.logDir, this.errorLogFileName)

    console.log(`[FileReporter] Initialized, logging to: ${this.logDir}`)
  }

  /**
   * 报告数据
   */
  async report(data) {
    if (!this.enabled) {
      return
    }

    const logEntry = this.formatLogEntry(data)
    const filePath = data.type === 'error' ? this.errorLogFilePath : this.logFilePath

    await this.writeToFile(filePath, logEntry)
  }

  /**
   * 格式化日志条目
   */
  formatLogEntry(data) {
    const timestamp = this.formatTimestamp(new Date(data.timestamp))
    let entry = `[${timestamp}]`

    switch (data.type) {
      case 'error':
        entry += ` [ERROR] ${data.error.message}\n`
        if (data.error.stack) {
          entry += `Stack: ${data.error.stack}\n`
        }
        if (data.context && Object.keys(data.context).length > 0) {
          entry += `Context: ${JSON.stringify(data.context)}\n`
        }
        break

      case 'metrics':
        entry += ` [METRICS]\n`
        if (data.metrics) {
          Object.entries(data.metrics).forEach(([key, value]) => {
            entry += `  ${key}: ${value}\n`
          })
        }
        break

      case 'log':
        const level = (data.level || 'INFO').toUpperCase()
        entry += ` [${level}] ${data.message}\n`
        if (data.meta && Object.keys(data.meta).length > 0) {
          entry += `Meta: ${JSON.stringify(data.meta)}\n`
        }
        break

      default:
        entry += ` [DATA] ${JSON.stringify(data)}\n`
    }

    entry += '\n'
    return entry
  }

  /**
   * 写入文件
   */
  async writeToFile(filePath, content) {
    this.writeQueue.push({ filePath, content })

    if (!this.isWriting) {
      await this.processWriteQueue()
    }
  }

  /**
   * 处理写入队列
   */
  async processWriteQueue() {
    this.isWriting = true

    while (this.writeQueue.length > 0) {
      const { filePath, content } = this.writeQueue.shift()

      try {
        // 检查文件大小，必要时进行轮转
        await this.checkAndRotate(filePath)

        // 写入文件
        await appendFile(filePath, content, 'utf8')
      } catch (error) {
        console.error(`[FileReporter] Failed to write to ${filePath}:`, error.message)
      }
    }

    this.isWriting = false
  }

  /**
   * 检查文件大小并进行轮转
   */
  async checkAndRotate(filePath) {
    try {
      const stats = await promisify(fs.stat)(filePath)

      if (stats.size >= this.maxFileSize) {
        await this.rotateLog(filePath)
      }
    } catch (error) {
      // 文件不存在，无需轮转
      if (error.code !== 'ENOENT') {
        throw error
      }
    }
  }

  /**
   * 轮转日志文件
   */
  async rotateLog(filePath) {
    const rename = promisify(fs.rename)
    const unlink = promisify(fs.unlink)

    // 删除最旧的日志
    const oldestLog = `${filePath}.${this.rotateCount}`
    try {
      await unlink(oldestLog)
    } catch (error) {
      // 忽略文件不存在的错误
    }

    // 重命名现有日志文件
    for (let i = this.rotateCount - 1; i >= 1; i--) {
      const oldPath = `${filePath}.${i}`
      const newPath = `${filePath}.${i + 1}`

      try {
        await rename(oldPath, newPath)
      } catch (error) {
        // 忽略文件不存在的错误
      }
    }

    // 重命名当前日志文件
    await rename(filePath, `${filePath}.1`)
  }

  async close() {
    // 等待所有写入完成
    while (this.writeQueue.length > 0 || this.isWriting) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    console.log('[FileReporter] Closed')
  }
}

module.exports = FileReporter
