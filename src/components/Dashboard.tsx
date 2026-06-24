// H:\DMA Hamim\DMA-Web-App\src\components\Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useLang } from '../context/LanguageContext';
import { 
  Phone, HeartHandshake, PhoneCall, MessageSquare, ChevronRight, Sparkles
} from 'lucide-react';
import type { Page } from '../types/navigation';
import type { AquacultureFlow } from '../types/aquaculture';

// PNG icons from src/assets
import iotIcon from '../assets/live_data_monitoring.png';
import diseaseIcon from '../assets/fish_disease.png';
import pondIcon from '../assets/pond_management.png';
import fcrIcon from '../assets/fcr_calculator.png';
import treatmentIcon from '../assets/fish_treatment.png';
import marketplaceIcon from '../assets/fish_feed.png';
import workshopIcon from '../assets/workshop.png';
import automationIcon from '../assets/automation.png';

// Banner image
import dmaMoreFishImg from '../assets/dma_more_fish.png';

interface DashboardProps {
  onNavigate: (page: Page) => void;
  flow?: AquacultureFlow;
  token?: string;
  userId?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, flow = 'fish' }) => {
  const { t, lang } = useLang();
  
  // Banner Slide
  const [currentSlide, setCurrentSlide] = useState(0);
  const banners = [
    {
      title: lang === 'bn' 
        ? 'পুকুরের পানির অক্সিজেন, পিএইচ, অ্যামোনিয়া, তাপমাত্রা, লবণাক্ততা ও টিডিএস ২৪ ঘণ্টা আপনার মোবাইল অ্যাপে দেখুন!'
        : 'Monitor Pond Oxygen, pH, Ammonia, Temperature, Salinity & TDS 24/7 on your mobile app!',
      desc: lang === 'bn'
        ? '(ডিভাইস মূল্য জানার জন্য কল করুন: +৮৮০ ১৮৯৮-৯৩৮৩৫৪)'
        : '(Call to inquire about device pricing: +880 1898-938354)',
      bg: 'from-[#008cb2] via-[#00A8D5] to-[#3cc4ea]',
      showImage: true
    },
    {
      title: lang === 'bn'
        ? '২৪/৭ জরুরি সেবা ও টেকনিক্যাল সাপোর্ট'
        : '24/7 Emergency Service Support',
      desc: lang === 'bn'
        ? 'খামার বা পানির প্যারামিটারে সমস্যা দেখা দিলে তাৎক্ষণিকভাবে আমাদের প্রত্যয়িত অফিসারদের সাথে যুক্ত হতে নিচে ক্লিক করুন।'
        : 'Facing urgent farm or parameter issues? Click the emergency service widgets below to connect with certified support officers.',
      bg: 'from-[#e11d48] via-[#be123c] to-[#9f1239]',
      showImage: false
    }
  ];

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(slideTimer);
  }, [banners.length]);

  const gridItems = [
    { id: 'iot', title: t('live_data_monitoring'), desc: 'Check NH3, pH, DO, Salinity & Temp', img: iotIcon, color: 'from-teal-100 to-emerald-200/60 hover:from-teal-200 hover:to-emerald-300 border-teal-300 shadow-teal-500/10' },
    { id: 'disease', title: t('fish_disease_detector'), desc: 'AI-powered instant pathogen analyzer', img: diseaseIcon, color: 'from-rose-100 to-red-200/60 hover:from-rose-200 hover:to-red-300 border-red-300 shadow-rose-500/10' },
    { id: 'pond', title: flow === 'pharma' ? 'Asset Management' : t('pond_management'), desc: flow === 'pharma' ? 'Track asset parameters & environment' : 'Track stocking density & parameters', img: pondIcon, color: 'from-cyan-100 to-blue-200/60 hover:from-cyan-200 hover:to-blue-300 border-blue-300 shadow-cyan-500/10' },
    { id: 'fcr', title: t('fcr_calculator'), desc: 'Feed Conversion Ratio calculator', img: fcrIcon, color: 'from-blue-100 to-indigo-200/60 hover:from-blue-200 hover:to-indigo-300 border-indigo-300 shadow-blue-500/10' },
    { id: 'disease-treatment', title: t('fish_disease_treatment'), desc: 'Disease guidelines & medication prescriptions', img: treatmentIcon, color: 'from-purple-100 to-violet-200/60 hover:from-purple-200 hover:to-violet-300 border-violet-300 shadow-purple-500/10' },
    { id: 'marketplace', title: t('fish_feed_marketplace'), desc: 'Browse feed, medicine & equipment stores', img: marketplaceIcon, color: 'from-amber-100 to-orange-200/60 hover:from-amber-200 hover:to-orange-300 border-orange-300 shadow-amber-500/10' },
    { id: 'training', title: t('training_workshop'), desc: 'Learn aquaculture techniques from professionals', img: workshopIcon, color: 'from-emerald-100 to-teal-200/60 hover:from-emerald-200 hover:to-teal-300 border-teal-300 shadow-emerald-500/10' },
    { id: 'automation', title: t('automation_settings_menu'), img: automationIcon, desc: 'Aerators & automatic water cleaner config', color: 'from-sky-100 to-cyan-200/60 hover:from-sky-200 hover:to-cyan-300 border-cyan-300 shadow-sky-500/10' },
  ];

  const emergencyCall = () => window.open('tel:+8801898938354');
  const openWhatsApp = () => window.open('https://wa.me/8801898938354', '_blank');
  const openMessenger = () => window.open('https://m.me/', '_blank');

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 select-none max-w-7xl mx-auto w-full scrollbar-thin">
      {/* Banner Carousel */}
      <div className="relative h-56 rounded-[32px] overflow-hidden shadow-xl text-white">
        {banners.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 p-10 flex items-center justify-between transition-all duration-1000 ease-in-out bg-gradient-to-r ${slide.bg} ${
              idx === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16 pointer-events-none'
            }`}
          >
            <div className="space-y-4 max-w-2xl">
              <h3 className="text-2xl md:text-3xl font-black tracking-wide leading-tight drop-shadow-md">
                {slide.title}
              </h3>
              <div className="text-[15px] md:text-[17px] text-white/90 font-bold max-w-xl leading-relaxed drop-shadow-sm">
                {slide.desc}
              </div>
            </div>
            {slide.showImage && (
              <div className="hidden lg:flex w-64 h-full items-center justify-center relative p-2">
                <img 
                  src={dmaMoreFishImg} 
                  alt="MoreFish Device" 
                  className="max-h-full object-contain filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.25)] animate-pulse" 
                />
              </div>
            )}
          </div>
        ))}
        {/* Carousel indicator bullets */}
        <div className="absolute bottom-6 right-10 flex gap-3 z-10">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-3 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'w-8 bg-white shadow-md' : 'w-3 bg-white/40 hover:bg-white/60'
              } cursor-pointer`}
            />
          ))}
        </div>
      </div>

      {/* Main Grid Actions */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-sky-500" />
          <h2 className="text-xl md:text-2xl font-black text-font-dark tracking-wide">
            {t('farming')}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {gridItems.map((item) => {
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as Page)}
                className={`group p-6 bg-gradient-to-br ${item.color} rounded-[32px] border border-gray-150 shadow-[0_15px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_25px_50px_-5px_rgba(0,0,0,0.22)] transition-all duration-300 text-center flex flex-col justify-between items-center cursor-pointer hover:scale-[1.03] relative overflow-hidden`}
              >
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500 -z-0" />
                <div className="z-10 w-full flex flex-col items-center">
                  <div className="mx-auto w-24 h-24 flex items-center justify-center group-hover:scale-115 transition-transform duration-300 bg-white/80 backdrop-blur-xs rounded-3xl p-3.5 shadow-md border-2 border-white/60">
                    <img src={item.img} alt={item.title} className="w-full h-full object-contain" />
                  </div>
                  <div className="mt-6 space-y-2 text-center">
                    <h4 className="font-black text-xl text-font-dark leading-tight group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-sm text-font-light font-bold leading-relaxed">{item.desc}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                  <ChevronRight className="w-6 h-6 translate-x-2 group-hover:translate-x-0 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Emergency & Support widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        {/* Smart Khamari Banner */}
        <div className="p-8 bg-gradient-to-tr from-[#00A8D5] via-[#24bfe7] to-[#0090b8] rounded-[32px] text-white shadow-lg flex flex-col justify-between space-y-6 hover:shadow-2xl transition-shadow duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
          <div className="space-y-3 relative z-10">
            <span className="inline-flex items-center gap-1.5 text-xs font-black bg-white/20 text-cyan-50 px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-200 animate-spin" />
              Premium Member Club
            </span>
            <h4 className="text-2xl font-black tracking-wide text-white">{t('smart_khamari')}</h4>
            <p className="text-sm opacity-95 max-w-md font-bold leading-relaxed text-sky-50">{t('cluster_farming_club')}</p>
          </div>
          <div className="flex justify-end relative z-10">
            <button 
              onClick={() => onNavigate('training')}
              className="px-6 py-3.5 bg-white text-blue-800 hover:text-blue-900 font-black text-sm rounded-2xl shadow-lg hover:bg-sky-50 hover:scale-[1.02] transition-all cursor-pointer border border-sky-100"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Emergency Services */}
        <div className="p-8 bg-white/90 border-2 border-red-100/60 rounded-[32px] shadow-lg flex flex-col justify-between space-y-6 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between border-b border-red-50 pb-4">
            <div>
              <h4 className="font-black text-xl text-font-dark leading-tight">{t('emergency_service')}</h4>
              <p className="text-[13px] text-font-light font-bold mt-1">Get live 24/7 technician assistance</p>
            </div>
            <PhoneCall className="w-7 h-7 text-red-500 animate-bounce" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={emergencyCall}
              className="flex flex-col items-center justify-center py-4 px-3 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-600 rounded-2xl border-2 border-emerald-100/50 transition-all cursor-pointer hover:scale-[1.03]"
            >
              <Phone className="w-6 h-6 mb-2" />
              <span className="text-xs font-black uppercase tracking-wide">Call</span>
            </button>
            <button
              onClick={openWhatsApp}
              className="flex flex-col items-center justify-center py-4 px-3 bg-green-50 hover:bg-green-100/80 text-green-600 rounded-2xl border-2 border-green-100/50 transition-all cursor-pointer hover:scale-[1.03]"
            >
              <MessageSquare className="w-6 h-6 mb-2" />
              <span className="text-xs font-black uppercase tracking-wide">WhatsApp</span>
            </button>
            <button
              onClick={openMessenger}
              className="flex flex-col items-center justify-center py-4 px-3 bg-blue-50 hover:bg-blue-100/80 text-blue-600 rounded-2xl border-2 border-blue-100/50 transition-all cursor-pointer hover:scale-[1.03]"
            >
              <HeartHandshake className="w-6 h-6 mb-2" />
              <span className="text-xs font-black uppercase tracking-wide">Messenger</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
