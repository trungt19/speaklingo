'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ConfettiProps {
  trigger: boolean;
  intensity?: 'small' | 'medium' | 'large';
  duration?: number;
  onComplete?: () => void;
}

interface Particle {
  id: number;
  x: number;
  delay: number;
  color: string;
  size: number;
  rotation: number;
}

const COLORS = [
  '#5B8DBE', // Primary blue
  '#7BA591', // Secondary green
  '#F2C94C', // Warning yellow
  '#6FCF97', // Success green
  '#EB5757', // Soft red
  '#9B59B6', // Purple
  '#F39C12', // Orange
];

export function Confetti({
  trigger,
  intensity = 'medium',
  duration = 2500,
  onComplete,
}: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  const particleCounts = {
    small: 15,
    medium: 30,
    large: 50,
  };

  useEffect(() => {
    if (trigger) {
      const count = particleCounts[intensity];
      const newParticles: Particle[] = [];

      for (let i = 0; i < count; i++) {
        newParticles.push({
          id: i,
          x: 10 + Math.random() * 80, // Percentage across screen
          delay: Math.random() * 0.3,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: 8 + Math.random() * 10,
          rotation: Math.random() * 360,
        });
      }

      setParticles(newParticles);

      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [trigger, intensity, duration, onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute"
            style={{
              left: `${particle.x}%`,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            }}
            initial={{
              y: -20,
              opacity: 1,
              rotate: 0,
            }}
            animate={{
              y: '100vh',
              opacity: [1, 1, 0.8, 0],
              rotate: particle.rotation + 720,
              x: [0, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 50],
            }}
            transition={{
              duration: 2 + Math.random() * 0.5,
              delay: particle.delay,
              ease: 'easeIn',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
