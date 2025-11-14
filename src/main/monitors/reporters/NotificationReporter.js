const BaseReporter = require('./BaseReporter')
const { Notification } = require('electron')

/**
 * NotificationReporter - 桌面通知报告器
 * 通过系统通知显示重要的监控信息
 */
class NotificationReporter extends BaseReporter {
  constructor(config = {}) {
    super(config)
    this.notifyErrors = config.notifyErrors !== false
    this.notifyWarnings = config.notifyWarnings || false
    this.minInterval = config.minInterval || 5000 // 最小通知间隔5秒
    this.lastNotificationTime = {}
  }

  async init() {
    // 检查是否支持通知
    if (!Notification.isSupported()) {
      console.warn('[NotificationReporter] Notifications not supported on this platform')
      this.enabled = false
      return
    }

    console.log('[NotificationReporter] Initialized')
  }

  /**
   * 报告数据
   */
  async report(data) {
    if (!this.enabled) {
      return
    }

    switch (data.type) {
      case 'error':
        if (this.notifyErrors) {
          await this.showNotification('错误', data.error.message, 'error')
        }
        break

      case 'log':
        if (data.level === 'error' && this.notifyErrors) {
          await this.showNotification('错误', data.message, 'error')
        } else if (data.level === 'warn' && this.notifyWarnings) {
          await this.showNotification('警告', data.message, 'warning')
        }
        break

      // 性能指标和其他类型默认不通知
    }
  }

  /**
   * 显示通知
   */
  async showNotification(title, body, type = 'info') {
    const key = `${type}:${title}`

    // 防止通知过于频繁
    const now = Date.now()
    if (this.lastNotificationTime[key] && now - this.lastNotificationTime[key] < this.minInterval) {
      return
    }

    this.lastNotificationTime[key] = now

    try {
      const notification = new Notification({
        title: `📊 监控系统 - ${title}`,
        body: this.truncateText(body, 200),
        urgency: this.getUrgency(type),
        timeoutType: type === 'error' ? 'never' : 'default'
      })

      notification.show()

      // 清理旧的时间戳
      this.cleanupTimestamps()
    } catch (error) {
      console.error('[NotificationReporter] Failed to show notification:', error.message)
    }
  }

  /**
   * 获取通知紧急程度
   */
  getUrgency(type) {
    switch (type) {
      case 'error':
        return 'critical'
      case 'warning':
        return 'normal'
      default:
        return 'low'
    }
  }

  /**
   * 截断文本
   */
  truncateText(text, maxLength) {
    if (text.length <= maxLength) {
      return text
    }
    return text.substring(0, maxLength - 3) + '...'
  }

  /**
   * 清理旧的时间戳
   */
  cleanupTimestamps() {
    const now = Date.now()
    const threshold = this.minInterval * 10

    Object.keys(this.lastNotificationTime).forEach(key => {
      if (now - this.lastNotificationTime[key] > threshold) {
        delete this.lastNotificationTime[key]
      }
    })
  }

  async close() {
    console.log('[NotificationReporter] Closed')
  }
}

module.exports = NotificationReporter
