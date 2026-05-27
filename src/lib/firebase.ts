import { db } from './db';

// Adaptive configuration
const isFirebaseConfigured = 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'mock-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'blood-indo.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'blood-indo',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'blood-indo.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'mock-sender-id',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'mock-app-id'
};

// Log current operating mode
if (typeof window !== 'undefined') {
  if (isFirebaseConfigured) {
    console.log('🩸 Blood Indo Backend: Connected to live Firebase Services.');
  } else {
    console.log('🩸 Blood Indo Backend: Running in stateful Live-Simulation Mode (LocalStorage Database active).');
  }
}

export const getBackendMode = () => isFirebaseConfigured ? 'firebase' : 'simulation';
