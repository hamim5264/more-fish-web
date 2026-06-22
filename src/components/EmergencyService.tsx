import React from 'react';
import { Phone, MessageSquare, HeartHandshake, PhoneCall } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

export const EmergencyService: React.FC = () => {
  const { t } = useLang();
  const phone = '+8801898938354';

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none max-w-4xl mx-auto w-full">
      <div className="bg-gradient-to-br from-red-50 to-orange-100/40 border border-red-200 p-10 rounded-3xl shadow-md space-y-6 text-center">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-white border border-red-200 flex items-center justify-center shadow-sm">
          <HeartHandshake className="w-10 h-10 text-red-500 animate-pulse" />
        </div>
        <h3 className="text-3xl font-black text-font-dark tracking-wide">{t('emergency_service')}</h3>
        <p className="text-base text-font-light font-bold max-w-lg mx-auto leading-relaxed">
          24/7 expert support for critical farm alerts, device failures, and emergency aquaculture guidance.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <button
            type="button"
            onClick={() => window.open(`tel:${phone}`)}
            className="flex items-center justify-center gap-2 py-4 px-6 bg-red-600 text-white font-black text-sm rounded-xl hover:bg-red-700 transition-colors shadow-md cursor-pointer"
          >
            <PhoneCall className="w-5 h-5" />
            Call Now
          </button>
          <button
            type="button"
            onClick={() => window.open(`tel:${phone}`)}
            className="flex items-center justify-center gap-2 py-4 px-6 bg-white text-primary border border-red-200 font-black text-sm rounded-xl hover:bg-red-50 transition-colors shadow-sm cursor-pointer"
          >
            <Phone className="w-5 h-5" />
            {phone}
          </button>
          <button
            type="button"
            onClick={() => window.open(`https://wa.me/${phone.replace('+', '')}`, '_blank')}
            className="flex items-center justify-center gap-2 py-4 px-6 bg-emerald-600 text-white font-black text-sm rounded-xl hover:bg-emerald-700 transition-colors shadow-md cursor-pointer"
          >
            <MessageSquare className="w-5 h-5" />
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};
