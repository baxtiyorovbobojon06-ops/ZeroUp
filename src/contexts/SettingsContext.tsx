"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from '@/utils/translations';

interface SettingsContextType {
  language: Language;
  profileName: string;
  notificationsEnabled: boolean;
  notificationsMuted: boolean;
  setLanguage: (l: Language) => void;
  setProfileName: (n: string) => void;
  setNotificationsEnabled: (n: boolean) => void;
  setNotificationsMuted: (m: boolean) => void;
  savedTestIds: string[];
  toggleSaveTest: (id: string) => void;
  t: (key: string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('uz');
  const [profileName, setProfileNameState] = useState<string>("O'qituvchi");
  const [notificationsEnabled, setNotificationsState] = useState<boolean>(true);
  const [notificationsMuted, setNotificationsMutedState] = useState<boolean>(false);
  const [savedTestIds, setSavedTestIds] = useState<string[]>([]);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    const savedName = localStorage.getItem('profileName');
    const savedNotifications = localStorage.getItem('notificationsEnabled');
    const savedMuted = localStorage.getItem('notificationsMuted');
    const savedTests = localStorage.getItem('savedTestIds');

    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedLang) setLanguageState(savedLang);
    if (savedName) setProfileNameState(savedName);
    if (savedNotifications !== null) setNotificationsState(savedNotifications === 'true');
    if (savedMuted !== null) setNotificationsMutedState(savedMuted === 'true');
    if (savedTests) {
      try {
        setSavedTestIds(JSON.parse(savedTests));
      } catch (e) {
        console.error('Failed to parse saved tests in context', e);
      }
    }

    setIsLoaded(true);
  }, []);

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    if (isLoaded) localStorage.setItem('language', newLang);
  };

  const setProfileName = (newName: string) => {
    setProfileNameState(newName);
    if (isLoaded) localStorage.setItem('profileName', newName);
  };

  const setNotificationsEnabled = (enabled: boolean) => {
    setNotificationsState(enabled);
    if (isLoaded) localStorage.setItem('notificationsEnabled', enabled.toString());
  };

  const setNotificationsMuted = (muted: boolean) => {
    setNotificationsMutedState(muted);
    if (isLoaded) localStorage.setItem('notificationsMuted', muted.toString());
  };

  const toggleSaveTest = (id: string) => {
    setSavedTestIds(prev => {
      const newSaved = prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id];
      if (isLoaded) localStorage.setItem('savedTestIds', JSON.stringify(newSaved));
      return newSaved;
    });
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <SettingsContext.Provider value={{
      language, profileName, notificationsEnabled, notificationsMuted, savedTestIds,
      setLanguage, setProfileName, setNotificationsEnabled, setNotificationsMuted, toggleSaveTest, t,
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
