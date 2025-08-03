'use client';

import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/outline';

interface StockSelectorProps {
  availableStocks: string[];
  selectedStocks: { stock1: string; stock2: string };
  onStockChange: (stocks: { stock1: string; stock2: string }) => void;
  period: string;
  onPeriodChange: (period: string) => void;
  onAnalyze: () => void;
  onGenerateSignals: () => void;
  loading: boolean;
  canGenerateSignals: boolean;
}

const periods = [
  { value: '6mo', label: '6 Months' },
  { value: '1y', label: '1 Year' },
  { value: '2y', label: '2 Years' },
  { value: '5y', label: '5 Years' },
];

export default function StockSelector({
  availableStocks,
  selectedStocks,
  onStockChange,
  period,
  onPeriodChange,
  onAnalyze,
  onGenerateSignals,
  loading,
  canGenerateSignals
}: StockSelectorProps) {
  
  const StockSelect = ({ value, onChange, label, disabled = [] }: any) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <Listbox.Button className="select-field w-full text-left">
            <span className={value ? "text-gray-900" : "text-gray-500"}>
              {value || "Select stock"}
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
            </span>
          </Listbox.Button>
          
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              {availableStocks.map((stock) => (
                <Listbox.Option
                  key={stock}
                  value={stock}
                  disabled={disabled.includes(stock)}
                  className={({ active, disabled }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {stock}
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                          <CheckIcon className="h-5 w-5" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );

  return (
    <div className="card space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Stock Selection</h2>
        <p className="text-sm text-gray-600">Choose two stocks for pairs trading analysis</p>
      </div>

      <div className="space-y-4">
        <StockSelect
          value={selectedStocks.stock1}
          onChange={(value: string) => onStockChange({ ...selectedStocks, stock1: value })}
          label="First Stock"
          disabled={selectedStocks.stock2 ? [selectedStocks.stock2] : []}
        />

        <StockSelect
          value={selectedStocks.stock2}
          onChange={(value: string) => onStockChange({ ...selectedStocks, stock2: value })}
          label="Second Stock"
          disabled={selectedStocks.stock1 ? [selectedStocks.stock1] : []}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Analysis Period
          </label>
          <select
            value={period}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="select-field"
          >
            {periods.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={onAnalyze}
          disabled={loading || !selectedStocks.stock1 || !selectedStocks.stock2}
          className="btn-primary w-full"
        >
          {loading ? 'Analyzing...' : 'Test Cointegration'}
        </button>

        <button
          onClick={onGenerateSignals}
          disabled={loading || !canGenerateSignals}
          className="btn-secondary w-full"
        >
          {loading ? 'Generating...' : 'Generate Trading Signals'}
        </button>
      </div>

      <div className="text-xs text-gray-500 leading-relaxed">
        <p className="mb-2">
          <strong>How it works:</strong>
        </p>
        <ol className="space-y-1 ml-3">
          <li>1. Select two correlated stocks</li>
          <li>2. Test for statistical cointegration</li>
          <li>3. Generate mean-reversion signals</li>
          <li>4. Analyze performance metrics</li>
        </ol>
      </div>
    </div>
  );
}
