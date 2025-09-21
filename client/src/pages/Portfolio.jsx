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
          <div className="flex-center gap-lg mb-lg">
            <h1 className="page-title">Market Overview</h1>
            <img 
              src="/src/assets/shrimp.gif" 
              alt="Shrimp" 
              style={{
                width: '100px',
                height: '100px',
                animation: 'float 2s ease-in-out infinite'
              }}
            />
          </div>
         
        </div>

        {/* Market Overview - Only section kept */}
        <div className="card">
          <div className="rounded-2xl overflow-hidden" style={{height: '600px'}}>
            <TradingViewWidget />
          </div>
        </div>

      </div>
    </div>
  );
}
