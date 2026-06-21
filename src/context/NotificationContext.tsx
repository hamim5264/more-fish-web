import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useAuth } from './AuthContext';
import type { AuthFlow } from '../types/aquaculture';
import {
  registerFcmToken,
  subscribeForegroundMessages,
  type PushPayload,
} from '../services/notifications.ts';

interface NotificationContextType {
  unreadCount: number;
  incrementUnread: () => void;
  clearUnread: () => void;
  lastAlert: PushPayload | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const flowsToSync: AuthFlow[] = ['fish', 'pharma', 'cattle', 'poultry'];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tokens } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastAlert, setLastAlert] = useState<PushPayload | null>(null);
  const [toast, setToast] = useState<PushPayload | null>(null);

  const incrementUnread = useCallback(() => setUnreadCount((c) => c + 1), []);
  const clearUnread = useCallback(() => setUnreadCount(0), []);

  const handleAlert = useCallback(
    (payload: PushPayload) => {
      setLastAlert(payload);
      setToast(payload);
      incrementUnread();
      window.setTimeout(() => setToast(null), 8000);
    },
    [incrementUnread]
  );

  useEffect(() => {
    flowsToSync.forEach((flow) => {
      if (tokens[flow]) registerFcmToken(flow);
    });
  }, [tokens.fish, tokens.pharma, tokens.cattle, tokens.poultry]);

  useEffect(() => subscribeForegroundMessages(handleAlert), [handleAlert]);

  return (
    <NotificationContext.Provider value={{ unreadCount, incrementUnread, clearUnread, lastAlert }}>
      {children}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex items-start gap-3 rounded-2xl border border-cyan-100 bg-white p-4 shadow-xl">
            <div className="rounded-xl bg-red-50 p-2 text-red-500">
              <Bell className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-font-dark">{toast.title}</p>
              <p className="mt-1 text-xs font-semibold text-font-light">{toast.message || toast.body}</p>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="rounded-lg p-1 text-font-light hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
