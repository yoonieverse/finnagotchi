import { useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8000';

export function Plaid() {
  const [linkToken, setLinkToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (public_token, metadata) => {
      console.log('SUCCESS! Public token:', public_token);
      alert(`Success! Public token: ${public_token}`);
      // TODO: Send to server to exchange for access token
    },
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div>
        <h2>Error occurred:</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Connect Your Bank</h1>
      <button 
        onClick={() => open()} 
        disabled={!ready}
        style={{
          backgroundColor: '#00d4aa',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          cursor: ready ? 'pointer' : 'not-allowed',
        }}
      >
        {ready ? 'Connect a bank account' : 'Loading...'}
      </button>
    </div>
  );
}

