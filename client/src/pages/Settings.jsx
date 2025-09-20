import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";

export function Settings() {
  const [budgetPref, setBudgetPref] = useState({ needs: 50, wants: 30, savings: 20 });
  const [user, setUser] = useState(null);
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
            setUser(data);
            setBudgetPref(data.budget_preference)
            console.log(data)
    }
    getuser();
  },[])

    
  const handleChange = (key, value) => {
    value = Number(value);

    // Ensure value is between 0 and 100
    if (value < 0) value = 0;
    if (value > 100) value = 100;

    const otherKeys = Object.keys(budgetPref).filter((k) => k !== key);
    const remaining = 100 - value;

    // Current total of other sliders
    const currentOtherTotal = otherKeys.reduce((sum, k) => sum + budgetPref[k], 0) || 1;

    // Distribute remaining proportionally
    const newBudget = { ...budgetPref, [key]: value };
    otherKeys.forEach((k) => {
      newBudget[k] = Math.round((budgetPref[k] / currentOtherTotal) * remaining);
    });

    // Fix any rounding errors to ensure total = 100
    const total = Object.values(newBudget).reduce((sum, v) => sum + v, 0);
    const diff = 100 - total;
    if (diff !== 0) {
      newBudget[otherKeys[0]] += diff;
    }

    setBudgetPref(newBudget);
  };
  const saveinput = async(newBudget) => {
    
    const res = await fetch("http://localhost:3333/budget", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: auth.currentUser.uid,
          budget_preference: {
            needs: budgetPref.needs,
            wants: budgetPref.wants,
            savings: budgetPref.savings,
          },
        }),
      });
      console.log('saved!')
  }

  return (
    <div>
      {Object.entries(budgetPref).map(([key, val]) => (
        <div key={key}>
          <label>
            {key.charAt(0).toUpperCase() + key.slice(1)}:
            <input
              type="number"
              min="0"
              max="100"
              value={val}
              onChange={(e) => handleChange(key, e.target.value)}
            />
          </label>
        </div>
      ))}
      <p>Total: {Object.values(budgetPref).reduce((sum, v) => sum + v, 0)}%</p>
      <button onClick={saveinput}>save</button>
    </div>
  );
}