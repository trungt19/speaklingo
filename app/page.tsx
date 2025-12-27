'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Mascot } from '@/components/ui/Mascot';
import { LevelProgressBar } from '@/components/ui/LevelProgressBar';
import { BadgeDisplay } from '@/components/ui/BadgeDisplay';
import { useStorage } from '@/hooks/useStorage';
import { useSettings } from '@/hooks/useSettings';
import { useGamification } from '@/hooks/useGamification';
import { getRandomMessage } from '@/lib/gamification';

export default function HomePage() {
  const router = useRouter();
  const { promptsCompletedToday, streak, isLoading } = useStorage();
  const { settings } = useSettings();
  const { state: gamificationState, levelInfo, levelProgress, isLoading: gamificationLoading } = useGamification();
  const [mounted, setMounted] = useState(false);
  const [mascotMessage, setMascotMessage] = useState('');

  useEffect(() => {
    setMounted(true);
    setMascotMessage(getRandomMessage('greeting'));
  }, []);

  if (!mounted || isLoading || gamificationLoading) {
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 md:p-8 relative overflow-hidden">
      {/* Logo/Title */}
      <motion.h1
        className="text-3xl md:text-4xl font-bold text-primary mb-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        SpeakLingo
      </motion.h1>

      {/* Tagline */}
      <motion.p
        className="text-text-secondary text-base mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Speech practice that feels natural
      </motion.p>

      {/* Mascot with greeting */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        className="mb-4"
      >
        <Mascot
          mood={dailyGoalMet ? 'happy' : 'idle'}
          size="lg"
          message={mascotMessage}
        />
      </motion.div>

      {/* Greeting with level badge */}
      <motion.div
        className="flex items-center gap-3 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-xl md:text-2xl text-text-primary">
          Hi {settings.childName}!
        </p>
        {levelInfo && (
          <motion.div
            className="flex items-center gap-1 bg-gradient-to-r from-primary/10 to-secondary/10 px-3 py-1 rounded-full"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-lg">{levelInfo.icon}</span>
            <span className="text-sm font-medium text-primary">Lvl {levelInfo.level}</span>
          </motion.div>
        )}
      </motion.div>

      {/* Level Progress */}
      {levelInfo && levelProgress && (
        <motion.div
          className="w-full max-w-xs mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <LevelProgressBar
            currentLevel={levelInfo.level}
            levelName={levelInfo.name}
            levelIcon={levelInfo.icon}
            progress={levelProgress.percentage}
            totalPoints={gamificationState.totalPoints}
          />
        </motion.div>
      )}

      {/* Main Action */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
      >
        <Button
          variant="primary"
          size="xl"
          onClick={() => router.push('/session')}
          className="text-xl px-10 py-5"
        >
          Let&apos;s Talk
        </Button>
      </motion.div>

      {/* Progress Summary */}
      <motion.div
        className="text-center mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-sm text-text-secondary mb-2">Today&apos;s Progress</p>
        <div className="flex gap-2 justify-center mb-3">
          {Array.from({ length: settings.promptsPerSession }, (_, i) => (
            <motion.span
              key={i}
              className="text-2xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7 + i * 0.1 }}
            >
              {i < promptsCompletedToday ? (
                <span className="text-yellow-400">&#9733;</span>
              ) : (
                <span className="text-gray-300">&#9734;</span>
              )}
            </motion.span>
          ))}
        </div>
        {dailyGoalMet && (
          <motion.p
            className="text-success text-base font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Great job today!
          </motion.p>
        )}
        {gamificationState.streakDays > 0 && (
          <motion.div
            className="flex items-center justify-center gap-1 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <motion.span
              className="text-xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              &#128293;
            </motion.span>
            <span className="text-sm text-text-secondary">
              {gamificationState.streakDays} day streak
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Badge showcase */}
      {gamificationState.earnedBadges.length > 0 && (
        <motion.div
          className="mt-6 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <p className="text-xs text-text-secondary">Recent Badges</p>
          <BadgeDisplay
            earnedBadges={gamificationState.earnedBadges}
            showMax={4}
            size="md"
          />
        </motion.div>
      )}

      {/* Parent Access */}
      <motion.button
        className="absolute bottom-6 text-text-secondary text-sm hover:text-primary transition-colors"
        onClick={() => router.push('/dashboard')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Parent Dashboard
      </motion.button>
    </div>
  );
}
