import React from 'react';
import { BookOpen, HelpCircle, Cpu } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

type InfoPageType = 'faq' | 'about-app' | 'about-device';

interface InfoPageProps {
  type: InfoPageType;
}

const faqItems = [
  { q: 'choose', a: 'We provide 24/7 IoT monitoring, AI disease detection, and automated aeration for modern aquaculture.' },
  { q: 'device', a: 'Contact DMA Technologies or register through the app to request sample IoT devices.' },
  { q: 'price', a: 'Pricing depends on farm size and device configuration. Contact our sales team.' },
  { q: 'dashboard', a: 'Yes — this web dashboard mirrors the mobile app features for More Fish and Pharma Care.' },
  { q: 'services', a: 'We provide services across Bangladesh with expanding international support.' },
  { q: 'contact', a: 'Call +8801898938354 or message us on WhatsApp.' },
];

export const InfoPage: React.FC<InfoPageProps> = ({ type }) => {
  const { t } = useLang();

  const title =
    type === 'faq' ? t('faq_menu') :
    type === 'about-app' ? t('about_app_menu') :
    t('about_device_menu');

  const Icon = type === 'faq' ? HelpCircle : type === 'about-app' ? BookOpen : Cpu;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none max-w-3xl mx-auto w-full">
      <div className="flex items-center gap-3 border-b border-cyan-50 pb-4">
        <div className="p-2 bg-cyan-50 text-primary rounded-xl border border-cyan-100">
          <Icon className="w-5 h-5" />
        </div>
        <h4 className="font-bold text-font-dark">{title}</h4>
      </div>

      {type === 'faq' && (
        <div className="space-y-4">
          {faqItems.map((item) => (
            <div key={item.q} className="bg-white/80 border border-cyan-100/30 p-5 rounded-2xl shadow-sm">
              <h5 className="font-extrabold text-sm text-font-dark">{t(item.q)}</h5>
              <p className="text-xs text-font-light font-semibold mt-2 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      )}

      {type === 'about-app' && (
        <div className="bg-white/80 border border-cyan-100/30 p-6 rounded-3xl shadow-sm space-y-4 text-sm font-semibold text-font-light leading-relaxed">
          <p>{t('more_fish')}</p>
          <p>{t('monitoring')}: Real-time sensor data for DO, pH, temperature, ammonia, and salinity.</p>
          <p>{t('smart_alerts')}: Instant push notifications for critical threshold breaches.</p>
          <p>{t('data_driven')}: Historical graphs and FCR tools for optimized feeding.</p>
        </div>
      )}

      {type === 'about-device' && (
        <div className="bg-white/80 border border-cyan-100/30 p-6 rounded-3xl shadow-sm space-y-4 text-sm font-semibold text-font-light leading-relaxed">
          <p>{t('sensor_device')}</p>
          <ul className="space-y-2 list-disc pl-5">
            <li>{t('dissolved_oxygen')} sensor</li>
            <li>{t('ph_level')} sensor</li>
            <li>{t('temperature')} sensor</li>
            <li>{t('ammonia')} sensor</li>
            <li>{t('salinity')} sensor</li>
          </ul>
          <p>{t('poultry_param_note')}</p>
        </div>
      )}
    </div>
  );
};
