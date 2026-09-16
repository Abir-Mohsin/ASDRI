import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import firebaseConfig from "../firebase-applet-config.json";

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = typeof window !== 'undefined' ? (firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app)) : null as unknown as ReturnType<typeof getFirestore>;

const storage = typeof window !== 'undefined' ? getStorage(app) : null as unknown as ReturnType<typeof getStorage>;

const auth = typeof window !== 'undefined' ? getAuth(app) : null as unknown as ReturnType<typeof getAuth>;
const googleProvider = typeof window !== 'undefined' ? new GoogleAuthProvider() : null as unknown as GoogleAuthProvider;
if (googleProvider) {
  googleProvider.setCustomParameters({ prompt: "select_account" });
}

export { app, auth, db, storage, googleProvider };

