import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const stockService = {
  async getAvailableStocks() {
    const response = await api.get('/stocks');
    return response.data;
  },

  async testCointegration(stock1: string, stock2: string, period: string = '1y') {
    const response = await api.post('/cointegration-test', {
      stock1,
      stock2,
      period
    });
    return response.data;
  },

  async getTradingSignals(stock1: string, stock2: string, period: string = '1y') {
    const response = await api.post('/trading-signals', {
      stock1,
      stock2,
      period
    });
    return response.data;
  },

  async runBacktest(stock1: string, stock2: string, period: string = '2y', initialCapital: number = 100000) {
    const response = await api.post('/backtest', {
      stock1,
      stock2,
      period,
      initial_capital: initialCapital
    });
    return response.data;
  }
};
