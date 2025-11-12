"""
核心分析编排器
"""
from typing import Dict, Any, List, Optional
from datetime import datetime

from core.llm import create_llm_adapter
from core.utils.config import get_config
from core.utils.logger import get_logger
from data.sources.stock_data import get_stock_data_provider
from agents.analysts.market_analyst import MarketAnalyst
from agents.analysts.fundamental_analyst import FundamentalAnalyst
from agents.trader.decision_maker import TradingDecisionMaker


class FinancialAnalyzer:
    """金融分析编排器"""

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self.global_config = get_config()
        self.logger = get_logger()
        self.stock_provider = get_stock_data_provider()

    async def analyze(
        self,
        symbol: str,
        market: str = "US",
        depth: int = 3,
        agents: Optional[List[str]] = None,
        llm_config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        执行完整的股票分析

        Args:
            symbol: 股票代码
            market: 市场 (US, CN, HK)
            depth: 分析深度 (1-5)
            agents: 启用的分析师列表
            llm_config: LLM 配置

        Returns:
            分析结果字典
        """
        self.logger.info(f"Starting analysis for {symbol} (market: {market}, depth: {depth})")

        try:
            # 1. 获取股票数据
            self.logger.info("Step 1: Fetching stock data...")
            stock_info = await self.stock_provider.get_stock_info(symbol, market)
            technical_indicators = await self.stock_provider.get_technical_indicators(symbol, market)

            # 2. 创建 LLM 适配器
            llm_adapter = self._create_llm_adapter(llm_config)

            # 3. 准备分析上下文
            context = {
                'symbol': symbol,
                'market': market,
                'depth': depth,
                'stock_info': stock_info,
                'technical_indicators': technical_indicators,
                'timestamp': datetime.now().isoformat()
            }

            # 4. 执行分析师分析
            self.logger.info("Step 2: Running analyst agents...")
            analyst_results = await self._run_analysts(llm_adapter, context, agents or [])

            # 5. 制定最终决策
            self.logger.info("Step 3: Making final decision...")
            decision_maker = TradingDecisionMaker(llm_adapter)
            final_decision = await decision_maker.make_decision(context, analyst_results)

            # 6. 构建最终结果
            result = {
                'symbol': symbol,
                'market': market,
                'depth': depth,
                'stock_info': stock_info,
                'technical_indicators': technical_indicators,
                'analyst_reports': analyst_results,
                'decision': final_decision,
                'timestamp': context['timestamp'],
                'llm_config': {
                    'provider': llm_config.get('provider') if llm_config else self.global_config.get('llm.default_provider'),
                    'model': llm_config.get('model') if llm_config else self.global_config.get('llm.default_model')
                }
            }

            self.logger.info(f"Analysis completed for {symbol}: {final_decision['action']}")
            return result

        except Exception as e:
            self.logger.error(f"Analysis failed for {symbol}: {str(e)}")
            raise

    async def _run_analysts(
        self,
        llm_adapter,
        context: Dict[str, Any],
        agents: List[str]
    ) -> List[Dict[str, Any]]:
        """运行分析师智能体"""
        results = []

        # 默认启用市场分析师和基本面分析师
        if not agents:
            agents = ['market', 'fundamental']

        # 市场技术分析师
        if 'market' in agents:
            try:
                market_analyst = MarketAnalyst(llm_adapter)
                market_result = await market_analyst.analyze(context)
                results.append(market_result)
            except Exception as e:
                self.logger.error(f"Market analyst failed: {str(e)}")

        # 基本面分析师
        if 'fundamental' in agents:
            try:
                fundamental_analyst = FundamentalAnalyst(llm_adapter)
                fundamental_result = await fundamental_analyst.analyze(context)
                results.append(fundamental_result)
            except Exception as e:
                self.logger.error(f"Fundamental analyst failed: {str(e)}")

        return results

    def _create_llm_adapter(self, llm_config: Optional[Dict[str, Any]] = None):
        """创建 LLM 适配器"""
        if llm_config:
            provider = llm_config.get('provider')
            model = llm_config.get('model')
            api_key = llm_config.get('api_key')
        else:
            provider = self.global_config.get('llm.default_provider', 'dashscope')
            model = self.global_config.get(f'llm.models.{provider}', 'qwen-plus')
            api_key = self.global_config.get_env(f'{provider.upper()}_API_KEY')

        if not api_key:
            raise ValueError(f"API key not found for provider: {provider}")

        return create_llm_adapter(
            provider=provider,
            api_key=api_key,
            model=model,
            temperature=self.global_config.get('llm.temperature', 0.7),
            max_tokens=self.global_config.get('llm.max_tokens', 2000)
        )
