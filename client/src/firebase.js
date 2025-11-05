// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
//temporary souls firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "travelvista-85a0b.firebaseapp.com",
  projectId: "travelvista-85a0b",
  storageBucket: "travelvista-85a0b.firebasestorage.app",
  messagingSenderId: "178581127701",
  appId: "1:178581127701:web:d71f0226c4390c24f0841c",
  measurementId: "G-ND19GS0ZDZ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
