export type Page =
  | 'dashboard'
  | 'iot'
  | 'disease'
  | 'pond'
  | 'feed-management'
  | 'disease-treatment'
  | 'live-consultancy'
  | 'fish-farm-marketplace'
  | 'fingerlings-marketplace'
  | 'grown-fish-sell'
  | 'fish-medicine-enzyme'
  | 'fcr'
  | 'nano-bubble'
  | 'marketplace'
  | 'training'
  | 'auto-aerator'
  | 'auto-feeder'
  | 'weather-forecast'
  | 'smart-khamari'
  | 'emergency-service'
  | 'filtration'
  | 'automation'
  | 'notifications'
  | 'profile'
  | 'faq'
  | 'about-app'
  | 'about-device'
  | 'settings'
  | 'farm'; // legacy alias → pond

export type Ecosystem = 'fish' | 'cattle' | 'poultry' | 'pharma' | 'beverage' | 'tex' | 'air' | 'crop';

export type AuthEcosystem = 'fish' | 'pharma' | 'cattle' | 'poultry';

export const ecosystemToAuthFlow = (eco: Ecosystem): AuthEcosystem | null => {
  if (eco === 'fish' || eco === 'pharma' || eco === 'cattle' || eco === 'poultry') return eco;
  return null;
};

export const ecosystemToAquacultureFlow = (eco: Ecosystem): 'fish' | 'pharma' | null => {
  if (eco === 'fish') return 'fish';
  if (eco === 'pharma') return 'pharma';
  return null;
};
