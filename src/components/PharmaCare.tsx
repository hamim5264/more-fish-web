// H:\DMA Hamim\DMA-Web-App\src\components\PharmaCare.tsx
import React, { useState, useEffect } from 'react';
import { useLang } from '../context/LanguageContext';
import { Wind, ShieldCheck, Thermometer, Droplets, Activity, RefreshCw } from 'lucide-react';

export const PharmaCare: React.FC = () => {
  const { t } = useLang();

  const [aqi, setAqi] = useState<number | null>(45);
  const [temperature, setTemperature] = useState<number | null>(27.5);
  const [humidity, setHumidity] = useState<number | null>(62);
  const [co2, setCo2] = useState<number | null>(390);
  const [ammonia, setAmmonia] = useState<number | null>(0.02);
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    // Simulate query or pull from local/device data
    setTimeout(() => {
      setAqi(Math.floor(Math.random() * 30 + 30));
      setTemperature(parseFloat((Math.random() * 4 + 25).toFixed(1)));
      setHumidity(Math.floor(Math.random() * 20 + 55));
      setCo2(Math.floor(Math.random() * 50 + 380));
      setAmmonia(parseFloat((Math.random() * 0.05 + 0.01).toFixed(3)));
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 45000);
    return () => clearInterval(interval);
  }, []);

  const getAQIRating = (val: number) => {
    if (val <= 50) return { label: 'Good (খুব ভালো)', color: 'text-emerald-500 bg-emerald-50 border-emerald-100', desc: 'Air quality is considered satisfactory, and air pollution poses little or no risk.' };
    if (val <= 100) return { label: 'Moderate (মাঝারি)', color: 'text-amber-500 bg-amber-50 border-amber-100', desc: 'Air quality is acceptable; however, some pollutants may cause moderate health concern.' };
    return { label: 'Hazardous (বিপজ্জনক)', color: 'text-red-500 bg-red-50 border-red-100', desc: 'Health warning of emergency conditions. The entire population is more likely to be affected.' };
  };

  const aqiRating = aqi ? getAQIRating(aqi) : null;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none max-w-5xl mx-auto w-full flex flex-col justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gradient-to-br from-teal-50 to-emerald-100/40 p-8 rounded-3xl border border-teal-200 shadow-md animate-in fade-in zoom-in-95 duration-200">
        
        {/* Left: Environment Parameters Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-teal-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-white text-emerald-600 rounded-xl border border-teal-200 shadow-xs">
                <Wind className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="font-black text-2xl text-font-dark">{t('pharma_care')}</h4>
                <p className="text-[11px] font-black text-font-light uppercase">Clean Air live monitoring</p>
              </div>
            </div>
            <button
              onClick={refreshData}
              disabled={loading}
              className="p-3 bg-white border border-teal-200 hover:bg-emerald-50 rounded-xl text-primary transition-colors cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 border border-teal-100 rounded-2xl flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-font-light uppercase tracking-wide">{t('air_temp')}</span>
                <h4 className="text-xl font-black text-font-dark">{temperature}°C</h4>
              </div>
              <Thermometer className="w-5 h-5 text-orange-500" />
            </div>

            <div className="bg-white p-4 border border-teal-100 rounded-2xl flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-font-light uppercase tracking-wide">{t('humidity')}</span>
                <h4 className="text-xl font-black text-font-dark">{humidity}% RH</h4>
              </div>
              <Droplets className="w-5 h-5 text-cyan-500" />
            </div>

            <div className="bg-white p-4 border border-teal-100 rounded-2xl flex items-center justify-between col-span-2 shadow-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-font-light uppercase tracking-wide">Carbon Dioxide (CO2)</span>
                <h4 className="text-xl font-black text-font-dark">{co2} ppm</h4>
              </div>
              <Activity className="w-5 h-5 text-teal-500" />
            </div>

            <div className="bg-white p-4 border border-teal-100 rounded-2xl flex items-center justify-between col-span-2 shadow-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-font-light uppercase tracking-wide">Ammonia (NH3)</span>
                <h4 className="text-xl font-black text-font-dark">{ammonia} ppm</h4>
              </div>
              <Wind className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Right: AQI Indicator panel */}
        <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-teal-100/60 pt-6 md:pt-0 md:pl-8 min-h-[220px]">
          {aqi === null ? (
            <div className="w-full h-full flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <div className="space-y-5 text-center animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="pb-4 border-b border-teal-100">
                <span className="text-xs font-black text-font-light uppercase tracking-wide">Clean Air Quality Index (AQI)</span>
                <h2 className="text-7xl font-black text-emerald-600 mt-2">{aqi}</h2>
              </div>

              {aqiRating && (
                <div className="space-y-4 text-left">
                  <div className={`p-4 rounded-2xl border text-center font-black text-sm shadow-xs ${aqiRating.color}`}>
                    Rating: {aqiRating.label}
                  </div>
                  <div className="flex gap-2.5 p-4 bg-white border border-teal-100 rounded-2xl text-xs leading-relaxed font-bold text-font-light shadow-xs">
                    <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>{aqiRating.desc}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
