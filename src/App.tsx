// H:\DMA Hamim\DMA-Web-App\src\App.tsx
import { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
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
import { NotificationList } from './components/NotificationList';
import { Auth } from './components/Auth';
import { WeatherForecast } from './components/WeatherForecast';
import { EmergencyService } from './components/EmergencyService';
import { InfoPage } from './components/InfoPage';
import { LiveConsultancy } from './components/LiveConsultancy';
import { AutoFeeder } from './components/AutoFeeder';
import { SmartKhamari } from './components/SmartKhamari';
import { FiltrationSystem } from './components/FiltrationSystem';
import { LogOut } from 'lucide-react';
import type { Ecosystem, Page } from './types/navigation';
import {
  ecosystemToAuthFlow,
  ecosystemToAquacultureFlow,
} from './types/navigation';
import type { AquacultureFlow } from './types/aquaculture';

function AppInner() {
  const [activeEcosystem, setActiveEcosystem] = useState<Ecosystem>('fish');
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const { tokens, profiles, logout } = useAuth();

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
    const profile = profiles[authFlow];
    if (!profile) {
      return (
        <Auth flow={authFlow} onSuccess={() => setActivePage('dashboard')} />
      );
    }

    return (
      <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center bg-linear-to-tr from-bg-light/10 to-cyan-50/10 select-none">
        <div className="w-full max-w-md bg-white border border-cyan-100 rounded-3xl p-8 shadow-sm space-y-6 animate-in fade-in zoom-in-95 duration-200">
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
            className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-500 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout from Session</span>
          </button>
        </div>
      </div>
    );
  };

  const requiresLogin: Page[] = [
    'iot', 'automation', 'disease', 'disease-treatment', 'notifications', 'fcr', 'marketplace', 'nano-bubble', 'auto-aerator', 'auto-feeder',
  ];

  const renderAquaculturePage = (flow: AquacultureFlow, page: Page) => {
    const token = flow === 'pharma' ? tokens.pharma : tokens.fish;
    if (requiresLogin.includes(page) && !token) {
      return <Auth flow={flow} onSuccess={() => setActivePage('dashboard')} />;
    }

    switch (page) {
      case 'dashboard':
        return <Dashboard onNavigate={setActivePage} flow={flow} />;
      case 'iot':
        return <IoTMonitoring flow={flow} />;
      case 'automation':
        return <Automation flow={flow} />;
      case 'auto-aerator':
        return <AutoAerator flow={flow} />;
      case 'disease':
        return <DiseaseDetector flow={flow} />;
      case 'disease-treatment':
        return <DiseaseDetector flow={flow} defaultTab="guide" />;
      case 'fcr':
        return <FCRCalculator flow={flow} />;
      case 'pond':
      case 'farm':
        return <FarmManagement flow={flow} />;
      case 'fish-farm-marketplace':
        return <Marketplace flow={flow} categoryName="Fish Farming Equipment" />;
      case 'fingerlings-marketplace':
        return <Marketplace flow={flow} categoryGuid="ce86362d-828c-4c81-a644-72d6c27c7e13" categoryName="Fingerlings" />;
      case 'grown-fish-sell':
        return <Marketplace flow={flow} categoryGuid="08a69b99-9d57-4097-afc0-b38f49f5318d" categoryName="Grown Fish" />;
      case 'fish-medicine-enzyme':
        return <Marketplace flow={flow} categoryName="Fish Medicine" />;
      case 'marketplace':
        return <Marketplace flow={flow} categoryName="Fish Feed" />;
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
        return <FeedManagement flow={flow} />;
      case 'nano-bubble':
        return <NanoBubble flow={flow} />;
      case 'live-consultancy':
        return <LiveConsultancy />;
      case 'auto-feeder':
        return <AutoFeeder flow={flow} />;
      case 'smart-khamari':
        return <SmartKhamari />;
      case 'filtration':
        return <FiltrationSystem />;
      default:
        return <Dashboard onNavigate={setActivePage} flow={flow} />;
    }
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

    if (aquacultureFlow) {
      return renderAquaculturePage(aquacultureFlow, activePage);
    }

    if (activeEcosystem === 'fish') {
      return renderAquaculturePage('fish', activePage);
    }

    if (activeEcosystem === 'cattle') {
      switch (activePage) {
        case 'dashboard':
        case 'iot':
        case 'automation':
          return <CattleCare />;
        case 'fcr':
          return <FCRCalculator />;
        case 'pond':
        case 'farm':
          return <FarmManagement />;
        case 'marketplace':
          return <Marketplace />;
        case 'training':
          return <Training />;
        default:
          return <CattleCare />;
      }
    }

    if (activeEcosystem === 'poultry') {
      switch (activePage) {
        case 'dashboard':
        case 'iot':
        case 'automation':
          return <PoultryCare />;
        case 'fcr':
          return <FCRCalculator />;
        case 'pond':
        case 'farm':
          return <FarmManagement />;
        case 'marketplace':
          return <Marketplace />;
        case 'training':
          return <Training />;
        default:
          return <PoultryCare />;
      }
    }

    return <Dashboard onNavigate={setActivePage} />;
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-transparent">
      <Sidebar
        activeEcosystem={activeEcosystem}
        setActiveEcosystem={setActiveEcosystem}
        activePage={activePage}
        setActivePage={setActivePage}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header activeEcosystem={activeEcosystem} onNavigate={setActivePage} />
        <main className="flex-1 overflow-hidden flex flex-col">
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
