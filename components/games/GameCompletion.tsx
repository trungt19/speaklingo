'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Mascot } from '@/components/ui/Mascot';
import { Confetti } from '@/components/ui/Confetti';

interface GameCompletionProps {
  totalScore: number;
  correctCount: number;
  totalQuestions: number;
  onPlayAgain: () => void;
  onExit: () => void;
  onChangeTopic?: () => void;
}

export function GameCompletion({
  totalScore,
  correctCount,
  totalQuestions,
  onPlayAgain,
  onExit,
  onChangeTopic,
}: GameCompletionProps) {
  const isPerfect = correctCount === totalQuestions;
  const isGood = correctCount >= totalQuestions * 0.7;

  return (
    <motion.div
      className="flex flex-col items-center gap-6 w-full max-w-md mx-auto text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Confetti for good scores */}
      <Confetti trigger={isGood} intensity={isPerfect ? 'large' : 'medium'} />

      {/* Mascot */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <Mascot
          mood={isPerfect ? 'celebrating' : isGood ? 'happy' : 'encouraging'}
          size="lg"
          message={isPerfect ? 'Perfect!' : isGood ? 'Great job!' : 'Good try!'}
        />
      </motion.div>

      {/* Title */}
      <motion.h2
        className="text-2xl font-bold text-text-primary"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {isPerfect ? 'Perfect Score!' : isGood ? 'Well Done!' : 'Nice Try!'}
      </motion.h2>

      {/* Stars */}
      <motion.div
        className="flex gap-2 text-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {Array.from({ length: totalQuestions }, (_, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4 + i * 0.1, type: 'spring' }}
          >
            {i < correctCount ? (
              <span className="text-yellow-400">&#9733;</span>
            ) : (
              <span className="text-gray-300">&#9734;</span>
            )}
          </motion.span>
        ))}
      </motion.div>

      {/* Score */}
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-text-secondary">
          {correctCount} of {totalQuestions} correct
        </p>
        <motion.p
          className="text-3xl font-bold text-primary mt-2"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ delay: 0.6 }}
        >
          +{totalScore} points!
        </motion.p>
      </motion.div>

      {/* Actions */}
      <motion.div
        className="flex flex-col gap-3 w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Button variant="primary" size="lg" onClick={onPlayAgain}>
          Play Again
        </Button>
        {onChangeTopic && (
          <Button variant="secondary" size="lg" onClick={onChangeTopic}>
            Change Topic
          </Button>
        )}
        <Button variant="ghost" size="lg" onClick={onExit}>
          Back to Games
        </Button>
      </motion.div>
    </motion.div>
  );
}
