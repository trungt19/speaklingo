'use client';

import { useState, useCallback, useRef } from 'react';
import {
  SessionPhase,
  SessionState,
  SessionAttempt,
  SessionRecord,
  Prompt,
  ClaudeResponse,
} from '@/types';
import { getSessionPrompts } from '@/lib/prompts';
import { generateId, getTodayDate } from '@/lib/utils';
import { saveSession } from '@/lib/storage';

interface UseSessionOptions {
  promptsPerSession: number;
  promptDifficulty: 1 | 2 | 3;
  requireTyping: boolean;
}

export function useSession(options: UseSessionOptions) {
  const [phase, setPhase] = useState<SessionPhase>('prompt');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState<ClaudeResponse | null>(null);
  const [attempts, setAttempts] = useState<SessionAttempt[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get prompts for this session
  const [prompts] = useState<Prompt[]>(() =>
    getSessionPrompts(options.promptDifficulty, options.promptsPerSession)
  );

  // Track timing
  const promptStartTime = useRef<Date>(new Date());
  const sessionStartTime = useRef<Date>(new Date());

  const currentPrompt = prompts[currentPromptIndex];
  const isLastPrompt = currentPromptIndex >= prompts.length - 1;

  // Reset for new prompt
  const resetForNewPrompt = useCallback(() => {
    setTypedText('');
    setTranscript('');
    setFeedback(null);
    setError(null);
    promptStartTime.current = new Date();
  }, []);

  // Move to typing complete (ready to speak)
  const handleTypingComplete = useCallback(() => {
    if (!options.requireTyping || typedText.trim().length > 0) {
      setPhase('speaking');
    }
  }, [options.requireTyping, typedText]);

  // Handle speech result
  const handleSpeechComplete = useCallback(
    async (spokenTranscript: string) => {
      setTranscript(spokenTranscript);
      setPhase('processing');
      setIsProcessing(true);
      setError(null);

      try {
        // Call Claude API
        const response = await fetch('/api/interpret', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            promptText: currentPrompt.questionText,
            typedResponse: typedText || null,
            spokenTranscript,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get interpretation');
        }

        const interpretation: ClaudeResponse = await response.json();
        setFeedback(interpretation);

        // Record attempt
        const attempt: SessionAttempt = {
          id: generateId(),
          timestamp: new Date(),
          promptId: currentPrompt.id,
          promptText: currentPrompt.questionText,
          typedResponse: typedText || undefined,
          spokenTranscript,
          skipped: false,
          interpretation: interpretation.interpretation,
          feedbackForChild: interpretation.feedbackForChild,
          insightForParent: interpretation.insightForParent,
          engagement: interpretation.engagement,
          clarity: interpretation.clarity,
          suggestedFollowUp: interpretation.suggestedFollowUp,
          durationSeconds: Math.round(
            (Date.now() - promptStartTime.current.getTime()) / 1000
          ),
        };

        setAttempts((prev) => [...prev, attempt]);
        setPhase('feedback');
      } catch (err) {
        console.error('Interpretation error:', err);
        setError('Something went wrong. Let\'s try again!');

        // Fallback response
        const fallbackFeedback: ClaudeResponse = {
          feedbackForChild: 'Great job speaking!',
          interpretation: spokenTranscript,
          engagement: 'neutral',
          clarity: 'partial',
          insightForParent: 'Unable to analyze - API error',
          suggestedFollowUp: 'Try asking about something else',
        };
        setFeedback(fallbackFeedback);

        // Still record the attempt
        const attempt: SessionAttempt = {
          id: generateId(),
          timestamp: new Date(),
          promptId: currentPrompt.id,
          promptText: currentPrompt.questionText,
          typedResponse: typedText || undefined,
          spokenTranscript,
          skipped: false,
          interpretation: spokenTranscript,
          feedbackForChild: fallbackFeedback.feedbackForChild,
          insightForParent: fallbackFeedback.insightForParent,
          engagement: 'neutral',
          clarity: 'partial',
          durationSeconds: Math.round(
            (Date.now() - promptStartTime.current.getTime()) / 1000
          ),
        };

        setAttempts((prev) => [...prev, attempt]);
        setPhase('feedback');
      } finally {
        setIsProcessing(false);
      }
    },
    [currentPrompt, typedText]
  );

  // Move to next prompt
  const handleNextPrompt = useCallback(() => {
    if (isLastPrompt) {
      setPhase('complete');
    } else {
      setCurrentPromptIndex((prev) => prev + 1);
      resetForNewPrompt();
      setPhase('prompt');
    }
  }, [isLastPrompt, resetForNewPrompt]);

  // Skip current prompt
  const handleSkip = useCallback(() => {
    // Record skipped attempt
    const attempt: SessionAttempt = {
      id: generateId(),
      timestamp: new Date(),
      promptId: currentPrompt.id,
      promptText: currentPrompt.questionText,
      typedResponse: typedText || undefined,
      spokenTranscript: '',
      skipped: true,
      interpretation: '',
      feedbackForChild: '',
      insightForParent: 'Prompt was skipped',
      engagement: 'disengaged',
      clarity: 'unclear',
      durationSeconds: Math.round(
        (Date.now() - promptStartTime.current.getTime()) / 1000
      ),
    };

    setAttempts((prev) => [...prev, attempt]);

    if (isLastPrompt) {
      setPhase('complete');
    } else {
      setCurrentPromptIndex((prev) => prev + 1);
      resetForNewPrompt();
      setPhase('prompt');
    }
  }, [currentPrompt, typedText, isLastPrompt, resetForNewPrompt]);

  // Exit session early
  const handleExit = useCallback(async () => {
    // Save whatever progress we have
    const session: SessionRecord = {
      id: generateId(),
      date: getTodayDate(),
      startTime: sessionStartTime.current,
      endTime: new Date(),
      attempts,
      completed: false,
    };

    if (attempts.length > 0) {
      await saveSession(session);
    }

    setPhase('complete');
    return session;
  }, [attempts]);

  // Complete session
  const completeSession = useCallback(async (): Promise<SessionRecord> => {
    const session: SessionRecord = {
      id: generateId(),
      date: getTodayDate(),
      startTime: sessionStartTime.current,
      endTime: new Date(),
      attempts,
      completed: true,
    };

    await saveSession(session);
    return session;
  }, [attempts]);

  // Get session state
  const state: SessionState = {
    currentPhase: phase,
    currentPromptIndex,
    totalPrompts: prompts.length,
    attempts,
    startTime: sessionStartTime.current,
  };

  return {
    // State
    phase,
    currentPrompt,
    currentPromptIndex,
    totalPrompts: prompts.length,
    typedText,
    transcript,
    feedback,
    attempts,
    isProcessing,
    error,
    state,
    isLastPrompt,

    // Actions
    setTypedText,
    handleTypingComplete,
    handleSpeechComplete,
    handleNextPrompt,
    handleSkip,
    handleExit,
    completeSession,
    clearError: () => setError(null),
  };
}
