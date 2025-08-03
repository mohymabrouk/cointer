'use client';

import { CointegrationResult } from '@/types';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface CointegrationResultsProps {result: CointegrationResult;
  stock1: string;
  stock2: string; }

export default function CointegrationResults({ result, stock1, stock2 }: CointegrationResultsProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Cointegration Analysis</h2>
        <div className="flex items-center gap-2">
          {result.is_cointegrated ? (
            <CheckCircleIcon className="w-6 h-6 text-green-500" />
          ) : (
            <XCircleIcon className="w-6 h-6 text-red-500" />
          )}
          <span className={`text-sm font-medium ${
            result.is_cointegrated ? 'text-green-600' : 'text-red-600'
          }`}>
            {result.is_cointegrated ? 'Cointegrated' : 'Not Cointegrated'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <div className="metric-card">
          <div className="text-sm text-gray-600 mb-1">P-Value</div>
          <div className="text-lg font-semibold text-gray-900">
            {result.p_value.toFixed(4)}
          </div>
        </div>

        <div className="metric-card">
          <div className="text-sm text-gray-600 mb-1">Test Statistic</div>
          <div className="text-lg font-semibold text-gray-900">
            {result.coint_statistic.toFixed(4)}
          </div>
        </div>

        <div className="metric-card">
          <div className="text-sm text-gray-600 mb-1">Hedge Ratio (β)</div>
          <div className="text-lg font-semibold text-gray-900">
            {result.beta.toFixed(4)}
          </div>
        </div>

        <div className="metric-card">
          <div className="text-sm text-gray-600 mb-1">ADF P-Value</div>
          <div className="text-lg font-semibold text-gray-900">
            {result.adf_p_value.toFixed(4)}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Critical Values</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-gray-600">1%</div>
            <div className="font-mono font-medium">
              {result.critical_values['1%'].toFixed(3)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-600">5%</div>
            <div className="font-mono font-medium">
              {result.critical_values['5%'].toFixed(3)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-600">10%</div>
            <div className="font-mono font-medium">
              {result.critical_values['10%'].toFixed(3)}
            </div>
          </div>
        </div>
      </div>

      {result.is_cointegrated && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Trading Strategy:</strong> For every 1 share of {stock1}, 
            hold {Math.abs(result.beta).toFixed(4)} shares of {stock2} to maintain the hedge ratio.
          </p>
        </div>
      )}
    </div>
  );
}
