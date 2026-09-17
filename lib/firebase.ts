import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

let config: any = {};
try {
  config = require("../firebase-applet-config.json");
} catch {
  config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "asdri-fd3ec",
    firestoreDatabaseId: "(default)",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
}

if (!config.projectId) {
  config.projectId = "asdri-fd3ec";
}
if (!config.firestoreDatabaseId) {
  config.firestoreDatabaseId = "(default)";
}

const isBrowser = typeof window !== "undefined";

const app: FirebaseApp = !getApps().length ? initializeApp(config) : getApp();

let db: Firestore;
let storage: FirebaseStorage;
let auth: Auth;
let googleProvider: GoogleAuthProvider;

if (isBrowser) {
  db = getFirestore(app, config.firestoreDatabaseId || "(default)");
  storage = getStorage(app);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: "select_account" });
} else {
  // On build/server side (static export), do not initialize or access browser-only client services
  db = {} as Firestore;
  storage = {} as FirebaseStorage;
  auth = {} as Auth;
  googleProvider = {} as GoogleAuthProvider;
}

export { app, auth, db, storage, googleProvider };


