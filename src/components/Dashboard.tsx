// H:\DMA Hamim\DMA-Web-App\src\components\Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useLang } from '../context/LanguageContext';
import { 
  Activity, ShieldAlert, Layers, ShoppingBag, BookOpen, Calculator,
  Phone, Wind, HeartHandshake, PhoneCall, MessageSquare
} from 'lucide-react';
import type { Page } from '../types/navigation';
import type { AquacultureFlow } from '../types/aquaculture';

interface DashboardProps {
  onNavigate: (page: Page) => void;
  flow?: AquacultureFlow;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, flow = 'fish' }) => {
  const { t } = useLang();
  
  // Banner Slide
  const [currentSlide, setCurrentSlide] = useState(0);
  const banners = [
    {
      title: 'পুকুরের পানির অক্সিজেন, পিএইচ, অ্যামোনিয়া, তাপমাত্রা, লবণাক্ততা ও টিডিএস ২৪ ঘণ্টা আপনার মোবাইল অ্যাপে দেখুন!',
      desc: '(ডিভাইস মূল্য জানার জন্য কল করুন: +৮৮০ ১৮৯৮-৯৩৮৩৫৪)',
      bg: 'from-blue-600 to-teal-600'
    },
    {
      title: '24/7 Emergency Service Support',
      desc: 'Facing urgent farm or parameter issues? Click the emergency service widgets below to connect with certified support officers.',
      bg: 'from-red-600 to-rose-700'
    }
  ];

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, []);

  const gridItems = [
    { id: 'iot', title: t('live_data_monitoring'), desc: 'Check NH3, pH, DO, Salinity & Temp', icon: Activity, color: 'text-teal-600 bg-teal-50 border-teal-100' },
    { id: 'disease', title: t('fish_disease_detector'), desc: 'AI-powered instant pathogen analyzer', icon: ShieldAlert, color: 'text-red-500 bg-red-50 border-red-100' },
    { id: 'pond', title: flow === 'pharma' ? 'Asset Management' : t('pond_management'), desc: flow === 'pharma' ? 'Track asset parameters & environment' : 'Track stocking density & parameters', icon: Layers, color: 'text-cyan-600 bg-cyan-50 border-cyan-100' },
    { id: 'fcr', title: t('fcr_calculator'), desc: 'Feed Conversion Ratio calculator', icon: Calculator, color: 'text-blue-500 bg-blue-50 border-blue-100' },
    { id: 'disease-treatment', title: t('fish_disease_treatment'), desc: 'Disease guidelines & medication prescriptions', icon: BookOpen, color: 'text-purple-500 bg-purple-50 border-purple-100' },
    { id: 'marketplace', title: t('fish_feed_marketplace'), desc: 'Browse feed, medicine & equipment stores', icon: ShoppingBag, color: 'text-amber-500 bg-amber-50 border-amber-100' },
    { id: 'training', title: t('training_workshop'), desc: 'Learn aquaculture techniques from professionals', icon: BookOpen, color: 'text-emerald-500 bg-emerald-50 border-emerald-100' },
    { id: 'automation', title: t('automation_settings_menu'), icon: Wind, desc: 'Aerators & automatic water cleaner config', color: 'text-sky-500 bg-sky-50 border-sky-100' },
  ];

  // Emergency contact numbers from Flutter app
  const emergencyCall = () => window.open('tel:+8801898938354');
  const openWhatsApp = () => window.open('https://wa.me/8801898938354', '_blank');
  const openMessenger = () => window.open('https://m.me/', '_blank');

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none max-w-7xl mx-auto w-full">
      {/* Banner Carousel */}
      <div className="relative h-44 rounded-3xl overflow-hidden shadow-md bg-linear-to-r from-teal-500 to-blue-600 text-white">
        {banners.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 p-8 flex flex-col justify-center transition-all duration-700 ease-in-out ${
              idx === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12 pointer-events-none'
            }`}
          >
            <h3 className="text-xl md:text-2xl font-black mb-2 tracking-wide leading-tight">{slide.title}</h3>
            <p className="text-sm md:text-base opacity-90 max-w-xl font-medium">{slide.desc}</p>
          </div>
        ))}
        {/* Carousel indicator bullets */}
        <div className="absolute bottom-4 right-8 flex gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'w-6 bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Grid Actions */}
      <div className="space-y-4">
        <h3 className="font-bold text-font-dark tracking-wide">{t('farming')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {gridItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as Page)}
                className="group p-5 bg-white/80 hover:bg-white rounded-3xl border border-cyan-100/40 hover:border-cyan-100 shadow-sm hover:shadow-md transition-all duration-300 text-left flex flex-col justify-between cursor-pointer hover:scale-[1.02]"
              >
                <div className={`p-3 rounded-2xl border ${item.color} w-fit group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="mt-6">
                  <h4 className="font-bold text-base text-font-dark leading-tight group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-font-light font-medium mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Emergency & Support widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Smart Khamari Banner */}
        <div className="p-6 bg-linear-to-tr from-cyan-600 to-blue-700 rounded-3xl text-white shadow-md flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-bold bg-white/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Premium Member Club</span>
            <h4 className="text-lg font-black">{t('smart_khamari')}</h4>
            <p className="text-xs opacity-90 max-w-sm font-medium">{t('cluster_farming_club')}</p>
          </div>
          <button 
            onClick={() => onNavigate('training')}
            className="px-4 py-2.5 bg-white text-primary font-bold text-xs rounded-xl shadow-md hover:bg-cyan-50 transition-colors cursor-pointer"
          >
            Learn More
          </button>
        </div>

        {/* Emergency Services */}
        <div className="p-6 bg-white/80 border border-cyan-100/40 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-font-dark leading-tight">{t('emergency_service')}</h4>
              <p className="text-xs text-font-light font-medium">Get live 24/7 technician assistance</p>
            </div>
            <PhoneCall className="w-5 h-5 text-red-500 animate-bounce" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={emergencyCall}
              className="flex flex-col items-center justify-center py-3 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-2xl border border-emerald-100 transition-colors cursor-pointer"
            >
              <Phone className="w-4 h-4 mb-1" />
              <span className="text-[10px] font-extrabold">Call</span>
            </button>
            <button
              onClick={openWhatsApp}
              className="flex flex-col items-center justify-center py-3 px-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-2xl border border-green-100 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 mb-1" />
              <span className="text-[10px] font-extrabold">WhatsApp</span>
            </button>
            <button
              onClick={openMessenger}
              className="flex flex-col items-center justify-center py-3 px-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-2xl border border-blue-100 transition-colors cursor-pointer"
            >
              <HeartHandshake className="w-4 h-4 mb-1" />
              <span className="text-[10px] font-extrabold">Messenger</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
