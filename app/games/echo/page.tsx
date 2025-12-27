'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GameTopic, EchoPhrase } from '@/types';
import { GameHeader } from '@/components/games/GameHeader';
import { TopicSelector } from '@/components/games/TopicSelector';
import { GameCompletion } from '@/components/games/GameCompletion';
import { Mascot } from '@/components/ui/Mascot';
import { Button } from '@/components/ui/Button';
import { getEchoPhrases, GAME_INFO } from '@/lib/gameContent';
import { useSounds } from '@/hooks/useSounds';
import { useGamification } from '@/hooks/useGamification';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

type GamePhase = 'topic' | 'listening' | 'speaking' | 'feedback' | 'complete';

const TOTAL_ROUNDS = 4;

export default function EchoGamePage() {
  const router = useRouter();
  const { playSound } = useSounds();
  const { processGameComplete } = useGamification();
  const speech = useSpeechRecognition();

  // Game state
  const [phase, setPhase] = useState<GamePhase>('topic');
  const [topic, setTopic] = useState<GameTopic | null>(null);
  const [phrases, setPhrases] = useState<EchoPhrase[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Current round state
  const [isPlaying, setIsPlaying] = useState(false);
  const [userSaid, setUserSaid] = useState('');
  const [matchResult, setMatchResult] = useState<'perfect' | 'good' | 'try-again' | null>(null);

  // Start game
  const startGame = (selectedTopic: GameTopic) => {
    setTopic(selectedTopic);
    const gamePhrases = getEchoPhrases(selectedTopic, TOTAL_ROUNDS);
    setPhrases(gamePhrases);
    setCurrentRound(0);
    setScore(0);
    setCorrectCount(0);
    playPhrase(gamePhrases[0]);
  };

  // Play phrase using Text-to-Speech
  const playPhrase = useCallback((phrase: EchoPhrase) => {
    setPhase('listening');
    setIsPlaying(true);
    setUserSaid('');
    setMatchResult(null);

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(phrase.text);
      utterance.rate = 0.8; // Slower for kids
      utterance.pitch = 1.1;
      utterance.lang = 'en-US';

      utterance.onend = () => {
        setIsPlaying(false);
        setPhase('speaking');
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback: just show the phrase
      setTimeout(() => {
        setIsPlaying(false);
        setPhase('speaking');
      }, 2000);
    }
  }, []);

  // Start listening for user's speech
  const startListening = async () => {
    try {
      const transcript = await speech.start();
      evaluateResponse(transcript);
    } catch {
      // Error handled by speech hook
      setPhase('speaking');
    }
  };

  // Evaluate user's response
  const evaluateResponse = (userTranscript: string) => {
    const currentPhrase = phrases[currentRound];
    if (!currentPhrase) return;

    setUserSaid(userTranscript);

    // Normalize for comparison
    const expected = currentPhrase.text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const actual = userTranscript.toLowerCase().replace(/[^a-z0-9\s]/g, '');

    // Calculate similarity
    const expectedWords = expected.split(/\s+/);
    const actualWords = actual.split(/\s+/);
    const matchedWords = expectedWords.filter((w) => actualWords.includes(w));
    const matchRatio = matchedWords.length / expectedWords.length;

    let result: 'perfect' | 'good' | 'try-again';
    let points = 0;

    if (matchRatio >= 0.9) {
      result = 'perfect';
      points = 15;
      setCorrectCount((c) => c + 1);
      playSound('success_chime');
    } else if (matchRatio >= 0.5) {
      result = 'good';
      points = 8;
      playSound('button_click');
    } else {
      result = 'try-again';
      points = 3; // Participation points
    }

    setMatchResult(result);
    setScore((s) => s + points);
    setPhase('feedback');

    // Move to next round after feedback
    setTimeout(() => {
      if (currentRound < TOTAL_ROUNDS - 1) {
        setCurrentRound((r) => r + 1);
        playPhrase(phrases[currentRound + 1]);
      } else {
        const isPerfect = correctCount + (result === 'perfect' ? 1 : 0) === TOTAL_ROUNDS;
        const finalScore = score + points + (isPerfect ? 20 : 0);
        if (isPerfect) setScore(finalScore);
        processGameComplete(isPerfect, finalScore);
        playSound('confetti');
        setPhase('complete');
      }
    }, 2500);
  };

  // Replay current phrase
  const replayPhrase = () => {
    if (phrases[currentRound]) {
      playPhrase(phrases[currentRound]);
    }
  };

  // Play again
  const playAgain = () => {
    if (topic) startGame(topic);
  };

  // Change topic
  const changeTopic = () => {
    setPhase('topic');
    setTopic(null);
  };

  const currentPhrase = phrases[currentRound];

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
                {GAME_INFO.echo.name}
              </h1>
              <div className="w-12" />
            </div>

            {!speech.isSupported && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-center">
                <p className="text-yellow-800">
                  Speech recognition not available. Try Chrome or Safari.
                </p>
              </div>
            )}

            <TopicSelector onSelect={startGame} />
          </motion.div>
        )}

        {/* Listening to phrase */}
        {phase === 'listening' && currentPhrase && (
          <motion.div
            key="listening"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GameHeader
              title={GAME_INFO.echo.name}
              currentRound={currentRound}
              totalRounds={TOTAL_ROUNDS}
              score={score}
              onExit={() => router.push('/games')}
            />

            <div className="flex flex-col items-center justify-center min-h-[50vh]">
              <motion.div
                className="text-8xl mb-6"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                {currentPhrase.emoji}
              </motion.div>

              <motion.div
                className="flex items-center gap-2 text-primary"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                <span className="text-2xl">🔊</span>
                <span className="text-xl font-medium">Listen...</span>
              </motion.div>

              <p className="text-3xl font-bold text-text-primary mt-6">
                {currentPhrase.text}
              </p>
            </div>
          </motion.div>
        )}

        {/* Speaking turn */}
        {phase === 'speaking' && currentPhrase && (
          <motion.div
            key="speaking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GameHeader
              title={GAME_INFO.echo.name}
              currentRound={currentRound}
              totalRounds={TOTAL_ROUNDS}
              score={score}
              onExit={() => router.push('/games')}
            />

            <div className="flex flex-col items-center justify-center min-h-[50vh]">
              <Mascot mood="encouraging" size="md" message="Your turn!" />

              <p className="text-3xl font-bold text-text-primary mt-4 mb-2">
                {currentPhrase.text}
              </p>
              <p className="text-6xl mb-8">{currentPhrase.emoji}</p>

              <div className="flex gap-4">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={replayPhrase}
                  disabled={speech.isListening}
                >
                  🔊 Hear Again
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={startListening}
                  disabled={speech.isListening}
                >
                  {speech.isListening ? (
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      🎤 Listening...
                    </motion.span>
                  ) : (
                    '🎤 Speak Now'
                  )}
                </Button>
              </div>

              {speech.error && (
                <p className="text-error mt-4 text-sm">{speech.error}</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Feedback */}
        {phase === 'feedback' && currentPhrase && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GameHeader
              title={GAME_INFO.echo.name}
              currentRound={currentRound}
              totalRounds={TOTAL_ROUNDS}
              score={score}
              onExit={() => router.push('/games')}
            />

            <div className="flex flex-col items-center justify-center min-h-[50vh]">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <Mascot
                  mood={matchResult === 'perfect' ? 'celebrating' : matchResult === 'good' ? 'happy' : 'encouraging'}
                  size="lg"
                  message={
                    matchResult === 'perfect'
                      ? 'Perfect!'
                      : matchResult === 'good'
                      ? 'Good job!'
                      : 'Nice try!'
                  }
                />
              </motion.div>

              <div className="mt-6 text-center">
                <p className="text-text-secondary mb-2">You said:</p>
                <p className="text-2xl font-medium text-text-primary">
                  "{userSaid || '...'}"
                </p>
              </div>

              <motion.div
                className={`mt-4 px-6 py-3 rounded-full text-lg font-bold ${
                  matchResult === 'perfect'
                    ? 'bg-success/20 text-success'
                    : matchResult === 'good'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {matchResult === 'perfect' && '⭐ Perfect Match!'}
                {matchResult === 'good' && '👍 Good Try!'}
                {matchResult === 'try-again' && '💪 Keep Practicing!'}
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Complete */}
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
              totalQuestions={TOTAL_ROUNDS}
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
