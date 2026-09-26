import { initializeApp, getApps, getApp, FirebaseApp, FirebaseOptions } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Default configuration for asdri-fd3ec
const defaultFirebaseConfig: FirebaseOptions = {
  projectId: "asdri-fd3ec",
  appId: "1:146467140201:web:ab60085b0a798e928c28f8",
  apiKey: "AIzaSyBrgPOjhD98d7yVv0yPrb2wCReL3G4WxLM",
  authDomain: "asdri-fd3ec.firebaseapp.com",
  storageBucket: "asdri-fd3ec.firebasestorage.app",
  messagingSenderId: "146467140201",
  measurementId: "G-F7X7GTZFRL",
};

const rawConfig: Record<string, string> = {
  ...(defaultFirebaseConfig as Record<string, string>),
};

// 1. Try reading from environment variables
if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  rawConfig.projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
}
if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  rawConfig.apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
}
if (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) {
  rawConfig.authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
}
if (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
  rawConfig.storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
}
if (process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) {
  rawConfig.messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
}
if (process.env.NEXT_PUBLIC_FIREBASE_APP_ID) {
  rawConfig.appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
}
if (process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) {
  rawConfig.measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;
}

// 2. Try loading from firebase-applet-config.json if in AI Studio container
try {
  const fileConfig = require("../firebase-applet-config.json");
  if (fileConfig && typeof fileConfig === "object") {
    if (fileConfig.projectId) rawConfig.projectId = fileConfig.projectId;
    if (fileConfig.apiKey) rawConfig.apiKey = fileConfig.apiKey;
    if (fileConfig.authDomain) rawConfig.authDomain = fileConfig.authDomain;
    if (fileConfig.storageBucket) rawConfig.storageBucket = fileConfig.storageBucket;
    if (fileConfig.messagingSenderId) rawConfig.messagingSenderId = fileConfig.messagingSenderId;
    if (fileConfig.appId) rawConfig.appId = fileConfig.appId;
    if (fileConfig.measurementId) rawConfig.measurementId = fileConfig.measurementId;
  }
} catch {
  // In standalone environments or builds without firebase-applet-config.json, env or default config is used
}

// Sanitize and pass ONLY valid FirebaseOptions to prevent unexpected fields
// (like firestoreDatabaseId) from polluting initializeApp()
const firebaseOptions: FirebaseOptions = {
  projectId: rawConfig.projectId,
  appId: rawConfig.appId,
  apiKey: rawConfig.apiKey,
  authDomain: rawConfig.authDomain,
  storageBucket: rawConfig.storageBucket,
  messagingSenderId: rawConfig.messagingSenderId,
  measurementId: rawConfig.measurementId,
};

// Singleton FirebaseApp initialization
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseOptions);

// Real Firebase instances without fake/empty-object fallbacks
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);
const googleProvider: GoogleAuthProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export { app, auth, db, storage, googleProvider };
