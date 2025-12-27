'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Mascot } from '@/components/ui/Mascot';
import { Confetti } from '@/components/ui/Confetti';
import { LevelProgressBar } from '@/components/ui/LevelProgressBar';
import { BadgeDisplay, BadgeCelebration } from '@/components/ui/BadgeDisplay';
import { LevelInfo, BadgeDefinition, EarnedBadge } from '@/types';

interface CompletionScreenProps {
  attemptsCount: number;
  completedCount: number;
  onDone: () => void;
  // Gamification props
  sessionPoints?: number;
  totalPoints?: number;
  levelInfo?: LevelInfo;
  levelProgress?: { current: number; required: number; percentage: number };
  newBadges?: BadgeDefinition[];
  allBadges?: EarnedBadge[];
  isPerfectSession?: boolean;
}

export function CompletionScreen({
  attemptsCount,
  completedCount,
  onDone,
  sessionPoints = 0,
  totalPoints = 0,
  levelInfo,
  levelProgress,
  newBadges = [],
  allBadges = [],
  isPerfectSession = false,
}: CompletionScreenProps) {
  const showBigCelebration = isPerfectSession || newBadges.length > 0;

  return (
    <motion.div
      className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto text-center relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'tween', duration: 0.3 }}
    >
      {/* Confetti for celebrations */}
      <Confetti
        trigger={showBigCelebration}
        intensity={isPerfectSession ? 'large' : 'medium'}
      />

      {/* Mascot celebration */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
      >
        <Mascot
          mood="celebrating"
          size="lg"
          message={isPerfectSession ? 'Perfect!' : 'Great job!'}
        />
      </motion.div>

      {/* Message */}
      <motion.h2
        className="text-3xl font-semibold text-text-primary"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {isPerfectSession ? 'Perfect Session!' : 'Nice work today!'}
      </motion.h2>

      {/* Stars for completed */}
      <motion.div
        className="flex items-center gap-3 text-3xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {Array.from({ length: completedCount }, (_, i) => (
          <motion.span
            key={i}
            className="text-yellow-400"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4 + i * 0.1, type: 'spring' }}
          >
            &#9733;
          </motion.span>
        ))}
        {Array.from({ length: attemptsCount - completedCount }, (_, i) => (
          <span key={`empty-${i}`} className="text-gray-300">
            &#9734;
          </span>
        ))}
      </motion.div>

      {/* Session stats */}
      <motion.div
        className="flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-text-secondary text-lg">
          You answered {completedCount} question{completedCount !== 1 ? 's' : ''}
        </p>
        {sessionPoints > 0 && (
          <motion.p
            className="text-2xl font-bold text-primary"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: 'spring' }}
          >
            +{sessionPoints} points!
          </motion.p>
        )}
      </motion.div>

      {/* New badges earned */}
      {newBadges.length > 0 && (
        <motion.div
          className="flex flex-col items-center gap-3 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-sm font-semibold text-text-secondary">
            New Badge{newBadges.length > 1 ? 's' : ''} Earned!
          </p>
          <div className="flex gap-4">
            {newBadges.map((badge) => (
              <BadgeCelebration key={badge.id} badge={badge} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Level progress */}
      {levelInfo && levelProgress && (
        <motion.div
          className="w-full max-w-xs"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <LevelProgressBar
            currentLevel={levelInfo.level}
            levelName={levelInfo.name}
            levelIcon={levelInfo.icon}
            progress={levelProgress.percentage}
            totalPoints={totalPoints}
          />
        </motion.div>
      )}

      {/* Badge collection preview */}
      {allBadges.length > 0 && (
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-xs text-text-secondary">Your badges</p>
          <BadgeDisplay earnedBadges={allBadges} showMax={5} size="sm" />
        </motion.div>
      )}

      {/* Done button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Button variant="primary" size="xl" onClick={onDone}>
          All Done
        </Button>
      </motion.div>
    </motion.div>
  );
}
