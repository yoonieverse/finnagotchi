import { useContext, useState, useEffect } from "react";
import { TransactionContext } from "../contexts/transactionContext";

export function Goals() {
    const { transactions } = useContext(TransactionContext);
    const [savingsGoals, setSavingsGoals] = useState([]);
    const [showGoalForm, setShowGoalForm] = useState(false);
    const [showAllocationForm, setShowAllocationForm] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState("");
    const [goalForm, setGoalForm] = useState({ name: "", targetAmount: "" });
    const [allocationForm, setAllocationForm] = useState({ amount: "", goalId: "" });

    // Load savings goals from localStorage
    useEffect(() => {
        loadSavingsGoals();
    }, []);

    const loadSavingsGoals = () => {
        console.log("Loading savings goals from localStorage...");
        try {
            const storedGoals = localStorage.getItem('savingsGoals');
            if (storedGoals) {
                const goals = JSON.parse(storedGoals);
                // Sort by createdAt (newest first)
                goals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                console.log("Loaded goals:", goals);
                setSavingsGoals(goals);
            } else {
                console.log("No goals found in localStorage");
                setSavingsGoals([]);
            }
        } catch (error) {
            console.error("Error loading savings goals:", error);
            setSavingsGoals([]);
        }
    };

    const createSavingsGoal = (e) => {
        e.preventDefault();
        console.log("Creating savings goal...", goalForm);

        if (!goalForm.name || !goalForm.targetAmount) {
            console.error("Missing required fields");
            
        
            return;
        }

        try {
            const goalData = {
                id: Date.now().toString(), // Simple ID generation
                name: goalForm.name.trim(),
                targetAmount: parseFloat(goalForm.targetAmount),
                currentAmount: 0,
                createdAt: new Date().toISOString(),
                allocations: []
            };

            console.log("Goal data to save:", goalData);
            
            // Get existing goals from localStorage
            const existingGoals = JSON.parse(localStorage.getItem('savingsGoals') || '[]');
            
            // Add new goal
            const updatedGoals = [goalData, ...existingGoals];
            
            // Save to localStorage
            localStorage.setItem('savingsGoals', JSON.stringify(updatedGoals));
            console.log("Goal saved to localStorage with ID:", goalData.id);
            
            // Clear form and close modal
            setGoalForm({ name: "", targetAmount: "" });
            setShowGoalForm(false);
            
            // Reload goals
            loadSavingsGoals();
            
        } catch (error) {
            console.error("Error creating savings goal:", error);
          
        }
    };

    const logAllocation = (e) => {
        e.preventDefault();
        if (!allocationForm.goalId) {
           
            return;
        }

        try {
            const goal = savingsGoals.find(g => g.id === allocationForm.goalId);
            if (!goal) {
                
                return;
            }

            const allocationAmount = parseFloat(allocationForm.amount);
            if (isNaN(allocationAmount) || allocationAmount <= 0) {
              
                return;
            }

            const newCurrentAmount = (goal.currentAmount || 0) + allocationAmount;
            
            const allocation = {
                amount: allocationAmount,
                date: new Date().toISOString()
            };

            // Get all goals from localStorage
            const allGoals = JSON.parse(localStorage.getItem('savingsGoals') || '[]');
            
            // Update the specific goal
            const updatedGoals = allGoals.map(g => {
                if (g.id === allocationForm.goalId) {
                    return {
                        ...g,
                        currentAmount: newCurrentAmount,
                        allocations: [...(g.allocations || []), allocation]
                    };
                }
                return g;
            });

            // Save updated goals to localStorage
            localStorage.setItem('savingsGoals', JSON.stringify(updatedGoals));

            setAllocationForm({ amount: "", goalId: "" });
            setShowAllocationForm(false);
            loadSavingsGoals();
        } catch (error) {
            console.error("Error logging allocation:", error);
        }
    };

    const getProgressPercentage = (current, target) => {
        return Math.min((current / target) * 100, 100);
    };

    const deleteGoal = (goalId) => {
        if (window.confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
            try {
                // Get all goals from localStorage
                const allGoals = JSON.parse(localStorage.getItem('savingsGoals') || '[]');
                
                // Filter out the goal to delete
                const updatedGoals = allGoals.filter(goal => goal.id !== goalId);
                
                // Save updated goals to localStorage
                localStorage.setItem('savingsGoals', JSON.stringify(updatedGoals));
                
                // Reload goals to update the UI
                loadSavingsGoals();
                
                console.log('Goal deleted successfully');
            } catch (error) {
                console.error('Error deleting goal:', error);
            }
        }
    };

    return (
        <div className="page">
            <div className="container-wide">
                {/* Page Header */}
                <div className="page-header">
                    <h1 className="page-title">Financial Goals</h1>
                    <p className="page-subtitle">Set targets, track progress, and achieve your financial dreams</p>
                </div>

                {/* Action Section */}
                <div className="card mb-2xl">
                    <div className="flex-between mb-lg">
                        <div>
                            <h2 className="text-2xl font-bold text-primary mb-sm">Goal Management</h2>
                            <p className="text-gray-600">Create and manage your savings goals</p>
                        </div>
                        <div className="text-right">
                            <div className="status-indicator status-info mb-sm">
                                {savingsGoals.length} goal{savingsGoals.length !== 1 ? 's' : ''} created
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-center gap-lg">
                        <button 
                            onClick={() => setShowGoalForm(true)}
                            className="btn btn-primary btn-lg"
                        >
                            <span className="flex gap-sm">
                                <span>🎯 Create Goal</span>
                            </span>
                        </button>
                        
                        <button 
                            onClick={() => {
                                loadSavingsGoals();
                                setShowAllocationForm(true);
                            }}
                            className="btn btn-success btn-lg"
                        >
                            <span className="flex gap-sm">
                                <span>💰 Log Allocation</span>
                            </span>
                        </button>
                        
                        <button 
                            onClick={loadSavingsGoals}
                            className="btn btn-secondary btn-lg"
                        >
                            <span className="flex gap-sm">
                                <span>🔄 Refresh</span>
                            </span>
                        </button>
                    </div>
                </div>

                {/* Create Goal Form */}
                {showGoalForm && (
                    <div className="card bg-gradient-card mb-2xl">
                        <div className="text-center mb-2xl">
                            <div className="text-6xl mb-lg">🎯</div>
                            <h3 className="text-3xl font-bold text-primary mb-md">Create New Savings Goal</h3>
                            <p className="text-gray-600">Set a target and start tracking your progress</p>
                        </div>
                        
                        <form onSubmit={createSavingsGoal} className="max-w-2xl mx-auto">
                            <div className="grid grid-2 gap-lg mb-xl">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-sm">
                                        Goal Name
                                    </label>
                                    <input
                                        type="text"
                                        value={goalForm.name}
                                        onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                                        required
                                        placeholder="e.g., Emergency Fund, Vacation, New Car"
                                        className="input w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-sm">
                                        Target Amount ($)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={goalForm.targetAmount}
                                        onChange={(e) => setGoalForm({ ...goalForm, targetAmount: e.target.value })}
                                        required
                                        placeholder="0.00"
                                        className="input w-full"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex-center gap-lg">
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg"
                                >
                                    <span className="flex gap-sm">
                                        <span>✨ Create Goal</span>
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowGoalForm(false)}
                                    className="btn btn-secondary btn-lg"
                                >
                                    <span className="flex gap-sm">
                                        <span>❌ Cancel</span>
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Log Allocation Form */}
                {showAllocationForm && (
                    <div className="card bg-gradient-card mb-2xl">
                        <div className="text-center mb-2xl">
                            <div className="text-6xl mb-lg">💰</div>
                            <h3 className="text-3xl font-bold text-primary mb-md">Log Allocation to Goal</h3>
                            <p className="text-gray-600">Add money to your existing savings goals</p>
                        </div>
                        
                        <div className="status-indicator status-info mb-xl">
                            📊 Available goals: {savingsGoals.length} found
                        </div>
                        
                        <form onSubmit={logAllocation} className="max-w-2xl mx-auto">
                            <div className="grid grid-2 gap-lg mb-xl">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-sm">
                                        Select Goal
                                    </label>
                                    <select
                                        value={allocationForm.goalId}
                                        onChange={(e) => setAllocationForm({ ...allocationForm, goalId: e.target.value })}
                                        required
                                        className="input w-full"
                                    >
                                        <option value="">Choose a goal...</option>
                                        {savingsGoals.map((goal) => (
                                            <option key={goal.id} value={goal.id}>
                                                {goal.name} (${goal.currentAmount || 0} / ${goal.targetAmount})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-sm">
                                        Allocation Amount ($)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={allocationForm.amount}
                                        onChange={(e) => setAllocationForm({ ...allocationForm, amount: e.target.value })}
                                        required
                                        placeholder="0.00"
                                        className="input w-full"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex-center gap-lg">
                                <button
                                    type="submit"
                                    className="btn btn-success btn-lg"
                                >
                                    <span className="flex gap-sm">
                                        <span>💸 Log Allocation</span>
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAllocationForm(false)}
                                    className="btn btn-secondary btn-lg"
                                >
                                    <span className="flex gap-sm">
                                        <span>❌ Cancel</span>
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Display Savings Goals */}
                {savingsGoals.length > 0 ? (
                    <div className="space-y-2xl">
                        <div className="text-center mb-2xl">
                            <h2 className="text-3xl font-bold text-primary mb-md">Your Savings Goals</h2>
                            <p className="text-gray-600">Track your progress and celebrate milestones</p>
                        </div>
                        
                        <div className="grid grid-responsive gap-xl">
                            {savingsGoals.map((goal) => {
                                const progress = getProgressPercentage(goal.currentAmount || 0, goal.targetAmount);
                                const isComplete = progress >= 100;
                                const remaining = goal.targetAmount - (goal.currentAmount || 0);
                                
                                return (
                                    <div key={goal.id} className="card hover:scale-105 transition">
                                        <div className="flex-between mb-lg">
                                            <div className="flex-1">
                                                <h3 className="text-2xl font-bold text-gray-800 mb-sm">{goal.name}</h3>
                                                <p className="text-gray-600">Created {new Date(goal.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-3xl font-bold ${isComplete ? 'text-success' : 'text-primary'}`}>
                                                    ${(goal.currentAmount || 0).toLocaleString()}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    of ${goal.targetAmount.toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="ml-lg">
                                                <button
                                                    onClick={() => deleteGoal(goal.id)}
                                                    className="btn btn-error btn-sm"
                                                    title="Delete this goal"
                                                >
                                                    <span className="flex gap-sm">
                                                        <span>🗑️</span>
                                                        <span>Delete</span>
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {/* Progress Bar */}
                                        <div className="mb-lg">
                                            <div className="progress-bar">
                                                <div 
                                                    className={`progress-fill ${isComplete ? 'bg-success' : 'bg-primary'}`}
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex-between mt-sm">
                                                <span className="text-sm font-semibold text-gray-600">
                                                    {progress.toFixed(1)}% complete
                                                </span>
                                                {!isComplete && (
                                                    <span className="text-sm text-gray-500">
                                                        ${remaining.toLocaleString()} remaining
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="mb-lg">
                                            {isComplete ? (
                                                <div className="status-indicator status-success">
                                                    🎉 Goal Achieved! Congratulations!
                                                </div>
                                            ) : (
                                                <div className="status-indicator status-info">
                                                    🎯 Keep going! You're making great progress
                                                </div>
                                            )}
                                        </div>

                                        {/* Recent Allocations */}
                                        {goal.allocations && goal.allocations.length > 0 && (
                                            <div className="card-small bg-gradient-light">
                                                <h4 className="font-bold text-gray-800 mb-md flex items-center gap-sm">
                                                    <span>💸</span>
                                                    Recent Payments
                                                </h4>
                                                <div className="space-y-sm">
                                                    {goal.allocations.slice(-3).map((allocation, index) => (
                                                        <div key={index} className="flex-between p-sm bg-white rounded-lg">
                                                            <span className="font-semibold text-success">
                                                                +${allocation.amount.toLocaleString()}
                                                            </span>
                                                            <span className="text-sm text-gray-500">
                                                                {new Date(allocation.date).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="card text-center p-3xl">
                        <div className="text-6xl mb-lg">🎯</div>
                        <h3 className="text-2xl font-bold text-gray-600 mb-md">No Goals Yet</h3>
                        <p className="text-lg text-gray-500 mb-lg">Create your first savings goal to start tracking your financial progress</p>
                        <button 
                            onClick={() => setShowGoalForm(true)}
                            className="btn btn-primary btn-lg"
                        >
                            <span className="flex gap-sm">
                                <span>✨ Create Your First Goal</span>
                            </span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}