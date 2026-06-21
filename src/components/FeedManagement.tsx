// H:\DMA Hamim\DMA-Web-App\src\components\FeedManagement.tsx
import React, { useState } from 'react';
import { useLang } from '../context/LanguageContext';
import { guidesData } from '../data/guides';
import { Utensils, Calculator, FileText, HelpCircle, Info, CheckCircle } from 'lucide-react';
import type { AquacultureFlow } from '../types/aquaculture';

interface FeedManagementProps {
  flow?: AquacultureFlow;
}

export const FeedManagement: React.FC<FeedManagementProps> = () => {
  const { lang, t } = useLang();
  const [activeTab, setActiveTab] = useState<'guidelines' | 'calculator'>('guidelines');
  
  // Data selection based on current language
  const content = guidesData[lang] || guidesData.en;
  const feedContent = content.feed;

  // Calculator States
  const [selectedStage, setSelectedStage] = useState<number>(1); // default: Medium
  const [biomass, setBiomass] = useState<string>('');
  const [calculatedFeed, setCalculatedFeed] = useState<number | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const biomassNum = parseFloat(biomass);
    if (!isNaN(biomassNum) && biomassNum > 0) {
      const stageRate = feedContent.calculator.stages[selectedStage].rate;
      const result = biomassNum * stageRate;
      setCalculatedFeed(Number(result.toFixed(2)));
    } else {
      setCalculatedFeed(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-cyan-50 pb-4">
        <div className="p-2 bg-cyan-50 text-primary rounded-xl border border-cyan-100">
          <Utensils className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h4 className="font-bold text-font-dark">{feedContent.title}</h4>
          <p className="text-[10px] font-bold text-font-light uppercase">Optimized Feed & Nutrition Management</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-cyan-100/60 pb-px">
        <button
          onClick={() => setActiveTab('guidelines')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-bold cursor-pointer transition-all ${
            activeTab === 'guidelines' ? 'border-primary text-primary' : 'border-transparent text-font-light hover:text-primary'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{t('guidelines')}</span>
        </button>
        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-bold cursor-pointer transition-all ${
            activeTab === 'calculator' ? 'border-primary text-primary' : 'border-transparent text-font-light hover:text-primary'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>{feedContent.calculator.title}</span>
        </button>
      </div>

      {/* Tab: Guidelines */}
      {activeTab === 'guidelines' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Intro Info Banner */}
          <div className="flex gap-2.5 p-4 bg-cyan-50 border border-cyan-100/40 rounded-2xl text-xs text-primary leading-relaxed font-semibold">
            <Info className="w-5 h-5 text-primary shrink-0" />
            <span>Proper feed selection and calculation minimize water pollution, lower costs, and maximize feed conversion ratio (FCR).</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Types of Feed */}
            <div className="bg-white/80 border border-cyan-100/30 p-6 rounded-3xl shadow-sm space-y-4">
              <h4 className="font-extrabold text-base text-font-dark border-b border-cyan-50 pb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                {feedContent.types.title}
              </h4>
              <div className="space-y-4">
                <div className="bg-cyan-50/20 p-4 rounded-2xl border border-cyan-50/50">
                  <h5 className="font-bold text-sm text-font-dark">{feedContent.types.natural.title}</h5>
                  <p className="text-xs text-font-light mt-1 font-semibold leading-relaxed">{feedContent.types.natural.desc}</p>
                </div>
                <div className="bg-cyan-50/20 p-4 rounded-2xl border border-cyan-50/50">
                  <h5 className="font-bold text-sm text-font-dark">{feedContent.types.supplementary.title}</h5>
                  <p className="text-xs text-font-light mt-1 font-semibold leading-relaxed">{feedContent.types.supplementary.desc}</p>
                </div>
              </div>
            </div>

            {/* Feeding Schedule */}
            <div className="bg-white/80 border border-cyan-100/30 p-6 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <h4 className="font-extrabold text-base text-font-dark border-b border-cyan-50 pb-2 flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-primary" />
                  {feedContent.schedule.title}
                </h4>
                <p className="text-xs text-font-light leading-relaxed font-semibold">
                  {feedContent.schedule.desc}
                </p>
              </div>
              
              <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-2xl text-xs text-amber-800 font-semibold leading-relaxed flex gap-2">
                <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  {lang === 'bn' 
                    ? 'বিশেষ টিপস: বৃষ্টির দিনে বা মেঘলা আবহাওয়ায় যখন অক্সিজেন কমে যায়, তখন খাবারের পরিমাণ কমিয়ে দিন বা বন্ধ রাখুন।' 
                    : 'Pro Tip: Reduce or halt feeding during rainy or heavy overcast days to prevent toxic organic buildup and oxygen drops.'}
                </span>
              </div>
            </div>
          </div>

          {/* Feeding Methods */}
          <div className="bg-white/80 border border-cyan-100/40 p-6 rounded-3xl shadow-sm space-y-4">
            <h4 className="font-extrabold text-base text-font-dark border-b border-cyan-50 pb-2">
              {feedContent.methods.title}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {feedContent.methods.items.map((item, idx) => (
                <div key={idx} className="bg-cyan-50/15 border border-cyan-100/40 p-5 rounded-2xl space-y-2">
                  <h5 className="font-bold text-sm text-font-dark flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-100 text-primary flex items-center justify-center font-black text-xs shrink-0">
                      {idx + 1}
                    </span>
                    {item.title}
                  </h5>
                  <p className="text-xs text-font-light leading-relaxed font-semibold">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Calculator */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200">
          
          {/* Input Form Card */}
          <div className="bg-white/80 border border-cyan-100/30 p-6 rounded-3xl shadow-sm space-y-6">
            <h4 className="font-extrabold text-base text-font-dark border-b border-cyan-50 pb-2">
              {feedContent.calculator.title}
            </h4>

            <form onSubmit={handleCalculate} className="space-y-5">
              {/* Stage Select */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-font-dark uppercase tracking-wide">
                  {feedContent.calculator.stageLabel}
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {feedContent.calculator.stages.map((stage, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedStage(idx)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        selectedStage === idx 
                          ? 'border-primary bg-cyan-50/30 shadow-sm' 
                          : 'border-cyan-100/40 bg-white hover:bg-cyan-50/10'
                      }`}
                    >
                      <span className="font-bold text-xs text-font-dark">{stage.name}</span>
                      <span className="text-[10px] text-font-light font-semibold mt-1">{stage.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Biomass Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-font-dark uppercase tracking-wide">
                  {feedContent.calculator.weightLabel}
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder={lang === 'bn' ? 'যেমন: ৫০০' : 'e.g. 500'}
                  value={biomass}
                  onChange={(e) => setBiomass(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-cyan-100 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                />
              </div>

              {/* Calculate Button */}
              <button
                type="submit"
                className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Calculator className="w-5 h-5" />
                <span>{feedContent.calculator.calculateBtn}</span>
              </button>
            </form>
          </div>

          {/* Results Display Card */}
          <div className="bg-white/80 border border-cyan-100/30 p-6 rounded-3xl shadow-sm flex flex-col justify-center min-h-[300px]">
            {calculatedFeed === null ? (
              <div className="text-center py-12 space-y-3">
                <Calculator className="w-12 h-12 text-cyan-200 mx-auto" />
                <h4 className="font-bold text-font-dark">
                  {lang === 'bn' ? 'হিসাব প্রদর্শিত হয়নি' : 'Waiting for Calculation'}
                </h4>
                <p className="text-xs text-font-light max-w-xs mx-auto font-medium">
                  {lang === 'bn' 
                    ? 'মাছের বৃদ্ধির ধাপ নির্বাচন করুন, মোট বায়োমাস ওজন প্রবেশ করান এবং খাদ্য হিসাব করুন।' 
                    : 'Select a growth stage, input total biomass weight, and click calculate to estimate the feed.'}
                </p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-cyan-50 pb-4 text-center">
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-wide">
                    {lang === 'bn' ? 'হিসাব সম্পন্ন' : 'CALCULATION COMPLETE'}
                  </span>
                  <h3 className="text-sm font-bold text-font-light mt-2">{feedContent.calculator.resultTitle}</h3>
                  <div className="mt-3 flex items-baseline justify-center gap-1.5">
                    <span className="text-4xl font-black text-primary">{calculatedFeed}</span>
                    <span className="text-sm font-bold text-font-dark">{lang === 'bn' ? 'কেজি / দিন' : 'kg / day'}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-cyan-50/50 border border-cyan-100/50 rounded-2xl text-xs text-font-dark leading-relaxed font-semibold">
                    {feedContent.calculator.resultDesc}
                  </div>
                  
                  {/* Division Breakdown */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white border border-cyan-50 rounded-xl text-center">
                      <span className="text-[10px] font-bold text-font-light uppercase">
                        {lang === 'bn' ? 'সকাল (৫০%)' : 'Morning (50%)'}
                      </span>
                      <p className="font-black text-lg text-primary mt-1">{(calculatedFeed / 2).toFixed(2)} <span className="text-[10px] font-bold">kg</span></p>
                    </div>
                    <div className="p-3 bg-white border border-cyan-50 rounded-xl text-center">
                      <span className="text-[10px] font-bold text-font-light uppercase">
                        {lang === 'bn' ? 'বিকাল (৫০%)' : 'Afternoon (50%)'}
                      </span>
                      <p className="font-black text-lg text-primary mt-1">{(calculatedFeed / 2).toFixed(2)} <span className="text-[10px] font-bold">kg</span></p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
