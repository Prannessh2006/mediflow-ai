import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBIdZOoDN3yqH1aMa0zVcP9tDm_-ncuRuU",
  authDomain: "mediflow-ai-b9dc8.firebaseapp.com",
  projectId: "mediflow-ai-b9dc8",
  storageBucket: "mediflow-ai-b9dc8.firebasestorage.app",
  messagingSenderId: "486636571257",
  appId: "1:486636571257:web:1849221766781ce24da2a8",
  measurementId: "G-WW73CYQ395"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
