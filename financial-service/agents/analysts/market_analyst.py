"""
市场技术分析师智能体
"""
from typing import Dict, Any
from agents.base_agent import BaseAgent


class MarketAnalyst(BaseAgent):
    """市场技术分析师"""

    def __init__(self, llm_adapter):
        super().__init__(
            name="Market Technical Analyst",
            llm_adapter=llm_adapter,
            role_description="professional market technical analyst specializing in chart patterns, technical indicators, and price trends"
        )

    async def analyze(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        执行技术分析

        Args:
            context: 包含 stock_info, technical_indicators 等

        Returns:
            技术分析结果
        """
        self.logger.info(f"{self.name} starting analysis...")

        stock_info = context.get('stock_info', {})
        technical = context.get('technical_indicators', {})

        # 构建分析提示词
        prompt = self._build_technical_prompt(stock_info, technical)

        # 生成分析
        analysis = await self._generate_analysis(
            prompt=prompt,
            system_prompt=f"""You are a {self.role_description}.

Analyze the stock from a technical perspective, focusing on:
1. Price trends and momentum
2. Technical indicators (RSI, Moving Averages)
3. Support and resistance levels
4. Volume analysis
5. Short-term price outlook

Provide a clear, structured analysis with specific observations and a technical rating (Bullish/Neutral/Bearish).
Keep your analysis concise but insightful (200-300 words)."""
        )

        # 提取技术评级
        rating = self._extract_rating(analysis)

        return {
            'agent': self.name,
            'analysis': analysis,
            'rating': rating,
            'indicators': technical
        }

    def _build_technical_prompt(
        self,
        stock_info: Dict[str, Any],
        technical: Dict[str, Any]
    ) -> str:
        """构建技术分析提示词"""
        prompt = self._build_context_prompt({'stock_info': stock_info})

        prompt += "\n=== Technical Indicators ===\n"

        if technical:
            if 'current_price' in technical:
                prompt += f"Current Price: ${technical['current_price']:.2f}\n"

            if 'sma_20' in technical and technical['sma_20']:
                prompt += f"20-day SMA: ${technical['sma_20']:.2f}\n"

            if 'sma_50' in technical and technical['sma_50']:
                prompt += f"50-day SMA: ${technical['sma_50']:.2f}\n"

            if 'rsi' in technical and technical['rsi']:
                prompt += f"RSI (14): {technical['rsi']:.2f}\n"

            if 'price_change_pct' in technical:
                prompt += f"Price Change: {technical['price_change_pct']:.2f}%\n"

            if 'volume' in technical:
                prompt += f"Volume: {technical['volume']:,}\n"
        else:
            prompt += "Technical indicators data not available.\n"

        prompt += "\nProvide a comprehensive technical analysis based on these indicators."

        return prompt

    def _extract_rating(self, analysis: str) -> str:
        """从分析文本中提取评级"""
        analysis_lower = analysis.lower()

        # 简单的关键词匹配
        bullish_keywords = ['bullish', 'buy', 'positive', 'uptrend', 'strong']
        bearish_keywords = ['bearish', 'sell', 'negative', 'downtrend', 'weak']

        bullish_score = sum(1 for kw in bullish_keywords if kw in analysis_lower)
        bearish_score = sum(1 for kw in bearish_keywords if kw in analysis_lower)

        if bullish_score > bearish_score:
            return 'Bullish'
        elif bearish_score > bullish_score:
            return 'Bearish'
        else:
            return 'Neutral'
