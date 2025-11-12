/**
 * 金融分析服务
 * 桥接 Electron 主进程和 Python AI 服务
 */
const { spawn } = require('child_process')
const path = require('path')
const axios = require('axios')
const { EventEmitter } = require('events')

class FinancialService extends EventEmitter {
  constructor() {
    super()
    this.serviceUrl = 'http://localhost:8000'
    this.pythonProcess = null
    this.isRunning = false
    this.startAttempts = 0
    this.maxStartAttempts = 3
  }

  /**
   * 启动 Python AI 服务
   */
  async start() {
    if (this.isRunning) {
      console.log('Financial service already running')
      return
    }

    console.log('Starting Financial AI Service...')

    try {
      // 尝试连接现有服务
      const isAlive = await this.healthCheck()
      if (isAlive) {
        console.log('Financial service is already running')
        this.isRunning = true
        return
      }

      // 启动新服务
      await this.startPythonService()

      // 等待服务启动
      await this.waitForService()

      this.isRunning = true
      console.log('Financial AI Service started successfully')
    } catch (error) {
      console.error('Failed to start Financial AI Service:', error)
      throw error
    }
  }

  /**
   * 启动 Python 服务进程
   */
  startPythonService() {
    return new Promise((resolve, reject) => {
      const servicePath = path.join(__dirname, '../../../../financial-service')
      const pythonExecutable = process.platform === 'win32' ? 'python' : 'python3'

      console.log('Starting Python service from:', servicePath)

      this.pythonProcess = spawn(
        pythonExecutable,
        ['-m', 'uvicorn', 'api.main:app', '--host', '0.0.0.0', '--port', '8000'],
        {
          cwd: servicePath,
          stdio: 'pipe',
          env: { ...process.env }
        }
      )

      this.pythonProcess.stdout.on('data', (data) => {
        console.log(`[Python Service] ${data.toString().trim()}`)
      })

      this.pythonProcess.stderr.on('data', (data) => {
        const message = data.toString().trim()
        // Uvicorn 的日志有时会输出到 stderr
        if (message.includes('Uvicorn running') || message.includes('Application startup complete')) {
          console.log(`[Python Service] ${message}`)
        } else if (!message.includes('WARNING')) {
          console.error(`[Python Service Error] ${message}`)
        }
      })

      this.pythonProcess.on('error', (error) => {
        console.error('Python service process error:', error)
        reject(error)
      })

      this.pythonProcess.on('exit', (code) => {
        console.log(`Python service exited with code ${code}`)
        this.isRunning = false
        this.pythonProcess = null
      })

      // 给进程一些时间启动
      setTimeout(() => resolve(), 3000)
    })
  }

  /**
   * 等待服务启动完成
   */
  async waitForService(maxAttempts = 30, interval = 1000) {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const isAlive = await this.healthCheck()
        if (isAlive) {
          return true
        }
      } catch (error) {
        // 继续尝试
      }

      await new Promise(resolve => setTimeout(resolve, interval))
      console.log(`Waiting for service to start... (${i + 1}/${maxAttempts})`)
    }

    throw new Error('Service failed to start within timeout')
  }

  /**
   * 健康检查
   */
  async healthCheck() {
    try {
      const response = await axios.get(`${this.serviceUrl}/health`, {
        timeout: 3000
      })
      return response.status === 200
    } catch (error) {
      return false
    }
  }

  /**
   * 分析股票
   */
  async analyzeStock(options) {
    if (!this.isRunning) {
      throw new Error('Service is not running')
    }

    const { symbol, market, depth, agents, llm_config } = options

    console.log(`Analyzing stock: ${symbol} (${market})`)

    try {
      // 发送分析请求
      const response = await axios.post(
        `${this.serviceUrl}/api/analyze`,
        {
          symbol,
          market,
          depth,
          agents,
          llm_config
        },
        {
          timeout: 600000  // 10分钟超时
        }
      )

      return response.data
    } catch (error) {
      console.error('Stock analysis failed:', error)
      throw new Error(error.response?.data?.detail || error.message)
    }
  }

  /**
   * 获取可用模型列表
   */
  async getAvailableModels() {
    try {
      const response = await axios.get(`${this.serviceUrl}/api/models`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch models:', error)
      return {}
    }
  }

  /**
   * 获取支持的市场列表
   */
  async getSupportedMarkets() {
    try {
      const response = await axios.get(`${this.serviceUrl}/api/markets`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch markets:', error)
      return {}
    }
  }

  /**
   * 停止服务
   */
  async stop() {
    if (this.pythonProcess) {
      console.log('Stopping Financial AI Service...')
      this.pythonProcess.kill()
      this.pythonProcess = null
      this.isRunning = false
    }
  }
}

// 单例实例
let financialServiceInstance = null

function getFinancialService() {
  if (!financialServiceInstance) {
    financialServiceInstance = new FinancialService()
  }
  return financialServiceInstance
}

module.exports = {
  FinancialService,
  getFinancialService
}
