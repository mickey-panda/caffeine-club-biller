// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyB63wBE-szvZiJWPFCh4qy8ovvLLSKq68c",
  authDomain: "caffeine-club-biller.firebaseapp.com",
  projectId: "caffeine-club-biller",
  storageBucket: "caffeine-club-biller.firebasestorage.app",
  messagingSenderId: "992737912701",
  appId: "1:992737912701:web:23d15e7b67666fc5eace14"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export {db};