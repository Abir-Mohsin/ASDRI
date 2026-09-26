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

const config: Record<string, string> = { ...defaultFirebaseConfig };

// 1. Try reading from environment variables (standard for VS Code with .env.local)
if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  config.projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
}
if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  config.apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
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
if (process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) {
  config.measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;
}

// 2. Try loading from firebase-applet-config.json if in AI Studio container
try {
  const fileConfig = require("../firebase-applet-config.json");
  if (fileConfig && fileConfig.projectId) {
    Object.assign(config, fileConfig);
  }
} catch {
  // In VS Code or standalone build without firebase-applet-config.json, env or fallback config is used
}

const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(config);

let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let googleProvider: GoogleAuthProvider;

try {
  auth = getAuth(app);
} catch {
  auth = {} as Auth;
}

try {
  db = getFirestore(app, config.firestoreDatabaseId || "(default)");
} catch {
  db = {} as Firestore;
}

try {
  storage = getStorage(app);
} catch {
  storage = {} as FirebaseStorage;
}

try {
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: "select_account" });
} catch {
  googleProvider = {} as GoogleAuthProvider;
}

export { app, auth, db, storage, googleProvider };



