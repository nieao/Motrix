#!/usr/bin/env node
/**
 * 基础监控示例
 * 演示如何使用监控系统监控 Python 脚本
 */

const path = require('path')
const { MonitorController } = require('../../src/main/monitors')

async function main() {
  console.log('🚀 启动基础监控示例\n')

  // 创建监控控制器
  const controller = new MonitorController({
    monitors: {
      python: [
        {
          name: 'test-script',
          scriptPath: path.join(__dirname, 'test-python-monitor.py'),
          pythonPath: 'python3',
          autoRestart: false
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
      }
    },
    metricsInterval: 5000
  })

  // 监听事件
  controller.on('error', ({ source, error, context }) => {
    console.error(`\n❌ 错误 [${source}]:`, error.message)
  })

  controller.on('metrics', ({ source, metrics }) => {
    console.log(`\n📊 指标 [${source}]:`, metrics)
  })

  // 监听 Python 进程退出
  const pythonMonitor = controller.getMonitor('test-script')
  if (pythonMonitor) {
    pythonMonitor.on('exited', async ({ code, signal }) => {
      console.log(`\n✅ Python 脚本已退出 (code: ${code}, signal: ${signal})`)

      // 等待一会儿让报告器完成写入
      setTimeout(async () => {
        await controller.stop()
        console.log('\n👋 监控系统已停止')
        process.exit(0)
      }, 2000)
    })
  }

  // 初始化并启动
  try {
    await controller.init()
    console.log('✅ 监控控制器初始化完成\n')

    await controller.start()
    console.log('✅ 所有监控器已启动\n')
    console.log('正在监控中...\n')
  } catch (error) {
    console.error('❌ 启动失败:', error)
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
