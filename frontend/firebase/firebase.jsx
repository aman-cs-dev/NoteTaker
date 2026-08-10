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
  apiKey: "AIzaSyB9r1B_A_9tGlOk_aG47vK7vf7romF1p1g",
  authDomain: "open-source-collaborator.firebaseapp.com",
  projectId: "open-source-collaborator",
  storageBucket: "open-source-collaborator.firebasestorage.app",
  messagingSenderId: "177061193732",
  appId: "1:177061193732:web:d7aabd295c55f40281ed51",
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
