'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { TrendingUp, BarChart3, Activity, Zap } from 'lucide-react';
import StockSelector from '@/components/StockSelector';
import CointegrationResults from '@/components/CointegrationResults';
import SpreadChart from '@/components/SpreadChart';
import TradingSignals from '@/components/TradingSignals';
import PerformanceMetrics from '@/components/PerformanceMetrics';
import { stockService } from '@/services/api';
import { CointegrationResult, SpreadData, TradingSignal, PerformanceMetrics as PerfMetrics } from '@/types';

export default function Home() {
  const [availableStocks, setAvailableStocks] = useState<string[]>([]);
  const [selectedStocks, setSelectedStocks] = useState({ stock1: '', stock2: '' });
  const [period, setPeriod] = useState('1y');
  const [loading, setLoading] = useState(false);
  
  // Analysis results
  const [cointegrationResult, setCointegrationResult] = useState<CointegrationResult | null>(null);
  const [spreadData, setSpreadData] = useState<SpreadData[]>([]);
  const [tradingSignals, setTradingSignals] = useState<TradingSignal[]>([]);
  const [performance, setPerformance] = useState<PerfMetrics | null>(null);

  useEffect(() => {
    loadAvailableStocks();
  }, []);

  const loadAvailableStocks = async () => {
    try {
      const response = await stockService.getAvailableStocks();
      if (response.success) {
        setAvailableStocks(response.stocks);
      }
    } catch (error) {
      toast.error('Failed to load available stocks');
    }
  };

  const analyzeCointegration = async () => {
    if (!selectedStocks.stock1 || !selectedStocks.stock2) {
      toast.error('Please select two stocks');
      return;
    }

    if (selectedStocks.stock1 === selectedStocks.stock2) {
      toast.error('Please select different stocks');
      return;
    }

    setLoading(true);
    try {
      const response = await stockService.testCointegration(
        selectedStocks.stock1,
        selectedStocks.stock2,
        period
      );

      if (response.success) {
        setCointegrationResult(response.data.cointegration_results);
        setSpreadData(response.data.spread_data);
        
        if (response.data.cointegration_results.is_cointegrated) {
          toast.success('🎉 Stocks are cointegrated!');
        } else {
          toast.error('Stocks are not cointegrated');
        }
      } else {
        toast.error(response.error || 'Analysis failed');
      }
    } catch (error) {
      toast.error('Failed to analyze cointegration');
    } finally {
      setLoading(false);
    }
  };

  const generateTradingSignals = async () => {
    if (!cointegrationResult?.is_cointegrated) {
      toast.error('Please test cointegration first');
      return;
    }

    setLoading(true);
    try {
      const response = await stockService.getTradingSignals(
        selectedStocks.stock1,
        selectedStocks.stock2,
        period
      );

      if (response.success) {
        setTradingSignals(response.data.signals);
        setPerformance(response.data.performance);
        toast.success('Trading signals generated!');
      } else {
        toast.error(response.error || 'Signal generation failed');
      }
    } catch (error) {
      toast.error('Failed to generate signals');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-600 rounded-xl">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              COINTER – Democratizing Pairs Trading
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional pairs trading with statistical arbitrage and real-time market analysis
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Controls Sidebar */}
          <div className="lg:col-span-1">
            <StockSelector
              availableStocks={availableStocks}
              selectedStocks={selectedStocks}
              onStockChange={setSelectedStocks}
              period={period}
              onPeriodChange={setPeriod}
              onAnalyze={analyzeCointegration}
              onGenerateSignals={generateTradingSignals}
              loading={loading}
              canGenerateSignals={!!cointegrationResult?.is_cointegrated}
            />
          </div>

          {/* Results Area */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Cointegration Results */}
            {cointegrationResult && (
              <div className="animate-slide-up">
                <CointegrationResults
                  result={cointegrationResult}
                  stock1={selectedStocks.stock1}
                  stock2={selectedStocks.stock2}
                />
              </div>
            )}

            {/* Spread Chart */}
            {spreadData.length > 0 && (
              <div className="animate-slide-up">
                <SpreadChart
                  spreadData={spreadData}
                  signals={tradingSignals}
                />
              </div>
            )}

            {/* Trading Signals & Performance */}
            {tradingSignals.length > 0 && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-slide-up">
                <TradingSignals signals={tradingSignals} />
                {performance && (
                  <PerformanceMetrics
                    performance={performance}
                    stock1={selectedStocks.stock1}
                    stock2={selectedStocks.stock2}
                  />
                )}
              </div>
            )}

            {/* Welcome State */}
            {!cointegrationResult && (
              <div className="text-center py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  <div className="p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Select Stocks</h3>
                    <p className="text-gray-600 text-sm">Choose two stocks to analyze for cointegration</p>
                  </div>
                  
                  <div className="p-6">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Activity className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Test Cointegration</h3>
                    <p className="text-gray-600 text-sm">Run statistical tests to find trading opportunities</p>
                  </div>
                  
                  <div className="p-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Generate Signals</h3>
                    <p className="text-gray-600 text-sm">Create trading signals based on mean reversion</p>
                  </div>
                </div>
                
                <div className="text-gray-500">
                  <p className="text-lg mb-2">Ready to start trading?</p>
                  <p className="text-sm">Select two stocks from the sidebar to begin your analysis</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
