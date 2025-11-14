# 监控系统示例

此目录包含使用 Motrix 多重监控系统的示例代码。

## 📁 文件说明

- `test-python-monitor.py` - 用于测试 Python 监控器的示例脚本
- `example-basic.js` - 基础监控示例（监控 Python 脚本）
- `example-browser.js` - 浏览器监控示例

## 🚀 运行示例

### 1. 基础监控示例

监控 Python 脚本的输出、错误和性能：

```bash
# 确保 Python 脚本有执行权限
chmod +x test-python-monitor.py

# 运行示例
node example-basic.js
```

**功能展示：**
- ✅ 捕获 Python 脚本的标准输出
- ✅ 捕获错误和警告
- ✅ 解析性能指标
- ✅ 控制台彩色输出
- ✅ 日志文件记录

### 2. 浏览器监控示例

监控网页的 Console、Network 和错误：

```bash
# 首先安装 Puppeteer（如果还没安装）
npm install puppeteer

# 运行示例
node example-browser.js
```

**功能展示：**
- ✅ 监控浏览器控制台消息
- ✅ 追踪网络请求
- ✅ 捕获页面错误
- ✅ DOM 变化监控
- ✅ 自动截图
- ✅ HTML 报告生成

## 📊 查看输出

### 控制台输出

运行示例时，你会在终端看到彩色的实时监控信息。

### 日志文件

日志文件保存在项目根目录的 `logs/` 目录下：

```bash
# 查看主日志
cat ../../logs/monitor.log

# 查看错误日志
cat ../../logs/monitor-error.log
```

### HTML 报告

浏览器监控示例会生成 HTML 报告：

```bash
# 在浏览器中打开报告
open ../../reports/monitor-report.html
```

## 🔧 自定义示例

你可以修改示例代码来测试不同的配置：

### 修改 Python 脚本监控

编辑 `example-basic.js`：

```javascript
monitors: {
  python: [
    {
      name: 'my-script',
      scriptPath: '/path/to/your/script.py',  // 改成你的脚本
      args: ['arg1', 'arg2'],                 // 添加参数
      autoRestart: true,                      // 启用自动重启
      maxRestarts: 5                          // 最多重启5次
    }
  ]
}
```

### 修改浏览器监控

编辑 `example-browser.js`：

```javascript
monitors: {
  browser: [
    {
      name: 'my-website',
      url: 'http://localhost:3000',  // 改成你要监控的网址
      headless: false,               // 显示浏览器窗口
      verbose: true                  // 显示详细日志
    }
  ]
}
```

## 💡 提示

1. **Python 环境**: 确保系统已安装 Python 3，并且 `python3` 命令可用
2. **Puppeteer**: 浏览器监控需要 Puppeteer，首次安装会下载 Chromium
3. **权限**: 在某些系统上可能需要给 Python 脚本添加执行权限
4. **日志目录**: 首次运行会自动创建 `logs/` 和 `reports/` 目录

## 🐛 故障排除

### Python 脚本无法运行

```bash
# 检查 Python 版本
python3 --version

# 确保脚本有执行权限
chmod +x test-python-monitor.py

# 手动运行测试
python3 test-python-monitor.py
```

### Puppeteer 相关错误

```bash
# 重新安装 Puppeteer
npm install puppeteer --force

# 如果下载 Chromium 失败，设置代理
export PUPPETEER_DOWNLOAD_HOST=https://npm.taobao.org/mirrors
npm install puppeteer
```

## 📚 更多信息

查看完整文档：[../../docs/MONITOR_SYSTEM.md](../../docs/MONITOR_SYSTEM.md)
