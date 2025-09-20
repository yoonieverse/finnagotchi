import { useState, useEffect, createContext, useContext } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3333';

// Create context for sharing Plaid state
const PlaidContext = createContext();

// Provider component to wrap your app
export const PlaidProvider = ({ children }) => {
  const [linkToken, setLinkToken] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load saved auth state from localStorage on mount
  useEffect(() => {
    const savedAccessToken = localStorage.getItem('plaid_access_token');
    const savedAuthState = localStorage.getItem('plaid_is_authenticated');
    
    if (savedAccessToken && savedAuthState === 'true') {
      setAccessToken(savedAccessToken);
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch link token on component mount
  useEffect(() => {
    async function fetchLinkToken() {
      try {
        const res = await axios.post("/create_link_token");
        
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
        const newAccessToken = response.data.accessToken;
        setAccessToken(newAccessToken);
        setIsAuthenticated(true);
        setError('');
        
        // Save to localStorage
        localStorage.setItem('plaid_access_token', newAccessToken);
        localStorage.setItem('plaid_is_authenticated', 'true');
        
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

  // Reset all state
  const resetConnection = () => {
    setAccessToken('');
    setIsAuthenticated(false);
    setError('');
    
    // Clear localStorage
    localStorage.removeItem('plaid_access_token');
    localStorage.removeItem('plaid_is_authenticated');
  };

  const value = {
    linkToken,
    accessToken,
    isAuthenticated,
    loading,
    error,
    exchangePublicToken,
    resetConnection
  };

  return (
    <PlaidContext.Provider value={value}>
      {children}
    </PlaidContext.Provider>
  );
};

// Hook to use Plaid context
export const usePlaidAuth = () => {
  const context = useContext(PlaidContext);
  if (!context) {
    throw new Error('usePlaidAuth must be used within a PlaidProvider');
  }
  return context;
};
