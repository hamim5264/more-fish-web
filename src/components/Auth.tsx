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
    <div className="flex-1 w-full h-full flex items-center justify-center p-6 bg-linear-to-tr from-bg-light via-cyan-50 to-blue-50 overflow-y-auto select-none">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-cyan-100 rounded-3xl shadow-xl overflow-hidden p-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Flow Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold bg-cyan-100 text-primary px-3 py-1 rounded-full uppercase tracking-wider">
            {flow === 'fish' ? 'More Fish' : flow === 'cattle' ? 'Cattle Care' : 'Poultry Care'}
          </span>
          <h2 className="text-2xl font-black text-font-dark mt-3">
            {mode === 'login' && t('login')}
            {mode === 'register' && t('registration')}
            {mode === 'forgot' && t('forgot_password_q')}
            {mode === 'otp' && 'Verify OTP'}
            {mode === 'reset' && 'Reset Password'}
          </h2>
          <p className="text-sm text-font-light mt-1 font-medium">
            {mode === 'login' && 'Enter your credentials to access your dashboard'}
            {mode === 'register' && 'Create your DMA Smart Farm manager profile'}
            {mode === 'forgot' && 'Provide your contact info to get OTP code'}
          </p>
        </div>

        {/* Message banners */}
        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 text-sm font-semibold">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* LOGIN MODE */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-font-dark mb-1.5 uppercase tracking-wide">{t('email')}</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder={t('enter_email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/60 border border-cyan-100/80 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-cyan-500" />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="block text-xs font-bold text-font-dark uppercase tracking-wide">{t('password')}</label>
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); clearMessages(); }}
                  className="text-xs text-primary font-bold hover:underline"
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
                  className="w-full pl-11 pr-4 py-3 bg-white/60 border border-cyan-100/80 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-cyan-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white rounded-2xl font-bold shadow-md shadow-cyan-100 transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : t('login')}
            </button>

            <div className="text-center text-xs font-semibold text-font-light mt-6">
              {t('dont_have_account')}{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); clearMessages(); }}
                className="text-primary font-bold hover:underline"
              >
                {t('register')}
              </button>
            </div>
          </form>
        )}

        {/* REGISTER MODE */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4 max-h-105 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-font-dark mb-1.5 uppercase tracking-wide">{t('first_name')}</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder={t('enter_first_name')}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-white/60 border border-cyan-100/80 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-cyan-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-font-dark mb-1.5 uppercase tracking-wide">{t('last_name')}</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder={t('enter_last_name')}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-white/60 border border-cyan-100/80 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-cyan-500" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-font-dark mb-1.5 uppercase tracking-wide">{t('email')}</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder={t('enter_email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-white/60 border border-cyan-100/80 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-cyan-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-font-dark mb-1.5 uppercase tracking-wide">{t('phone_number')}</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="01712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-white/60 border border-cyan-100/80 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-cyan-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-font-dark mb-1.5 uppercase tracking-wide">{t('address')}</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={t('enter_address')}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-white/60 border border-cyan-100/80 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-cyan-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-font-dark mb-1.5 uppercase tracking-wide">{t('password')}</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder={t('enter_password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-white/60 border border-cyan-100/80 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-cyan-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-font-dark mb-1.5 uppercase tracking-wide">{t('confirm_password')}</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder={t('confirm_password_error')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-white/60 border border-cyan-100/80 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-cyan-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white rounded-2xl font-bold shadow-md shadow-cyan-100 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : t('submit')}
            </button>

            <div className="text-center text-xs font-semibold text-font-light mt-4">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); clearMessages(); }}
                className="text-primary font-bold hover:underline"
              >
                {t('login')}
              </button>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD MODE */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-5">
            <p className="text-xs text-font-light font-medium italic">We need your Email and Phone number to verify your identity.</p>
            <div>
              <label className="block text-xs font-bold text-font-dark mb-1.5 uppercase tracking-wide">{t('email')}</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder={t('enter_email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/60 border border-cyan-100/80 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-cyan-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-font-dark mb-1.5 uppercase tracking-wide">{t('phone_number')}</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="017XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/60 border border-cyan-100/80 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
                <Phone className="absolute left-4 top-3.5 w-4 h-4 text-cyan-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white rounded-2xl font-bold shadow-md shadow-cyan-100 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Get OTP Code'}
            </button>

            <button
              type="button"
              onClick={() => { setMode('login'); clearMessages(); }}
              className="w-full text-center text-xs font-bold text-font-light hover:underline mt-4 cursor-pointer"
            >
              Back to Login
            </button>
          </form>
        )}

        {/* VERIFY OTP MODE */}
        {mode === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-font-dark mb-1.5 uppercase tracking-wide">Enter 6-Digit OTP Code</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="XXXXXX"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full text-center py-4 bg-white/60 border border-cyan-100/80 rounded-2xl text-lg font-black tracking-widest focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white rounded-2xl font-bold shadow-md shadow-cyan-100 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Verify Code'}
            </button>

            <button
              type="button"
              onClick={() => { setMode('forgot'); clearMessages(); }}
              className="w-full text-center text-xs font-bold text-font-light hover:underline mt-4 cursor-pointer"
            >
              Resend OTP Code
            </button>
          </form>
        )}

        {/* RESET PASSWORD MODE */}
        {mode === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-font-dark mb-1.5 uppercase tracking-wide">New Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/60 border border-cyan-100/80 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-cyan-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-font-dark mb-1.5 uppercase tracking-wide">Confirm New Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/60 border border-cyan-100/80 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-cyan-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white rounded-2xl font-bold shadow-md shadow-cyan-100 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Update Password'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
