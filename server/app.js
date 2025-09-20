// Import required modules
const express = require('express');
const { PlaidApi, Configuration, PlaidEnvironments } = require('plaid');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from a .env file
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter, Transaction, collection, query, where, getDocs, documentId } = require('firebase-admin/firestore');
const { getAuth } = require("firebase-admin/auth");
const admin = require('firebase-admin');

// Initialize an Express application
const app = express();

// Use CORS middleware to allow cross-origin requests
app.use(cors());


initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  }),
});
const db = getFirestore();
// Serve static files from current directory
app.use(express.static(__dirname));

// Set port number for the server
const port = 3333;

// Initialize Plaid client with configuration
const client = new PlaidApi(
    new Configuration({
        // Use sandbox environment for Plaid
        basePath: PlaidEnvironments['sandbox'],
        baseOptions: {
            headers: {
                // Set Plaid client ID, secret, and version from environment variables
                "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
                "PLAID-SECRET": process.env.PLAID_SECRET,
                "Plaid-Version": "2020-09-14"
            }
        }
    })
);


// Endpoint to create a link token
app.post('/create_link_token', async (req, res) => {
    try {
        const response = await client.linkTokenCreate({
            user: {
                client_user_id: 'CodingWithAdo'
            },
            client_name: 'Ado',
            products: ['transactions'],
            required_if_supported_products: ['auth'],
            country_codes: ['US'], // Fixed: use uppercase country codes
            language: "en"
        });
        
        // Send the response data as JSON
        res.json(response.data);
    } catch (error) {
        console.error('Error creating link token:', error);
        
        // Send more detailed error information
        res.status(400).json({
            error: error.message,
            details: error.response?.data || 'No additional details available'
        });
    }
});

// Endpoint to exchange a public token for an access token
app.post('/get_access_token', async (req, res) => {
    try {
        const { publicToken } = req.body;
        
        // Validate input
        if (!publicToken) {
            return res.status(400).json({ error: 'Public token is required' });
        }
        
        const response = await client.itemPublicTokenExchange({
            public_token: publicToken
        });
        
        // Send the access token as JSON
        res.json({ accessToken: response.data.access_token });
    } catch (error) {
        console.error('Error exchanging public token:', error);
        
        // Send more detailed error information
        res.status(400).json({
            error: error.message,
            details: error.response?.data || 'No additional details available'
        });
    }
});

// Endpoint to get transactions using an access token
app.post('/get_transactions', async (req, res) => {
    try {
        const { token } = req.body;
        
        // Validate input
        if (!token) {
            return res.status(400).json({ error: 'Access token is required' });
        }
        
        // Get current date and date 30 days ago for more realistic date range
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const response = await client.transactionsGet({
            access_token: token,
            start_date: startDate,
            end_date: endDate,
            options: {
                offset: 0,
                count: 100 // Limit to 100 transactions
            }
        });
        
        // Send the transactions data as JSON
        res.json(response.data);
    } catch (error) {
        console.error('Error getting transactions:', error);
        
        // Send more detailed error information
        res.status(400).json({
            error: error.message,
            details: error.response?.data || 'No additional details available'
        });
    }
});

