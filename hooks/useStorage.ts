'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  SessionRecord,
  DailyProgress,
} from '@/types';
import {
  saveSession,
  getSession,
  getSessionsByDate,
  getTodaySessions,
  getDailyProgress,
  getWeeklyProgress,
  getAllProgressDates,
  getTodayStats,
  exportAllData,
} from '@/lib/storage';
import { getTodayDate, getWeekDates, getWeekStart, calculateStreak } from '@/lib/utils';

export function useStorage() {
  const [isLoading, setIsLoading] = useState(true);
  const [todayProgress, setTodayProgress] = useState<DailyProgress | null>(null);
  const [streak, setStreak] = useState(0);
  const [todaySessions, setTodaySessions] = useState<SessionRecord[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState<(DailyProgress | null)[]>([]);

  // Load initial data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [progress, sessions, stats, weekDates] = await Promise.all([
        getDailyProgress(getTodayDate()),
        getTodaySessions(),
        getTodayStats(),
        Promise.resolve(getWeekDates(getWeekStart())),
      ]);

      const weekly = await getWeeklyProgress(weekDates);
      const allDates = await getAllProgressDates();
      const calculatedStreak = calculateStreak(allDates);

      setTodayProgress(progress);
      setTodaySessions(sessions);
      setStreak(calculatedStreak);
      setWeeklyProgress(weekly);
    } catch (error) {
      console.error('Error loading storage data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save a new session
  const saveNewSession = useCallback(
    async (session: SessionRecord) => {
      await saveSession(session);
      await loadData(); // Reload data after save
    },
    [loadData]
  );

  // Get session by ID
  const getSessionById = useCallback(async (id: string) => {
    return getSession(id);
  }, []);

  // Get sessions for a specific date
  const getSessionsForDate = useCallback(async (date: string) => {
    return getSessionsByDate(date);
  }, []);

  // Get progress for a specific date
  const getProgressForDate = useCallback(async (date: string) => {
    return getDailyProgress(date);
  }, []);

  // Export all data
  const exportData = useCallback(async () => {
    return exportAllData();
  }, []);

  // Refresh data
  const refresh = useCallback(() => {
    return loadData();
  }, [loadData]);

  return {
    isLoading,
    todayProgress,
    streak,
    todaySessions,
    weeklyProgress,
    promptsCompletedToday: todayProgress?.promptsCompleted ?? 0,
    saveSession: saveNewSession,
    getSession: getSessionById,
    getSessionsForDate,
    getProgressForDate,
    exportData,
    refresh,
  };
}
