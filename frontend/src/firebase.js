/**
 * Firebase Client SDK Configuration & Services for BHUNETRA
 * Handles Authentication and Firestore DB.
 * NOTE: Firebase Storage is NOT used — files are stored locally on the backend
 * (compatible with Firebase Spark free plan — no billing required).
 */
import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore'

// 1. Firebase Project Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
}

// Check if valid credentials are provided
export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  !import.meta.env.VITE_FIREBASE_API_KEY.includes("your_firebase_api_key")
)

// 2. Initialize Firebase instances (singleton pattern)
let app = null
let auth = null
let db = null

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    console.log("🔥 [BHUNETRA] Live Firebase initialized successfully for project:", firebaseConfig.projectId)
  } catch (error) {
    console.warn("⚠️ [BHUNETRA] Live Firebase initialization failed:", error)
  }
} else {
  console.info("ℹ️ [BHUNETRA] Running in Local / Sovereign Mock Mode (Configure .env for live Firebase).")
}

export { app, auth, db, firebaseConfig }

// Auth Helpers
export const signInWithEmail = async (email, password) => {
  if (!isFirebaseConfigured || !auth) {
    throw new Error("Firebase is not configured with live credentials.")
  }
  return await signInWithEmailAndPassword(auth, email, password)
}

export const signOutUser = async () => {
  if (isFirebaseConfigured && auth) {
    return await signOut(auth)
  }
}

export const getCurrentUserToken = async () => {
  if (isFirebaseConfigured && auth && auth.currentUser) {
    return await auth.currentUser.getIdToken()
  }
  return null
}
