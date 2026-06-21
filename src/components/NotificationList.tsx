// H:\DMA Hamim\DMA-Web-App\src\components\NotificationList.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import {
  api,
  formatNotificationTimestamp,
  STORAGE_KEYS,
  type NormalizedNotification,
} from '../services/api.ts';
import { Bell, RefreshCw, AlertCircle, Calendar } from 'lucide-react';
import type { Ecosystem } from '../types/navigation';
import { ecosystemToAuthFlow } from '../types/navigation';

interface NotificationListProps {
  activeEcosystem: Ecosystem;
}

export const NotificationList: React.FC<NotificationListProps> = ({ activeEcosystem }) => {
  const { tokens } = useAuth();
  const { t } = useLang();
  const { clearUnread } = useNotifications();

  const [notifications, setNotifications] = useState<NormalizedNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const authFlow = ecosystemToAuthFlow(activeEcosystem);

  const fetchNotifications = async () => {
    if (!authFlow) {
      setNotifications([]);
      return;
    }

    const userId = (() => {
      if (authFlow === 'fish') return localStorage.getItem(STORAGE_KEYS.MORE_FISH_USER_ID) || '';
      if (authFlow === 'pharma') return localStorage.getItem(STORAGE_KEYS.PHARMA_USER_ID) || '';
      if (authFlow === 'cattle') return localStorage.getItem(STORAGE_KEYS.CATTLE_USER_ID) || '';
      return localStorage.getItem(STORAGE_KEYS.POULTRY_USER_ID) || '';
    })();

    if (!userId) {
      setNotifications([]);
      return;
    }

    setLoading(true);
    try {
      const res = await api.getNotifications(userId, authFlow);
      setNotifications(Array.isArray(res?.data) ? res.data : []);
      clearUnread();
    } catch (err: any) {
      console.error(err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [activeEcosystem]);

  const hasToken = authFlow ? Boolean(tokens[authFlow]) : false;

  if (!hasToken) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-linear-to-tr from-bg-light to-cyan-50 animate-fade-in select-none">
        <Bell className="w-16 h-16 text-cyan-400 mb-4 animate-pulse" />
        <h3 className="text-xl font-bold text-font-dark">{t('please_login')}</h3>
        <p className="text-sm text-font-light max-w-sm mt-2">Authentication is required to pull historical safety notifications from the farm logs.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between border-b border-cyan-50 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-50 text-primary rounded-xl border border-cyan-100">
            <Bell className="w-5 h-5 animate-swing" />
          </div>
          <div>
            <h4 className="font-bold text-font-dark">{t('notifications')}</h4>
            <p className="text-[10px] font-bold text-font-light uppercase">Real-time alerts & safety log history</p>
          </div>
        </div>
        <button
          onClick={fetchNotifications}
          disabled={loading}
          className="p-2 bg-gray-50 border border-gray-100 hover:bg-gray-100 rounded-xl text-primary transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((item) => (
            <div
              key={item.id}
              className="bg-white/80 border border-cyan-100/30 p-5 rounded-3xl shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow"
            >
              <div className="p-2 bg-red-50 text-red-500 rounded-xl border border-red-100 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1 w-full">
                <div className="flex justify-between items-start gap-4">
                  <h5 className="font-extrabold text-sm text-font-dark leading-snug">
                    {item.title}
                  </h5>
                  {item.timestamp && (
                    <span className="text-[9px] text-font-light font-bold flex items-center gap-1 shrink-0">
                      <Calendar className="w-3 h-3" />
                      {formatNotificationTimestamp(item.timestamp)}
                    </span>
                  )}
                </div>
                {item.message && (
                  <p className="text-xs text-font-light font-semibold leading-relaxed">{item.message}</p>
                )}
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="text-center py-20 text-font-light font-bold">
              {t('no_notifications')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
