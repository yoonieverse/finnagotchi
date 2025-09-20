import { getAuth, onAuthStateChanged } from "firebase/auth";
import Navbar from "./components/Navbar"
import { Outlet, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react";
import { TransactionContext } from "./contexts/transactionContext";


function App() {
  const [transactions, setTransactions ] = useState(null);
  const auth = getAuth();
  const navigate = useNavigate();
  useEffect(() => {
    onAuthStateChanged(auth, (data) => {
      console.log(data);
      if (data) navigate("/");
      else if (!data) navigate("/signup");

    })
    
  }, []);

  


 
  

  return (
    <div>
     {auth.currentUser&&<Navbar/>}
     <TransactionContext.Provider value = {{transactions, setTransactions}}> 
      <Outlet/>
     </TransactionContext.Provider>
    </div>
  )
}

export default App
