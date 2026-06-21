import React from 'react';
import { Clock, Construction } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

interface ComingSoonProps {
  title?: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ title }) => {
  const { t } = useLang();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-linear-to-tr from-bg-light/10 to-cyan-50/10 select-none">
      <div className="w-20 h-20 rounded-3xl bg-cyan-50 border border-cyan-100 flex items-center justify-center mb-5 shadow-sm">
        <Construction className="w-10 h-10 text-primary animate-pulse" />
      </div>
      <h3 className="text-xl font-bold text-font-dark">{title || t('feature_coming_soon')}</h3>
      <p className="text-sm text-font-light max-w-md mt-2 font-semibold">{t('service_coming_soon')}</p>
      <div className="mt-6 flex items-center gap-2 text-xs font-bold text-font-light">
        <Clock className="w-4 h-4" />
        <span>DMA Technologies</span>
      </div>
    </div>
  );
};
