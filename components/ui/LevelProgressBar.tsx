'use client';

import { motion } from 'framer-motion';

interface LevelProgressBarProps {
  currentLevel: number;
  levelName: string;
  levelIcon: string;
  progress: number; // 0-100
  totalPoints: number;
  compact?: boolean;
}

export function LevelProgressBar({
  currentLevel,
  levelName,
  levelIcon,
  progress,
  totalPoints,
  compact = false,
}: LevelProgressBarProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <motion.div
          className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {levelIcon}
        </motion.div>
        <div className="flex-1">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xs">
      {/* Level badge and info */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center text-xl shadow-md"
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.95 }}
          >
            {levelIcon}
          </motion.div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Level {currentLevel}</p>
            <p className="text-xs text-gray-500">{levelName}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-primary">{totalPoints}</p>
          <p className="text-xs text-gray-500">points</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <motion.div
          className="h-full bg-gradient-to-r from-primary via-secondary to-success rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {/* Progress text */}
      <p className="text-xs text-gray-500 mt-1 text-center">
        {Math.round(progress)}% to next level
      </p>
    </div>
  );
}
