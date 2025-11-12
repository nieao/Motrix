"""
测试 Financial Service API
"""
import asyncio
import sys
from core.analyzer import FinancialAnalyzer
from core.utils.logger import get_logger


async def test_analysis():
    """测试股票分析"""
    logger = get_logger()
    analyzer = FinancialAnalyzer()

    print("=" * 60)
    print("Financial Decision System - Test Script")
    print("=" * 60)

    # 测试配置
    test_cases = [
        {
            "symbol": "AAPL",
            "market": "US",
            "depth": 3,
            "agents": ["market", "fundamental"]
        }
    ]

    for test_case in test_cases:
        print(f"\n📊 Testing: {test_case['symbol']} ({test_case['market']})")
        print("-" * 60)

        try:
            result = await analyzer.analyze(**test_case)

            print("\n✅ Analysis completed successfully!")
            print(f"\n📈 Stock: {result['symbol']}")
            print(f"💰 Action: {result['decision']['action']}")
            print(f"📊 Confidence: {result['decision']['confidence'] * 100:.1f}%")
            print(f"⚠️  Risk Score: {result['decision']['risk_score'] * 100:.1f}%")
            print(f"🎯 Target Price: ${result['decision'].get('target_price', 'N/A')}")
            print(f"\n📝 Reasoning:")
            print(result['decision']['reasoning'])

            print("\n" + "=" * 60)
            return True

        except Exception as e:
            print(f"\n❌ Analysis failed: {str(e)}")
            logger.error(f"Test failed: {str(e)}")
            return False


async def main():
    """主函数"""
    print("\n🔍 Checking configuration...")

    # 检查环境变量
    import os
    from dotenv import load_dotenv
    load_dotenv()

    required_vars = ['DASHSCOPE_API_KEY']  # 最少需要一个 LLM API key
    missing_vars = [var for var in required_vars if not os.getenv(var)]

    if missing_vars:
        print(f"\n⚠️  Warning: Missing environment variables: {', '.join(missing_vars)}")
        print("Please configure API keys in .env file")
        print("\nExample .env file:")
        print("DASHSCOPE_API_KEY=your_api_key_here")
        return

    print("✅ Configuration OK")

    # 运行测试
    success = await test_analysis()

    if success:
        print("\n✅ All tests passed!")
        sys.exit(0)
    else:
        print("\n❌ Tests failed!")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
