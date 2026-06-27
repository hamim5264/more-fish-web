// H:\DMA Hamim\DMA-Web-App\src\App.tsx
import { useState, useEffect, Fragment } from 'react';
import { LanguageProvider, useLang } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { IoTMonitoring } from './components/IoTMonitoring';
import { Automation } from './components/Automation';
import { DiseaseDetector } from './components/DiseaseDetector';
import { FCRCalculator } from './components/FCRCalculator';
import { FarmManagement } from './components/FarmManagement';
import { FeedManagement } from './components/FeedManagement';
import { NanoBubble } from './components/NanoBubble';
import { AutoAerator } from './components/AutoAerator';
import { CattleCare } from './components/CattleCare';
import { PoultryCare } from './components/PoultryCare';
import { Marketplace } from './components/Marketplace';
import { Training } from './components/Training';
import { Settings } from './components/Settings';
import { ViewSettings } from './components/ViewSettings';
import { NotificationList } from './components/NotificationList';
import { Auth } from './components/Auth';
import { WeatherForecast } from './components/WeatherForecast';
import { EmergencyService } from './components/EmergencyService';
import { InfoPage } from './components/InfoPage';
import { LiveConsultancy } from './components/LiveConsultancy';
import { AutoFeeder } from './components/AutoFeeder';
import { SmartKhamari } from './components/SmartKhamari';
import { FiltrationSystem } from './components/FiltrationSystem';
import { ComingSoon } from './components/ComingSoon';
import { LogOut } from 'lucide-react';
import dmaLogo from './assets/DMA Logo.png';
import poultryCareLogo from './assets/poultry care.png';
import cattleCareLogo from './assets/cattle care.png';
import type { Ecosystem, Page } from './types/navigation';
import {
  ecosystemToAuthFlow,
  ecosystemToAquacultureFlow,
} from './types/navigation';
import type { AquacultureFlow } from './types/aquaculture';

