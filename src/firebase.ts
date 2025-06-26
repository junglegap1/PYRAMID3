import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAqkcQyUzvWC8BuSYGY54QBjaRLl18urcM",
  authDomain: "pyramid3s.firebaseapp.com",
  projectId: "pyramid3s",
  storageBucket: "", // empty since no storage allowed
  messagingSenderId: "553574468724",
  appId: "1:553574468724:web:397b7fe78610f319685521"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
