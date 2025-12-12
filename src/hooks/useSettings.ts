import { useState, useEffect } from 'react';

interface AppSettings {
  companyName: string;
  cnpj: string;
  notifications: {
    lowStock: boolean;
    expiringLots: boolean;
    dailyEmail: boolean;
  };
}

const STORAGE_KEY = 'app_settings';

const defaultSettings: AppSettings = {
  companyName: '',
  cnpj: '',
  notifications: {
    lowStock: true,
    expiringLots: true,
    dailyEmail: false,
  },
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultSettings;
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<AppSettings>(settings);

  useEffect(() => {
    const hasChanged = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(hasChanged);
  }, [settings, originalSettings]);

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const updateNotifications = (key: keyof AppSettings['notifications'], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }));
  };

  const saveSettings = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setOriginalSettings(settings);
    setHasChanges(false);
  };

  const resetSettings = () => {
    setSettings(originalSettings);
    setHasChanges(false);
  };

  return {
    settings,
    hasChanges,
    updateSettings,
    updateNotifications,
    saveSettings,
    resetSettings,
  };
}
