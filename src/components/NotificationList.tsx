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
import { Bell, RefreshCw, AlertCircle, Calendar, ChevronDown, User } from 'lucide-react';
import type { Ecosystem } from '../types/navigation';
import { ecosystemToAuthFlow } from '../types/navigation';

interface NotificationListProps {
  activeEcosystem: Ecosystem;
}

export const NotificationList: React.FC<NotificationListProps> = ({ activeEcosystem }) => {
  const { tokens, allProfiles, viewMode } = useAuth();
  const { t } = useLang();
  const { clearUnread } = useNotifications();

  const [notifications, setNotifications] = useState<NormalizedNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProfileIndex, setSelectedProfileIndex] = useState<number>(0);

  const authFlow = ecosystemToAuthFlow(activeEcosystem);
  const isPoultry = activeEcosystem === 'poultry';
  const sessions = authFlow ? (allProfiles[authFlow] || []) : [];
  const showProfilePicker = viewMode === 'multiple' && sessions.length > 1;

  // Resolve the active session token & userId based on selectedProfileIndex
  const activeSession = showProfilePicker ? sessions[selectedProfileIndex] : sessions[0];

  const fetchNotifications = async () => {
    if (!authFlow) {
      setNotifications([]);
      return;
    }

    const userId = (() => {
      if (activeSession?.userId) return String(activeSession.userId);
      if (authFlow === 'fish') return localStorage.getItem(STORAGE_KEYS.MORE_FISH_USER_ID) || '';
      if (authFlow === 'pharma') return localStorage.getItem(STORAGE_KEYS.PHARMA_USER_ID) || '';
      if (authFlow === 'cattle') return localStorage.getItem(STORAGE_KEYS.CATTLE_USER_ID) || '';
      return localStorage.getItem(STORAGE_KEYS.POULTRY_USER_ID) || '';
    })();

    if (!userId) {
      setNotifications([]);
      return;
    }

    const token = activeSession?.token || (authFlow ? tokens[authFlow] : null);

    setLoading(true);
    try {
      const res = await api.getNotifications(userId, authFlow, token);
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
    setSelectedProfileIndex(0);
  }, [activeEcosystem]);

  useEffect(() => {
    fetchNotifications();
  }, [activeEcosystem, selectedProfileIndex]);

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
          <div className={`p-2.5 rounded-xl border ${isPoultry ? 'bg-[#dbcc68]/20 text-[#1f6f3c] border-[#c4b55c]/40' : 'bg-cyan-50 text-primary border-cyan-100'}`}>
            <Bell className="w-6 h-6 animate-swing" />
          </div>
          <div>
            <h4 className="font-black text-2xl text-font-dark">{t('notifications')}</h4>
            <p className="text-[11px] font-black text-font-light uppercase">Real-time alerts &amp; safety log history</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Profile picker for multiple-view mode */}
          {showProfilePicker && (
            <div className="relative flex items-center gap-2">
              <User className={`w-4 h-4 shrink-0 ${isPoultry ? 'text-[#1f6f3c]' : 'text-primary'}`} />
              <div className="relative">
                <select
                  value={selectedProfileIndex}
                  onChange={(e) => setSelectedProfileIndex(Number(e.target.value))}
                  className={`appearance-none cursor-pointer rounded-xl border pl-3 pr-7 py-2 text-xs font-black focus:outline-none focus:ring-2 transition-colors ${
                    isPoultry
                      ? 'bg-[#dbcc68]/15 hover:bg-[#dbcc68]/30 border-[#c4b55c]/40 text-[#1f6f3c] focus:ring-[#1f6f3c]'
                      : 'bg-cyan-50 hover:bg-cyan-100/60 border-cyan-200 text-primary focus:ring-primary'
                  }`}
                >
                  {sessions.map((session, index) => {
                    const displayName = session.first_name
                      ? `${session.first_name} ${session.last_name || ''}`.trim()
                      : session.email || `Account ${index + 1}`;
                    return (
                      <option key={index} value={index}>
                        {displayName.split('@')[0].slice(0, 18)}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-font-light" />
              </div>
            </div>
          )}

          <button
            onClick={fetchNotifications}
            disabled={loading}
            className={`p-3 border hover:bg-opacity-60 rounded-xl transition-colors cursor-pointer shadow-xs ${
              isPoultry
                ? 'bg-[#dbcc68]/20 border-[#c4b55c]/40 hover:bg-[#dbcc68]/40 text-[#1f6f3c]'
                : 'bg-white border-cyan-200 hover:bg-cyan-50 text-primary'
            }`}
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Active profile badge */}
      {showProfilePicker && activeSession && (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black w-fit ${
          isPoultry
            ? 'bg-[#dbcc68]/20 border border-[#c4b55c]/30 text-[#1f6f3c]'
            : 'bg-cyan-50 border border-cyan-100 text-primary'
        }`}>
          <User className="w-3.5 h-3.5" />
          <span>
            {activeSession.first_name
              ? `${activeSession.first_name} ${activeSession.last_name || ''}`.trim()
              : activeSession.email || `Account ${selectedProfileIndex + 1}`}
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className={`w-8 h-8 animate-spin ${isPoultry ? 'text-[#1f6f3c]' : 'text-primary'}`} />
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
