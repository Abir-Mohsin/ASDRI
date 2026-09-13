import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import firebaseConfig from "../firebase-applet-config.json";

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export { app, auth, db, storage, googleProvider };
