import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useAuth } from './AuthContext';
import type { AuthFlow } from '../types/aquaculture';
import { api, STORAGE_KEYS } from '../services/api.ts';
import {
  registerFcmToken,
  subscribeForegroundMessages,
  type PushPayload,
} from '../services/notifications.ts';

interface NotificationContextType {
  unreadCount: number;
  unreadCounts: Record<string, number>;
  incrementUnread: (flow?: string) => void;
  clearUnread: (flow?: string) => void;
  lastAlert: PushPayload | null;
  fetchUnreadForFlows: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const flowsToSync: AuthFlow[] = ['fish', 'pharma', 'cattle', 'poultry'];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tokens, allProfiles } = useAuth();
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({
    fish: 0,
    pharma: 0,
    cattle: 0,
    poultry: 0,
  });
  const [lastAlert, setLastAlert] = useState<PushPayload | null>(null);
  const [toast, setToast] = useState<PushPayload | null>(null);

  const incrementUnread = useCallback((flow?: string) => {
    if (flow) {
      setUnreadCounts((prev) => ({ ...prev, [flow]: (prev[flow] || 0) + 1 }));
    } else {
      // Default fallback
      setUnreadCounts((prev) => ({ ...prev, fish: (prev.fish || 0) + 1 }));
    }
  }, []);

  const clearUnread = useCallback((flow?: string) => {
    if (flow) {
      setUnreadCounts((prev) => ({ ...prev, [flow]: 0 }));
    } else {
      setUnreadCounts({ fish: 0, pharma: 0, cattle: 0, poultry: 0 });
    }
  }, []);

  const handleAlert = useCallback(
    (payload: PushPayload) => {
      setLastAlert(payload);
      setToast(payload);
      incrementUnread(payload.sector || payload.type || undefined);
      window.setTimeout(() => setToast(null), 8000);
    },
    [incrementUnread]
  );

  const fetchUnreadForFlows = useCallback(async () => {
    const flows: AuthFlow[] = ['fish', 'poultry', 'cattle'];
    const newCounts = { ...unreadCounts };
    let changed = false;

    for (const flow of flows) {
      const sessions = allProfiles[flow] || [];
      const activeSession = sessions[0];
      let token = '';
      let userId = '';

      if (activeSession?.userId) {
        userId = String(activeSession.userId);
        token = activeSession.token;
      } else {
        token = tokens[flow] || '';
        if (flow === 'fish') {
          userId = localStorage.getItem(STORAGE_KEYS.MORE_FISH_USER_ID) || '';
        } else if (flow === 'cattle') {
          userId = localStorage.getItem(STORAGE_KEYS.CATTLE_USER_ID) || '';
        } else if (flow === 'poultry') {
          userId = localStorage.getItem(STORAGE_KEYS.POULTRY_USER_ID) || '';
        }
      }

      if (!token) continue;
      if (flow === 'fish' && !userId) continue;

      try {
        const res = await api.getNotifications(userId, flow, token);
        const list = Array.isArray(res?.data) ? res.data : [];
        const count = list.filter((n: any) => !n.is_read).length;
        if (newCounts[flow] !== count) {
          newCounts[flow] = count;
          changed = true;
        }
      } catch (err) {
        console.error(`Failed to fetch notifications for ${flow} in polling`, err);
      }
    }

    if (changed) {
      setUnreadCounts(newCounts);
    }
  }, [tokens, allProfiles, unreadCounts]);

  useEffect(() => {
    flowsToSync.forEach((flow) => {
      if (tokens[flow]) registerFcmToken(flow);
    });
  }, [tokens.fish, tokens.pharma, tokens.cattle, tokens.poultry]);

  useEffect(() => subscribeForegroundMessages(handleAlert), [handleAlert]);

  // Poll notifications every 60 seconds
  useEffect(() => {
    fetchUnreadForFlows();
    const interval = setInterval(() => {
      fetchUnreadForFlows();
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchUnreadForFlows]);

  const totalUnreadCount = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount: totalUnreadCount,
        unreadCounts,
        incrementUnread,
        clearUnread,
        lastAlert,
        fetchUnreadForFlows,
      }}
    >
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
