
import React, { use, useEffect, useState } from "react";
import "../styles/Navbar.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import logoutIcon from "../assets/logout.png";

export default function Navbar({ isCollapsed, onToggle }) {
  const [loggedin, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const auth = getAuth();
  console.log(loggedin)
  const navigate = useNavigate();
    useEffect(() => {
      onAuthStateChanged(auth, (data) => {
        console.log(data);
        if (data) {
          setLoggedIn(true);
          setUser(data);
        } else {
          setLoggedIn(false);
          setUser(null);
        }
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
          
          {/* Google Account Section */}
          {loggedin && user && (
            <div className="google-account-section">
              <div className="google-account-info">
                <div className="google-icon">G</div>
                <div className="google-details">
                  <div className="google-email">{user.email}</div>
                  <div className="google-label">Google Account</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Center: Nav Links */}
          <ul className="nav-links">
            <li><Link to="/home" >Home</Link></li>
            <li><Link to="/log" >Log</Link></li>
            <li><Link to="/budget" >Budget</Link></li>
            <li><Link to="/portfolio" >Portfolio</Link></li>
            <li><Link to="/plaid" >Plaid</Link></li>
          </ul>

          {/* Bottom: Login/Logout Button */}
          {!loggedin && <button className="login-btn">
            {<li><Link to="/signup" >Login</Link></li>}
          </button>}
          {loggedin && <button className="logout-btn" onClick={logout} title="Logout">
            <img 
              src={logoutIcon} 
              alt="Logout" 
              className="logout-icon"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <span className="logout-text" style={{display: 'none'}}>Logout</span>
          </button>}
        </>
      )}
    </nav>

  );
}