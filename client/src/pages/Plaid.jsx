import React, { useState } from 'react';

const PlaidIntegration = () => {
  const [token, setToken] = useState(null);
  const [transactions, setTransactions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Function to handle Plaid authentication
  const handleAuth = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch link token from server
      
      const response = await fetch('http://localhost:3333/create_link_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
        
      });
      
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const linkToken = data.link_token;
      console.log('hi0')
     
      // Initialize Plaid Link
      console.log(window)
      const linkHandler = window.Plaid.create({
        token: linkToken,
        onSuccess: async (publicToken, metadata) => {
          console.log('Plaid authentication successful');
          console.log('hi1')
          
          try {
            // Exchange public token for access token
            const tokenResponse = await fetch('http://localhost:3333/get_access_token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ publicToken })
            });
            console.log('hi2')

            const tokenData = await tokenResponse.json();

            if (tokenData.error) {
              throw new Error(tokenData.error);
            }

            setToken(tokenData.accessToken);
            setIsAuthenticated(true);
            setError(null);
            alert('Authentication successful! You can now fetch transactions.');
          } catch (err) {
            setError('Error exchanging token: ' + err.message);
            console.error('Error exchanging token:', err);
          }
        },
        onExit: (err, metadata) => {
          if (err) {
            setError('Plaid authentication error: ' + err.message);
            console.error('Plaid exit error:', err);
          } else {
            console.log('User exited Plaid flow');
          }
          setLoading(false);
        }
      });

      linkHandler.open();
    } catch (err) {
      setError('Error creating link token: ' + err.message);
      console.error('Error creating link token:', err);
    }
    
    setLoading(false);
  };

  // Function to fetch transactions
  const handleFetchTransactions = async () => {
    if (!token) {
      alert('Please authenticate first by clicking the "Auth" button');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3333/get_transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setTransactions(data.transactions);
    } catch (err) {
      setError('Error fetching transactions: ' + err.message);
      console.error('Error fetching transactions:', err);
    }

    setLoading(false);
  };

  // Function to reset the component state
  const handleReset = () => {
    setToken(null);
    setTransactions(null);
    setIsAuthenticated(false);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Plaid Integration
      </h1>

      {/* Status indicators */}
      <div className="mb-6 flex items-center justify-center space-x-4">
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isAuthenticated 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {isAuthenticated ? '✓ Authenticated' : '⚬ Not Authenticated'}
        </div>
        
        {token && (
          <div className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            Token: {token.substring(0, 10)}...
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <button
          onClick={handleAuth}
          disabled={loading}
          className={`px-6 py-3 rounded-lg font-medium text-white transition-colors ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
          }`}
        >
          {loading && !isAuthenticated ? 'Authenticating...' : 'Authenticate with Plaid'}
        </button>

        <button
          onClick={handleFetchTransactions}
          disabled={loading || !isAuthenticated}
          className={`px-6 py-3 rounded-lg font-medium text-white transition-colors ${
            loading || !isAuthenticated
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
          }`}
        >
          {loading && isAuthenticated ? 'Loading...' : 'Fetch Transactions'}
        </button>

        {isAuthenticated && (
          <button
            onClick={handleReset}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-medium text-white transition-colors ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 active:bg-red-800'
            }`}
          >
            Reset
          </button>
        )}
      </div>

      {/* Transactions display */}
      {transactions && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Transactions ({transactions.length})
          </h2>
          <div className="max-h-96 overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap break-words">
              {JSON.stringify(transactions, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
          <li>Click "Authenticate with Plaid" to start the authentication flow</li>
          <li>Complete the bank authentication in the Plaid popup</li>
          <li>Once authenticated, click "Fetch Transactions" to retrieve your transaction data</li>
          <li>Use "Reset" to clear all data and start over</li>
        </ol>
      </div>

      {/* Note about Plaid script */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-800 text-sm">
          <strong>Note:</strong> Make sure to include the Plaid Link script in your HTML:
          <br />
          <code className="bg-yellow-100 px-1 rounded text-xs">
            &lt;script src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"&gt;&lt;/script&gt;
          </code>
        </p>
      </div>
    </div>
  );
};

export default PlaidIntegration;