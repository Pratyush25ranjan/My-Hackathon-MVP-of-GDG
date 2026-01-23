import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { GoogleAuthProvider } from "firebase/auth";

console.log("🔥 Firebase Project ID:", import.meta.env.VITE_FIREBASE_PROJECT_ID);

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// ==================== GOOGLE OAUTH SETUP ====================

export const googleProvider = new GoogleAuthProvider();

// Configure Google sign-in
googleProvider.setCustomParameters({
  prompt: "select_account", // Always show account selector
});

// Add scopes if needed
googleProvider.addScope("profile");
googleProvider.addScope("email");

console.log("✅ Firebase initialized with Google OAuth support");