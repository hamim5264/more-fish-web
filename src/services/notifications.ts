import { getToken, onMessage } from 'firebase/messaging';
import { api, STORAGE_KEYS } from './api.ts';
import { getFirebaseMessaging, getVapidKey, isFcmReady, isFirebaseConfigured } from '../config/firebase.ts';
import type { AuthFlow } from '../types/aquaculture';

export type NotificationSector = 'fish' | 'pharma' | 'cattle' | 'poultry';

export interface PushPayload {
  title?: string;
  message?: string;
  body?: string;
  type?: string;
  sector?: string;
}

const sectorFromPayload = (data: Record<string, string | undefined>): NotificationSector => {
  const type = (data.type || data.sector || '').toLowerCase();
  if (type === 'cattle') return 'cattle';
  if (type === 'poultry') return 'poultry';
  if (type === 'pharma') return 'pharma';
  return 'fish';
};

export const isLoggedInForSector = (sector: NotificationSector): boolean => {
  if (sector === 'cattle') return Boolean(localStorage.getItem(STORAGE_KEYS.CATTLE_TOKEN));
  if (sector === 'poultry') return Boolean(localStorage.getItem(STORAGE_KEYS.POULTRY_TOKEN));
  if (sector === 'pharma') return Boolean(localStorage.getItem(STORAGE_KEYS.PHARMA_TOKEN));
  return Boolean(localStorage.getItem(STORAGE_KEYS.MORE_FISH_TOKEN));
};

export const parsePushPayload = (payload: any): PushPayload => {
  const data = payload?.data || {};
  return {
    title: data.title || payload?.notification?.title || 'DMA Alert',
    message: data.message || data.body || payload?.notification?.body || '',
    body: data.body || data.message || payload?.notification?.body || '',
    type: data.type,
    sector: data.sector,
  };
};

export const shouldShowPush = (payload: PushPayload): boolean => {
  const sector = sectorFromPayload({
    type: payload.type,
    sector: payload.sector,
  });
  return isLoggedInForSector(sector);
};

export const registerFcmToken = async (flow?: AuthFlow): Promise<string | null> => {
  if (!isFirebaseConfigured()) return null;
  if (!getVapidKey()) {
    console.warn('[FCM] VITE_FIREBASE_VAPID_KEY is missing — add the Web Push certificate from Firebase Console.');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    if ('serviceWorker' in navigator) {
      await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    }

    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;

    const vapidKey = getVapidKey();
    const token = await getToken(messaging, vapidKey ? { vapidKey } : undefined);
    if (!token) return null;

    localStorage.setItem(STORAGE_KEYS.FCM_TOKEN, token);
    await api.updateFcmToken(token, flow);
    return token;
  } catch (error) {
    console.error('[FCM] Token registration failed:', error);
    return null;
  }
};

export const subscribeForegroundMessages = (
  onAlert: (payload: PushPayload) => void
): (() => void) => {
  let unsubscribe: (() => void) | undefined;

  const setup = async () => {
    if (!isFcmReady()) return;
    const messaging = await getFirebaseMessaging();
    if (!messaging) return;

    unsubscribe = onMessage(messaging, (payload) => {
      const parsed = parsePushPayload(payload);
      if (!shouldShowPush(parsed)) return;
      onAlert(parsed);
    });
  };

  setup();

  return () => {
    if (unsubscribe) unsubscribe();
  };
};
