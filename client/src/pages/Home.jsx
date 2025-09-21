import { getAuth } from 'firebase/auth';
import { useState, useEffect, useContext } from 'react';
import { PieChart, Pie, Cell, Tooltip, Label, ResponsiveContainer } from 'recharts';
import { TransactionContext } from '../contexts/transactionContext';
import { BudgetContext } from '../contexts/budgetContext';


export function Home() {
    const [user, setUser] = useState(null);
    const [budgetPref, setBudgetPref] = useState({ needs: 50, wants: 30, savings: 20 });
    const { transactions } = useContext(TransactionContext);
    const auth = getAuth();
    const [quote, setQuote] = useState([`Hello, ${auth.currentUser?.displayName}! 🌊`])
    const { budget } = useContext(BudgetContext);
    const [rating, setRating] = useState(3);
    const [spendingDist, setSpendingDist] = useState(null)
    const [spendingDistData, setSpendingDistData]=useState([
        { name: 'wants', value: 30 },
        { name: 'needs', value: 50},
        { name: 'savings', value: 20}
    ]);
    const [savingsGoals, setSavingsGoals] = useState([]);

    // Load savings goals from localStorage
    const loadSavingsGoals = () => {
        try {
            const storedGoals = localStorage.getItem('savingsGoals');
            if (storedGoals) {
                const goals = JSON.parse(storedGoals);
                // Sort by createdAt (newest first) and take only first 3
                goals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setSavingsGoals(goals.slice(0, 3));
            } else {
                setSavingsGoals([]);
            }
        } catch (error) {
            console.error("Error loading savings goals:", error);
            setSavingsGoals([]);
        }
    };

    useEffect(() => {
        loadSavingsGoals();
    }, []);

    const getProgressPercentage = (current, target) => {
        return Math.min((current / target) * 100, 100);
    };


    useEffect(() => {
        
        if (!budget) return;
        console.log(budget)

        const sd = {
            wants: 0,
            needs: 0,
            savings: 0
        };

        const needsCategory = [
            "food_drink",
            "medical",
            "transportation",
            "home_improvement",
            "rent_utilities",
            "government_and_non_profit"
        ];

        const wantsCategory = [ "entertainment", "personal_purchase", "travel"];

        let wantsTotal = 0;
        let needsTotal = 0;
        let savingsTotal = 0;
        let incomeTotal = 0;

        // Wants
         console.log(budget.wants)
         console.log(budget.wants.subcategories)

        for (let i = 0; i < wantsCategory.length; i++) {
            const categoryArray = budget.wants.subcategories[wantsCategory[i]];
            console.log(categoryArray)
            for (let j = 0; j < categoryArray.length; j++) {
                wantsTotal += categoryArray[j].ammount; // match JSON spelling
            }
        }

        // Needs
        for (let i = 0; i < needsCategory.length; i++) {
            const categoryArray = budget.needs.subcategories[needsCategory[i]];
            for (let j = 0; j < categoryArray.length; j++) {
                needsTotal += categoryArray[j].ammount;
            }
        }

        // Income
        for (let i = 0; i < budget.income.purchases.length; i++) {
            incomeTotal += budget.income.purchases[i].ammount;
        }

        savingsTotal = incomeTotal - (wantsTotal + needsTotal);


        // Calculate fractions
        const total = wantsTotal + needsTotal + savingsTotal;
        if (total > 0) {
            sd.wants = (wantsTotal / total);
            sd.needs = (needsTotal / total);
            sd.savings = (savingsTotal / total);
        }

        setSpendingDist(sd);
        setSpendingDistData([
        { name: 'wants', value: sd.wants },
        { name: 'needs', value: sd.needs },
        { name: 'savings', value: sd.savings }
         ])
        console.log(sd);





    },[])


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
   
    useEffect(() => {
    async function fetchQuote() {
      if(!budget) return;
      try {
        const res = await fetch("http://localhost:3333/quotes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ transactions: budget }),
        });

        if (!res.ok) throw new Error("Failed to fetch quotes");

        const data = await res.json();
        console.log(data)

        if (Array.isArray(data.quotes) && data.quotes.length > 0) {
          const random = data.quotes[Math.floor(Math.random() * data.quotes.length)];
          console.log(random)
          setQuote(random);
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (budget) {
      fetchQuote();
    }
  }, [budget]);

  useEffect(() => {
    console.log('hifwe')
    console.log(budget)
    async function fetchRating() {
        
      try {
        const res = await fetch("http://localhost:3333/finnrating", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ transactions: budget }),
        });

        if (!res.ok) throw new Error("Failed to fetch rating");

         const data = await res.json();
         console.log(data)


          setRating(data.rating);
      } catch (err) {
        console.error(err);
      }
    }

    if (budget) {
      fetchRating();
    }
  }, [budget]);

    const formattedBudget = Object.entries(budgetPref).map(([key, value]) => ({
        name: key,
        value,
    }));

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B'];
    const total = formattedBudget.reduce((sum, entry) => sum + entry.value, 0);

    // Goals data - placeholder for future implementation
    const goals = [];

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
                {/* Finn and Budget Overview - Side by Side */}
                <div className="grid grid-2 gap-2xl mb-2xl">
                    {/* Finn Character */}
                    <div className="card text-center" style={{position: 'relative'}}>
                        <div className="text-5xl mb-md" style={{position: 'relative'}}>
                            <img 
                                src={`/src/assets/image copy ${rating}.png`}
                                alt="Finn the Octopus"
                                style={{
                                    width: '180px', 
                                    height: '180px', 
                                    objectFit: 'contain',
                                    animation: 'float 3s ease-in-out infinite'
                                }}
                                onError={(e) => {
                                    e.target.src = "https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif";
                                }}
                            />
                            {/* Cute bubbles around Finn */}
                            <div style={{
                                position: 'absolute',
                                top: '10px',
                                right: '20px',
                                fontSize: '20px',
                                animation: 'bubble 2s ease-in-out infinite'
                            }}>🫧</div>
                            <div style={{
                                position: 'absolute',
                                bottom: '20px',
                                left: '10px',
                                fontSize: '16px',
                                animation: 'bubble 2.5s ease-in-out infinite 0.5s'
                            }}>🫧</div>
                            <div style={{
                                position: 'absolute',
                                top: '30px',
                                left: '30px',
                                fontSize: '14px',
                                animation: 'bubble 2.2s ease-in-out infinite 1s'
                            }}>🫧</div>
                        </div>
                        <h1 className="text-4xl font-bold text-primary mb-sm" style={{
                            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>I'm Finn!</h1>
                        <p className="text-lg text-gray-600 mb-md">{quote}</p>
                        
                        {/* Random shrimp 1 */}
                        <img 
                            src="/src/assets/shrimp.gif" 
                            alt="Shrimp" 
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '30px',
                                width: '80px',
                                height: '80px',
                                animation: 'float 2s ease-in-out infinite',
                                zIndex: 1
                            }}
                        />
                    </div>

                    {/* Budget Overview Chart */}
                    <div className="card text-center">
                        <h3 className="text-2xl font-bold text-gray-800 mb-lg">
                            {budget ? 'Spending Analysis' : 'Recommended Budget'}
                        </h3>
                        <div className="flex-center" style={{position: 'relative', width: '400px', height: '400px', margin: '0 auto'}}>
                            <PieChart width={400} height={400}>
                                <Pie
                                    data={budget ? spendingDistData : formattedBudget}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={140}
                                    fill="#8884d8"
                                    label={({ name, value, cx, cy, midAngle, innerRadius, outerRadius }) => {
                                        const percentage = budget ? `${(value * 100).toFixed(1)}%` : `${value}%`;
                                        const categoryNames = {
                                            'wants': 'Wants',
                                            'needs': 'Needs', 
                                            'savings': 'Savings'
                                        };
                                        
                                        const RADIAN = Math.PI / 180;
                                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                        
                                        return (
                                            <text 
                                                x={x} 
                                                y={y} 
                                                fill="white" 
                                                textAnchor={x > cx ? 'start' : 'end'} 
                                                dominantBaseline="central"
                                                fontSize="12"
                                                fontWeight="bold"
                                                stroke="black"
                                                strokeWidth="0.5"
                                            >
                                                {`${categoryNames[name] || name}: ${percentage}`}
                                            </text>
                                        );
                                    }}
                                    labelLine={false}
                                >
                                    {(budget ? spendingDistData : formattedBudget).map((entry, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(value, name) => {
                                        const percentage = budget ? `${(value * 100).toFixed(1)}%` : `${value}%`;
                                        const categoryInfo = {
                                            'wants': '🎯 Wants - Discretionary spending like entertainment, dining out, and shopping',
                                            'needs': '🏠 Needs - Essential expenses like rent, groceries, and utilities', 
                                            'savings': '💰 Savings - Money set aside for future goals and emergencies'
                                        };
                                        return [percentage, categoryInfo[name] || name];
                                    }}
                                    labelFormatter={(name) => {
                                        const categoryNames = {
                                            'wants': 'Wants',
                                            'needs': 'Needs', 
                                            'savings': 'Savings'
                                        };
                                        return categoryNames[name] || name;
                                    }}
                                />
                                <Label 
                                    value={budget ? "📊 Plaid Data" : "📋 Recommended"} 
                                    position="center" 
                                    style={{ 
                                        fontSize: '14px', 
                                        fontWeight: 'bold', 
                                        fill: '#374151',
                                        textAnchor: 'middle'
                                    }} 
                                />
                            </PieChart>
                            <div className="flex-center" style={{position: 'absolute', inset: '0'}}>
                                <div className="text-center" style={{padding: '20px'}}>
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Random shrimp 2 */}
                <img 
                    src="/src/assets/shrimp.gif" 
                    alt="Shrimp" 
                    style={{
                        position: 'absolute',
                        top: '200px',
                        left: '50px',
                        width: '70px',
                        height: '70px',
                        animation: 'float 2.5s ease-in-out infinite 0.5s',
                        zIndex: 1
                    }}
                />


                {/* Goals Section - Horizontal Layout */}
                {/* Random shrimp 3 */}
                <img 
                    src="/src/assets/shrimp.gif" 
                    alt="Shrimp" 
                    style={{
                        position: 'absolute',
                        top: '700px',
                        right: '150px',
                        width: '100px',
                        height: '100px',
                        animation: 'float 3s ease-in-out infinite 1s',
                        zIndex: 1
                    }}
                />

                {/* Recent Transactions Section */}
                <div className="mb-2xl">
                    <h3 className="text-3xl font-bold text-gray-800 mb-xl text-center">Recent Transactions</h3>
                    <div className="card">
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
                                                {!['Income', 'Groceries', 'Rent', 'Entertainment', 'Transportation'].includes(tx.type) && '💳'}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-800">{tx.name}</div>
                                            <div className="text-sm text-gray-500">{new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {tx.type}</div>
                                        </div>
                                    </div>
                                    <div className={`text-lg font-bold ${tx.type === 'Income' || tx.name?.toLowerCase().includes('direct deposit') ? 'text-success' : 'text-error'}`}>
                                        {tx.type === 'Income' || tx.name?.toLowerCase().includes('direct deposit') ? '+' : ''}${tx.amount.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Financial Goals Section */}
                <div className="mb-2xl">
                    <h3 className="text-3xl font-bold text-gray-800 mb-xl text-center">Financial Goals</h3>
                    {savingsGoals.length > 0 ? (
                        <div className="grid grid-responsive gap-lg">
                            {savingsGoals.map((goal) => {
                                const progress = getProgressPercentage(goal.currentAmount || 0, goal.targetAmount);
                                const isComplete = progress >= 100;
                                
                                return (
                                    <div key={goal.id} className="card hover:scale-105 transition">
                                        <div className="flex-between mb-lg">
                                            <div className="flex-1">
                                                <h4 className="text-xl font-bold text-gray-800 mb-sm">{goal.name}</h4>
                                                <p className="text-sm text-gray-600">Created {new Date(goal.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-2xl font-bold ${isComplete ? 'text-success' : 'text-primary'}`}>
                                                    ${(goal.currentAmount || 0).toLocaleString()}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    of ${goal.targetAmount.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Progress Bar */}
                                        <div className="mb-md">
                                            <div className="progress-bar">
                                                <div 
                                                    className={`progress-fill ${isComplete ? 'bg-success' : 'bg-primary'}`}
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex-between mt-sm">
                                                <span className="text-xs font-semibold text-gray-600">
                                                    {progress.toFixed(1)}% complete
                                                </span>
                                                {isComplete && (
                                                    <span className="text-xs text-success font-bold">
                                                        🎉 Achieved!
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="card text-center p-3xl">
                            <div className="text-6xl mb-lg">🎯</div>
                            <h4 className="text-2xl font-bold text-gray-600 mb-md">No Goals Yet</h4>
                            <p className="text-lg text-gray-500 mb-lg">Create your first savings goal to start tracking your financial progress</p>
                            <div className="status-indicator status-info">
                                💡 Visit the Goals page to create your first goal
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}