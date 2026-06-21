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
          <div className="p-2 bg-cyan-50 text-primary rounded-xl border border-cyan-100">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-font-dark">{t('filtration_system')}</h4>
            <p className="text-[10px] font-bold text-font-light uppercase">RAS Control & Biosecurity Panel</p>
          </div>
        </div>

        <button
          onClick={() => setShowGuide(true)}
          className="px-4 py-2 bg-cyan-50 hover:bg-cyan-100 border border-cyan-100 text-primary font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          <span>{lang === 'bn' ? 'তৈরি করার নির্দেশিকা' : 'Construction Guide'}</span>
        </button>
      </div>

      {/* Telemetry Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-cyan-100/40 rounded-3xl p-5 shadow-sm space-y-2">
          <span className="text-[9px] font-black text-font-light uppercase">{t('ammonia_level')}</span>
          <h3 className={`text-2xl font-black ${telemetry.ammonia < 0.05 ? 'text-emerald-500' : 'text-red-500'}`}>
            {telemetry.ammonia} ppm
          </h3>
          <p className="text-[9px] text-font-light font-semibold">Ideal: &lt; 0.05 ppm</p>
        </div>

        <div className="bg-white border border-cyan-100/40 rounded-3xl p-5 shadow-sm space-y-2">
          <span className="text-[9px] font-black text-font-light uppercase">{t('nitrite_level')}</span>
          <h3 className={`text-2xl font-black ${telemetry.nitrite < 0.2 ? 'text-emerald-500' : 'text-red-500'}`}>
            {telemetry.nitrite} ppm
          </h3>
          <p className="text-[9px] text-font-light font-semibold">Ideal: &lt; 0.20 ppm</p>
        </div>

        <div className="bg-white border border-cyan-100/40 rounded-3xl p-5 shadow-sm space-y-2">
          <span className="text-[9px] font-black text-font-light uppercase">pH Level</span>
          <h3 className="text-2xl font-black text-primary">{telemetry.ph}</h3>
          <p className="text-[9px] text-font-light font-semibold">Ideal: 6.5 - 8.5</p>
        </div>

        <div className="bg-white border border-cyan-100/40 rounded-3xl p-5 shadow-sm space-y-2">
          <span className="text-[9px] font-black text-font-light uppercase">Filter System Health</span>
          <h3 className="text-2xl font-black text-emerald-500">Perfect</h3>
          <p className="text-[9px] text-font-light font-semibold">Flow Rate: 42 m³/hr</p>
        </div>
      </div>

      {/* Control Switches */}
      <div className="bg-white border border-cyan-100/40 rounded-3xl p-6 shadow-sm space-y-6">
        <h4 className="font-extrabold text-sm text-font-dark border-b border-cyan-50 pb-3">
          Filter Loop Switched Actuators
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mechanical Filter */}
          <div className="bg-cyan-50/10 border border-cyan-100/30 rounded-2xl p-5 flex flex-col justify-between h-44 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h5 className="font-extrabold text-sm text-font-dark">{t('mechanical_filter')}</h5>
                <p className="text-[10px] text-font-light font-semibold mt-1">
                  Drum filter/Screen filter to strip feces and suspended solids.
                </p>
              </div>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                isMechanicalOn ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
              }`}>
                {isMechanicalOn ? 'Pumps Active' : 'Pumps Stopped'}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-cyan-50 pt-4">
              <div className="flex items-center gap-1.5 text-[10px] text-font-light font-bold">
                <Compass className="w-4 h-4 text-primary" />
                <span>Auto Flow Controlled</span>
              </div>

              <button
                onClick={handleToggleMechanical}
                disabled={actionLoading === 'mechanical'}
                className={`px-4 py-2 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  isMechanicalOn
                    ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-100'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-100'
                }`}
              >
                {actionLoading === 'mechanical' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Power className="w-3.5 h-3.5" />
                )}
                <span>{isMechanicalOn ? 'Stop' : 'Start'}</span>
              </button>
            </div>
          </div>

          {/* Biological Filter */}
          <div className="bg-cyan-50/10 border border-cyan-100/30 rounded-2xl p-5 flex flex-col justify-between h-44 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h5 className="font-extrabold text-sm text-font-dark">{t('biological_filter')}</h5>
                <p className="text-[10px] text-font-light font-semibold mt-1">
                  MBBR/BioReactor with nitrifying bacteria biofilm.
                </p>
              </div>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                isBiologicalOn ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
              }`}>
                {isBiologicalOn ? 'Pumps Active' : 'Pumps Stopped'}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-cyan-50 pt-4">
              <div className="flex items-center gap-1.5 text-[10px] text-font-light font-bold">
                <Waves className="w-4 h-4 text-primary" />
                <span>Bio-Bed Sanitised</span>
              </div>

              <button
                onClick={handleToggleBiological}
                disabled={actionLoading === 'biological'}
                className={`px-4 py-2 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  isBiologicalOn
                    ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-100'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-100'
                }`}
              >
                {actionLoading === 'biological' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Power className="w-3.5 h-3.5" />
                )}
                <span>{isBiologicalOn ? 'Stop' : 'Start'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed RAS Guide Modal/Panel */}
      {showGuide && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-cyan-100 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200 select-text">
            <div className="flex justify-between items-center border-b border-cyan-50 pb-3">
              <h3 className="font-extrabold text-font-dark text-base">
                {lang === 'bn' ? 'আরএএস (RAS) ফিল্ট্রেশন তৈরি করার নির্দেশিকা' : 'How to Build a Filtration System (RAS)'}
              </h3>
              <button
                onClick={() => setShowGuide(false)}
                className="text-font-light hover:text-font-dark font-bold text-sm cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-xs text-font-dark leading-relaxed font-semibold">
              <div className="space-y-1">
                <h5 className="font-black text-primary uppercase">Step 1: Solid & Sedimentation Control</h5>
                <p className="text-font-light">
                  Water leaving the culture pond flows into a mechanical screen or drum filter. This step traps 90% of settleable feces and feed debris. Strip these solids within 30 minutes to prevent toxic Ammonia dissolution.
                </p>
              </div>

              <div className="space-y-1">
                <h5 className="font-black text-primary uppercase">Step 2: Biofiltration (Nitrogen Cycle)</h5>
                <p className="text-font-light">
                  Pass pre-filtered water through a bio-media tank (MBBR, moving bed biofilm reactor). The media carries *Nitrosomonas* and *Nitrobacter* bacteria, which oxidize toxic Ammonia (NH3) into Nitrite (NO2-), and finally into safe Nitrate (NO3-). Maintain dissolved oxygen above 4.5 ppm in this tank to feed nitrifying colonies.
                </p>
              </div>

              <div className="space-y-1">
                <h5 className="font-black text-primary uppercase">Step 3: Degassing & Aeration</h5>
                <p className="text-font-light">
                  Fish respiration concentrates dissolved CO2. Run bio-filtered water down a stripping column (trickling tower) packed with corrugated plastic grids to release Carbon Dioxide gas. Replenish dissolved oxygen using Nano Bubble aeration nozzles prior to returning the water to culture ponds.
                </p>
              </div>

              <div className="space-y-1">
                <h5 className="font-black text-primary uppercase">Step 4: UV Disinfection</h5>
                <p className="text-font-light">
                  Install inline UV-C lamps in return piping. High-intensity UV radiation deactivates bacterial pathogens, viruses, and algae cells, preventing farm-wide infectious epidemics.
                </p>
              </div>
            </div>

            <div className="border-t border-cyan-50 pt-4 text-right">
              <button
                onClick={() => setShowGuide(false)}
                className="px-5 py-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow cursor-pointer"
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
