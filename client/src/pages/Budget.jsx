import { useContext, useState, useMemo, useEffect } from "react";
import { TransactionContext } from "../contexts/transactionContext";
import { getAuth } from "firebase/auth";

export function Budget() {
    const { transactions } = useContext(TransactionContext);
    const [budgetData, setBudgetData] = useState(null);
    const [budgetConfig, setBudgetConfig] = useState({
        needs: 50,
        wants: 30,
        savings: 20,
        monthlyIncome: 0
    });
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const auth = getAuth();

    // Load saved budget configuration
    useEffect(() => {
        const loadBudgetConfig = async () => {
            try {
                const response = await fetch(`http://localhost:3333/budget/${auth.currentUser?.uid}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.config) {
                        setBudgetConfig(data.config);
                    }
                }
            } catch (error) {
                console.error('Error loading budget config:', error);
            }
        };

        if (auth.currentUser) {
            loadBudgetConfig();
        }
    }, [auth.currentUser]);

    // Enhanced categorization function
    const categorizeTransaction = (transaction) => {
        const name = (transaction.name || transaction.description || '').toLowerCase();
        const category = transaction.personal_finance_category?.primary?.toLowerCase() || '';
        const detailedCategory = transaction.personal_finance_category?.detailed?.toLowerCase() || '';
        const amount = transaction.amount;
        
        // INCOME - Handle all forms of income (regardless of sign)
        if (category === 'income' || 
            category === 'transfer_in' ||
            detailedCategory === 'income_wages' ||
            detailedCategory === 'income_salary' ||
            detailedCategory === 'transfer_in_savings' ||
            name.includes('direct deposit') ||
            name.includes('paycheck') ||
            name.includes('salary') ||
            name.includes('wage') ||
            name.includes('refund') ||
            name.includes('part-time job')) {
            return { type: 'income', subcategory: 'income' };
        }
        
        // Skip savings categorization - we'll calculate this as leftover money
        
        // NEEDS categories - Essential expenses only
        if (
            // Groceries (but not restaurants)
            (category === 'food_and_drink' && (
                detailedCategory === 'food_and_drink_groceries' ||
                name.includes('grocery') || 
                name.includes('heb') ||
                name.includes('walmart') && name.includes('groceries') ||
                name.includes('kroger') ||
                name.includes('safeway')
            )) ||
            // Medical
            category === 'medical' ||
            detailedCategory.includes('medical') ||
            name.includes('hospital') ||
            name.includes('doctor') ||
            name.includes('pharmacy') ||
            // Essential transportation (gas, public transit, car payments)
            (category === 'transportation' && (
                detailedCategory === 'transportation_gas' ||
                detailedCategory === 'transportation_public' ||
                detailedCategory === 'transportation_other' ||
                name.includes('gas station') ||
                name.includes('shell') ||
                name.includes('exxon') ||
                name.includes('car payment') ||
                name.includes('auto loan')
            )) ||
            // Rent and utilities
            category === 'rent_and_utilities' ||
            name.includes('rent') ||
            name.includes('electric') ||
            name.includes('water') ||
            name.includes('gas bill') ||
            name.includes('internet') ||
            name.includes('phone') ||
            // Government/taxes
            category === 'government_and_non_profit' ||
            // Insurance
            name.includes('insurance')
        ) {
            // Determine subcategory for needs
            if (category === 'food_and_drink') {
                return { type: 'needs', subcategory: 'groceries' };
            } else if (category === 'medical') {
                return { type: 'needs', subcategory: 'healthcare' };
            } else if (category === 'transportation') {
                return { type: 'needs', subcategory: 'transportation' };
            } else if (category === 'rent_and_utilities' || name.includes('rent') || name.includes('electric') || name.includes('water')) {
                return { type: 'needs', subcategory: 'housing' };
            } else if (category === 'government_and_non_profit') {
                return { type: 'needs', subcategory: 'taxes' };
            } else if (name.includes('insurance')) {
                return { type: 'needs', subcategory: 'insurance' };
            }
            return { type: 'needs', subcategory: 'other' };
        }
        
        // WANTS categories - Everything else that's spending
        if (category === 'food_and_drink' && !name.includes('grocery')) {
            return { type: 'wants', subcategory: 'dining' };
        } else if (category === 'entertainment' || 
                   name.includes('netflix') || 
                   name.includes('spotify') || 
                   name.includes('movie') ||
                   name.includes('steam') ||
                   name.includes('game')) {
            return { type: 'wants', subcategory: 'entertainment' };
        } else if (category === 'travel' || name.includes('hotel') || name.includes('flight') || name.includes('uber') || name.includes('lyft')) {
            return { type: 'wants', subcategory: 'travel' };
        } else if (category === 'general_merchandise' || category === 'shopping') {
            return { type: 'wants', subcategory: 'shopping' };
        }
        
        // Default to miscellaneous for wants
        return { type: 'wants', subcategory: 'miscellaneous' };
    };

    // Filter transactions by selected month and calculate if month is in progress
    const { monthlyTransactions, monthProgress, isCurrentMonth, daysInMonth, daysPassed } = useMemo(() => {
        if (!transactions) return { monthlyTransactions: [], monthProgress: 0, isCurrentMonth: false, daysInMonth: 0, daysPassed: 0 };
        
        const filtered = transactions.filter(transaction => {
            // Handle different possible date field names
            const dateStr = transaction.date || transaction.date_transacted || transaction.date_posted;
            if (!dateStr) return false;
            
            const transactionDate = new Date(dateStr);
            // Add one month since the date is showing one month behind
            transactionDate.setMonth(transactionDate.getMonth() + 1);
            const transactionMonth = transactionDate.toISOString().slice(0, 7);
            return transactionMonth === selectedMonth;
        });

        console.log(`Filtered transactions for ${selectedMonth}:`, filtered.length); // Debug log

        // Calculate month progress
        const now = new Date();
        const currentMonth = now.toISOString().slice(0, 7);
        const isCurrentMonth = selectedMonth === currentMonth;
        
        // Parse the selected month correctly (YYYY-MM format)
        const [year, month] = selectedMonth.split('-').map(Number);
        const monthDate = new Date(year, month - 1, 1); // month - 1 because Date months are 0-based
        const daysInMonth = new Date(year, month, 0).getDate(); // Last day of the month
        const daysPassed = isCurrentMonth ? now.getDate() : daysInMonth;
        const monthProgress = daysPassed / daysInMonth;

        return { 
            monthlyTransactions: filtered, 
            monthProgress, 
            isCurrentMonth, 
            daysInMonth, 
            daysPassed 
        };
    }, [transactions, selectedMonth]);

    // Process transactions into categories
    const processedData = useMemo(() => {
        if (!monthlyTransactions.length) return null;

        const data = {
            income: { total: 0, transactions: [] },
            needs: { total: 0, budget: 0, transactions: [], subcategories: {} },
            wants: { total: 0, budget: 0, transactions: [], subcategories: {} },
            savings: { total: 0, budget: 0, transactions: [], subcategories: {} },
            monthProgress,
            isCurrentMonth,
            daysInMonth,
            daysPassed
        };

        monthlyTransactions.forEach(transaction => {
            const { type, subcategory } = categorizeTransaction(transaction);
            const amount = Math.abs(transaction.amount);
            
            const transactionItem = {
                id: transaction.transaction_id || Math.random(),
                name: transaction.name || 'Unknown Transaction',
                amount: amount,
                date: transaction.date,
                category: subcategory
            };

            if (type === 'income') {
                data.income.total += amount;
                data.income.transactions.push(transactionItem);
            } else if (type === 'needs' || type === 'wants') {
                data[type].total += amount;
                data[type].transactions.push(transactionItem);
                
                if (!data[type].subcategories[subcategory]) {
                    data[type].subcategories[subcategory] = { total: 0, transactions: [] };
                }
                data[type].subcategories[subcategory].total += amount;
                data[type].subcategories[subcategory].transactions.push(transactionItem);
            }
            // Skip savings transactions - we'll calculate savings as leftover
        });

        // Calculate budget amounts based on income or configured monthly income
        const totalIncome = data.income.total || budgetConfig.monthlyIncome;
        data.needs.budget = (totalIncome * budgetConfig.needs) / 100;
        data.wants.budget = (totalIncome * budgetConfig.wants) / 100;
        data.savings.budget = (totalIncome * budgetConfig.savings) / 100;

        // Calculate actual savings as income minus expenses
        const totalExpenses = data.needs.total + data.wants.total;
        data.savings.total = Math.max(0, data.income.total - totalExpenses);
        
        // Create a summary transaction for savings
        if (data.savings.total > 0) {
            data.savings.transactions.push({
                id: 'calculated_savings',
                name: 'Calculated Monthly Savings',
                amount: data.savings.total,
                date: selectedMonth + '-01',
                category: 'leftover'
            });
            data.savings.subcategories.leftover = {
                total: data.savings.total,
                transactions: [{
                    id: 'calculated_savings',
                    name: 'Money left after expenses',
                    amount: data.savings.total,
                    date: selectedMonth + '-01',
                    category: 'leftover'
                }]
            };
        }

        return data;
    }, [monthlyTransactions, budgetConfig, monthProgress, isCurrentMonth, daysInMonth, daysPassed]);

    const saveBudgetConfig = async () => {
        try {
            const response = await fetch('http://localhost:3333/budget', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    config: budgetConfig,
                    uid: auth.currentUser.uid
                }),
            });

            if (response.ok) {
                setIsEditingBudget(false);
                alert('Budget configuration saved successfully!');
            }
        } catch (error) {
            console.error('Error saving budget config:', error);
            alert('Error saving budget configuration');
        }
    };

    const handleBudgetChange = (category, value) => {
        const numValue = parseInt(value) || 0;
        const updatedConfig = { ...budgetConfig, [category]: numValue };
        
        // Auto-adjust other percentages to maintain 100% total
        if (category !== 'monthlyIncome') {
            const total = updatedConfig.needs + updatedConfig.wants + updatedConfig.savings;
            if (total !== 100) {
                const difference = 100 - total;
                // Distribute the difference proportionally to other categories
                const others = Object.keys(updatedConfig).filter(key => key !== category && key !== 'monthlyIncome');
                const adjustment = difference / others.length;
                others.forEach(key => {
                    updatedConfig[key] = Math.max(0, Math.round(updatedConfig[key] + adjustment));
                });
            }
        }
        
        setBudgetConfig(updatedConfig);
    };

    const getBudgetStatus = (spent, budget, isIncomplete = false, monthProgress = 1, category = '') => {
        if (budget === 0) return { status: 'neutral', percentage: 0, message: '' };
        
        let percentage = (spent / budget) * 100;
        let message = '';
        
        // Special handling for savings category
        if (category === 'savings') {
            if (isIncomplete && monthProgress > 0) {
                const projectedSavings = spent / monthProgress;
                const projectedPercentage = (projectedSavings / budget) * 100;
                
                if (projectedPercentage >= 120) {
                    message = "🎉 Amazing! You're on track to exceed your savings goal!";
                    return { status: 'excellent', percentage, message, pace: 'excellent' };
                } else if (projectedPercentage >= 100) {
                    message = "💪 Great job! You're on track to meet your savings goal!";
                    return { status: 'good', percentage, message, pace: 'on-track' };
                } else if (projectedPercentage >= 80) {
                    message = "📈 You're building savings! Keep it up!";
                    return { status: 'good', percentage, message, pace: 'building' };
                } else if (projectedPercentage >= 50) {
                    message = "💡 Consider reducing expenses to boost savings.";
                    return { status: 'warning', percentage, message, pace: 'low' };
                } else {
                    message = "⚡ Focus on cutting costs to increase savings!";
                    return { status: 'warning', percentage, message, pace: 'very-low' };
                }
            } else {
                // Complete month savings messages
                if (percentage >= 120) {
                    message = "🏆 Exceptional savings this month!";
                    return { status: 'excellent', percentage, message };
                } else if (percentage >= 100) {
                    message = "✅ Hit your savings target!";
                    return { status: 'good', percentage, message };
                } else if (percentage >= 80) {
                    message = "👍 Good savings progress!";
                    return { status: 'good', percentage, message };
                } else {
                    message = "💪 Room to improve savings next month!";
                    return { status: 'warning', percentage, message };
                }
            }
        }
        
        // Original logic for needs/wants categories
        if (isIncomplete && monthProgress > 0) {
            const expectedSpent = budget * monthProgress;
            const spendingPace = spent / expectedSpent;
            
            if (spendingPace <= 0.8) {
                message = "You're doing great! Well under budget pace.";
                return { status: 'excellent', percentage, message, pace: 'under' };
            } else if (spendingPace <= 1.0) {
                message = "On track! Spending at a good pace.";
                return { status: 'good', percentage, message, pace: 'on-track' };
            } else if (spendingPace <= 1.2) {
                message = "Might want to slow down spending this category.";
                return { status: 'warning', percentage, message, pace: 'over' };
            } else {
                message = "🚨 Spending too fast! You'll exceed budget.";
                return { status: 'danger', percentage, message, pace: 'danger' };
            }
        } else {
            // Complete month logic
            if (percentage <= 80) {
                message = "Great job staying under budget!";
                return { status: 'good', percentage, message };
            }
            if (percentage <= 100) {
                message = "Close to budget limit.";
                return { status: 'warning', percentage, message };
            }
            message = "Over budget this month.";
            return { status: 'over', percentage, message };
        }
    };

    const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

    const getAvailableMonths = () => {
        if (!transactions) return [];
        const months = new Set();
        transactions.forEach(transaction => {
            // Handle different possible date field names
            const dateStr = transaction.date || transaction.date_transacted || transaction.date_posted;
            if (dateStr) {
                const transactionDate = new Date(dateStr);
                // Add one month since the date is showing one month behind
                transactionDate.setMonth(transactionDate.getMonth() + 1);
                const month = transactionDate.toISOString().slice(0, 7);
                months.add(month);
            }
        });
        console.log('Available months:', Array.from(months)); // Debug log
        return Array.from(months).sort().reverse();
    };

    const StatusIndicator = ({ status, percentage, message, pace }) => {
        const colors = {
            excellent: 'bg-green-100 text-green-800',
            good: 'bg-green-100 text-green-800',
            warning: 'bg-yellow-100 text-yellow-800',
            danger: 'bg-red-100 text-red-800',
            over: 'bg-red-100 text-red-800',
            neutral: 'bg-gray-100 text-gray-800'
        };
        
        const paceIcons = {
            under: '👍',
            'on-track': '✅',
            over: '⚠️',
            danger: '🚨',
            excellent: '🎉',
            building: '📈',
            low: '💡',
            'very-low': '⚡'
        };
        
        return (
            <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
                    {pace && paceIcons[pace]} {percentage.toFixed(0)}%
                </span>
                {message && (
                    <div className="text-xs text-gray-600 mt-1 max-w-32">
                        {message}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="page">
            <div className="container-wide">
                {/* Header */}
                <div className="flex-between mb-xl">
                    <h1 className="page-title">Budget Tracker</h1>
                    <div className="flex gap-md">
                        <select 
                            value={selectedMonth} 
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="input"
                        >
                            {getAvailableMonths().map(month => (
                                <option key={month} value={month}>
                                    {new Date(month + '-01').toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long' 
                                    })}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

            {/* Budget Configuration */}
            <div className="card mb-xl">
                <div className="flex-between mb-md">
                    <h2 className="text-xl font-semibold">Budget Configuration</h2>
                    <button
                        onClick={() => setIsEditingBudget(!isEditingBudget)}
                        className="btn btn-primary"
                    >
                        {isEditingBudget ? 'Cancel' : 'Edit Budget'}
                    </button>
                </div>
                
                {isEditingBudget ? (
                    <div className="grid grid-4 gap-md">
                        <div className="input-group">
                            <label className="input-label">
                                Monthly Income ($)
                            </label>
                            <input
                                type="number"
                                value={budgetConfig.monthlyIncome}
                                onChange={(e) => handleBudgetChange('monthlyIncome', e.target.value)}
                                className="input"
                                placeholder="Enter monthly income"
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">
                                Needs (%)
                            </label>
                            <input
                                type="number"
                                value={budgetConfig.needs}
                                onChange={(e) => handleBudgetChange('needs', e.target.value)}
                                className="input"
                                min="0"
                                max="100"
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">
                                Wants (%)
                            </label>
                            <input
                                type="number"
                                value={budgetConfig.wants}
                                onChange={(e) => handleBudgetChange('wants', e.target.value)}
                                className="input"
                                min="0"
                                max="100"
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">
                                Savings (%)
                            </label>
                            <input
                                type="number"
                                value={budgetConfig.savings}
                                onChange={(e) => handleBudgetChange('savings', e.target.value)}
                                className="input"
                                min="0"
                                max="100"
                            />
                        </div>
                        <div className="flex-end mt-md" style={{gridColumn: 'span 4'}}>
                            <button
                                onClick={saveBudgetConfig}
                                className="btn btn-success"
                            >
                                Save Budget Configuration
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-4 gap-md text-sm">
                        <div className="text-center p-md bg-gray-50 rounded">
                            <div className="font-semibold">Monthly Income</div>
                            <div className="text-lg">{formatCurrency(budgetConfig.monthlyIncome)}</div>
                        </div>
                        <div className="text-center p-md bg-primary-lightest rounded">
                            <div className="font-semibold">Needs</div>
                            <div className="text-lg">{budgetConfig.needs}%</div>
                        </div>
                        <div className="text-center p-md bg-accent-lighter rounded">
                            <div className="font-semibold">Wants</div>
                            <div className="text-lg">{budgetConfig.wants}%</div>
                        </div>
                        <div className="text-center p-md bg-success-light rounded">
                            <div className="font-semibold">Savings</div>
                            <div className="text-lg">{budgetConfig.savings}%</div>
                        </div>
                    </div>
                )}
            </div>

            {processedData && (
                <>
                    {/* Monthly Overview */}
                    <div className="card mb-xl">
                        <div className="flex-between mb-md">
                            <h2 className="text-xl font-semibold">
                                Monthly Overview - {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long' 
                                })}
                            </h2>
                            {processedData.isCurrentMonth && (
                                <div className="status-indicator status-info">
                                    Day {processedData.daysPassed} of {processedData.daysInMonth} 
                                    ({(processedData.monthProgress * 100).toFixed(0)}% complete)
                                </div>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-green-800">Total Income</h3>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatCurrency(processedData.income.total)}
                                </p>
                                <p className="text-sm text-green-600">
                                    {processedData.income.transactions.length} transactions
                                </p>
                            </div>
                            
                            {['needs', 'wants', 'savings'].map(category => {
                                const data = processedData[category];
                                const status = getBudgetStatus(
                                    data.total, 
                                    data.budget, 
                                    processedData.isCurrentMonth, 
                                    processedData.monthProgress,
                                    category
                                );
                                const colors = {
                                    needs: 'blue',
                                    wants: 'purple', 
                                    savings: 'green'
                                };
                                const color = colors[category];
                                
                                return (
                                    <div key={category} className={`bg-${color}-50 p-4 rounded-lg`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className={`font-semibold text-${color}-800 capitalize`}>
                                                {category}
                                            </h3>
                                            <StatusIndicator {...status} />
                                        </div>
                                        <p className={`text-2xl font-bold text-${color}-600`}>
                                            {formatCurrency(data.total)}
                                        </p>
                                        <p className={`text-sm text-${color}-600`}>
                                            Budget: {formatCurrency(data.budget)}
                                            {processedData.isCurrentMonth && category !== 'savings' && (
                                                <span className="ml-2 text-gray-500">
                                                    (Expected: {formatCurrency(data.budget * processedData.monthProgress)})
                                                </span>
                                            )}
                                        </p>
                                        <p className={`text-sm text-${color}-600`}>
                                            {category === 'savings' ? 'Money left over' : `${data.transactions.length} transactions`}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Budget Progress Bars */}
                        <div className="space-y-4">
                            {['needs', 'wants', 'savings'].map(category => {
                                const data = processedData[category];
                                const percentage = data.budget > 0 ? Math.min((data.total / data.budget) * 100, 100) : 0;
                                const overBudget = data.total > data.budget;
                                const expectedSpending = processedData.isCurrentMonth ? data.budget * processedData.monthProgress : data.budget;
                                
                                return (
                                    <div key={category}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-medium capitalize">{category}</span>
                                            <div className="text-sm text-right">
                                                <div>
                                                    {formatCurrency(data.total)} / {formatCurrency(data.budget)}
                                                    {overBudget && (
                                                        <span className="text-red-500 ml-2">
                                                            (+{formatCurrency(data.total - data.budget)} over)
                                                        </span>
                                                    )}
                                                </div>
                                                {processedData.isCurrentMonth && (
                                                    <div className="text-xs text-gray-500">
                                                        Expected by now: {formatCurrency(expectedSpending)}
                                                        {data.total > expectedSpending && (
                                                            <span className="text-orange-500 ml-1">
                                                                (+{formatCurrency(data.total - expectedSpending)} ahead)
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3 relative">
                                            {/* Expected progress line for current month */}
                                            {processedData.isCurrentMonth && (
                                                <div 
                                                    className="absolute top-0 h-3 w-1 bg-gray-400 rounded-full z-10"
                                                    style={{ left: `${Math.min(processedData.monthProgress * 100, 100)}%` }}
                                                    title={`Expected progress: ${(processedData.monthProgress * 100).toFixed(0)}%`}
                                                />
                                            )}
                                            <div
                                                className={`h-3 rounded-full transition-all duration-300 ${
                                                    overBudget ? 'bg-red-500' : 
                                                    processedData.isCurrentMonth && data.total > expectedSpending ? 'bg-orange-500' :
                                                    percentage > 80 ? 'bg-yellow-500' : 
                                                    'bg-green-500'
                                                }`}
                                                style={{ width: `${Math.min(percentage, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* In-Progress Month Insights */}
                        {processedData.isCurrentMonth && (
                            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="font-semibold text-blue-800 mb-2">📊 Month in Progress Insights</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    {['needs', 'wants'].map(category => {
                                        const data = processedData[category];
                                        const expectedSpent = data.budget * processedData.monthProgress;
                                        const remaining = data.budget - data.total;
                                        const daysLeft = processedData.daysInMonth - processedData.daysPassed;
                                        const dailyBudget = remaining / Math.max(daysLeft, 1);
                                        
                                        return (
                                            <div key={category} className="bg-white p-3 rounded border">
                                                <h4 className="font-medium capitalize mb-1">{category}</h4>
                                                <p className="text-xs text-gray-600">
                                                    {remaining > 0 
                                                        ? `${formatCurrency(remaining)} left (${formatCurrency(dailyBudget)}/day)` 
                                                        : `${formatCurrency(Math.abs(remaining))} over budget`
                                                    }
                                                </p>
                                                {data.total > expectedSpent && remaining > 0 && (
                                                    <p className="text-xs text-orange-600 mt-1">
                                                        Spending {formatCurrency(dailyBudget)} daily to stay on track
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                    <div className="bg-white p-3 rounded border">
                                        <h4 className="font-medium mb-1">Projected Savings</h4>
                                        <p className="text-xs text-gray-600">
                                            At current pace: {formatCurrency(processedData.savings.total / processedData.monthProgress)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Goal: {formatCurrency(processedData.savings.budget)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Detailed Breakdown */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {['needs', 'wants', 'savings'].map(category => {
                            const data = processedData[category];
                            const colors = {
                                needs: 'blue',
                                wants: 'purple',
                                savings: 'green'
                            };
                            const color = colors[category];
                            
                            return (
                                <div key={category} className="bg-white border border-gray-200 rounded-lg">
                                    <div className={`bg-${color}-50 p-4 border-b`}>
                                        <h3 className={`text-lg font-semibold text-${color}-800 capitalize`}>
                                            {category} - {formatCurrency(data.total)}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Budget: {formatCurrency(data.budget)} | 
                                            Remaining: {formatCurrency(Math.max(0, data.budget - data.total))}
                                        </p>
                                    </div>
                                    
                                    <div className="p-4 max-h-96 overflow-y-auto">
                                        {category === 'savings' ? (
                                            // Special handling for savings section
                                            <div className="text-center py-8">
                                                <div className="text-4xl mb-4">💰</div>
                                                <h4 className="font-semibold text-lg mb-2">
                                                    Your Monthly Savings
                                                </h4>
                                                <p className="text-2xl font-bold text-green-600 mb-2">
                                                    {formatCurrency(data.total)}
                                                </p>
                                                <p className="text-sm text-gray-600 mb-1">
                                                    Income: {formatCurrency(processedData.income.total)}
                                                </p>
                                                <p className="text-sm text-gray-600 mb-1">
                                                    Expenses: {formatCurrency(processedData.needs.total + processedData.wants.total)}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-3">
                                                    Savings = Income - (Needs + Wants)
                                                </p>
                                                {data.total < data.budget && (
                                                    <p className="text-sm text-blue-600 mt-2">
                                                        💡 {processedData.isCurrentMonth 
                                                            ? `You're on track! ${formatCurrency(data.budget - data.total)} left to save this month.`
                                                            : `Try to save ${formatCurrency(data.budget - data.total)} more to reach your savings goal!`
                                                        }
                                                    </p>
                                                )}
                                                {data.total >= data.budget && (
                                                    <p className="text-sm text-green-600 mt-2">
                                                        🎉 {processedData.isCurrentMonth 
                                                            ? "Excellent! You're exceeding your savings goal this month!"
                                                            : `Great job! You saved ${formatCurrency(data.total - data.budget)} more than your goal!`
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        ) : Object.keys(data.subcategories).length > 0 ? (
                                            <div className="space-y-4">
                                                {Object.entries(data.subcategories).map(([subcat, subData]) => (
                                                    <div key={subcat}>
                                                        <h4 className="font-medium capitalize mb-2">
                                                            {subcat.replace('_', ' ')} - {formatCurrency(subData.total)}
                                                        </h4>
                                                        <div className="space-y-1 ml-2">
                                                            {subData.transactions.slice(0, 5).map(transaction => (
                                                                <div key={transaction.id} className="flex justify-between text-sm">
                                                                    <span className="truncate flex-1 mr-2">
                                                                        {transaction.name}
                                                                    </span>
                                                                    <span className="font-medium">
                                                                        {formatCurrency(transaction.amount)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                            {subData.transactions.length > 5 && (
                                                                <div className="text-xs text-gray-500">
                                                                    +{subData.transactions.length - 5} more transactions
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-center py-4">
                                                No {category} transactions this month
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Income Transactions */}
                    <div className="bg-white border border-gray-200 rounded-lg">
                        <div className="bg-green-50 p-4 border-b">
                            <h3 className="text-lg font-semibold text-green-800">
                                Income Transactions - {formatCurrency(processedData.income.total)}
                            </h3>
                        </div>
                        <div className="p-4">
                            {processedData.income.transactions.length > 0 ? (
                                <div className="space-y-2">
                                    {processedData.income.transactions.map(transaction => (
                                        <div key={transaction.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                                            <div>
                                                <div className="font-medium">{transaction.name}</div>
                                                <div className="text-sm text-gray-500">
                                                    {new Date(transaction.date).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="font-semibold text-green-600">
                                                {formatCurrency(transaction.amount)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">
                                    No income transactions found this month
                                </p>
                            )}
                        </div>
                    </div>

                    {/* JSON Output for Development */}
                    <details className="bg-gray-50 p-4 rounded">
                        <summary className="font-semibold cursor-pointer">View Raw Budget Data JSON (for development)</summary>
                        <pre className="mt-2 text-xs overflow-x-auto bg-white p-2 rounded">
                            {JSON.stringify(processedData, null, 2)}
                        </pre>
                    </details>

                    {/* Raw Transactions JSON for Development */}
                    <details className="bg-blue-50 p-4 rounded">
                        <summary className="font-semibold cursor-pointer">View Raw Transactions JSON (for development)</summary>
                        <div className="mt-2 space-y-2">
                            <div className="text-sm text-blue-600">
                                Total transactions: {transactions ? transactions.length : 0}
                            </div>
                            <div className="text-sm text-blue-600">
                                Monthly transactions ({selectedMonth}): {monthlyTransactions ? monthlyTransactions.length : 0}
                            </div>
                            <pre className="text-xs overflow-x-auto bg-white p-2 rounded max-h-96">
                                {JSON.stringify(transactions, null, 2)}
                            </pre>
                        </div>
                    </details>
                </>
            )}

            {!processedData && (
                <div className="text-center py-8">
                    <p className="text-gray-500">
                        {monthlyTransactions.length === 0 
                            ? 'No transactions found for the selected month.' 
                            : 'Loading budget analysis...'
                        }
                    </p>
                </div>
            )}
            </div>
        </div>
    );
}