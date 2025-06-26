// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";  // import storage service if you want to use storage

const firebaseConfig = {
  apiKey: "AIzaSyAqkcQyUzvWC8BuSYGY54QBjaRLl18urcM",
  authDomain: "pyramid3s.firebaseapp.com",
  projectId: "pyramid3s",
  storageBucket: "pyramid3s.firebasestorage.app",
  messagingSenderId: "553574468724",
  appId: "1:553574468724:web:397b7fe78610f319685521"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage and export it
const storage = getStorage(app);

export { app, storage };
