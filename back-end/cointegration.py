import numpy as np
import pandas as pd
from statsmodels.tsa.stattools import coint, adfuller
from sklearn.linear_model import LinearRegression
import warnings
warnings.filterwarnings('ignore')

class CointegrationAnalysis:
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

    def test_cointegration(self, data1, data2, significance_level=0.05):
        merged = pd.merge(data1, data2, on='Date', how='inner', suffixes=('_1', '_2'))

        if len(merged) < 30:
            raise ValueError("Insufficient data points")

        prices1 = merged['Close_1'].values
        prices2 = merged['Close_2'].values

        log_prices1 = np.log(prices1)
        log_prices2 = np.log(prices2)

        coint_stat, p_value, critical_values = coint(log_prices1, log_prices2)

        X = log_prices1.reshape(-1, 1)
        y = log_prices2

        model = LinearRegression()
        model.fit(X, y)
        beta = float(model.coef_[0])
        alpha = float(model.intercept_)

        residuals = y - (alpha + beta * log_prices1)

        adf_stat, adf_p_value, _, _, adf_critical_values, _ = adfuller(residuals)

        results = {
            'is_cointegrated': bool(p_value < significance_level),  
            'coint_statistic': float(coint_stat),
            'p_value': float(p_value),
            'critical_values': {
                '1%': float(critical_values[0]),
                '5%': float(critical_values[1]),
                '10%': float(critical_values[2])
            },
            'beta': float(beta),
            'alpha': float(alpha),
            'adf_statistic': float(adf_stat),
            'adf_p_value': float(adf_p_value),
            'residuals_mean': float(np.mean(residuals)),
            'residuals_std': float(np.std(residuals))
        }

        return self._convert_numpy_types(results)

    def calculate_spread(self, data1, data2, beta):
        merged = pd.merge(data1, data2, on='Date', how='inner', suffixes=('_1', '_2'))

        log_prices1 = np.log(merged['Close_1'])
        log_prices2 = np.log(merged['Close_2'])

        spread = log_prices2 - beta * log_prices1

        spread_mean = float(spread.mean())
        spread_std = float(spread.std())
        z_score = (spread - spread_mean) / spread_std

        result = pd.DataFrame({
            'Date': merged['Date'],
            'spread': spread,
            'z_score': z_score,
            'spread_mean': spread_mean,
            'spread_std': spread_std
        })

        result_dict = result.to_dict('records')
        return self._convert_numpy_types(result_dict)