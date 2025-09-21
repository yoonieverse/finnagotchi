// client/src/pages/Budget.jsx
import { useContext, useState, useMemo } from "react";
import { TransactionContext } from "../contexts/transactionContext";
import { getAuth } from "firebase/auth";
import { BudgetContext } from "../contexts/budgetContext";

export function Budget() {
    const { transactions } = useContext(TransactionContext);
    const [budgetData, setBudgetData] = useState(null);
    const {setBudget}=useContext(BudgetContext)
    const auth = getAuth();

    // Convert transactions to budgetItems format for createBudgetJSON
    const convertTransactionsToBudgetItems = (transactions) => {
        return transactions.map(transaction => {
            const name = transaction.name?.toLowerCase() || '';
        const category = transaction.personal_finance_category?.primary?.toLowerCase() || '';
        const detailedCategory = transaction.personal_finance_category?.detailed?.toLowerCase() || '';
            
            // Determine if it's income or expense
            let itemCategory = 'expense'; // default
            let itemType = 'wants'; // default for expenses
        
            // INCOME - Handle income transactions
        if (category === 'income' || 
            detailedCategory === 'income_wages' ||
            name.includes('direct deposit') ||
            name.includes('paycheck')) {
                itemCategory = 'income';
                itemType = 'income'; // We'll track this separately
            } else {
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
                    itemType = 'needs';
                } else {
                    itemType = 'wants';
                }
            }

            return {
                name: transaction.name || 'Unknown Transaction',
                amount: Math.abs(transaction.amount || 0),
                category: itemCategory,
                type: itemType,
                date: transaction.date || new Date().toISOString().split('T')[0]
            };
        });
    };

    // Function to create budget JSON data (from your provided code)
    const createBudgetJSON = (budgetItems) => {
        if (budgetItems.length === 0) {
            return null;
        }

        // Initialize budget structure
        const budgetJSON = {
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
            },
            income: {
                total: 0,
                purchases: []
            }
        };

        // Process each budget item and categorize it
        budgetItems.forEach(item => {
            const transactionItem = {
                name: item.name,
                ammount: item.amount, // Note: using "ammount" as specified in your structure
                date: item.date || new Date().toISOString().split('T')[0] // Use item date or default to current date
            };

            // Categorize based on item type and category
            if (item.category === 'income') {
                // Income goes to income section
                budgetJSON.income.purchases.push(transactionItem);
                budgetJSON.income.total += item.amount;
            } else if (item.category === 'expense') {
                if (item.type === 'needs') {
                    // For needs, we need to determine the subcategory
                    let subcategory = 'rent_utilities'; // default
                    
                    if (item.name.toLowerCase().includes('grocery') || 
                        item.name.toLowerCase().includes('food') ||
                        item.name.toLowerCase().includes('heb')) {
                        subcategory = 'food_drink';
                    } else if (item.name.toLowerCase().includes('medical') ||
                               item.name.toLowerCase().includes('doctor') ||
                               item.name.toLowerCase().includes('pharmacy')) {
                        subcategory = 'medical';
                    } else if (item.name.toLowerCase().includes('gas') ||
                               item.name.toLowerCase().includes('transportation') ||
                               item.name.toLowerCase().includes('car') ||
                               item.name.toLowerCase().includes('shell') ||
                               item.name.toLowerCase().includes('exxon')) {
                        subcategory = 'transportation';
                    } else if (item.name.toLowerCase().includes('repair') ||
                               item.name.toLowerCase().includes('maintenance') ||
                               item.name.toLowerCase().includes('home')) {
                        subcategory = 'home_improvement';
                    } else if (item.name.toLowerCase().includes('government') ||
                               item.name.toLowerCase().includes('tax') ||
                               item.name.toLowerCase().includes('non_profit')) {
                        subcategory = 'government_and_non_profit';
                    }
                    
                    if (budgetJSON.needs.subcategories[subcategory]) {
                        budgetJSON.needs.subcategories[subcategory].push(transactionItem);
                    }
                } else if (item.type === 'wants') {
                    // For wants, determine subcategory
                    let subcategory = 'personal_purchase'; // default
                    
                    if (item.name.toLowerCase().includes('restaurant') ||
                        item.name.toLowerCase().includes('food') ||
                        item.name.toLowerCase().includes('coffee') ||
                        item.name.toLowerCase().includes('dining')) {
                        subcategory = 'food_drink';
                    } else if (item.name.toLowerCase().includes('entertainment') ||
                               item.name.toLowerCase().includes('movie') ||
                               item.name.toLowerCase().includes('game') ||
                               item.name.toLowerCase().includes('netflix') ||
                               item.name.toLowerCase().includes('spotify') ||
                               item.name.toLowerCase().includes('steam')) {
                        subcategory = 'entertainment';
                    } else if (item.name.toLowerCase().includes('travel') ||
                               item.name.toLowerCase().includes('hotel') ||
                               item.name.toLowerCase().includes('flight')) {
                        subcategory = 'travel';
                    }
                    
                    if (budgetJSON.wants.subcategories[subcategory]) {
                        budgetJSON.wants.subcategories[subcategory].push(transactionItem);
                    }
                }
            }
        });

        console.log('Budget JSON created:', budgetJSON);
        return budgetJSON;
    };

    const generateBudget = async () => {
        if (!transactions || transactions.length === 0) {
            alert('No transactions available to generate budget');
            return;
        }

        // Convert transactions to budgetItems format
        const budgetItems = convertTransactionsToBudgetItems(transactions);
        console.log('Converted budget items:', budgetItems);

        // Use the createBudgetJSON function
        const budget = createBudgetJSON(budgetItems);
        
        if (!budget) {
            alert('Failed to generate budget from transactions');
            return;
        }

        setBudgetData(budget);
        setBudget(budget)
        
        try {
            const response = await fetch('http://localhost:3333/budget', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ budget, uid: auth.currentUser.uid }),
            });

            if (!response.ok) {
                console.error('Failed to save budget to server');
            }
        } catch (error) {
            console.error('Error saving budget:', error);
        }

        console.log('Generated Budget:', budget); // For debugging
    };

    // Calculate totals for display
    const calculateCategoryTotal = (category) => {
        if (!budgetData || !budgetData[category]) return 0;
        
        if (category === 'income') {
            return budgetData[category].total || 0;
        }
        
        if (category === 'savings') {
            // Calculate savings as income - wants - needs
            const totalIncome = budgetData.income ? budgetData.income.total : 0;
            const totalNeeds = calculateCategoryTotal('needs');
            const totalWants = calculateCategoryTotal('wants');
            return totalIncome - totalNeeds - totalWants;
        }
        
        return Object.values(budgetData[category].subcategories)
            .flat()
            .reduce((sum, item) => sum + item.ammount, 0);
    };

    const totalSaved = useMemo(() => {
        if (!budgetData) return 0;
        return calculateCategoryTotal('savings');
    }, [budgetData]);

    const totalSpent = useMemo(() => {
        if (!budgetData) return 0;
        return calculateCategoryTotal('wants') + calculateCategoryTotal('needs');
    }, [budgetData]);

    const totalIncome = useMemo(() => {
        if (!budgetData) return 0;
        return calculateCategoryTotal('income');
    }, [budgetData]);

    const renderSubcategory = (subcategory, items) => {
        const total = items.reduce((sum, item) => sum + item.ammount, 0);
        
        return (
            <div key={subcategory} className="card-small mb-lg">
                <div className="flex-between mb-md">
                    <h4 className="text-lg font-bold text-gray-800 capitalize">
                        {subcategory.replace('_', ' ')}
                    </h4>
                    <div className="status-indicator status-success">
                        ${total.toFixed(2)}
                    </div>
                </div>
                {items.length > 0 ? (
                    <div className="space-y-sm">
                        {items.map((item, index) => (
                            <div key={index} className="flex-between p-sm bg-gradient-light rounded-lg">
                                <div className="flex-1">
                                    <span className="font-medium text-gray-800">{item.name}</span>
                                    <span className="text-gray-500 ml-md text-sm">{item.date}</span>
                                </div>
                                <div className="font-bold text-success">
                                    ${item.ammount.toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-lg text-gray-500">
                        <div className="text-2xl mb-sm">📭</div>
                        <p>No transactions in this category</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="page">
            <div className="container-wide">
                {/* Page Header */}
                <div className="page-header">
                    <h1 className="page-title">Budget Analysis</h1>
                    <p className="page-subtitle">Track your spending with the 50/30/20 rule</p>
                </div>
                
                {/* Action Section */}
                <div className="card mb-2xl">
                    <div className="flex-between mb-lg">
                        <div>
                            <h2 className="text-2xl font-bold text-primary mb-sm">Generate Your Budget</h2>
                            <p className="text-gray-600">Analyze your transactions and create a personalized budget plan</p>
                        </div>
                        <div className="text-right">
                            <div className="status-indicator status-info mb-sm">
                                {transactions ? `${transactions.length} transactions available` : 'No transactions'}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-center gap-lg">
                        <button 
                            onClick={generateBudget}
                            disabled={!transactions || transactions.length === 0}
                            className="btn btn-primary btn-lg"
                        >
                            🧮 Generate 50/30/20 Budget
                        </button>
                        
                        <div className="text-sm text-gray-500">
                            <details className="cursor-pointer">
                                <summary className="font-medium text-primary">📋 Categorization Rules</summary>
                                <div className="mt-md p-lg bg-gradient-light rounded-xl">
                                    <div className="grid grid-3 gap-md text-sm">
                        <div>
                                            <h4 className="font-bold text-success mb-sm">Needs (50%)</h4>
                                            <p>Groceries, medical, utilities, rent, insurance, basic transportation</p>
                        </div>
                        <div>
                                            <h4 className="font-bold text-warning mb-sm">Wants (30%)</h4>
                                            <p>Restaurants, entertainment, shopping, travel, ride-sharing</p>
                        </div>
                        <div>
                                            <h4 className="font-bold text-accent mb-sm">Savings (20%)</h4>
                                            <p>Leftover money after needs and wants (Income - Needs - Wants)</p>
                                        </div>
                                    </div>
                        </div>
                            </details>
                        </div>
                    </div>
                        </div>

                {!budgetData && (
                    <div className="card text-center p-3xl">
                        <div className="text-6xl mb-lg">📊</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-md">Ready to Analyze Your Budget?</h3>
                        <p className="text-gray-600 mb-lg">Click "Generate 50/30/20 Budget" to categorize your transactions and get insights.</p>
                        <div className="flex-center gap-md">
                            <div className="status-indicator status-info">💡 Tip: More transactions = better analysis</div>
                        </div>
                    </div>
                )}

                {budgetData && (
                    <div className="space-y-2xl">
                        {/* Budget Overview */}
                        <div className="card bg-gradient-card">
                            <h2 className="page-title text-center mb-2xl">📈 Budget Overview</h2>
                            <div className="grid grid-5 gap-lg">
                                <div className="card-small text-center bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                                    <div className="text-3xl mb-sm">💵</div>
                                    <h3 className="font-bold text-emerald-800 mb-sm">Income</h3>
                                    <p className="text-3xl font-bold text-emerald-600">${totalIncome.toFixed(2)}</p>
                                </div>
                                <div className="card-small text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                                    <div className="text-3xl mb-sm">🏠</div>
                                    <h3 className="font-bold text-blue-800 mb-sm">Needs (50%)</h3>
                                    <p className="text-3xl font-bold text-blue-600">${calculateCategoryTotal('needs').toFixed(2)}</p>
                                </div>
                                <div className="card-small text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                                    <div className="text-3xl mb-sm">🎯</div>
                                    <h3 className="font-bold text-purple-800 mb-sm">Wants (30%)</h3>
                                    <p className="text-3xl font-bold text-purple-600">${calculateCategoryTotal('wants').toFixed(2)}</p>
                                </div>
                                <div className="card-small text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                                    <div className="text-3xl mb-sm">💰</div>
                                    <h3 className="font-bold text-green-800 mb-sm">Savings (20%)</h3>
                                    <p className="text-3xl font-bold text-green-600">${calculateCategoryTotal('savings').toFixed(2)}</p>
            </div>
                                <div className="card-small text-center bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
                                    <div className="text-3xl mb-sm">📈</div>
                                    <h3 className="font-bold text-gray-800 mb-sm">Total Saved</h3>
                                    <p className="text-3xl font-bold text-gray-600">${totalSaved.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Income Section */}
                        <div className="card border-l-4 border-emerald-400">
                            <div className="flex-between mb-xl">
                                <div>
                                    <h2 className="text-3xl font-bold text-emerald-800 mb-sm">
                                        💵 Income
                                    </h2>
                                    <p className="text-gray-600">Total income from all sources</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-emerald-600">
                                        ${totalIncome.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                            {budgetData.income && budgetData.income.purchases.length > 0 ? (
                                <div className="space-y-sm">
                                    {budgetData.income.purchases.map((item, index) => (
                                        <div key={index} className="flex-between p-lg bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl">
                                            <div className="flex-1">
                                                <span className="font-bold text-gray-800">{item.name}</span>
                                                <span className="text-gray-500 ml-md text-sm">{item.date}</span>
                                            </div>
                                            <div className="font-bold text-emerald-600 text-xl">
                                                +${item.ammount.toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-3xl text-gray-500">
                                    <div className="text-4xl mb-md">💼</div>
                                    <p className="text-lg">No income transactions found</p>
                                </div>
                            )}
                        </div>

                        {/* Needs Section */}
                        <div className="card border-l-4 border-blue-400">
                            <div className="flex-between mb-xl">
                                                <div>
                                    <h2 className="text-3xl font-bold text-blue-800 mb-sm">
                                        🏠 Needs (50%)
                                    </h2>
                                    <p className="text-gray-600">Essential expenses for daily living</p>
                                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-blue-600">
                                        ${calculateCategoryTotal('needs').toFixed(2)}
                                                    </div>
                                            </div>
                                        </div>
                            <div className="grid grid-2 gap-lg">
                                {Object.entries(budgetData.needs.subcategories).map(([subcategory, items]) =>
                                    renderSubcategory(subcategory, items)
                                )}
                                    </div>
                        </div>

                        {/* Wants Section */}
                        <div className="card border-l-4 border-purple-400">
                            <div className="flex-between mb-xl">
                                <div>
                                    <h2 className="text-3xl font-bold text-purple-800 mb-sm">
                                        🎯 Wants (30%)
                                    </h2>
                                    <p className="text-gray-600">Discretionary spending and entertainment</p>
                                            </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-purple-600">
                                        ${calculateCategoryTotal('wants').toFixed(2)}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-2 gap-lg">
                                {Object.entries(budgetData.wants.subcategories).map(([subcategory, items]) =>
                                    renderSubcategory(subcategory, items)
                                                            )}
                                                        </div>
                                                    </div>

                        {/* Savings Section */}
                        <div className="card border-l-4 border-green-400">
                            <div className="flex-between mb-xl">
                                <div>
                                    <h2 className="text-3xl font-bold text-green-800 mb-sm">
                                        💰 Savings (20%)
                                    </h2>
                                    <p className="text-gray-600">Money left over after needs and wants (${totalIncome.toFixed(2)} - ${calculateCategoryTotal('needs').toFixed(2)} - ${calculateCategoryTotal('wants').toFixed(2)})</p>
                                            </div>
                                <div className="text-right">
                                    <div className={`text-4xl font-bold ${totalSaved >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {totalSaved >= 0 ? '+' : ''}${totalSaved.toFixed(2)}
                                    </div>
                                </div>
                    </div>

                            <div className="text-center p-3xl">
                                {totalSaved >= 0 ? (
                                    <>
                                        <div className="text-6xl mb-md">🎉</div>
                                        <h3 className="text-2xl font-bold text-green-600 mb-md">Great job!</h3>
                                        <p className="text-gray-600 text-lg mb-lg">
                                            You have ${totalSaved.toFixed(2)} left over for savings after covering your needs and wants.
                                        </p>
                                        <div className="status-indicator status-success">
                                            Savings Rate: {totalIncome > 0 ? ((totalSaved / totalIncome) * 100).toFixed(1) : 0}%
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-6xl mb-md">⚠️</div>
                                        <h3 className="text-2xl font-bold text-red-600 mb-md">Budget Deficit</h3>
                                        <p className="text-gray-600 text-lg mb-lg">
                                            You're spending ${Math.abs(totalSaved).toFixed(2)} more than your income. Consider reducing wants or increasing income.
                                        </p>
                                        <div className="status-indicator status-error">
                                            Overspending by {totalIncome > 0 ? ((Math.abs(totalSaved) / totalIncome) * 100).toFixed(1) : 0}%
                                        </div>
                                    </>
                            )}
                        </div>
                    </div>

                </div>
            )}
          </div>
        </div>
    );
}
