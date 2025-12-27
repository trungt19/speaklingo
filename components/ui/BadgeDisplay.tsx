'use client';

import { motion } from 'framer-motion';
import { BadgeDefinition, EarnedBadge } from '@/types';
import { getRarityColor, getBadgeById } from '@/lib/gamification';

interface BadgeDisplayProps {
  earnedBadges: EarnedBadge[];
  showMax?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function BadgeDisplay({
  earnedBadges,
  showMax = 3,
  size = 'md',
}: BadgeDisplayProps) {
  const sizes = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl',
  };

  const displayBadges = earnedBadges
    .slice(-showMax)
    .reverse()
    .map((eb) => getBadgeById(eb.badgeId))
    .filter(Boolean) as BadgeDefinition[];

  if (displayBadges.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {displayBadges.map((badge, index) => (
        <motion.div
          key={badge.id}
          className={`${sizes[size]} rounded-full flex items-center justify-center shadow-md`}
          style={{
            backgroundColor: getRarityColor(badge.rarity),
          }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: index * 0.1,
          }}
          whileHover={{ scale: 1.15, rotate: 10 }}
          title={`${badge.name}: ${badge.description}`}
        >
          {badge.icon}
        </motion.div>
      ))}
      {earnedBadges.length > showMax && (
        <span className="text-sm text-gray-500">
          +{earnedBadges.length - showMax}
        </span>
      )}
    </div>
  );
}

// Single badge for celebration overlay
interface BadgeCelebrationProps {
  badge: BadgeDefinition;
}

export function BadgeCelebration({ badge }: BadgeCelebrationProps) {
  return (
    <motion.div
      className="flex flex-col items-center gap-3"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    >
      <motion.div
        className="w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-xl"
        style={{ backgroundColor: getRarityColor(badge.rarity) }}
        animate={{
          boxShadow: [
            `0 0 20px ${getRarityColor(badge.rarity)}`,
            `0 0 40px ${getRarityColor(badge.rarity)}`,
            `0 0 20px ${getRarityColor(badge.rarity)}`,
          ],
        }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        {badge.icon}
      </motion.div>
      <div className="text-center">
        <p className="text-lg font-bold text-gray-800">{badge.name}</p>
        <p className="text-sm text-gray-600">{badge.description}</p>
      </div>
    </motion.div>
  );
}
