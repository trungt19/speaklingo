'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface CompletionScreenProps {
  attemptsCount: number;
  completedCount: number;
  onDone: () => void;
}

export function CompletionScreen({
  attemptsCount,
  completedCount,
  onDone,
}: CompletionScreenProps) {
  return (
    <motion.div
      className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'tween', duration: 0.3 }}
    >
      {/* Celebration (gentle) */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
      >
        <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center">
          <span className="text-5xl">*</span>
        </div>
      </motion.div>

      {/* Message */}
      <motion.h2
        className="text-3xl font-semibold text-text-primary"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Nice work today!
      </motion.h2>

      {/* Stats */}
      <motion.div
        className="flex items-center gap-2 text-2xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {/* Stars for completed */}
        {Array.from({ length: completedCount }, (_, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5 + i * 0.1, type: 'spring' }}
          >
            *
          </motion.span>
        ))}
        {/* Empty circles for skipped */}
        {Array.from({ length: attemptsCount - completedCount }, (_, i) => (
          <span key={`empty-${i}`} className="text-gray-300">
            o
          </span>
        ))}
      </motion.div>

      <motion.p
        className="text-text-secondary text-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        You answered {completedCount} question{completedCount !== 1 ? 's' : ''}
      </motion.p>

      {/* Done button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Button variant="primary" size="xl" onClick={onDone}>
          All Done
        </Button>
      </motion.div>
    </motion.div>
  );
}
