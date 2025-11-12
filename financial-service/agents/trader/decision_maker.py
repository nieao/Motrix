"""
交易决策员智能体
"""
from typing import Dict, Any, List
from agents.base_agent import BaseAgent
import json


class TradingDecisionMaker(BaseAgent):
    """交易决策员"""

    def __init__(self, llm_adapter):
        super().__init__(
            name="Trading Decision Maker",
            llm_adapter=llm_adapter,
            role_description="senior trading decision maker who synthesizes all analyses to make final investment recommendations"
        )

    async def make_decision(
        self,
        context: Dict[str, Any],
        analyst_results: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        制定交易决策

        Args:
            context: 分析上下文
            analyst_results: 各分析师的分析结果

        Returns:
            最终交易决策
        """
        self.logger.info(f"{self.name} making final decision...")

        stock_info = context.get('stock_info', {})

        # 构建决策提示词
        prompt = self._build_decision_prompt(stock_info, analyst_results)

        # 生成决策
        decision_text = await self._generate_analysis(
            prompt=prompt,
            system_prompt=f"""You are a {self.role_description}.

Based on the analyses provided by the technical and fundamental analysts, make a final investment decision:

1. **Action**: BUY, HOLD, or SELL
2. **Confidence**: Rate your confidence in this decision (0-100%)
3. **Risk Score**: Assess the risk level (0-100%, where 0 is low risk and 100 is high risk)
4. **Target Price**: Provide a target price estimate (if applicable)
5. **Reasoning**: Explain your decision in 2-3 sentences, synthesizing the key points from all analyses
6. **Time Horizon**: Short-term (1-3 months), Medium-term (3-12 months), or Long-term (1+ years)

Format your response as follows:
Action: [BUY/HOLD/SELL]
Confidence: [0-100]%
Risk Score: [0-100]%
Target Price: $[price]
Time Horizon: [Short-term/Medium-term/Long-term]
Reasoning: [Your explanation]

Be decisive but balanced in your recommendation."""
        )

        # 解析决策
        decision = self._parse_decision(decision_text, stock_info)
        decision['detailed_analysis'] = {
            'analysts': analyst_results,
            'decision_text': decision_text
        }

        return decision

    def _build_decision_prompt(
        self,
        stock_info: Dict[str, Any],
        analyst_results: List[Dict[str, Any]]
    ) -> str:
        """构建决策提示词"""
        prompt = self._build_context_prompt({'stock_info': stock_info})

        prompt += "\n=== Analyst Reports ===\n\n"

        for result in analyst_results:
            agent_name = result.get('agent', 'Unknown')
            analysis = result.get('analysis', '')
            rating = result.get('rating', 'N/A')

            prompt += f"**{agent_name}** (Rating: {rating}):\n"
            prompt += f"{analysis}\n\n"

        prompt += "\n=== Your Task ===\n"
        prompt += "Synthesize the above analyses and make a final investment recommendation."

        return prompt

    def _parse_decision(
        self,
        decision_text: str,
        stock_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """解析决策文本"""
        lines = decision_text.strip().split('\n')

        decision = {
            'action': 'HOLD',
            'confidence': 0.5,
            'risk_score': 0.5,
            'target_price': stock_info.get('current_price', 0),
            'time_horizon': 'Medium-term',
            'reasoning': decision_text
        }

        for line in lines:
            line = line.strip()

            if line.startswith('Action:'):
                action = line.replace('Action:', '').strip().upper()
                if action in ['BUY', 'HOLD', 'SELL']:
                    decision['action'] = action

            elif line.startswith('Confidence:'):
                try:
                    conf_str = line.replace('Confidence:', '').replace('%', '').strip()
                    decision['confidence'] = float(conf_str) / 100
                except:
                    pass

            elif line.startswith('Risk Score:'):
                try:
                    risk_str = line.replace('Risk Score:', '').replace('%', '').strip()
                    decision['risk_score'] = float(risk_str) / 100
                except:
                    pass

            elif line.startswith('Target Price:'):
                try:
                    price_str = line.replace('Target Price:', '').replace('$', '').strip()
                    decision['target_price'] = float(price_str)
                except:
                    pass

            elif line.startswith('Time Horizon:'):
                horizon = line.replace('Time Horizon:', '').strip()
                decision['time_horizon'] = horizon

            elif line.startswith('Reasoning:'):
                decision['reasoning'] = line.replace('Reasoning:', '').strip()

        return decision
