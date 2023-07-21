import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBhMAkBUbQBsMue1RvZIlP2RmSzkX3HmBk",
  authDomain: "fir-auth-3ffee.firebaseapp.com",
  projectId: "fir-auth-3ffee",
  storageBucket: "fir-auth-3ffee.appspot.com",
  messagingSenderId: "963668040264",
  appId: "1:963668040264:web:822d3b5fbfc524ffded67d",
  measurementId: "G-83CZP0ZSCW"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { app, firestore };