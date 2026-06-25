// H:\DMA Hamim\DMA-Web-App\src\components\FarmManagement.tsx
import React, { useState } from 'react';
import { useLang } from '../context/LanguageContext';
import { guidesData } from '../data/guides';
import { farmManagementData } from '../data/farmManagementData';
import type { FarmCardItem } from '../data/farmManagementData';
import { Droplets, Grid, MapPin, ClipboardList, Info, BookOpen, ArrowLeft } from 'lucide-react';
import type { AquacultureFlow } from '../types/aquaculture';

interface FarmManagementProps {
  flow?: AquacultureFlow;
  token?: string;
  userId?: string;
}

// ModuleIcon component defined outside to comply with Rules of Hooks
const ModuleIcon: React.FC<{ iconName: string; name: string }> = ({ iconName, name }) => {
  const [imgError, setImgError] = useState(false);
  const iconUrl = `${import.meta.env.VITE_API_URL || ''}/media/assets/icons/farm_management/${iconName}`;

  if (imgError || !iconName) {
    return (
      <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-primary shrink-0">
        <BookOpen className="w-6 h-6" />
      </div>
    );
  }

  return (
    <img 
      src={iconUrl} 
      alt={name} 
      className="w-12 h-12 rounded-2xl object-contain bg-white shrink-0 border border-cyan-100/50 p-1"
      onError={() => setImgError(true)}
    />
  );
};

