"""
FastAPI 主服务
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

from core.analyzer import FinancialAnalyzer
from core.utils.config import get_config
from core.utils.logger import get_logger

# 创建应用
app = FastAPI(
    title="Financial Decision System API",
    description="基于多智能体的金融决策系统",
    version="1.0.0"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 全局变量
config = get_config()
logger = get_logger()
analyzer = FinancialAnalyzer()


# ============ 数据模型 ============

class LLMConfig(BaseModel):
    """LLM 配置"""
    provider: str = "dashscope"
    model: str = "qwen-plus"
    api_key: Optional[str] = None


class AnalysisRequest(BaseModel):
    """分析请求"""
    symbol: str
    market: str = "US"
    depth: int = 3
    agents: List[str] = ["market", "fundamental"]
    llm_config: Optional[LLMConfig] = None


class AnalysisResponse(BaseModel):
    """分析响应"""
    symbol: str
    market: str
    action: str
    confidence: float
    risk_score: float
    target_price: Optional[float]
    reasoning: str
    timestamp: str
    detailed_analysis: Optional[Dict[str, Any]] = None


# ============ API 路由 ============

@app.get("/")
async def root():
    """根路径"""
    return {
        "name": "Financial Decision System API",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/health")
async def health_check():
    """健康检查"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }


@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_stock(request: AnalysisRequest):
    """
    股票分析接口

    Args:
        request: 分析请求

    Returns:
        分析结果
    """
    try:
        logger.info(f"Received analysis request for {request.symbol}")

        # 准备 LLM 配置
        llm_config = None
        if request.llm_config:
            llm_config = request.llm_config.dict()
            # 如果没有提供 API key，从环境变量获取
            if not llm_config.get('api_key'):
                provider = llm_config['provider'].upper()
                api_key = config.get_env(f'{provider}_API_KEY')
                if api_key:
                    llm_config['api_key'] = api_key

        # 执行分析
        result = await analyzer.analyze(
            symbol=request.symbol,
            market=request.market,
            depth=request.depth,
            agents=request.agents,
            llm_config=llm_config
        )

        # 构建响应
        decision = result['decision']
        response = AnalysisResponse(
            symbol=result['symbol'],
            market=result['market'],
            action=decision['action'],
            confidence=decision['confidence'],
            risk_score=decision['risk_score'],
            target_price=decision.get('target_price'),
            reasoning=decision['reasoning'],
            timestamp=result['timestamp'],
            detailed_analysis=result
        )

        logger.info(f"Analysis completed for {request.symbol}: {decision['action']}")
        return response

    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/models")
async def get_available_models():
    """获取可用的 LLM 模型列表"""
    return {
        "dashscope": [
            {"label": "通义千问 Turbo (快速)", "value": "qwen-turbo"},
            {"label": "通义千问 Plus (平衡)", "value": "qwen-plus"},
            {"label": "通义千问 Max (强大)", "value": "qwen-max"}
        ],
        "deepseek": [
            {"label": "DeepSeek Chat (推荐)", "value": "deepseek-chat"}
        ],
        "openai": [
            {"label": "GPT-4o (推荐)", "value": "gpt-4o"},
            {"label": "GPT-4o Mini (经济)", "value": "gpt-4o-mini"}
        ]
    }


@app.get("/api/markets")
async def get_supported_markets():
    """获取支持的市场列表"""
    return {
        "markets": [
            {"code": "US", "name": "美股", "example": "AAPL, TSLA, MSFT"},
            {"code": "CN", "name": "A股", "example": "000001, 600519, 300750"},
            {"code": "HK", "name": "港股", "example": "0700.HK, 9988.HK"}
        ]
    }


# ============ 启动服务 ============

if __name__ == "__main__":
    import uvicorn

    host = config.get('app.host', '0.0.0.0')
    port = config.get('app.port', 8000)

    logger.info(f"Starting Financial Decision System API on {host}:{port}")

    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=config.get('app.debug', False),
        log_level="info"
    )
