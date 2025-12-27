'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface SpeechButtonProps {
  targetText: string;
  onTranscript: (text: string) => void;
  onSkip: () => void;
}

export function SpeechButton({
  targetText,
  onTranscript,
  onSkip,
}: SpeechButtonProps) {
  const { isListening, isSupported, error, start, stop, clearError } =
    useSpeechRecognition();
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handlePress = async () => {
    if (!isSupported) {
      setShowError(true);
      return;
    }

    try {
      clearError();
      const transcript = await start();
      if (transcript) {
        onTranscript(transcript);
      }
    } catch (err) {
      console.error('Speech recognition error:', err);
      setShowError(true);
    }
  };

  const handleStop = () => {
    stop();
  };

  return (
    <motion.div
      className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'tween', duration: 0.3 }}
    >
      {/* Show what they typed */}
      {targetText && (
        <div className="text-center">
          <p className="text-lg text-text-secondary mb-2">You wrote:</p>
          <p className="text-2xl text-primary font-semibold px-4">
            &ldquo;{targetText}&rdquo;
          </p>
        </div>
      )}

      {/* Instruction */}
      <p className="text-xl text-text-primary">Now say it:</p>

      {/* Microphone button */}
      <motion.button
        className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 ${
          isListening
            ? 'bg-success shadow-xl shadow-success/40'
            : 'bg-success shadow-lg shadow-success/30 hover:shadow-xl hover:shadow-success/40'
        }`}
        onClick={isListening ? handleStop : handlePress}
        disabled={!isSupported}
        animate={
          isListening
            ? {
                scale: [1, 1.1, 1],
                transition: { repeat: Infinity, duration: 1.5 },
              }
            : {}
        }
        whileTap={{ scale: 0.95 }}
      >
        <svg
          className="w-12 h-12 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
        </svg>
      </motion.button>

      {/* Status text */}
      {isListening && (
        <motion.p
          className="text-text-secondary text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Listening...
        </motion.p>
      )}

      {!isListening && !showError && (
        <p className="text-text-secondary">Tap the microphone and speak</p>
      )}

      {/* Error message */}
      {showError && (
        <motion.div
          className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p>{error || 'Speech recognition is not available on this device.'}</p>
          <button
            onClick={() => {
              setShowError(false);
              clearError();
            }}
            className="text-sm underline mt-2"
          >
            Try again
          </button>
        </motion.div>
      )}

      {/* Not supported message */}
      {!isSupported && (
        <div className="bg-yellow-50 text-yellow-700 px-4 py-3 rounded-xl text-center">
          <p>Speech recognition is not supported in this browser.</p>
          <p className="text-sm mt-1">Try using Safari on iPad.</p>
        </div>
      )}

      {/* Skip button */}
      <Button variant="ghost" size="md" onClick={onSkip} className="mt-4">
        Skip
      </Button>
    </motion.div>
  );
}
