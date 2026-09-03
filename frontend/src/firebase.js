/**
 * Firebase Client SDK Configuration for BHUNETRA
 * Handles Authentication, Firestore, and Storage clients with environment variables.
 */

// Fallback configuration if environment variables are not yet provided
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyMockKeyForLocalDevAndDemo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "bhunetra-sih.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bhunetra-sih",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "bhunetra-sih.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456",
}

export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID
)

export { firebaseConfig }
