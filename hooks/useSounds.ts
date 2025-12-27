'use client';

import { useCallback, useEffect } from 'react';
import { useSettings } from './useSettings';
import { playSound as playSoundEffect, resumeAudioContext } from '@/lib/sounds';
import { SoundEffect } from '@/types';

export function useSounds() {
  const { settings } = useSettings();

  // Resume audio context on first user interaction
  useEffect(() => {
    const handleInteraction = () => {
      resumeAudioContext();
      // Remove listeners after first interaction
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('click', handleInteraction);
    };

    document.addEventListener('touchstart', handleInteraction);
    document.addEventListener('click', handleInteraction);

    return () => {
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('click', handleInteraction);
    };
  }, []);

  const playSound = useCallback(
    (effect: SoundEffect) => {
      if (!settings.soundEnabled) return;
      playSoundEffect(effect, 0.4);
    },
    [settings.soundEnabled]
  );

  return { playSound };
}
