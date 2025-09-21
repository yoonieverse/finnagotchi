import { getAuth } from 'firebase/auth';
import { useState, useEffect, useContext } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
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

        // Savings
        for (let i = 0; i < budget.savings.purchases.length; i++) {
            savingsTotal += budget.savings.purchases[i].ammount;
        }

        // Calculate fractions
        const total = wantsTotal + needsTotal + savingsTotal;
        if (total > 0) {
            sd.wants = (wantsTotal / total)*100;
            sd.needs = (needsTotal / total)*100;
            sd.savings = (savingsTotal / total)*100
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
                    <div className="card" style={{maxWidth: '450px', margin: '0 auto', position: 'relative'}}>
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
                        }}></h1>
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
                            {budget&&<PieChart width={300} height={300}>
                                <Pie
                                    data={spendingDistData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    label={(entry) => `${entry.name} ${(entry.value * 100).toFixed(0)}%`}
                                >
                                    {spendingDistData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => `${(value * 100).toFixed(1)}%`}
                                />
                            </PieChart>}
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
                {/* Random shrimp 3 */}
                <img 
                    src="/src/assets/shrimp.gif" 
                    alt="Shrimp" 
                    style={{
                        position: 'absolute',
                        top: '400px',
                        right: '100px',
                        width: '100px',
                        height: '100px',
                        animation: 'float 3s ease-in-out infinite 1s',
                        zIndex: 1
                    }}
                />

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