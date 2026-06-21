import React, { useEffect, useState } from 'react';
import { Cloud, CloudRain, CloudSun, Languages, MapPin, RefreshCw, Sun, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { api } from '../services/api.ts';
import type { Ecosystem } from '../types/navigation';
import moreFishLogo from '../assets/dma_more_fish.png';
import pharmaLogo from '../assets/dma_pharmaceutical.png';

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
  const { tokens, profiles } = useAuth();
  const { lang, setLang, t } = useLang();
  const { unreadCount } = useNotifications();
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState<HeaderWeather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  const isPharma = activeEcosystem === 'pharma';
  const headerLogo = isPharma ? pharmaLogo : moreFishLogo;
  const aquacultureFlow = activeEcosystem === 'pharma' ? 'pharma' : activeEcosystem === 'fish' ? 'fish' : null;

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
        if (aquacultureFlow && tokens[aquacultureFlow]) {
          const pondResponse = await api.getPondList(aquacultureFlow);
          const firstPond = pondResponse.data?.[0];
          if (firstPond?.id) {
            location = getDistrict(firstPond, null, profiles[aquacultureFlow]);
            try {
              const dashboardResponse = await api.getPondData(firstPond.id, undefined, aquacultureFlow);
              location = getDistrict(firstPond, dashboardResponse?.raw?.data, profiles[aquacultureFlow]);
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
  }, [tokens.fish, tokens.pharma, profiles.fish, profiles.pharma, activeEcosystem]);

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

  const title = isPharma
    ? (lang === 'bn' ? 'ফার্মা কেয়ার' : 'Pharma Care')
    : 'MoreFish - আরো মাছ';
  const airTempLabel = lang === 'bn' ? 'বাতাসের তাপমাত্রা' : 'Air Temp';
  const humidityLabel = lang === 'bn' ? 'আর্দ্রতা' : 'Humidity';
  const sunlightLabel = lang === 'bn' ? 'সূর্যালোক' : 'Sunlight';
  const languageLabel = lang === 'en' ? 'বাংলা' : 'Eng';

  return (
    <header className="relative min-h-28 shrink-0 overflow-hidden border-b border-black/5 bg-linear-to-r from-[#d4fcfd] via-[#e8feff] to-[#c9f7fb] px-4 py-3 shadow-sm md:px-6">
      <div className="pointer-events-none absolute -left-12 -top-20 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-8 -top-16 h-44 w-44 rounded-full bg-blue-300/20 blur-3xl" />
      <div className="relative flex h-full flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-white/70 p-1.5 shadow-md shadow-cyan-900/10">
            <img src={headerLogo} alt={isPharma ? 'Pharma Care' : 'MoreFish'} className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-black text-font-dark md:text-lg">{title}</h1>
            <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs font-semibold text-font-light">
              <span>{date}</span>
              <span className="font-bold text-font-dark">{clock}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification functional icon */}
          <button
            type="button"
            onClick={() => onNavigate?.('notifications')}
            className="relative flex items-center justify-center rounded-xl border border-cyan-200 bg-white/80 p-2.5 text-primary shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md cursor-pointer"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            className="flex items-center gap-2 rounded-xl border border-cyan-200 bg-white/80 px-3 py-2 text-xs font-bold text-primary shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md cursor-pointer"
          >
            <Languages className="h-4 w-4" />
            {languageLabel}
          </button>
        </div>

        <div className="ml-auto min-w-0 text-right">
          {weatherLoading ? (
            <div className="flex min-h-20 min-w-52 items-center justify-center rounded-2xl border border-white/80 bg-white/55 px-5 shadow-sm">
              <RefreshCw className="h-5 w-5 animate-spin text-cyan-600" />
            </div>
          ) : weather ? (
            <div className="weather-card group flex min-w-0 items-center gap-3 rounded-2xl border border-white/90 bg-white/65 p-2.5 shadow-lg shadow-cyan-900/10 backdrop-blur-xl sm:min-w-110">
              <div className="weather-float hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-amber-100 to-cyan-100 shadow-inner sm:flex">
                <div className="scale-125">{getWeatherIcon()}</div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-[11px] font-bold capitalize text-font-light">{translateDescription(weather.description)}</p>
                  <div className="flex items-center justify-end gap-1 text-sm font-black text-font-dark">
                    <span className="relative flex h-5 w-5 items-center justify-center">
                      <span className="weather-location-pulse absolute h-4 w-4 rounded-full bg-emerald-400/30" />
                      <MapPin className="relative h-4 w-4 shrink-0 text-[#00a651]" />
                    </span>
                    <span className="truncate">{translateLocation(weather.location)}</span>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1.5 text-left text-[11px] sm:grid-cols-3">
                  <div className="rounded-xl border border-cyan-100 bg-white/75 px-2.5 py-1.5 transition group-hover:border-cyan-200">
                    <span className="block text-[9px] font-bold uppercase tracking-wide text-font-light">{airTempLabel}</span>
                    <strong className="text-sm text-font-dark">{weather.temperature?.toFixed(2) ?? '--'}°C</strong>
                  </div>
                  <div className="rounded-xl border border-blue-100 bg-white/75 px-2.5 py-1.5 transition group-hover:border-blue-200">
                    <span className="block text-[9px] font-bold uppercase tracking-wide text-font-light">{humidityLabel}</span>
                    <strong className="text-sm text-font-dark">{weather.humidity?.toFixed(2) ?? '--'}%</strong>
                  </div>
                  {weather.source === 'dashboard' && weather.sunlight && (
                    <div className="col-span-2 rounded-xl border border-orange-100 bg-orange-50/80 px-2.5 py-1.5 sm:col-span-1">
                      <span className="block text-[9px] font-bold uppercase tracking-wide text-orange-600/70">{sunlightLabel}</span>
                      <strong className="text-sm capitalize text-orange-500">{lang === 'bn' ? t(weather.sunlight.toLowerCase()) : weather.sunlight}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <span className="text-xs font-bold text-red-500">Weather unavailable</span>
          )}
        </div>
      </div>
    </header>
  );
};
