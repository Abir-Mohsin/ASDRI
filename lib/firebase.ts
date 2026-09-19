import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import "firebase/firestore";

const defaultFirebaseConfig = {
  projectId: "asdri-fd3ec",
  appId: "1:146467140201:web:ab60085b0a798e928c28f8",
  apiKey: "AIzaSyBrgPOjhD98d7yVv0yPrb2wCReL3G4WxLM",
  authDomain: "asdri-fd3ec.firebaseapp.com",
  firestoreDatabaseId: "(default)",
  storageBucket: "asdri-fd3ec.firebasestorage.app",
  messagingSenderId: "146467140201",
  measurementId: "G-F7X7GTZFRL",
};

let config: any = { ...defaultFirebaseConfig };
try {
  const fileConfig = require("../firebase-applet-config.json");
  if (fileConfig && fileConfig.projectId) {
    config = { ...config, ...fileConfig };
  }
} catch {
  // If firebase-applet-config.json is absent (e.g. in local VS Code), read env or use default config
  if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    config.apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  }
  if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    config.projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  }
  if (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) {
    config.authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  }
  if (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
    config.storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  }
  if (process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) {
    config.messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  }
  if (process.env.NEXT_PUBLIC_FIREBASE_APP_ID) {
    config.appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  }
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


