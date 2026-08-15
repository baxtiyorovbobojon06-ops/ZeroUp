"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from '@/utils/translations';

type Theme = 'light' | 'dark';

interface SettingsContextType {
  theme: Theme;
  language: Language;
  profileName: string;
  setTheme: (t: Theme) => void;
  setLanguage: (l: Language) => void;
  setProfileName: (n: string) => void;
  t: (key: string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [language, setLanguageState] = useState<Language>('uz');
  const [profileName, setProfileNameState] = useState<string>("O'qituvchi");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from local storage on mount
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedLang = localStorage.getItem('language') as Language;
    const savedName = localStorage.getItem('profileName');

    if (savedTheme) setThemeState(savedTheme);
    if (savedLang) setLanguageState(savedLang);
    if (savedName) setProfileNameState(savedName);
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme, isLoaded]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    if (isLoaded) localStorage.setItem('language', newLang);
  };

  const setProfileName = (newName: string) => {
    setProfileNameState(newName);
    if (isLoaded) localStorage.setItem('profileName', newName);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <SettingsContext.Provider value={{ theme, language, profileName, setTheme, setLanguage, setProfileName, t }}>
      {/* We apply the dark class directly on the HTML in layout, but this ensures re-render logic works */}
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
