'use client';

import { motion } from 'framer-motion';

interface LoadingIndicatorProps {
  message?: string;
}

export function LoadingIndicator({
  message = 'Thinking...',
}: LoadingIndicatorProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Gentle pulsing dots */}
      <div className="flex gap-3">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-4 h-4 rounded-full bg-primary"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <p className="text-xl text-text-secondary">{message}</p>
    </motion.div>
  );
}
