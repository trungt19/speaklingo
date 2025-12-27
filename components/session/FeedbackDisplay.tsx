'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Mascot } from '@/components/ui/Mascot';
import { PointsPopup } from '@/components/ui/PointsPopup';
import { Confetti } from '@/components/ui/Confetti';
import { MascotMood } from '@/types';

interface FeedbackDisplayProps {
  feedback: string;
  transcript: string;
  onNext: () => void;
  isLastPrompt?: boolean;
  // Gamification props
  pointsEarned?: number;
  clarity?: 'clear' | 'partial' | 'unclear';
  mascotMessage?: string;
}

export function FeedbackDisplay({
  feedback,
  transcript,
  onNext,
  isLastPrompt = false,
  pointsEarned = 0,
  clarity = 'partial',
  mascotMessage,
}: FeedbackDisplayProps) {
  // Determine mascot mood based on clarity
  const getMascotMood = (): MascotMood => {
    switch (clarity) {
      case 'clear':
        return 'celebrating';
      case 'partial':
        return 'happy';
      default:
        return 'encouraging';
    }
  };

  // Show confetti for clear answers
  const showConfetti = clarity === 'clear' && pointsEarned > 0;

  return (
    <motion.div
      className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto text-center relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'tween', duration: 0.3 }}
    >
      {/* Confetti for great answers */}
      <Confetti trigger={showConfetti} intensity="small" />

      {/* Points popup */}
      <PointsPopup points={pointsEarned} show={pointsEarned > 0} />

      {/* Mascot */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
      >
        <Mascot
          mood={getMascotMood()}
          size="md"
          message={mascotMessage}
        />
      </motion.div>

      {/* What they said */}
      <div>
        <p className="text-text-secondary text-base mb-1">You said:</p>
        <p className="text-xl text-text-primary font-medium">
          &ldquo;{transcript}&rdquo;
        </p>
      </div>

      {/* Feedback message */}
      <motion.div
        className="bg-success/10 px-6 py-4 rounded-2xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-lg text-text-primary">{feedback}</p>
      </motion.div>

      {/* Points earned indicator */}
      {pointsEarned > 0 && (
        <motion.div
          className="flex items-center gap-2 text-primary font-semibold"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="text-2xl">+{pointsEarned}</span>
          <span className="text-sm text-text-secondary">points</span>
        </motion.div>
      )}

      {/* Next button */}
      <Button variant="primary" size="lg" onClick={onNext}>
        {isLastPrompt ? "I'm Done" : 'Next Question'}
      </Button>
    </motion.div>
  );
}
