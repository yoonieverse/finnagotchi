import { getAuth, onAuthStateChanged } from "firebase/auth";
import Navbar from "./components/Navbar";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { TransactionContext } from "./contexts/transactionContext";

function App() {
  const [transactions, setTransactions] = useState([]);
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, (data) => {
      if (data) navigate("/");
      else navigate("/signup");
    });
  }, [auth, navigate]);

  return (
    <div>
      {auth.currentUser && <Navbar />}
      <TransactionContext.Provider value={{ transactions, setTransactions }}>
        <Outlet />
      </TransactionContext.Provider>
    </div>
  );
}

export default App;
