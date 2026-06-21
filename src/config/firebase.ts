import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getMessaging, isSupported, type Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = () =>
  Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.messagingSenderId &&
      firebaseConfig.appId
  );

export const isFcmReady = () => isFirebaseConfigured() && Boolean(getVapidKey());

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

export const getFirebaseApp = () => {
  if (!isFirebaseConfigured()) return null;
  if (!app) {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  }
  return app;
};

export const getFirebaseMessaging = async (): Promise<Messaging | null> => {
  if (!isFirebaseConfigured()) return null;
  if (!(await isSupported())) return null;
  if (!messaging) {
    const firebaseApp = getFirebaseApp();
    if (!firebaseApp) return null;
    messaging = getMessaging(firebaseApp);
  }
  return messaging;
};

export const getVapidKey = () => import.meta.env.VITE_FIREBASE_VAPID_KEY || '';
