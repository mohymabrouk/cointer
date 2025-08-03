from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
from datetime import datetime
import logging
from data_handler import DataHandler
from cointegration import CointegrationAnalysis
from strategy import TradingStrategy

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

data_handler = DataHandler()
cointegration_analyzer = CointegrationAnalysis()
trading_strategy = TradingStrategy()

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    })

@app.route('/api/stocks', methods=['GET'])
def get_available_stocks():
    try:
        stocks = data_handler.get_available_stocks()
        return jsonify({
            "success": True,
            "stocks": stocks
        })
    except Exception as e:
        logger.error(f"Error getting stocks: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/cointegration-test', methods=['POST'])
def test_cointegration():
    try:
        data = request.get_json()
        stock1 = data.get('stock1')
        stock2 = data.get('stock2')
        period = data.get('period', '1y')

        if not stock1 or not stock2:
            return jsonify({"success": False, "error": "Both stocks required"}), 400

        if stock1 == stock2:
            return jsonify({"success": False, "error": "Select different stocks"}), 400

        logger.info(f"Testing cointegration for {stock1} and {stock2}")

        prices1 = data_handler.get_stock_data(stock1, period)
        prices2 = data_handler.get_stock_data(stock2, period)

        if prices1 is None or prices2 is None:
            return jsonify({"success": False, "error": "Failed to fetch data"}), 400

        results = cointegration_analyzer.test_cointegration(prices1, prices2)

        spread_data = cointegration_analyzer.calculate_spread(
            prices1, prices2, results['beta']
        )

        response_data = {
            "success": True,
            "data": {
                "cointegration_results": results,
                "spread_data": spread_data,
                "stock1_data": prices1.to_dict('records'),
                "stock2_data": prices2.to_dict('records')
            }
        }

        return jsonify(response_data)

    except Exception as e:
        logger.error(f"Error in cointegration test: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/trading-signals', methods=['POST'])
def get_trading_signals():
    try:
        data = request.get_json()
        stock1 = data.get('stock1')
        stock2 = data.get('stock2')
        period = data.get('period', '1y')
        entry_threshold = data.get('entry_threshold', 2.0)
        exit_threshold = data.get('exit_threshold', 0.5)

        logger.info(f"Generating trading signals for {stock1} and {stock2}")

        prices1 = data_handler.get_stock_data(stock1, period)
        prices2 = data_handler.get_stock_data(stock2, period)

        if prices1 is None or prices2 is None:
            return jsonify({"success": False, "error": "Failed to fetch stock data"}), 400

        coint_results = cointegration_analyzer.test_cointegration(prices1, prices2)

        if not coint_results['is_cointegrated']:
            return jsonify({"success": False, "error": "Stocks not cointegrated"}), 400

        spread_data = cointegration_analyzer.calculate_spread(
            prices1, prices2, coint_results['beta']
        )

        logger.info(f"Spread data length: {len(spread_data)}")

        signals = trading_strategy.generate_signals(
            spread_data, entry_threshold, exit_threshold
        )

        logger.info(f"Generated {len(signals)} signal records")

        performance = trading_strategy.calculate_performance(
            prices1, prices2, signals, coint_results['beta']
        )

        logger.info("Performance calculated successfully")

        spreads = [item['spread'] for item in spread_data]
        z_scores = [item['z_score'] for item in spread_data]

        spread_stats = {
            'mean': float(np.mean(spreads)),
            'std': float(np.std(spreads)),
            'current_zscore': float(z_scores[-1]) if z_scores else 0.0
        }

        response_data = {
            "success": True,
            "data": {
                "signals": signals,
                "performance": performance,
                "spread_stats": spread_stats
            }
        }

        return jsonify(response_data)

    except Exception as e:
        logger.error(f"Error in trading signals: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/backtest', methods=['POST'])
def run_backtest():
    try:
        data = request.get_json()
        stock1 = data.get('stock1')
        stock2 = data.get('stock2')
        period = data.get('period', '2y')
        initial_capital = data.get('initial_capital', 100000)

        logger.info(f"Running backtest for {stock1} and {stock2}")

        prices1 = data_handler.get_stock_data(stock1, period)
        prices2 = data_handler.get_stock_data(stock2, period)

        if prices1 is None or prices2 is None:
            return jsonify({"success": False, "error": "Failed to fetch stock data"}), 400

        results = trading_strategy.run_backtest(prices1, prices2, initial_capital)

        response_data = {
            "success": True,
            "data": results
        }

        return jsonify(response_data)

    except Exception as e:
        logger.error(f"Error in backtest: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)