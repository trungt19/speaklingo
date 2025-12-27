'use client';

import { motion } from 'framer-motion';
import { MascotMood } from '@/types';

interface MascotProps {
  mood: MascotMood;
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export function Mascot({ mood, size = 'md', message }: MascotProps) {
  const sizes = {
    sm: 80,
    md: 120,
    lg: 180,
  };

  const dimension = sizes[size];

  // Body animations based on mood
  const bodyVariants = {
    idle: {
      y: [0, -3, 0],
      transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' as const },
    },
    happy: {
      y: [0, -6, 0],
      transition: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' as const },
    },
    excited: {
      y: [0, -10, 0],
      rotate: [0, -3, 3, 0],
      transition: { repeat: Infinity, duration: 0.6 },
    },
    encouraging: {
      rotate: [0, 3, -3, 0],
      transition: { repeat: Infinity, duration: 2 },
    },
    celebrating: {
      y: [0, -15, 0],
      scale: [1, 1.05, 1],
      transition: { repeat: Infinity, duration: 0.5 },
    },
    thinking: {
      rotate: 5,
      transition: { duration: 0.3 },
    },
  };

  // Eye animations based on mood
  const getEyeScale = () => {
    switch (mood) {
      case 'happy':
      case 'celebrating':
        return 0.7; // Squished = happy
      case 'excited':
        return 1.1;
      default:
        return 1;
    }
  };

  const showBlush = mood === 'happy' || mood === 'celebrating' || mood === 'excited';

  return (
    <div className="relative inline-flex flex-col items-center">
      {/* Speech bubble */}
      {message && (
        <motion.div
          className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white rounded-2xl px-4 py-2 shadow-lg border border-gray-100 whitespace-nowrap z-10"
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <p className="text-sm font-medium text-gray-700">{message}</p>
          {/* Bubble tail */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white" />
        </motion.div>
      )}

      {/* Owl mascot */}
      <motion.svg
        width={dimension}
        height={dimension}
        viewBox="0 0 100 100"
        variants={bodyVariants}
        animate={mood}
      >
        {/* Body - friendly green owl */}
        <ellipse cx="50" cy="55" rx="38" ry="40" fill="#7BA591" />

        {/* Belly */}
        <ellipse cx="50" cy="62" rx="26" ry="28" fill="#A8D4BB" />

        {/* Ear tufts */}
        <path d="M 22 22 Q 28 35 18 32 Z" fill="#7BA591" />
        <path d="M 78 22 Q 72 35 82 32 Z" fill="#7BA591" />

        {/* Left eye white */}
        <circle cx="35" cy="45" r="14" fill="white" />
        {/* Right eye white */}
        <circle cx="65" cy="45" r="14" fill="white" />

        {/* Left eye pupil */}
        <motion.g
          animate={{ scaleY: getEyeScale() }}
          style={{ originX: '35px', originY: '45px' }}
        >
          <circle cx="37" cy="45" r="7" fill="#2C3E50" />
          <circle cx="39" cy="43" r="2.5" fill="white" />
        </motion.g>

        {/* Right eye pupil */}
        <motion.g
          animate={{ scaleY: getEyeScale() }}
          style={{ originX: '65px', originY: '45px' }}
        >
          <circle cx="67" cy="45" r="7" fill="#2C3E50" />
          <circle cx="69" cy="43" r="2.5" fill="white" />
        </motion.g>

        {/* Beak */}
        <path d="M 44 56 L 50 65 L 56 56 Z" fill="#F2C94C" />

        {/* Blush circles when happy */}
        {showBlush && (
          <>
            <circle cx="22" cy="55" r="6" fill="#FFB3B3" opacity="0.5" />
            <circle cx="78" cy="55" r="6" fill="#FFB3B3" opacity="0.5" />
          </>
        )}

        {/* Wings (simple) */}
        <ellipse cx="15" cy="60" rx="8" ry="15" fill="#6A9A80" />
        <ellipse cx="85" cy="60" rx="8" ry="15" fill="#6A9A80" />

        {/* Feet */}
        <ellipse cx="40" cy="92" rx="8" ry="4" fill="#F2C94C" />
        <ellipse cx="60" cy="92" rx="8" ry="4" fill="#F2C94C" />
      </motion.svg>
    </div>
  );
}
