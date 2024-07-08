import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyAsl173UaPqczb_lVZKiXSP3UaOA5DzpFw",
  authDomain: "collective-code-69681.firebaseapp.com",
  projectId: "collective-code-69681",
  storageBucket: "collective-code-69681.appspot.com",
  messagingSenderId: "103478108521",
  appId: "1:103478108521:web:73a3f1c2db0ea7011dddf8",
  measurementId: "G-G1X54WGFBV",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