function AppInner() {
  const [activeEcosystem, setActiveEcosystem] = useState<Ecosystem>('fish');
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [isAddingProfile, setIsAddingProfile] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [fadeSplash, setFadeSplash] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { tokens, profiles, logout, allProfiles, switchProfile, logoutProfile, viewMode } = useAuth();
  const { t } = useLang();

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeSplash(true);
    }, 2000);
    const removeTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  const aquacultureFlow: AquacultureFlow | null = ecosystemToAquacultureFlow(activeEcosystem);
  const authFlow = ecosystemToAuthFlow(activeEcosystem);

  const handleLogout = () => {
    if (authFlow) {
      logout(authFlow);
      setActivePage('dashboard');
    }
  };

  const renderProfile = () => {
    if (!authFlow) return null;
    
    if (isAddingProfile) {
      return (
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center bg-linear-to-tr from-bg-light/10 to-cyan-50/10 select-none relative">
          <button
            onClick={() => setIsAddingProfile(false)}
            className="absolute top-6 left-6 px-5 py-2.5 bg-white border border-cyan-200 hover:bg-cyan-50 text-primary font-black text-sm rounded-xl shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
          >
            ← Back to Profiles
          </button>
          <Auth flow={authFlow} onSuccess={() => {
            setIsAddingProfile(false);
            setActivePage('profile');
          }} />
        </div>
      );
    }

    const profile = profiles[authFlow];
    if (!profile) {
      return (
        <Auth flow={authFlow} onSuccess={() => setActivePage('profile')} />
      );
    }

    const flowProfiles = allProfiles[authFlow] || [];

    return (
      <div className="flex-1 overflow-y-auto p-6 bg-linear-to-tr from-bg-light/10 to-cyan-50/10 select-none max-w-5xl mx-auto w-full flex flex-col justify-center">
        <h2 className="text-2xl font-black text-font-dark mb-6">User Profiles Management</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Active Profile Details Card */}
          <div className="bg-white border border-cyan-100 rounded-3xl p-8 shadow-sm space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 border-b border-cyan-50 pb-3">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <h4 className="font-black text-sm text-emerald-600 uppercase tracking-wide">Active Session</h4>
            </div>

            <div className="flex flex-col items-center border-b border-cyan-50 pb-5">
              <div className="w-20 h-20 rounded-full bg-linear-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-white font-extrabold text-2xl uppercase shadow-md mb-3">
                {profile.first_name ? profile.first_name.slice(0, 2) : 'US'}
              </div>
              <h3 className="text-lg font-black text-font-dark">{profile.first_name} {profile.last_name}</h3>
              <span className="text-[10px] font-bold bg-cyan-100 text-primary px-3 py-0.5 rounded-full uppercase tracking-wider mt-1">
                {profile.user_type || 'Farmer'}
              </span>
            </div>

            <div className="space-y-3 font-semibold text-sm leading-normal">
              <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                <span className="text-xs text-font-light font-medium">Email Address</span>
                <span className="text-font-dark">{profile.email || 'None'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                <span className="text-xs text-font-light font-medium">Phone Number</span>
                <span className="text-font-dark">{profile.phone || 'None'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                <span className="text-xs text-font-light font-medium">
                  {activeEcosystem === 'pharma' ? 'Asset Address' : 'Farm Address'}
                </span>
                <span className="text-font-dark">{profile.address || 'None'}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-3.5 bg-red-50 hover:bg-red-100 text-red-500 font-black text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout Active Session</span>
            </button>
          </div>

          {/* Manage Profiles Switcher Card */}
          <div className="bg-white border border-cyan-100 rounded-3xl p-8 shadow-sm space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <h4 className="font-black text-lg text-font-dark border-b border-cyan-50 pb-3">Available Profiles</h4>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {flowProfiles.map((p, idx) => {
                const isActive = p.email === profile.email;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (!isActive) switchProfile(authFlow, idx);
                    }}
                    className={`p-4 border rounded-2xl flex items-center justify-between transition-all shadow-xs ${
                      (isActive || viewMode === 'multiple') 
                        ? 'border-primary bg-cyan-50/20' 
                        : 'border-cyan-100 bg-white hover:bg-cyan-50/10 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm uppercase shadow-xs ${
                        (isActive || viewMode === 'multiple') ? 'bg-primary' : 'bg-font-light/50'
                      }`}>
                        {p.first_name ? p.first_name.slice(0, 2) : 'US'}
                      </div>
                      <div className="text-left">
                        <h5 className={`font-black text-sm ${(isActive || viewMode === 'multiple') ? 'text-primary' : 'text-font-dark'}`}>
                          {p.first_name} {p.last_name}
                        </h5>
                        <p className="text-[11px] text-font-light font-bold">{p.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {(isActive || viewMode === 'multiple') && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
                          Active
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          logoutProfile(authFlow, idx);
                        }}
                        className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                        title="Log out profile"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {flowProfiles.length === 0 && (
                <p className="text-xs text-font-light text-center py-6 font-semibold">No profiles found.</p>
              )}
            </div>

            <button
              onClick={() => setIsAddingProfile(true)}
              className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-black text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>+ Add Another Profile</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const requiresLogin: Page[] = [
    'iot', 'automation', 'disease', 'disease-treatment', 'notifications', 'fcr', 'marketplace', 'nano-bubble', 'auto-aerator', 'auto-feeder',
  ];

  const renderAquaculturePage = (flow: AquacultureFlow, page: Page, tokenOverride?: string, userIdOverride?: string) => {
    const token = tokenOverride || (flow === 'pharma' ? tokens.pharma : tokens.fish) || undefined;
    if (requiresLogin.includes(page) && !token) {
      return <Auth flow={flow} onSuccess={() => setActivePage('dashboard')} />;
    }

    switch (page) {
      case 'dashboard':
        return <Dashboard onNavigate={setActivePage} flow={flow} token={token} userId={userIdOverride} />;
      case 'iot':
        return <IoTMonitoring flow={flow} token={token} userId={userIdOverride} />;
      case 'automation':
        return <Automation flow={flow} token={token} userId={userIdOverride} />;
      case 'auto-aerator':
        return <AutoAerator flow={flow} token={token} userId={userIdOverride} />;
      case 'disease':
        return <DiseaseDetector flow={flow} token={token} userId={userIdOverride} />;
      case 'disease-treatment':
        return <DiseaseDetector flow={flow} defaultTab="guide" token={token} userId={userIdOverride} />;
      case 'fcr':
        return <FCRCalculator flow={flow} token={token} userId={userIdOverride} />;
      case 'pond':
      case 'farm':
        return <FarmManagement flow={flow} token={token} userId={userIdOverride} />;
      case 'fish-farm-marketplace':
        return <Marketplace flow={flow} categoryName="Fish Farming Equipment" token={token} userId={userIdOverride} />;
      case 'fingerlings-marketplace':
        return <Marketplace flow={flow} categoryGuid="ce86362d-828c-4c81-a644-72d6c27c7e13" categoryName="Fingerlings" token={token} userId={userIdOverride} />;
      case 'grown-fish-sell':
        return <Marketplace flow={flow} categoryGuid="08a69b99-9d57-4097-afc0-b38f49f5318d" categoryName="Grown Fish" token={token} userId={userIdOverride} />;
      case 'fish-medicine-enzyme':
        return <Marketplace flow={flow} categoryName="Fish Medicine" token={token} userId={userIdOverride} />;
      case 'marketplace':
        return <Marketplace flow={flow} categoryName="Fish Feed" token={token} userId={userIdOverride} />;
      case 'training':
        return <Training />;
      case 'weather-forecast':
        return <WeatherForecast />;
      case 'emergency-service':
        return <EmergencyService />;
      case 'faq':
        return <InfoPage type="faq" />;
      case 'about-app':
        return <InfoPage type="about-app" />;
      case 'about-device':
        return <InfoPage type="about-device" />;
      case 'feed-management':
        return <FeedManagement flow={flow} token={token} userId={userIdOverride} />;
      case 'nano-bubble':
        return <NanoBubble flow={flow} token={token} userId={userIdOverride} />;
      case 'live-consultancy':
        return <LiveConsultancy />;
      case 'auto-feeder':
        return <AutoFeeder flow={flow} token={token} userId={userIdOverride} />;
      case 'smart-khamari':
        return <SmartKhamari />;
      case 'filtration':
        return <FiltrationSystem />;
      default:
        return <Dashboard onNavigate={setActivePage} flow={flow} token={token} userId={userIdOverride} />;
    }
  };

  const renderEcosystemPage = (tokenOverride?: string, userIdOverride?: string) => {
    if (aquacultureFlow) {
      return renderAquaculturePage(aquacultureFlow, activePage, tokenOverride, userIdOverride);
    }

    if (activeEcosystem === 'fish') {
      return renderAquaculturePage('fish', activePage, tokenOverride, userIdOverride);
    }

    if (activeEcosystem === 'cattle') {
      switch (activePage) {
        case 'dashboard':
        case 'iot':
          return <CattleCare token={tokenOverride} userId={userIdOverride} />;
        case 'automation':
          return <Automation flow="cattle" token={tokenOverride} userId={userIdOverride} />;
        case 'pond':
        case 'farm':
          return <ComingSoon title={t('farm_management') || "Farm Management"} logo={cattleCareLogo} isCattle={true} />;
        case 'feed-management':
          return <ComingSoon title={t('feed_management') || "Feed Management"} logo={cattleCareLogo} isCattle={true} />;
        case 'disease-treatment':
          return <ComingSoon title={t('cattle_disease_treatment') || "Cattle Disease Treatment"} logo={cattleCareLogo} isCattle={true} />;
        case 'cattle-marketplace':
          return <ComingSoon title={t('cattle_marketplace') || "Cattle Marketplace"} logo={cattleCareLogo} isCattle={true} />;
        case 'cattle-feed-marketplace':
          return <ComingSoon title={t('cattle_feed_marketplace') || "Cattle Feed Marketplace"} logo={cattleCareLogo} isCattle={true} />;
        case 'auto-feeder':
          return <ComingSoon title={t('auto_feeder') || "Auto Feeder"} logo={cattleCareLogo} isCattle={true} />;
        case 'weather-forecast':
          return <ComingSoon title={t('weather_forecast') || "Weather Forecast"} logo={cattleCareLogo} isCattle={true} />;
        case 'live-consultancy':
          return <ComingSoon title={t('live_consultancy') || "Live Consultancy"} logo={cattleCareLogo} isCattle={true} />;
        case 'auto-water-system':
          return <ComingSoon title={t('auto_water_system') || "Auto Water System"} logo={cattleCareLogo} isCattle={true} />;
        case 'financial-management':
          return <ComingSoon title={t('financial_management') || "Financial Management"} logo={cattleCareLogo} isCattle={true} />;
        case 'faq':
          return <InfoPage type="faq" />;
        case 'about-app':
          return <InfoPage type="about-app" />;
        case 'about-device':
          return <InfoPage type="about-device" />;
        default:
          return <CattleCare token={tokenOverride} userId={userIdOverride} />;
      }
    }

    if (activeEcosystem === 'poultry') {
      switch (activePage) {
        case 'dashboard':
        case 'iot':
          return <PoultryCare token={tokenOverride} userId={userIdOverride} />;
        case 'automation':
          return <Automation flow="poultry" token={tokenOverride} userId={userIdOverride} />;
        case 'pond':
        case 'farm':
          return <ComingSoon title={t('farm_management') || "Farm Management"} logo={poultryCareLogo} isPoultry={true} />;
        case 'feed-management':
          return <ComingSoon title={t('feed_management') || "Feed Management"} logo={poultryCareLogo} isPoultry={true} />;
        case 'disease-treatment':
          return <ComingSoon title={t('poultry_disease_treatment') || "Poultry Disease Treatment"} logo={poultryCareLogo} isPoultry={true} />;
        case 'chicks-marketplace':
          return <ComingSoon title={t('chicks_marketplace') || "Chicks Marketplace"} logo={poultryCareLogo} isPoultry={true} />;
        case 'poultry-feed-marketplace':
          return <ComingSoon title={t('poultry_feed_marketplace') || "Poultry Feed Marketplace"} logo={poultryCareLogo} isPoultry={true} />;
        case 'auto-feeder':
          return <ComingSoon title={t('auto_feeder') || "Auto Feeder"} logo={poultryCareLogo} isPoultry={true} />;
        case 'weather-forecast':
          return <ComingSoon title={t('weather_forecast') || "Weather Forecast"} logo={poultryCareLogo} isPoultry={true} />;
        case 'live-consultancy':
          return <ComingSoon title={t('live_consultancy') || "Live Consultancy"} logo={poultryCareLogo} isPoultry={true} />;
        case 'auto-water-system':
          return <ComingSoon title={t('auto_water_system') || "Auto Water System"} logo={poultryCareLogo} isPoultry={true} />;
        case 'financial-management':
          return <ComingSoon title={t('financial_management') || "Financial Management"} logo={poultryCareLogo} isPoultry={true} />;
        case 'faq':
          return <InfoPage type="faq" />;
        case 'about-app':
          return <InfoPage type="about-app" />;
        case 'about-device':
          return <InfoPage type="about-device" />;
        default:
          return <PoultryCare token={tokenOverride} userId={userIdOverride} />;
      }
    }

    return <Dashboard onNavigate={setActivePage} />;
  };

  const renderPage = () => {
    const currentToken = authFlow ? tokens[authFlow] : null;

    if (requiresLogin.includes(activePage) && authFlow && !currentToken) {
      return <Auth flow={authFlow} onSuccess={() => setActivePage('dashboard')} />;
    }

    if (activePage === 'profile') {
      return renderProfile();
    }

    if (activePage === 'notifications') {
      return <NotificationList activeEcosystem={activeEcosystem} />;
    }

    if (activePage === 'settings') {
      return <Settings activeEcosystem={activeEcosystem} />;
    }

    if (activePage === 'view-settings') {
      return <ViewSettings />;
    }

    const MULTIPLE_VIEW_PAGES = [
      'iot', 'automation', 'auto-aerator', 'auto-feeder', 'fcr', 'nano-bubble', 'filtration'
    ];

    const currentAuthFlow = authFlow || (activeEcosystem === 'cattle' ? 'cattle' : activeEcosystem === 'poultry' ? 'poultry' : null);
    const sessions = currentAuthFlow ? (allProfiles[currentAuthFlow] || []) : [];

    if ((viewMode === 'multiple' || viewMode === 'grid') && MULTIPLE_VIEW_PAGES.includes(activePage) && sessions.length > 0) {
      const isGrid = viewMode === 'grid';
      return (
        <div className={`flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 bg-linear-to-tr from-bg-light/10 to-cyan-50/10 ${
          isGrid ? 'grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 space-y-0 view-mode-grid' : 'space-y-4 lg:space-y-8'
        }`}>
          {sessions.map((session, index) => {
            const displayName = session.first_name 
              ? `${session.first_name} ${session.last_name || ''}`.trim()
              : session.email || `Session ${index + 1}`;
            return (
              <Fragment key={session.token + index}>
                <div className={`bg-white/70 relative border border-cyan-100/60 shadow-sm transition-all ${
                  isGrid 
                    ? 'rounded-2xl p-2.5 sm:p-3 lg:p-4 space-y-3' 
                    : 'rounded-3xl lg:rounded-4xl p-3 sm:p-4 lg:p-6 space-y-4 lg:space-y-6'
                }`}>
                  <div className={`flex items-center justify-between bg-gradient-to-r from-cyan-50 to-blue-50/50 border border-cyan-100 shadow-xs ${
                    isGrid 
                      ? 'px-3 py-2 rounded-xl' 
                      : 'px-4 py-3 lg:px-6 lg:py-4 rounded-2xl lg:rounded-3xl'
                  }`}>
                    <div className="flex items-center gap-2 lg:gap-3">
                      <div className={`rounded-full bg-primary flex items-center justify-center text-white font-extrabold shadow-sm ${
                        isGrid ? 'w-7 h-7 text-[10px]' : 'w-8 h-8 lg:w-10 lg:h-10 text-xs lg:text-sm'
                      }`}>
                        {displayName.slice(0, 2)}
                      </div>
                      <div>
                        <h4 className={`font-black text-font-dark leading-tight ${isGrid ? 'text-xs' : 'text-xs lg:text-sm'}`}>{displayName}</h4>
                        <p className={`font-bold text-font-light uppercase ${isGrid ? 'text-[8.5px]' : 'text-[9px] lg:text-[10px]'}`}>Account Profile #{index + 1} ({session.email})</p>
                      </div>
                    </div>
                    <span className={`font-black uppercase rounded-full bg-cyan-100 text-primary border border-cyan-200 ${
                      isGrid ? 'text-[8px] px-1.5 py-0.2' : 'text-[9px] lg:text-[10px] px-2 py-0.5 lg:px-3 lg:py-1'
                    }`}>
                      {session.user_type || 'Farmer'}
                    </span>
                  </div>
                  <div className="p-0.5 lg:p-1 rounded-3xl bg-transparent">
                    {renderEcosystemPage(session.token, session.userId)}
                  </div>
                </div>
                {!isGrid && index < sessions.length - 1 && (
                  <hr className="border-t-2 border-cyan-100/70 my-4 lg:my-8" />
                )}
              </Fragment>
            );
          })}
        </div>
      );
    }

    return renderEcosystemPage();
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden bg-transparent relative ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {showSplash && (
        <div 
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#008cb2] to-[#00A8D5] transition-opacity duration-500 ease-in-out select-none ${
            fadeSplash ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -left-16 -top-16 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl animate-pulse" />
            <div className="absolute -right-16 -bottom-16 h-80 w-80 rounded-full bg-blue-300/10 blur-3xl animate-pulse" />
          </div>
          <div className="relative flex flex-col items-center space-y-6 text-center animate-in fade-in zoom-in-95 duration-700">
            <div className="flex h-44 w-44 items-center justify-center rounded-[32px] border-4 border-white/25 bg-white/95 p-6 shadow-2xl backdrop-blur-md transform hover:scale-105 transition-transform duration-300">
              <img src={dmaLogo} alt="DMA Logo" className="h-full w-full object-contain animate-pulse" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-white tracking-widest uppercase">DMA Technologies</h1>
              <p className="text-sm font-bold tracking-[0.15em] text-cyan-200/80">Harmonising Nature with Technology</p>
            </div>
            <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
              <div className="absolute top-0 bottom-0 left-0 bg-white rounded-full w-1/3 animate-[shimmer_1.5s_infinite_linear]" style={{
                animationName: 'loading-bar',
                animationDuration: '1.5s',
                animationIterationCount: 'infinite',
              }} />
            </div>
          </div>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes loading-bar {
              0% { left: -30%; width: 30%; }
              50% { width: 40%; }
              100% { left: 100%; width: 30%; }
            }
          `}} />
        </div>
      )}

      <Sidebar
        activeEcosystem={activeEcosystem}
        setActiveEcosystem={setActiveEcosystem}
        activePage={activePage}
        setActivePage={setActivePage}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header activeEcosystem={activeEcosystem} onNavigate={setActivePage} />
        <main className={`flex-1 overflow-hidden flex flex-col ${activeEcosystem === 'poultry' ? 'bg-[#ebffff]' : ''}`}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <NotificationProvider>
          <AppInner />
        </NotificationProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
