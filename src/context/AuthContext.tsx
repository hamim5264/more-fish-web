import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, STORAGE_KEYS } from '../services/api.ts';
import type { AuthFlow } from '../types/aquaculture';

interface AuthContextType {
  tokens: {
    fish: string | null;
    pharma: string | null;
    cattle: string | null;
    poultry: string | null;
  };
  profiles: Record<AuthFlow, any | null>;
  login: (email: string, password: string, flow: AuthFlow) => Promise<any>;
  logout: (flow: AuthFlow) => void;
  loadProfile: (flow: AuthFlow) => Promise<any>;
  refreshTokens: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    refreshTokens();
    const token =
      response.token ||
      response.raw?.token ||
      response.raw?.access ||
      response.raw?.data?.token ||
      response.raw?.data?.access;
    if (token) {
      await loadProfile(flow);
    }
    return response;
  };

  const logout = (flow: AuthFlow) => {
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
    refreshTokens();
    setProfiles((prev) => ({ ...prev, [flow]: null }));
  };

  const loadProfile = async (flow: AuthFlow) => {
    try {
      const profile = await api.getProfile(flow);
      const normalized = profile?.raw?.data || profile || {};
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
    <AuthContext.Provider value={{ tokens, profiles, login, logout, loadProfile, refreshTokens }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
