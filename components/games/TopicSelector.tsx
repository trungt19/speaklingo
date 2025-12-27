'use client';

import { motion } from 'framer-motion';
import { GameTopic } from '@/types';
import { TOPIC_INFO } from '@/lib/gameContent';

interface TopicSelectorProps {
  onSelect: (topic: GameTopic) => void;
  title?: string;
}

const TOPICS: GameTopic[] = ['emotions', 'greetings', 'colors', 'animals', 'numbers', 'objects'];

export function TopicSelector({ onSelect, title = 'Choose a Topic' }: TopicSelectorProps) {
  return (
    <motion.div
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-2xl font-bold text-text-primary text-center mb-6">{title}</h2>

      <div className="grid grid-cols-2 gap-4">
        {TOPICS.map((topic, index) => {
          const info = TOPIC_INFO[topic];
          return (
            <motion.button
              key={topic}
              className="flex flex-col items-center gap-2 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-primary/50 hover:bg-primary/5 transition-colors"
              onClick={() => onSelect(topic)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-4xl">{info.emoji}</span>
              <span className="font-semibold text-text-primary">{info.name}</span>
              <span className="text-xs text-text-secondary">{info.description}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
