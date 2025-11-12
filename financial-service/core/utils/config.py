"""
配置管理模块
"""
import os
import yaml
from pathlib import Path
from typing import Dict, Any, Optional
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()


class Config:
    """配置管理类"""

    def __init__(self, config_path: Optional[str] = None):
        self.config_path = config_path or os.path.join(
            os.path.dirname(__file__), '../../config/default.yaml'
        )
        self._config: Dict[str, Any] = {}
        self._load_config()

    def _load_config(self):
        """加载配置文件"""
        if os.path.exists(self.config_path):
            with open(self.config_path, 'r', encoding='utf-8') as f:
                self._config = yaml.safe_load(f) or {}

    def get(self, key: str, default: Any = None) -> Any:
        """
        获取配置值，支持点号分隔的嵌套键

        Args:
            key: 配置键，如 'llm.default_provider'
            default: 默认值

        Returns:
            配置值
        """
        keys = key.split('.')
        value = self._config

        for k in keys:
            if isinstance(value, dict):
                value = value.get(k)
            else:
                return default

            if value is None:
                return default

        return value

    def get_env(self, key: str, default: Any = None) -> Any:
        """
        获取环境变量

        Args:
            key: 环境变量名
            default: 默认值

        Returns:
            环境变量值
        """
        return os.getenv(key, default)

    def get_llm_config(self, provider: Optional[str] = None) -> Dict[str, Any]:
        """
        获取 LLM 配置

        Args:
            provider: LLM 提供商名称

        Returns:
            LLM 配置字典
        """
        provider = provider or self.get('llm.default_provider', 'dashscope')

        config = {
            'provider': provider,
            'api_key': self.get_env(f'{provider.upper()}_API_KEY'),
            'model': self.get(f'llm.models.{provider}', 'qwen-plus'),
            'temperature': float(self.get('llm.temperature', 0.7)),
            'max_tokens': int(self.get('llm.max_tokens', 2000)),
        }

        return config


def load_config(config_path: Optional[str] = None) -> Config:
    """
    加载配置

    Args:
        config_path: 配置文件路径

    Returns:
        Config 实例
    """
    return Config(config_path)


# 全局配置实例
_global_config: Optional[Config] = None


def get_config() -> Config:
    """获取全局配置实例"""
    global _global_config
    if _global_config is None:
        _global_config = load_config()
    return _global_config
