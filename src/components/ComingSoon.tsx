import React from 'react';
import { Clock, Construction } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

interface ComingSoonProps {
  title?: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ title }) => {
  const { t } = useLang();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 select-none min-h-[400px]">
      <div className="w-24 h-24 rounded-3xl bg-white border border-indigo-200 flex items-center justify-center mb-6 shadow-md">
        <Construction className="w-12 h-12 text-primary animate-bounce" />
      </div>
      <h3 className="text-3xl font-black text-font-dark tracking-wide">{title || t('feature_coming_soon')}</h3>
      <p className="text-base text-font-light max-w-lg mt-3 font-bold leading-relaxed">{t('service_coming_soon')}</p>
      <div className="mt-8 flex items-center gap-2 text-sm font-black text-font-light uppercase tracking-wider">
        <Clock className="w-5 h-5 text-primary" />
        <span>DMA Technologies</span>
      </div>
    </div>
  );
};
