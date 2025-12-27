'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface GameCardProps {
  title: string;
  description: string;
  emoji: string;
  href: string;
  color?: string;
}

export function GameCard({
  title,
  description,
  emoji,
  href,
  color = 'from-primary to-secondary',
}: GameCardProps) {
  return (
    <Link href={href}>
      <motion.div
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${color} p-6 shadow-lg cursor-pointer`}
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Emoji icon */}
        <motion.div
          className="text-6xl mb-4"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          {emoji}
        </motion.div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-1">{title}</h3>

        {/* Description */}
        <p className="text-white/80 text-sm">{description}</p>

        {/* Decorative circle */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full" />
      </motion.div>
    </Link>
  );
}
