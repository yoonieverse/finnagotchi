import { getAuth, onAuthStateChanged } from "firebase/auth";
import Navbar from "./components/Navbar"
import { Outlet, useNavigate } from "react-router-dom"
import { useEffect } from "react";


function App() {
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
     <Navbar/>
     <Outlet/>
    </div>
  )
}

export default App
