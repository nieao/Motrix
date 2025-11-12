"""
智能体基类
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from core.llm import BaseLLMAdapter
from core.utils.logger import get_logger


class BaseAgent(ABC):
    """智能体基类"""

    def __init__(
        self,
        name: str,
        llm_adapter: BaseLLMAdapter,
        role_description: str
    ):
        self.name = name
        self.llm_adapter = llm_adapter
        self.role_description = role_description
        self.logger = get_logger()

    @abstractmethod
    async def analyze(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        执行分析

        Args:
            context: 分析上下文，包含股票信息、数据等

        Returns:
            分析结果字典
        """
        pass

    async def _generate_analysis(
        self,
        prompt: str,
        system_prompt: Optional[str] = None
    ) -> str:
        """
        生成分析文本

        Args:
            prompt: 用户提示词
            system_prompt: 系统提示词

        Returns:
            生成的分析文本
        """
        if system_prompt is None:
            system_prompt = f"You are a {self.role_description}. Provide professional and insightful analysis."

        try:
            result = await self.llm_adapter.generate(
                prompt=prompt,
                system_prompt=system_prompt
            )
            return result
        except Exception as e:
            self.logger.error(f"{self.name} analysis failed: {str(e)}")
            raise

    def _build_context_prompt(self, context: Dict[str, Any]) -> str:
        """
        构建上下文提示词

        Args:
            context: 分析上下文

        Returns:
            提示词字符串
        """
        stock_info = context.get('stock_info', {})
        symbol = stock_info.get('symbol', 'Unknown')
        name = stock_info.get('name', 'Unknown')

        prompt = f"Stock: {symbol} ({name})\n\n"

        if 'current_price' in stock_info:
            prompt += f"Current Price: ${stock_info['current_price']:.2f}\n"

        if 'market_cap' in stock_info:
            market_cap_b = stock_info['market_cap'] / 1e9
            prompt += f"Market Cap: ${market_cap_b:.2f}B\n"

        return prompt
