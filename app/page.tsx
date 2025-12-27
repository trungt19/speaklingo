'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useStorage } from '@/hooks/useStorage';
import { useSettings } from '@/hooks/useSettings';

export default function HomePage() {
  const router = useRouter();
  const { promptsCompletedToday, streak, isLoading } = useStorage();
  const { settings } = useSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  const dailyGoalMet = promptsCompletedToday >= settings.promptsPerSession;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 relative">
      {/* Logo/Title */}
      <motion.h1
        className="text-4xl md:text-5xl font-bold text-primary mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        SpeakLingo
      </motion.h1>

      {/* Tagline */}
      <motion.p
        className="text-text-secondary text-lg mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Speech practice that feels natural
      </motion.p>

      {/* Greeting */}
      <motion.p
        className="text-2xl md:text-3xl text-text-primary mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Hi {settings.childName}!
      </motion.p>

      {/* Main Action */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
      >
        <Button
          variant="primary"
          size="xl"
          onClick={() => router.push('/session')}
          className="text-2xl px-12 py-6"
        >
          Let&apos;s Talk
        </Button>
      </motion.div>

      {/* Progress Summary */}
      <motion.div
        className="text-center mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-lg text-text-secondary mb-3">Today</p>
        <div className="flex gap-2 justify-center mb-4">
          {Array.from({ length: settings.promptsPerSession }, (_, i) => (
            <motion.span
              key={i}
              className="text-3xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
            >
              {i < promptsCompletedToday ? (
                <span className="text-warning">*</span>
              ) : (
                <span className="text-gray-300">o</span>
              )}
            </motion.span>
          ))}
        </div>
        {dailyGoalMet && (
          <motion.p
            className="text-success text-lg font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Great job today!
          </motion.p>
        )}
        {streak > 0 && (
          <motion.p
            className="text-sm text-text-secondary mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <span className="text-orange-500">fire</span> {streak} day streak
          </motion.p>
        )}
      </motion.div>

      {/* Parent Access */}
      <motion.button
        className="absolute bottom-8 text-text-secondary text-sm hover:text-primary transition-colors"
        onClick={() => router.push('/dashboard')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Parent Dashboard
      </motion.button>
    </div>
  );
}
