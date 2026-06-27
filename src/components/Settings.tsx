// H:\DMA Hamim\DMA-Web-App\src\components\Settings.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { api } from '../services/api.ts';
import { Settings as SettingsIcon, Languages, Lock, ShieldCheck, RefreshCw, Info, ChevronDown, User } from 'lucide-react';
import type { Ecosystem } from '../types/navigation';
import { ecosystemToAuthFlow } from '../types/navigation';

interface SettingsProps {
  activeEcosystem: Ecosystem;
}

export const Settings: React.FC<SettingsProps> = ({ activeEcosystem }) => {
  const { tokens, allProfiles, viewMode } = useAuth();
  const { lang, setLang, t } = useLang();

  const [selectedProfileIndex, setSelectedProfileIndex] = useState<number>(0);

  // Change Password form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const authFlow = ecosystemToAuthFlow(activeEcosystem);
  const isPoultry = activeEcosystem === 'poultry';
  const sessions = authFlow ? (allProfiles[authFlow] || []) : [];
  const showProfilePicker = viewMode === 'multiple' && sessions.length > 1;
  const activeSession = showProfilePicker ? sessions[selectedProfileIndex] : sessions[0];

  // Reset form + profile index on ecosystem change
  useEffect(() => {
    setSelectedProfileIndex(0);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSuccess(null);
    setError(null);
  }, [activeEcosystem]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError(t('password_mismatch'));
      return;
    }

    const currentToken = activeSession?.token || (authFlow ? tokens[authFlow] : null);
    if (!currentToken) {
      setError(t('please_login'));
      return;
    }

    setLoading(true);
    try {
      await api.changePassword(oldPassword, newPassword, authFlow!, currentToken);
      setSuccess('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  const accentBorder = isPoultry ? 'border-[#c4b55c]/40' : 'border-cyan-100';
  const accentBg = isPoultry ? 'bg-[#dbcc68]/15' : 'bg-cyan-50';
  const accentText = isPoultry ? 'text-[#1f6f3c]' : 'text-primary';
  const accentRing = isPoultry ? 'focus:ring-[#1f6f3c]' : 'focus:ring-primary';

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between border-b border-cyan-50 pb-4">
        <div className="flex items-center gap-2.5">
          <div className={`p-2.5 rounded-xl border ${isPoultry ? 'bg-[#dbcc68]/20 text-[#1f6f3c] border-[#c4b55c]/40' : 'bg-cyan-50 text-primary border-cyan-100'}`}>
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-2xl text-font-dark">{t('change_password')} &amp; Settings</h4>
            <p className="text-[11px] font-black text-font-light uppercase">User configuration &amp; system details</p>
          </div>
        </div>

        {/* Profile picker for multiple-view mode */}
        {showProfilePicker && (
          <div className="flex items-center gap-2">
            <User className={`w-4 h-4 shrink-0 ${accentText}`} />
            <div className="relative">
              <select
                value={selectedProfileIndex}
                onChange={(e) => {
                  setSelectedProfileIndex(Number(e.target.value));
                  setSuccess(null);
                  setError(null);
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className={`appearance-none cursor-pointer rounded-xl border pl-3 pr-7 py-2 text-xs font-black focus:outline-none focus:ring-2 transition-colors ${accentBg} ${accentBorder} ${accentText} ${accentRing} hover:opacity-80`}
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
      </div>

      {/* Active profile badge */}
      {showProfilePicker && activeSession && (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black w-fit ${accentBg} border ${accentBorder} ${accentText}`}>
          <User className="w-3.5 h-3.5" />
          <span>
            {activeSession.first_name
              ? `${activeSession.first_name} ${activeSession.last_name || ''}`.trim()
              : activeSession.email || `Account ${selectedProfileIndex + 1}`}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Left Column: Form Settings */}
        <div className="space-y-6">
          {/* Language selection card */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-100/40 border border-indigo-200 p-6 rounded-3xl shadow-md space-y-4">
            <h4 className="font-black text-base text-font-dark flex items-center gap-2">
              <Languages className="w-5 h-5 text-primary" />
              <span>{t('language')} Settings</span>
            </h4>
            <div className="flex gap-3">
              <button
                onClick={() => setLang('en')}
                className={`flex-1 py-3.5 text-sm font-black rounded-2xl border transition-colors cursor-pointer shadow-xs ${
                  lang === 'en' ? 'bg-primary text-white border-primary shadow-md' : 'bg-white border-indigo-200 text-font-dark hover:bg-indigo-50/50'
                }`}
              >
                {t('english')}
              </button>
              <button
                onClick={() => setLang('bn')}
                className={`flex-1 py-3.5 text-sm font-black rounded-2xl border transition-colors cursor-pointer shadow-xs ${
                  lang === 'bn' ? 'bg-primary text-white border-primary shadow-md' : 'bg-white border-indigo-200 text-font-dark hover:bg-indigo-50/50'
                }`}
              >
                {t('bangla')}
              </button>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-gradient-to-br from-pink-50 to-rose-100/40 border border-pink-200 p-6 rounded-3xl shadow-md space-y-4">
            <h4 className="font-black text-base text-font-dark flex items-center gap-2 border-b border-pink-100 pb-3">
              <Lock className="w-5 h-5 text-primary" />
              <span>Update Password</span>
              {showProfilePicker && activeSession && (
                <span className="ml-auto text-[10px] font-bold text-font-light bg-pink-50 border border-pink-100 px-2 py-0.5 rounded-full">
                  {activeSession.first_name || activeSession.email?.split('@')[0] || `Account ${selectedProfileIndex + 1}`}
                </span>
              )}
            </h4>

            {error && <div className="p-3.5 text-xs bg-red-50 text-red-600 border border-red-150 rounded-xl font-black">{error}</div>}
            {success && <div className="p-3.5 text-xs bg-emerald-50 text-emerald-600 border border-emerald-150 rounded-xl font-black">{success}</div>}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-font-dark mb-1">Old Password</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-pink-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-font-dark mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-pink-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-font-dark mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-pink-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-black text-sm rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {loading ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : <span>Change Password</span>}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Developers / Metadata */}
        <div className="bg-gradient-to-br from-cyan-50 to-sky-100/40 border border-cyan-200 p-6 rounded-3xl shadow-md space-y-6">
          <div className="flex items-center gap-2 border-b border-cyan-100 pb-3">
            <Info className="w-5 h-5 text-primary" />
            <h4 className="font-black text-base text-font-dark">About Application</h4>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-cyan-100 shadow-xs">
              <h5 className="font-black text-base text-font-dark">More Fish Smart Farming</h5>
              <p className="text-xs text-font-light leading-relaxed font-bold mt-1">
                Version 3.2.0 (Web Build)<br />
                A comprehensive farming controller and analytics platform integrating Aquaculture, Poultry, Cattle, and Air Quality IoT nodes.
              </p>
            </div>

            <div className="border-t border-cyan-100 pt-4 space-y-3">
              <h5 className="font-black text-xs text-font-dark uppercase tracking-wider">Development Team</h5>

              <div className="space-y-3 font-bold">
                <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-cyan-100 shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="text-font-dark font-black leading-tight">DMA Technologies</p>
                    <p className="text-font-light mt-0.5">Smart Farming Solutions &amp; IoT Hardware Integration</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
