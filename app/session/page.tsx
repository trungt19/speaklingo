'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ProgressIndicator } from '@/components/session/ProgressIndicator';
import { PromptCard } from '@/components/session/PromptCard';
import { SpeechButton } from '@/components/session/SpeechButton';
import { FeedbackDisplay } from '@/components/session/FeedbackDisplay';
import { LoadingIndicator } from '@/components/session/LoadingIndicator';
import { CompletionScreen } from '@/components/session/CompletionScreen';
import { useSession } from '@/hooks/useSession';
import { useSettings } from '@/hooks/useSettings';

export default function SessionPage() {
  const router = useRouter();
  const { settings, isLoading: settingsLoading } = useSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize session hook with settings
  const session = useSession({
    promptsPerSession: settings.promptsPerSession,
    promptDifficulty: settings.promptDifficulty,
    requireTyping: settings.requireTyping,
  });

  const {
    phase,
    currentPrompt,
    currentPromptIndex,
    totalPrompts,
    typedText,
    transcript,
    feedback,
    attempts,
    isProcessing,
    isLastPrompt,
    setTypedText,
    handleTypingComplete,
    handleSpeechComplete,
    handleNextPrompt,
    handleSkip,
    handleExit,
    completeSession,
  } = session;

  // Handle completion
  const handleDone = async () => {
    if (phase === 'complete') {
      await completeSession();
    }
    router.push('/');
  };

  // Handle exit early
  const handleExitEarly = async () => {
    await handleExit();
    router.push('/');
  };

  if (!mounted || settingsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-text-secondary">Getting ready...</p>
        </div>
      </div>
    );
  }

  const completedCount = attempts.filter((a) => !a.skipped).length;

  return (
    <div className="min-h-screen bg-background flex flex-col p-6 md:p-8 relative">
      {/* Header with progress */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex-1">
          {phase !== 'complete' && (
            <ProgressIndicator
              current={currentPromptIndex + 1}
              total={totalPrompts}
            />
          )}
        </div>

        {/* Exit button - always visible except on completion */}
        {phase !== 'complete' && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExitEarly}
            className="ml-4"
          >
            I&apos;m Done
          </Button>
        )}
      </div>

      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {/* Prompt phase - typing */}
          {phase === 'prompt' && currentPrompt && (
            <motion.div
              key="prompt"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="w-full"
            >
              <PromptCard
                prompt={currentPrompt}
                typedText={typedText}
                onTypedChange={setTypedText}
                onSubmit={handleTypingComplete}
                onSkip={handleSkip}
                requireTyping={settings.requireTyping}
              />
            </motion.div>
          )}

          {/* Speaking phase */}
          {phase === 'speaking' && (
            <motion.div
              key="speaking"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="w-full"
            >
              <SpeechButton
                targetText={typedText}
                onTranscript={handleSpeechComplete}
                onSkip={handleSkip}
              />
            </motion.div>
          )}

          {/* Processing phase */}
          {phase === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex justify-center"
            >
              <LoadingIndicator message="Thinking..." />
            </motion.div>
          )}

          {/* Feedback phase */}
          {phase === 'feedback' && feedback && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="w-full"
            >
              <FeedbackDisplay
                feedback={feedback.feedbackForChild}
                transcript={transcript}
                onNext={handleNextPrompt}
                isLastPrompt={isLastPrompt}
              />
            </motion.div>
          )}

          {/* Completion phase */}
          {phase === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="w-full"
            >
              <CompletionScreen
                attemptsCount={attempts.length}
                completedCount={completedCount}
                onDone={handleDone}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
