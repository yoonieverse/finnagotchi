import { useState, useEffect } from 'react';

export function Settings() {
    const [budgetPref, setBudgetPref] = useState({need: 50, want: 2, savings})



    return(
        <div>
            <input type="number" min="0" max="100" />
            <input type="number" min="0" max="100" />
            <input type="number" min="0" max="100" />
        </div>
    )



}