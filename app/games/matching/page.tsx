'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GameTopic, GameImage } from '@/types';
import { GameHeader } from '@/components/games/GameHeader';
import { TopicSelector } from '@/components/games/TopicSelector';
import { GameCompletion } from '@/components/games/GameCompletion';
import { Mascot } from '@/components/ui/Mascot';
import { generateMatchingItems, GAME_INFO, shuffleArray } from '@/lib/gameContent';
import { useSounds } from '@/hooks/useSounds';

type GamePhase = 'topic' | 'playing' | 'complete';

const ITEMS_COUNT = 4;

export default function MatchingGamePage() {
  const router = useRouter();
  const { playSound } = useSounds();

  // Game state
  const [phase, setPhase] = useState<GamePhase>('topic');
  const [topic, setTopic] = useState<GameTopic | null>(null);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Current round state
  const [items, setItems] = useState<GameImage[]>([]);
  const [shuffledEmojis, setShuffledEmojis] = useState<GameImage[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [wrongPair, setWrongPair] = useState<{ word: string; emoji: string } | null>(null);

  const TOTAL_ROUNDS = 3;

  // Start game with selected topic
  const startGame = (selectedTopic: GameTopic) => {
    setTopic(selectedTopic);
    setRound(0);
    setScore(0);
    setCorrectCount(0);
    loadRound(selectedTopic);
    setPhase('playing');
  };

  // Load items for current round
  const loadRound = (currentTopic: GameTopic) => {
    const { items: newItems, shuffledItems } = generateMatchingItems(currentTopic, ITEMS_COUNT);
    setItems(newItems);
    setShuffledEmojis(shuffleArray(shuffledItems));
    setSelectedWord(null);
    setMatchedIds(new Set());
    setWrongPair(null);
  };

  // Handle word tap
  const handleWordTap = (id: string) => {
    if (matchedIds.has(id)) return;
    setSelectedWord(id);
    setWrongPair(null);
  };

  // Handle emoji tap
  const handleEmojiTap = (emojiItem: GameImage) => {
    if (!selectedWord || matchedIds.has(emojiItem.id)) return;

    if (selectedWord === emojiItem.id) {
      // Correct match!
      playSound('success_chime');
      const newMatched = new Set(matchedIds);
      newMatched.add(emojiItem.id);
      setMatchedIds(newMatched);
      setSelectedWord(null);
      setScore((s) => s + 10);
      setCorrectCount((c) => c + 1);

      // Check if round complete
      if (newMatched.size === ITEMS_COUNT) {
        setTimeout(() => {
          if (round < TOTAL_ROUNDS - 1) {
            setRound((r) => r + 1);
            if (topic) loadRound(topic);
          } else {
            // Add bonus for completing all rounds
            setScore((s) => s + 15);
            playSound('confetti');
            setPhase('complete');
          }
        }, 800);
      }
    } else {
      // Wrong match
      playSound('button_click');
      setWrongPair({ word: selectedWord, emoji: emojiItem.id });
      setTimeout(() => {
        setWrongPair(null);
        setSelectedWord(null);
      }, 800);
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
                {GAME_INFO.matching.name}
              </h1>
              <div className="w-12" />
            </div>
            <TopicSelector onSelect={startGame} />
          </motion.div>
        )}

        {/* Playing */}
        {phase === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GameHeader
              title={GAME_INFO.matching.name}
              currentRound={round}
              totalRounds={TOTAL_ROUNDS}
              score={score}
              onExit={() => router.push('/games')}
            />

            {/* Mascot */}
            <div className="flex justify-center mb-6">
              <Mascot
                mood={matchedIds.size === ITEMS_COUNT ? 'celebrating' : 'encouraging'}
                size="sm"
                message={selectedWord ? 'Now tap the picture!' : 'Tap a word first'}
              />
            </div>

            {/* Game area */}
            <div className="max-w-lg mx-auto">
              <div className="flex gap-8 justify-center">
                {/* Words column */}
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-text-secondary text-center mb-2">Words</p>
                  {items.map((item) => {
                    const isMatched = matchedIds.has(item.id);
                    const isSelected = selectedWord === item.id;
                    const isWrong = wrongPair?.word === item.id;

                    return (
                      <motion.button
                        key={item.id}
                        className={`
                          px-6 py-4 rounded-xl font-semibold text-lg min-w-[120px]
                          transition-all duration-200
                          ${
                            isMatched
                              ? 'bg-success/20 text-success border-2 border-success'
                              : isSelected
                              ? 'bg-primary text-white border-2 border-primary'
                              : isWrong
                              ? 'bg-error/20 text-error border-2 border-error'
                              : 'bg-white text-text-primary border-2 border-gray-200 hover:border-primary/50'
                          }
                        `}
                        onClick={() => handleWordTap(item.id)}
                        disabled={isMatched}
                        animate={isWrong ? { x: [0, -5, 5, -5, 5, 0] } : {}}
                        transition={{ duration: 0.3 }}
                        whileHover={!isMatched ? { scale: 1.02 } : {}}
                        whileTap={!isMatched ? { scale: 0.98 } : {}}
                      >
                        {item.label}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Emojis column */}
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-text-secondary text-center mb-2">Pictures</p>
                  {shuffledEmojis.map((item) => {
                    const isMatched = matchedIds.has(item.id);
                    const isWrong = wrongPair?.emoji === item.id;

                    return (
                      <motion.button
                        key={`emoji-${item.id}`}
                        className={`
                          w-20 h-16 rounded-xl text-4xl flex items-center justify-center
                          transition-all duration-200
                          ${
                            isMatched
                              ? 'bg-success/20 border-2 border-success'
                              : isWrong
                              ? 'bg-error/20 border-2 border-error'
                              : 'bg-white border-2 border-gray-200 hover:border-primary/50'
                          }
                        `}
                        onClick={() => handleEmojiTap(item)}
                        disabled={isMatched || !selectedWord}
                        animate={
                          isMatched
                            ? { scale: [1, 1.1, 1] }
                            : isWrong
                            ? { x: [0, -5, 5, -5, 5, 0] }
                            : {}
                        }
                        transition={{ duration: 0.3 }}
                        whileHover={!isMatched && selectedWord ? { scale: 1.05 } : {}}
                        whileTap={!isMatched && selectedWord ? { scale: 0.95 } : {}}
                      >
                        {item.emoji}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Progress indicator */}
              <p className="text-center text-text-secondary mt-6">
                {matchedIds.size} of {ITEMS_COUNT} matched
              </p>
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
              totalQuestions={ITEMS_COUNT * TOTAL_ROUNDS}
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
