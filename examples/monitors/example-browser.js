#!/usr/bin/env node
/**
 * 浏览器监控示例
 * 演示如何使用监控系统监控网页
 *
 * 注意: 需要先安装 puppeteer
 * npm install puppeteer
 */

const path = require('path')
const { MonitorController } = require('../../src/main/monitors')

async function main() {
  console.log('🚀 启动浏览器监控示例\n')

  // 创建监控控制器
  const controller = new MonitorController({
    monitors: {
      browser: [
        {
          name: 'example-site',
          url: 'https://example.com',
          headless: true,
          width: 1920,
          height: 1080,
          monitorDom: true,
          verbose: true
        }
      ]
    },
    reporters: {
      console: {
        enabled: true,
        colors: true,
        verbose: true
      },
      file: {
        enabled: true,
        logDir: path.join(__dirname, '../../logs')
      },
      html: {
        enabled: true,
        reportDir: path.join(__dirname, '../../reports'),
        autoSaveInterval: 10000
      }
    },
    metricsInterval: 5000
  })

  // 监听事件
  controller.on('error', ({ source, error, context }) => {
    console.error(`\n❌ 错误 [${source}]:`, error.message)
    if (context) {
      console.error('上下文:', context)
    }
  })

  controller.on('metrics', ({ source, metrics }) => {
    console.log(`\n📊 指标 [${source}]:`)
    console.log(JSON.stringify(metrics, null, 2))
  })

  try {
    await controller.init()
    console.log('✅ 监控控制器初始化完成\n')

    await controller.start()
    console.log('✅ 浏览器监控已启动\n')
    console.log('正在监控中...\n')

    // 获取浏览器监控器实例
    const browserMonitor = controller.getMonitor('example-site')

    // 30 秒后截图
    setTimeout(async () => {
      try {
        console.log('\n📸 正在截图...')
        const screenshotPath = path.join(__dirname, '../../screenshot.png')
        await browserMonitor.screenshot({ path: screenshotPath })
        console.log(`✅ 截图已保存: ${screenshotPath}`)
      } catch (error) {
        console.error('❌ 截图失败:', error.message)
      }
    }, 30000)

    // 60 秒后停止
    setTimeout(async () => {
      console.log('\n⏰ 监控时间已到，正在停止...')
      await controller.stop()
      console.log('\n👋 监控系统已停止')
      console.log(`\n📄 HTML 报告: ${path.join(__dirname, '../../reports/monitor-report.html')}`)
      process.exit(0)
    }, 60000)

  } catch (error) {
    console.error('❌ 启动失败:', error)
    console.error('\n提示: 如果看到 "Cannot find module \'puppeteer\'"，请运行:')
    console.error('  npm install puppeteer\n')
    process.exit(1)
  }

  // 优雅退出
  process.on('SIGINT', async () => {
    console.log('\n\n⚠️  收到中断信号，正在停止...')
    await controller.stop()
    console.log('👋 再见！')
    process.exit(0)
  })
}

// 运行主函数
main().catch(err => {
  console.error('❌ 未捕获的错误:', err)
  process.exit(1)
})
