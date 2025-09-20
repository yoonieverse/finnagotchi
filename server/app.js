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

// Parse JSON request bodies
app.use(express.json());

// Initialize Firebase Admin
initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  }),
});
const db = getFirestore();

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

// ===================
// PLAID API ENDPOINTS
// ===================

// Endpoint to create a link token
app.post('/create_link_token', async (req, res) => {
    try {
        const response = await client.linkTokenCreate({
            user: {
                client_user_id: 'CodingWithAdo'
            },
            client_name: 'Finnagotchi',
            products: ['transactions'],
            required_if_supported_products: ['auth'],
            country_codes: ['US'],
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

// ===================
// USER API ENDPOINTS
// ===================

// Create or get user
app.post("/createuser", async (req, res) => {
    try {
        const { first_name, last_name, email, uid } = req.body;
        
        if (!uid || !email || !first_name) {
            return res.status(400).json({ error: 'Missing required fields: uid, email, first_name' });
        }

        const usersRef = db.collection('users').doc(uid);
        const doc = await usersRef.get();
        
        if (doc.exists) {
            res.json({ text: doc.data() });
        } else {
            await db.collection("users").doc(uid).set({
                first_name,
                last_name: last_name ?? '',
                email,
                budget_preference: { needs: 50, wants: 30, savings: 20 }
            }); 
            
            res.json({ text: 'User created successfully' });
        }
    } catch (error) {
        console.error('Error creating/getting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update budget preferences
app.put("/budget", async (req, res) => {
    try {
        const { uid, budget_preference } = req.body;

        if (!uid || !budget_preference) {
            return res.status(400).json({ error: "uid and budget_preference are required" });
        }

        // Validate budget_preference keys
        const { needs, wants, savings } = budget_preference;
        if (
            typeof needs !== "number" ||
            typeof wants !== "number" ||
            typeof savings !== "number"
        ) {
            return res.status(400).json({ error: "needs, wants, savings must be numbers" });
        }

        // Validate that percentages add up to 100
        if (needs + wants + savings !== 100) {
            return res.status(400).json({ error: "Budget percentages must add up to 100" });
        }

        // Update Firestore
        await db.collection("users").doc(uid).update({
            budget_preference: { needs, wants, savings },
        });

        res.json({ message: "Budget preferences updated successfully" });
    } catch (err) {
        console.error('Error updating budget:', err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get user data
app.get("/user", async (req, res) => {
    try {
        const { uid } = req.query;

        if (!uid) {
            return res.status(400).json({ error: "UID is required" });
        }

        const userDoc = await db.collection("users").doc(uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(userDoc.data());
    } catch (err) {
        console.error('Error getting user:', err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ===================
// UTILITY ENDPOINTS
// ===================

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Simple root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Finnagotchi Backend API',
        version: '1.0.0',
        endpoints: {
            plaid: {
                'POST /create_link_token': 'Create Plaid link token',
                'POST /get_access_token': 'Exchange public token for access token',
                'POST /get_transactions': 'Get transactions using access token'
            },
            users: {
                'POST /createuser': 'Create or get user',
                'PUT /budget': 'Update budget preferences', 
                'GET /user': 'Get user data'
            },
            utility: {
                'GET /health': 'Health check',
                'GET /': 'API documentation'
            }
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: err.message 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Endpoint not found',
        message: `Cannot ${req.method} ${req.path}` 
    });
});

// Start the server on the specified port
app.listen(port, () => {
    console.log(`🚀 Finnagotchi Backend Server running on http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}`);
    console.log(`🏥 Health Check: http://localhost:${port}/health`);
    console.log('\n📋 Required Environment Variables:');
    console.log('   - PLAID_CLIENT_ID');
    console.log('   - PLAID_SECRET');
    console.log('   - FIREBASE_PROJECT_ID');
    console.log('   - FIREBASE_CLIENT_EMAIL');
    console.log('   - FIREBASE_PRIVATE_KEY');
});