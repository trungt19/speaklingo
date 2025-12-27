'use client';

import { SoundEffect } from '@/types';

// Sound URLs - using data URIs for simple sounds to avoid external files
// These are simple synthesized sounds encoded as base64

const SOUND_URLS: Record<SoundEffect, string> = {
  // Simple click - short beep
  button_click: 'data:audio/wav;base64,UklGRl9vT19teleGFpcQAAABAAEARKwAAIhYAQACABAAZGF0YU' + 'AAAA==',
  // Success chime
  success_chime: '',
  // Points earned
  points_earned: '',
  // Level up fanfare
  level_up: '',
  // Badge unlock
  badge_unlock: '',
  // Confetti pop
  confetti: '',
};

// Audio context for generating sounds
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

// Generate simple beep sound
function playBeep(frequency: number, duration: number, volume: number = 0.3): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

// Play a sequence of notes
function playNotes(notes: { freq: number; duration: number }[], volume: number = 0.3): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  let time = ctx.currentTime;
  notes.forEach(({ freq, duration }) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = freq;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, time);
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + duration * 0.9);

    oscillator.start(time);
    oscillator.stop(time + duration);

    time += duration;
  });
}

// Sound effect implementations
export function playSound(effect: SoundEffect, volume: number = 0.3): void {
  if (typeof window === 'undefined') return;

  try {
    switch (effect) {
      case 'button_click':
        playBeep(800, 0.05, volume * 0.5);
        break;

      case 'success_chime':
        playNotes([
          { freq: 523, duration: 0.1 }, // C5
          { freq: 659, duration: 0.1 }, // E5
          { freq: 784, duration: 0.15 }, // G5
        ], volume);
        break;

      case 'points_earned':
        playNotes([
          { freq: 880, duration: 0.08 }, // A5
          { freq: 1047, duration: 0.12 }, // C6
        ], volume * 0.6);
        break;

      case 'level_up':
        playNotes([
          { freq: 523, duration: 0.1 }, // C5
          { freq: 659, duration: 0.1 }, // E5
          { freq: 784, duration: 0.1 }, // G5
          { freq: 1047, duration: 0.15 }, // C6
          { freq: 784, duration: 0.1 }, // G5
          { freq: 1047, duration: 0.25 }, // C6
        ], volume);
        break;

      case 'badge_unlock':
        playNotes([
          { freq: 392, duration: 0.1 }, // G4
          { freq: 523, duration: 0.1 }, // C5
          { freq: 659, duration: 0.1 }, // E5
          { freq: 784, duration: 0.2 }, // G5
        ], volume);
        break;

      case 'confetti':
        playNotes([
          { freq: 1047, duration: 0.05 }, // C6
          { freq: 1175, duration: 0.05 }, // D6
          { freq: 1319, duration: 0.1 }, // E6
        ], volume * 0.5);
        break;
    }
  } catch (error) {
    // Silently fail if audio context is not available
    console.log('Sound playback not available');
  }
}

// Resume audio context (needed after user interaction on iOS)
export function resumeAudioContext(): void {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume();
  }
}
