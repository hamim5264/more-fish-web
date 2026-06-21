import React, { useEffect, useState } from 'react';
import { Cloud, CloudRain, RefreshCw, Sun, Thermometer, Droplets } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { api } from '../services/api.ts';

export const WeatherForecast: React.FC = () => {
  const { t } = useLang();
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('Dhaka');
  const [forecast, setForecast] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getWeatherForecast(city);
      const list = res?.list || [];
      const daily = list.filter((_: any, i: number) => i % 8 === 0).slice(0, 5);
      setForecast(daily);
    } catch (err: any) {
      setError(err.message || t('failed_to_load'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecast();
  }, [city]);

  const getIcon = (desc: string) => {
    const d = desc.toLowerCase();
    if (d.includes('rain')) return <CloudRain className="w-6 h-6 text-blue-500" />;
    if (d.includes('clear')) return <Sun className="w-6 h-6 text-amber-500" />;
    return <Cloud className="w-6 h-6 text-cyan-500" />;
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between border-b border-cyan-50 pb-4">
        <div>
          <h4 className="font-bold text-font-dark">{t('weather_forecast')}</h4>
          <p className="text-[10px] font-bold text-font-light uppercase">5-day outlook</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="text-xs font-bold border border-cyan-100 rounded-xl px-3 py-2 bg-white"
          >
            {['Dhaka', 'Mymensingh', 'Naogaon', 'Bagerhat', 'Rajshahi'].map((c) => (
              <option key={c} value={c}>{t(c)}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={loadForecast}
            disabled={loading}
            className="p-2 bg-gray-50 border border-gray-100 hover:bg-gray-100 rounded-xl text-primary"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : error ? (
        <p className="text-center text-red-500 font-bold text-sm">{error}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {forecast.map((item, idx) => {
            const desc = item.weather?.[0]?.description || '';
            const temp = item.main?.temp;
            const humidity = item.main?.humidity;
            const date = new Date(item.dt * 1000).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });
            return (
              <div
                key={idx}
                className="bg-white/80 border border-cyan-100/30 p-5 rounded-3xl shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-font-light">{date}</span>
                  {getIcon(desc)}
                </div>
                <p className="text-sm font-bold text-font-dark capitalize">{desc}</p>
                <div className="flex gap-4 text-xs font-semibold text-font-light">
                  <span className="flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-orange-500" />
                    {temp?.toFixed(1)}°C
                  </span>
                  <span className="flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-cyan-500" />
                    {humidity}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
