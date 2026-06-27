import React from 'react';
import { Clock } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import defaultLogo from '../assets/DMA Logo.png';

interface ComingSoonProps {
  title?: string;
  logo?: string;
  isPoultry?: boolean;
  isCattle?: boolean;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ title, logo, isPoultry, isCattle }) => {
  const { t } = useLang();

  const bgClass = isPoultry
    ? 'bg-[#ebffff] rounded-3xl'
    : isCattle
    ? 'bg-slate-50 rounded-3xl'
    : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50';

  const borderClass = isPoultry
    ? 'border-[#dbcc68]/50'
    : isCattle
    ? 'border-slate-200'
    : 'border-indigo-200';

  const iconColor = isPoultry ? 'text-[#1f6f3c]' : isCattle ? 'text-slate-500' : 'text-primary';

  return (
    <div className={`flex-1 flex flex-col items-center justify-center p-8 text-center select-none min-h-[400px] ${bgClass}`}>
      <div className={`w-28 h-28 rounded-3xl bg-white border flex items-center justify-center mb-6 shadow-md ${borderClass}`}>
        <img
          src={logo || defaultLogo}
          alt={title || 'Coming Soon'}
          className="w-20 h-20 object-contain animate-pulse"
        />
      </div>
      <h3 className="text-3xl font-black text-font-dark tracking-wide">{title || t('feature_coming_soon')}</h3>
      <p className="text-base text-font-light max-w-lg mt-3 font-bold leading-relaxed">{t('service_coming_soon')}</p>
      <div className="mt-8 flex items-center gap-2 text-sm font-black text-font-light uppercase tracking-wider">
        <Clock className={`w-5 h-5 ${iconColor}`} />
        <span>DMA Technologies</span>
      </div>
    </div>
  );
};
