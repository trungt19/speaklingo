import {
  LevelInfo,
  BadgeDefinition,
  GamificationState,
  SessionAttempt,
} from '@/types';

// ============ Level Definitions ============

export const LEVELS: LevelInfo[] = [
  { level: 1, name: 'Starter Star', minPoints: 0, maxPoints: 50, icon: '⭐' },
  { level: 2, name: 'Word Explorer', minPoints: 50, maxPoints: 120, icon: '🔍' },
  { level: 3, name: 'Voice Adventurer', minPoints: 120, maxPoints: 220, icon: '🎒' },
  { level: 4, name: 'Speech Hero', minPoints: 220, maxPoints: 350, icon: '🦸' },
  { level: 5, name: 'Talk Champion', minPoints: 350, maxPoints: 500, icon: '🏆' },
  { level: 6, name: 'Word Wizard', minPoints: 500, maxPoints: 700, icon: '🧙' },
  { level: 7, name: 'Voice Master', minPoints: 700, maxPoints: 950, icon: '🎯' },
  { level: 8, name: 'Speech Legend', minPoints: 950, maxPoints: 1250, icon: '👑' },
  { level: 9, name: 'Super Speaker', minPoints: 1250, maxPoints: 1600, icon: '🚀' },
  { level: 10, name: 'Ultimate Champion', minPoints: 1600, maxPoints: Infinity, icon: '💎' },
];

// ============ Badge Definitions ============

export const BADGES: BadgeDefinition[] = [
  // Streak badges
  {
    id: 'streak_3',
    name: 'Getting Started',
    description: 'Practice 3 days in a row',
    category: 'streak',
    icon: '🔥',
    threshold: 3,
    rarity: 'common',
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Practice for a whole week',
    category: 'streak',
    icon: '💪',
    threshold: 7,
    rarity: 'rare',
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: '30 days of practice!',
    category: 'streak',
    icon: '🏅',
    threshold: 30,
    rarity: 'legendary',
  },

  // Clarity badges
  {
    id: 'clarity_10',
    name: 'Clear Talker',
    description: 'Get 10 clear answers',
    category: 'clarity',
    icon: '💬',
    threshold: 10,
    rarity: 'common',
  },
  {
    id: 'clarity_50',
    name: 'Crystal Voice',
    description: 'Get 50 clear answers',
    category: 'clarity',
    icon: '💎',
    threshold: 50,
    rarity: 'epic',
  },

  // Speed badges
  {
    id: 'fast_1',
    name: 'Quick Thinker',
    description: 'Answer in under 15 seconds',
    category: 'speed',
    icon: '⚡',
    threshold: 1,
    rarity: 'common',
  },
  {
    id: 'fast_10',
    name: 'Speed Demon',
    description: 'Get 10 fast answers',
    category: 'speed',
    icon: '🚀',
    threshold: 10,
    rarity: 'rare',
  },

  // Milestone badges
  {
    id: 'first_session',
    name: 'First Steps',
    description: 'Complete your first session',
    category: 'milestone',
    icon: '👣',
    threshold: 1,
    rarity: 'common',
  },
  {
    id: 'sessions_10',
    name: 'Dedicated Learner',
    description: 'Complete 10 sessions',
    category: 'milestone',
    icon: '📚',
    threshold: 10,
    rarity: 'rare',
  },
  {
    id: 'sessions_50',
    name: 'Speech Champion',
    description: 'Complete 50 sessions',
    category: 'milestone',
    icon: '🏆',
    threshold: 50,
    rarity: 'legendary',
  },
  {
    id: 'level_5',
    name: 'Halfway Hero',
    description: 'Reach level 5',
    category: 'milestone',
    icon: '🎖️',
    threshold: 5,
    rarity: 'rare',
  },
  {
    id: 'level_10',
    name: 'Ultimate Speaker',
    description: 'Reach the highest level',
    category: 'milestone',
    icon: '👑',
    threshold: 10,
    rarity: 'legendary',
  },

  // Game badges
  {
    id: 'games_1',
    name: 'Game Explorer',
    description: 'Play your first game',
    category: 'games',
    icon: '🎮',
    threshold: 1,
    rarity: 'common',
  },
  {
    id: 'games_10',
    name: 'Game Fan',
    description: 'Play 10 games',
    category: 'games',
    icon: '🕹️',
    threshold: 10,
    rarity: 'rare',
  },
  {
    id: 'games_50',
    name: 'Game Master',
    description: 'Play 50 games',
    category: 'games',
    icon: '🏆',
    threshold: 50,
    rarity: 'legendary',
  },
  {
    id: 'perfect_1',
    name: 'Perfect Round',
    description: 'Get a perfect score',
    category: 'games',
    icon: '⭐',
    threshold: 1,
    rarity: 'common',
  },
  {
    id: 'perfect_5',
    name: 'Perfectionist',
    description: 'Get 5 perfect games',
    category: 'games',
    icon: '🌟',
    threshold: 5,
    rarity: 'rare',
  },
  {
    id: 'perfect_20',
    name: 'Flawless Champion',
    description: 'Get 20 perfect games',
    category: 'games',
    icon: '💫',
    threshold: 20,
    rarity: 'epic',
  },
];

// ============ Points Calculation ============

