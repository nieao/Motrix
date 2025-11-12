"""
OpenAI 兼容适配器
支持 OpenAI、DeepSeek 等兼容 OpenAI API 的服务
"""
from typing import Dict, Any, Optional, List
import aiohttp
from .base_adapter import BaseLLMAdapter


class OpenAIAdapter(BaseLLMAdapter):
    """OpenAI API 适配器"""

    def __init__(
        self,
        api_key: str,
        model: str,
        base_url: str = "https://api.openai.com/v1",
        **kwargs
    ):
        super().__init__(api_key, model, **kwargs)
        self.base_url = base_url.rstrip('/')
        self.api_url = f"{self.base_url}/chat/completions"

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        **kwargs
    ) -> str:
        """生成文本"""
        messages = []

        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})

        messages.append({"role": "user", "content": prompt})

        return await self.generate_with_messages(messages, **kwargs)

    async def generate_with_messages(
        self,
        messages: List[Dict[str, str]],
        **kwargs
    ) -> str:
        """使用消息列表生成文本"""
        request_kwargs = self._prepare_kwargs(**kwargs)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        data = {
            "model": self.model,
            "messages": messages,
            **request_kwargs
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(
                self.api_url,
                headers=headers,
                json=data
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise Exception(f"API request failed: {response.status} - {error_text}")

                result = await response.json()
                return result['choices'][0]['message']['content']


class DeepSeekAdapter(OpenAIAdapter):
    """DeepSeek 适配器"""

    def __init__(self, api_key: str, model: str = "deepseek-chat", **kwargs):
        super().__init__(
            api_key=api_key,
            model=model,
            base_url="https://api.deepseek.com/v1",
            **kwargs
        )
