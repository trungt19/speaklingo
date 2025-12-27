'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GameTopic, QuizQuestion } from '@/types';
import { GameHeader } from '@/components/games/GameHeader';
import { ChoiceButton } from '@/components/games/ChoiceButton';
import { TopicSelector } from '@/components/games/TopicSelector';
import { GameCompletion } from '@/components/games/GameCompletion';
import { Mascot } from '@/components/ui/Mascot';
import { generateQuizQuestions, GAME_INFO } from '@/lib/gameContent';
import { useSounds } from '@/hooks/useSounds';

type GamePhase = 'topic' | 'playing' | 'feedback' | 'complete';

const ROUNDS = 5;

export default function QuizGamePage() {
  const router = useRouter();
  const { playSound } = useSounds();

  // Game state
  const [phase, setPhase] = useState<GamePhase>('topic');
  const [topic, setTopic] = useState<GameTopic | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Start game with selected topic
  const startGame = (selectedTopic: GameTopic) => {
    setTopic(selectedTopic);
    const generatedQuestions = generateQuizQuestions(selectedTopic, ROUNDS);
    setQuestions(generatedQuestions);
    setCurrentRound(0);
    setScore(0);
    setCorrectCount(0);
    setSelectedId(null);
    setIsCorrect(null);
    setPhase('playing');
  };

  // Handle answer selection
  const handleSelect = (choiceId: string) => {
    if (selectedId !== null) return; // Already selected

    const currentQuestion = questions[currentRound];
    const choice = currentQuestion.choices.find((c) => c.id === choiceId);
    const correct = choice?.isCorrect || false;

    setSelectedId(choiceId);
    setIsCorrect(correct);

    if (correct) {
      playSound('success_chime');
      const points = 10;
      setScore((s) => s + points);
      setCorrectCount((c) => c + 1);
    } else {
      playSound('button_click');
    }

    // Show feedback briefly, then move to next
    setTimeout(() => {
      setPhase('feedback');
    }, 800);
  };

  // Proceed to next round
  const nextRound = () => {
    if (currentRound >= ROUNDS - 1) {
      // Add bonus for perfect game
      if (correctCount === ROUNDS) {
        setScore((s) => s + 15);
        playSound('confetti');
      }
      setPhase('complete');
    } else {
      setCurrentRound((r) => r + 1);
      setSelectedId(null);
      setIsCorrect(null);
      setPhase('playing');
    }
  };

  // Auto-advance from feedback
  useEffect(() => {
    if (phase === 'feedback') {
      const timer = setTimeout(nextRound, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Play again with same topic
  const playAgain = () => {
    if (topic) {
      startGame(topic);
    }
  };

  // Change topic
  const changeTopic = () => {
    setPhase('topic');
    setTopic(null);
  };

  const currentQuestion = questions[currentRound];

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <AnimatePresence mode="wait">
        {/* Topic Selection */}
        {phase === 'topic' && (
          <motion.div
            key="topic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex justify-between items-center mb-8">
              <button
                onClick={() => router.push('/games')}
                className="text-text-secondary hover:text-primary transition-colors"
              >
                &larr; Back
              </button>
              <h1 className="text-xl font-bold text-text-primary">
                {GAME_INFO.quiz.name}
              </h1>
              <div className="w-12" />
            </div>
            <TopicSelector onSelect={startGame} />
          </motion.div>
        )}

        {/* Playing */}
        {(phase === 'playing' || phase === 'feedback') && currentQuestion && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GameHeader
              title={GAME_INFO.quiz.name}
              currentRound={currentRound}
              totalRounds={ROUNDS}
              score={score}
              onExit={() => router.push('/games')}
            />

            <div className="max-w-md mx-auto">
              {/* Mascot with question */}
              <motion.div
                className="flex flex-col items-center mb-8"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Mascot
                  mood={
                    phase === 'feedback'
                      ? isCorrect
                        ? 'celebrating'
                        : 'encouraging'
                      : 'thinking'
                  }
                  size="md"
                  message={
                    phase === 'feedback'
                      ? isCorrect
                        ? 'Great!'
                        : 'Try again!'
                      : undefined
                  }
                />
              </motion.div>

              {/* Question */}
              <motion.h2
                className="text-xl font-semibold text-text-primary text-center mb-8"
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {currentQuestion.questionText}
              </motion.h2>

              {/* Choices grid */}
              <div className="grid grid-cols-2 gap-4 justify-items-center">
                {currentQuestion.choices.map((choice, index) => (
                  <motion.div
                    key={choice.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ChoiceButton
                      emoji={choice.emoji}
                      label={choice.label}
                      isSelected={selectedId === choice.id}
                      isCorrect={selectedId !== null && choice.isCorrect}
                      isWrong={selectedId === choice.id && !choice.isCorrect}
                      disabled={selectedId !== null}
                      onClick={() => handleSelect(choice.id)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Completion */}
        {phase === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-8"
          >
            <GameCompletion
              totalScore={score}
              correctCount={correctCount}
              totalQuestions={ROUNDS}
              onPlayAgain={playAgain}
              onChangeTopic={changeTopic}
              onExit={() => router.push('/games')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
