import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { Eye, ShieldAlert, Sparkles, LayoutGrid, Layers, Monitor, Check } from 'lucide-react';

export const ViewSettings: React.FC = () => {
  const { viewMode, setViewMode } = useAuth();
  const { lang } = useLang();

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 select-none max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-cyan-500 to-emerald-500 text-white rounded-2xl shadow-md shadow-cyan-100">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black text-2xl sm:text-3xl text-slate-800 tracking-tight">
              {lang === 'bn' ? 'ভিউ সেটিংস' : 'View Settings'}
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
              {lang === 'bn' ? 'মাল্টি-প্রোফাইল ডিসপ্লে কনফিগারেশন' : 'Multi-profile display configuration'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Select Mode Controls */}
        <div className="lg:col-span-4 bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-100/50 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-wider">{lang === 'bn' ? 'ডিসপ্লে মোড' : 'Display Mode'}</span>
            </div>
            <h3 className="font-extrabold text-xl text-slate-800">
              {lang === 'bn' ? 'ডিসপ্লে মোড নির্বাচন করুন' : 'Select View Style'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {lang === 'bn' 
                ? 'আপনি একটি অ্যাকাউন্ট প্রোফাইলের লাইভ ডেটা মনিটর করতে চান নাকি একই স্ক্রিনে সবগুলো লগইন করা প্রোফাইলের ডেটা একসাথে দেখতে চান তা নির্বাচন করুন।' 
                : 'Choose whether to monitor a single active profile or display telemetry for all logged-in accounts simultaneously.'}
            </p>
          </div>

          {/* Styled Selection Buttons */}
          <div className="flex flex-col gap-3.5">
            {[
              {
                id: 'default',
                titleEn: 'Default View',
                titleBn: 'ডিফল্ট ভিউ',
                descEn: 'Single active profile focus',
                descBn: 'শুধুমাত্র একটি সক্রিয় প্রোফাইল',
                icon: Monitor,
              },
              {
                id: 'multiple',
                titleEn: 'Multiple View',
                titleBn: 'মাল্টিপল ভিউ',
                descEn: 'Stacked vertical profiles list',
                descBn: 'একটির নিচে আরেকটি প্রোফাইল',
                icon: Layers,
              },
              {
                id: 'grid',
                titleEn: 'Grid View',
                titleBn: 'গ্রিড ভিউ',
                descEn: 'Compact 2x2 grid layout',
                descBn: 'পাশাপাশি গ্রিড লেআউট',
                icon: LayoutGrid,
              },
            ].map((mode) => {
              const Icon = mode.icon;
              const isActive = viewMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id as any)}
                  className={`w-full p-4 text-left rounded-2xl border transition-all duration-300 cursor-pointer flex items-center justify-between group ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white border-transparent shadow-lg shadow-cyan-200/50 scale-[1.01]'
                      : 'bg-slate-50/50 border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl transition-colors ${
                      isActive ? 'bg-white/10 text-white' : 'bg-white text-slate-500 border border-slate-100 group-hover:text-cyan-500 shadow-sm'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-extrabold text-sm block leading-tight">
                        {lang === 'bn' ? mode.titleBn : mode.titleEn}
                      </span>
                      <span className={`text-[10px] font-medium block mt-0.5 ${isActive ? 'text-cyan-50' : 'text-slate-400'}`}>
                        {lang === 'bn' ? mode.descBn : mode.descEn}
                      </span>
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Alert Info Box */}
          <div className="flex gap-3 p-4 bg-gradient-to-br from-amber-50 to-orange-50/30 border border-amber-100/70 rounded-2xl text-xs text-amber-700 font-semibold leading-relaxed">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <span>
              {lang === 'bn'
                ? 'মাল্টিপল ভিউ এবং গ্রিড ভিউ মোডে সবগুলো প্রোফাইলের লাইভ ডেটা একই সাথে ব্যাকগ্রাউন্ডে কল করা হয়। প্রোফাইলের সংখ্যার উপর ভিত্তি করে লোডিং টাইম পরিবর্তিত হতে পারে।'
                : 'Under Multiple & Grid View modes, the app polls data streams for all logged-in profiles in parallel. Loading times may vary based on session count.'}
            </span>
          </div>

          {/* Features Info Box */}
          <div className="p-5 bg-slate-50/60 border border-slate-100 rounded-2xl text-xs font-semibold text-slate-600 space-y-2.5">
            <h5 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">
              {lang === 'bn' ? 'মাল্টি-ভিউ মোডে সমর্থিত ফিচারসমূহ:' : 'Supported Features in Multi-View:'}
            </h5>
            <ul className="grid grid-cols-1 gap-2 text-[11px] text-slate-500 list-disc pl-4 font-medium">
              <li>{lang === 'bn' ? 'লাইভ ডেটা মনিটরিং (Live Data Monitoring)' : 'Live Data Monitoring'}</li>
              <li>{lang === 'bn' ? 'অটোমেশন সেটিংস (Automation Settings)' : 'Automation Settings'}</li>
              <li>{lang === 'bn' ? 'অটো অ্যারোটর কানেকশন (Auto Aerator Connection)' : 'Auto Aerator Connection'}</li>
              <li>{lang === 'bn' ? 'অটো ফিডার কানেকশন (Auto Feeder Connection)' : 'Auto Feeder Connection'}</li>
              <li>{lang === 'bn' ? 'পন্ড ফিল্ট্রেশন সিস্টেম (Pond Filtration System)' : 'Pond Filtration System'}</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Premium Comparison Cards */}
        <div className="lg:col-span-8 bg-slate-50/30 border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-cyan-600" />
            <h3 className="font-extrabold text-lg text-slate-800">
              {lang === 'bn' ? 'ভিউ মোড তুলনা এবং উদাহরণ' : 'View Mode Comparison & Examples'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Default View Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-md flex flex-col justify-between hover:shadow-lg transition-all duration-300 group">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-500 transition-colors" />
                    {lang === 'bn' ? 'ডিফল্ট ভিউ' : 'Default View'}
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                </div>
                <p className="text-xs font-semibold text-slate-400 leading-relaxed">
                  {lang === 'bn'
                    ? 'শুধুমাত্র সক্রিয় বা সিলেক্ট করা প্রোফাইলটি প্রদর্শিত হবে। অন্য সব প্রোফাইলগুলো প্রোফাইল সুইচার মেনু থেকে পরিবর্তন করতে হবে।'
                    : 'Only the active, main selected profile shows up. Other logged in sessions stay in the profile switcher.'}
                </p>
              </div>
              
              {/* Mockup UI (Default View) */}
              <div className="mt-6 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 border-b border-white pb-2">
                  <div className="w-6 h-6 rounded-full bg-cyan-600 flex items-center justify-center text-white text-[9px] font-black">A1</div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-extrabold text-slate-700 block leading-tight truncate">Profile 1 (Active)</span>
                    <span className="text-[7.5px] text-slate-400 font-bold block truncate">active@farm.com</span>
                  </div>
                </div>
                <div className="space-y-1.5 text-[8.5px] text-slate-500 font-bold">
                  <div className="flex justify-between items-center bg-white p-1 rounded border border-slate-100/50">
                    <span>Dissolved Oxygen</span>
                    <span className="text-cyan-600 font-black">5.2 mg/L</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-1 rounded border border-slate-100/50">
                    <span>Temperature</span>
                    <span className="text-cyan-600 font-black">28.4 °C</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Multiple View Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-md flex flex-col justify-between hover:shadow-lg transition-all duration-300 group">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-extrabold text-cyan-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-500" />
                    {lang === 'bn' ? 'মাল্টিপল ভিউ' : 'Multiple View'}
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse"></span>
                </div>
                <p className="text-xs font-semibold text-slate-400 leading-relaxed">
                  {lang === 'bn'
                    ? 'সবগুলো লগইন করা প্রোফাইলের ডেটা পর্যায়ক্রমে উপর-নিচ কার্ড আকারে স্ক্রিনে লোড হবে। একই সাথে একাধিক সাইট পর্যবেক্ষণের জন্য দারুণ।'
                    : 'All logged in profiles are rendered stacked vertically. Great for co-monitoring multiple sites simultaneously.'}
                </p>
              </div>

              {/* Mockup UI (Multiple Stacked View) */}
              <div className="mt-6 space-y-2">
                {[1, 2].map((num) => (
                  <div key={num} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                    <div className="flex items-center gap-2 border-b border-white pb-1.5">
                      <div className="w-5 h-5 rounded-full bg-cyan-600 flex items-center justify-center text-white text-[8px] font-black">A{num}</div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[8px] font-extrabold text-slate-700 block leading-tight truncate">Profile {num}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[8px] text-slate-500 font-bold bg-white px-1.5 py-1 rounded">
                      <span>Dissolved Oxygen</span>
                      <span className="text-cyan-600 font-black">{num === 1 ? '5.2' : '6.1'} mg/L</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Grid View Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-md flex flex-col justify-between hover:shadow-lg transition-all duration-300 group">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                    <LayoutGrid className="w-3.5 h-3.5 text-indigo-500" />
                    {lang === 'bn' ? 'গ্রিড ভিউ' : 'Grid View'}
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                </div>
                <p className="text-xs font-semibold text-slate-400 leading-relaxed">
                  {lang === 'bn'
                    ? 'সবগুলো প্রোফাইলের ডেটা একই সাথে পাশাপাশি ২x২ গ্রিড কার্ড আকারে লোড হবে। বড় স্ক্রিনে এক নজরে সব দেখতে সাহায্য করে।'
                    : 'All logged in profiles are rendered in a 2x2 grid. Fits more information horizontally at a single glance.'}
                </p>
              </div>

              {/* Mockup UI (Grid 2x2 View) */}
              <div className="mt-6 grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                {[1, 2, 3, 4].map((num) => (
                  <div key={num} className="p-2 bg-white rounded-lg border border-slate-100 space-y-1">
                    <div className="flex items-center gap-1 border-b border-slate-50 pb-1">
                      <div className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[7px] font-black">A{num}</div>
                      <span className="text-[7px] font-extrabold text-slate-700 truncate">P{num}</span>
                    </div>
                    <div className="flex justify-between items-center text-[7px] text-slate-500 font-bold">
                      <span>DO</span>
                      <span className="text-indigo-600 font-black">{5.0 + (num * 0.3)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
