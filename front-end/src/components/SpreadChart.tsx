'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { SpreadData, TradingSignal } from '@/types';

interface SpreadChartProps {
  spreadData: SpreadData[];
  signals: TradingSignal[];
}

export default function SpreadChart({ spreadData, signals }: SpreadChartProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const chartData = spreadData.map((item, index) => {
    const signal = signals[index];
    return {
      ...item,
      date_formatted: formatDate(item.Date),
      signal_type: signal ? 
        (signal.signal > 0 ? 'BUY' : signal.signal < 0 ? 'SELL' : null) : null
    };
  });

  const currentZScore = spreadData[spreadData.length - 1]?.z_score || 0;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Spread Z-Score Analysis</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-gray-600">Current Z-Score: </span>
            <span className={`font-semibold ${
              Math.abs(currentZScore) > 2 ? 'text-red-600' :
              Math.abs(currentZScore) > 1 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {currentZScore.toFixed(3)}
            </span>
          </div>
        </div>
      </div>

      <div className="h-80 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="date_formatted" 
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: any, name: string) => [
                typeof value === 'number' ? value.toFixed(4) : value,
                name === 'z_score' ? 'Z-Score' : name
              ]}
            />
            <Line 
              type="monotone" 
              dataKey="z_score" 
             stroke="#3b82f6" 
              strokeWidth={2}
              dot={false}
              name="Z-Score"
            />
            <ReferenceLine y={2} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1} />
            <ReferenceLine y={-2} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1} /> 
            <ReferenceLine y={0} stroke="#64748b" strokeDasharray="2 2" strokeWidth={1} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="text-gray-600">Entry Threshold</div>
          <div className="font-semibold text-red-600">±2.0</div>
        </div>
        <div className="text-center">
          <div className="text-gray-600">Exit Threshold</div>
          <div className="font-semibold text-green-600">±0.5</div>
        </div>
        <div className="text-center">
          <div className="text-gray-600">Mean</div>
          <div className="font-mono font-semibold">0.000</div>
        </div>
        <div className="text-center">
          <div className="text-gray-600">Data Points</div>
          <div className="font-semibold">{spreadData.length}</div>
        </div>
      </div>
    </div>
  );
}
