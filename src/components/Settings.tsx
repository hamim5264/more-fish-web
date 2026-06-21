// H:\DMA Hamim\DMA-Web-App\src\components\Settings.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { api } from '../services/api.ts';
import { Settings as SettingsIcon, Languages, Lock, ShieldCheck, RefreshCw, Info, UserCheck } from 'lucide-react';
import type { Ecosystem } from '../types/navigation';
import { ecosystemToAuthFlow } from '../types/navigation';

interface SettingsProps {
  activeEcosystem: Ecosystem;
}

export const Settings: React.FC<SettingsProps> = ({ activeEcosystem }) => {
  const { tokens } = useAuth();
  const { lang, setLang, t } = useLang();

  // Change Password form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError(t('password_mismatch'));
      return;
    }
    
    // Auth check
    const authFlow = ecosystemToAuthFlow(activeEcosystem);
    const currentToken = authFlow ? tokens[authFlow] : null;
    if (!currentToken) {
      setError(t('please_login'));
      return;
    }

    setLoading(true);
    try {
      await api.changePassword(oldPassword, newPassword, authFlow!);
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

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-2.5 border-b border-cyan-50 pb-4">
        <div className="p-2 bg-cyan-50 text-primary rounded-xl border border-cyan-100">
          <SettingsIcon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-font-dark">{t('change_password')} & Settings</h4>
          <p className="text-[10px] font-bold text-font-light uppercase">User configuration & system details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Form Settings */}
        <div className="space-y-6">
          {/* Language selection card */}
          <div className="bg-white/80 border border-cyan-100/40 p-6 rounded-3xl shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-font-dark flex items-center gap-2">
              <Languages className="w-4 h-4 text-primary" />
              <span>{t('language')} Settings</span>
            </h4>
            <div className="flex gap-3">
              <button
                onClick={() => setLang('en')}
                className={`flex-1 py-3 text-sm font-bold rounded-2xl border transition-colors cursor-pointer ${
                  lang === 'en' ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white border-cyan-100 text-font-dark hover:bg-cyan-50/50'
                }`}
              >
                {t('english')}
              </button>
              <button
                onClick={() => setLang('bn')}
                className={`flex-1 py-3 text-sm font-bold rounded-2xl border transition-colors cursor-pointer ${
                  lang === 'bn' ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white border-cyan-100 text-font-dark hover:bg-cyan-50/50'
                }`}
              >
                {t('bangla')}
              </button>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-white/80 border border-cyan-100/40 p-6 rounded-3xl shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-font-dark flex items-center gap-2 border-b border-cyan-50 pb-3">
              <Lock className="w-4 h-4 text-primary" />
              <span>Update Password</span>
            </h4>

            {error && <div className="p-3 text-xs bg-red-50 text-red-500 rounded-xl font-bold">{error}</div>}
            {success && <div className="p-3 text-xs bg-emerald-50 text-emerald-600 rounded-xl font-bold">{success}</div>}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-font-dark mb-1">Old Password</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white/60 border border-cyan-100/80 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-font-dark mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white/60 border border-cyan-100/80 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-font-dark mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white/60 border border-cyan-100/80 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-bold text-xs rounded-xl shadow transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Change Password</span>}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Developers / Metadata */}
        <div className="bg-white/80 border border-cyan-100/40 p-6 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-cyan-50 pb-3">
            <Info className="w-4 h-4 text-primary" />
            <h4 className="font-bold text-sm text-font-dark">About Application</h4>
          </div>

          <div className="space-y-4">
            <div>
              <h5 className="font-black text-sm text-font-dark">More Fish Smart Farming</h5>
              <p className="text-xs text-font-light leading-relaxed font-semibold mt-1">
                Version 3.2.0 (Web Build)<br />
                A comprehensive farming controller and analytics platform integrating Aquaculture, Poultry, Cattle, and Air Quality IoT nodes.
              </p>
            </div>

            <div className="border-t border-cyan-50/50 pt-4 space-y-3">
              <h5 className="font-black text-xs text-font-dark uppercase tracking-wider">Development Team</h5>
              
              <div className="space-y-3 font-semibold">
                <div className="flex items-start gap-2.5">
                  <UserCheck className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="text-font-dark font-extrabold leading-tight">Md. Abdul Hamim Leon</p>
                    <p className="text-font-light mt-0.5">Flutter & AI Developer | Automation Systems</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <UserCheck className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="text-font-dark font-extrabold leading-tight">Izaz Ahmed (ahizaz)</p>
                    <p className="text-font-light mt-0.5">Flutter Developer</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="text-font-dark font-extrabold leading-tight">DMA Technologies</p>
                    <p className="text-font-light mt-0.5">Smart Farming Solutions & IoT Hardware Integration</p>
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
