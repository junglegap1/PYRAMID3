import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAqkcQyUzvWC8BuSYGY54QBjaRLl18urcM",
  authDomain: "pyramid3s.firebaseapp.com",
  projectId: "pyramid3s",
  storageBucket: "pyramid3s.firebasestorage.app",
  messagingSenderId: "553574468724",
  appId: "1:553574468724:web:397b7fe78610f319685521"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Export both so you can import them later
export { app, db };
