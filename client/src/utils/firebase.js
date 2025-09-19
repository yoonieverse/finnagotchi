import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';

const firebaseConfig = {
  };
  

export const FBApp = initializeApp(firebaseConfig);
export const FSdb = getFirestore(FBApp)