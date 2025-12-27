import { openDB, DBSchema, IDBPDatabase } from 'idb';
import {
  SessionRecord,
  AppSettings,
  DailyProgress,
  SessionAttempt,
  DEFAULT_SETTINGS,
  SettingsRecord,
  ProgressRecord,
} from '@/types';
import { getTodayDate } from './utils';

// Database schema
interface SpeakLingoDBSchema extends DBSchema {
  sessions: {
    key: string;
    value: SessionRecord;
    indexes: { 'by-date': string };
  };
  settings: {
    key: 'current';
    value: SettingsRecord;
  };
  progress: {
    key: string;
    value: ProgressRecord;
  };
}

const DB_NAME = 'SpeakLingoDB';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<SpeakLingoDBSchema>> | null = null;

// Initialize database
function getDB(): Promise<IDBPDatabase<SpeakLingoDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<SpeakLingoDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Sessions store
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', {
            keyPath: 'id',
          });
          sessionStore.createIndex('by-date', 'date');
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }

        // Progress store
        if (!db.objectStoreNames.contains('progress')) {
          db.createObjectStore('progress', { keyPath: 'date' });
        }
      },
    });
  }
  return dbPromise;
}

// ============ Sessions ============

export async function saveSession(session: SessionRecord): Promise<void> {
  const db = await getDB();
  await db.put('sessions', session);

  // Also update daily progress
  await updateDailyProgress(session);
}

export async function getSession(id: string): Promise<SessionRecord | undefined> {
  const db = await getDB();
  return db.get('sessions', id);
}

export async function getSessionsByDate(date: string): Promise<SessionRecord[]> {
  const db = await getDB();
  return db.getAllFromIndex('sessions', 'by-date', date);
}

export async function getSessionsInRange(
  startDate: string,
  endDate: string
): Promise<SessionRecord[]> {
  const db = await getDB();
  const allSessions = await db.getAll('sessions');
  return allSessions.filter(
    (s) => s.date >= startDate && s.date <= endDate
  );
}

export async function getTodaySessions(): Promise<SessionRecord[]> {
  return getSessionsByDate(getTodayDate());
}

// ============ Settings ============

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await getDB();
  await db.put('settings', {
    id: 'current',
    settings,
    lastUpdated: new Date(),
  });
}

export async function getSettings(): Promise<AppSettings> {
  const db = await getDB();
  const record = await db.get('settings', 'current');
  return record?.settings ?? DEFAULT_SETTINGS;
}

export async function resetSettings(): Promise<void> {
  await saveSettings(DEFAULT_SETTINGS);
}

// ============ Progress ============

export async function getDailyProgress(
  date: string
): Promise<DailyProgress | null> {
  const db = await getDB();
  const record = await db.get('progress', date);
  return record?.stats ?? null;
}

export async function getWeeklyProgress(
  weekDates: string[]
): Promise<(DailyProgress | null)[]> {
  return Promise.all(weekDates.map((date) => getDailyProgress(date)));
}

export async function getAllProgressDates(): Promise<string[]> {
  const db = await getDB();
  const records = await db.getAll('progress');
  return records.map((r) => r.date);
}

async function updateDailyProgress(session: SessionRecord): Promise<void> {
  const db = await getDB();
  const date = session.date;

  // Get existing progress or create new
  const existingRecord = await db.get('progress', date);
  const existing = existingRecord?.stats;

  const completedAttempts = session.attempts.filter((a) => !a.skipped);
  const skippedAttempts = session.attempts.filter((a) => a.skipped);

  // Extract topics from responses
  const topics = extractTopics(session.attempts);

  const newProgress: DailyProgress = {
    date,
    attempts: existing
      ? [...existing.attempts, ...session.attempts]
      : session.attempts,
    promptsCompleted:
      (existing?.promptsCompleted ?? 0) + completedAttempts.length,
    promptsSkipped: (existing?.promptsSkipped ?? 0) + skippedAttempts.length,
    totalFocusTime:
      (existing?.totalFocusTime ?? 0) +
      session.attempts.reduce((sum, a) => sum + a.durationSeconds, 0),
    topicsEngaged: existing
      ? [...new Set([...existing.topicsEngaged, ...topics])]
      : topics,
  };

  await db.put('progress', { date, stats: newProgress });
}

// Simple topic extraction from responses
function extractTopics(attempts: SessionAttempt[]): string[] {
  const keywords = [
    'ipad',
    'videos',
    'chatgpt',
    'games',
    'youtube',
    'notepad',
    'writing',
    'drawing',
    'school',
    'food',
    'pizza',
    'cat',
    'dog',
    'blue',
    'red',
    'green',
  ];

  const topics: Set<string> = new Set();

  attempts.forEach((attempt) => {
    const text = `${attempt.typedResponse ?? ''} ${attempt.spokenTranscript}`.toLowerCase();
    keywords.forEach((keyword) => {
      if (text.includes(keyword)) {
        topics.add(keyword);
      }
    });
  });

  return Array.from(topics);
}

// ============ Stats ============

export async function getTodayStats(): Promise<{
  promptsCompleted: number;
  streak: number;
}> {
  const today = getTodayDate();
  const progress = await getDailyProgress(today);
  const allDates = await getAllProgressDates();

  // Calculate streak
  let streak = 0;
  const sortedDates = allDates.sort((a, b) => b.localeCompare(a));

  if (sortedDates.length > 0) {
    const currentDate = new Date();
    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(currentDate.getDate() - i);
      const expectedStr = expectedDate.toISOString().split('T')[0];

      if (sortedDates.includes(expectedStr)) {
        streak++;
      } else if (i === 0) {
        // Today might not have progress yet, check yesterday
        continue;
      } else {
        break;
      }
    }
  }

  return {
    promptsCompleted: progress?.promptsCompleted ?? 0,
    streak,
  };
}

// ============ Export ============

export async function exportAllData(): Promise<{
  sessions: SessionRecord[];
  settings: AppSettings;
  progress: ProgressRecord[];
}> {
  const db = await getDB();
  const sessions = await db.getAll('sessions');
  const settings = await getSettings();
  const progress = await db.getAll('progress');

  return { sessions, settings, progress };
}

// ============ Clear (for testing) ============

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  await db.clear('sessions');
  await db.clear('progress');
  await saveSettings(DEFAULT_SETTINGS);
}
