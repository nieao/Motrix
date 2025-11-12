/**
 * 金融服务模块入口
 */
const { ipcMain } = require('electron')
const { getFinancialService } = require('./FinancialService')

/**
 * 注册金融服务 IPC 处理器
 */
function registerFinancialHandlers(mainWindow) {
  const financialService = getFinancialService()

  // 启动服务
  ipcMain.handle('financial-service-start', async () => {
    try {
      await financialService.start()
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  // 健康检查
  ipcMain.handle('financial-service-health', async () => {
    try {
      const isHealthy = await financialService.healthCheck()
      return { healthy: isHealthy }
    } catch (error) {
      return { healthy: false, error: error.message }
    }
  })

  // 分析股票
  ipcMain.on('financial-analyze-stock', async (event, options) => {
    try {
      // 发送进度更新
      const sendProgress = (progress, message, status = null) => {
        mainWindow.webContents.send('financial-analysis-progress', {
          progress,
          message,
          status
        })
      }

      sendProgress(0, '准备开始分析...')

      // 确保服务已启动
      if (!financialService.isRunning) {
        sendProgress(10, '正在启动 AI 服务...')
        await financialService.start()
      }

      sendProgress(20, '正在获取股票数据...')

      // 执行分析
      sendProgress(30, '正在运行分析师智能体...')
      const result = await financialService.analyzeStock(options)

      sendProgress(90, '正在生成分析报告...')

      // 发送完成事件
      sendProgress(100, '分析完成！', 'success')
      mainWindow.webContents.send('financial-analysis-complete', result)
    } catch (error) {
      console.error('Analysis error:', error)
      mainWindow.webContents.send('financial-analysis-error', {
        message: error.message
      })
    }
  })

  // 获取可用模型
  ipcMain.handle('financial-get-models', async () => {
    try {
      return await financialService.getAvailableModels()
    } catch (error) {
      return {}
    }
  })

  // 获取支持的市场
  ipcMain.handle('financial-get-markets', async () => {
    try {
      return await financialService.getSupportedMarkets()
    } catch (error) {
      return {}
    }
  })

  // 停止服务
  ipcMain.handle('financial-service-stop', async () => {
    try {
      await financialService.stop()
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  console.log('Financial service IPC handlers registered')
}

/**
 * 初始化金融服务
 */
async function initFinancialService() {
  const financialService = getFinancialService()

  try {
    console.log('Initializing Financial Service...')
    await financialService.start()
    console.log('Financial Service initialized successfully')
  } catch (error) {
    console.error('Failed to initialize Financial Service:', error)
    console.log('Financial Service can be started manually later')
  }
}

/**
 * 清理金融服务
 */
async function cleanupFinancialService() {
  const financialService = getFinancialService()
  await financialService.stop()
  console.log('Financial Service cleaned up')
}

module.exports = {
  registerFinancialHandlers,
  initFinancialService,
  cleanupFinancialService
}
