import React, { useEffect, useState } from 'react';
import { Cloud, CloudRain, CloudSun, Languages, MapPin, RefreshCw, Sun, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { api } from '../services/api.ts';
import { type Ecosystem, ecosystemToAuthFlow } from '../types/navigation';
import moreFishLogo from '../assets/dma_more_fish.png';
import pharmaLogo from '../assets/dma_pharmaceutical.png';
import poultryCareLogo from '../assets/poultry care.png';
import cattleCareLogo from '../assets/cattle care.png';
import dmaLogo from '../assets/DMA Logo.png';

interface HeaderProps {
  activeEcosystem: Ecosystem;
  onNavigate?: (page: any) => void;
}

interface HeaderWeather {
  location: string;
  temperature: number | null;
  humidity: number | null;
  description: string;
  sunlight: string | null;
  source: 'dashboard' | 'openweather';
}

const firstValue = (...values: any[]) => values.find((value) => value !== undefined && value !== null && value !== '');

const getDistrict = (pond: any, dashboard?: any, profile?: any) => {
  const assetName = String(firstValue(
    dashboard?.asset_name,
    pond?.asset_name,
    pond?.raw?.asset_name,
    '',
  ));
  const districtFromAssetName = assetName.includes('_') ? assetName.split('_')[0] : null;
  return String(firstValue(
    dashboard?.district,
    dashboard?.district_name,
    dashboard?.asset_district,
    dashboard?.farm_district,
    dashboard?.district?.name,
    dashboard?.asset?.district,
    dashboard?.asset?.district_name,
    dashboard?.asset?.location?.district,
    dashboard?.pond?.district,
    dashboard?.weather?.district,
    dashboard?.weather?.city,
    pond?.district,
    pond?.district_name,
    pond?.asset_district,
    pond?.farm_district,
    pond?.district?.name,
    pond?.location?.district,
    pond?.address?.district,
    pond?.raw?.district,
    pond?.raw?.district_name,
    pond?.raw?.location?.district,
    pond?.raw?.asset_district,
    profile?.district,
    profile?.district_name,
    profile?.address?.district,
    profile?.user_address?.district,
    districtFromAssetName,
    'Dhaka',
  ));
};

const getDashboardWeather = (response: any, fallbackLocation: string): HeaderWeather | null => {
  const root = response?.raw?.data ?? response?.data?.asset ?? response?.raw ?? response?.data;
  const rawNode = firstValue(
    root?.weather,
    root?.weather_data,
    root?.current_weather,
    root?.dashboard?.weather,
    root?.environment,
  );
  const node = Array.isArray(rawNode) ? rawNode[0] : rawNode;
  if (!node || typeof node !== 'object') return null;

  const device = Array.isArray(root?.devices) ? root.devices[0] : root?.device;
  const deviceWeather = Array.isArray(device?.weather) ? device.weather[0] : device?.weather;

  const temperature = Number.parseFloat(String(firstValue(
    node.air_temp,
    node.air_temperature,
    node.temperature,
    node.temp,
    node.weather_temp,
    node.temp_c,
    node.main?.temp,
    root?.air_temp,
    root?.air_temperature,
    root?.temperature,
    root?.temp,
    deviceWeather?.air_temp,
    deviceWeather?.temperature,
    deviceWeather?.temp,
  )));
  const humidity = Number.parseFloat(String(firstValue(
    node.humidity,
    node.air_humidity,
    node.relative_humidity,
    node.weather_humidity,
    node.main?.humidity,
    root?.humidity,
    root?.air_humidity,
    deviceWeather?.humidity,
  )));
  const sunlight = firstValue(
    node.sunlight_level,
    node.sunlight,
    node.sun_light,
    node.light_level,
    node.sunlight_status,
    root?.sunlight,
    root?.sunlight_level,
    deviceWeather?.sunlight,
  );

  return {
    location: String(firstValue(
      node.district,
      node.city,
      node.location_name,
      node.location?.district,
      node.location?.name,
      typeof node.location === 'string' ? node.location : null,
      fallbackLocation,
    )),
    temperature: Number.isFinite(temperature) ? temperature : null,
    humidity: Number.isFinite(humidity) ? humidity : null,
    description: String(firstValue(
      node.description,
      node.weather_description,
      node.weather_status,
      node.condition,
      node.status,
      node.weather?.[0]?.description,
      '',
    )),
    sunlight: sunlight == null ? null : String(sunlight),
    source: 'dashboard',
  };
};

const getOpenWeather = (response: any, location: string): HeaderWeather => ({
  location,
  temperature: Number.isFinite(Number(response?.main?.temp)) ? Number(response.main.temp) : null,
  humidity: Number.isFinite(Number(response?.main?.humidity)) ? Number(response.main.humidity) : null,
  description: String(response?.weather?.[0]?.description || response?.weather?.[0]?.main || ''),
  sunlight: null,
  source: 'openweather',
});

export const Header: React.FC<HeaderProps> = ({ activeEcosystem, onNavigate }) => {
  const { tokens, profiles, allProfiles, viewMode } = useAuth();
  const { lang, setLang, t } = useLang();
  const { unreadCount } = useNotifications();
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState<HeaderWeather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [selectedWeatherProfileIndex, setSelectedWeatherProfileIndex] = useState<number | null>(null);
  const [selectedPoultryFarmId, setSelectedPoultryFarmId] = useState<string | null>(null);

  useEffect(() => {
    const handleFarmChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.farmId) {
        setSelectedPoultryFarmId(String(customEvent.detail.farmId));
      }
    };
    window.addEventListener('poultry:farm-changed', handleFarmChange);
    return () => window.removeEventListener('poultry:farm-changed', handleFarmChange);
  }, []);

  const isPharma = activeEcosystem === 'pharma';
  const isPoultry = activeEcosystem === 'poultry';
  const isCattle = activeEcosystem === 'cattle';
  
  const headerLogo = 
    isPharma ? pharmaLogo :
    isPoultry ? poultryCareLogo :
    isCattle ? cattleCareLogo :
    activeEcosystem === 'fish' ? moreFishLogo :
    dmaLogo;

  const currentAuthFlow = ecosystemToAuthFlow(activeEcosystem);
  const sessions = currentAuthFlow ? (allProfiles[currentAuthFlow] || []) : [];

  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadWeather = async () => {
      setWeatherLoading(true);
      let location = 'Dhaka';
      try {
        const currentAuthFlow = ecosystemToAuthFlow(activeEcosystem);
        if (currentAuthFlow && tokens[currentAuthFlow]) {
          const sessionsList = allProfiles[currentAuthFlow] || [];
          const targetProfile = (viewMode === 'multiple' && selectedWeatherProfileIndex !== null && sessionsList[selectedWeatherProfileIndex])
            ? sessionsList[selectedWeatherProfileIndex]
            : profiles[currentAuthFlow];

          if (currentAuthFlow === 'fish' || currentAuthFlow === 'pharma') {
            const pondResponse = await api.getPondList(currentAuthFlow, targetProfile?.token);
            const firstPond = pondResponse.data?.[0];
            if (firstPond?.id) {
              location = getDistrict(firstPond, null, targetProfile);
              try {
                const dashboardResponse = await api.getPondData(firstPond.id, undefined, currentAuthFlow, targetProfile?.token);
                location = getDistrict(firstPond, dashboardResponse?.raw?.data, targetProfile);
                const dashboardWeather = getDashboardWeather(dashboardResponse, location);
                if (dashboardWeather) {
                  if (dashboardWeather.temperature == null || dashboardWeather.humidity == null) {
                    try {
                      const fallbackResponse = await api.getWeather(location);
                      const fallbackWeather = getOpenWeather(fallbackResponse, location);
                      dashboardWeather.temperature ??= fallbackWeather.temperature;
                      dashboardWeather.humidity ??= fallbackWeather.humidity;
                      dashboardWeather.description ||= fallbackWeather.description;
                    } catch (error) {
                      console.error('[MoreFish header] District weather fallback failed.', error);
                    }
                  }
                  if (!cancelled) setWeather(dashboardWeather);
                  return;
                }
              } catch (error) {
                console.error('[MoreFish header] Dashboard weather failed; using district fallback.', error);
              }
            }
          } else if (currentAuthFlow === 'poultry') {
            try {
              const farmResponse = await api.getPoultryFarms(targetProfile?.token);
              const farmsList = farmResponse.data || [];
              const targetFarm = selectedPoultryFarmId 
                ? farmsList.find((f: any) => String(f.id) === selectedPoultryFarmId) 
                : farmsList[0];

              if (targetFarm?.id) {
                const dashboardResponse = await api.getPoultryDashboard(targetFarm.id, targetProfile?.token);
                const farmData = dashboardResponse.data || dashboardResponse;
                const weatherNode = farmData.weather;
                if (weatherNode) {
                  const locationName = weatherNode.weather_district?.district || weatherNode.weather_district || 'Dhaka';
                  const temperature = weatherNode.weather_temperature != null ? Number(weatherNode.weather_temperature) : null;
                  const humidity = weatherNode.weather_humidity != null ? Number(weatherNode.weather_humidity) : null;
                  const description = weatherNode.weather_description || '';
                  const sunlight = weatherNode.sunlight_level || null;
                  if (!cancelled) {
                    setWeather({
                      location: locationName,
                      temperature,
                      humidity,
                      description,
                      sunlight,
                      source: 'dashboard'
                    });
                    setWeatherLoading(false);
                    return;
                  }
                }
                location = farmData.location || farmData.district || getDistrict(null, null, targetProfile);
              } else {
                location = getDistrict(null, null, targetProfile);
              }
            } catch (error) {
              location = getDistrict(null, null, targetProfile);
            }
          } else if (currentAuthFlow === 'cattle') {
            try {
              const farmResponse = await api.getCattleFarms(targetProfile?.token);
              const firstFarm = farmResponse.data?.[0];
              if (firstFarm?.id) {
                const dashboardResponse = await api.getCattleDashboard(firstFarm.id, targetProfile?.token);
                const farmData = dashboardResponse.data || dashboardResponse;
                location = farmData.location || farmData.district || getDistrict(null, null, targetProfile);
              } else {
                location = getDistrict(null, null, targetProfile);
              }
            } catch (error) {
              location = getDistrict(null, null, targetProfile);
            }
          }
        }

        const openWeatherResponse = await api.getWeather(location);
        if (!cancelled) setWeather(getOpenWeather(openWeatherResponse, location));
      } catch (error) {
        console.error('[MoreFish header] Weather loading failed.', error);
        if (!cancelled) setWeather(null);
      } finally {
        if (!cancelled) setWeatherLoading(false);
      }
    };

    loadWeather();
    const refreshTimer = window.setInterval(loadWeather, 10 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(refreshTimer);
    };
  }, [tokens.fish, tokens.pharma, profiles.fish, profiles.pharma, tokens.poultry, tokens.cattle, profiles.poultry, profiles.cattle, activeEcosystem, selectedWeatherProfileIndex, selectedPoultryFarmId, viewMode]);

  const locale = lang === 'bn' ? 'bn-BD' : 'en-US';
  const dateParts = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).formatToParts(time);
  const datePart = (type: Intl.DateTimeFormatPartTypes) => dateParts.find((part) => part.type === type)?.value || '';
  const date = `${datePart('day')}-${datePart('month')}-${datePart('year')}`;
  const clock = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(time);

  const translateLocation = (location: string) => {
    if (lang === 'en') return location;
    const locations: Record<string, string> = { Dhaka: 'ঢাকা', Mymensingh: 'ময়মনসিংহ', Naogaon: 'নওগাঁ', Bagerhat: 'বাগেরহাট', Rajshahi: 'রাজশাহী' };
    return locations[location] || t(location);
  };

  const translateDescription = (description: string) => {
    if (!description) return '--';
    const normalized = description.toLowerCase();
    return lang === 'bn' ? t(normalized) : description.replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getWeatherIcon = () => {
    const description = weather?.description.toLowerCase() || '';
    if (description.includes('rain') || description.includes('drizzle')) return <CloudRain className="h-5 w-5 text-blue-500" />;
    if (description.includes('clear')) return <Sun className="h-5 w-5 text-amber-500" />;
    if (description.includes('cloud')) return <Cloud className="h-5 w-5 text-cyan-600" />;
    return <CloudSun className="h-5 w-5 text-cyan-600" />;
  };

  const title = 
    isPharma ? (lang === 'bn' ? 'ফার্মা কেয়ার' : 'Pharma Care') :
    isPoultry ? (lang === 'bn' ? 'পোল্ট্রি কেয়ার' : 'Poultry Care') :
    isCattle ? (lang === 'bn' ? 'ক্যাটল কেয়ার' : 'Cattle Care') :
    'MoreFish - আরো মাছ';
  const airTempLabel = lang === 'bn' ? 'বাতাসের তাপমাত্রা' : 'Air Temp';
  const humidityLabel = lang === 'bn' ? 'আর্দ্রতা' : 'Humidity';
  const sunlightLabel = lang === 'bn' ? 'সূর্যালোক' : 'Sunlight';
  const languageLabel = lang === 'en' ? 'বাংলা' : 'Eng';

  const headerBackgroundClass = isPoultry
    ? 'bg-[#dbcc68] border-b border-[#dbcc68]/40'
    : 'bg-linear-to-r from-[#ccfbf1]/65 via-[#e0f2fe]/75 to-[#bae6fd]/65 border-b border-[#0ea5e9]/20';

  return (
    <header className={`relative min-h-24 lg:min-h-32 shrink-0 overflow-hidden px-4 py-3 lg:px-6 lg:py-4 shadow-md backdrop-blur-md ${headerBackgroundClass}`}>
      <div className="pointer-events-none absolute -left-12 -top-20 h-48 w-48 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-8 -top-16 h-52 w-52 rounded-full bg-blue-300/30 blur-3xl" />
      <div className="relative flex h-full flex-wrap items-center justify-between gap-3 lg:gap-5">
        <div className="flex min-w-0 items-center gap-3 lg:gap-4">
          <div className="flex h-14 w-14 lg:h-20 lg:w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-white bg-white/90 p-1.5 lg:p-2 shadow-lg shadow-cyan-900/10">
            <img src={headerLogo} alt={isPharma ? 'Pharma Care' : 'MoreFish'} className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg lg:text-2xl font-black text-font-dark tracking-wide">{title}</h1>
            <div className="mt-1 lg:mt-2 flex flex-wrap items-center gap-x-3 lg:gap-x-4 text-sm lg:text-lg font-black text-font-light">
              <span className="bg-white/60 border border-cyan-100/50 px-2 py-0.5 lg:px-3.5 lg:py-1 rounded-xl shadow-2xs text-xs lg:text-[17px] font-black">{date}</span>
              <span className="font-black text-primary">{clock}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 lg:gap-4 relative z-20">
          {/* Notification functional icon */}
          <button
            type="button"
            onClick={() => onNavigate?.('notifications')}
            className="relative flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-2xl border-2 border-cyan-200/60 bg-white/95 text-primary shadow-md transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:border-cyan-300 hover:shadow-lg cursor-pointer"
            title="Notifications"
          >
            <Bell className="h-5 w-5 lg:h-6 lg:w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 lg:h-6 lg:w-6 items-center justify-center rounded-full bg-red-500 text-[9px] lg:text-[10px] font-black text-white border-2 border-white shadow-sm">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              console.log('[MoreFish Header] Language toggle clicked. Old:', lang);
              const target = lang === 'en' ? 'bn' : 'en';
              setLang(target);
              console.log('[MoreFish Header] Language toggle clicked. New:', target);
            }}
            className="flex h-10 lg:h-12 items-center gap-2 lg:gap-2.5 rounded-2xl border-2 border-cyan-200/60 bg-white/95 px-3 lg:px-4.5 text-[12px] lg:text-[14px] font-black text-primary shadow-md transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:border-cyan-300 hover:shadow-lg cursor-pointer relative z-30 pointer-events-auto"
          >
            <Languages className="h-4.5 w-4.5 lg:h-5 lg:w-5" />
            <span>{languageLabel}</span>
          </button>
        </div>

        <div className="ml-auto min-w-0 text-right">
          {weatherLoading ? (
            <div className="flex min-h-20 lg:min-h-24 min-w-48 lg:min-w-64 items-center justify-center rounded-2xl border-2 border-white/80 bg-white/55 px-4 lg:px-6 shadow-md">
              <RefreshCw className="h-5 w-5 lg:h-6 lg:w-6 animate-spin text-cyan-600" />
            </div>
          ) : weather ? (
            <div className="weather-card group flex min-w-0 items-center gap-3 lg:gap-4 rounded-2xl border-2 border-white bg-white/80 p-2 lg:p-3 shadow-xl shadow-cyan-900/10 backdrop-blur-xl sm:min-w-80 lg:min-w-100 xl:min-w-120">
              <div className="weather-float hidden md:flex h-12 w-12 lg:h-16 lg:w-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-amber-100 to-cyan-100 shadow-inner border border-white">
                <div className="scale-110 lg:scale-135">{getWeatherIcon()}</div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 lg:gap-3 border-b border-gray-100 pb-1 lg:pb-1.5 mb-1 lg:mb-1.5">
                  <div className="flex items-center gap-1.5 lg:gap-2 min-w-0">
                    <p className="truncate text-[10px] lg:text-xs font-black capitalize text-font-light">{translateDescription(weather.description)}</p>
                    {viewMode === 'multiple' && sessions.length > 0 && (
                      <select
                         value={selectedWeatherProfileIndex ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedWeatherProfileIndex(val === '' ? null : Number(val));
                        }}
                        className={`small-select-weather border rounded-lg text-[9px] lg:text-[9.5px] font-black focus:outline-none focus:ring-1 cursor-pointer px-1.5 py-0.5 transition-colors ${
                          isPoultry 
                            ? 'bg-[#dbcc68]/20 hover:bg-[#dbcc68]/40 border-[#c4b55c]/35 text-[#1f6f3c] focus:ring-[#1f6f3c]' 
                            : 'bg-cyan-50/50 hover:bg-cyan-100/50 border border-cyan-100 text-primary focus:ring-primary'
                        }`}
                      >
                        {sessions.map((session, index) => {
                          const displayName = session.first_name 
                            ? `${session.first_name} ${session.last_name || ''}`.trim()
                            : session.email || `Account ${index + 1}`;
                          return (
                            <option key={index} value={index} className="text-xs text-font-dark">
                              {displayName.split('@')[0].slice(0, 10)}
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-0.5 lg:gap-1 text-xs lg:text-[15px] font-black text-font-dark shrink-0">
                    <span className="relative flex h-5 w-5 lg:h-6 lg:w-6 items-center justify-center">
                      <span className="weather-location-pulse absolute h-4 w-4 lg:h-5 lg:w-5 rounded-full bg-emerald-400/40" />
                      <MapPin className="relative h-4 w-4 lg:h-5 lg:w-5 shrink-0 text-[#00a651]" />
                    </span>
                    <span className="truncate">{translateLocation(weather.location)}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5 lg:gap-2 text-left text-xs sm:grid-cols-3">
                  <div className="rounded-xl border border-cyan-100 bg-white/90 px-2 py-1 lg:px-3 lg:py-1.5 transition group-hover:border-cyan-200">
                    <span className="block text-[9px] lg:text-[10px] font-bold uppercase tracking-wider text-font-light">{airTempLabel}</span>
                    <strong className="text-sm lg:text-base text-font-dark">{weather.temperature?.toFixed(1) ?? '--'}°C</strong>
                  </div>
                  <div className="rounded-xl border border-blue-100 bg-white/90 px-2 py-1 lg:px-3 lg:py-1.5 transition group-hover:border-blue-200">
                    <span className="block text-[9px] lg:text-[10px] font-bold uppercase tracking-wider text-font-light">{humidityLabel}</span>
                    <strong className="text-sm lg:text-base text-font-dark">{weather.humidity?.toFixed(0) ?? '--'}%</strong>
                  </div>
                  {weather.source === 'dashboard' && weather.sunlight && (
                    <div className="col-span-2 rounded-xl border border-orange-100 bg-orange-50/90 px-2 py-1 lg:px-3 lg:py-1.5 sm:col-span-1">
                      <span className="block text-[9px] lg:text-[10px] font-bold uppercase tracking-wider text-orange-600/70">{sunlightLabel}</span>
                      <strong className="text-sm lg:text-base capitalize text-orange-600">{lang === 'bn' ? t(weather.sunlight.toLowerCase()) : weather.sunlight}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <span className="text-sm font-black text-red-500">Weather unavailable</span>
          )}
        </div>
      </div>
    </header>
  );
};
