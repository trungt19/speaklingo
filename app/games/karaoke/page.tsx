'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { KaraokeLine, KaraokeWord } from '@/types';
import { GameHeader } from '@/components/games/GameHeader';
import { GameCompletion } from '@/components/games/GameCompletion';
import { Mascot } from '@/components/ui/Mascot';
import { Button } from '@/components/ui/Button';
import { getKaraokeLines, GAME_INFO } from '@/lib/gameContent';
import { useSounds } from '@/hooks/useSounds';
import { useGamification } from '@/hooks/useGamification';

type GamePhase = 'intro' | 'countdown' | 'playing' | 'feedback' | 'complete';

const TOTAL_ROUNDS = 4;

export default function KaraokeGamePage() {
  const router = useRouter();
  const { playSound } = useSounds();
  const { processGameComplete } = useGamification();

  // Game state
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [lines, setLines] = useState<KaraokeLine[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [perfectHits, setPerfectHits] = useState(0);

  // Current round state
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [tappedWords, setTappedWords] = useState<Set<string>>(new Set());
  const [hitResults, setHitResults] = useState<Map<string, 'perfect' | 'good' | 'miss'>>(new Map());
  const [countdown, setCountdown] = useState(3);

  const beatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start the game
  const startGame = () => {
    const gamelines = getKaraokeLines(TOTAL_ROUNDS);
    setLines(gamelines);
    setCurrentRound(0);
    setScore(0);
    setPerfectHits(0);
    startCountdown();
  };

  // Countdown before each round
  const startCountdown = () => {
    setCountdown(3);
    setPhase('countdown');
  };

  useEffect(() => {
    if (phase === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((c) => c - 1);
        playSound('button_click');
      }, 800);
      return () => clearTimeout(timer);
    } else if (phase === 'countdown' && countdown === 0) {
      startRound();
    }
  }, [phase, countdown]);

  // Start a round
  const startRound = () => {
    setCurrentBeat(-1);
    setTappedWords(new Set());
    setHitResults(new Map());
    setPhase('playing');

    const line = lines[currentRound];
    if (!line) return;

    const beatDuration = 60000 / line.bpm;
    let beat = -1;

    beatIntervalRef.current = setInterval(() => {
      beat++;
      setCurrentBeat(beat);

      // Check for missed words
      const missedWords = line.words.filter(
        (w) => w.beatIndex === beat - 1 && !tappedWords.has(w.id)
      );
      missedWords.forEach((w) => {
        setHitResults((prev) => new Map(prev).set(w.id, 'miss'));
      });

      // End round after all beats
      if (beat > Math.max(...line.words.map((w) => w.beatIndex)) + 1) {
        if (beatIntervalRef.current) {
          clearInterval(beatIntervalRef.current);
        }
        endRound();
      }
    }, beatDuration);
  };

  // Handle word tap
  const handleWordTap = useCallback(
    (word: KaraokeWord) => {
      if (tappedWords.has(word.id)) return;

      const newTapped = new Set(tappedWords);
      newTapped.add(word.id);
      setTappedWords(newTapped);

      // Check timing
      const timingDiff = Math.abs(currentBeat - word.beatIndex);
      let result: 'perfect' | 'good' | 'miss';
      let points = 0;

      if (timingDiff === 0) {
        result = 'perfect';
        points = 15;
        setPerfectHits((p) => p + 1);
        playSound('success_chime');
      } else if (timingDiff === 1) {
        result = 'good';
        points = 8;
        playSound('button_click');
      } else {
        result = 'miss';
        points = 0;
      }

      setHitResults((prev) => new Map(prev).set(word.id, result));
      setScore((s) => s + points);
    },
    [currentBeat, tappedWords, playSound]
  );

  // End the current round
  const endRound = () => {
    setPhase('feedback');
    setTimeout(() => {
      if (currentRound < TOTAL_ROUNDS - 1) {
        setCurrentRound((r) => r + 1);
        startCountdown();
      } else {
        // Calculate if perfect game
        const totalWords = lines.reduce((sum, l) => sum + l.words.length, 0);
        const isPerfect = perfectHits === totalWords;
        if (isPerfect) {
          setScore((s) => s + 20);
        }
        processGameComplete(isPerfect, score + (isPerfect ? 20 : 0));
        playSound('confetti');
        setPhase('complete');
      }
    }, 1500);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (beatIntervalRef.current) {
        clearInterval(beatIntervalRef.current);
      }
    };
  }, []);

  const currentLine = lines[currentRound];

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <AnimatePresence mode="wait">
        {/* Intro */}
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center"
          >
            <div className="flex justify-between items-center w-full mb-8">
              <button
                onClick={() => router.push('/games')}
                className="text-text-secondary hover:text-primary transition-colors"
              >
                &larr; Back
              </button>
              <h1 className="text-xl font-bold text-text-primary">
                {GAME_INFO.karaoke.name}
              </h1>
              <div className="w-12" />
            </div>

            <Mascot mood="excited" size="lg" message="Tap to the beat!" />

            <div className="mt-8 text-center max-w-sm">
              <p className="text-text-secondary mb-6">
                Words will light up to the rhythm. Tap each word when it glows!
              </p>
              <Button variant="primary" size="lg" onClick={startGame}>
                Start Rapping!
              </Button>
            </div>
          </motion.div>
        )}

        {/* Countdown */}
        {phase === 'countdown' && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh]"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="text-8xl font-bold text-primary"
            >
              {countdown || 'GO!'}
            </motion.div>
          </motion.div>
        )}

        {/* Playing */}
        {(phase === 'playing' || phase === 'feedback') && currentLine && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GameHeader
              title={GAME_INFO.karaoke.name}
              currentRound={currentRound}
              totalRounds={TOTAL_ROUNDS}
              score={score}
              onExit={() => router.push('/games')}
            />

            {/* Beat indicator */}
            <div className="flex justify-center gap-2 mb-8">
              {currentLine.words.map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-4 h-4 rounded-full ${
                    currentBeat === i
                      ? 'bg-primary'
                      : currentBeat > i
                      ? 'bg-gray-300'
                      : 'bg-gray-200'
                  }`}
                  animate={currentBeat === i ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.2 }}
                />
              ))}
            </div>

            {/* Words to tap */}
            <div className="flex flex-wrap justify-center gap-4 max-w-lg mx-auto">
              {currentLine.words.map((word) => {
                const isActive = currentBeat === word.beatIndex;
                const isTapped = tappedWords.has(word.id);
                const result = hitResults.get(word.id);

                return (
                  <motion.button
                    key={word.id}
                    className={`
                      px-6 py-4 rounded-2xl text-2xl font-bold min-w-[100px]
                      transition-all duration-150
                      ${
                        result === 'perfect'
                          ? 'bg-success text-white'
                          : result === 'good'
                          ? 'bg-yellow-400 text-white'
                          : result === 'miss'
                          ? 'bg-gray-300 text-gray-500'
                          : isActive
                          ? 'bg-primary text-white shadow-lg shadow-primary/50'
                          : isTapped
                          ? 'bg-gray-200 text-gray-400'
                          : 'bg-white text-text-primary border-2 border-gray-200'
                      }
                    `}
                    onClick={() => handleWordTap(word)}
                    disabled={isTapped || phase === 'feedback'}
                    animate={
                      isActive && !isTapped
                        ? { scale: [1, 1.1, 1] }
                        : result === 'perfect'
                        ? { scale: [1, 1.2, 1] }
                        : {}
                    }
                    transition={{ duration: 0.3, repeat: isActive ? Infinity : 0 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {word.text}
                  </motion.button>
                );
              })}
            </div>

            {/* Feedback message */}
            {phase === 'feedback' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mt-8"
              >
                <Mascot
                  mood={perfectHits > currentLine.words.length / 2 ? 'celebrating' : 'encouraging'}
                  size="sm"
                  message={perfectHits > currentLine.words.length / 2 ? 'Great rhythm!' : 'Keep practicing!'}
                />
              </motion.div>
            )}
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
              correctCount={perfectHits}
              totalQuestions={lines.reduce((sum, l) => sum + l.words.length, 0)}
              onPlayAgain={startGame}
              onExit={() => router.push('/games')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
