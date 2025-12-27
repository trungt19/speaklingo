'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface GameHeaderProps {
  title: string;
  currentRound: number;
  totalRounds: number;
  score: number;
  onExit: () => void;
}

export function GameHeader({
  title,
  currentRound,
  totalRounds,
  score,
  onExit,
}: GameHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      {/* Game title and progress */}
      <div className="flex-1">
        <h1 className="text-xl font-bold text-text-primary">{title}</h1>
        <div className="flex items-center gap-4 mt-1">
          {/* Progress dots */}
          <div className="flex gap-1">
            {Array.from({ length: totalRounds }, (_, i) => (
              <motion.div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < currentRound
                    ? 'bg-success'
                    : i === currentRound
                    ? 'bg-primary'
                    : 'bg-gray-300'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
              />
            ))}
          </div>
          <span className="text-sm text-text-secondary">
            {currentRound + 1} of {totalRounds}
          </span>
        </div>
      </div>

      {/* Score */}
      <motion.div
        className="flex items-center gap-2 bg-warning/20 px-4 py-2 rounded-full mr-4"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 0.3 }}
        key={score}
      >
        <span className="text-lg">⭐</span>
        <span className="font-bold text-text-primary">{score}</span>
      </motion.div>

      {/* Exit button */}
      <Button variant="secondary" size="sm" onClick={onExit}>
        Exit
      </Button>
    </div>
  );
}
