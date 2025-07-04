import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCXQVzTgSQMZ7GwvdlIXW8nyrggwIdqrXU",
  authDomain: "recipe-and-meal-planner-a40fc.firebaseapp.com",
  projectId: "recipe-and-meal-planner-a40fc",
  storageBucket: "recipe-and-meal-planner-a40fc.firebasestorage.app",
  messagingSenderId: "138770301953",
  appId: "1:138770301953:web:8a355ef8e9cdfb166eac00",
  measurementId: "G-V5ZH02BYJ7"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics only on client side
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
