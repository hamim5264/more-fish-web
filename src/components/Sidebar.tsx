// H:\DMA Hamim\DMA-Web-App\src\components\Sidebar.tsx
import React, { useState } from 'react';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  LayoutDashboard,
  Activity,
  ShieldAlert,
  BookOpen,
  Calculator,
  Settings,
  Store,
  Grid,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Layers,
  Thermometer,
  Wind,
  Utensils,
  Video,
  Fish,
  Pill,
  Waves,
  CloudSun,
  HeartHandshake,
  Filter,
  HelpCircle,
  Cpu,
  Zap,
  Radio,
} from 'lucide-react';
import dmaLogo from '../assets/DMA Logo.png';
import pharmaLogo from '../assets/dma_pharmaceutical.png';
import type { Ecosystem, Page } from '../types/navigation';
import { ecosystemToAuthFlow } from '../types/navigation';

interface SidebarProps {
  activeEcosystem: Ecosystem;
  setActiveEcosystem: (eco: Ecosystem) => void;
  activePage: Page;
  setActivePage: (page: Page) => void;
}

type MenuItem = { id: Page; label: string; icon: React.ComponentType<{ className?: string }> };

export const Sidebar: React.FC<SidebarProps> = ({
  activeEcosystem,
  setActiveEcosystem,
  activePage,
  setActivePage,
}) => {
  const { t } = useLang();
  const { profiles, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [ecoDropdownOpen, setEcoDropdownOpen] = useState(false);

  const ecosystems = [
    { id: 'fish', name: 'More Fish', icon: Layers, color: 'text-teal-500' },
    { id: 'cattle', name: 'Cattle Care', icon: Thermometer, color: 'text-amber-500' },
    { id: 'poultry', name: 'Poultry Care', icon: Wind, color: 'text-orange-500' },
    { id: 'pharma', name: 'Pharma Care', icon: Activity, color: 'text-emerald-500' },
    { id: 'beverage', name: 'Food & Beverage', icon: Grid, color: 'text-blue-500', disabled: true },
    { id: 'tex', name: 'Tex Care', icon: Grid, color: 'text-purple-500', disabled: true },
    { id: 'air', name: 'Air Care', icon: Wind, color: 'text-sky-500', disabled: true },
    { id: 'crop', name: 'Crop Care', icon: Grid, color: 'text-green-500', disabled: true },
  ];

  const currentEco = ecosystems.find((e) => e.id === activeEcosystem) || ecosystems[0];
  const brandLogo = activeEcosystem === 'pharma' ? pharmaLogo : dmaLogo;

  const getAquacultureMenuItems = (isPharma: boolean): MenuItem[] => {
    const pondLabel = isPharma ? 'Asset Management' : t('farm_management');
    return [
      { id: 'dashboard', label: t('home'), icon: LayoutDashboard },
      { id: 'iot', label: t('live_data_monitoring'), icon: Activity },
      { id: 'disease', label: t('fish_disease_detector'), icon: ShieldAlert },
      { id: 'pond', label: pondLabel, icon: Layers },
      { id: 'feed-management', label: t('feed_management'), icon: Utensils },
      { id: 'disease-treatment', label: t('fish_disease_treatment'), icon: BookOpen },
      { id: 'live-consultancy', label: t('live_consultancy'), icon: Video },
      { id: 'fish-farm-marketplace', label: t('fish_farm_marketplace'), icon: Store },
      { id: 'fingerlings-marketplace', label: t('fingerlings_marketplace'), icon: Fish },
      { id: 'grown-fish-sell', label: t('grown_fish_sell'), icon: Fish },
      { id: 'fish-medicine-enzyme', label: t('fish_medicine_enzyme'), icon: Pill },
      { id: 'fcr', label: t('fcr_calculator'), icon: Calculator },
      { id: 'nano-bubble', label: t('nano_bubble_aeration_system'), icon: Waves },
      { id: 'marketplace', label: t('fish_feed_marketplace'), icon: Store },
      { id: 'training', label: t('training_workshop'), icon: BookOpen },
      { id: 'auto-aerator', label: t('auto_aerator_connection'), icon: Zap },
      { id: 'auto-feeder', label: t('auto_feeder_connection'), icon: Radio },
      { id: 'weather-forecast', label: t('weather_forecast'), icon: CloudSun },
      { id: 'smart-khamari', label: t('smart_khamari'), icon: Grid },
      { id: 'emergency-service', label: t('emergency_service'), icon: HeartHandshake },
      { id: 'filtration', label: t('fish_pond_filtration_system'), icon: Filter },
      { id: 'automation', label: t('automation_settings_menu'), icon: Settings },
      { id: 'notifications', label: t('notifications'), icon: Bell },
      { id: 'profile', label: t('profile'), icon: User },
      { id: 'faq', label: t('faq_menu'), icon: HelpCircle },
      { id: 'about-app', label: t('about_app_menu'), icon: BookOpen },
      { id: 'about-device', label: t('about_device_menu'), icon: Cpu },
      { id: 'settings', label: t('change_password'), icon: Settings },
    ];
  };

  const getMenuItems = (): MenuItem[] => {
    if (activeEcosystem === 'fish') return getAquacultureMenuItems(false);
    if (activeEcosystem === 'pharma') return getAquacultureMenuItems(true);

    const commonItems: MenuItem[] = [
      { id: 'profile', label: t('profile'), icon: User },
      { id: 'notifications', label: t('notifications'), icon: Bell },
      { id: 'settings', label: t('change_password'), icon: Settings },
    ];

    if (activeEcosystem === 'cattle' || activeEcosystem === 'poultry') {
      return [{ id: 'dashboard', label: t('home'), icon: LayoutDashboard }, ...commonItems];
    }

    return commonItems;
  };

  const menuItems = getMenuItems();

  const handleEcosystemSelect = (id: Ecosystem) => {
    setActiveEcosystem(id);
    setActivePage('dashboard');
    setEcoDropdownOpen(false);
  };

  const authFlow = ecosystemToAuthFlow(activeEcosystem);
  const handleLogout = () => {
    if (authFlow) logout(authFlow);
  };

  const activeProfile = authFlow ? profiles[authFlow] : null;

  return (
    <div className="w-68 h-full glass border-r border-cyan-100 flex flex-col justify-between shrink-0 shadow-lg select-none">
      <div className="flex flex-col">
        <div className="p-5 flex items-center gap-3 border-b border-cyan-100/60 bg-white/45">
          <div className="w-14 h-12 rounded-xl bg-white flex items-center justify-center p-1.5 shadow-md border border-cyan-100/70">
            <img src={brandLogo} alt="DMA Technologies" className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-base text-primary leading-tight">DMA Technologies</h1>
            <p className="text-[10px] text-font-light font-semibold tracking-wide">Harmonising Nature & Technology</p>
          </div>
        </div>

        <div className="p-4 relative">
          <button
            onClick={() => setEcoDropdownOpen(!ecoDropdownOpen)}
            className="w-full flex items-center justify-between p-3 bg-white/70 hover:bg-white rounded-xl border border-cyan-100/50 shadow-sm transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <currentEco.icon className={`w-5 h-5 ${currentEco.color}`} />
              <span className="font-bold text-sm text-font-dark">{currentEco.name}</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-font-light transition-transform duration-200 ${ecoDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {ecoDropdownOpen && (
            <div className="absolute top-full left-4 right-4 mt-2 bg-white border border-cyan-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="py-1">
                {ecosystems.map((eco) => (
                  <button
                    key={eco.id}
                    disabled={eco.disabled}
                    onClick={() => handleEcosystemSelect(eco.id as Ecosystem)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-cyan-50/50 transition-colors duration-150 border-b border-gray-50 last:border-0 ${
                      eco.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                    } ${activeEcosystem === eco.id ? 'bg-cyan-50/70 font-semibold' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <eco.icon className={`w-4 h-4 ${eco.color}`} />
                      <span className="text-sm text-font-dark font-medium">{eco.name}</span>
                    </div>
                    {eco.disabled && (
                      <span className="text-[10px] bg-gray-100 text-gray-400 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Soon
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <nav className="px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-290px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id || (item.id === 'pond' && activePage === 'farm');
            const showBadge = item.id === 'notifications' && unreadCount > 0;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white shadow-md font-bold'
                    : 'text-font-dark hover:bg-cyan-50/60 font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-primary'}`} />
                <span className="text-sm flex-1 truncate">{item.label}</span>
                {showBadge && (
                  <span className="text-[10px] font-black bg-red-500 text-white px-2 py-0.5 rounded-full min-w-[20px] text-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-cyan-100/60 bg-white/30">
        {activeProfile ? (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-font-light truncate font-semibold">
                {activeProfile.email || activeProfile.phone || 'Authenticated'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer shrink-0"
              title={t('logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-xs text-font-light font-medium mb-2">{t('please_login')}</p>
            <button
              onClick={() => setActivePage('profile')}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary-hover shadow transition-all duration-200 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>{t('login')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export type { Ecosystem, Page };
