"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from '@/utils/translations';

type Theme = 'light' | 'dark';
type FontSize = 'sm' | 'base' | 'lg';
type FontFamily = 'inter' | 'roboto' | 'nunito';

interface SettingsContextType {
  theme: Theme;
  language: Language;
  fontSize: FontSize;
  fontFamily: FontFamily;
  profileName: string;
  setTheme: (t: Theme) => void;
  setLanguage: (l: Language) => void;
  setFontSize: (s: FontSize) => void;
  setFontFamily: (f: FontFamily) => void;
  setProfileName: (n: string) => void;
  t: (key: string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [language, setLanguageState] = useState<Language>('uz');
  const [fontSize, setFontSizeState] = useState<FontSize>('base');
  const [fontFamily, setFontFamilyState] = useState<FontFamily>('inter');
  const [profileName, setProfileNameState] = useState<string>("O'qituvchi");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from local storage on mount
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedLang = localStorage.getItem('language') as Language;
    const savedSize = localStorage.getItem('fontSize') as FontSize;
    const savedFont = localStorage.getItem('fontFamily') as FontFamily;
    const savedName = localStorage.getItem('profileName');

    if (savedTheme) setThemeState(savedTheme);
    if (savedLang) setLanguageState(savedLang);
    if (savedSize) setFontSizeState(savedSize);
    if (savedFont) setFontFamilyState(savedFont);
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

      // Font size classes
      localStorage.setItem('fontSize', fontSize);
      document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg');
      document.documentElement.classList.add(`text-${fontSize}`);

      // Font family classes
      localStorage.setItem('fontFamily', fontFamily);
      document.documentElement.classList.remove('font-inter', 'font-roboto', 'font-nunito');
      document.documentElement.classList.add(`font-${fontFamily}`);
    }
  }, [theme, fontSize, fontFamily, isLoaded]);

  const setTheme = (newTheme: Theme) => setThemeState(newTheme);
  
  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    if (isLoaded) localStorage.setItem('language', newLang);
  };

  const setFontSize = (newSize: FontSize) => setFontSizeState(newSize);
  const setFontFamily = (newFont: FontFamily) => setFontFamilyState(newFont);

  const setProfileName = (newName: string) => {
    setProfileNameState(newName);
    if (isLoaded) localStorage.setItem('profileName', newName);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <SettingsContext.Provider value={{ 
      theme, language, fontSize, fontFamily, profileName, 
      setTheme, setLanguage, setFontSize, setFontFamily, setProfileName, t 
    }}>
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
