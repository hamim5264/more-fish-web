import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, STORAGE_KEYS } from '../services/api.ts';
import type { AuthFlow } from '../types/aquaculture';

export interface ProfileSession {
  token: string;
  userId: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  first_name: string | null;
  last_name: string | null;
  user_type: string | null;
  raw: any;
}

interface AuthContextType {
  tokens: {
    fish: string | null;
    pharma: string | null;
    cattle: string | null;
    poultry: string | null;
  };
  profiles: Record<AuthFlow, any | null>;
  allProfiles: Record<AuthFlow, ProfileSession[]>;
  activeProfileIndex: Record<AuthFlow, number>;
  viewMode: 'default' | 'multiple' | 'grid';
  setViewMode: (mode: 'default' | 'multiple' | 'grid') => void;
  login: (email: string, password: string, flow: AuthFlow) => Promise<any>;
  logout: (flow: AuthFlow) => void;
  logoutProfile: (flow: AuthFlow, index: number) => void;
  switchProfile: (flow: AuthFlow, index: number) => void;
  loadProfile: (flow: AuthFlow) => Promise<any>;
  refreshTokens: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const loadProfilesFromStorage = (flow: AuthFlow): ProfileSession[] => {
  try {
    const saved = localStorage.getItem(`dma_profiles_list_${flow}`);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(`Failed to parse profiles for ${flow}`, e);
  }
  return [];
};

const saveProfilesToStorage = (flow: AuthFlow, list: ProfileSession[]) => {
  localStorage.setItem(`dma_profiles_list_${flow}`, JSON.stringify(list));
};

const loadActiveIndexFromStorage = (flow: AuthFlow): number => {
  const saved = localStorage.getItem(`dma_active_index_${flow}`);
  if (saved) {
    const parsed = parseInt(saved, 10);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
};

const saveActiveIndexToStorage = (flow: AuthFlow, index: number) => {
  localStorage.setItem(`dma_active_index_${flow}`, String(index));
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tokens, setTokens] = useState({
    fish: localStorage.getItem(STORAGE_KEYS.MORE_FISH_TOKEN),
    pharma: localStorage.getItem(STORAGE_KEYS.PHARMA_TOKEN),
    cattle: localStorage.getItem(STORAGE_KEYS.CATTLE_TOKEN),
    poultry: localStorage.getItem(STORAGE_KEYS.POULTRY_TOKEN),
  });

  const [profiles, setProfiles] = useState<Record<AuthFlow, any | null>>({
    fish: null,
    pharma: null,
    cattle: null,
    poultry: null,
  });

  const [allProfiles, setAllProfiles] = useState<Record<AuthFlow, ProfileSession[]>>({
    fish: loadProfilesFromStorage('fish'),
    pharma: loadProfilesFromStorage('pharma'),
    cattle: loadProfilesFromStorage('cattle'),
    poultry: loadProfilesFromStorage('poultry'),
  });

  const [activeProfileIndex, setActiveProfileIndex] = useState<Record<AuthFlow, number>>({
    fish: loadActiveIndexFromStorage('fish'),
    pharma: loadActiveIndexFromStorage('pharma'),
    cattle: loadActiveIndexFromStorage('cattle'),
    poultry: loadActiveIndexFromStorage('poultry'),
  });

  const [viewMode, setViewModeState] = useState<'default' | 'multiple' | 'grid'>(
    (localStorage.getItem('dma_view_mode') as 'default' | 'multiple' | 'grid') || 'default'
  );

  const setViewMode = (mode: 'default' | 'multiple' | 'grid') => {
    setViewModeState(mode);
    localStorage.setItem('dma_view_mode', mode);
  };

  const refreshTokens = () => {
    setTokens({
      fish: localStorage.getItem(STORAGE_KEYS.MORE_FISH_TOKEN),
      pharma: localStorage.getItem(STORAGE_KEYS.PHARMA_TOKEN),
      cattle: localStorage.getItem(STORAGE_KEYS.CATTLE_TOKEN),
      poultry: localStorage.getItem(STORAGE_KEYS.POULTRY_TOKEN),
    });
  };

  const login = async (email: string, password: string, flow: AuthFlow) => {
    const response = await api.login(email, password, flow);
    
    const token =
      response.token ||
      response.raw?.token ||
      response.raw?.access ||
      response.raw?.data?.token ||
      response.raw?.data?.access;

    const userId = response.userId || response.raw?.user_id || response.raw?.data?.user_id || '';
    
    if (token) {
      if (flow === 'fish') {
        localStorage.setItem(STORAGE_KEYS.MORE_FISH_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.MORE_FISH_USER_ID, String(userId));
      } else if (flow === 'pharma') {
        localStorage.setItem(STORAGE_KEYS.PHARMA_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.PHARMA_USER_ID, String(userId));
      } else if (flow === 'cattle') {
        localStorage.setItem(STORAGE_KEYS.CATTLE_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.CATTLE_USER_ID, String(userId));
      } else if (flow === 'poultry') {
        localStorage.setItem(STORAGE_KEYS.POULTRY_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.POULTRY_USER_ID, String(userId));
      }

      const normalized = await api.getProfile(flow);
      const newSession: ProfileSession = {
        token,
        userId: String(userId),
        email: normalized.email,
        phone: normalized.phone,
        address: normalized.address,
        first_name: normalized.first_name,
        last_name: normalized.last_name,
        user_type: normalized.raw?.user_type || 'Farmer',
        raw: normalized,
      };

      setAllProfiles((prev) => {
        const list = [...(prev[flow] || [])];
        const existingIdx = list.findIndex(p => p.email === normalized.email);
        let newActiveIndex = activeProfileIndex[flow];
        if (existingIdx >= 0) {
          list[existingIdx] = newSession;
          newActiveIndex = existingIdx;
        } else {
          list.push(newSession);
          newActiveIndex = list.length - 1;
        }
        saveProfilesToStorage(flow, list);
        
        setActiveProfileIndex(prevIndex => {
          const nextIndex = { ...prevIndex, [flow]: newActiveIndex };
          saveActiveIndexToStorage(flow, newActiveIndex);
          return nextIndex;
        });

        return { ...prev, [flow]: list };
      });

      setProfiles((prev) => ({ ...prev, [flow]: normalized }));
      refreshTokens();
    }
    return response;
  };

  const switchProfile = (flow: AuthFlow, index: number) => {
    const list = allProfiles[flow];
    if (!list || list.length === 0 || index < 0 || index >= list.length) return;

    const profileToSwitch = list[index];
    
    if (flow === 'fish') {
      localStorage.setItem(STORAGE_KEYS.MORE_FISH_TOKEN, profileToSwitch.token);
      localStorage.setItem(STORAGE_KEYS.MORE_FISH_USER_ID, profileToSwitch.userId);
    } else if (flow === 'pharma') {
      localStorage.setItem(STORAGE_KEYS.PHARMA_TOKEN, profileToSwitch.token);
      localStorage.setItem(STORAGE_KEYS.PHARMA_USER_ID, profileToSwitch.userId);
    } else if (flow === 'cattle') {
      localStorage.setItem(STORAGE_KEYS.CATTLE_TOKEN, profileToSwitch.token);
      localStorage.setItem(STORAGE_KEYS.CATTLE_USER_ID, profileToSwitch.userId);
    } else if (flow === 'poultry') {
      localStorage.setItem(STORAGE_KEYS.POULTRY_TOKEN, profileToSwitch.token);
      localStorage.setItem(STORAGE_KEYS.POULTRY_USER_ID, profileToSwitch.userId);
    }

    setActiveProfileIndex((prev) => {
      const next = { ...prev, [flow]: index };
      saveActiveIndexToStorage(flow, index);
      return next;
    });

    setProfiles((prev) => ({ ...prev, [flow]: profileToSwitch.raw }));
    refreshTokens();
  };

  const logoutProfile = (flow: AuthFlow, index: number) => {
    const list = [...(allProfiles[flow] || [])];
    if (index < 0 || index >= list.length) return;

    list.splice(index, 1);
    saveProfilesToStorage(flow, list);
    setAllProfiles((prev) => ({ ...prev, [flow]: list }));

    const currentActiveIndex = activeProfileIndex[flow];
    let nextActiveIndex = currentActiveIndex;

    if (list.length === 0) {
      if (flow === 'fish') {
        localStorage.removeItem(STORAGE_KEYS.MORE_FISH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.MORE_FISH_USER_ID);
      } else if (flow === 'pharma') {
        localStorage.removeItem(STORAGE_KEYS.PHARMA_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.PHARMA_USER_ID);
      } else if (flow === 'cattle') {
        localStorage.removeItem(STORAGE_KEYS.CATTLE_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.CATTLE_USER_ID);
      } else if (flow === 'poultry') {
        localStorage.removeItem(STORAGE_KEYS.POULTRY_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.POULTRY_USER_ID);
      }
      nextActiveIndex = 0;
      setProfiles((prev) => ({ ...prev, [flow]: null }));
    } else {
      if (currentActiveIndex === index) {
        nextActiveIndex = 0;
      } else if (currentActiveIndex > index) {
        nextActiveIndex = currentActiveIndex - 1;
      }
      
      const activeProfile = list[nextActiveIndex];
      if (flow === 'fish') {
        localStorage.setItem(STORAGE_KEYS.MORE_FISH_TOKEN, activeProfile.token);
        localStorage.setItem(STORAGE_KEYS.MORE_FISH_USER_ID, activeProfile.userId);
      } else if (flow === 'pharma') {
        localStorage.setItem(STORAGE_KEYS.PHARMA_TOKEN, activeProfile.token);
        localStorage.setItem(STORAGE_KEYS.PHARMA_USER_ID, activeProfile.userId);
      } else if (flow === 'cattle') {
        localStorage.setItem(STORAGE_KEYS.CATTLE_TOKEN, activeProfile.token);
        localStorage.setItem(STORAGE_KEYS.CATTLE_USER_ID, activeProfile.userId);
      } else if (flow === 'poultry') {
        localStorage.setItem(STORAGE_KEYS.POULTRY_TOKEN, activeProfile.token);
        localStorage.setItem(STORAGE_KEYS.POULTRY_USER_ID, activeProfile.userId);
      }
      setProfiles((prev) => ({ ...prev, [flow]: activeProfile.raw }));
    }

    setActiveProfileIndex((prev) => {
      const next = { ...prev, [flow]: nextActiveIndex };
      saveActiveIndexToStorage(flow, nextActiveIndex);
      return next;
    });

    refreshTokens();
  };

  const logout = (flow: AuthFlow) => {
    const activeIndex = activeProfileIndex[flow];
    logoutProfile(flow, activeIndex);
  };

  const loadProfile = async (flow: AuthFlow) => {
    try {
      const profile = await api.getProfile(flow);
      const normalized = profile?.raw?.data || profile || {};
      
      const token = localStorage.getItem(
        flow === 'fish' ? STORAGE_KEYS.MORE_FISH_TOKEN :
        flow === 'pharma' ? STORAGE_KEYS.PHARMA_TOKEN :
        flow === 'cattle' ? STORAGE_KEYS.CATTLE_TOKEN :
        STORAGE_KEYS.POULTRY_TOKEN
      ) || '';
      
      const userId = localStorage.getItem(
        flow === 'fish' ? STORAGE_KEYS.MORE_FISH_USER_ID :
        flow === 'pharma' ? STORAGE_KEYS.PHARMA_USER_ID :
        flow === 'cattle' ? STORAGE_KEYS.CATTLE_USER_ID :
        STORAGE_KEYS.POULTRY_USER_ID
      ) || '';

      const newSession: ProfileSession = {
        token,
        userId,
        email: normalized.email,
        phone: normalized.phone,
        address: normalized.address,
        first_name: normalized.first_name,
        last_name: normalized.last_name,
        user_type: normalized.raw?.user_type || 'Farmer',
        raw: normalized,
      };

      setAllProfiles((prev) => {
        const list = [...(prev[flow] || [])];
        const existingIdx = list.findIndex(p => p.email === normalized.email);
        if (existingIdx >= 0) {
          list[existingIdx] = newSession;
        } else {
          list.push(newSession);
        }
        saveProfilesToStorage(flow, list);
        return { ...prev, [flow]: list };
      });

      setProfiles((prev) => ({ ...prev, [flow]: normalized }));
      return normalized;
    } catch (err) {
      console.error(`Failed to load profile for ${flow}:`, err);
      logout(flow);
      return null;
    }
  };

  useEffect(() => {
    if (tokens.fish) loadProfile('fish');
    if (tokens.pharma) loadProfile('pharma');
    if (tokens.cattle) loadProfile('cattle');
    if (tokens.poultry) loadProfile('poultry');
  }, [tokens.fish, tokens.pharma, tokens.cattle, tokens.poultry]);

  return (
    <AuthContext.Provider value={{
      tokens,
      profiles,
      allProfiles,
      activeProfileIndex,
      viewMode,
      setViewMode,
      login,
      logout,
      logoutProfile,
      switchProfile,
      loadProfile,
      refreshTokens
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