export const FarmManagement: React.FC<FarmManagementProps> = () => {
  const { lang, t } = useLang();
  const [activeTab, setActiveTab] = useState<'parameters' | 'preparation' | 'steps' | 'modules'>('parameters');
  const [selectedModule, setSelectedModule] = useState<FarmCardItem | null>(null);

  // Pull translated data
  const content = guidesData[lang] || guidesData.en;
  const pondContent = content.pond;

  const idealParams = [
    { title: t('dissolved_oxygen'), value: '> 5.0 mg/L', details: 'Critical for fish respiration. Below 3.0 mg/L triggers severe stress; below 2.0 mg/L can cause mass mortality. Maintain with aerators.' },
    { title: t('ph_level'), value: '7.5 - 8.2', details: 'A measure of acidity/alkalinity. Drastic fluctuations affect metabolic processes. Stable pH avoids skin/gill irritations.' },
    { title: t('temperature'), value: '25°C - 32°C', details: 'Regulates fish metabolism and food intake. High temp (>35°C) depletes oxygen rapidly; low temp slows down growth rate.' },
    { title: t('ammonia'), value: '< 0.05 ppm', details: 'Extremely toxic metabolic waste. High level blocks oxygen transfer in blood. Control with biofiltration or water replacement.' },
    { title: t('salinity') + ' & TDS', value: 'Dependent on species', details: 'Freshwater species require TDS < 1000 ppm. Salinity control is vital in brackish water shrimp/crab farming.' }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none max-w-5xl mx-auto w-full relative">
      {/* Tab Switchers */}
      <div className="flex border-b border-cyan-100/60 pb-px">
        <button
          onClick={() => { setActiveTab('parameters'); setSelectedModule(null); }}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-bold cursor-pointer transition-all ${
            activeTab === 'parameters' ? 'border-primary text-primary' : 'border-transparent text-font-light hover:text-primary'
          }`}
        >
          <Droplets className="w-4 h-4" />
          <span>{t('parameter')}</span>
        </button>
        <button
          onClick={() => { setActiveTab('preparation'); setSelectedModule(null); }}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-bold cursor-pointer transition-all ${
            activeTab === 'preparation' ? 'border-primary text-primary' : 'border-transparent text-font-light hover:text-primary'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>{pondContent.title}</span>
        </button>
        <button
          onClick={() => { setActiveTab('steps'); setSelectedModule(null); }}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-bold cursor-pointer transition-all ${
            activeTab === 'steps' ? 'border-primary text-primary' : 'border-transparent text-font-light hover:text-primary'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>{pondContent.cycle.title}</span>
        </button>
        <button
          onClick={() => { setActiveTab('modules'); setSelectedModule(null); }}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-bold cursor-pointer transition-all ${
            activeTab === 'modules' ? 'border-primary text-primary' : 'border-transparent text-font-light hover:text-primary'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Management Modules</span>
        </button>
      </div>

      {/* PARAMETERS LIST */}
      {activeTab === 'parameters' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex gap-2.5 p-4 bg-cyan-50 border border-cyan-100/40 rounded-2xl text-xs text-primary leading-relaxed font-semibold">
            <Info className="w-5 h-5 text-primary shrink-0" />
            <span>Optimal water quality parameters are the foundation of productive aquaculture. Sensors analyze these indices 24/7.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {idealParams.map((item, idx) => (
              <div key={idx} className="bg-gradient-to-br from-teal-50 to-blue-50/50 border border-cyan-100 p-6 rounded-3xl shadow-md flex flex-col justify-between group hover:shadow-lg transition-all">
                <div className="flex justify-between items-start border-b border-cyan-50 pb-3">
                  <h4 className="font-extrabold text-sm text-font-dark group-hover:text-primary transition-colors">{item.title}</h4>
                  <span className="font-black text-sm text-primary bg-cyan-50 border border-cyan-100/50 px-3 py-0.5 rounded-full">{item.value}</span>
                </div>
                <p className="text-xs text-font-light leading-relaxed font-semibold mt-3">{item.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PREPARATION GUIDE */}
      {activeTab === 'preparation' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Section 1: Selection Criteria */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <h4 className="font-bold text-font-dark">{pondContent.selection.title}</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {pondContent.selection.items.map((item, idx) => (
                <div key={idx} className="bg-gradient-to-br from-sky-50 to-cyan-100/40 border border-sky-100 p-5 rounded-3xl shadow-md space-y-2">
                  <h5 className="font-extrabold text-sm text-font-dark text-primary">{item.title}</h5>
                  <p className="text-xs text-font-light leading-relaxed font-semibold">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Preparation Steps */}
          <div className="space-y-4 pt-4 border-t border-cyan-50">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              <h4 className="font-bold text-font-dark">{pondContent.preparation.title}</h4>
            </div>
            <div className="space-y-3">
              {pondContent.preparation.items.map((step, idx) => (
                <div key={idx} className="bg-gradient-to-br from-indigo-50 to-sky-100/30 border border-indigo-100 p-5 rounded-3xl shadow-md flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-cyan-50 text-primary border border-cyan-100 flex items-center justify-center font-black text-sm shrink-0">
                    {idx + 1}
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-sm text-font-dark">{step.title}</h5>
                    <p className="text-xs text-font-light leading-relaxed font-semibold">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEPS GUIDE */}
      {activeTab === 'steps' && (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50/40 border border-purple-100 p-8 rounded-3xl shadow-md space-y-6 animate-in fade-in duration-200">
          <h4 className="font-bold text-font-dark border-b border-cyan-50 pb-4">{pondContent.cycle.title}</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-semibold leading-relaxed text-font-light">
            {pondContent.cycle.items.map((step, idx) => (
              <div key={idx} className="space-y-3 bg-cyan-50/20 p-5 rounded-2xl border border-cyan-50">
                <span className="text-[10px] font-black text-primary uppercase">Stage {idx + 1}</span>
                <h5 className="font-black text-font-dark text-sm">{step.title}</h5>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 18 MANAGEMENT MODULES */}
      {activeTab === 'modules' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex gap-2.5 p-4 bg-cyan-50 border border-cyan-100/40 rounded-2xl text-xs text-primary leading-relaxed font-semibold">
            <BookOpen className="w-5 h-5 text-primary shrink-0 animate-pulse" />
            <span>Complete guide library to optimize bio-operations, finance control, and system mechanics of your farm.</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {farmManagementData.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedModule(item)}
                className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-100 p-5 rounded-3xl shadow-md hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer flex flex-col justify-between h-48 select-none group"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <ModuleIcon iconName={item.iconName} name={item.name} />
                    <h5 className="font-extrabold text-sm text-font-dark group-hover:text-primary transition-colors line-clamp-1">
                      {lang === 'bn' ? item.bengaliName : item.name}
                    </h5>
                  </div>
                  <p className="text-xs text-font-light leading-relaxed font-semibold line-clamp-3">
                    {lang === 'bn' ? item.shortDescBn : item.shortDesc}
                  </p>
                </div>

                <div className="text-[10px] font-black text-primary uppercase tracking-wider flex items-center gap-1 mt-3">
                  <span>Read full guide</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Overlay View for selected card */}
      {selectedModule && (
        <div className="absolute inset-0 bg-white z-50 p-6 flex flex-col justify-between overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="space-y-6">
            <button
              onClick={() => setSelectedModule(null)}
              className="flex items-center gap-2 text-primary hover:bg-cyan-50/50 font-bold text-xs cursor-pointer border border-cyan-100 rounded-xl px-4 py-2 bg-white w-fit shadow-xs transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to modules</span>
            </button>

            <div className="flex items-center gap-4 border-b border-cyan-50 pb-4 pt-2">
              <ModuleIcon iconName={selectedModule.iconName} name={selectedModule.name} />
              <div>
                <h3 className="text-lg font-black text-font-dark">
                  {lang === 'bn' ? selectedModule.bengaliName : selectedModule.name}
                </h3>
                <span className="text-[10px] font-bold text-primary bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded uppercase tracking-wider">
                  Farm Sub-module Guide
                </span>
              </div>
            </div>

            <div className="p-5 bg-cyan-50/10 border border-cyan-100/40 rounded-3xl text-sm text-font-dark leading-relaxed font-medium space-y-4">
              <p>
                {lang === 'bn' ? selectedModule.fullContentBn : selectedModule.fullContent}
              </p>
            </div>
          </div>

          <div className="border-t border-cyan-50 pt-5 mt-6 flex justify-end">
            <button
              onClick={() => setSelectedModule(null)}
              className="py-2.5 px-6 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