// Serve the HTML file at the root path
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Plaid Integration Demo</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            
            .container {
                background: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            h1 {
                color: #333;
                text-align: center;
                margin-bottom: 30px;
            }
            
            button {
                background: #00D09C;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                font-size: 16px;
                cursor: pointer;
                margin: 10px;
                transition: background 0.3s;
            }
            
            button:hover {
                background: #00B88A;
            }
            
            button:disabled {
                background: #ccc;
                cursor: not-allowed;
            }
            
            .button-container {
                text-align: center;
                margin-bottom: 30px;
            }
            
            #transactionsList {
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 4px;
                padding: 20px;
                white-space: pre-wrap;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                max-height: 400px;
                overflow-y: auto;
                min-height: 100px;
            }
            
            .status {
                text-align: center;
                padding: 10px;
                margin: 10px 0;
                border-radius: 4px;
            }
            
            .status.success {
                background: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            
            .status.error {
                background: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Plaid Banking Integration Demo</h1>
            
            <div class="button-container">
                <button id="auth">Connect Bank Account</button>
                <button id="transactions">Get Transactions</button>
            </div>
            
            <div id="status" class="status" style="display: none;"></div>
            
            <div>
                <h3>Transactions:</h3>
                <div id="transactionsList">Click "Connect Bank Account" first, then "Get Transactions"</div>
            </div>
        </div>

        <!-- Include Plaid Link SDK -->
        <script src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"></script>
        
        <!-- Your JavaScript code -->
        <script>
            // Variable to store the access token
            let token;

            function showStatus(message, type) {
                const statusDiv = document.getElementById('status');
                statusDiv.textContent = message;
                statusDiv.className = \`status \${type}\`;
                statusDiv.style.display = 'block';
                
                // Hide after 5 seconds
                setTimeout(() => {
                    statusDiv.style.display = 'none';
                }, 5000);
            }

            // Event listener for the "transactions" button click
            document.getElementById('transactions').addEventListener('click', function() {
                // Check if token exists before making request
                if (!token) {
                    showStatus('Please authenticate first by clicking "Connect Bank Account"', 'error');
                    return;
                }

                showStatus('Fetching transactions...', 'success');

                // Fetch transactions from the server using the stored token
                fetch('http://localhost:3333/get_transactions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        token: token
                    })
                })
                .then(response => response.json())
                .then(data => {
                    // Check if there's an error in the response
                    if (data.error) {
                        document.getElementById('transactionsList').textContent = 'Error: ' + data.error;
                        showStatus('Error fetching transactions: ' + data.error, 'error');
                        return;
                    }
                    
                    // Display the transactions in a readable format
                    if (data.transactions && data.transactions.length > 0) {
                        document.getElementById('transactionsList').textContent = JSON.stringify(data.transactions, null, 2);
                        showStatus(\`Successfully fetched \${data.transactions.length} transactions\`, 'success');
                    } else {
                        document.getElementById('transactionsList').textContent = 'No transactions found for the selected date range.';
                        showStatus('No transactions found', 'success');
                    }
                })
                .catch(error => {
                    console.error('Error fetching transactions:', error);
                    document.getElementById('transactionsList').textContent = 'Error fetching transactions: ' + error.message;
                    showStatus('Error fetching transactions: ' + error.message, 'error');
                });
            });

            // Event listener for the "auth" button click
            document.getElementById('auth').addEventListener('click', function() {
                showStatus('Creating authentication link...', 'success');
                
                // Fetch a link token from the server
                fetch('http://localhost:3333/create_link_token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                })
                .then(response => response.json())
                .then(data => {
                    // Check if there's an error in the response
                    if (data.error) {
                        console.error('Error creating link token:', data.error);
                        showStatus('Error creating link token: ' + data.error, 'error');
                        return;
                    }

                    // Extract the link token from the server's response
                    const linkToken = data.link_token;

                    // Initialize the Plaid link handler with the obtained link token
                    const linkHandler = Plaid.create({
                        token: linkToken,
                        // Callback for successful authentication with Plaid
                        onSuccess: function(publicToken, metadata) {
                            console.log('Plaid authentication successful');
                            showStatus('Authentication successful! Exchanging tokens...', 'success');
                            
                            // Exchange the public token for an access token
                            fetch('http://localhost:3333/get_access_token', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ publicToken: publicToken })
                            })
                            .then(response => response.json())
                            .then(data => {
                                // Check if there's an error in the response
                                if (data.error) {
                                    console.error('Error getting access token:', data.error);
                                    showStatus('Error getting access token: ' + data.error, 'error');
                                    return;
                                }
                                
                                // Store the access token for later use
                                token = data.accessToken;
                                console.log('Access token obtained successfully');
                                showStatus('Bank account connected successfully! You can now fetch transactions.', 'success');
                            })
                            .catch(error => {
                                console.error('Error exchanging token:', error);
                                showStatus('Error exchanging token: ' + error.message, 'error');
                            });
                        },
                        // Callback for when the user exits the Plaid authentication flow
                        onExit: function(err, metadata) {
                            if (err) {
                                console.error('Plaid exit error:', err);
                                showStatus('Authentication cancelled or failed', 'error');
                            } else {
                                console.log('User exited Plaid flow');
                                showStatus('Authentication cancelled', 'error');
                            }
                        }
                    });

                    // Open the Plaid authentication flow
                    linkHandler.open();
                })
                .catch(error => {
                    console.error('Error creating link token:', error);
                    showStatus('Error creating link token: ' + error.message, 'error');
                });
            });
        </script>
    </body>
    </html>
    `);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});


//////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////


app.use(express.json());
app.post("/createuser", async (req, res) => {
    console.log('hijkdfjks')
    const { first_name, last_name, email, uid } = req.body;
    const usersRef = db.collection('users').doc(uid);
    // const q = query(usersRef, where(documentId(), "==", uid));
    
    usersRef.get()
        .then(async doc => {
            if (doc.exists) {
            res.json({text: doc.data()});
            } else {
                await db.collection("users").doc(uid).set({
                    first_name,
                    last_name:last_name??'',
                    email,
                    budget_preference: {needs:50, wants:30,savings:20}
                }); 

                res.json({text: 'No such document!'});
            }
        })
        .catch(error => {
            console.error('Error getting document:', error);
        });
    
    
    /*if(!q){
        await db.collection("users").doc(uid).set({
            first_name,
            last_name,
            email,
            budget_preference: {needs:50, wants:30,savings:20}
        }); 
        res.json({result:'user added'})

    }else{
        res.json({result:'user document already exist'})
    }
    */
    // try {
    //     getAuth()
    //         .getUser(uid)
    //         .then(async(userRecord) => {
                
                
            
    //             res.json({text: 'user alr exist'});
    //         })
    //         .catch(async (error) => {
    //             await db.collection("users").doc(uid).set({
    //                 first_name,
    //                 last_name,
    //                 email,
    //                 budget_preference: {needs:50, wants:30,savings:20}
    //             }); 
    //         });
       
       
    // } catch (err) {
    //     res.json({ text: err.message });
    // }
});

app.put("/budget", async (req, res) => {
    
})

app.get("/budget", async (req, res) => {

})



// Start the server on the specified port
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log('Make sure you have the following environment variables set:');
    console.log('- PLAID_CLIENT_ID');
    console.log('- PLAID_SECRET');
});