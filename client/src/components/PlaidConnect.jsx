import React from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { usePlaidAuth } from '../hooks/usePlaidAuth';

export const PlaidConnect = () => {
  const { 
    linkToken, 
    isAuthenticated, 
    loading, 
    error, 
    exchangePublicToken, 
    resetConnection 
  } = usePlaidAuth();

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (publicToken, metadata) => {
      console.log('Plaid authentication successful');
      exchangePublicToken(publicToken);
    },
    onExit: (err, metadata) => {
      if (err) {
        console.error('Plaid exit error:', err);
      } else {
        console.log('User exited Plaid flow');
      }
    }
  });

  if (loading && !linkToken) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`flex-shrink-0 w-3 h-3 rounded-full ${
            isAuthenticated ? 'bg-green-500' : 'bg-gray-300'
          }`}></div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {isAuthenticated ? 'Bank Connected' : 'No Bank Connected'}
            </p>
            <p className="text-sm text-gray-500">
              {isAuthenticated 
                ? 'Your bank account is securely connected'
                : 'Connect your bank account to access transactions'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {!isAuthenticated ? (
            <button
              onClick={() => open()}
              disabled={!ready || loading}
              className={`px-6 py-2.5 rounded-lg font-medium text-white transition-all ${
                (!ready || loading)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md'
              }`}
            >
              {loading ? 'Connecting...' : 'Connect Bank Account'}
            </button>
          ) : (
            <button
              onClick={resetConnection}
              className="px-4 py-2.5 rounded-lg font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};