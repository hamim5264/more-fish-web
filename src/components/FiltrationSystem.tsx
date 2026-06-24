import React, { useState } from 'react';
import { useLang } from '../context/LanguageContext';
import { Filter, RefreshCw, Power, BookOpen, Compass, Waves } from 'lucide-react';

export const FiltrationSystem: React.FC = () => {
  const { t, lang } = useLang();
  
  // State
  const [isMechanicalOn, setIsMechanicalOn] = useState(true);
  const [isBiologicalOn, setIsBiologicalOn] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Mock telemetry data matching typical RAS setups
  const telemetry = {
    ammonia: 0.02, // ppm
    nitrite: 0.08, // ppm
    temp: 27.8,    // °C
    ph: 7.4,
    status: 'Healthy',
  };

  const handleToggleMechanical = () => {
    setActionLoading('mechanical');
    setTimeout(() => {
      setIsMechanicalOn((prev) => !prev);
      setActionLoading(null);
    }, 1000);
  };

  const handleToggleBiological = () => {
    setActionLoading('biological');
    setTimeout(() => {
      setIsBiologicalOn((prev) => !prev);
      setActionLoading(null);
    }, 1000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-50 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-cyan-50 text-primary rounded-xl border border-cyan-100">
            <Filter className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-2xl text-font-dark">{t('filtration_system')}</h4>
            <p className="text-[11px] font-black text-font-light uppercase">RAS Control & Biosecurity Panel</p>
          </div>
        </div>

        <button
          onClick={() => setShowGuide(true)}
          className="px-4 py-2.5 bg-primary hover:bg-primary-hover border border-primary text-white font-black text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
        >
          <BookOpen className="w-4 h-4" />
          <span>{lang === 'bn' ? 'তৈরি করার নির্দেশিকা' : 'Construction Guide'}</span>
        </button>
      </div>

      {/* Telemetry Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-teal-50 to-emerald-100/40 border border-teal-200 rounded-3xl p-5 shadow-md space-y-2">
          <span className="text-[10px] font-black text-font-light uppercase tracking-wider">{t('ammonia_level')}</span>
          <h3 className={`text-3xl font-black ${telemetry.ammonia < 0.05 ? 'text-emerald-600' : 'text-red-500'}`}>
            {telemetry.ammonia} ppm
          </h3>
          <p className="text-[10px] text-font-light font-bold uppercase">Ideal: &lt; 0.05 ppm</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-blue-100/40 border border-indigo-200 rounded-3xl p-5 shadow-md space-y-2">
          <span className="text-[10px] font-black text-font-light uppercase tracking-wider">{t('nitrite_level')}</span>
          <h3 className={`text-3xl font-black ${telemetry.nitrite < 0.2 ? 'text-emerald-600' : 'text-red-500'}`}>
            {telemetry.nitrite} ppm
          </h3>
          <p className="text-[10px] text-font-light font-bold uppercase">Ideal: &lt; 0.20 ppm</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-100/40 border border-blue-200 rounded-3xl p-5 shadow-md space-y-2">
          <span className="text-[10px] font-black text-font-light uppercase tracking-wider">pH Level</span>
          <h3 className="text-3xl font-black text-primary">{telemetry.ph}</h3>
          <p className="text-[10px] text-font-light font-bold uppercase">Ideal: 6.5 - 8.5</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-100/40 border border-purple-200 rounded-3xl p-5 shadow-md space-y-2">
          <span className="text-[10px] font-black text-font-light uppercase tracking-wider">Filter System Health</span>
          <h3 className="text-3xl font-black text-emerald-600">Perfect</h3>
          <p className="text-[10px] text-font-light font-bold uppercase">Flow Rate: 42 m³/hr</p>
        </div>
      </div>

      {/* Control Switches */}
      <div className="bg-gradient-to-br from-cyan-50 to-sky-100/40 border border-cyan-200 rounded-3xl p-6 shadow-md space-y-6">
        <h4 className="font-black text-lg text-font-dark border-b border-cyan-100 pb-3">
          Filter Loop Switched Actuators
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mechanical Filter */}
          <div className="bg-white border border-cyan-150 rounded-2xl p-5 flex flex-col justify-between min-h-[11rem] h-full space-y-4 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <h5 className="font-black text-lg text-font-dark">{t('mechanical_filter')}</h5>
                <p className="text-xs text-font-light font-bold mt-1.5">
                  Drum filter/Screen filter to strip feces and suspended solids.
                </p>
              </div>
              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded border ${
                isMechanicalOn ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
              }`}>
                {isMechanicalOn ? 'Pumps Active' : 'Pumps Stopped'}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-cyan-50 pt-4">
              <div className="flex items-center gap-1.5 text-[11px] text-font-light font-black uppercase">
                <Compass className="w-5 h-5 text-primary" />
                <span>Auto Flow Controlled</span>
              </div>

              <button
                onClick={handleToggleMechanical}
                disabled={actionLoading === 'mechanical'}
                className={`px-4 py-2 rounded-xl border font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                  isMechanicalOn
                    ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-100'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-100'
                }`}
              >
                {actionLoading === 'mechanical' ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Power className="w-4 h-4" />
                )}
                <span>{isMechanicalOn ? 'Stop' : 'Start'}</span>
              </button>
            </div>
          </div>

          {/* Biological Filter */}
          <div className="bg-white border border-cyan-150 rounded-2xl p-5 flex flex-col justify-between min-h-[11rem] h-full space-y-4 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <h5 className="font-black text-lg text-font-dark">{t('biological_filter')}</h5>
                <p className="text-xs text-font-light font-bold mt-1.5">
                  MBBR/BioReactor with nitrifying bacteria biofilm.
                </p>
              </div>
              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded border ${
                isBiologicalOn ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
              }`}>
                {isBiologicalOn ? 'Pumps Active' : 'Pumps Stopped'}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-cyan-50 pt-4">
              <div className="flex items-center gap-1.5 text-[11px] text-font-light font-black uppercase">
                <Waves className="w-5 h-5 text-primary" />
                <span>Bio-Bed Sanitised</span>
              </div>

              <button
                onClick={handleToggleBiological}
                disabled={actionLoading === 'biological'}
                className={`px-4 py-2 rounded-xl border font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                  isBiologicalOn
                    ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-100'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-100'
                }`}
              >
                {actionLoading === 'biological' ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Power className="w-4 h-4" />
                )}
                <span>{isBiologicalOn ? 'Stop' : 'Start'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed RAS Guide Modal/Panel */}
      {showGuide && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-white via-cyan-50/20 to-white border border-cyan-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200 select-text">
            <div className="flex justify-between items-center border-b border-cyan-100 pb-3">
              <h3 className="font-black text-font-dark text-xl">
                {lang === 'bn' ? 'আরএএস (RAS) ফিল্ট্রেশন তৈরি করার নির্দেশিকা' : 'How to Build a Filtration System (RAS)'}
              </h3>
              <button
                onClick={() => setShowGuide(false)}
                className="text-font-light hover:text-font-dark font-black text-base cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-xs text-font-dark leading-relaxed font-bold">
              <div className="space-y-1 bg-white p-4 rounded-2xl border border-cyan-100 shadow-xs">
                <h5 className="font-black text-sm text-primary uppercase">Step 1: Solid & Sedimentation Control</h5>
                <p className="text-font-light text-xs font-semibold">
                  Water leaving the culture pond flows into a mechanical screen or drum filter. This step traps 90% of settleable feces and feed debris. Strip these solids within 30 minutes to prevent toxic Ammonia dissolution.
                </p>
              </div>

              <div className="space-y-1 bg-white p-4 rounded-2xl border border-cyan-100 shadow-xs">
                <h5 className="font-black text-sm text-primary uppercase">Step 2: Biofiltration (Nitrogen Cycle)</h5>
                <p className="text-font-light text-xs font-semibold">
                  Pass pre-filtered water through a bio-media tank (MBBR, moving bed biofilm reactor). The media carries *Nitrosomonas* and *Nitrobacter* bacteria, which oxidize toxic Ammonia (NH3) into Nitrite (NO2-), and finally into safe Nitrate (NO3-). Maintain dissolved oxygen above 4.5 ppm in this tank to feed nitrifying colonies.
                </p>
              </div>

              <div className="space-y-1 bg-white p-4 rounded-2xl border border-cyan-100 shadow-xs">
                <h5 className="font-black text-sm text-primary uppercase">Step 3: Degassing & Aeration</h5>
                <p className="text-font-light text-xs font-semibold">
                  Fish respiration concentrates dissolved CO2. Run bio-filtered water down a stripping column (trickling tower) packed with corrugated plastic grids to release Carbon Dioxide gas. Replenish dissolved oxygen using Nano Bubble aeration nozzles prior to returning the water to culture ponds.
                </p>
              </div>

              <div className="space-y-1 bg-white p-4 rounded-2xl border border-cyan-100 shadow-xs">
                <h5 className="font-black text-sm text-primary uppercase">Step 4: UV Disinfection</h5>
                <p className="text-font-light text-xs font-semibold">
                  Install inline UV-C lamps in return piping. High-intensity UV radiation deactivates bacterial pathogens, viruses, and algae cells, preventing farm-wide infectious epidemics.
                </p>
              </div>
            </div>

            <div className="border-t border-cyan-100 pt-4 text-right">
              <button
                onClick={() => setShowGuide(false)}
                className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-black text-sm rounded-xl shadow-md cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
