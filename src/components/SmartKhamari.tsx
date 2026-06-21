import React from 'react';
import { useLang } from '../context/LanguageContext';
import { Grid, ShieldCheck, Award, TrendingUp, Users, CheckCircle, Gift, Sparkles } from 'lucide-react';

interface Tier {
  name: string;
  nameBn: string;
  price: string;
  priceBn: string;
  color: string;
  features: string[];
  featuresBn: string[];
}

export const SmartKhamari: React.FC = () => {
  const { t, lang } = useLang();

  const tiers: Tier[] = [
    {
      name: 'Silver Club Member',
      nameBn: 'সিলভার ক্লাব সদস্য',
      price: '৳200/mo',
      priceBn: '৳২০০/মাস',
      color: 'from-slate-400 to-slate-500',
      features: [
        'Full Sensor Dashboard Analytics',
        'DMA Officer Support Visits (1/mo)',
        'Basic FCR & Yield Forecasts',
        '2% partner discounts on feeds',
      ],
      featuresBn: [
        'সম্পূর্ণ সেন্সর ড্যাশবোর্ড বিশ্লেষণ',
        'ডিএমএ অফিসারের খামার পরিদর্শন (১টি/মাস)',
        'সাধারণ এফসিআর ও উৎপাদন পূর্বাভাস',
        'খাবারে ২% পার্টনার ডিসকাউন্ট',
      ],
    },
    {
      name: 'Gold Club Member (Recommended)',
      nameBn: 'গোল্ড ক্লাব সদস্য (প্রস্তাবিত)',
      price: '৳400/mo',
      priceBn: '৳৪০০/মাস',
      color: 'from-amber-400 to-amber-500',
      features: [
        'Full History & Sensor Charts Export',
        'DMA Officer Support Visits (2/mo)',
        'Direct Vet Video Consultation',
        '5% partner discounts on medicine & feeds',
        'Certified Safe Farmer status',
      ],
      featuresBn: [
        'সম্পূর্ণ ইতিহাস এবং চার্ট ডাউনলোড',
        'ডিএমএ অফিসারের খামার পরিদর্শন (২টি/মাস)',
        'সরাসরি ভেটেরিনারি ভিডিও পরামর্শ',
        'ওষুধ ও খাবারে ৫% পার্টনার ডিসকাউন্ট',
        'সার্টিফাইড সেফ ফর্মার স্ট্যাটাস',
      ],
    },
    {
      name: 'Platinum Club Member',
      nameBn: 'প্লাটিনাম ক্লাব সদস্য',
      price: '৳500/mo',
      priceBn: '৳৫০০/মাস',
      color: 'from-cyan-500 to-blue-600',
      features: [
        'Advanced Automated IoT Controls',
        'Priority DMA Officer visits & audits',
        'Unlimited Video Consultations',
        '10% partner discounts (Feeds, Medicine, Hardware)',
        'Direct Market linkage under "MoreFish" brand',
      ],
      featuresBn: [
        'উন্নত স্বয়ংক্রিয় আইওটি নিয়ন্ত্রণ',
        'ডিএমএ অফিসারের অগ্রাধিকার ভিত্তিক পরিদর্শন',
        'আনলিমিটেড ভিডিও পরামর্শ সুবিধা',
        '১০% পার্টনার ডিসকাউন্ট (খাদ্য, ওষুধ, ডিভাইস)',
        '"আরোমাছ" ব্র্যান্ডের অধীনে সরাসরি বাজার সংযোগ',
      ],
    },
  ];

  const handleJoin = (tierName: string) => {
    alert(`Thank you for your interest! DMA Tech Officers will contact you shortly to set up your Smart Khamari Club membership (${tierName}).`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-50 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-50 text-primary rounded-xl border border-cyan-100">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-font-dark">{t('smart_khamari')}</h4>
            <p className="text-[10px] font-bold text-font-light uppercase">Premium Farmers Network & Cooperative</p>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-linear-to-tr from-cyan-900 to-blue-950 rounded-3xl p-8 text-white relative overflow-hidden shadow-md">
        <div className="absolute right-0 bottom-0 top-0 opacity-15 pointer-events-none flex items-center justify-center pr-10">
          <Sparkles className="w-64 h-64 text-white" />
        </div>

        <div className="max-w-2xl space-y-4 relative z-10">
          <span className="text-[10px] font-black tracking-widest bg-cyan-500/30 text-cyan-200 px-3 py-1 rounded-full uppercase border border-cyan-500/20">
            {lang === 'bn' ? 'প্রিমিয়াম কোঅপারেটিভ' : 'Premium Cooperative'}
          </span>
          <h2 className="text-xl md:text-2xl font-black leading-tight">
            {t('smart_khamari_club')}
          </h2>
          <p className="text-xs text-white/80 leading-relaxed font-semibold">
            {lang === 'bn' 
              ? 'এটি একটি আধুনিক ডিজিটাল সমবায় নেটওয়ার্ক যেখানে পেশাদার মৎস্য চাষীরা একজোট হয়ে নতুন প্রযুক্তি ব্যবহার করছেন, খামারের তথ্য আদান-প্রদান করছেন এবং সম্মিলিতভাবে নিজেদের উৎপাদিত মাছ বাজারজাত করছেন।'
              : 'A revolutionary digital cooperative network where professional fish farmers collaborate using modern IoT technologies, share parameter telemetry logs, and link directly to national trade outlets.'}
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
              <Users className="w-5 h-5 text-cyan-400" />
              <span>{lang === 'bn' ? '৫-১০ জন চাষী প্রতি ক্লাস্টার' : '5-10 Farmers per Cluster'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <span>{lang === 'bn' ? 'ডেডিকেটেড ডিএমএ অফিসার' : 'Dedicated DMA Tech Officer'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Perks Grid */}
      <div className="bg-white border border-cyan-100/40 rounded-3xl p-6 shadow-sm space-y-6">
        <h4 className="font-extrabold text-sm text-font-dark border-b border-cyan-50 pb-3">
          {lang === 'bn' ? 'ক্লাব মেম্বারশিপের প্রধান সুবিধাসমূহ' : 'Exclusive Club Member Privileges'}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-4 bg-cyan-50/10 border border-cyan-100/30 rounded-2xl space-y-2">
            <Award className="w-7 h-7 text-primary" />
            <h5 className="font-extrabold text-xs text-font-dark">Technical Certification</h5>
            <p className="text-[10px] text-font-light font-semibold leading-relaxed">
              Hands-on training on digital sensor monitoring, aeration chemistry, and optimized feed conversion ratio (FCR) formulas.
            </p>
          </div>
          <div className="p-4 bg-cyan-50/10 border border-cyan-100/30 rounded-2xl space-y-2">
            <TrendingUp className="w-7 h-7 text-primary" />
            <h5 className="font-extrabold text-xs text-font-dark">Dashboard Access</h5>
            <p className="text-[10px] text-font-light font-semibold leading-relaxed">
              Unlock historical logs, chart overlays, multi-pond parameters comparisons, and advanced yield estimation tools.
            </p>
          </div>
          <div className="p-4 bg-cyan-50/10 border border-cyan-100/30 rounded-2xl space-y-2">
            <Gift className="w-7 h-7 text-primary" />
            <h5 className="font-extrabold text-xs text-font-dark">Partner Discounts</h5>
            <p className="text-[10px] text-font-light font-semibold leading-relaxed">
              Exclusive corporate discounts on certified fish medicine, high-protein feeds, and IoT controller devices.
            </p>
          </div>
          <div className="p-4 bg-cyan-50/10 border border-cyan-100/30 rounded-2xl space-y-2">
            <CheckCircle className="w-7 h-7 text-primary" />
            <h5 className="font-extrabold text-xs text-font-dark">Market Linkage</h5>
            <p className="text-[10px] text-font-light font-semibold leading-relaxed">
              Bypass middlemen and sell your grown fish harvests directly under the trusted "MoreFish" premium brand.
            </p>
          </div>
        </div>
      </div>

      {/* Membership Tiers Cards */}
      <div className="space-y-4">
        <h4 className="font-extrabold text-sm text-font-dark text-center">
          {t('membership_tiers')}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => {
            const isGold = tier.name.includes('Gold');
            return (
              <div
                key={tier.name}
                className={`bg-white border rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between transition-transform duration-200 hover:scale-[1.01] ${
                  isGold ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-cyan-100/40'
                }`}
              >
                <div className={`p-6 text-white bg-gradient-to-br ${tier.color} relative`}>
                  {isGold && (
                    <span className="absolute top-4 right-4 bg-white/20 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Popular
                    </span>
                  )}
                  <h4 className="font-black text-sm">{lang === 'bn' ? tier.nameBn : tier.name}</h4>
                  <p className="font-black text-2xl mt-2">{lang === 'bn' ? tier.priceBn : tier.price}</p>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-6 bg-cyan-50/5">
                  <ul className="space-y-3">
                    {(lang === 'bn' ? tier.featuresBn : tier.features).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-font-dark">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleJoin(tier.name)}
                    className={`w-full py-3 font-bold text-xs rounded-xl transition-all cursor-pointer ${
                      isGold
                        ? 'bg-amber-400 text-white hover:bg-amber-500 shadow-md'
                        : 'bg-primary text-white hover:bg-primary-hover shadow'
                    }`}
                  >
                    {t('join_club')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
