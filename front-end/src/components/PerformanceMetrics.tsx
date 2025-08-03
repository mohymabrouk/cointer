'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PerformanceMetrics as PerfMetrics } from '@/types';

interface PerformanceMetricsProps {
  performance: PerfMetrics;
  stock1: string;
  stock2: string;
}

export default function PerformanceMetrics({ performance, stock1, stock2 }: PerformanceMetricsProps) {
  const formatPercentage = (value: number) => `${(value * 100).toFixed(2)}%`;
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const chartData = performance.cumulative_returns.map(item => ({
    ...item,
    date_formatted: formatDate(item.Date),
    return_pct: (item.cumulative_return - 1) * 100
  }));

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Strategy Performance</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="metric-card text-center">
          <div className={`text-2xl font-bold ${
            performance.total_return >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatPercentage(performance.total_return)}
          </div>
          <div className="text-sm text-gray-600">Total Return</div>
        </div>
        
        <div className="metric-card text-center">
          <div className={`text-2xl font-bold ${
            performance.sharpe_ratio >= 1 ? 'text-green-600' : 
            performance.sharpe_ratio >= 0.5 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {performance.sharpe_ratio.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Sharpe Ratio</div>
        </div>
        
        <div className="metric-card text-center">
          <div className="text-2xl font-bold text-blue-600">
            {formatPercentage(performance.volatility)}
          </div>
          <div className="text-sm text-gray-600">Volatility</div>
        </div>
        
        <div className="metric-card text-center">
          <div className="text-2xl font-bold text-red-600">
            {formatPercentage(Math.abs(performance.max_drawdown))}
          </div>
          <div className="text-sm text-gray-600">Max Drawdown</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
        <div className="text-center">
          <div className="text-gray-600">Annual Return</div>
          <div className="font-semibold">{formatPercentage(performance.annualized_return)}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-600">Win Rate</div>
          <div className="font-semibold">{formatPercentage(performance.win_rate)}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-600">Total Trades</div>
          <div className="font-semibold">{performance.num_trades}</div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Cumulative Returns</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="date_formatted" 
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickFormatter={(value) => `${value.toFixed(1)}%`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
                formatter={(value: any) => [`${value.toFixed(2)}%`, 'Return']}
              />
              <Line 
                type="monotone" 
                dataKey="return_pct" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
