import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta

class DataHandler:
    def __init__(self):
        self.available_stocks = [
            'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX',
            'JPM', 'BAC', 'WFC', 'C', 'GS', 'MS',
            'XOM', 'CVX', 'COP', 'SLB',
            'JNJ', 'PFE', 'MRK', 'ABBV', 'UNH',
            'KO', 'PEP', 'WMT', 'HD', 'MCD','BRK-B','BRK-A'
        ]

    def get_available_stocks(self):
        return self.available_stocks

    def get_stock_data(self, symbol, period='1y'):
        try:
            ticker = yf.Ticker(symbol)
            data = ticker.history(period=period)

            if data.empty:
                return None

            data.reset_index(inplace=True)
            result = pd.DataFrame({
                'Date': data['Date'],
                'Close': data['Close']
            })

            return result

        except Exception as e:
            print(f"Error fetching {symbol}: {str(e)}")
            return None

    def align_data(self, data1, data2):
        merged = pd.merge(data1, data2, on='Date', how='inner', suffixes=('_1', '_2'))

        aligned_data1 = pd.DataFrame({
            'Date': merged['Date'],
            'Close': merged['Close_1']
        })

        aligned_data2 = pd.DataFrame({
            'Date': merged['Date'],
            'Close': merged['Close_2']
        })

        return aligned_data1, aligned_data2