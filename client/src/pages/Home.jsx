import { getAuth } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

export function Home() {
    const [user, setUser] = useState(null);
    const [budgetPref, setBudgetPref] = useState({ needs: 50, wants: 30, savings: 20 });
    const auth= getAuth();
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

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];
    const total = formattedBudget.reduce((sum, entry) => sum + entry.value, 0);

  return (
   <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Budget Breakdown</h2>
      <PieChart width={400} height={400}>
        <Pie
          data={formattedBudget}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={150} // bigger pie
          fill="#8884d8"
          label={({ name, value }) => `${name}: ${((value / total) * 100).toFixed(0)}%`}
        >
          {formattedBudget.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value} units`} />
      </PieChart>
    </div>
  );
}