// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB63wBE-szvZiJWPFCh4qy8ovvLLSKq68c",
  authDomain: "caffeine-club-biller.firebaseapp.com",
  projectId: "caffeine-club-biller",
  storageBucket: "caffeine-club-biller.firebasestorage.app",
  messagingSenderId: "992737912701",
  appId: "1:992737912701:web:23d15e7b67666fc5eace14"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getFirestore(app);