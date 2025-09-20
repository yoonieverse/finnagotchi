// client/src/pages/Budget.jsx
import { useContext, useState, useMemo } from "react";
import { TransactionContext } from "../contexts/transactionContext";

export function Budget() {
    const { transactions } = useContext(TransactionContext);
    const [budgetData, setBudgetData] = useState(null);

    // Simple categorization rules - you can expand these later
    const categorizeTransaction = (transaction) => {
        const name = transaction.name?.toLowerCase() || '';
        const category = transaction.personal_finance_category?.primary?.toLowerCase() || '';
        const detailedCategory = transaction.personal_finance_category?.detailed?.toLowerCase() || '';
        const amount = transaction.amount;
        
        // INCOME/SAVINGS - Handle income and transfers to savings
        if (category === 'income' || 
            category === 'transfer_in' ||
            detailedCategory === 'income_wages' ||
            detailedCategory === 'transfer_in_savings' ||
            name.includes('direct deposit') ||
            name.includes('paycheck') ||
            name.includes('transfer to savings') ||
            name.includes('transfer from checking - student savings')) {
            return { type: 'savings', subcategory: 'purchases' };
        }
        
        // NEEDS categories - Essential expenses only
        if (
            // Groceries (but not restaurants)
            (category === 'food_and_drink' && (
                detailedCategory === 'food_and_drink_groceries' ||
                name.includes('grocery') || 
                name.includes('heb') ||
                name.includes('walmart') && name.includes('groceries')
            )) ||
            // Medical
            category === 'medical' ||
            // Essential transportation (gas, not ride shares)
            (category === 'transportation' && (
                detailedCategory === 'transportation_gas' ||
                name.includes('gas station') ||
                name.includes('shell') ||
                name.includes('exxon')
            )) ||
            // Rent and utilities
            category === 'rent_and_utilities' ||
            name.includes('rent payment') ||
            name.includes('university housing') ||
            // Government/taxes
            category === 'government_and_non_profit' ||
            // Insurance
            name.includes('insurance')
        ) {
            // Determine subcategory for needs
            if (category === 'food_and_drink') {
                return { type: 'needs', subcategory: 'food_drink' };
            } else if (category === 'medical') {
                return { type: 'needs', subcategory: 'medical' };
            } else if (category === 'transportation') {
                return { type: 'needs', subcategory: 'transportation' };
            } else if (category === 'rent_and_utilities' || name.includes('rent') || name.includes('housing')) {
                return { type: 'needs', subcategory: 'rent_utilities' };
            } else if (category === 'government_and_non_profit') {
                return { type: 'needs', subcategory: 'government_and_non_profit' };
            } else if (name.includes('repair') || name.includes('maintenance')) {
                return { type: 'needs', subcategory: 'home_improvement' };
            }
            return { type: 'needs', subcategory: 'rent_utilities' }; // default needs category
        }
        
        // WANTS categories - Everything else that's spending
        if (category === 'food_and_drink') {
            return { type: 'wants', subcategory: 'food_drink' };
        } else if (category === 'entertainment' || 
                   name.includes('netflix') || 
                   name.includes('spotify') || 
                   name.includes('movie') ||
                   name.includes('steam') ||
                   name.includes('game')) {
            return { type: 'wants', subcategory: 'entertainment' };
        } else if (category === 'travel' || name.includes('hotel') || name.includes('flight')) {
            return { type: 'wants', subcategory: 'travel' };
        }
        
        // Default to personal_purchase for wants
        return { type: 'wants', subcategory: 'personal_purchase' };
    };

    const generateBudget = () => {
        if (!transactions || transactions.length === 0) {
            alert('No transactions available to generate budget');
            return;
        }

        // Initialize budget structure
        const budget = {
            needs: {
                budget_percent: 50,
                subcategories: {
                    food_drink: [],
                    medical: [],
                    transportation: [],
                    home_improvement: [],
                    rent_utilities: [],
                    government_and_non_profit: []
                }
            },
            wants: {
                budget_percent: 30,
                subcategories: {
                    food_drink: [],
                    entertainment: [],
                    personal_purchase: [],
                    travel: []
                }
            },
            savings: {
                budget_percent: 20,
                purchases: []
            }
        };

        // Process each transaction
        transactions.forEach(transaction => {
            const { type, subcategory } = categorizeTransaction(transaction);
            
            // Debug logging
            console.log('Transaction:', {
                name: transaction.name,
                amount: transaction.amount,
                category: transaction.personal_finance_category?.primary,
                detailed: transaction.personal_finance_category?.detailed,
                categorizedAs: { type, subcategory }
            });
            
            const transactionItem = {
                name: transaction.name || 'Unknown Transaction',
                amount: Math.abs(transaction.amount || 0),
                date: transaction.date || new Date().toISOString().split('T')[0]
            };

            // Add to appropriate category
            if (type === 'needs' && budget.needs.subcategories[subcategory]) {
                budget.needs.subcategories[subcategory].push(transactionItem);
            } else if (type === 'wants' && budget.wants.subcategories[subcategory]) {
                budget.wants.subcategories[subcategory].push(transactionItem);
            } else if (type === 'savings') {
                budget.savings.purchases.push(transactionItem);
            }
        });

        setBudgetData(budget);
        console.log('Generated Budget:', budget); // For debugging
    };

    // Calculate totals for display
    const calculateCategoryTotal = (category) => {
        if (!budgetData || !budgetData[category]) return 0;
        
        if (category === 'savings') {
            return budgetData[category].purchases.reduce((sum, item) => sum + item.amount, 0);
        }
        
        return Object.values(budgetData[category].subcategories)
            .flat()
            .reduce((sum, item) => sum + item.amount, 0);
    };

    const totalSaved = useMemo(() => {
        if (!budgetData) return 0;
        return calculateCategoryTotal('savings') - calculateCategoryTotal('wants') - calculateCategoryTotal('needs');
    }, [budgetData]);

    const totalSpent = useMemo(() => {
        if (!budgetData) return 0;
        return calculateCategoryTotal('wants') + calculateCategoryTotal('needs');
    }, [budgetData]);

    const renderSubcategory = (subcategory, items) => {
        const total = items.reduce((sum, item) => sum + item.amount, 0);
        
        return (
            <div key={subcategory} className="mb-4">
                <h4 className="font-semibold text-lg capitalize mb-2">
                    {subcategory.replace('_', ' ')} - ${total.toFixed(2)}
                </h4>
                {items.length > 0 ? (
                    <ul className="ml-4 space-y-1">
                        {items.map((item, index) => (
                            <li key={index} className="text-sm">
                                <span className="font-medium">{item.name}</span> - 
                                <span className="text-green-600"> ${item.amount.toFixed(2)}</span> - 
                                <span className="text-gray-500"> {item.date}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 ml-4 text-sm">No transactions in this category</p>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-4">Budget Analysis</h1>
                
                <div className="flex gap-4 mb-6">
                    <button 
                        onClick={generateBudget}
                        disabled={!transactions || transactions.length === 0}
                        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded"
                    >
                        Generate 50/30/20 Budget
                    </button>
                    
                    <div className="text-sm text-gray-600 self-center">
                        {transactions ? `${transactions.length} transactions available` : 'No transactions'}
                    </div>
                </div>

                {/* Debug info */}
                <div className="text-xs text-gray-500 mb-4">
                    <details>
                        <summary>Categorization Rules (click to expand)</summary>
                        <div className="mt-2 p-2 bg-gray-50 rounded">
                            <p><strong>Needs (50%):</strong> Groceries, medical, utilities, rent, insurance, basic transportation</p>
                            <p><strong>Wants (30%):</strong> Restaurants, entertainment, shopping, travel, ride-sharing</p>
                            <p><strong>Savings (20%):</strong> Currently empty (for spending tracking)</p>
                        </div>
                    </details>
                </div>
            </div>

            {!budgetData && (
                <div className="text-center py-8">
                    <p className="text-gray-500">Click "Generate 50/30/20 Budget" to categorize your transactions.</p>
                </div>
            )}

            {budgetData && (
                <div className="space-y-8">
                    {/* Budget Overview */}
                    <div className="bg-gray-100 p-6 rounded-lg">
                        <h2 className="text-2xl font-bold mb-4">Budget Overview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="bg-blue-50 p-4 rounded">
                                <h3 className="font-semibold text-blue-800">Needs (50%)</h3>
                                <p className="text-2xl font-bold text-blue-600">${calculateCategoryTotal('needs').toFixed(2)}</p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded">
                                <h3 className="font-semibold text-purple-800">Wants (30%)</h3>
                                <p className="text-2xl font-bold text-purple-600">${calculateCategoryTotal('wants').toFixed(2)}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded">
                                <h3 className="font-semibold text-green-800">Savings (20%)</h3>
                                <p className="text-2xl font-bold text-green-600">${calculateCategoryTotal('savings').toFixed(2)}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded">
                                <h3 className="font-semibold text-gray-800">Total Saved</h3>
                                <p className="text-2xl font-bold text-gray-600">${totalSaved.toFixed(2)}</p>
                            </div>
                            <div className="bg-red-50 p-4 rounded">
                                <h3 className="font-semibold text-red-800">Total Spent</h3>
                                <p className="text-2xl font-bold text-red-600">${totalSpent.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Needs Section */}
                    <div className="bg-white border-2 border-blue-200 p-6 rounded-lg">
                        <h2 className="text-2xl font-bold text-blue-800 mb-4">
                            Needs (50%) - ${calculateCategoryTotal('needs').toFixed(2)}
                        </h2>
                        {Object.entries(budgetData.needs.subcategories).map(([subcategory, items]) =>
                            renderSubcategory(subcategory, items)
                        )}
                    </div>

                    {/* Wants Section */}
                    <div className="bg-white border-2 border-purple-200 p-6 rounded-lg">
                        <h2 className="text-2xl font-bold text-purple-800 mb-4">
                            Wants (30%) - ${calculateCategoryTotal('wants').toFixed(2)}
                        </h2>
                        {Object.entries(budgetData.wants.subcategories).map(([subcategory, items]) =>
                            renderSubcategory(subcategory, items)
                        )}
                    </div>

                    {/* Savings Section */}
                    <div className="bg-white border-2 border-green-200 p-6 rounded-lg">
                        <h2 className="text-2xl font-bold text-green-800 mb-4">
                            Savings (20%) - ${calculateCategoryTotal('savings').toFixed(2)}
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Savings tracking not implemented yet. This section will show money set aside for savings goals.
                        </p>
                    </div>

                    {/* JSON Output for Development */}
                    <details className="bg-gray-50 p-4 rounded">
                        <summary className="font-semibold cursor-pointer">View Raw Budget JSON (for development)</summary>
                        <pre className="mt-2 text-xs overflow-x-auto bg-white p-2 rounded">
                            {JSON.stringify(budgetData, null, 2)}
                        </pre>
                    </details>

                    {/* Raw Transactions JSON for Development */}
                    <details className="bg-blue-50 p-4 rounded">
                        <summary className="font-semibold cursor-pointer">View Raw Transactions JSON (for development)</summary>
                        <div className="mt-2 space-y-2">
                            <div className="text-sm text-blue-600">
                                Total transactions: {transactions ? transactions.length : 0}
                            </div>
                            <pre className="text-xs overflow-x-auto bg-white p-2 rounded max-h-96">
                                {JSON.stringify(transactions, null, 2)}
                            </pre>
                        </div>
                    </details>
                </div>
            )}
        </div>
    );
}