import React from 'react';
import { Phone, MessageSquare, HeartHandshake, PhoneCall } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

export const EmergencyService: React.FC = () => {
  const { t } = useLang();
  const phone = '+8801898938354';

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none max-w-3xl mx-auto w-full">
      <div className="bg-white/80 border border-red-100/50 p-8 rounded-3xl shadow-sm space-y-6 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
          <HeartHandshake className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-black text-font-dark">{t('emergency_service')}</h3>
        <p className="text-sm text-font-light font-semibold max-w-md mx-auto">
          24/7 expert support for critical farm alerts, device failures, and emergency aquaculture guidance.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <button
            type="button"
            onClick={() => window.open(`tel:${phone}`)}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-red-500 text-white font-bold text-sm rounded-xl hover:bg-red-600 transition-colors"
          >
            <PhoneCall className="w-4 h-4" />
            Call Now
          </button>
          <button
            type="button"
            onClick={() => window.open(`tel:${phone}`)}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-cyan-50 text-primary border border-cyan-100 font-bold text-sm rounded-xl hover:bg-cyan-100"
          >
            <Phone className="w-4 h-4" />
            {phone}
          </button>
          <button
            type="button"
            onClick={() => window.open(`https://wa.me/${phone.replace('+', '')}`, '_blank')}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500 text-white font-bold text-sm rounded-xl hover:bg-emerald-600"
          >
            <MessageSquare className="w-4 h-4" />
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};
