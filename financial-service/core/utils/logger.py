"""
日志管理模块
"""
import os
import sys
import logging
from pathlib import Path
from typing import Optional
from logging.handlers import RotatingFileHandler


class Logger:
    """日志管理器"""

    def __init__(
        self,
        name: str = 'financial-service',
        log_dir: Optional[str] = None,
        log_level: str = 'INFO'
    ):
        self.name = name
        self.log_dir = log_dir or os.path.join(
            os.path.dirname(__file__), '../../logs'
        )
        self.log_level = getattr(logging, log_level.upper(), logging.INFO)

        # 创建日志目录
        Path(self.log_dir).mkdir(parents=True, exist_ok=True)

        # 初始化日志器
        self.logger = self._setup_logger()

    def _setup_logger(self) -> logging.Logger:
        """设置日志器"""
        logger = logging.getLogger(self.name)
        logger.setLevel(self.log_level)

        # 避免重复添加处理器
        if logger.handlers:
            return logger

        # 创建格式化器
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )

        # 控制台处理器
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(self.log_level)
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)

        # 文件处理器
        log_file = os.path.join(self.log_dir, f'{self.name}.log')
        file_handler = RotatingFileHandler(
            log_file,
            maxBytes=10 * 1024 * 1024,  # 10MB
            backupCount=5,
            encoding='utf-8'
        )
        file_handler.setLevel(self.log_level)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

        return logger

    def debug(self, message: str):
        """调试日志"""
        self.logger.debug(message)

    def info(self, message: str):
        """信息日志"""
        self.logger.info(message)

    def warning(self, message: str):
        """警告日志"""
        self.logger.warning(message)

    def error(self, message: str):
        """错误日志"""
        self.logger.error(message)

    def critical(self, message: str):
        """严重错误日志"""
        self.logger.critical(message)


# 全局日志实例
_global_logger: Optional[Logger] = None


def get_logger(name: Optional[str] = None) -> Logger:
    """获取全局日志实例"""
    global _global_logger
    if _global_logger is None:
        log_level = os.getenv('LOG_LEVEL', 'INFO')
        _global_logger = Logger(name or 'financial-service', log_level=log_level)
    return _global_logger
