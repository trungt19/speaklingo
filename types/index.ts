// Session phases for the core loop
export type SessionPhase =
  | 'prompt'     // Showing question + text input
  | 'speaking'   // Microphone active
  | 'processing' // Calling Claude API
  | 'feedback'   // Showing results
  | 'complete';  // Session done

// Prompt structure
export interface Prompt {
  id: string;
  category: 'daily' | 'interests' | 'choice';
  difficulty: 1 | 2 | 3; // 1=choice, 2=short answer, 3=open-ended
  questionText: string;
  followUp?: string; // Optional follow-up question
}

// Individual attempt within a session
export interface SessionAttempt {
  id: string;
  timestamp: Date;
  promptId: string;
  promptText: string;

  // What the child did
  typedResponse?: string;
  spokenTranscript: string;
  skipped: boolean;

  // Claude's interpretation
  interpretation: string;
  feedbackForChild: string;
  insightForParent: string;
  engagement: 'engaged' | 'neutral' | 'disengaged';
  clarity: 'clear' | 'partial' | 'unclear';
  suggestedFollowUp?: string;

  // Metadata
  durationSeconds: number;
}

// Session state during active session
export interface SessionState {
  currentPhase: SessionPhase;
  currentPromptIndex: number;
  totalPrompts: number;
  attempts: SessionAttempt[];
  startTime: Date;
}

// Stored session record
export interface SessionRecord {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: Date;
  endTime: Date;
  attempts: SessionAttempt[];
  completed: boolean;
}

// Daily progress stats
export interface DailyProgress {
  date: string; // YYYY-MM-DD
  attempts: SessionAttempt[];
  promptsCompleted: number;
  promptsSkipped: number;
  totalFocusTime: number; // seconds
  topicsEngaged: string[]; // extracted keywords
}

// App settings
export interface AppSettings {
  // Child profile
  childName: string; // Default: "Tristan"

  // Session configuration
  promptsPerSession: number; // Default: 3, Range: 1-5
  requireTyping: boolean; // Default: true (Week 1), false later
  allowSkipping: boolean; // Default: true, always

  // Accessibility
  soundEnabled: boolean; // Default: false
  animationsEnabled: boolean; // Default: true (gentle only)
  textSize: 'normal' | 'large'; // Default: normal

  // Difficulty
  promptDifficulty: 1 | 2 | 3; // Default: 1 (easiest)
  enableFollowUps: boolean; // Default: false (Week 1)

  // Privacy
  parentPIN: string; // Hashed, default: 1234
  saveAudio: boolean; // Default: false

  // Goals
  dailyGoal: number; // Default: 1 session/day
}

// Settings record for storage
export interface SettingsRecord {
  id: 'current'; // Singleton
  settings: AppSettings;
  lastUpdated: Date;
}

// Progress record for storage
export interface ProgressRecord {
  date: string; // Primary key: YYYY-MM-DD
  stats: DailyProgress;
}

// Claude API response structure
export interface ClaudeResponse {
  interpretation: string;
  engagement: 'engaged' | 'neutral' | 'disengaged';
  feedbackForChild: string;
  insightForParent: string;
  suggestedFollowUp: string;
  clarity: 'clear' | 'partial' | 'unclear';
}

// Speech recognition status
export interface SpeechRecognitionState {
  isListening: boolean;
  transcript: string;
  error: string | null;
  isSupported: boolean;
}

// Default settings
export const DEFAULT_SETTINGS: AppSettings = {
  childName: 'Tristan',
  promptsPerSession: 3,
  requireTyping: true,
  allowSkipping: true,
  soundEnabled: true, // Enable sounds by default for gamification
  animationsEnabled: true,
  textSize: 'normal',
  promptDifficulty: 1,
  enableFollowUps: false,
  parentPIN: '1234', // Should be hashed in production
  saveAudio: false,
  dailyGoal: 1,
};

// ============ Gamification Types ============

// Level progression info
export interface LevelInfo {
  level: number;
  name: string;
  minPoints: number;
  maxPoints: number;
  icon: string;
}

// Badge/Achievement definition
export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  category: 'streak' | 'clarity' | 'speed' | 'milestone' | 'games';
  icon: string;
  threshold: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Earned badge instance
export interface EarnedBadge {
  badgeId: string;
  earnedAt: Date;
  sessionId?: string;
}

// Player gamification state
export interface GamificationState {
  totalPoints: number;
  currentLevel: number;
  earnedBadges: EarnedBadge[];
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  totalClearAnswers: number;
  totalFastAnswers: number;
  totalSessions: number;
  // Game stats
  totalGamesPlayed: number;
  totalPerfectGames: number;
}

// Gamification record for IndexedDB
export interface GamificationRecord {
  id: 'current';
  state: GamificationState;
  lastUpdated: Date;
}

// Mascot moods
export type MascotMood = 'idle' | 'happy' | 'excited' | 'encouraging' | 'celebrating' | 'thinking';

// Celebration event
export interface CelebrationEvent {
  type: 'points' | 'level_up' | 'badge' | 'streak' | 'session_complete';
  intensity: 'small' | 'medium' | 'large';
  points?: number;
  badge?: BadgeDefinition;
  newLevel?: LevelInfo;
  message?: string;
}

// Sound effect types
export type SoundEffect =
  | 'button_click'
  | 'success_chime'
  | 'points_earned'
  | 'level_up'
  | 'badge_unlock'
  | 'confetti';

// Default gamification state
export const DEFAULT_GAMIFICATION_STATE: GamificationState = {
  totalPoints: 0,
  currentLevel: 1,
  earnedBadges: [],
  streakDays: 0,
  lastActiveDate: '',
  totalClearAnswers: 0,
  totalFastAnswers: 0,
  totalSessions: 0,
  totalGamesPlayed: 0,
  totalPerfectGames: 0,
};

// ============ Game Types ============

export type GameType = 'matching' | 'quiz' | 'memory';

export type GameTopic =
  | 'emotions'
  | 'greetings'
  | 'colors'
  | 'animals'
  | 'numbers'
  | 'objects';

export interface GameImage {
  id: string;
  emoji: string; // Using emoji for simplicity
  label: string;
}

// Quiz question
export interface QuizQuestion {
  id: string;
  topic: GameTopic;
  questionText: string;
  choices: {
    id: string;
    emoji: string;
    label: string;
    isCorrect: boolean;
  }[];
}

// Memory card pair
export interface MemoryPair {
  id: string;
  emoji: string;
  label: string;
}

// Game session state
export interface GameSessionState {
  gameType: GameType;
  topic: GameTopic;
  currentRound: number;
  totalRounds: number;
  score: number;
  correctAnswers: number;
  startTime: Date;
}

// Game answer record
export interface GameAnswer {
  questionId: string;
  isCorrect: boolean;
  responseTimeMs: number;
  pointsEarned: number;
}
