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
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 animate-fade-in select-none min-h-[400px]">
        <Bell className="w-20 h-20 text-primary mb-4 animate-bounce" />
        <h3 className="text-3xl font-black text-font-dark tracking-wide">{t('please_login')}</h3>
        <p className="text-base text-font-light max-w-md mt-3 font-bold leading-relaxed">Authentication is required to pull historical safety notifications from the farm logs.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between border-b border-cyan-55 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-cyan-50 text-primary rounded-xl border border-cyan-100">
            <Bell className="w-6 h-6 animate-swing" />
          </div>
          <div>
            <h4 className="font-black text-2xl text-font-dark">{t('notifications')}</h4>
            <p className="text-[11px] font-black text-font-light uppercase">Real-time alerts & safety log history</p>
          </div>
        </div>
        <button
          onClick={fetchNotifications}
          disabled={loading}
          className="p-3 bg-white border border-cyan-200 hover:bg-cyan-50 rounded-xl text-primary transition-colors cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="bg-gradient-to-br from-red-50 to-orange-100/40 border border-red-200 p-6 rounded-3xl shadow-md space-y-4">
          {notifications.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-red-100 p-5 rounded-2xl shadow-xs flex items-start gap-4 hover:shadow-md transition-shadow"
            >
              <div className="p-2.5 bg-red-50 text-red-500 rounded-xl border border-red-150 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 w-full">
                <div className="flex justify-between items-start gap-4">
                  <h5 className="font-black text-base text-font-dark leading-snug">
                    {item.title}
                  </h5>
                  {item.timestamp && (
                    <span className="text-[10px] text-font-light font-black uppercase flex items-center gap-1 shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      {formatNotificationTimestamp(item.timestamp)}
                    </span>
                  )}
                </div>
                {item.message && (
                  <p className="text-sm text-font-light font-bold leading-relaxed">{item.message}</p>
                )}
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="text-center py-20 text-font-light text-base font-bold bg-white rounded-2xl border border-red-100/50">
              {t('no_notifications')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
