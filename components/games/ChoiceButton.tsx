'use client';

import { motion } from 'framer-motion';

interface ChoiceButtonProps {
  emoji: string;
  label: string;
  isSelected?: boolean;
  isCorrect?: boolean;
  isWrong?: boolean;
  disabled?: boolean;
  onClick: () => void;
  size?: 'md' | 'lg';
}

export function ChoiceButton({
  emoji,
  label,
  isSelected = false,
  isCorrect = false,
  isWrong = false,
  disabled = false,
  onClick,
  size = 'lg',
}: ChoiceButtonProps) {
  const sizeClasses = {
    md: 'w-24 h-24 text-4xl',
    lg: 'w-32 h-32 text-5xl',
  };

  const getBackgroundClass = () => {
    if (isCorrect) return 'bg-success/20 border-success ring-4 ring-success/30';
    if (isWrong) return 'bg-error/20 border-error ring-4 ring-error/30';
    if (isSelected) return 'bg-primary/20 border-primary ring-4 ring-primary/30';
    return 'bg-white border-gray-200 hover:border-primary/50 hover:bg-primary/5';
  };

  return (
    <motion.button
      className={`
        ${sizeClasses[size]}
        ${getBackgroundClass()}
        rounded-2xl border-2 flex flex-col items-center justify-center
        transition-colors duration-200 shadow-sm
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      animate={
        isWrong
          ? { x: [0, -10, 10, -10, 10, 0] }
          : isCorrect
          ? { scale: [1, 1.1, 1] }
          : {}
      }
      transition={{ duration: 0.3 }}
    >
      <span className="mb-1">{emoji}</span>
      <span className="text-xs font-medium text-text-secondary">{label}</span>
    </motion.button>
  );
}
