// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyCFuSSHpZrGFStEpEOeo9p6Rf6GHSX4ym4",
    authDomain: "expensify-14bf6.firebaseapp.com",
    projectId: "expensify-14bf6",
    storageBucket: "expensify-14bf6.appspot.com",
    messagingSenderId: "236787891550",
    appId: "1:236787891550:web:862bfdf6dbad2dc378e3cf",
    measurementId: "G-MDB5VR6Z44"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Realtime Database
export const realtimeDb = getDatabase(app);

export default app;
