'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Prompt } from '@/types';

interface PromptCardProps {
  prompt: Prompt;
  typedText: string;
  onTypedChange: (text: string) => void;
  onSubmit: () => void;
  onSkip: () => void;
  requireTyping?: boolean;
}

export function PromptCard({
  prompt,
  typedText,
  onTypedChange,
  onSubmit,
  onSkip,
  requireTyping = true,
}: PromptCardProps) {
  const canProceed = !requireTyping || typedText.trim().length > 0;

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'tween', duration: 0.3 }}
    >
      {/* Question */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-text-primary leading-relaxed">
          {prompt.questionText}
        </h2>
      </div>

      {/* Text Input */}
      <div className="mb-6">
        <textarea
          className="w-full min-h-[150px] p-5 text-xl text-text-primary bg-white rounded-2xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none resize-none transition-all duration-300 placeholder:text-gray-400"
          placeholder="Type your answer here..."
          value={typedText}
          onChange={(e) => onTypedChange(e.target.value)}
          autoFocus
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="primary"
          size="lg"
          onClick={onSubmit}
          disabled={!canProceed}
          className={!canProceed ? 'opacity-50' : ''}
        >
          Now say it out loud
        </Button>

        <Button variant="ghost" size="lg" onClick={onSkip}>
          Skip
        </Button>
      </div>

      {/* Helper text */}
      {requireTyping && typedText.trim().length === 0 && (
        <p className="text-center text-text-secondary mt-4 text-sm">
          Type something first, then you can say it
        </p>
      )}
    </motion.div>
  );
}
