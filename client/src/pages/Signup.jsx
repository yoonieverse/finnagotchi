import { useState } from 'react'
import { initializeApp } from 'firebase/app';
import { FBApp,FSdb } from '../utils/firebase';
// TODO: Replace the following with your app's Firebase configuration
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import '../styles/Signup.css';



export function SignUp() {


  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  const signInWithGoogle= ()=>{
    signInWithPopup(auth, provider)
    .then(async(result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      console.log('works')
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      // IdP data available using getAdditionalUserInfo(result)
      const [first_name, last_name] = user.displayName.split(" ");
      const res = await fetch("http://localhost:3333/createuser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name,
          last_name,
          email: user.email,
          uid: user.uid,
        }),
      });
      console.log('fetched')
    }).catch((error) => {
      // Handle Errors here.
      console.log('no works')
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      console.log(errorMessage)
      console.log(errorCode)
      // ...
    });
  }
  

  return (
    <div className="signup-container">
      {/* Main Content */}
      <div className="signup-content">
          
          {/* App Title */}
          <div className="app-header">
            <h1 className="app-title">Finnagotchi</h1>
          </div>

          {/* Finn Character with GIF */}
          <div className="finn-character">
            <div className="finn-avatar">
              <div className="finn-gif-container">
                <img 
                  src="/src/assets/ani.gif" 
                  alt="Finn the Octopus Animation"
                  className="finn-gif"
                  onError={(e) => {
                    e.target.src = "https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif";
                  }}
                />
              </div>
              {/* Speech bubble */}
              <div className="speech-bubble">My name is Finn!</div>
            </div>
          </div>

          {/* Main Authentication Card */}
          <div className="auth-card">
              
              {/* Welcome Description */}
              <div className="text-center mb-8">
                <h2 className="adventure-title">Welcome to Your Financial Journey! 🌊</h2>
                <p className="adventure-description">
                  Let Finn help you track your spending, save money, and make smarter financial decisions with AI-powered insights!
                </p>
              </div>

              {/* Simple Features */}
              <div className="simple-features">
                <div className="simple-feature">
                  <div className="feature-emoji">🤖</div>
                  <div className="feature-text">AI-Powered Analysis</div>
                </div>
                <div className="simple-feature">
                  <div className="feature-emoji">📊</div>
                  <div className="feature-text">Intuitive Budget Tracker</div>
                </div>
                <div className="simple-feature">
                  <div className="feature-emoji">🎯</div>
                  <div className="feature-text">Smart Goal Setting</div>
                </div>
              </div>

              {/* Google Login - Simple and Clear */}
              <button 
                onClick={signInWithGoogle}
                className="google-login-button"
              >
                <div className="button-content">
                  <svg viewBox="0 0 24 24" className="google-icon">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="button-text">Continue with Google</span>
                </div>
              </button>

              {/* Simple Footer */}
              <div className="simple-footer">
                <p className="footer-text">
                  🔒 Secure • 🐙 Private • Powered by Plaid & Gemini AI
                </p>
              </div>
          </div>
        </div>
      </div>
  )
}