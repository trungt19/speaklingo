'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppSettings, DEFAULT_SETTINGS } from '@/types';
import { getSettings, saveSettings, resetSettings } from '@/lib/storage';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    const load = async () => {
      try {
        const loaded = await getSettings();
        setSettings(loaded);
      } catch (error) {
        console.error('Error loading settings:', error);
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Update settings
  const updateSettings = useCallback(
    async (updates: Partial<AppSettings>) => {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      try {
        await saveSettings(newSettings);
      } catch (error) {
        console.error('Error saving settings:', error);
        // Revert on error
        setSettings(settings);
        throw error;
      }
    },
    [settings]
  );

  // Reset to defaults
  const reset = useCallback(async () => {
    try {
      await resetSettings();
      setSettings(DEFAULT_SETTINGS);
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw error;
    }
  }, []);

  // Verify PIN
  const verifyPIN = useCallback(
    (pin: string): boolean => {
      return pin === settings.parentPIN;
    },
    [settings.parentPIN]
  );

  // Update PIN
  const updatePIN = useCallback(
    async (newPIN: string) => {
      await updateSettings({ parentPIN: newPIN });
    },
    [updateSettings]
  );

  return {
    settings,
    isLoading,
    updateSettings,
    reset,
    verifyPIN,
    updatePIN,
  };
}
