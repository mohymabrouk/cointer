'use client';

import { TradingSignal } from '@/types';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/outline';

interface TradingSignalsProps {
  signals: TradingSignal[];
}

export default function TradingSignals({ signals }: TradingSignalsProps) {
  const recentSignals = signals
    .filter(signal => signal.signal !== 0)
    .slice(-8)
    .reverse();

  const getSignalIcon = (signal: number) => {
    if (signal > 0) return <ArrowUpIcon className="w-4 h-4 text-green-600" />;
    if (signal < 0) return <ArrowDownIcon className="w-4 h-4 text-red-600" />;
    return <MinusIcon className="w-4 h-4 text-gray-400" />;
  };

  const getSignalColor = (signal: number) => {
    if (signal > 0) return 'bg-green-100 text-green-800';
    if (signal < 0) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-600';
  };

  const getSignalText = (signal: number) => {
    if (signal > 0) return 'LONG';
    if (signal < 0) return 'SHORT';
    return 'CLOSE';
  };

  const totalSignals = signals.filter(s => s.signal !== 0).length;
  const longSignals = signals.filter(s => s.signal > 0).length;
  const shortSignals = signals.filter(s => s.signal < 0).length;

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Trading Signals</h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="metric-card text-center">
          <div className="text-2xl font-bold text-blue-600">{totalSignals}</div>
          <div className="text-sm text-gray-600">Total Signals</div>
        </div>
        <div className="metric-card text-center">
          <div className="text-2xl font-bold text-green-600">{longSignals}</div>
          <div className="text-sm text-gray-600">Long Signals</div>
        </div>
        <div className="metric-card text-center">
          <div className="text-2xl font-bold text-red-600">{shortSignals}</div>
          <div className="text-sm text-gray-600">Short Signals</div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Signals</h3>
        <div className="space-y-2">
          {recentSignals.map((signal, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getSignalIcon(signal.signal)}
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(signal.Date).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-600">
                    Z-Score: {signal.z_score?.toFixed(3)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSignalColor(signal.signal)}`}>
                  {getSignalText(signal.signal)}
                </span>
              </div>
            </div>
          ))}
          
          {recentSignals.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No recent trading signals
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
