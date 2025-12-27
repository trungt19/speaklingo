'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface PINLockProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  verifyPIN: (pin: string) => boolean;
}

export function PINLock({
  isOpen,
  onSuccess,
  onCancel,
  verifyPIN,
}: PINLockProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const newPIN = pin + digit;
      setPin(newPIN);
      setError(false);

      // Auto-verify when 4 digits entered
      if (newPIN.length === 4) {
        if (verifyPIN(newPIN)) {
          onSuccess();
          setPin('');
        } else {
          setError(true);
          setTimeout(() => setPin(''), 500);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel} showCloseButton={false}>
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-text-primary mb-2">
          Parent Access
        </h2>
        <p className="text-text-secondary mb-6">Enter your PIN</p>

        {/* PIN Display */}
        <div className="flex justify-center gap-4 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold transition-all ${
                error
                  ? 'bg-red-100 border-2 border-red-300'
                  : pin.length > i
                    ? 'bg-primary/10 border-2 border-primary'
                    : 'bg-gray-100 border-2 border-gray-200'
              }`}
              animate={error ? { x: [0, -5, 5, -5, 5, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              {pin.length > i && '*'}
            </motion.div>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <p className="text-red-500 text-sm mb-4">Incorrect PIN. Try again.</p>
        )}

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num.toString())}
              className="w-16 h-16 rounded-xl bg-gray-100 text-2xl font-semibold text-text-primary hover:bg-gray-200 active:bg-gray-300 transition-all"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="w-16 h-16 rounded-xl bg-gray-100 text-sm font-medium text-text-secondary hover:bg-gray-200 active:bg-gray-300 transition-all"
          >
            Clear
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="w-16 h-16 rounded-xl bg-gray-100 text-2xl font-semibold text-text-primary hover:bg-gray-200 active:bg-gray-300 transition-all"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="w-16 h-16 rounded-xl bg-gray-100 text-text-secondary hover:bg-gray-200 active:bg-gray-300 transition-all flex items-center justify-center"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"
              />
            </svg>
          </button>
        </div>

        {/* Cancel button */}
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
