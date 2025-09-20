import { useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3333';

export function Plaid() {
  const [linkToken, setLinkToken] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingTransactions, setFetchingTransactions] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
        console.log(`Fetched ${response.data.transactions.length} transactions`);
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

  // Reset all state
  const handleReset = () => {
    setAccessToken('');
    setTransactions([]);
    setIsAuthenticated(false);
    setError('');
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
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Loading Plaid integration...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>
        Plaid Banking Integration
      </h1>

      {/* Status indicators */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '15px', 
        marginBottom: '20px' 
      }}>
        <div style={{
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: '500',
          backgroundColor: isAuthenticated ? '#d4edda' : '#f8f9fa',
          color: isAuthenticated ? '#155724' : '#6c757d'
        }}>
          {isAuthenticated ? '✓ Authenticated' : '⚬ Not Authenticated'}
        </div>
        
        {accessToken && (
          <div style={{
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '500',
            backgroundColor: '#cce5ff',
            color: '#0066cc'
          }}>
            Token: {accessToken.substring(0, 10)}...
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div style={{
          padding: '15px',
          marginBottom: '20px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '6px',
          color: '#721c24',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '15px', 
        marginBottom: '30px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => open()}
          disabled={!ready || loading}
          style={{
            backgroundColor: (!ready || loading) ? '#ccc' : '#00d4aa',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: (!ready || loading) ? 'not-allowed' : 'pointer',
            fontWeight: '500'
          }}
        >
          {loading ? 'Authenticating...' : 'Connect Bank Account'}
        </button>

        <button
          onClick={fetchTransactions}
          disabled={!isAuthenticated || fetchingTransactions}
          style={{
            backgroundColor: (!isAuthenticated || fetchingTransactions) ? '#ccc' : '#28a745',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: (!isAuthenticated || fetchingTransactions) ? 'not-allowed' : 'pointer',
            fontWeight: '500'
          }}
        >
          {fetchingTransactions ? 'Loading...' : 'Fetch Transactions'}
        </button>

        {isAuthenticated && (
          <button
            onClick={handleReset}
            disabled={loading || fetchingTransactions}
            style={{
              backgroundColor: (loading || fetchingTransactions) ? '#ccc' : '#dc3545',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: (loading || fetchingTransactions) ? 'not-allowed' : 'pointer',
              fontWeight: '500'
            }}
          >
            Reset
          </button>
        )}
      </div>

      {/* Transactions display */}
      {transactions.length > 0 && (
        <div style={{
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: '6px',
          padding: '20px'
        }}>
          <h2 style={{ marginBottom: '15px', color: '#333' }}>
            Transactions ({transactions.length})
          </h2>
          <div style={{
            maxHeight: '400px',
            overflowY: 'auto',
            backgroundColor: 'white',
            padding: '15px',
            borderRadius: '4px',
            border: '1px solid #dee2e6'
          }}>
            <pre style={{
              margin: '0',
              fontSize: '12px',
              fontFamily: 'Courier New, monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {JSON.stringify(transactions, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#e3f2fd',
        borderRadius: '6px',
        border: '1px solid #bbdefb'
      }}>
        <h3 style={{ marginBottom: '15px', color: '#1565c0' }}>Instructions:</h3>
        <ol style={{ color: '#1976d2', fontSize: '14px', lineHeight: '1.5' }}>
          <li>Click "Connect Bank Account" to start the authentication flow</li>
          <li>Complete the bank authentication in the Plaid popup</li>
          <li>Once authenticated, click "Fetch Transactions" to retrieve your transaction data</li>
          <li>Use "Reset" to clear all data and start over</li>
        </ol>
      </div>
    </div>
  );
}