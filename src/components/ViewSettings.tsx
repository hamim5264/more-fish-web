import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { Eye, ShieldAlert, Sparkles, LayoutGrid, Layers, Monitor, Check, Thermometer, Droplets } from 'lucide-react';

export const ViewSettings: React.FC = () => {
  const { viewMode, setViewMode } = useAuth();
  const { lang } = useLang();

  const profiles = [
    { label: 'Profile 1', email: 'farm1@dma.io', do: '5.2', temp: '28.4', color: 'bg-cyan-600' },
    { label: 'Profile 2', email: 'farm2@dma.io', do: '6.1', temp: '27.9', color: 'bg-indigo-600' },
    { label: 'Profile 3', email: 'farm3@dma.io', do: '5.9', temp: '29.1', color: 'bg-emerald-600' },
    { label: 'Profile 4', email: 'farm4@dma.io', do: '6.2', temp: '28.7', color: 'bg-violet-600' },
  ];


  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 select-none max-w-7xl mx-auto w-full">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-cyan-500 to-emerald-500 text-white rounded-2xl shadow-md shadow-cyan-100">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black text-2xl sm:text-3xl text-slate-800 tracking-tight">
              {lang === 'bn' ? 'ভিউ সেটিংস' : 'View Settings'}
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-0.5">
              {lang === 'bn' ? 'মাল্টি-প্রোফাইল ডিসপ্লে কনফিগারেশন' : 'Multi-profile display configuration'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column: Controls */}
        <div className="lg:col-span-4 bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-100/50 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-wider">
                {lang === 'bn' ? 'ডিসপ্লে মোড' : 'Display Mode'}
              </span>
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

          {/* Mode Selector Buttons */}
          <div className="flex flex-col gap-3">
            {[
              { id: 'default', titleEn: 'Default View', titleBn: 'ডিফল্ট ভিউ', descEn: 'Single active profile', descBn: 'একটি সক্রিয় প্রোফাইল', icon: Monitor },
              { id: 'multiple', titleEn: 'Multiple View', titleBn: 'মাল্টিপল ভিউ', descEn: 'Stacked vertical profiles', descBn: 'একটির নিচে আরেকটি', icon: Layers },
              { id: 'grid', titleEn: 'Grid View', titleBn: 'গ্রিড ভিউ', descEn: 'Compact 2×2 grid layout', descBn: 'পাশাপাশি গ্রিড লেআউট', icon: LayoutGrid },
            ].map((mode) => {
              const Icon = mode.icon;
              const isActive = viewMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id as any)}
                  className={`w-full p-4 text-left rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-center justify-between group ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white border-transparent shadow-lg shadow-cyan-200/50'
                      : 'bg-slate-50/50 border-slate-100 hover:border-cyan-200 hover:bg-cyan-50/30 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isActive ? 'bg-white/15 text-white' : 'bg-white text-slate-500 border border-slate-100 group-hover:text-cyan-500 shadow-sm'}`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="font-extrabold text-sm block leading-tight">
                        {lang === 'bn' ? mode.titleBn : mode.titleEn}
                      </span>
                      <span className={`text-[10px] font-medium block mt-0.5 ${isActive ? 'text-cyan-100' : 'text-slate-400'}`}>
                        {lang === 'bn' ? mode.descBn : mode.descEn}
                      </span>
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Warning note */}
          <div className="flex gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl text-xs text-amber-700 font-semibold leading-relaxed">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <span>
              {lang === 'bn'
                ? 'মাল্টিপল ও গ্রিড মোডে সবগুলো প্রোফাইলের লাইভ ডেটা একই সাথে লোড হয়। লোডিং টাইম সেশনের সংখ্যার উপর নির্ভর করে।'
                : 'Under Multiple & Grid View, all logged-in profiles are polled in parallel. Loading time may vary with session count.'}
            </span>
          </div>

          {/* Supported Features */}
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2.5">
            <h5 className="font-extrabold text-[10px] text-slate-500 uppercase tracking-wider">
              {lang === 'bn' ? 'মাল্টি-ভিউতে সমর্থিত:' : 'Supported in Multi-View:'}
            </h5>
            <ul className="space-y-1.5 text-[11px] text-slate-500 font-medium">
              {['Live Data Monitoring', 'Automation Settings', 'Auto Aerator Connection', 'Auto Feeder', 'Pond Filtration System'].map((feat) => (
                <li key={feat} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                  {lang === 'bn' ? feat : feat}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Comparison Cards */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center gap-2.5 mb-1">
            <Eye className="w-5 h-5 text-cyan-500" />
            <h3 className="font-extrabold text-lg text-slate-800">
              {lang === 'bn' ? 'ভিউ মোড তুলনা ও উদাহরণ' : 'View Mode Comparison & Examples'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* ── Default View Card ── */}
            <div className="bg-white border-2 border-slate-100 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
              {/* Card Header */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-slate-400" />
                  <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                    {lang === 'bn' ? 'ডিফল্ট ভিউ' : 'Default View'}
                  </span>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-200" />
              </div>

              {/* Description */}
              <div className="px-5 py-4 border-b border-slate-50">
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  {lang === 'bn'
                    ? 'শুধুমাত্র সক্রিয় প্রোফাইলটি দেখা যাবে। অন্যগুলো প্রোফাইল সুইচার থেকে পরিবর্তন করুন।'
                    : 'Only the active profile is shown. Switch accounts from the profile selector.'}
                </p>
              </div>

              {/* Mockup */}
              <div className="px-5 py-4">
                <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                  {/* Profile row */}
                  <div className="flex items-center gap-2.5 px-3 py-2.5 bg-white border-b border-slate-100">
                    <div className="w-7 h-7 rounded-full bg-cyan-600 flex items-center justify-center text-white text-[9px] font-black shrink-0">A1</div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-slate-700 leading-tight truncate">Profile 1 (Active)</p>
                      <p className="text-[8px] text-slate-400 truncate">farm1@dma.io</p>
                    </div>
                    <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  </div>
                  {/* Metrics */}
                  <div className="p-3 space-y-1.5">
                    <div className="flex items-center justify-between bg-white rounded-lg px-2.5 py-1.5 border border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Droplets className="w-3 h-3 text-cyan-400" />
                        <span className="text-[9px] font-semibold text-slate-500">DO</span>
                      </div>
                      <span className="text-[10px] font-black text-cyan-600">5.2 <span className="text-[8px] font-bold opacity-60">mg/L</span></span>
                    </div>
                    <div className="flex items-center justify-between bg-white rounded-lg px-2.5 py-1.5 border border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Thermometer className="w-3 h-3 text-orange-400" />
                        <span className="text-[9px] font-semibold text-slate-500">Temp</span>
                      </div>
                      <span className="text-[10px] font-black text-orange-500">28.4 <span className="text-[8px] font-bold opacity-60">°C</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Multiple View Card ── */}
            <div className="bg-white border-2 border-slate-100 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-center justify-between px-5 py-3.5 bg-cyan-50 border-b border-cyan-100">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-500" />
                  <span className="text-[11px] font-extrabold text-cyan-700 uppercase tracking-wider">
                    {lang === 'bn' ? 'মাল্টিপল ভিউ' : 'Multiple View'}
                  </span>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-200" />
              </div>

              <div className="px-5 py-4 border-b border-slate-50">
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  {lang === 'bn'
                    ? 'সব প্রোফাইল পর্যায়ক্রমে কার্ড আকারে উপর-নিচ সাজানো থাকবে।'
                    : 'All profiles stacked vertically as individual cards for side-by-side comparison.'}
                </p>
              </div>

              <div className="px-5 py-4 space-y-2">
                {profiles.slice(0, 2).map((p, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-slate-100">
                      <div className={`w-6 h-6 rounded-full ${p.color} flex items-center justify-center text-white text-[8px] font-black shrink-0`}>A{i+1}</div>
                      <span className="text-[9px] font-black text-slate-700 truncate">{p.label}</span>
                      <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    </div>
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="flex items-center gap-1">
                        <Droplets className="w-3 h-3 text-cyan-400" />
                        <span className="text-[8px] text-slate-400 font-semibold">DO</span>
                      </div>
                      <span className="text-[9px] font-black text-cyan-600">{p.do} mg/L</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Grid View Card ── */}
            <div className="bg-white border-2 border-slate-100 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-center justify-between px-5 py-3.5 bg-indigo-50 border-b border-indigo-100">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-indigo-500" />
                  <span className="text-[11px] font-extrabold text-indigo-700 uppercase tracking-wider">
                    {lang === 'bn' ? 'গ্রিড ভিউ' : 'Grid View'}
                  </span>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse shadow-sm shadow-indigo-200" />
              </div>

              <div className="px-5 py-4 border-b border-slate-50">
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  {lang === 'bn'
                    ? 'সব প্রোফাইল ২×২ গ্রিডে পাশাপাশি একসাথে দেখা যাবে।'
                    : 'All profiles rendered in a compact 2×2 grid for a quick at-a-glance overview.'}
                </p>
              </div>

              <div className="px-5 py-4">
                <div className="grid grid-cols-2 gap-2">
                  {profiles.map((p, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                      <div className="flex items-center gap-1.5 px-2.5 py-2 bg-white border-b border-slate-100">
                        <div className={`w-5 h-5 rounded-full ${p.color} flex items-center justify-center text-white text-[7px] font-black shrink-0`}>A{i+1}</div>
                        <span className="text-[8px] font-black text-slate-700 truncate">P{i+1}</span>
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      </div>
                      <div className="px-2.5 py-2 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[7.5px] text-slate-400 font-semibold">DO</span>
                          <span className="text-[8px] font-black text-indigo-600">{p.do}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[7.5px] text-slate-400 font-semibold">°C</span>
                          <span className="text-[8px] font-black text-orange-500">{p.temp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
