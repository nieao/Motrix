# Motrix 多重监控系统

一个强大的多功能监控系统，用于监控 Python 程序和浏览器行为，支持多种报告方式。

## 📋 目录

- [功能特性](#功能特性)
- [系统架构](#系统架构)
- [安装](#安装)
- [快速开始](#快速开始)
- [配置说明](#配置说明)
- [API 文档](#api-文档)
- [示例](#示例)

## ✨ 功能特性

### 核心模块

1. **Python 监控器** - 捕获 Python 程序的输出、错误和性能
2. **浏览器监控器** - 使用 Puppeteer 监控 Console、Network、错误、DOM 变化
3. **多重报告器** - 终端输出、日志文件、HTML 报告、桌面通知
4. **主控制器** - 协调所有监控任务

### Python 监控器功能

- ✅ 捕获标准输出（stdout）和标准错误（stderr）
- ✅ 自动识别错误和警告
- ✅ 性能指标收集（内存、运行时间）
- ✅ 自动重启失败的进程
- ✅ 解析程序输出中的性能信息

### 浏览器监控器功能

- ✅ 监控浏览器控制台消息
- ✅ 追踪网络请求和响应
- ✅ 捕获页面错误和异常
- ✅ DOM 变化监控
- ✅ 性能指标收集
- ✅ 自动截图功能

### 报告器

1. **控制台报告器** - 彩色终端输出，支持不同日志级别
2. **文件报告器** - 日志文件记录，支持自动轮转
3. **HTML 报告器** - 生成美观的 HTML 报告，自动保存
4. **通知报告器** - 桌面系统通知，及时提醒重要事件

## 🏗 系统架构

```
MonitorController (主控制器)
    ├── Monitors (监控器)
    │   ├── PythonMonitor (Python 监控)
    │   └── BrowserMonitor (浏览器监控)
    └── Reporters (报告器)
        ├── ConsoleReporter (控制台)
        ├── FileReporter (文件)
        ├── HtmlReporter (HTML)
        └── NotificationReporter (通知)
```

## 📦 安装

### 基础安装

监控系统已集成在 Motrix 项目中，无需额外安装。

### 浏览器监控依赖

如果需要使用浏览器监控功能，需要安装 Puppeteer：

```bash
npm install puppeteer
```

## 🚀 快速开始

### 1. 创建配置文件

复制示例配置文件并修改：

```bash
cp monitor-config.example.json monitor-config.json
```

### 2. 基本使用

```javascript
const { MonitorController } = require('./src/main/monitors')

// 创建控制器
const controller = new MonitorController({
  monitors: {
    python: [
      {
        name: 'my-script',
        scriptPath: './test.py'
      }
    ]
  },
  reporters: {
    console: { enabled: true },
    file: { enabled: true }
  }
})

// 初始化并启动
async function main() {
  await controller.init()
  await controller.start()

  // 监听事件
  controller.on('error', ({ source, error }) => {
    console.error(`Error from ${source}:`, error)
  })
}

main()
```

### 3. 停止监控

```javascript
// 优雅停止所有监控
await controller.stop()
```

## ⚙️ 配置说明

### 监控器配置

#### Python 监控器

```json
{
  "monitors": {
    "python": [
      {
        "name": "监控器名称",
        "scriptPath": "Python 脚本路径",
        "pythonPath": "python3",
        "args": ["脚本参数"],
        "env": {
          "环境变量": "值"
        },
        "cwd": "工作目录",
        "autoRestart": true,
        "maxRestarts": 3,
        "restartDelay": 5000
      }
    ]
  }
}
```

**参数说明：**

- `name`: 监控器名称（必需）
- `scriptPath`: Python 脚本路径（必需）
- `pythonPath`: Python 解释器路径（默认: "python3"）
- `args`: 传递给脚本的参数数组
- `env`: 环境变量对象
- `cwd`: 工作目录
- `autoRestart`: 是否自动重启（默认: true）
- `maxRestarts`: 最大重启次数（默认: 3）
- `restartDelay`: 重启延迟（毫秒，默认: 5000）

#### 浏览器监控器

```json
{
  "monitors": {
    "browser": [
      {
        "name": "监控器名称",
        "url": "要监控的网址",
        "headless": true,
        "width": 1920,
        "height": 1080,
        "monitorDom": true,
        "verbose": false
      }
    ]
  }
}
```

**参数说明：**

- `name`: 监控器名称（必需）
- `url`: 要监控的网址（必需）
- `headless`: 无头模式（默认: true）
- `width`: 浏览器窗口宽度（默认: 1920）
- `height`: 浏览器窗口高度（默认: 1080）
- `monitorDom`: 是否监控 DOM 变化（默认: true）
- `verbose`: 详细日志模式（默认: false）

### 报告器配置

#### 控制台报告器

```json
{
  "reporters": {
    "console": {
      "enabled": true,
      "colors": true,
      "verbose": false
    }
  }
}
```

#### 文件报告器

```json
{
  "reporters": {
    "file": {
      "enabled": true,
      "logDir": "./logs",
      "logFileName": "monitor.log",
      "errorLogFileName": "monitor-error.log",
      "maxFileSize": 10485760,
      "rotateCount": 5
    }
  }
}
```

#### HTML 报告器

```json
{
  "reporters": {
    "html": {
      "enabled": true,
      "reportDir": "./reports",
      "reportFileName": "monitor-report.html",
      "maxEntries": 1000,
      "autoSaveInterval": 30000
    }
  }
}
```

#### 通知报告器

```json
{
  "reporters": {
    "notification": {
      "enabled": true,
      "notifyErrors": true,
      "notifyWarnings": false,
      "minInterval": 5000
    }
  }
}
```

## 📚 API 文档

### MonitorController

#### 方法

- `async init()` - 初始化控制器和所有监控器
- `async start()` - 启动所有监控器
- `async stop()` - 停止所有监控器
- `async addPythonMonitor(name, config)` - 添加 Python 监控器
- `async addBrowserMonitor(name, config)` - 添加浏览器监控器
- `getMonitor(name)` - 获取指定监控器
- `getMonitorNames()` - 获取所有监控器名称
- `async removeMonitor(name)` - 移除监控器
- `getStatus()` - 获取控制器状态

#### 事件

- `initialized` - 控制器初始化完成
- `started` - 所有监控器启动完成
- `stopped` - 所有监控器停止完成
- `error` - 发生错误 `{ source, error, context }`
- `metrics` - 收到性能指标 `{ source, metrics }`

### PythonMonitor

#### 方法

- `async start()` - 启动监控
- `async stop()` - 停止监控
- `getMetrics()` - 获取当前指标
- `sendInput(data)` - 向 Python 进程发送输入

#### 事件

- `log` - 日志消息 `(level, message, meta)`
- `error` - 错误 `(error, context)`
- `metrics` - 性能指标 `(metrics)`
- `started` - 监控启动 `(data)`
- `stopped` - 监控停止
- `exited` - 进程退出 `({ code, signal })`

### BrowserMonitor

#### 方法

- `async start()` - 启动监控
- `async stop()` - 停止监控
- `async collectMetrics()` - 收集性能指标
- `async evaluate(fn, ...args)` - 在页面中执行 JavaScript
- `async screenshot(options)` - 截图
- `getMetrics()` - 获取当前指标

#### 事件

- `log` - 日志消息 `(level, message, meta)`
- `error` - 错误 `(error, context)`
- `metrics` - 性能指标 `(metrics)`
- `started` - 监控启动 `(data)`
- `stopped` - 监控停止

## 💡 示例

### 示例 1: 监控 Python 脚本

```javascript
const { MonitorController } = require('./src/main/monitors')

const controller = new MonitorController({
  monitors: {
    python: [
      {
        name: 'data-processor',
        scriptPath: './scripts/process_data.py',
        args: ['--input', 'data.csv'],
        autoRestart: true
      }
    ]
  },
  reporters: {
    console: { enabled: true, verbose: true },
    file: { enabled: true }
  }
})

await controller.init()
await controller.start()
```

### 示例 2: 监控网站

```javascript
const { MonitorController } = require('./src/main/monitors')

const controller = new MonitorController({
  monitors: {
    browser: [
      {
        name: 'my-app',
        url: 'http://localhost:3000',
        headless: false,
        monitorDom: true
      }
    ]
  },
  reporters: {
    console: { enabled: true },
    html: { enabled: true },
    notification: {
      enabled: true,
      notifyErrors: true
    }
  }
})

await controller.init()
await controller.start()

// 5分钟后截图
setTimeout(async () => {
  const monitor = controller.getMonitor('my-app')
  await monitor.screenshot({ path: 'screenshot.png' })
}, 5 * 60 * 1000)
```

### 示例 3: 动态添加监控器

```javascript
const controller = new MonitorController({
  reporters: {
    console: { enabled: true }
  }
})

await controller.init()
await controller.start()

// 动态添加 Python 监控
await controller.addPythonMonitor('new-script', {
  scriptPath: './new_script.py'
})

// 获取监控器并启动
const monitor = controller.getMonitor('new-script')
await monitor.start()
```

### 示例 4: 测试 Python 脚本

创建一个测试脚本 `test-monitor.py`:

```python
#!/usr/bin/env python3
import time
import sys

print("Script started")

for i in range(10):
    print(f"Progress: {i+1}/10")
    time.sleep(1)

    if i == 5:
        print("Warning: Half way through", file=sys.stderr)

    # 输出性能信息（会被监控器解析）
    if i % 2 == 0:
        print(f"Performance: {(i+1) * 100}ms")

print("Script completed")
```

运行监控：

```javascript
const { MonitorController } = require('./src/main/monitors')

const controller = new MonitorController({
  monitors: {
    python: [
      {
        name: 'test-script',
        scriptPath: './test-monitor.py'
      }
    ]
  },
  reporters: {
    console: { enabled: true, verbose: true },
    file: { enabled: true },
    html: { enabled: true }
  }
})

await controller.init()
await controller.start()

// 等待完成
controller.on('exited', async ({ code }) => {
  console.log(`Script exited with code: ${code}`)
  await controller.stop()
})
```

## 📝 注意事项

1. **Puppeteer 安装**: 浏览器监控需要 Puppeteer，首次安装会下载 Chromium（~170MB）
2. **权限要求**: 某些系统上桌面通知需要用户授权
3. **资源占用**: 同时运行多个监控器会消耗系统资源，建议合理配置
4. **日志文件**: 注意定期清理或配置日志轮转，避免磁盘空间不足
5. **错误处理**: 建议监听控制器的 `error` 事件进行错误处理

## 🔧 故障排除

### Python 脚本无法启动

- 检查 `pythonPath` 配置是否正确
- 确认脚本路径存在且有执行权限
- 查看控制台错误信息

### 浏览器监控失败

- 确认已安装 Puppeteer: `npm install puppeteer`
- 检查系统是否支持 Chromium
- 尝试设置 `headless: false` 查看浏览器窗口

### 通知不显示

- 检查系统通知权限设置
- 确认 `Notification.isSupported()` 返回 true
- 查看控制台警告信息

## 📄 许可证

MIT License - 与 Motrix 主项目保持一致

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
