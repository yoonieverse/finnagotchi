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

    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
            <h2>Savings Goals & Transactions</h2>
            
            {/* Savings Goals Section */}
            <div style={{ marginBottom: "40px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h3>Savings Goals</h3>
                    <div>
                        <button 
                            onClick={() => setShowGoalForm(true)}
                            style={{
                                padding: "10px 20px",
                                backgroundColor: "#4CAF50",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                                marginRight: "10px"
                            }}
                        >
                            Create Goal
                        </button>
                        <button 
                            onClick={() => {
                                loadSavingsGoals();
                                setShowAllocationForm(true);
                            }}
                            style={{
                                padding: "10px 20px",
                                backgroundColor: "#2196F3",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                                marginRight: "10px"
                            }}
                        >
                            Log Allocation
                        </button>
                        <button 
                            onClick={loadSavingsGoals}
                            style={{
                                padding: "10px 20px",
                                backgroundColor: "#FF9800",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer"
                            }}
                        >
                            Refresh Goals
                        </button>
                    </div>
                </div>

                {/* Create Goal Form */}
                {showGoalForm && (
                    <div style={{
                        border: "1px solid #ddd",
                        padding: "20px",
                        borderRadius: "8px",
                        marginBottom: "20px",
                        backgroundColor: "#f9f9f9"
                    }}>
                        <h4>Create New Savings Goal</h4>
                        <form onSubmit={createSavingsGoal}>
                            <div style={{ marginBottom: "15px" }}>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                                    Goal Name:
                                </label>
                                <input
                                    type="text"
                                    value={goalForm.name}
                                    onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "8px",
                                        border: "1px solid #ccc",
                                        borderRadius: "4px"
                                    }}
                                />
                            </div>
                            <div style={{ marginBottom: "15px" }}>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                                    Target Amount ($):
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={goalForm.targetAmount}
                                    onChange={(e) => setGoalForm({ ...goalForm, targetAmount: e.target.value })}
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "8px",
                                        border: "1px solid #ccc",
                                        borderRadius: "4px"
                                    }}
                                />
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    style={{
                                        padding: "10px 20px",
                                        backgroundColor: "#4CAF50",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                        marginRight: "10px"
                                    }}
                                >
                                    Create Goal
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowGoalForm(false)}
                                    style={{
                                        padding: "10px 20px",
                                        backgroundColor: "#f44336",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "5px",
                                        cursor: "pointer"
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Log Allocation Form */}
                {showAllocationForm && (
                    <div style={{
                        border: "1px solid #ddd",
                        padding: "20px",
                        borderRadius: "8px",
                        marginBottom: "20px",
                        backgroundColor: "#f9f9f9"
                    }}>
                        <h4>Log Allocation to Goal</h4>
                        <p style={{ fontSize: "12px", color: "#666", margin: "0 0 15px 0" }}>
                            Available goals: {savingsGoals.length} found
                        </p>
                        <form onSubmit={logAllocation}>
                            <div style={{ marginBottom: "15px" }}>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                                    Select Goal:
                                </label>
                                <select
                                    value={allocationForm.goalId}
                                    onChange={(e) => setAllocationForm({ ...allocationForm, goalId: e.target.value })}
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "8px",
                                        border: "1px solid #ccc",
                                        borderRadius: "4px"
                                    }}
                                >
                                    <option value="">Choose a goal...</option>
                                    {savingsGoals.map((goal) => (
                                        <option key={goal.id} value={goal.id}>
                                            {goal.name} (${goal.currentAmount || 0} / ${goal.targetAmount})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: "15px" }}>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                                    Allocation Amount ($):
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={allocationForm.amount}
                                    onChange={(e) => setAllocationForm({ ...allocationForm, amount: e.target.value })}
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "8px",
                                        border: "1px solid #ccc",
                                        borderRadius: "4px"
                                    }}
                                />
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    style={{
                                        padding: "10px 20px",
                                        backgroundColor: "#2196F3",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                        marginRight: "10px"
                                    }}
                                >
                                    Log Allocation
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAllocationForm(false)}
                                    style={{
                                        padding: "10px 20px",
                                        backgroundColor: "#f44336",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "5px",
                                        cursor: "pointer"
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Display Savings Goals */}
                {savingsGoals.length > 0 ? (
                    <div>
                        {savingsGoals.map((goal) => {
                            const progress = getProgressPercentage(goal.currentAmount || 0, goal.targetAmount);
                            return (
                                <div key={goal.id} style={{
                                    border: "1px solid #ddd",
                                    padding: "20px",
                                    borderRadius: "8px",
                                    marginBottom: "15px",
                                    backgroundColor: "white"
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                        <h4 style={{ margin: 0 }}>{goal.name}</h4>
                                        <span style={{ fontWeight: "bold", color: progress >= 100 ? "#4CAF50" : "#2196F3" }}>
                                            ${goal.currentAmount || 0} / ${goal.targetAmount}
                                        </span>
                                    </div>
                                    
                                    {/* Progress Bar */}
                                    <div style={{
                                        width: "100%",
                                        backgroundColor: "#e0e0e0",
                                        borderRadius: "10px",
                                        overflow: "hidden",
                                        marginBottom: "10px"
                                    }}>
                                        <div style={{
                                            width: `${progress}%`,
                                            height: "20px",
                                            backgroundColor: progress >= 100 ? "#4CAF50" : "#2196F3",
                                            transition: "width 0.3s ease"
                                        }}></div>
                                    </div>
                                    
                                    <div style={{ fontSize: "14px", color: "#666" }}>
                                        {progress.toFixed(1)}% complete
                                    </div>

                                    {/* Recent Allocations */}
                                    {goal.allocations && goal.allocations.length > 0 && (
                                        <div style={{ marginTop: "15px" }}>
                                            <h5 style={{ margin: "0 0 10px 0", fontSize: "14px" }}>Recent Payments</h5>
                                            <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "12px" }}>
                                                {goal.allocations.slice(-3).map((allocation, index) => (
                                                    <li key={index}>
                                                        ${allocation.amount} on {new Date(allocation.date).toLocaleDateString()}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p style={{ textAlign: "center", color: "#666", fontStyle: "italic" }}>
                        No savings goals yet. Create your first goal to get started!
                    </p>
                )}
            </div>

            {/* Transactions Section */}
            <div>
                <h3></h3>
                {transactions && transactions.length > 0 ? (
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {transactions.map((tx, index) => (
                            <li key={index} style={{
                                border: "1px solid #ddd",
                                padding: "15px",
                                borderRadius: "8px",
                                marginBottom: "10px",
                                backgroundColor: "white"
                            }}>
                                <strong>{tx.name}</strong>: ${tx.amount} on {tx.date}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p style={{ textAlign: "center", color: "#666", fontStyle: "italic" }}>
                       
                    </p>
                )}
            </div>
        </div>
    );
}