
import React, { use, useEffect, useState } from "react";
import "../styles/Navbar.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

export default function Navbar({ isCollapsed, onToggle }) {
  const [loggedin, setLoggedIn] = useState(false);
  const auth = getAuth();
  console.log(loggedin)
  const navigate = useNavigate();
    useEffect(() => {
      onAuthStateChanged(auth, (data) => {
        console.log(data);
        if (data) setLoggedIn(true);
        else if (!data) setLoggedIn(false);
      })
    }, []);
    const logout = () => {
      signOut(auth).then(() => {
        // Sign-out successful.
      }).catch((error) => {
        // An error happened.
      });
    }
  return (
    <nav className={`navbar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Toggle Button */}
      <button className="toggle-btn" onClick={onToggle}>
        {isCollapsed ? '→' : '←'}
      </button>
      
      {!isCollapsed && (
        <>
          {/* Top: Logo */}
          <div className="logo">Finnagotchi</div> 
          
          {/* Center: Nav Links */}
          <ul className="nav-links">
            <li><Link to="/home" >Home</Link></li>
            <li><Link to="/log" >Log</Link></li>
            <li><Link to="/budget" >Budget</Link></li>
            <li><Link to="/portfolio" >Portfolio</Link></li>
            <li><Link to="/plaid" >Plaid</Link></li>
          </ul>

          {/* Bottom: Login Button */}
          {!loggedin && <button className="login-btn">
            {<li><Link to="/signup" >Login</Link></li>}
          </button>}
          {loggedin && <button className="login-btn" onClick={logout}>
            {<li><Link to="/signup" >Signout</Link></li>}
          </button>}
        </>
      )}
    </nav>

  );
}