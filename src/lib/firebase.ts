// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGPaM4JPH2ABllIdMyYHT6VlGgVCXFiz4",
  authDomain: "studio-6728859378-c030c.firebaseapp.com",
  databaseURL: "https://studio-6728859378-c030c-default-rtdb.firebaseio.com",
  projectId: "studio-6728859378-c030c",
  storageBucket: "studio-6728859378-c030c.firebasestorage.app",
  messagingSenderId: "527931251156",
  appId: "1:527931251156:web:face7e7a2b95b8a959de41"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
