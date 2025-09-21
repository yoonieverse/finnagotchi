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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header with Finnagotchi */}
                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center space-x-6">
                        {/* Circular Progress Chart */}
                        <div className="bg-white rounded-3xl p-8 shadow-xl">
                            <div className="relative w-48 h-48">
                                <PieChart width={192} height={192}>
                                    <Pie
                                        data={formattedBudget}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                    >
                                        {formattedBudget.map((entry, index) => (
                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">On Track</div>
                                        <div className="text-sm text-gray-500">Budget Status</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Finnagotchi Character */}
                    <div className="text-center">
                        <div className="bg-white rounded-3xl p-8 shadow-xl">
                            <div className="text-6xl mb-4">🐙</div>
                            <h2 className="text-2xl font-bold text-blue-600 mb-2">Finnagotchi</h2>
                            <p className="text-gray-600">Good morning, {user?.first_name || 'User'}!</p>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Goals Section */}
                    <div className="bg-white rounded-3xl p-8 shadow-xl">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">Goals</h3>
                        <div className="space-y-6">
                            {goals.map((goal, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-gray-700">{goal.name}</span>
                                        <span className="text-sm text-gray-500">${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div 
                                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                                            style={{ width: `${goal.progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-right text-sm text-gray-500">{goal.progress}% complete</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Log Section */}
                    <div className="bg-white rounded-3xl p-8 shadow-xl">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">Recent Transactions</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4 text-sm font-semibold text-gray-500 border-b pb-2">
                                <div>Date</div>
                                <div>Amount</div>
                                <div>Type</div>
                            </div>
                            {recentTransactions.map((tx, index) => (
                                <div key={index} className="grid grid-cols-3 gap-4 text-sm py-2 hover:bg-gray-50 rounded-lg px-2">
                                    <div className="text-gray-600">{new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                    <div className={`font-semibold ${tx.amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {tx.amount > 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                                    </div>
                                    <div className="text-gray-600">{tx.type}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Portfolio Section */}
                    <div className="bg-white rounded-3xl p-8 shadow-xl">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">Portfolio</h3>
                        <div className="space-y-4">
                            {portfolioItems.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center space-x-3">
                                        <div className="text-red-500 text-xl">❤️</div>
                                        <div>
                                            <div className="font-bold text-gray-800">{item.symbol}</div>
                                            <div className="text-sm text-gray-500">{item.date}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-gray-800">${item.value.toFixed(2)}</div>
                                        <div className="text-sm text-green-600">{item.change}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Budget Breakdown Chart */}
                    <div className="bg-white rounded-3xl p-8 shadow-xl">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">Budget Breakdown</h3>
                        <div className="flex justify-center">
                            <PieChart width={300} height={300}>
                                <Pie
                                    data={formattedBudget}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    label={({ name, value }) => `${name}: ${((value / total) * 100).toFixed(0)}%`}
                                >
                                    {formattedBudget.map((entry, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value}%`} />
                            </PieChart>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}