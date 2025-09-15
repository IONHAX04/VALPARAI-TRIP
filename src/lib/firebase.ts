// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAL__K3ia1s7u1PIP03CDuJ-D3YJjz7LjU",
  authDomain: "studio-7228655129-b284f.firebaseapp.com",
  databaseURL: "https://studio-7228655129-b284f-default-rtdb.firebaseio.com",
  projectId: "studio-7228655129-b284f",
  storageBucket: "studio-7228655129-b284f.firebasestorage.app",
  messagingSenderId: "183525318020",
  appId: "1:183525318020:web:82c30bafa4c730bdc991d1"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
