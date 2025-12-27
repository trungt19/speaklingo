'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GameTopic, MemoryPair } from '@/types';
import { GameHeader } from '@/components/games/GameHeader';
import { TopicSelector } from '@/components/games/TopicSelector';
import { GameCompletion } from '@/components/games/GameCompletion';
import { Mascot } from '@/components/ui/Mascot';
import { generateMemoryPairs, GAME_INFO, shuffleArray } from '@/lib/gameContent';
import { useSounds } from '@/hooks/useSounds';
import { useGamification } from '@/hooks/useGamification';

type GamePhase = 'topic' | 'playing' | 'complete';

interface MemoryCard {
  id: string;
  pairId: string;
  type: 'word' | 'emoji';
  content: string;
  label: string;
}

const PAIRS_COUNT = 6;

export default function MemoryGamePage() {
  const router = useRouter();
  const { playSound } = useSounds();
  const { processGameComplete } = useGamification();

  // Game state
  const [phase, setPhase] = useState<GamePhase>('topic');
  const [topic, setTopic] = useState<GameTopic | null>(null);
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  // Start game with selected topic
  const startGame = (selectedTopic: GameTopic) => {
    setTopic(selectedTopic);
    const pairs = generateMemoryPairs(selectedTopic, PAIRS_COUNT);
    const gameCards = createCards(pairs);
    setCards(shuffleArray(gameCards));
    setFlippedIds([]);
    setMatchedPairIds(new Set());
    setMoves(0);
    setScore(0);
    setIsChecking(false);
    setPhase('playing');
  };

  // Create card pairs (one word, one emoji for each pair)
  const createCards = (pairs: MemoryPair[]): MemoryCard[] => {
    const cards: MemoryCard[] = [];
    pairs.forEach((pair) => {
      // Word card
      cards.push({
        id: `word-${pair.id}`,
        pairId: pair.id,
        type: 'word',
        content: pair.label,
        label: pair.label,
      });
      // Emoji card
      cards.push({
        id: `emoji-${pair.id}`,
        pairId: pair.id,
        type: 'emoji',
        content: pair.emoji,
        label: pair.label,
      });
    });
    return cards;
  };

  // Handle card tap
  const handleCardTap = (card: MemoryCard) => {
    // Ignore if already matched, already flipped, or checking
    if (matchedPairIds.has(card.pairId) || flippedIds.includes(card.id) || isChecking) {
      return;
    }

    // Flip the card
    const newFlipped = [...flippedIds, card.id];
    setFlippedIds(newFlipped);
    playSound('button_click');

    // If two cards are flipped, check for match
    if (newFlipped.length === 2) {
      setIsChecking(true);
      setMoves((m) => m + 1);

      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === secondId);

      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
        // Match found!
        setTimeout(() => {
          playSound('success_chime');
          const newMatched = new Set(matchedPairIds);
          newMatched.add(firstCard.pairId);
          setMatchedPairIds(newMatched);
          setFlippedIds([]);
          setScore((s) => s + 15);
          setIsChecking(false);

          // Check for game completion
          if (newMatched.size === PAIRS_COUNT) {
            setTimeout(() => {
              // Bonus points for fewer moves (perfect = PAIRS_COUNT moves)
              const totalMoves = moves + 1;
              const isPerfect = totalMoves === PAIRS_COUNT;
              const moveBonus = Math.max(0, 30 - (totalMoves - PAIRS_COUNT) * 2);
              const finalScore = score + 15 + moveBonus;
              setScore(finalScore);
              playSound('confetti');
              // Record game completion
              processGameComplete(isPerfect, finalScore);
              setPhase('complete');
            }, 600);
          }
        }, 500);
      } else {
        // No match - flip back after delay
        setTimeout(() => {
          setFlippedIds([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  // Check if card is flipped (either actively flipped or matched)
  const isCardFlipped = (card: MemoryCard) => {
    return flippedIds.includes(card.id) || matchedPairIds.has(card.pairId);
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
                {GAME_INFO.memory.name}
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
              title={GAME_INFO.memory.name}
              currentRound={matchedPairIds.size}
              totalRounds={PAIRS_COUNT}
              score={score}
              onExit={() => router.push('/games')}
            />

            {/* Mascot */}
            <div className="flex justify-center mb-4">
              <Mascot
                mood={matchedPairIds.size === PAIRS_COUNT ? 'celebrating' : 'thinking'}
                size="sm"
                message={moves === 0 ? 'Find the pairs!' : `${moves} moves`}
              />
            </div>

            {/* Game grid - 3x4 */}
            <div className="max-w-sm mx-auto">
              <div className="grid grid-cols-3 gap-3">
                {cards.map((card) => {
                  const isFlipped = isCardFlipped(card);
                  const isMatched = matchedPairIds.has(card.pairId);

                  return (
                    <motion.button
                      key={card.id}
                      className={`
                        relative aspect-square rounded-xl font-semibold
                        transition-all duration-200 perspective-1000
                        ${isMatched ? 'cursor-default' : 'cursor-pointer'}
                      `}
                      onClick={() => handleCardTap(card)}
                      disabled={isMatched}
                      whileHover={!isMatched ? { scale: 1.02 } : {}}
                      whileTap={!isMatched ? { scale: 0.98 } : {}}
                    >
                      <motion.div
                        className="w-full h-full relative"
                        initial={false}
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' as const }}
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        {/* Card back */}
                        <div
                          className={`
                            absolute inset-0 rounded-xl flex items-center justify-center
                            bg-gradient-to-br from-primary to-primary-dark text-white text-3xl
                            backface-hidden
                          `}
                          style={{ backfaceVisibility: 'hidden' }}
                        >
                          ?
                        </div>

                        {/* Card front */}
                        <div
                          className={`
                            absolute inset-0 rounded-xl flex items-center justify-center
                            ${
                              isMatched
                                ? 'bg-success/20 border-2 border-success'
                                : 'bg-white border-2 border-gray-200'
                            }
                            backface-hidden
                          `}
                          style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                          }}
                        >
                          {card.type === 'emoji' ? (
                            <span className="text-4xl">{card.content}</span>
                          ) : (
                            <span className="text-sm font-bold text-text-primary px-1 text-center">
                              {card.content}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Progress indicator */}
              <p className="text-center text-text-secondary mt-6">
                {matchedPairIds.size} of {PAIRS_COUNT} pairs found
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
              correctCount={PAIRS_COUNT}
              totalQuestions={PAIRS_COUNT}
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
