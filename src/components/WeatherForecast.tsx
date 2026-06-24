import React, { useEffect, useState } from 'react';
import { useLang } from '../context/LanguageContext';
import { 
  RefreshCw, Droplets, Wind, Gauge, Search, ChevronDown, AlertTriangle 
} from 'lucide-react';

const BANGLADESH_DISTRICTS = [
  "Bagerhat", "Bandarban", "Barguna", "Barishal", "Bhola", "Bogra", "Brahmanbaria", 
  "Chandpur", "Chapai Nawabganj", "Chattogram", "Chuadanga", "Cox's Bazar", "Cumilla", 
  "Dhaka", "Dinajpur", "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj", 
  "Habiganj", "Jamalpur", "Jashore", "Jhalokati", "Jhenaidah", "Joypurhat", "Khagrachhari", 
  "Khulna", "Kishoreganj", "Kurigram", "Kushtia", "Lakshmipur", "Lalmonirhat", "Madaripur", 
  "Magura", "Manikganj", "Meherpur", "Moulvibazar", "Munshiganj", "Mymensingh", "Naogaon", 
  "Narail", "Narayanganj", "Narsingdi", "Natore", "Netrokona", "Nilphamari", "Noakhali", 
  "Pabna", "Panchagarh", "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi", "Rangamati", 
  "Rangpur", "Satkhira", "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj", "Sylhet", 
  "Tangail", "Thakurgaon"
];

const API_KEY = '1fe3d8310812392fbac14b02b9b3dcf1';
const LOCAL_STORAGE_KEY = 'last_selected_district';

