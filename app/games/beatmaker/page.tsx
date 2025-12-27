'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BeatPattern } from '@/types';
import { GameHeader } from '@/components/games/GameHeader';
import { GameCompletion } from '@/components/games/GameCompletion';
import { Mascot } from '@/components/ui/Mascot';
import { Button } from '@/components/ui/Button';
import { getBeatPatterns, GAME_INFO } from '@/lib/gameContent';
import { useSounds } from '@/hooks/useSounds';
import { useGamification } from '@/hooks/useGamification';

type GamePhase = 'intro' | 'demo' | 'playing' | 'feedback' | 'complete';

const TOTAL_ROUNDS = 4;

export default function BeatMakerGamePage() {
  const router = useRouter();
  const { playSound } = useSounds();
  const { processGameComplete } = useGamification();

  // Game state
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [patterns, setPatterns] = useState<BeatPattern[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);

  // Current round state
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [playerPattern, setPlayerPattern] = useState<boolean[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const beatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Play a drum sound
  const playDrumBeat = useCallback(() => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 150;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  }, []);

  // Start the game
  const startGame = () => {
    const gamePatterns = getBeatPatterns(TOTAL_ROUNDS);
    setPatterns(gamePatterns);
    setCurrentRound(0);
    setScore(0);
    setPerfectCount(0);
    startDemo(gamePatterns[0]);
  };

  // Play demo of pattern
  const startDemo = (pattern: BeatPattern) => {
    setPhase('demo');
    setCurrentBeat(-1);
    setPlayerPattern([]);
    setIsCorrect(null);

    const beatDuration = 60000 / pattern.bpm;
    let beat = 0;

    beatIntervalRef.current = setInterval(() => {
      setCurrentBeat(beat);

      if (pattern.pattern[beat]) {
        playDrumBeat();
      }

      beat++;
      if (beat >= pattern.pattern.length) {
        if (beatIntervalRef.current) {
          clearInterval(beatIntervalRef.current);
        }
        setTimeout(() => {
          setPhase('playing');
          setCurrentBeat(-1);
          startPlayerTurn(pattern);
        }, 500);
      }
    }, beatDuration);
  };

  // Start player's turn
  const startPlayerTurn = (pattern: BeatPattern) => {
    const beatDuration = 60000 / pattern.bpm;
    let beat = 0;

    setPlayerPattern(new Array(pattern.pattern.length).fill(false));

    beatIntervalRef.current = setInterval(() => {
      setCurrentBeat(beat);

      beat++;
      if (beat >= pattern.pattern.length) {
        if (beatIntervalRef.current) {
          clearInterval(beatIntervalRef.current);
        }
        setTimeout(() => evaluatePattern(), 300);
      }
    }, beatDuration);
  };

  // Handle drum tap
  const handleTap = () => {
    if (phase !== 'playing' || currentBeat < 0) return;

    playDrumBeat();

    setPlayerPattern((prev) => {
      const newPattern = [...prev];
      newPattern[currentBeat] = true;
      return newPattern;
    });
  };

  // Evaluate player's pattern
  const evaluatePattern = () => {
    const pattern = patterns[currentRound];
    if (!pattern) return;

    // Compare patterns
    let matches = 0;
    for (let i = 0; i < pattern.pattern.length; i++) {
      if (pattern.pattern[i] === playerPattern[i]) {
        matches++;
      }
    }

    const accuracy = matches / pattern.pattern.length;
    const isPerfect = accuracy === 1;

    if (isPerfect) {
      setPerfectCount((c) => c + 1);
      playSound('success_chime');
      setScore((s) => s + 20);
    } else if (accuracy >= 0.75) {
      playSound('button_click');
      setScore((s) => s + 10);
    } else {
      setScore((s) => s + 5);
    }

    setIsCorrect(isPerfect);
    setPhase('feedback');

    setTimeout(() => {
      if (currentRound < TOTAL_ROUNDS - 1) {
        setCurrentRound((r) => r + 1);
        startDemo(patterns[currentRound + 1]);
      } else {
        const allPerfect = perfectCount + (isPerfect ? 1 : 0) === TOTAL_ROUNDS;
        const finalScore = score + (isPerfect ? 20 : accuracy >= 0.75 ? 10 : 5) + (allPerfect ? 25 : 0);
        processGameComplete(allPerfect, finalScore);
        playSound('confetti');
        setPhase('complete');
      }
    }, 2000);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (beatIntervalRef.current) {
        clearInterval(beatIntervalRef.current);
      }
    };
  }, []);

  const currentPattern = patterns[currentRound];

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
                {GAME_INFO.beatmaker.name}
              </h1>
              <div className="w-12" />
            </div>

            <Mascot mood="excited" size="lg" message="Make some beats!" />

            <div className="mt-8 text-center max-w-sm">
              <p className="text-text-secondary mb-6">
                Watch the pattern, then tap the drum to copy it!
              </p>
              <Button variant="primary" size="lg" onClick={startGame}>
                Start Drumming!
              </Button>
            </div>
          </motion.div>
        )}

        {/* Demo & Playing */}
        {(phase === 'demo' || phase === 'playing' || phase === 'feedback') && currentPattern && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GameHeader
              title={GAME_INFO.beatmaker.name}
              currentRound={currentRound}
              totalRounds={TOTAL_ROUNDS}
              score={score}
              onExit={() => router.push('/games')}
            />

            <div className="flex flex-col items-center">
              {/* Phase indicator */}
              <div className="mb-4">
                <Mascot
                  mood={phase === 'feedback' ? (isCorrect ? 'celebrating' : 'encouraging') : 'thinking'}
                  size="sm"
                  message={
                    phase === 'demo'
                      ? 'Watch the pattern!'
                      : phase === 'playing'
                      ? 'Your turn!'
                      : isCorrect
                      ? 'Perfect!'
                      : 'Nice try!'
                  }
                />
              </div>

              {/* Pattern display */}
              <div className="flex gap-3 mb-8">
                {currentPattern.pattern.map((isBeat, index) => (
                  <motion.div
                    key={index}
                    className={`
                      w-14 h-14 rounded-xl flex items-center justify-center text-2xl
                      border-2 transition-all
                      ${
                        currentBeat === index
                          ? isBeat
                            ? 'bg-primary border-primary text-white scale-110'
                            : 'bg-gray-200 border-gray-300 scale-105'
                          : phase === 'feedback'
                          ? playerPattern[index] === isBeat
                            ? 'bg-success/20 border-success'
                            : 'bg-error/20 border-error'
                          : isBeat
                          ? 'bg-primary/20 border-primary/50'
                          : 'bg-gray-100 border-gray-200'
                      }
                    `}
                    animate={
                      currentBeat === index && isBeat
                        ? { scale: [1, 1.2, 1] }
                        : {}
                    }
                    transition={{ duration: 0.15 }}
                  >
                    {isBeat ? '🥁' : '·'}
                  </motion.div>
                ))}
              </div>

              {/* Drum button */}
              <motion.button
                className={`
                  w-40 h-40 rounded-full text-6xl
                  flex items-center justify-center
                  transition-all
                  ${
                    phase === 'playing'
                      ? 'bg-gradient-to-br from-orange-400 to-red-500 shadow-lg shadow-orange-300/50 cursor-pointer'
                      : 'bg-gray-300 cursor-not-allowed'
                  }
                `}
                onClick={handleTap}
                disabled={phase !== 'playing'}
                whileTap={phase === 'playing' ? { scale: 0.9 } : {}}
                animate={
                  phase === 'playing' && currentBeat >= 0
                    ? { boxShadow: ['0 0 0 0 rgba(251, 146, 60, 0.4)', '0 0 0 20px rgba(251, 146, 60, 0)', '0 0 0 0 rgba(251, 146, 60, 0)'] }
                    : {}
                }
                transition={{ duration: 0.5, repeat: phase === 'playing' ? Infinity : 0 }}
              >
                🥁
              </motion.button>

              {/* Instruction */}
              <p className="mt-6 text-text-secondary">
                {phase === 'demo' && 'Watch the pattern...'}
                {phase === 'playing' && 'Tap the drum!'}
                {phase === 'feedback' && (isCorrect ? 'You got it!' : 'Keep practicing!')}
              </p>
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
              correctCount={perfectCount}
              totalQuestions={TOTAL_ROUNDS}
              onPlayAgain={startGame}
              onExit={() => router.push('/games')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
