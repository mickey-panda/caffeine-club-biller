// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

//test
// const firebaseConfig = {
//   apiKey: "AIzaSyB63wBE-szvZiJWPFCh4qy8ovvLLSKq68c",
//   authDomain: "caffeine-club-biller.firebaseapp.com",
//   projectId: "caffeine-club-biller",
//   storageBucket: "caffeine-club-biller.firebasestorage.app",
//   messagingSenderId: "992737912701",
//   appId: "1:992737912701:web:23d15e7b67666fc5eace14"
// };

//prod
const firebaseConfig = {
  apiKey: "AIzaSyB2xpoWbJkjKpm8mjBcHgX7PoOA8OJ5cg0",
  authDomain: "caffeine-club-biller-prod.firebaseapp.com",
  projectId: "caffeine-club-biller-prod",
  storageBucket: "caffeine-club-biller-prod.firebasestorage.app",
  messagingSenderId: "1000214513813",
  appId: "1:1000214513813:web:a403389d2270f2ec2a339c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export {db};