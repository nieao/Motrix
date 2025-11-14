const EventEmitter = require('events')

/**
 * BrowserMonitor - 浏览器监控器
 * 使用 Puppeteer 监控浏览器行为（Console、Network、错误、DOM 变化）
 *
 * 注意: 此模块需要安装 puppeteer: npm install puppeteer
 */
class BrowserMonitor extends EventEmitter {
  constructor(config = {}) {
    super()
    this.config = config
    this.url = config.url
    this.headless = config.headless !== false
    this.browser = null
    this.page = null
    this.metrics = {
      consoleMessages: 0,
      consoleErrors: 0,
      networkRequests: 0,
      networkFailures: 0,
      domChanges: 0,
      errors: 0
    }
    this.startTime = null
    this.puppeteer = null
  }

  /**
   * 启动监控
   */
  async start() {
    if (!this.url) {
      throw new Error('URL is required for browser monitoring')
    }

    try {
      // 动态导入 puppeteer（允许在未安装时优雅降级）
      this.puppeteer = require('puppeteer')
    } catch (error) {
      throw new Error('Puppeteer is not installed. Please run: npm install puppeteer')
    }

    this.emit('log', 'info', `Starting browser monitor for: ${this.url}`)
    this.startTime = Date.now()

    await this.launchBrowser()
    await this.setupPage()
    await this.navigateToUrl()
  }

  /**
   * 启动浏览器
   */
  async launchBrowser() {
    this.emit('log', 'info', 'Launching browser...')

    this.browser = await this.puppeteer.launch({
      headless: this.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    })

    this.emit('log', 'info', 'Browser launched')
  }

  /**
   * 设置页面监控
   */
  async setupPage() {
    this.page = await this.browser.newPage()

    // 设置视口
    await this.page.setViewport({
      width: this.config.width || 1920,
      height: this.config.height || 1080
    })

    // 监控控制台消息
    this.page.on('console', msg => {
      this.handleConsoleMessage(msg)
    })

    // 监控页面错误
    this.page.on('pageerror', error => {
      this.handlePageError(error)
    })

    // 监控请求失败
    this.page.on('requestfailed', request => {
      this.handleRequestFailed(request)
    })

    // 监控网络请求
    this.page.on('request', request => {
      this.handleRequest(request)
    })

    // 监控网络响应
    this.page.on('response', response => {
      this.handleResponse(response)
    })

    // 监控对话框
    this.page.on('dialog', async dialog => {
      this.handleDialog(dialog)
    })

    this.emit('log', 'info', 'Page monitoring setup complete')
  }

  /**
   * 导航到 URL
   */
  async navigateToUrl() {
    this.emit('log', 'info', `Navigating to ${this.url}`)

    try {
      await this.page.goto(this.url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      })

      this.emit('log', 'info', 'Page loaded successfully')

      // 设置 DOM 变化监控
      if (this.config.monitorDom !== false) {
        await this.setupDomMonitoring()
      }

      this.emit('started', { url: this.url })
    } catch (error) {
      this.emit('error', error, { context: 'navigation' })
      throw error
    }
  }

  /**
   * 设置 DOM 监控
   */
  async setupDomMonitoring() {
    await this.page.evaluate(() => {
      const observer = new MutationObserver((mutations) => {
        window.__domChanges = (window.__domChanges || 0) + mutations.length
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
      })
    })

    // 定期收集 DOM 变化
    this.domInterval = setInterval(async () => {
      try {
        const changes = await this.page.evaluate(() => {
          const count = window.__domChanges || 0
          window.__domChanges = 0
          return count
        })

        if (changes > 0) {
          this.metrics.domChanges += changes
          this.emit('log', 'debug', `DOM changes detected: ${changes}`)
        }
      } catch (error) {
        // 页面可能已关闭
      }
    }, 1000)
  }

  /**
   * 处理控制台消息
   */
  handleConsoleMessage(msg) {
    this.metrics.consoleMessages++

    const type = msg.type()
    const text = msg.text()

    if (type === 'error') {
      this.metrics.consoleErrors++
      this.emit('log', 'error', `Console Error: ${text}`, { source: 'console' })
    } else if (type === 'warning') {
      this.emit('log', 'warn', `Console Warning: ${text}`, { source: 'console' })
    } else {
      this.emit('log', 'debug', `Console ${type}: ${text}`, { source: 'console' })
    }
  }

  /**
   * 处理页面错误
   */
  handlePageError(error) {
    this.metrics.errors++
    this.emit('error', error, { source: 'page' })
  }

  /**
   * 处理请求失败
   */
  handleRequestFailed(request) {
    this.metrics.networkFailures++

    const url = request.url()
    const failure = request.failure()

    this.emit('log', 'error', `Request failed: ${url}`, {
      source: 'network',
      errorText: failure ? failure.errorText : 'Unknown error'
    })
  }

  /**
   * 处理请求
   */
  handleRequest(request) {
    this.metrics.networkRequests++

    if (this.config.verbose) {
      this.emit('log', 'debug', `Request: ${request.method()} ${request.url()}`, {
        source: 'network',
        resourceType: request.resourceType()
      })
    }
  }

  /**
   * 处理响应
   */
  handleResponse(response) {
    const status = response.status()

    if (status >= 400) {
      this.emit('log', 'warn', `HTTP ${status}: ${response.url()}`, {
        source: 'network',
        status
      })
    } else if (this.config.verbose) {
      this.emit('log', 'debug', `Response: ${status} ${response.url()}`, {
        source: 'network',
        status
      })
    }
  }

  /**
   * 处理对话框
   */
  async handleDialog(dialog) {
    this.emit('log', 'info', `Dialog: ${dialog.type()} - ${dialog.message()}`, {
      source: 'dialog'
    })

    // 自动接受对话框
    await dialog.accept()
  }

  /**
   * 收集性能指标
   */
  async collectMetrics() {
    if (!this.page) {
      return this.metrics
    }

    try {
      const performanceMetrics = await this.page.metrics()
      const uptime = this.startTime ? Date.now() - this.startTime : 0

      return {
        ...this.metrics,
        uptime,
        performance: performanceMetrics
      }
    } catch (error) {
      return this.metrics
    }
  }

  /**
   * 执行 JavaScript
   */
  async evaluate(fn, ...args) {
    if (!this.page) {
      throw new Error('Page not initialized')
    }
    return await this.page.evaluate(fn, ...args)
  }

  /**
   * 截图
   */
  async screenshot(options = {}) {
    if (!this.page) {
      throw new Error('Page not initialized')
    }

    const path = options.path || `screenshot-${Date.now()}.png`
    await this.page.screenshot({ ...options, path })

    this.emit('log', 'info', `Screenshot saved: ${path}`)
    return path
  }

  /**
   * 获取当前指标
   */
  getMetrics() {
    return { ...this.metrics }
  }

  /**
   * 停止监控
   */
  async stop() {
    this.emit('log', 'info', 'Stopping browser monitor')

    if (this.domInterval) {
      clearInterval(this.domInterval)
      this.domInterval = null
    }

    if (this.page) {
      await this.page.close()
      this.page = null
    }

    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }

    this.emit('stopped')
  }
}

module.exports = BrowserMonitor
