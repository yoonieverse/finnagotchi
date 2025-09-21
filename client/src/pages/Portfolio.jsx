import { useState } from 'react';
import TradingViewWidget from "../components/TradingViewWidget";

export function Portfolio() {
  const [portfolioData] = useState({
    totalValue: 12540.50,
    dayChange: 245.30,
    dayChangePercent: 1.99,
    totalReturn: 1540.50,
    totalReturnPercent: 14.02
  });

  const [holdings] = useState([
    { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', shares: 25, price: 425.30, value: 10632.50, change: 1.2, changePercent: 0.28 },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust', shares: 15, price: 380.45, value: 5706.75, change: 2.1, changePercent: 0.55 },
    { symbol: 'AAPL', name: 'Apple Inc.', shares: 5, price: 180.25, value: 901.25, change: -0.5, changePercent: -0.28 },
    { symbol: 'MSFT', name: 'Microsoft Corporation', shares: 3, price: 350.80, value: 1052.40, change: 1.8, changePercent: 0.52 },
    { symbol: 'TSLA', name: 'Tesla Inc.', shares: 2, price: 250.60, value: 501.20, change: 3.2, changePercent: 1.29 }
  ]);

  const [recentTrades] = useState([
    { symbol: 'VOO', action: 'Buy', shares: 5, price: 420.15, date: '2024-01-15', total: 2100.75 },
    { symbol: 'QQQ', action: 'Sell', shares: 3, price: 375.20, date: '2024-01-12', total: 1125.60 },
    { symbol: 'AAPL', action: 'Buy', shares: 2, price: 185.30, date: '2024-01-10', total: 370.60 },
    { symbol: 'MSFT', action: 'Buy', shares: 1, price: 345.90, date: '2024-01-08', total: 345.90 }
  ]);

  return (
    <div className="page">
      <div className="container-wide">
        {/* Header Section */}
        <div className="page-header">
          <h1 className="page-title">Portfolio Dashboard</h1>
          <p className="page-subtitle">Track your investments and market performance</p>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-4 gap-xl mb-2xl">
          <div className="card hover:scale-105 transition">
            <div className="flex-between mb-md">
              <h3 className="text-lg font-semibold text-gray-600">Total Value</h3>
              <div className="text-3xl">💰</div>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-sm">${portfolioData.totalValue.toLocaleString()}</div>
            <div className="flex gap-sm">
              <span className={`text-sm font-medium ${portfolioData.dayChange >= 0 ? 'text-success' : 'text-error'}`}>
                {portfolioData.dayChange >= 0 ? '+' : ''}${portfolioData.dayChange.toFixed(2)}
              </span>
              <span className={`text-sm ${portfolioData.dayChangePercent >= 0 ? 'text-success' : 'text-error'}`}>
                ({portfolioData.dayChangePercent >= 0 ? '+' : ''}{portfolioData.dayChangePercent}%)
              </span>
            </div>
          </div>

          <div className="card hover:scale-105 transition">
            <div className="flex-between mb-md">
              <h3 className="text-lg font-semibold text-gray-600">Total Return</h3>
              <div className="text-3xl">📈</div>
            </div>
            <div className="text-3xl font-bold text-success mb-sm">+${portfolioData.totalReturn.toLocaleString()}</div>
            <div className="text-sm text-success font-medium">
              +{portfolioData.totalReturnPercent}% overall
            </div>
          </div>

          <div className="card hover:scale-105 transition">
            <div className="flex-between mb-md">
              <h3 className="text-lg font-semibold text-gray-600">Holdings</h3>
              <div className="text-3xl">📊</div>
            </div>
            <div className="text-3xl font-bold text-primary mb-sm">{holdings.length}</div>
            <div className="text-sm text-gray-600">Different assets</div>
          </div>

          <div className="card hover:scale-105 transition">
            <div className="flex-between mb-md">
              <h3 className="text-lg font-semibold text-gray-600">Best Performer</h3>
              <div className="text-3xl">🏆</div>
            </div>
            <div className="text-2xl font-bold text-accent mb-sm">TSLA</div>
            <div className="text-sm text-success font-medium">+1.29% today</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-3 gap-xl mb-2xl">
          {/* Holdings Table - Takes 2 columns */}
          <div className="card" style={{gridColumn: 'span 2'}}>
            <h3 className="text-2xl font-bold text-gray-800 mb-lg">Current Holdings</h3>
            <div className="space-y-md">
              {holdings.map((holding, index) => (
                <div key={index} className="flex-between p-lg bg-gradient-card rounded-2xl hover:shadow-lg transition">
                  <div className="flex gap-md">
                    <div className="icon icon-primary">
                      <span className="text-xl font-bold text-primary">{holding.symbol.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 text-lg">{holding.symbol}</div>
                      <div className="text-sm text-gray-600">{holding.name}</div>
                      <div className="text-xs text-gray-500">{holding.shares} shares</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-800 text-lg">${holding.value.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">${holding.price.toFixed(2)} per share</div>
                    <div className={`text-sm font-medium ${holding.change >= 0 ? 'text-success' : 'text-error'}`}>
                      {holding.change >= 0 ? '+' : ''}${holding.change.toFixed(2)} ({holding.changePercent >= 0 ? '+' : ''}{holding.changePercent}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Trades */}
          <div className="card">
            <h3 className="text-2xl font-bold text-gray-800 mb-lg">Recent Trades</h3>
            <div className="space-y-md">
              {recentTrades.map((trade, index) => (
                <div key={index} className="p-md bg-gray-50 rounded-xl">
                  <div className="flex-between mb-sm">
                    <div className="font-bold text-gray-800">{trade.symbol}</div>
                    <span className={`status-indicator ${
                      trade.action === 'Buy' ? 'status-success' : 'status-error'
                    }`}>
                      {trade.action}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-sm">
                    {trade.shares} shares @ ${trade.price.toFixed(2)}
                  </div>
                  <div className="flex-between text-sm">
                    <span className="text-gray-500">{new Date(trade.date).toLocaleDateString()}</span>
                    <span className="font-medium text-gray-800">${trade.total.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trading View Widget */}
        <div className="card mb-2xl">
          <h3 className="text-2xl font-bold text-gray-800 mb-lg">Market Overview</h3>
          <div className="rounded-2xl overflow-hidden">
            <TradingViewWidget />
          </div>
        </div>

        {/* Performance Charts Section */}
        <div className="grid grid-2 gap-xl">
          <div className="card">
            <h3 className="text-2xl font-bold text-gray-800 mb-lg">Asset Allocation</h3>
            <div className="space-y-md">
              {holdings.map((holding, index) => {
                const percentage = (holding.value / portfolioData.totalValue) * 100;
                return (
                  <div key={index} className="space-y-sm">
                    <div className="flex-between">
                      <span className="font-medium text-gray-700">{holding.symbol}</span>
                      <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <h3 className="text-2xl font-bold text-gray-800 mb-lg">Quick Actions</h3>
            <div className="space-y-md">
              <button className="btn btn-primary w-full">
                📈 Buy Stock
              </button>
              <button className="btn btn-error w-full">
                📉 Sell Stock
              </button>
              <button className="btn btn-success w-full">
                💰 Add Funds
              </button>
              <button className="btn btn-secondary w-full">
                📊 View Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