export const WeatherForecast: React.FC = () => {
  const { t } = useLang();
  
  // State variables
  const [selectedDistrict, setSelectedDistrict] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEY) || 'Dhaka';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Weather data
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [hourlyForecast, setHourlyForecast] = useState<any[]>([]);

  const fetchWeatherData = async (district: string) => {
    setLoading(true);
    setError(null);

    // OWM API mapping: Chapai Nawabganj -> Nawabganj
    const queryCity = district === 'Chapai Nawabganj' ? 'Nawabganj' : district;
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${queryCity},BD&appid=${API_KEY}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${queryCity},BD&appid=${API_KEY}&units=metric`;

    try {
      const [currentRes, forecastRes] = await Promise.all([
        fetch(currentWeatherUrl),
        fetch(forecastUrl)
      ]);

      if (!currentRes.ok || !forecastRes.ok) {
        throw new Error('Failed to retrieve weather reports from OpenWeatherMap.');
      }

      const currentData = await currentRes.json();
      const forecastData = await forecastRes.json();

      setCurrentWeather(currentData);
      
      // Next 24 hours (8 slots, 3h apart)
      const list = forecastData?.list || [];
      setHourlyForecast(list.slice(0, 8));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to load weather forecast. Check network connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData(selectedDistrict);
  }, [selectedDistrict]);

  const handleSelectDistrict = (district: string) => {
    setSelectedDistrict(district);
    localStorage.setItem(LOCAL_STORAGE_KEY, district);
    setSearchQuery('');
    setDropdownOpen(false);
  };

  // Format time (dt_txt or dt) to human readable hour: e.g. 9AM, 12PM
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours}${ampm}`;
  };

  const filteredDistricts = BANGLADESH_DISTRICTS.filter((d) =>
    d.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-cyan-50 pb-4 gap-4">
        <div>
          <h4 className="font-black text-2xl text-font-dark">{t('weather_forecast')}</h4>
          <p className="text-[11px] font-black text-font-light uppercase">Bilingual 24h & detail outlook</p>
        </div>

        {/* Searchable Dropdown Selector */}
        <div className="relative w-full md:w-64">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-cyan-200 rounded-xl text-sm font-black text-font-dark focus:outline-none focus:ring-2 focus:ring-primary shadow-md cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4.5 h-4.5 text-font-light" />
              <span>{selectedDistrict}</span>
            </div>
            <ChevronDown className={`w-4.5 h-4.5 text-font-light transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-cyan-200 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-60 animate-in fade-in slide-in-from-top-2 duration-150 select-text">
              {/* Search input inside dropdown */}
              <div className="p-2 border-b border-cyan-100 bg-cyan-50/20 flex items-center gap-2">
                <Search className="w-4 h-4 text-font-light shrink-0" />
                <input
                  type="text"
                  placeholder="Search district..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-0 text-xs font-black text-font-dark focus:outline-none focus:ring-0"
                />
              </div>

              {/* Districts List */}
              <div className="overflow-y-auto flex-1 py-1">
                {filteredDistricts.map((district) => (
                  <button
                    key={district}
                    type="button"
                    onClick={() => handleSelectDistrict(district)}
                    className="w-full text-left px-4 py-2 hover:bg-cyan-50/50 transition-colors text-xs font-black cursor-pointer text-font-dark"
                  >
                    {district}
                  </button>
                ))}
                {filteredDistricts.length === 0 && (
                  <p className="p-4 text-center text-xs font-black text-font-light uppercase">
                    No matching districts
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        /* Loading State */
        <div className="flex flex-col justify-center items-center py-32 space-y-3">
          <RefreshCw className="w-10 h-10 text-primary animate-spin" />
          <span className="text-xs font-black text-font-light uppercase tracking-wider">Syncing Climate Data...</span>
        </div>
      ) : error ? (
        /* Error State */
        <div className="bg-red-50 border border-red-200 p-8 rounded-3xl text-center space-y-4 max-w-md mx-auto shadow-md">
          <div className="w-14 h-14 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto shadow-sm">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h4 className="font-black text-base text-red-800">Connection Error</h4>
          <p className="text-xs text-red-600 font-bold leading-relaxed">{error}</p>
          <button
            onClick={() => fetchWeatherData(selectedDistrict)}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-black text-sm rounded-xl shadow-md transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Retry Fetch</span>
          </button>
        </div>
      ) : (
        /* Weather Details UI */
        <div className="space-y-6">
          {/* Main Card (Current) */}
          {currentWeather && (
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-2 text-center md:text-left">
                <span className="text-[10px] font-black tracking-widest bg-white/20 px-3.5 py-1.5 rounded-full uppercase border border-white/10 shadow-xs">
                  Current Status
                </span>
                <h2 className="text-3xl font-black">{currentWeather.name}, BD</h2>
                <p className="text-5xl font-black">{currentWeather.main?.temp?.toFixed(1)}°C</p>
                <p className="text-base font-bold capitalize opacity-90">
                  {currentWeather.weather?.[0]?.description}
                </p>
              </div>

              {currentWeather.weather?.[0]?.icon && (
                <div className="w-32 h-32 bg-white/10 rounded-full border border-white/10 flex items-center justify-center shadow-inner">
                  <img
                    src={`https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@4x.png`}
                    alt="Weather Icon"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
          )}

          {/* 24-Hour Forecast Scroll list */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-100/40 border border-indigo-200 rounded-3xl p-6 shadow-md space-y-4">
            <h4 className="font-black text-base text-font-dark border-b border-indigo-100 pb-2">
              Next 24 Hours Forecast
            </h4>
            
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-cyan-100">
              {hourlyForecast.map((item, idx) => {
                const temp = item.main?.temp;
                const iconCode = item.weather?.[0]?.icon;
                const hourFormatted = formatTime(item.dt);

                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-between bg-white border border-indigo-150 rounded-2xl p-4 min-w-[90px] h-32 hover:shadow-md transition-shadow shadow-xs"
                  >
                    <span className="text-[10px] font-black text-font-light">{hourFormatted}</span>
                    
                    {iconCode && (
                      <img
                        src={`https://openweathermap.org/img/wn/${iconCode}@2x.png`}
                        alt="Hour weather icon"
                        className="w-10 h-10 object-contain"
                      />
                    )}

                    <span className="text-xs font-black text-font-dark">{temp?.toFixed(1)}°C</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Info Cards Grid */}
          {currentWeather && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Humidity */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-100/40 border border-blue-200 rounded-3xl p-5 shadow-md flex items-center gap-4 hover:shadow-lg transition-shadow">
                <div className="p-3 bg-white text-cyan-600 rounded-2xl border border-blue-200 shadow-xs">
                  <Droplets className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-font-light uppercase tracking-wider">Humidity</span>
                  <h4 className="text-lg font-black text-font-dark">{currentWeather.main?.humidity}%</h4>
                </div>
              </div>

              {/* Wind Speed */}
              <div className="bg-gradient-to-br from-teal-50 to-emerald-100/40 border border-teal-200 rounded-3xl p-5 shadow-md flex items-center gap-4 hover:shadow-lg transition-shadow">
                <div className="p-3 bg-white text-cyan-600 rounded-2xl border border-teal-200 shadow-xs">
                  <Wind className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-font-light uppercase tracking-wider">Wind Speed</span>
                  <h4 className="text-lg font-black text-font-dark">{currentWeather.wind?.speed} m/s</h4>
                </div>
              </div>

              {/* Pressure */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-100/40 border border-purple-200 rounded-3xl p-5 shadow-md flex items-center gap-4 hover:shadow-lg transition-shadow">
                <div className="p-3 bg-white text-cyan-600 rounded-2xl border border-purple-200 shadow-xs">
                  <Gauge className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-font-light uppercase tracking-wider">Pressure</span>
                  <h4 className="text-lg font-black text-font-dark">{currentWeather.main?.pressure} hPa</h4>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
