"""
阿里百炼 (DashScope) 适配器
"""
from typing import Dict, Any, Optional, List
import aiohttp
from .base_adapter import BaseLLMAdapter


class DashScopeAdapter(BaseLLMAdapter):
    """阿里百炼适配器"""

    def __init__(self, api_key: str, model: str = "qwen-plus", **kwargs):
        super().__init__(api_key, model, **kwargs)
        self.api_url = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation"

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

        # 阿里百炼的参数格式
        data = {
            "model": self.model,
            "input": {
                "messages": messages
            },
            "parameters": {
                "temperature": request_kwargs.get('temperature', 0.7),
                "max_tokens": request_kwargs.get('max_tokens', 2000),
                "result_format": "message"
            }
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(
                self.api_url,
                headers=headers,
                json=data
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise Exception(f"DashScope API request failed: {response.status} - {error_text}")

                result = await response.json()

                # 解析阿里百炼的响应格式
                if 'output' in result and 'choices' in result['output']:
                    return result['output']['choices'][0]['message']['content']
                else:
                    raise Exception(f"Unexpected response format: {result}")
