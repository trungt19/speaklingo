'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface FeedbackDisplayProps {
  feedback: string;
  transcript: string;
  onNext: () => void;
  isLastPrompt?: boolean;
}

export function FeedbackDisplay({
  feedback,
  transcript,
  onNext,
  isLastPrompt = false,
}: FeedbackDisplayProps) {
  return (
    <motion.div
      className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'tween', duration: 0.3 }}
    >
      {/* Gentle glow effect */}
      <motion.div
        className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <motion.span
          className="text-4xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
        >
          *
        </motion.span>
      </motion.div>

      {/* What they said */}
      <div>
        <p className="text-text-secondary text-lg mb-2">You said:</p>
        <p className="text-2xl text-text-primary font-medium">
          &ldquo;{transcript}&rdquo;
        </p>
      </div>

      {/* Feedback message */}
      <motion.div
        className="bg-success/10 px-6 py-4 rounded-2xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-xl text-text-primary">{feedback}</p>
      </motion.div>

      {/* Next button */}
      <Button variant="primary" size="lg" onClick={onNext}>
        {isLastPrompt ? "I'm Done" : 'Next Question'}
      </Button>
    </motion.div>
  );
}
