import { useState, useEffect, useContext } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import axios from 'axios';
import { TransactionContext } from '../contexts/transactionContext';


axios.defaults.baseURL = 'http://localhost:3333';


// Transaction Table Component
const TransactionTable = ({ transactions }) => {
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterCategory, setFilterCategory] = useState('');
  

  // Category mapping to user-friendly names with colors
  const categoryMapping = {
    'INCOME': { name: 'Income', color: 'bg-emerald-100 text-emerald-800', icon: '💰' },
    'TRANSFER_IN': { name: 'Money In', color: 'bg-green-100 text-green-800', icon: '📈' },
    'TRANSFER_OUT': { name: 'Money Out', color: 'bg-orange-100 text-orange-800', icon: '📉' },
    'LOAN_PAYMENTS': { name: 'Debt Payments', color: 'bg-red-100 text-red-800', icon: '🏦' },
    'BANK_FEES': { name: 'Bank Fees', color: 'bg-red-100 text-red-800', icon: '💸' },
    'ENTERTAINMENT': { name: 'Entertainment', color: 'bg-purple-100 text-purple-800', icon: '🎮' },
    'FOOD_AND_DRINK': { name: 'Food & Dining', color: 'bg-yellow-100 text-yellow-800', icon: '🍽️' },
    'GENERAL_MERCHANDISE': { name: 'Personal Spending', color: 'bg-blue-100 text-blue-800', icon: '🛒' },
    'GENERAL_SERVICES': { name: 'Personal Spending', color: 'bg-blue-100 text-blue-800', icon: '🛒' },
    'HOME_IMPROVEMENT': { name: 'Home & Garden', color: 'bg-teal-100 text-teal-800', icon: '🏠' },
    'MEDICAL': { name: 'Healthcare', color: 'bg-rose-100 text-rose-800', icon: '🏥' },
    'PERSONAL_CARE': { name: 'Personal Care', color: 'bg-pink-100 text-pink-800', icon: '💅' },
    'GOVERNMENT_AND_NON_PROFIT': { name: 'Taxes & Donations', color: 'bg-gray-100 text-gray-800', icon: '🏛️' },
    'TRANSPORTATION': { name: 'Transportation', color: 'bg-indigo-100 text-indigo-800', icon: '🚗' },
    'TRAVEL': { name: 'Travel', color: 'bg-sky-100 text-sky-800', icon: '✈️' },
    'RENT_AND_UTILITIES': { name: 'Housing & Utilities', color: 'bg-amber-100 text-amber-800', icon: '🏠' }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get category display info
  const getCategoryInfo = (category) => {
    return categoryMapping[category] || { 
      name: category || 'Other', 
      color: 'bg-gray-100 text-gray-800', 
      icon: '📦' 
    };
  };

  // Helper function to determine if transaction is income
  const isIncomeTransaction = (transaction) => {
    return transaction.personal_finance_category?.primary === 'INCOME';
  };

  // Sort transactions
  const sortedTransactions = [...transactions].sort((a, b) => {
    let aVal, bVal;
    
    switch(sortField) {
      case 'date':
        aVal = new Date(a.date);
        bVal = new Date(b.date);
        break;
      case 'amount':
        aVal = Math.abs(a.amount);
        bVal = Math.abs(b.amount);
        break;
      case 'merchant':
        aVal = (a.merchant_name || a.name || '').toLowerCase();
        bVal = (b.merchant_name || b.name || '').toLowerCase();
        break;
      case 'category':
        aVal = getCategoryInfo(a.personal_finance_category?.primary || '').name;
        bVal = getCategoryInfo(b.personal_finance_category?.primary || '').name;
        break;
      default:
        return 0;
    }
    
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  // Filter transactions by category
  const filteredTransactions = filterCategory 
    ? sortedTransactions.filter(t => getCategoryInfo(t.personal_finance_category?.primary || '').name === filterCategory)
    : sortedTransactions;

  // Get unique categories for filter dropdown
  const uniqueCategories = [...new Set(transactions.map(t => 
    getCategoryInfo(t.personal_finance_category?.primary || '').name
  ))].sort();

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Calculate totals based on transaction categories
  const totalExpenses = transactions
    .filter(t => !isIncomeTransaction(t) && t.personal_finance_category?.primary !== 'TRANSFER_IN')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalIncome = transactions
    .filter(t => isIncomeTransaction(t))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netAmount = totalIncome - totalExpenses;

  return (
    <div className="mt-2xl space-y-xl animate-fade-in">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary mb-sm">
          Transaction History
        </h2>
        <p className="text-gray-600">Your financial activity overview</p>
      </div>
      
      {/* Enhanced Summary Stats */}
      <div className="grid grid-4 gap-lg">
        <div className="card card-small hover:scale-105 transition">
          <div className="flex-between mb-sm">
            <div className="text-sm font-medium text-primary">Total Transactions</div>
            <div className="text-2xl opacity-50">📊</div>
          </div>
          <div className="text-3xl font-bold text-primary">{transactions.length}</div>
        </div>
        
        <div className="card card-small hover:scale-105 transition">
          <div className="flex-between mb-sm">
            <div className="text-sm font-medium text-error">Total Expenses</div>
            <div className="text-2xl opacity-50">💸</div>
          </div>
          <div className="text-3xl font-bold text-error">-{formatCurrency(totalExpenses)}</div>
        </div>
        
        <div className="card card-small hover:scale-105 transition">
          <div className="flex-between mb-sm">
            <div className="text-sm font-medium text-success">Total Income</div>
            <div className="text-2xl opacity-50">💰</div>
          </div>
          <div className="text-3xl font-bold text-success">+{formatCurrency(totalIncome)}</div>
        </div>
        
        <div className={`card card-small hover:scale-105 transition ${
          netAmount >= 0 ? 'bg-gradient-light' : 'bg-gradient-light'
        }`}>
          <div className="flex-between mb-sm">
            <div className={`text-sm font-medium ${
              netAmount >= 0 ? 'text-success' : 'text-warning'
            }`}>Net Amount</div>
            <div className="text-2xl opacity-50">
              {netAmount >= 0 ? '📈' : '📉'}
            </div>
          </div>
          <div className={`text-3xl font-bold ${
            netAmount >= 0 ? 'text-success' : 'text-warning'
          }`}>
            {netAmount >= 0 ? '+' : ''}{formatCurrency(netAmount)}
          </div>
        </div>
      </div>
      
      {/* Enhanced Filter Controls */}
      <div className="card card-small">
        <div className="flex-between">
          <div className="flex gap-md">
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            {filterCategory && (
              <button
                onClick={() => setFilterCategory('')}
                className="btn btn-sm btn-secondary"
              >
                Clear filter ×
              </button>
            )}
          </div>
          
          <div className="status-indicator status-info">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </div>
        </div>
      </div>

      {/* Enhanced Transaction Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-card">
              <tr>
                <th 
                  onClick={() => handleSort('date')}
                  className="p-lg text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition select-none"
                >
                  <div className="flex gap-sm">
                    <span>Date</span>
                    {sortField === 'date' && (
                      <span className="text-primary">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('merchant')}
                  className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200 select-none"
                >
                  <div className="flex items-center space-x-1">
                    <span>Merchant</span>
                    {sortField === 'merchant' && (
                      <span className="text-indigo-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('category')}
                  className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200 select-none"
                >
                  <div className="flex items-center space-x-1">
                    <span>Category</span>
                    {sortField === 'category' && (
                      <span className="text-indigo-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('amount')}
                  className="px-8 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200 select-none"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Amount</span>
                    {sortField === 'amount' && (
                      <span className="text-indigo-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.map((transaction, index) => {
                const categoryInfo = getCategoryInfo(transaction.personal_finance_category?.primary || '');
                const isIncome = isIncomeTransaction(transaction);
                return (
                  <tr key={transaction.transaction_id || index} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-900">
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-900">
                          {transaction.merchant_name || 'Unknown Merchant'}
                        </div>
                        <div className="text-gray-500 text-xs truncate max-w-xs leading-relaxed">
                          {transaction.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${categoryInfo.color} shadow-sm`}>
                        <span className="mr-1">{categoryInfo.icon}</span>
                        {categoryInfo.name}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-right">
                      <span className={`font-bold text-lg ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTransactions.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="text-4xl mb-4">🔍</div>
          <div className="text-gray-500 text-lg font-medium">No transactions found</div>
          <div className="text-gray-400 text-sm">Try adjusting your filter criteria</div>
        </div>
      )}
    </div>
  );
};

// Main Plaid Component
export function Plaid() {
  const transactionRef = useContext(TransactionContext);
  const [linkToken, setLinkToken] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingTransactions, setFetchingTransactions] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  // Fetch link token on component mount
  useEffect(() => {
    async function fetchLinkToken() {
      try {
        const res = await axios.post("/create_link_token");
        console.log("Link token response:", res.data);
        
        if (res.data.link_token) {
          setLinkToken(res.data.link_token);
        } else {
          setError('No link token received');
        }
      } catch (error) {
        console.error("Error fetching link token:", error);
        setError(`Error: ${error.response?.data?.details || error.message}`);
      } finally {
        setLoading(false);
      }
    }
    setTransactions(transactionRef.transactions ?? [])
    if (transactionRef.transactions.length>0)
      setIsAuthenticated(true)
    
    fetchLinkToken();
  }, []);

  // Exchange public token for access token
  const exchangePublicToken = async (publicToken) => {
    try {
      setLoading(true);
      const response = await axios.post('/get_access_token', {
        publicToken: publicToken
      });

      if (response.data.accessToken) {
        setAccessToken(response.data.accessToken);
        setIsAuthenticated(true);
        setError('');
        console.log('Access token obtained successfully');
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      console.error('Error exchanging token:', error);
      setError(`Error exchanging token: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch transactions using access token
  const fetchTransactions = async () => {
    if (!accessToken) {
      setError('Please authenticate first by connecting your bank account');
      return;
    }

    try {
      setFetchingTransactions(true);
      setError('');
      
      const response = await axios.post('/get_transactions', {
        token: accessToken
      });

      if (response.data.transactions) {
        setTransactions(response.data.transactions);
        console.log(response.data.transactions)
        transactionRef.setTransactions(response.data.transactions);
        console.log(`Fetched ${response.data.transactions.length} transactions`);
        // Automatically analyze transactions after fetching
        // analyzeTransactions(response.data.transactions);
      } else {
        setTransactions([]);
        console.log('No transactions found');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError(`Error fetching transactions: ${error.response?.data?.error || error.message}`);
    } finally {
      setFetchingTransactions(false);
    }
  };

  // Analyze transactions using Gemini AI
  const analyzeTransactions = async (transactionData) => {
    if (!transactionData || transactionData.length === 0) {
      setAnalysis('No transactions to analyze.');
      return;
    }

    try {
      setAnalyzing(true);
      setError('');
      
      const response = await axios.post('/analyze_transactions', {
        transactions: transactionData
      });

      if (response.data.analysis) {
        setAnalysis(response.data.analysis);
        console.log('Analysis received:', response.data.analysis);
      } else {
        setAnalysis('Unable to generate analysis at this time.');
      }
    } catch (error) {
      console.error('Error analyzing transactions:', error);
      setError(`Error analyzing transactions: ${error.response?.data?.error || error.message}`);
      setAnalysis('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Reset all state
  const handleReset = () => {
    setAccessToken('');
    setTransactions([]);
    setIsAuthenticated(false);
    setError('');
    setAnalysis('');
    transactionRef.setTransactions([])
  };

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (publicToken, metadata) => {
      console.log('Plaid authentication successful');
      console.log('Public token:', publicToken);
      exchangePublicToken(publicToken);
    },
    onExit: (err, metadata) => {
      if (err) {
        console.error('Plaid exit error:', err);
        setError(`Authentication error: ${err.message}`);
      } else {
        console.log('User exited Plaid flow');
      }
    }
  });

  if (loading && !linkToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto animation-delay-150"></div>
          </div>
          <div className="text-xl font-semibold text-gray-700 mb-2">Loading Plaid Integration</div>
          <div className="text-gray-500">Setting up your secure connection...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container-wide">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">
            Banking Dashboard
          </h1>
          <p className="page-subtitle">
            Connect your bank account with Plaid to view and analyze your financial transactions.
          </p>
        </div>

        {/* Status indicators */}
        <div className="flex-center gap-md mb-xl">
          <div className={`status-indicator ${
            isAuthenticated ? 'status-success' : 'status-info'
          }`}>
            {isAuthenticated ? '✓ Connected & Authenticated' : '○ Not Connected'}
          </div>
          
          {accessToken && (
            <div className="status-indicator status-info">
              Active Session: {accessToken.substring(0, 8)}...
            </div>
          )}
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-xl p-lg bg-gradient-light rounded-2xl shadow" style={{border: '1px solid var(--error-red-light)'}}>
            <div className="flex gap-md">
              <div className="text-2xl">⚠️</div>
              <div>
                <div className="font-semibold text-error mb-sm">Something went wrong</div>
                <div className="text-error text-sm">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap justify-center gap-xl mb-2xl">
          <button
            onClick={() => open()}
            disabled={!ready || loading}
            className={`btn btn-lg ${(!ready || loading) ? 'btn-secondary' : 'btn-primary'}`}
          >
            <span className="flex gap-sm">
              <span>{loading ? 'Connecting...' : '🔗 Connect Bank Account'}</span>
              {loading && <div className="animate-pulse">⏳</div>}
            </span>
          </button>

          <button
            onClick={fetchTransactions}
            disabled={!isAuthenticated || fetchingTransactions}
            className={`btn btn-lg ${(!isAuthenticated || fetchingTransactions) ? 'btn-secondary' : 'btn-success'}`}
          >
            <span className="flex gap-sm">
              <span>{fetchingTransactions ? 'Loading...' : '📊 Fetch Transactions'}</span>
              {fetchingTransactions && <div className="animate-pulse">⏳</div>}
            </span>
          </button>

          {transactions.length > 0 && (
            <button
              onClick={() => analyzeTransactions(transactions)}
              disabled={analyzing}
              className={`btn btn-lg ${analyzing ? 'btn-secondary' : 'btn-warning'}`}
            >
              <span className="flex gap-sm">
                <span>{analyzing ? 'Analyzing...' : '🤖 Analyze with AI'}</span>
                {analyzing && <div className="animate-pulse">⏳</div>}
              </span>
            </button>
          )}

          <button
            onClick={handleReset}
            disabled={true}
            className="btn btn-lg btn-secondary opacity-50 cursor-not-allowed"
          >
            🔄 Reset Connection
          </button>
        </div>

        {/* Transaction Table */}
        {transactions.length > 0 && (
          <TransactionTable transactions={transactions} />
        )}

        {/* AI Analysis Section */}
        {(analysis || analyzing) && (
          <div className="mt-2xl">
            <div className="card bg-gradient-card">
              <div className="text-center mb-2xl">
                <div className="text-6xl mb-lg">🤖</div>
                <h2 className="page-title mb-md">
                  AI Financial Analysis
                </h2>
                <p className="page-subtitle">Powered by Gemini AI • Intelligent insights from your transaction data</p>
              </div>

              <div className="max-w-5xl mx-auto">
                {analyzing ? (
                  <div className="text-center p-3xl">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-primary to-accent rounded-full mb-xl">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
                    </div>
                    <div className="text-2xl font-bold text-primary mb-md">Analyzing Your Transactions</div>
                    <div className="text-lg text-gray-600 mb-lg">AI is reviewing your financial patterns and spending habits...</div>
                    <div className="flex-center gap-sm">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                ) : analysis ? (
                  <div className="space-y-2xl">
                    <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                      <div className="flex items-start gap-lg">
                        <div className="text-4xl">🧠</div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-lg">Analysis Results</h3>
                          <div className="prose prose-lg max-w-none">
                            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-lg">
                              {analysis}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-center gap-lg">
                      <button
                        onClick={() => analyzeTransactions(transactions)}
                        disabled={analyzing}
                        className="btn btn-primary btn-lg"
                      >
                        <span className="flex gap-sm">
                          <span>🔄 Refresh Analysis</span>
                        </span>
                      </button>
                      
                      <div className="status-indicator status-info">
                        💡 Analysis updates with new transaction data
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Get Started Instructions */}
        {transactions.length === 0 && (
          <div className="container-wide">
            <div className="card bg-gradient-card">
              <div className="text-center mb-2xl">
                <div className="text-6xl mb-lg">🚀</div>
                <h3 className="page-title mb-md">Get Started with Plaid</h3>
                <p className="page-subtitle">Follow these simple steps to connect your bank account and start tracking your finances</p>
              </div>
              
              <div className="grid grid-3 gap-xl">
                <div className="card-small text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <div className="w-16 h-16 bg-success text-white rounded-full flex-center mx-auto mb-lg text-2xl font-bold">1</div>
                  <h4 className="text-xl font-bold text-gray-900 mb-md">Authenticate</h4>
                  <p className="text-gray-600">Complete the bank authentication in the secure Plaid popup window</p>
                </div>
                
                <div className="card-small text-center bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                  <div className="w-16 h-16 bg-warning text-white rounded-full flex-center mx-auto mb-lg text-2xl font-bold">2</div>
                  <h4 className="text-xl font-bold text-gray-900 mb-md">Fetch Data</h4>
                  <p className="text-gray-600">Once connected, click "Fetch Transactions" to retrieve your financial data</p>
                </div>
                
                <div className="card-small text-center bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                  <div className="w-16 h-16 bg-error text-white rounded-full flex-center mx-auto mb-lg text-2xl font-bold">3</div>
                  <h4 className="text-xl font-bold text-gray-900 mb-md">Analyze</h4>
                  <p className="text-gray-600">View your beautiful transaction dashboard with insights and analytics</p>
                </div>
              </div>
              
              <div className="text-center mt-2xl">
                <div className="status-indicator status-info">
                  💡 Tip: Make sure you have your bank login credentials ready before starting
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}