'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { SpeechRecognitionState } from '@/types';

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionClass {
  new (): SpeechRecognitionInstance;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

// Get speech recognition constructor (Safari uses webkit prefix)
function getSpeechRecognition(): SpeechRecognitionClass | null {
  if (typeof window === 'undefined') return null;

  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionClass;
    webkitSpeechRecognition?: SpeechRecognitionClass;
  };

  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function useSpeechRecognition() {
  const [state, setState] = useState<SpeechRecognitionState>({
    isListening: false,
    transcript: '',
    error: null,
    isSupported: false,
  });

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const resolveRef = useRef<((value: string) => void) | null>(null);
  const rejectRef = useRef<((error: Error) => void) | null>(null);

  // Check support on mount
  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    setState((prev) => ({ ...prev, isSupported: !!SpeechRecognition }));
  }, []);

  // Start listening
  const start = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      const SpeechRecognition = getSpeechRecognition();

      if (!SpeechRecognition) {
        const error = new Error('Speech recognition not supported');
        setState((prev) => ({ ...prev, error: error.message }));
        reject(error);
        return;
      }

      // Store resolvers
      resolveRef.current = resolve;
      rejectRef.current = reject;

      // Create recognition instance
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      // Configure
      recognition.continuous = false; // Single utterance
      recognition.interimResults = false; // Only final results
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      // Handle results
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0]?.[0]?.transcript ?? '';
        setState((prev) => ({
          ...prev,
          transcript,
          isListening: false,
          error: null,
        }));
        resolveRef.current?.(transcript);
      };

      // Handle errors
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        let errorMessage = 'Speech recognition error';

        switch (event.error) {
          case 'no-speech':
            errorMessage = "I didn't hear anything. Try again?";
            break;
          case 'audio-capture':
            errorMessage = 'No microphone found. Please check your device.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please enable it in settings.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your connection.';
            break;
          case 'aborted':
            errorMessage = 'Listening stopped.';
            break;
          default:
            errorMessage = `Error: ${event.error}`;
        }

        setState((prev) => ({
          ...prev,
          isListening: false,
          error: errorMessage,
        }));
        rejectRef.current?.(new Error(errorMessage));
      };

      // Handle end
      recognition.onend = () => {
        setState((prev) => ({ ...prev, isListening: false }));
      };

      // Handle start
      recognition.onstart = () => {
        setState((prev) => ({
          ...prev,
          isListening: true,
          transcript: '',
          error: null,
        }));
      };

      // Start recognition
      try {
        recognition.start();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to start recognition');
        setState((prev) => ({ ...prev, error: error.message }));
        reject(error);
      }
    });
  }, []);

  // Stop listening
  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setState((prev) => ({ ...prev, isListening: false }));
  }, []);

  // Abort (cancel without result)
  const abort = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setState((prev) => ({ ...prev, isListening: false, transcript: '' }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    start,
    stop,
    abort,
    clearError,
  };
}
