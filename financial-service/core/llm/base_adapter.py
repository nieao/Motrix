"""
LLM 基础适配器
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List


class BaseLLMAdapter(ABC):
    """LLM 适配器基类"""

    def __init__(self, api_key: str, model: str, **kwargs):
        self.api_key = api_key
        self.model = model
        self.temperature = kwargs.get('temperature', 0.7)
        self.max_tokens = kwargs.get('max_tokens', 2000)
        self.kwargs = kwargs

    @abstractmethod
    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        **kwargs
    ) -> str:
        """
        生成文本

        Args:
            prompt: 用户提示词
            system_prompt: 系统提示词
            **kwargs: 其他参数

        Returns:
            生成的文本
        """
        pass

    @abstractmethod
    async def generate_with_messages(
        self,
        messages: List[Dict[str, str]],
        **kwargs
    ) -> str:
        """
        使用消息列表生成文本

        Args:
            messages: 消息列表，格式: [{"role": "user", "content": "..."}]
            **kwargs: 其他参数

        Returns:
            生成的文本
        """
        pass

    def _prepare_kwargs(self, **override_kwargs) -> Dict[str, Any]:
        """准备请求参数"""
        kwargs = {
            'temperature': self.temperature,
            'max_tokens': self.max_tokens,
        }
        kwargs.update(override_kwargs)
        return kwargs
