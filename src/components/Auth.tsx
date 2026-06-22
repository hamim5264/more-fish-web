// H:\DMA Hamim\DMA-Web-App\src\components\Auth.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { api } from '../services/api.ts';
import { Mail, Lock, Phone, MapPin, User, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

import type { AuthFlow } from '../types/aquaculture';

interface AuthProps {
  flow: AuthFlow;
  onSuccess?: () => void;
}

export const Auth: React.FC<AuthProps> = ({ flow, onSuccess }) => {
  const { login } = useAuth();
  const { t } = useLang();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'otp' | 'reset'>('login');
  
  // Form Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resetUserId, setResetUserId] = useState('');

  // Status state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      await login(email, password, flow);
      setSuccess(t('welcome_back'));
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || t('invalid_credentials'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (password !== confirmPassword) {
      setError(t('password_mismatch'));
      return;
    }
    if (password.length < 5) {
      setError(t('password_length_error'));
      return;
    }

    setLoading(true);
    try {
      await api.register({
        usr_email: email,
        password,
        phone,
        first_name: firstName,
        last_name: lastName,
        user_type: 1,
        company: 1,
        user_details: `${flow} user registration`,
        usr_address: address,
        interested_product_details: flow
      });
      setSuccess(t('registration_success'));
      setTimeout(() => {
        setMode('login');
        clearMessages();
      }, 1500);
    } catch (err: any) {
      setError(err.message || t('registration_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      await api.forgotPassword(email, phone);
      setSuccess('OTP verification code sent!');
      setMode('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const res = await api.verifyOtp(otpCode);
      setResetUserId(res.user_id || res.data?.user_id || '');
      setSuccess('OTP verified! Choose new password.');
      setMode('reset');
    } catch (err: any) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (password !== confirmPassword) {
      setError(t('password_mismatch'));
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword(resetUserId, password);
      setSuccess('Password updated successfully!');
      setTimeout(() => {
        setMode('login');
        clearMessages();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Reset password failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full h-full flex items-center justify-center p-6 bg-gradient-to-tr from-cyan-100 via-blue-50 to-indigo-100 overflow-y-auto select-none">
      <div className="w-full max-w-lg bg-gradient-to-br from-white to-blue-50/95 backdrop-blur-xl border-2 border-cyan-100/90 rounded-[2.5rem] shadow-2xl overflow-hidden p-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Flow Header */}
        <div className="text-center mb-8">
          <span className="text-sm font-black bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-5 py-2 rounded-full uppercase tracking-wider shadow-md">
            {flow === 'fish' ? 'More Fish' : flow === 'cattle' ? 'Cattle Care' : 'Poultry Care'}
          </span>
          <h2 className="text-3xl font-black text-font-dark mt-5 tracking-tight">
            {mode === 'login' && t('login')}
            {mode === 'register' && t('registration')}
            {mode === 'forgot' && t('forgot_password_q')}
            {mode === 'otp' && 'Verify OTP'}
            {mode === 'reset' && 'Reset Password'}
          </h2>
          <p className="text-base text-font-light mt-2 font-semibold">
            {mode === 'login' && 'Enter your credentials to access your dashboard'}
            {mode === 'register' && 'Create your DMA Smart Farm manager profile'}
            {mode === 'forgot' && 'Provide your contact info to get OTP code'}
          </p>
        </div>

        {/* Message banners */}
        {error && (
          <div className="mb-6 flex items-center gap-3 p-5 bg-red-50 text-red-700 rounded-2xl border-2 border-red-100 text-base font-extrabold shadow-sm animate-bounce">
            <AlertCircle className="w-6 h-6 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-6 flex items-center gap-3 p-5 bg-emerald-50 text-emerald-700 rounded-2xl border-2 border-emerald-100 text-base font-extrabold shadow-sm">
            <CheckCircle className="w-6 h-6 shrink-0 text-emerald-500" />
            <span>{success}</span>
          </div>
        )}

        {/* LOGIN MODE */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-black text-font-dark mb-2 uppercase tracking-wide">{t('email')}</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder={t('enter_email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 bg-white border-2 border-cyan-100 hover:border-cyan-300 rounded-2xl text-base font-bold focus:outline-none focus:ring-4 focus:ring-cyan-200/50 focus:border-cyan-500 transition-all shadow-sm"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500" />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-black text-font-dark uppercase tracking-wide">{t('password')}</label>
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); clearMessages(); }}
                  className="text-sm text-primary font-black hover:underline cursor-pointer"
                >
                  {t('forgot_password_q')}
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder={t('enter_password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 bg-white border-2 border-cyan-100 hover:border-cyan-300 rounded-2xl text-base font-bold focus:outline-none focus:ring-4 focus:ring-cyan-200/50 focus:border-cyan-500 transition-all shadow-sm"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-5 bg-gradient-to-r from-primary to-blue-600 hover:from-primary-hover hover:to-blue-700 disabled:from-primary/50 disabled:to-blue-500/50 text-white rounded-2xl text-base font-black shadow-lg shadow-cyan-200 transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : t('login')}
            </button>

            <div className="text-center text-sm font-bold text-font-light mt-6">
              {t('dont_have_account')}{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); clearMessages(); }}
                className="text-primary font-black hover:underline cursor-pointer"
              >
                {t('register')}
              </button>
            </div>
          </form>
        )}

        {/* REGISTER MODE */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-5 max-h-120 overflow-y-auto pr-2 scrollbar-thin">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-black text-font-dark mb-2 uppercase tracking-wide">{t('first_name')}</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder={t('enter_first_name')}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border-2 border-cyan-100 hover:border-cyan-300 rounded-2xl text-base font-bold focus:outline-none focus:ring-4 focus:ring-cyan-200/50 focus:border-cyan-500 transition-all"
                  />
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-black text-font-dark mb-2 uppercase tracking-wide">{t('last_name')}</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder={t('enter_last_name')}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border-2 border-cyan-100 hover:border-cyan-300 rounded-2xl text-base font-bold focus:outline-none focus:ring-4 focus:ring-cyan-200/50 focus:border-cyan-500 transition-all"
                  />
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-font-dark mb-2 uppercase tracking-wide">{t('email')}</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder={t('enter_email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border-2 border-cyan-100 hover:border-cyan-300 rounded-2xl text-base font-bold focus:outline-none focus:ring-4 focus:ring-cyan-200/50 focus:border-cyan-500 transition-all"
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-font-dark mb-2 uppercase tracking-wide">{t('phone_number')}</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="01712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border-2 border-cyan-100 hover:border-cyan-300 rounded-2xl text-base font-bold focus:outline-none focus:ring-4 focus:ring-cyan-200/50 focus:border-cyan-500 transition-all"
                />
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-font-dark mb-2 uppercase tracking-wide">{t('address')}</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={t('enter_address')}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border-2 border-cyan-100 hover:border-cyan-300 rounded-2xl text-base font-bold focus:outline-none focus:ring-4 focus:ring-cyan-200/50 focus:border-cyan-500 transition-all"
                />
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-font-dark mb-2 uppercase tracking-wide">{t('password')}</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder={t('enter_password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border-2 border-cyan-100 hover:border-cyan-300 rounded-2xl text-base font-bold focus:outline-none focus:ring-4 focus:ring-cyan-200/50 focus:border-cyan-500 transition-all"
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-font-dark mb-2 uppercase tracking-wide">{t('confirm_password')}</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder={t('confirm_password_error')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border-2 border-cyan-100 hover:border-cyan-300 rounded-2xl text-base font-bold focus:outline-none focus:ring-4 focus:ring-cyan-200/50 focus:border-cyan-500 transition-all"
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-4 bg-gradient-to-r from-primary to-blue-600 hover:from-primary-hover hover:to-blue-700 disabled:from-primary/50 disabled:to-blue-500/50 text-white rounded-2xl text-base font-black shadow-lg shadow-cyan-200 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : t('submit')}
            </button>

            <div className="text-center text-sm font-bold text-font-light mt-4">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); clearMessages(); }}
                className="text-primary font-black hover:underline cursor-pointer"
              >
                {t('login')}
              </button>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD MODE */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-6">
            <p className="text-sm text-font-light font-bold italic">We need your Email and Phone number to verify your identity.</p>
            <div>
              <label className="block text-sm font-black text-font-dark mb-2 uppercase tracking-wide">{t('email')}</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder={t('enter_email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 bg-white border-2 border-cyan-100 hover:border-cyan-300 rounded-2xl text-base font-bold focus:outline-none focus:ring-4 focus:ring-cyan-200/50 focus:border-cyan-500 transition-all shadow-sm"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-font-dark mb-2 uppercase tracking-wide">{t('phone_number')}</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="017XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 bg-white border-2 border-cyan-100 hover:border-cyan-300 rounded-2xl text-base font-bold focus:outline-none focus:ring-4 focus:ring-cyan-200/50 focus:border-cyan-500 transition-all shadow-sm"
                />
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 hover:from-primary-hover hover:to-blue-700 disabled:from-primary/50 disabled:to-blue-500/50 text-white rounded-2xl text-base font-black shadow-lg shadow-cyan-200 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : 'Get OTP Code'}
            </button>

            <button
              type="button"
              onClick={() => { setMode('login'); clearMessages(); }}
              className="w-full text-center text-sm font-black text-font-light hover:underline mt-4 cursor-pointer"
            >
              Back to Login
            </button>
          </form>
        )}

        {/* VERIFY OTP MODE */}
        {mode === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-black text-font-dark mb-2 uppercase tracking-wide">Enter 6-Digit OTP Code</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="XXXXXX"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full text-center py-4 bg-white border-2 border-cyan-100 hover:border-cyan-300 rounded-2xl text-xl font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-cyan-200/50 focus:border-cyan-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 hover:from-primary-hover hover:to-blue-700 disabled:from-primary/50 disabled:to-blue-500/50 text-white rounded-2xl text-base font-black shadow-lg shadow-cyan-200 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : 'Verify Code'}
            </button>

            <button
              type="button"
              onClick={() => { setMode('forgot'); clearMessages(); }}
              className="w-full text-center text-sm font-black text-font-light hover:underline mt-4 cursor-pointer"
            >
              Resend OTP Code
            </button>
          </form>
        )}

        {/* RESET PASSWORD MODE */}
        {mode === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-black text-font-dark mb-2 uppercase tracking-wide">New Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 bg-white border-2 border-cyan-100 hover:border-cyan-300 rounded-2xl text-base font-bold focus:outline-none focus:ring-4 focus:ring-cyan-200/50 focus:border-cyan-500 transition-all"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-font-dark mb-2 uppercase tracking-wide">Confirm New Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 bg-white border-2 border-cyan-100 hover:border-cyan-300 rounded-2xl text-base font-bold focus:outline-none focus:ring-4 focus:ring-cyan-200/50 focus:border-cyan-500 transition-all"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 hover:from-primary-hover hover:to-blue-700 disabled:from-primary/50 disabled:to-blue-500/50 text-white rounded-2xl text-base font-black shadow-lg shadow-cyan-200 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : 'Update Password'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
