import numpy as np
import pandas as pd

class TradingStrategy:
    def _convert_numpy_types(self, obj):
        if isinstance(obj, dict):
            return {key: self._convert_numpy_types(value) for key, value in obj.items()}
        elif isinstance(obj, (list, tuple)):
            return [self._convert_numpy_types(item) for item in obj]
        elif isinstance(obj, np.bool_):
            return bool(obj)
        elif isinstance(obj, (np.int64, np.int32, np.int16, np.int8)):
            return int(obj)
        elif isinstance(obj, (np.float64, np.float32)):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        else:
            return obj

    def generate_signals(self, spread_data, entry_threshold=2.0, exit_threshold=0.5):

        if isinstance(spread_data, list):
            signals = pd.DataFrame(spread_data)
        else:
            signals = spread_data.copy()

        signals['signal'] = 0
        signals['position'] = 0
        signals['trade_reason'] = ''

        current_position = 0

        for i in range(len(signals)):
            z_score = signals.iloc[i]['z_score']

            if current_position == 0:
                if z_score > entry_threshold:
                    signals.iloc[i, signals.columns.get_loc('signal')] = -1
                    signals.iloc[i, signals.columns.get_loc('position')] = -1
                    signals.iloc[i, signals.columns.get_loc('trade_reason')] = f'Short spread (z={z_score:.2f})'
                    current_position = -1
                elif z_score < -entry_threshold:
                    signals.iloc[i, signals.columns.get_loc('signal')] = 1
                    signals.iloc[i, signals.columns.get_loc('position')] = 1
                    signals.iloc[i, signals.columns.get_loc('trade_reason')] = f'Long spread (z={z_score:.2f})'
                    current_position = 1

            elif current_position != 0:
                if abs(z_score) < exit_threshold:
                    signals.iloc[i, signals.columns.get_loc('signal')] = -current_position
                    signals.iloc[i, signals.columns.get_loc('position')] = 0
                    signals.iloc[i, signals.columns.get_loc('trade_reason')] = f'Close position (z={z_score:.2f})'
                    current_position = 0
                else:
                    signals.iloc[i, signals.columns.get_loc('position')] = current_position

        result = signals.to_dict('records')
        return self._convert_numpy_types(result)

    def calculate_performance(self, data1, data2, signals, beta):
        merged = pd.merge(data1, data2, on='Date', how='inner', suffixes=('_1', '_2'))

        if isinstance(signals, list):
            signals_df = pd.DataFrame(signals)
        else:
            signals_df = signals

        merged = pd.merge(merged, signals_df[['Date', 'position']], on='Date', how='inner')

        merged['return_1'] = merged['Close_1'].pct_change()
        merged['return_2'] = merged['Close_2'].pct_change()

        merged['spread_return'] = merged['return_2'] - beta * merged['return_1']
        merged['strategy_return'] = merged['position'].shift(1) * merged['spread_return']

        merged = merged.dropna()
        merged['cumulative_return'] = (1 + merged['strategy_return']).cumprod()

        total_return = float(merged['cumulative_return'].iloc[-1] - 1)
        annualized_return = float((1 + total_return) ** (252 / len(merged)) - 1)
        volatility = float(merged['strategy_return'].std() * np.sqrt(252))
        sharpe_ratio = float(annualized_return / volatility if volatility > 0 else 0)

        peak = merged['cumulative_return'].expanding(min_periods=1).max()
        drawdown = (merged['cumulative_return'] - peak) / peak
        max_drawdown = float(drawdown.min())

        profitable_trades = merged[merged['strategy_return'] > 0]
        win_rate = float(len(profitable_trades) / len(merged[merged['strategy_return'] != 0]) if len(merged[merged['strategy_return'] != 0]) > 0 else 0)

        performance = {
            'total_return': total_return,
            'annualized_return': annualized_return,
            'volatility': volatility,
            'sharpe_ratio': sharpe_ratio,
            'max_drawdown': max_drawdown,
            'win_rate': win_rate,
            'num_trades': int(len(merged[merged['position'].shift(1) != merged['position']])),
            'cumulative_returns': merged[['Date', 'cumulative_return']].to_dict('records')
        }

        return self._convert_numpy_types(performance)

    def run_backtest(self, data1, data2, initial_capital=100000):
        from cointegration import CointegrationAnalysis

        coint_analyzer = CointegrationAnalysis()

        coint_results = coint_analyzer.test_cointegration(data1, data2)

        if not coint_results['is_cointegrated']:
            return {'error': 'Stocks not cointegrated'}

        spread_data = coint_analyzer.calculate_spread(data1, data2, coint_results['beta'])
        signals = self.generate_signals(spread_data)
        performance = self.calculate_performance(data1, data2, signals, coint_results['beta'])

        final_capital = float(initial_capital * (1 + performance['total_return']))

        result = {
            'cointegration_results': coint_results,
            'performance_metrics': performance,
            'initial_capital': float(initial_capital),
            'final_capital': final_capital,
            'profit_loss': float(final_capital - initial_capital),
            'signals_count': int(len([s for s in signals if s['signal'] != 0]))
        }

        return self._convert_numpy_types(result)