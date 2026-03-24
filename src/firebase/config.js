// ============================================================
// FIREBASE CONFIGURATION
// Replace the values below with your Firebase project details
// after creating a project at https://console.firebase.google.com
// ============================================================

import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: "AIzaSyByVKi1R9OwAKR9b2U6SN6SVzf-QL9JgNw",
  authDomain: "local-barbers-luton.firebaseapp.com",
  projectId: "local-barbers-luton",
  storageBucket: "local-barbers-luton.firebasestorage.app",
  messagingSenderId: "603984792256",
  appId: "1:603984792256:web:db6a29392cb4b9eb393b25"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// FCM - only init in browser, not during SSR/build
let messaging = null
try {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    messaging = getMessaging(app)
  }
} catch (e) {
  console.warn('FCM not available:', e)
}

export { messaging, getToken, onMessage }
export default app
