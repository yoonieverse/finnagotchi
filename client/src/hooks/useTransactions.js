import { useState } from 'react';
import axios from 'axios';
import { usePlaidAuth } from './usePlaidAuth';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { accessToken, isAuthenticated } = usePlaidAuth();

  const fetchTransactions = async () => {
    if (!accessToken || !isAuthenticated) {
      setError('Please connect your bank account first');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post('/get_transactions', {
        token: accessToken
      });

      if (response.data.transactions) {
        setTransactions(response.data.transactions);
        console.log(`Fetched ${response.data.transactions.length} transactions`);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError(`Error fetching transactions: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    transactions,
    loading,
    error,
    fetchTransactions
  };
};
