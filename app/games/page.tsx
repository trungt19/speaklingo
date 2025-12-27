'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { GameCard } from '@/components/games/GameCard';
import { Mascot } from '@/components/ui/Mascot';
import { Button } from '@/components/ui/Button';
import { GAME_INFO } from '@/lib/gameContent';

export default function GamesHubPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={() => router.push('/')}>
          &larr; Home
        </Button>
      </div>

      {/* Mascot greeting */}
      <motion.div
        className="flex flex-col items-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Mascot mood="excited" size="md" message="Let's play!" />
        <h1 className="text-3xl font-bold text-text-primary mt-4">Games</h1>
        <p className="text-text-secondary">Choose a game to play</p>
      </motion.div>

      {/* Game cards */}
      <div className="max-w-lg mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GameCard
            title={GAME_INFO.quiz.name}
            description={GAME_INFO.quiz.description}
            emoji={GAME_INFO.quiz.emoji}
            href="/games/quiz"
            color="from-blue-400 to-blue-600"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <GameCard
            title={GAME_INFO.matching.name}
            description={GAME_INFO.matching.description}
            emoji={GAME_INFO.matching.emoji}
            href="/games/matching"
            color="from-green-400 to-green-600"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GameCard
            title={GAME_INFO.memory.name}
            description={GAME_INFO.memory.description}
            emoji={GAME_INFO.memory.emoji}
            href="/games/memory"
            color="from-purple-400 to-purple-600"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <GameCard
            title={GAME_INFO.karaoke.name}
            description={GAME_INFO.karaoke.description}
            emoji={GAME_INFO.karaoke.emoji}
            href="/games/karaoke"
            color="from-pink-400 to-pink-600"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GameCard
            title={GAME_INFO.echo.name}
            description={GAME_INFO.echo.description}
            emoji={GAME_INFO.echo.emoji}
            href="/games/echo"
            color="from-cyan-400 to-cyan-600"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <GameCard
            title={GAME_INFO.wordbuilder.name}
            description={GAME_INFO.wordbuilder.description}
            emoji={GAME_INFO.wordbuilder.emoji}
            href="/games/wordbuilder"
            color="from-amber-400 to-amber-600"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GameCard
            title={GAME_INFO.beatmaker.name}
            description={GAME_INFO.beatmaker.description}
            emoji={GAME_INFO.beatmaker.emoji}
            href="/games/beatmaker"
            color="from-orange-400 to-red-500"
          />
        </motion.div>
      </div>
    </div>
  );
}
