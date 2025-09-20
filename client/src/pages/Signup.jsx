import { useState } from 'react'
import { initializeApp } from 'firebase/app';
import { FBApp,FSdb } from '../utils/firebase';
// TODO: Replace the following with your app's Firebase configuration
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";



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
    <div>
      <button onClick={signInWithGoogle}>Sign in with google</button>

    </div>
  )
}


