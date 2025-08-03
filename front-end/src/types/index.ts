export interface StockData {
  Date: string;
  Close: number;
}

export interface CointegrationResult {
  is_cointegrated: boolean;
  p_value: number;
  coint_statistic: number;
  beta: number;
  alpha: number;
  critical_values: {
    '1%': number;
    '5%': number;
    '10%': number;
  };
  adf_statistic: number;
  adf_p_value: number;
}

export interface SpreadData {
  Date: string;
  spread: number;
  z_score: number;
}

export interface TradingSignal {
  Date: string;
  signal: number;
  position: number;
  z_score: number;
  trade_reason: string;
}

export interface PerformanceMetrics {
  total_return: number;
  annualized_return: number;
  volatility: number;
  sharpe_ratio: number;
  max_drawdown: number;
  win_rate: number;
  num_trades: number;
  cumulative_returns: Array<{Date: string; cumulative_return: number}>;
}
