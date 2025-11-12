"""
股票数据获取模块
"""
import yfinance as yf
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import pandas as pd


class StockDataProvider:
    """股票数据提供者"""

    def __init__(self):
        pass

    async def get_stock_info(self, symbol: str, market: str = "US") -> Dict[str, Any]:
        """
        获取股票基本信息

        Args:
            symbol: 股票代码
            market: 市场 (US, CN, HK)

        Returns:
            股票信息字典
        """
        try:
            # 标准化股票代码
            ticker_symbol = self._normalize_symbol(symbol, market)

            # 使用 yfinance 获取数据
            ticker = yf.Ticker(ticker_symbol)
            info = ticker.info

            return {
                'symbol': symbol,
                'name': info.get('longName', symbol),
                'sector': info.get('sector', 'N/A'),
                'industry': info.get('industry', 'N/A'),
                'market_cap': info.get('marketCap', 0),
                'current_price': info.get('currentPrice', info.get('regularMarketPrice', 0)),
                'previous_close': info.get('previousClose', 0),
                'open': info.get('open', 0),
                'high': info.get('dayHigh', 0),
                'low': info.get('dayLow', 0),
                'volume': info.get('volume', 0),
                'pe_ratio': info.get('trailingPE', 0),
                'eps': info.get('trailingEps', 0),
                'dividend_yield': info.get('dividendYield', 0),
                '52_week_high': info.get('fiftyTwoWeekHigh', 0),
                '52_week_low': info.get('fiftyTwoWeekLow', 0),
                'description': info.get('longBusinessSummary', ''),
            }
        except Exception as e:
            raise Exception(f"Failed to fetch stock info for {symbol}: {str(e)}")

    async def get_historical_data(
        self,
        symbol: str,
        market: str = "US",
        period: str = "1mo",
        interval: str = "1d"
    ) -> pd.DataFrame:
        """
        获取历史价格数据

        Args:
            symbol: 股票代码
            market: 市场
            period: 时间周期 (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
            interval: 数据间隔 (1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo)

        Returns:
            历史数据 DataFrame
        """
        try:
            ticker_symbol = self._normalize_symbol(symbol, market)
            ticker = yf.Ticker(ticker_symbol)
            hist = ticker.history(period=period, interval=interval)
            return hist
        except Exception as e:
            raise Exception(f"Failed to fetch historical data for {symbol}: {str(e)}")

    async def get_technical_indicators(
        self,
        symbol: str,
        market: str = "US"
    ) -> Dict[str, Any]:
        """
        计算技术指标

        Args:
            symbol: 股票代码
            market: 市场

        Returns:
            技术指标字典
        """
        try:
            # 获取历史数据
            hist = await self.get_historical_data(symbol, market, period="3mo")

            if hist.empty:
                return {}

            # 计算简单移动平均线
            hist['SMA_20'] = hist['Close'].rolling(window=20).mean()
            hist['SMA_50'] = hist['Close'].rolling(window=50).mean()

            # 计算 RSI
            delta = hist['Close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            hist['RSI'] = 100 - (100 / (1 + rs))

            # 获取最新值
            latest = hist.iloc[-1]
            current_price = latest['Close']

            return {
                'current_price': float(current_price),
                'sma_20': float(latest['SMA_20']) if not pd.isna(latest['SMA_20']) else None,
                'sma_50': float(latest['SMA_50']) if not pd.isna(latest['SMA_50']) else None,
                'rsi': float(latest['RSI']) if not pd.isna(latest['RSI']) else None,
                'volume': int(latest['Volume']),
                'price_change': float(current_price - hist.iloc[-2]['Close']) if len(hist) > 1 else 0,
                'price_change_pct': float((current_price - hist.iloc[-2]['Close']) / hist.iloc[-2]['Close'] * 100) if len(hist) > 1 else 0,
            }
        except Exception as e:
            raise Exception(f"Failed to calculate technical indicators for {symbol}: {str(e)}")

    def _normalize_symbol(self, symbol: str, market: str) -> str:
        """
        标准化股票代码

        Args:
            symbol: 原始股票代码
            market: 市场

        Returns:
            标准化后的股票代码
        """
        symbol = symbol.upper().strip()

        if market == "US":
            return symbol
        elif market == "CN":
            # A股需要添加后缀
            if symbol.startswith('6'):
                return f"{symbol}.SS"  # 上海
            elif symbol.startswith('0') or symbol.startswith('3'):
                return f"{symbol}.SZ"  # 深圳
            else:
                return symbol
        elif market == "HK":
            # 港股
            if not symbol.endswith('.HK'):
                # 去掉前导零，添加 .HK
                symbol_num = symbol.replace('.HK', '').lstrip('0')
                return f"{symbol_num.zfill(4)}.HK"
            return symbol
        else:
            return symbol


# 全局实例
_stock_data_provider: Optional[StockDataProvider] = None


def get_stock_data_provider() -> StockDataProvider:
    """获取全局股票数据提供者实例"""
    global _stock_data_provider
    if _stock_data_provider is None:
        _stock_data_provider = StockDataProvider()
    return _stock_data_provider
