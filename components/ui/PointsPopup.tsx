'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface PointsPopupProps {
  points: number;
  show: boolean;
}

export function PointsPopup({ points, show }: PointsPopupProps) {
  if (points <= 0) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: 1, y: -60, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <span className="text-5xl font-bold text-yellow-500 drop-shadow-lg">
            +{points}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
