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

  // Calculate totals
  const totalExpenses = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netAmount = totalIncome - totalExpenses;

  return (
    <div className="mt-12 space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Transaction History
        </h2>
        <p className="text-gray-600">Your financial activity overview</p>
      </div>
      
      {/* Enhanced Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-2xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="absolute top-4 right-4 text-2xl opacity-50">📊</div>
          <div className="text-sm font-medium text-blue-600 mb-1">Total Transactions</div>
          <div className="text-3xl font-bold text-blue-900">{transactions.length}</div>
        </div>
        
        <div className="relative bg-gradient-to-br from-red-50 to-rose-100 p-6 rounded-2xl border border-red-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="absolute top-4 right-4 text-2xl opacity-50">💸</div>
          <div className="text-sm font-medium text-red-600 mb-1">Total Expenses</div>
          <div className="text-3xl font-bold text-red-900">-{formatCurrency(totalExpenses)}</div>
        </div>
        
        <div className="relative bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-2xl border border-green-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="absolute top-4 right-4 text-2xl opacity-50">💰</div>
          <div className="text-sm font-medium text-green-600 mb-1">Total Income</div>
          <div className="text-3xl font-bold text-green-900">+{formatCurrency(totalIncome)}</div>
        </div>
        
        <div className={`relative bg-gradient-to-br p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 ${
          netAmount >= 0 
            ? 'from-emerald-50 to-green-100 border-emerald-200' 
            : 'from-orange-50 to-red-100 border-orange-200'
        } border`}>
          <div className="absolute top-4 right-4 text-2xl opacity-50">
            {netAmount >= 0 ? '📈' : '📉'}
          </div>
          <div className={`text-sm font-medium mb-1 ${
            netAmount >= 0 ? 'text-emerald-600' : 'text-orange-600'
          }`}>Net Amount</div>
          <div className={`text-3xl font-bold ${
            netAmount >= 0 ? 'text-emerald-900' : 'text-orange-900'
          }`}>
            {netAmount >= 0 ? '+' : ''}{formatCurrency(netAmount)}
          </div>
        </div>
      </div>
      
      {/* Enhanced Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
          >
            <option value="">All Categories</option>
            {uniqueCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          {filterCategory && (
            <button
              onClick={() => setFilterCategory('')}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Clear filter ×
            </button>
          )}
        </div>
        
        <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-lg">
          Showing {filteredTransactions.length} of {transactions.length} transactions
        </div>
      </div>

      {/* Enhanced Transaction Table */}
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th 
                  onClick={() => handleSort('date')}
                  className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200 select-none"
                >
                  <div className="flex items-center space-x-1">
                    <span>Date</span>
                    {sortField === 'date' && (
                      <span className="text-indigo-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
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
                      <span className={`font-bold text-lg ${transaction.amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {transaction.amount > 0 ? '-' : '+'}{formatCurrency(transaction.amount)}
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex justify-center">
      <div className="w-full max-w-6xl p-6 space-y-8">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Banking Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect your bank account to view and analyze your financial transactions with beautiful insights.
          </p>
        </div>

        {/* Status indicators */}
        <div className="flex justify-center gap-4 mb-8">
          <div className={`px-6 py-3 rounded-full text-sm font-semibold shadow-sm transition-all duration-300 ${
            isAuthenticated 
              ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-green-200' 
              : 'bg-white text-gray-600 border border-gray-200'
          }`}>
            {isAuthenticated ? '✓ Connected & Authenticated' : '○ Not Connected'}
          </div>
          
          {accessToken && (
            <div className="px-6 py-3 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-sm shadow-blue-200">
              Active Session: {accessToken.substring(0, 8)}...
            </div>
          )}
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">⚠️</div>
              <div>
                <div className="font-semibold text-red-800 mb-1">Something went wrong</div>
                <div className="text-red-700 text-sm">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-center gap-6 mb-12">
          <button
            onClick={() => open()}
            disabled={!ready || loading}
            className={`group relative px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 shadow-lg transform hover:scale-105 ${
              (!ready || loading)
                ? 'bg-gray-400 cursor-not-allowed shadow-gray-200'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-blue-200 hover:shadow-blue-300'
            }`}
          >
            <span className="flex items-center space-x-2">
              <span>{loading ? 'Connecting...' : '🔗 Connect Bank Account'}</span>
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            </span>
          </button>

          <button
            onClick={fetchTransactions}
            disabled={!isAuthenticated || fetchingTransactions}
            className={`group relative px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 shadow-lg transform hover:scale-105 ${
              (!isAuthenticated || fetchingTransactions)
                ? 'bg-gray-400 cursor-not-allowed shadow-gray-200'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-green-200 hover:shadow-green-300'
            }`}
          >
            <span className="flex items-center space-x-2">
              <span>{fetchingTransactions ? 'Loading...' : '📊 Fetch Transactions'}</span>
              {fetchingTransactions && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            </span>
          </button>

          {transactions.length > 0 && (
            <button
              onClick={() => analyzeTransactions(transactions)}
              disabled={analyzing}
              className={`group relative px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 shadow-lg transform hover:scale-105 ${
                analyzing
                  ? 'bg-gray-400 cursor-not-allowed shadow-gray-200'
                  : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-purple-200 hover:shadow-purple-300'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>{analyzing ? 'Analyzing...' : '🤖 Analyze with AI'}</span>
                {analyzing && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              </span>
            </button>
          )}

          {isAuthenticated && (
            <button
              onClick={handleReset}
              disabled={loading || fetchingTransactions}
              className={`group relative px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 shadow-lg transform hover:scale-105 ${
                (loading || fetchingTransactions)
                  ? 'bg-gray-400 cursor-not-allowed shadow-gray-200'
                  : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-red-200 hover:shadow-red-300'
              }`}
            >
              🔄 Reset Connection
            </button>
          )}
        </div>

        {/* Transaction Table */}
        {transactions.length > 0 && (
          <TransactionTable transactions={transactions} />
        )}

        {/* AI Analysis Section */}
        {(analysis || analyzing) && (
          <div className="mt-12 space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                AI Financial Analysis
              </h2>
              <p className="text-gray-600">Powered by Gemini AI</p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-8 rounded-3xl shadow-xl border border-purple-200">
                {analyzing ? (
                  <div className="text-center py-8">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                      <div className="absolute inset-0 w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto animation-delay-150"></div>
                    </div>
                    <div className="text-lg font-semibold text-purple-700 mb-2">Analyzing Your Transactions</div>
                    <div className="text-purple-600">AI is reviewing your financial patterns...</div>
                  </div>
                ) : analysis ? (
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">🤖</div>
                      <div className="flex-1">
                        <div className="prose prose-lg max-w-none">
                          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                            {analysis}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-center pt-4">
                      <button
                        onClick={() => analyzeTransactions(transactions)}
                        disabled={analyzing}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        🔄 Refresh Analysis
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {transactions.length === 0 && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Get Started</h3>
                <p className="text-gray-600">Follow these simple steps to connect your bank account</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                  <h4 className="font-semibold text-gray-900 mb-2">Connect Account</h4>
                  <p className="text-sm text-gray-600">Click "Connect Bank Account" to start the secure authentication process</p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                  <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                  <h4 className="font-semibold text-gray-900 mb-2">Authenticate</h4>
                  <p className="text-sm text-gray-600">Complete the bank authentication in the secure Plaid popup window</p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                  <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                  <h4 className="font-semibold text-gray-900 mb-2">Fetch Data</h4>
                  <p className="text-sm text-gray-600">Once connected, click "Fetch Transactions" to retrieve your data</p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border border-orange-100">
                  <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
                  <h4 className="font-semibold text-gray-900 mb-2">Analyze</h4>
                  <p className="text-sm text-gray-600">View your beautiful transaction dashboard with insights and analytics</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}