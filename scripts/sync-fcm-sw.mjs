/**
 * Syncs public/firebase-messaging-sw.js from .env Firebase variables.
 * Run automatically before dev/build via package.json scripts.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(root, '.env');

const readEnv = () => {
  try {
    const raw = readFileSync(envPath, 'utf8');
    return Object.fromEntries(
      raw
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#'))
        .map((line) => {
          const idx = line.indexOf('=');
          return [line.slice(0, idx), line.slice(idx + 1)];
        })
    );
  } catch {
    return {};
  }
};

const env = readEnv();
const cfg = {
  apiKey: env.VITE_FIREBASE_API_KEY || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: env.VITE_FIREBASE_APP_ID || '',
};

const sw = `/* Auto-generated from .env — do not edit by hand. Run: npm run sync:fcm-sw */
importScripts('https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: '${cfg.apiKey}',
  authDomain: '${cfg.authDomain}',
  projectId: '${cfg.projectId}',
  storageBucket: '${cfg.storageBucket}',
  messagingSenderId: '${cfg.messagingSenderId}',
  appId: '${cfg.appId}',
};

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const data = payload.data || {};
    const notificationTitle = data.title || payload.notification?.title || 'DMA Alert';
    const notificationOptions = {
      body: data.message || data.body || payload.notification?.body || '',
      icon: '/favicon.svg',
      data: data,
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}
`;

writeFileSync(resolve(root, 'public/firebase-messaging-sw.js'), sw, 'utf8');
console.log('[sync-fcm-sw] Updated public/firebase-messaging-sw.js');
