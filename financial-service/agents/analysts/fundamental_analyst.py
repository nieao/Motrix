"""
基本面分析师智能体
"""
from typing import Dict, Any
from agents.base_agent import BaseAgent


class FundamentalAnalyst(BaseAgent):
    """基本面分析师"""

    def __init__(self, llm_adapter):
        super().__init__(
            name="Fundamental Analyst",
            llm_adapter=llm_adapter,
            role_description="professional fundamental analyst specializing in financial statements, valuation metrics, and company analysis"
        )

    async def analyze(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        执行基本面分析

        Args:
            context: 包含 stock_info 等

        Returns:
            基本面分析结果
        """
        self.logger.info(f"{self.name} starting analysis...")

        stock_info = context.get('stock_info', {})

        # 构建分析提示词
        prompt = self._build_fundamental_prompt(stock_info)

        # 生成分析
        analysis = await self._generate_analysis(
            prompt=prompt,
            system_prompt=f"""You are a {self.role_description}.

Analyze the stock from a fundamental perspective, focusing on:
1. Business model and competitive position
2. Financial health and valuation metrics (P/E ratio, EPS)
3. Market capitalization and sector analysis
4. Dividend policy (if applicable)
5. Long-term investment potential

Provide a clear, structured analysis with specific observations and a fundamental rating (Strong Buy/Buy/Hold/Sell/Strong Sell).
Keep your analysis concise but insightful (200-300 words)."""
        )

        # 提取评级
        rating = self._extract_rating(analysis)

        return {
            'agent': self.name,
            'analysis': analysis,
            'rating': rating,
            'valuation': {
                'pe_ratio': stock_info.get('pe_ratio', 0),
                'market_cap': stock_info.get('market_cap', 0),
                'eps': stock_info.get('eps', 0)
            }
        }

    def _build_fundamental_prompt(self, stock_info: Dict[str, Any]) -> str:
        """构建基本面分析提示词"""
        prompt = self._build_context_prompt({'stock_info': stock_info})

        prompt += "\n=== Fundamental Data ===\n"

        if 'sector' in stock_info:
            prompt += f"Sector: {stock_info['sector']}\n"

        if 'industry' in stock_info:
            prompt += f"Industry: {stock_info['industry']}\n"

        if 'market_cap' in stock_info:
            market_cap_b = stock_info['market_cap'] / 1e9
            prompt += f"Market Cap: ${market_cap_b:.2f}B\n"

        if 'pe_ratio' in stock_info and stock_info['pe_ratio']:
            prompt += f"P/E Ratio: {stock_info['pe_ratio']:.2f}\n"

        if 'eps' in stock_info and stock_info['eps']:
            prompt += f"EPS: ${stock_info['eps']:.2f}\n"

        if 'dividend_yield' in stock_info and stock_info['dividend_yield']:
            prompt += f"Dividend Yield: {stock_info['dividend_yield'] * 100:.2f}%\n"

        if 'description' in stock_info and stock_info['description']:
            prompt += f"\nBusiness Description:\n{stock_info['description'][:500]}...\n"

        prompt += "\nProvide a comprehensive fundamental analysis based on this data."

        return prompt

    def _extract_rating(self, analysis: str) -> str:
        """从分析文本中提取评级"""
        analysis_lower = analysis.lower()

        # 关键词匹配
        strong_buy_keywords = ['strong buy', 'highly recommend']
        buy_keywords = ['buy', 'purchase', 'attractive']
        sell_keywords = ['sell', 'avoid', 'overvalued']

        if any(kw in analysis_lower for kw in strong_buy_keywords):
            return 'Strong Buy'
        elif any(kw in analysis_lower for kw in buy_keywords):
            return 'Buy'
        elif any(kw in analysis_lower for kw in sell_keywords):
            return 'Sell'
        else:
            return 'Hold'
