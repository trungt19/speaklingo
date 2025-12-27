'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GameTopic, WordBuilderWord } from '@/types';
import { GameHeader } from '@/components/games/GameHeader';
import { TopicSelector } from '@/components/games/TopicSelector';
import { GameCompletion } from '@/components/games/GameCompletion';
import { Mascot } from '@/components/ui/Mascot';
import { getWordBuilderWords, GAME_INFO, shuffleArray } from '@/lib/gameContent';
import { useSounds } from '@/hooks/useSounds';
import { useGamification } from '@/hooks/useGamification';

type GamePhase = 'topic' | 'playing' | 'correct' | 'complete';

interface LetterTile {
  id: string;
  letter: string;
  used: boolean;
}

const TOTAL_ROUNDS = 4;

export default function WordBuilderGamePage() {
  const router = useRouter();
  const { playSound } = useSounds();
  const { processGameComplete } = useGamification();

  // Game state
  const [phase, setPhase] = useState<GamePhase>('topic');
  const [topic, setTopic] = useState<GameTopic | null>(null);
  const [words, setWords] = useState<WordBuilderWord[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Current round state
  const [letterTiles, setLetterTiles] = useState<LetterTile[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<LetterTile[]>([]);
  const [isWrong, setIsWrong] = useState(false);

  // Start game
  const startGame = (selectedTopic: GameTopic) => {
    setTopic(selectedTopic);
    const gameWords = getWordBuilderWords(selectedTopic, TOTAL_ROUNDS);
    setWords(gameWords);
    setCurrentRound(0);
    setScore(0);
    setCorrectCount(0);
    setupRound(gameWords[0]);
  };

  // Setup a round with scrambled letters
  const setupRound = (word: WordBuilderWord) => {
    const letters = word.word.split('').map((letter, index) => ({
      id: `${letter}-${index}`,
      letter,
      used: false,
    }));
    setLetterTiles(shuffleArray(letters));
    setSelectedLetters([]);
    setIsWrong(false);
    setPhase('playing');
  };

  // Handle letter tap
  const handleLetterTap = useCallback(
    (tile: LetterTile) => {
      if (tile.used || phase !== 'playing') return;

      playSound('button_click');

      // Add to selected
      const newSelected = [...selectedLetters, tile];
      setSelectedLetters(newSelected);

      // Mark as used
      setLetterTiles((prev) =>
        prev.map((t) => (t.id === tile.id ? { ...t, used: true } : t))
      );

      // Check if word is complete
      const currentWord = words[currentRound];
      const builtWord = newSelected.map((t) => t.letter).join('');

      if (builtWord.length === currentWord.word.length) {
        if (builtWord === currentWord.word) {
          // Correct!
          playSound('success_chime');
          setScore((s) => s + 15);
          setCorrectCount((c) => c + 1);
          setPhase('correct');

          setTimeout(() => {
            if (currentRound < TOTAL_ROUNDS - 1) {
              setCurrentRound((r) => r + 1);
              setupRound(words[currentRound + 1]);
            } else {
              const isPerfect = correctCount + 1 === TOTAL_ROUNDS;
              const finalScore = score + 15 + (isPerfect ? 20 : 0);
              if (isPerfect) setScore(finalScore);
              processGameComplete(isPerfect, finalScore);
              playSound('confetti');
              setPhase('complete');
            }
          }, 1500);
        } else {
          // Wrong - reset
          setIsWrong(true);
          setTimeout(() => {
            setLetterTiles((prev) => prev.map((t) => ({ ...t, used: false })));
            setSelectedLetters([]);
            setIsWrong(false);
          }, 800);
        }
      }
    },
    [selectedLetters, words, currentRound, phase, score, correctCount, playSound, processGameComplete]
  );

  // Remove last letter
  const handleUndo = () => {
    if (selectedLetters.length === 0) return;

    const lastLetter = selectedLetters[selectedLetters.length - 1];
    setSelectedLetters((prev) => prev.slice(0, -1));
    setLetterTiles((prev) =>
      prev.map((t) => (t.id === lastLetter.id ? { ...t, used: false } : t))
    );
  };

  // Clear all selected
  const handleClear = () => {
    setLetterTiles((prev) => prev.map((t) => ({ ...t, used: false })));
    setSelectedLetters([]);
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

  const currentWord = words[currentRound];

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
                {GAME_INFO.wordbuilder.name}
              </h1>
              <div className="w-12" />
            </div>
            <TopicSelector onSelect={startGame} />
          </motion.div>
        )}

        {/* Playing */}
        {(phase === 'playing' || phase === 'correct') && currentWord && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GameHeader
              title={GAME_INFO.wordbuilder.name}
              currentRound={currentRound}
              totalRounds={TOTAL_ROUNDS}
              score={score}
              onExit={() => router.push('/games')}
            />

            <div className="flex flex-col items-center max-w-md mx-auto">
              {/* Mascot and hint */}
              <div className="mb-4">
                <Mascot
                  mood={phase === 'correct' ? 'celebrating' : 'thinking'}
                  size="sm"
                  message={phase === 'correct' ? 'Correct!' : currentWord.hint}
                />
              </div>

              {/* Emoji clue */}
              <motion.div
                className="text-6xl mb-4"
                animate={phase === 'correct' ? { scale: [1, 1.2, 1] } : {}}
              >
                {currentWord.emoji}
              </motion.div>

              {/* Built word display */}
              <div className="flex gap-2 mb-6 min-h-[60px]">
                {currentWord.word.split('').map((_, index) => {
                  const letter = selectedLetters[index];
                  return (
                    <motion.div
                      key={index}
                      className={`
                        w-12 h-14 rounded-xl flex items-center justify-center
                        text-2xl font-bold border-2
                        ${
                          phase === 'correct'
                            ? 'bg-success/20 border-success text-success'
                            : isWrong
                            ? 'bg-error/20 border-error text-error'
                            : letter
                            ? 'bg-primary text-white border-primary'
                            : 'bg-gray-100 border-gray-300 text-gray-400'
                        }
                      `}
                      animate={
                        isWrong
                          ? { x: [0, -5, 5, -5, 5, 0] }
                          : phase === 'correct' && letter
                          ? { scale: [1, 1.1, 1] }
                          : {}
                      }
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      {letter?.letter || '_'}
                    </motion.div>
                  );
                })}
              </div>

              {/* Letter tiles */}
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {letterTiles.map((tile, index) => (
                  <motion.button
                    key={tile.id}
                    className={`
                      w-14 h-14 rounded-xl text-2xl font-bold
                      transition-all duration-150
                      ${
                        tile.used
                          ? 'bg-gray-200 text-gray-400 cursor-default'
                          : 'bg-white border-2 border-gray-200 text-text-primary hover:border-primary hover:bg-primary/5'
                      }
                    `}
                    onClick={() => handleLetterTap(tile)}
                    disabled={tile.used || phase === 'correct'}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: index * 0.05, type: 'spring' }}
                    whileHover={!tile.used ? { scale: 1.05 } : {}}
                    whileTap={!tile.used ? { scale: 0.95 } : {}}
                  >
                    {tile.letter}
                  </motion.button>
                ))}
              </div>

              {/* Action buttons */}
              {phase === 'playing' && (
                <div className="flex gap-3">
                  <button
                    onClick={handleUndo}
                    disabled={selectedLetters.length === 0}
                    className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-primary disabled:opacity-50"
                  >
                    ↩ Undo
                  </button>
                  <button
                    onClick={handleClear}
                    disabled={selectedLetters.length === 0}
                    className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-error disabled:opacity-50"
                  >
                    ✕ Clear
                  </button>
                </div>
              )}
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
