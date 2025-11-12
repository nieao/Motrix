"""
LLM 适配器模块
"""
from typing import Optional
from .base_adapter import BaseLLMAdapter
from .openai_adapter import OpenAIAdapter, DeepSeekAdapter
from .dashscope_adapter import DashScopeAdapter


def create_llm_adapter(
    provider: str,
    api_key: str,
    model: str,
    **kwargs
) -> BaseLLMAdapter:
    """
    创建 LLM 适配器

    Args:
        provider: LLM 提供商 (openai, deepseek, dashscope, google)
        api_key: API 密钥
        model: 模型名称
        **kwargs: 其他参数

    Returns:
        LLM 适配器实例
    """
    provider = provider.lower()

    if provider == 'openai':
        return OpenAIAdapter(api_key, model, **kwargs)
    elif provider == 'deepseek':
        return DeepSeekAdapter(api_key, model, **kwargs)
    elif provider == 'dashscope':
        return DashScopeAdapter(api_key, model, **kwargs)
    else:
        raise ValueError(f"Unsupported LLM provider: {provider}")


__all__ = [
    'BaseLLMAdapter',
    'OpenAIAdapter',
    'DeepSeekAdapter',
    'DashScopeAdapter',
    'create_llm_adapter'
]
