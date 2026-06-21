/* Auto-generated from .env — do not edit by hand. Run: npm run sync:fcm-sw */
importScripts('https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: 'AIzaSyD3Z2j5jGKW2kKWLSxlH2rKF5NQ1w0LuY4',
  authDomain: 'morefish-2026.firebaseapp.com',
  projectId: 'morefish-2026',
  storageBucket: 'morefish-2026.firebasestorage.app',
  messagingSenderId: '1026525000107',
  appId: '1:1026525000107:web:376f03ed7483b48d81e2ee',
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
