import { getAuth } from 'firebase/auth';
import { useState, useEffect, useContext } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { TransactionContext } from '../contexts/transactionContext';

export function Home() {
    const [user, setUser] = useState(null);
    const [budgetPref, setBudgetPref] = useState({ needs: 50, wants: 30, savings: 20 });
    const { transactions } = useContext(TransactionContext);
    const auth = getAuth();
    
    useEffect(() => {
        const getuser = async() => {
            const res = await fetch(`http://localhost:3333/user?uid=${auth.currentUser.uid}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                });

                if (!res.ok) throw new Error("Network response was not ok");
                const data = await res.json();
                console.log(data)
                setUser(data);
        }
        getuser();
    },[])

    const formattedBudget = Object.entries(budgetPref).map(([key, value]) => ({
        name: key,
        value,
    }));

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B'];
    const total = formattedBudget.reduce((sum, entry) => sum + entry.value, 0);

    // Sample goals data
    const goals = [
        { name: 'Groceries', progress: 75, target: 500, current: 375 },
        { name: 'Rent', progress: 100, target: 1200, current: 1200 },
        { name: 'Car', progress: 45, target: 300, current: 135 },
        { name: 'Down Payment', progress: 20, target: 10000, current: 2000 },
        { name: 'Portfolio', progress: 60, target: 5000, current: 3000 }
    ];

    // Sample recent transactions
    const recentTransactions = transactions?.slice(0, 5) || [
        { date: '2024-01-15', amount: -45.50, type: 'Groceries', name: 'Whole Foods' },
        { date: '2024-01-14', amount: -1200.00, type: 'Rent', name: 'Monthly Rent' },
        { date: '2024-01-13', amount: -25.99, type: 'Entertainment', name: 'Netflix' },
        { date: '2024-01-12', amount: -89.50, type: 'Transportation', name: 'Gas Station' },
        { date: '2024-01-11', amount: 2500.00, type: 'Income', name: 'Salary' }
    ];

    // Sample portfolio data
    const portfolioItems = [
        { symbol: 'VOO', value: 1250.50, change: '+2.5%', date: '2.27' },
        { symbol: 'QQQ', value: 890.25, change: '+1.8%', date: '2.27' }
    ];

    return (
        <div className="page">
            <div className="container-wide">
                {/* Welcome Header */}
                <div className="text-center mb-2xl">
                    <div className="card" style={{maxWidth: '400px', margin: '0 auto'}}>
                        <div className="text-5xl mb-md">
                            <img 
                                src="/src/assets/ani.gif" 
                                alt="Finn the Octopus Animation"
                                style={{width: '100px', height: '100px', objectFit: 'contain'}}
                                onError={(e) => {
                                    e.target.src = "https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif";
                                }}
                            />
                        </div>
                        <h1 className="text-3xl font-bold text-primary mb-sm">Finnagotchi</h1>
                        <p className="text-lg text-gray-600">Good morning, {user?.first_name || 'User'}!</p>
                    </div>
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-4 gap-lg mb-2xl">
                    <div className="card card-small text-center">
                        <div className="text-3xl font-bold text-success mb-sm">$2,500</div>
                        <div className="text-sm text-gray-500">This Month</div>
                    </div>
                    <div className="card card-small text-center">
                        <div className="text-3xl font-bold text-primary mb-sm">85%</div>
                        <div className="text-sm text-gray-500">On Track</div>
                    </div>
                    <div className="card card-small text-center">
                        <div className="text-3xl font-bold text-accent mb-sm">$1,200</div>
                        <div className="text-sm text-gray-500">Saved</div>
                    </div>
                    <div className="card card-small text-center">
                        <div className="text-3xl font-bold text-warning mb-sm">12</div>
                        <div className="text-sm text-gray-500">Goals</div>
                    </div>
                </div>

                {/* Budget Overview Chart */}
                <div className="text-center mb-2xl">
                    <div className="card" style={{maxWidth: '500px', margin: '0 auto'}}>
                        <h3 className="text-2xl font-bold text-gray-800 mb-lg">Budget Overview</h3>
                        <div className="flex-center" style={{position: 'relative', width: '300px', height: '300px', margin: '0 auto'}}>
                            <PieChart width={300} height={300}>
                                <Pie
                                    data={formattedBudget}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={120}
                                    fill="#8884d8"
                                >
                                    {formattedBudget.map((entry, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value}%`} />
                            </PieChart>
                            <div className="flex-center" style={{position: 'absolute', inset: '0'}}>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">On Track</div>
                                    <div className="text-sm text-gray-500">Budget Status</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Goals Section - Horizontal Layout */}
                <div className="mb-2xl">
                    <h3 className="text-3xl font-bold text-gray-800 mb-xl text-center">Financial Goals</h3>
                    <div className="grid grid-responsive gap-lg">
                        {goals.map((goal, index) => (
                            <div key={index} className="card hover:scale-105 transition">
                                <div className="text-center mb-md">
                                    <div className="text-3xl mb-md">
                                        {index === 0 && '🛒'}
                                        {index === 1 && '🏠'}
                                        {index === 2 && '🚗'}
                                        {index === 3 && '🏡'}
                                        {index === 4 && '📈'}
                                    </div>
                                    <h4 className="font-bold text-gray-800 text-lg">{goal.name}</h4>
                                </div>
                                <div className="space-y-md">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-primary">${goal.current.toLocaleString()}</div>
                                        <div className="text-sm text-gray-500">of ${goal.target.toLocaleString()}</div>
                                    </div>
                                    <div className="progress-bar">
                                        <div 
                                            className="progress-fill"
                                            style={{ width: `${goal.progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-center text-sm font-semibold text-gray-600">{goal.progress}% complete</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Dashboard Grid - 3 columns */}
                <div className="grid grid-3 gap-xl">
                    {/* Recent Transactions - Wider */}
                    <div className="card" style={{gridColumn: 'span 2'}}>
                        <h3 className="text-2xl font-bold text-gray-800 mb-lg">Recent Transactions</h3>
                        <div className="space-y-md">
                            {recentTransactions.map((tx, index) => (
                                <div key={index} className="flex-between p-md bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                                    <div className="flex gap-md">
                                        <div className="icon icon-primary">
                                            <span className="text-xl">
                                                {tx.type === 'Income' && '💰'}
                                                {tx.type === 'Groceries' && '🛒'}
                                                {tx.type === 'Rent' && '🏠'}
                                                {tx.type === 'Entertainment' && '🎮'}
                                                {tx.type === 'Transportation' && '🚗'}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-800">{tx.name}</div>
                                            <div className="text-sm text-gray-500">{new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {tx.type}</div>
                                        </div>
                                    </div>
                                    <div className={`text-lg font-bold ${tx.amount > 0 ? 'text-error' : 'text-success'}`}>
                                        {tx.amount > 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Portfolio Section */}
                    <div className="card">
                        <h3 className="text-2xl font-bold text-gray-800 mb-lg">Portfolio</h3>
                        <div className="space-y-md">
                            {portfolioItems.map((item, index) => (
                                <div key={index} className="p-md bg-gradient-card rounded-xl" style={{border: '1px solid var(--gray-200)'}}>
                                    <div className="flex-between">
                                        <div className="flex gap-md">
                                            <div className="icon icon-sm icon-error">
                                                <span className="text-lg">📈</span>
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-800">{item.symbol}</div>
                                                <div className="text-sm text-gray-500">{item.date}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-gray-800">${item.value.toFixed(2)}</div>
                                            <div className="text-sm text-success font-semibold">{item.change}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Additional Portfolio Stats */}
                        <div className="mt-lg pt-lg" style={{borderTop: '1px solid var(--gray-200)'}}>
                            <div className="grid grid-2 gap-md text-center">
                                <div>
                                    <div className="text-2xl font-bold text-success">+12.5%</div>
                                    <div className="text-sm text-gray-500">YTD Return</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-primary">$2,140</div>
                                    <div className="text-sm text-gray-500">Total Value</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}