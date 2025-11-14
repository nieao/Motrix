#!/usr/bin/env python3
"""
测试 Python 监控器的示例脚本
此脚本会输出不同类型的消息，用于测试监控系统的各种功能
"""

import time
import sys
import random

def main():
    print("=== Python 监控测试脚本 ===")
    print("脚本启动中...")

    # 模拟初始化
    time.sleep(1)
    print("初始化完成")

    # 进度循环
    total_iterations = 10
    for i in range(total_iterations):
        progress = (i + 1) / total_iterations * 100
        print(f"进度: {i+1}/{total_iterations} ({progress:.1f}%)")

        # 模拟性能输出
        execution_time = random.uniform(50, 200)
        print(f"Performance: {execution_time:.2f}ms")

        # 模拟内存使用
        memory_mb = random.uniform(100, 500)
        print(f"Memory: {memory_mb:.2f}MB")

        # 在中途输出警告
        if i == 4:
            print("Warning: 检测到潜在性能问题", file=sys.stderr)

        # 模拟偶尔的调试信息
        if i % 3 == 0:
            print(f"DEBUG: 正在处理数据批次 {i}")

        # 模拟工作
        time.sleep(1)

    print("\n任务完成!")
    print("总计处理: 10 个批次")
    print("脚本正常退出")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n脚本被用户中断", file=sys.stderr)
        sys.exit(130)
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
