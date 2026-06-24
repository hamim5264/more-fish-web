import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { Eye, ShieldAlert, Sparkles } from 'lucide-react';

export const ViewSettings: React.FC = () => {
  const { viewMode, setViewMode } = useAuth();
  const { lang } = useLang();

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 select-none max-w-5xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex items-center gap-2.5 border-b border-cyan-50 pb-4">
        <div className="p-2.5 bg-cyan-50 text-primary rounded-xl border border-cyan-100">
          <Eye className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-black text-2xl text-font-dark">
            {lang === 'bn' ? 'ভিউ সেটিংস' : 'View Settings'}
          </h4>
          <p className="text-[11px] font-black text-font-light uppercase">
            {lang === 'bn' ? 'মাল্টি-প্রোফাইল প্রদর্শন কনফিগারেশন' : 'Multi-profile display configuration'}
          </p>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Toggle Mode Card */}
        <div className="md:col-span-5 bg-gradient-to-br from-cyan-50 to-sky-100/40 border border-cyan-200 p-6 rounded-3xl shadow-md space-y-6">
          <div className="space-y-2">
            <h4 className="font-black text-lg text-font-dark flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>{lang === 'bn' ? 'প্রদর্শন মোড নির্বাচন করুন' : 'Select Display Mode'}</span>
            </h4>
            <p className="text-xs text-font-light leading-relaxed font-bold">
              {lang === 'bn' 
                ? 'একই স্ক্রিনে একটি একক প্রোফাইল বা আপনার সমস্ত লগ ইন করা অ্যাকাউন্ট ডেটা একসাথে প্রদর্শন করুন।' 
                : 'Choose whether to monitor a single active profile or display telemetry for all logged-in accounts simultaneously.'}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => setViewMode('default')}
              className={`w-full py-4 px-5 text-sm font-black rounded-2xl border transition-all cursor-pointer shadow-xs flex items-center justify-between ${
                viewMode === 'default'
                  ? 'bg-primary text-white border-primary shadow-md scale-[1.01]'
                  : 'bg-white border-cyan-200 text-font-dark hover:bg-cyan-50/50'
              }`}
            >
              <span>{lang === 'bn' ? 'ডিফল্ট ভিউ' : 'Default View'}</span>
              {viewMode === 'default' && (
                <span className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full bg-white/20 text-white animate-pulse">
                  {lang === 'bn' ? 'সক্রিয়' : 'Active'}
                </span>
              )}
            </button>

            <button
              onClick={() => setViewMode('multiple')}
              className={`w-full py-4 px-5 text-sm font-black rounded-2xl border transition-all cursor-pointer shadow-xs flex items-center justify-between ${
                viewMode === 'multiple'
                  ? 'bg-primary text-white border-primary shadow-md scale-[1.01]'
                  : 'bg-white border-cyan-200 text-font-dark hover:bg-cyan-50/50'
              }`}
            >
              <span>{lang === 'bn' ? 'মাল্টিপল ভিউ' : 'Multiple View'}</span>
              {viewMode === 'multiple' && (
                <span className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full bg-white/20 text-white animate-pulse">
                  {lang === 'bn' ? 'সক্রিয়' : 'Active'}
                </span>
              )}
            </button>
          </div>

          <div className="flex gap-2 p-4 bg-white border border-cyan-100 rounded-2xl text-xs text-primary font-bold leading-normal">
            <ShieldAlert className="w-5 h-5 text-primary shrink-0" />
            <span>
              {lang === 'bn'
                ? 'মাল্টিপল ভিউতে সমস্ত লগইন অ্যাকাউন্টের ডাটা একই সাথে লোড করতে কিছুটা সময় লাগতে পারে।'
                : 'Under Multiple View mode, the app polls data streams for all logged-in profiles in parallel. Loading times may vary based on session count.'}
            </span>
          </div>

          <div className="p-5 bg-white border border-cyan-100 rounded-2xl text-xs text-font-dark font-bold space-y-2">
            <h5 className="font-black text-xs text-primary uppercase tracking-wider">
              {lang === 'bn' ? 'মাল্টিপল ভিউ সমর্থিত ফিচারসমূহ:' : 'Supported Features in Multiple View:'}
            </h5>
            <p className="text-[11px] text-font-light leading-relaxed">
              {lang === 'bn'
                ? 'মাল্টিপল ভিউ মোড শুধুমাত্র লাইভ ডিভাইস ডাটা ও কন্ট্রোল সংক্রান্ত স্ক্রিনগুলোতে কাজ করে। অন্যান্য সাধারণ স্ক্রিনের তথ্য সকল অ্যাকাউন্টের জন্য একই থাকে।'
                : 'Multiple View mode applies only to screens with live device telemetry or control configurations. Static features with identical content across accounts will display a single unified view.'}
            </p>
            <ul className="grid grid-cols-1 gap-1 text-[10px] text-font-dark mt-2 list-disc pl-4">
              <li>{lang === 'bn' ? 'লাইভ ডাটা মনিটরিং (Live Data Monitoring)' : 'Live Data Monitoring'}</li>
              <li>{lang === 'bn' ? 'অটোমেশন সেটিংস (Automation Settings)' : 'Automation Settings'}</li>
              <li>{lang === 'bn' ? 'অটো এয়ারেটর কানেকশন (Auto Aerator Connection)' : 'Auto Aerator Connection'}</li>
              <li>{lang === 'bn' ? 'অটো ফিডার কানেকশন (Auto Feeder Connection)' : 'Auto Feeder Connection'}</li>
              <li>{lang === 'bn' ? 'পন্ড ফিল্ট্রেশন সিস্টেম (Pond Filtration System)' : 'Pond Filtration System'}</li>
              <li>{lang === 'bn' ? 'ন্যানো বাবল এয়ারেশন (Nano Bubble Aeration)' : 'Nano Bubble Aeration'}</li>
              <li>{lang === 'bn' ? 'এফসিআর ক্যালকুলেটর (FCR Calculator)' : 'FCR Calculator'}</li>
            </ul>
          </div>
        </div>

        {/* Visual Example comparison */}
        <div className="md:col-span-7 bg-white border border-cyan-100 rounded-3xl p-6 shadow-sm space-y-6">
          <h4 className="font-black text-base text-font-dark border-b border-cyan-50 pb-3 flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            <span>{lang === 'bn' ? 'ভিউ মোড তুলনা ও উদাহরণ' : 'View Mode Comparison & Examples'}</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Left: Default View Example */}
            <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50/50 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wide">
                    {lang === 'bn' ? 'ডিফল্ট ভিউ' : 'Default View (Single)'}
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                </div>
                <p className="text-[11px] font-bold text-font-light leading-relaxed mt-2 mb-4">
                  {lang === 'bn'
                    ? 'শুধুমাত্র প্রধান নির্বাচিত অ্যাকাউন্ট প্রোফাইলটির ডেটা স্ক্রিনে দেখা যাবে।'
                    : 'Only the active, main selected profile shows up. Other logged in sessions stay in the profile switcher.'}
                </p>
              </div>
              
              {/* Mockup UI */}
              <div className="border border-slate-200 rounded-xl bg-white p-3 shadow-xs space-y-2">
                <div className="flex items-center gap-2 border-b border-slate-50 pb-1.5">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-[9px] font-bold">A1</div>
                  <div>
                    <span className="text-[9px] font-black text-font-dark block leading-tight">Account Profile 1</span>
                    <span className="text-[7px] text-font-light font-bold">bhaibhaiagro@mail.com</span>
                  </div>
                </div>
                <div className="space-y-1 text-[9px] text-font-light font-bold">
                  <div className="flex justify-between"><span>Dissolved Oxygen</span><span className="text-primary font-black">5.2 mg/L</span></div>
                  <div className="flex justify-between"><span>Temperature</span><span className="text-primary font-black">28.4 °C</span></div>
                </div>
              </div>
            </div>

            {/* Right: Multiple View Example */}
            <div className="border border-cyan-200 rounded-2xl p-4 bg-cyan-50/20 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-cyan-100 pb-2">
                  <span className="text-[10px] font-black text-primary uppercase tracking-wide">
                    {lang === 'bn' ? 'মাল্টিপল ভিউ' : 'Multiple View (Stacked)'}
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                </div>
                <p className="text-[11px] font-bold text-font-light leading-relaxed mt-2 mb-4">
                  {lang === 'bn'
                    ? 'সবগুলো লগইন করা প্রোফাইলের ডেটা পর্যায়ক্রমে উপর-নিচ কার্ড আকারে স্ক্রিনে লোড হবে।'
                    : 'All logged in profiles are rendered stacked vertically. Great for co-monitoring multiple sites simultaneously.'}
                </p>
              </div>

              {/* Mockup UI Stacks */}
              <div className="space-y-3">
                <div className="border border-cyan-100 rounded-xl bg-white p-3 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 border-b border-slate-50 pb-1.5">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-[9px] font-bold">A1</div>
                    <div>
                      <span className="text-[9px] font-black text-font-dark block leading-tight">Account Profile 1</span>
                      <span className="text-[7px] text-font-light font-bold">bhaibhaiagro@mail.com</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-[9px] text-font-light font-bold">
                    <span>Dissolved Oxygen</span><span className="text-primary font-black">5.2 mg/L</span>
                  </div>
                </div>

                <div className="border border-cyan-100 rounded-xl bg-white p-3 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 border-b border-slate-50 pb-1.5">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-[9px] font-bold">A2</div>
                    <div>
                      <span className="text-[9px] font-black text-font-dark block leading-tight">Account Profile 2</span>
                      <span className="text-[7px] text-font-light font-bold">ripondma@mail.com</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-[9px] text-font-light font-bold">
                    <span>Dissolved Oxygen</span><span className="text-primary font-black">6.1 mg/L</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