export function calculatePointsForAttempt(attempt: SessionAttempt): number {
  if (attempt.skipped) return 0;

  let points = 0;

  // Base points for completing
  points += 10;

  // Bonus for clarity
  if (attempt.clarity === 'clear') {
    points += 5;
  } else if (attempt.clarity === 'partial') {
    points += 2;
  }

  // Bonus for engagement
  if (attempt.engagement === 'engaged') {
    points += 3;
  }

  // Speed bonus (under 30 seconds)
  if (attempt.durationSeconds < 30) {
    points += 2;
  }

  return points;
}

export function calculateSessionBonus(attempts: SessionAttempt[]): number {
  const completedCount = attempts.filter((a) => !a.skipped).length;

  // Perfect session bonus (all completed)
  if (completedCount === attempts.length && completedCount > 0) {
    return 10;
  }

  return 0;
}

// ============ Level Functions ============

export function getLevelForPoints(totalPoints: number): LevelInfo {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalPoints >= LEVELS[i].minPoints) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

export function getProgressToNextLevel(totalPoints: number): {
  current: number;
  required: number;
  percentage: number;
} {
  const currentLevel = getLevelForPoints(totalPoints);
  const nextLevelIndex = LEVELS.findIndex((l) => l.level === currentLevel.level + 1);

  if (nextLevelIndex === -1) {
    return { current: 0, required: 0, percentage: 100 };
  }

  const pointsInLevel = totalPoints - currentLevel.minPoints;
  const pointsNeeded = currentLevel.maxPoints - currentLevel.minPoints;

  return {
    current: pointsInLevel,
    required: pointsNeeded,
    percentage: Math.min(100, (pointsInLevel / pointsNeeded) * 100),
  };
}

// ============ Badge Functions ============

export function checkBadgeUnlocks(
  state: GamificationState,
  additionalStats?: {
    newClearAnswers?: number;
    newFastAnswers?: number;
    newSessions?: number;
    newGamesPlayed?: number;
    newPerfectGames?: number;
  }
): BadgeDefinition[] {
  const newBadges: BadgeDefinition[] = [];
  const earnedIds = new Set(state.earnedBadges.map((b) => b.badgeId));

  const stats = {
    streakDays: state.streakDays,
    totalClearAnswers: state.totalClearAnswers + (additionalStats?.newClearAnswers || 0),
    totalFastAnswers: state.totalFastAnswers + (additionalStats?.newFastAnswers || 0),
    totalSessions: state.totalSessions + (additionalStats?.newSessions || 0),
    currentLevel: state.currentLevel,
    totalGamesPlayed: (state.totalGamesPlayed || 0) + (additionalStats?.newGamesPlayed || 0),
    totalPerfectGames: (state.totalPerfectGames || 0) + (additionalStats?.newPerfectGames || 0),
  };

  for (const badge of BADGES) {
    if (earnedIds.has(badge.id)) continue;

    let unlocked = false;

    switch (badge.category) {
      case 'streak':
        unlocked = stats.streakDays >= badge.threshold;
        break;
      case 'clarity':
        unlocked = stats.totalClearAnswers >= badge.threshold;
        break;
      case 'speed':
        unlocked = stats.totalFastAnswers >= badge.threshold;
        break;
      case 'milestone':
        if (badge.id.startsWith('level_')) {
          unlocked = stats.currentLevel >= badge.threshold;
        } else if (badge.id.startsWith('sessions_') || badge.id === 'first_session') {
          unlocked = stats.totalSessions >= badge.threshold;
        }
        break;
      case 'games':
        if (badge.id.startsWith('games_')) {
          unlocked = stats.totalGamesPlayed >= badge.threshold;
        } else if (badge.id.startsWith('perfect_')) {
          unlocked = stats.totalPerfectGames >= badge.threshold;
        }
        break;
    }

    if (unlocked) {
      newBadges.push(badge);
    }
  }

  return newBadges;
}

export function getBadgeById(id: string): BadgeDefinition | undefined {
  return BADGES.find((b) => b.id === id);
}

// ============ Mascot Messages ============

export const MASCOT_MESSAGES = {
  greeting: [
    'Hi there!',
    'Ready to talk?',
    "Let's practice!",
    'Hey friend!',
  ],
  encouragement: [
    'You can do it!',
    'Take your time',
    'I believe in you!',
    "You're doing great!",
  ],
  success: [
    'Awesome!',
    'Great job!',
    'Well done!',
    'Super!',
    'Nice one!',
    'Amazing!',
  ],
  levelUp: [
    'LEVEL UP!',
    "You're amazing!",
    'New level!',
    'Wow!',
  ],
  badge: [
    'New badge!',
    'You earned it!',
    'So proud!',
  ],
  sessionComplete: [
    'All done!',
    'Great session!',
    'You did it!',
  ],
};

export function getRandomMessage(category: keyof typeof MASCOT_MESSAGES): string {
  const messages = MASCOT_MESSAGES[category];
  return messages[Math.floor(Math.random() * messages.length)];
}

// ============ Rarity Colors ============

export function getRarityColor(rarity: BadgeDefinition['rarity']): string {
  switch (rarity) {
    case 'common':
      return '#6FCF97'; // Green
    case 'rare':
      return '#5B8DBE'; // Blue
    case 'epic':
      return '#9B59B6'; // Purple
    case 'legendary':
      return '#F2C94C'; // Gold
    default:
      return '#7F8C8D';
  }
}
