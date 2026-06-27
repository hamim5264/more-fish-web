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
  Lock,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import dmaLogo from '../assets/DMA Logo.png';
import pharmaLogo from '../assets/dma_pharmaceutical.png';
import dmaMoreFishLogo from '../assets/dma_more_fish.png';
import poultryCareLogo from '../assets/poultry care.png';
import cattleCareLogo from '../assets/cattle care.png';
import type { Ecosystem, Page } from '../types/navigation';
import { ecosystemToAuthFlow } from '../types/navigation';

interface SidebarProps {
  activeEcosystem: Ecosystem;
  setActiveEcosystem: (eco: Ecosystem) => void;
  activePage: Page;
  setActivePage: (page: Page) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
}

type MenuItem = { id: Page; label: string; icon: React.ComponentType<{ className?: string }> };

export const Sidebar: React.FC<SidebarProps> = ({
  activeEcosystem,
  setActiveEcosystem,
  activePage,
  setActivePage,
  isCollapsed = false,
  setIsCollapsed,
}) => {
  const { t } = useLang();
  const { profiles, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [ecoDropdownOpen, setEcoDropdownOpen] = useState(false);

  const ecosystems = [
    { id: 'fish', name: 'More Fish', icon: Layers, color: 'text-teal-500' },
    { id: 'pharma', name: 'Pharma Care', icon: Activity, color: 'text-emerald-500' },
    { id: 'cattle', name: 'Cattle Care', icon: Thermometer, color: 'text-amber-500' },
    { id: 'poultry', name: 'Poultry Care', icon: Wind, color: 'text-orange-500' },
    { id: 'beverage', name: 'Food & Beverage', icon: Grid, color: 'text-blue-500', disabled: true },
    { id: 'tex', name: 'Tex Care', icon: Grid, color: 'text-purple-500', disabled: true },
    { id: 'air', name: 'Air Care', icon: Wind, color: 'text-sky-500', disabled: true },
    { id: 'crop', name: 'Crop Care', icon: Grid, color: 'text-green-500', disabled: true },
  ];

  const currentEco = ecosystems.find((e) => e.id === activeEcosystem) || ecosystems[0];
  const brandLogo = 
    activeEcosystem === 'pharma' ? pharmaLogo :
    activeEcosystem === 'poultry' ? poultryCareLogo :
    activeEcosystem === 'cattle' ? cattleCareLogo :
    activeEcosystem === 'fish' ? dmaMoreFishLogo :
    dmaLogo;

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
      { id: 'settings', label: t('change_password'), icon: Lock },
      { id: 'view-settings', label: t('view_settings'), icon: Eye },
    ];
  };

  const getMenuItems = (): MenuItem[] => {
    if (activeEcosystem === 'fish') return getAquacultureMenuItems(false);
    if (activeEcosystem === 'pharma') return getAquacultureMenuItems(true);

    const commonItems: MenuItem[] = [
      { id: 'profile', label: t('profile'), icon: User },
      { id: 'notifications', label: t('notifications'), icon: Bell },
      { id: 'settings', label: t('change_password'), icon: Lock },
      { id: 'view-settings', label: t('view_settings'), icon: Eye },
    ];

    if (activeEcosystem === 'poultry') {
      return [
        { id: 'iot', label: t('live_data_monitoring') || 'Live Data Monitoring', icon: Activity },
        { id: 'pond', label: t('farm_management') || 'Farm Management', icon: Layers },
        { id: 'feed-management', label: t('feed_management') || 'Feed Management', icon: Utensils },
        { id: 'disease-treatment', label: t('poultry_disease_treatment') || 'Poultry Disease Treatment', icon: BookOpen },
        { id: 'chicks-marketplace', label: t('chicks_marketplace') || 'Chicks Marketplace', icon: Store },
        { id: 'poultry-feed-marketplace', label: t('poultry_feed_marketplace') || 'Poultry Feed Marketplace', icon: Store },
        { id: 'auto-feeder', label: t('auto_feeder') || 'Auto Feeder', icon: Radio },
        { id: 'weather-forecast', label: t('weather_forecast') || 'Weather Forecast', icon: CloudSun },
        { id: 'live-consultancy', label: t('live_consultancy') || 'Live Consultancy', icon: Video },
        { id: 'auto-water-system', label: t('auto_water_system') || 'Auto Water System', icon: Waves },
        { id: 'financial-management', label: t('financial_management') || 'Financial Management', icon: Calculator },
        { id: 'automation', label: t('automation_settings_menu') || 'Automation', icon: Settings },
        { id: 'notifications', label: t('notifications'), icon: Bell },
        { id: 'profile', label: t('profile'), icon: User },
        { id: 'faq', label: t('faq_menu') || 'FAQ', icon: HelpCircle },
        { id: 'about-app', label: t('about_app_menu') || 'About App', icon: BookOpen },
        { id: 'about-device', label: t('about_device_menu') || 'About Device', icon: Cpu },
        { id: 'settings', label: t('change_password'), icon: Lock },
        { id: 'view-settings', label: t('view_settings'), icon: Eye },
      ];
    }

    if (activeEcosystem === 'cattle') {
      return [
        { id: 'iot', label: t('live_data_monitoring') || 'Live Data Monitoring', icon: Activity },
        { id: 'pond', label: t('farm_management') || 'Farm Management', icon: Layers },
        { id: 'feed-management', label: t('feed_management') || 'Feed Management', icon: Utensils },
        { id: 'disease-treatment', label: t('cattle_disease_treatment') || 'Cattle Disease Treatment', icon: BookOpen },
        { id: 'cattle-marketplace', label: t('cattle_marketplace') || 'Cattle Marketplace', icon: Store },
        { id: 'cattle-feed-marketplace', label: t('cattle_feed_marketplace') || 'Cattle Feed Marketplace', icon: Store },
        { id: 'auto-feeder', label: t('auto_feeder') || 'Auto Feeder', icon: Radio },
        { id: 'weather-forecast', label: t('weather_forecast') || 'Weather Forecast', icon: CloudSun },
        { id: 'live-consultancy', label: t('live_consultancy') || 'Live Consultancy', icon: Video },
        { id: 'auto-water-system', label: t('auto_water_system') || 'Auto Water System', icon: Waves },
        { id: 'financial-management', label: t('financial_management') || 'Financial Management', icon: Calculator },
        { id: 'automation', label: t('automation_settings_menu') || 'Automation', icon: Settings },
        { id: 'notifications', label: t('notifications'), icon: Bell },
        { id: 'profile', label: t('profile'), icon: User },
        { id: 'faq', label: t('faq_menu') || 'FAQ', icon: HelpCircle },
        { id: 'about-app', label: t('about_app_menu') || 'About App', icon: BookOpen },
        { id: 'about-device', label: t('about_device_menu') || 'About Device', icon: Cpu },
        { id: 'settings', label: t('change_password'), icon: Lock },
        { id: 'view-settings', label: t('view_settings'), icon: Eye },
      ];
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
    <div className={`h-full bg-gradient-to-b from-[#f0fdfa] via-sky-50/60 to-blue-50/70 border-r border-sky-100/90 flex flex-col justify-between shrink-0 shadow-xl select-none text-font-dark transition-all duration-300 relative ${isCollapsed ? 'w-20' : 'w-76'}`}>
      {setIsCollapsed && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-4 top-8 z-[60] w-8 h-8 bg-white border border-sky-100 rounded-full flex items-center justify-center text-primary shadow-md hover:bg-sky-50 transition-all cursor-pointer hover:scale-105"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      )}

      <div className="flex flex-col min-h-0 flex-1">
        <div className={`flex items-center border-b border-sky-100/60 bg-white/60 shrink-0 transition-all duration-300 ${isCollapsed ? 'p-3.5 justify-center' : 'p-6 gap-3'}`}>
          <div className={`rounded-2xl bg-white flex items-center justify-center shadow-md border border-cyan-100/95 shrink-0 transition-all duration-300 ${isCollapsed ? 'w-10 h-10 p-1.5' : 'w-14 h-12 p-2'}`}>
            <img src={brandLogo} alt="DMA Technologies" className="h-full w-full object-contain" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="font-black text-[24px] text-primary leading-tight tracking-wide break-words">
                DMA <br /> Technologies
              </div>
              <p className="text-[9.5px] text-font-light font-bold tracking-wide mt-0.5">Harmonising Nature with Technology</p>
            </div>
          )}
        </div>

        <div className={`transition-all duration-300 relative shrink-0 ${isCollapsed ? 'p-3.5 flex justify-center' : 'p-4'}`}>
          <button
            onClick={() => setEcoDropdownOpen(!ecoDropdownOpen)}
            className={`flex items-center bg-white/90 hover:bg-white rounded-2xl border border-sky-100/80 shadow-sm transition-all duration-200 cursor-pointer text-font-dark ${isCollapsed ? 'p-2.5 justify-center w-10 h-10' : 'w-full p-4 justify-between'}`}
            title={isCollapsed ? currentEco.name : undefined}
          >
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
              <currentEco.icon className={`w-6 h-6 shrink-0 ${currentEco.color}`} />
              {!isCollapsed && <span className="font-extrabold text-base text-font-dark">{currentEco.name}</span>}
            </div>
            {!isCollapsed && (
              <ChevronDown
                className={`w-5 h-5 text-font-light transition-transform duration-200 ${ecoDropdownOpen ? 'rotate-180' : ''}`}
              />
            )}
          </button>

          {ecoDropdownOpen && (
            <div className={`absolute bg-white/95 backdrop-blur-md border border-cyan-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 ${isCollapsed ? 'left-16 top-0 w-48' : 'left-4 right-4 top-full mt-2'}`}>
              <div className="py-1.5">
                {ecosystems.map((eco) => (
                  <button
                    key={eco.id}
                    disabled={eco.disabled}
                    onClick={() => handleEcosystemSelect(eco.id as Ecosystem)}
                    className={`w-full flex items-center justify-between px-5 py-4 text-left hover:bg-cyan-50 transition-colors duration-150 border-b border-gray-50 last:border-0 ${
                      eco.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                    } ${activeEcosystem === eco.id ? 'bg-cyan-50 font-extrabold' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <eco.icon className={`w-5 h-5 ${eco.color}`} />
                      <span className="text-base text-font-dark font-semibold">{eco.name}</span>
                    </div>
                    {eco.disabled && !isCollapsed && (
                      <span className="text-[11px] bg-gray-100 text-gray-400 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Soon
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <nav className="px-3 pb-4 space-y-1.5 overflow-y-auto flex-1 scrollbar-thin">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id || (item.id === 'pond' && activePage === 'farm');
            const showBadge = item.id === 'notifications' && unreadCount > 0;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center rounded-2xl text-left transition-all duration-200 cursor-pointer hover:scale-[1.01] relative ${isCollapsed ? 'w-10 h-10 p-0 justify-center mx-auto' : 'w-full gap-3.5 px-4.5 py-3.5'} ${
                  isActive
                    ? 'bg-[#00A8D5] text-white shadow-lg shadow-[#00A8D5]/20 font-black'
                    : 'text-font-dark hover:bg-cyan-50/70 font-bold'
                }`}
              >
                <Icon className={`w-6 h-6 shrink-0 ${isActive ? 'text-white' : 'text-primary'}`} />
                {!isCollapsed && <span className="text-[15px] flex-1 truncate">{item.label}</span>}
                {showBadge && (
                  isCollapsed ? (
                    <span className="absolute top-1 right-1 flex h-2.5 w-2.5 rounded-full bg-red-500 border border-white shadow-sm" />
                  ) : (
                    <span className="text-xs font-black bg-red-500 text-white px-2.5 py-1 rounded-full min-w-[24px] text-center shadow-sm">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className={`border-t border-sky-100/80 bg-white/60 shrink-0 transition-all duration-300 ${isCollapsed ? 'p-3.5 flex justify-center' : 'p-5'}`}>
        {activeProfile ? (
          isCollapsed ? (
            <button
              onClick={handleLogout}
              className="p-2.5 hover:bg-red-50 text-red-500 rounded-xl transition-colors cursor-pointer shrink-0 shadow-sm border border-red-100"
              title={t('logout')}
            >
              <LogOut className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-font-dark truncate font-bold">
                  {activeProfile.email || activeProfile.phone || 'Authenticated'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2.5 hover:bg-red-50 text-red-500 rounded-xl transition-colors cursor-pointer shrink-0 shadow-sm border border-red-100"
                title={t('logout')}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )
        ) : (
          isCollapsed ? (
            <button
              onClick={() => setActivePage('profile')}
              className="w-10 h-10 flex items-center justify-center bg-[#00A8D5] text-white rounded-xl hover:opacity-90 shadow-md transition-all duration-200 cursor-pointer"
              title={t('login')}
            >
              <User className="w-5 h-5" />
            </button>
          ) : (
            <div className="text-center py-2">
              <p className="text-xs text-font-light font-bold mb-3">{t('please_login')}</p>
              <button
                onClick={() => setActivePage('profile')}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-5 bg-[#00A8D5] text-white font-extrabold text-sm rounded-2xl hover:opacity-90 shadow-md transition-all duration-200 cursor-pointer"
              >
                <User className="w-5 h-5" />
                <span>{t('login')}</span>
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export type { Ecosystem, Page };
