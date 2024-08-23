import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDia5-g6dosYE29bZYB4WpikjDig6jUZ7A",
  authDomain: "expensify-91e32.firebaseapp.com",
  projectId: "expensify-91e32",
  storageBucket: "expensify-91e32.appspot.com",
  messagingSenderId: "912218939857",
  appId: "1:912218939857:web:7e1014ca56bbb6acad00f0"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);
export const storage = getStorage(app);

export default app;
