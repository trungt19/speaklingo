'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export function Card({ children, className, animate = true }: CardProps) {
  if (!animate) {
    return (
      <div
        className={cn(
          'bg-white rounded-3xl shadow-sm p-6 border border-gray-100',
          className
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: 'tween' as const, duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        'bg-white rounded-3xl shadow-sm p-6 border border-gray-100',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
