import { getAuth, onAuthStateChanged } from "firebase/auth";
import Navbar from "./components/Navbar";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { TransactionContext } from "./contexts/transactionContext";
import { BudgetContext } from "./contexts/budgetContext";


function App() {
  const [transactions, setTransactions] = useState([]);
  const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(false);
  const auth = getAuth();
  const navigate = useNavigate();
  const [budget, setBudget] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (data) => {
      if (data) navigate("/home");
      else navigate("/signup");
    });
  }, [auth, navigate]);

  const toggleNavbar = () => {
    setIsNavbarCollapsed(!isNavbarCollapsed);
  };

  return (
    <div>
      {auth.currentUser && <Navbar isCollapsed={isNavbarCollapsed} onToggle={toggleNavbar} />}
      <div className={auth.currentUser ? `main-content ${isNavbarCollapsed ? 'collapsed' : ''}` : ""}>
        <BudgetContext value={{ budget, setBudget }}>
        <TransactionContext.Provider value={{ transactions, setTransactions }}>
          <Outlet />
        </TransactionContext.Provider>
        </BudgetContext>
      </div>
    </div>
  );
}

export default App;