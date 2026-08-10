// firebase file for initialization
// for google and microsoft both

import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBVEN8WgBuQZR5wMXZJ8js87wz5eRIdJBs",
  authDomain: "notetaker-f7d4e.firebaseapp.com",
  projectId: "notetaker-f7d4e",
  storageBucket: "notetaker-f7d4e.firebasestorage.app",
  messagingSenderId: "151285771625",
  appId: "1:151285771625:web:22f6d6808496c0708821f8",
  measurementId: "G-6V074PCFZH"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Google
export const googleProvider = new GoogleAuthProvider();

// Microsoft
export const microsoftProvider = new OAuthProvider("microsoft.com");
// Optional: scopes (you can remove if you want minimal)
microsoftProvider.addScope("email");
microsoftProvider.addScope("profile");
// Optional: make Microsoft always show account chooser
microsoftProvider.setCustomParameters({ prompt: "select_account" });

// Optional: helper functions you can call from Landing.jsx
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signInWithMicrosoft = () => signInWithPopup(auth, microsoftProvider);
