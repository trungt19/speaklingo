'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  GamificationState,
  SessionAttempt,
  CelebrationEvent,
  BadgeDefinition,
  DEFAULT_GAMIFICATION_STATE,
} from '@/types';
import {
  getGamificationState,
  saveGamificationState,
} from '@/lib/storage';
import {
  calculatePointsForAttempt,
  calculateSessionBonus,
  getLevelForPoints,
  getProgressToNextLevel,
  checkBadgeUnlocks,
  BADGES,
  getRandomMessage,
} from '@/lib/gamification';
import { getTodayDate } from '@/lib/utils';
import { useSounds } from './useSounds';

export function useGamification() {
  const [state, setState] = useState<GamificationState>(DEFAULT_GAMIFICATION_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingCelebrations, setPendingCelebrations] = useState<CelebrationEvent[]>([]);
  const { playSound } = useSounds();

  // Load state on mount
  useEffect(() => {
    const load = async () => {
      try {
        const loaded = await getGamificationState();
        setState(loaded);
      } catch (error) {
        console.error('Error loading gamification state:', error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Process a completed attempt and return points earned
  const processAttempt = useCallback(
    async (attempt: SessionAttempt): Promise<number> => {
      const points = calculatePointsForAttempt(attempt);
      if (points === 0) return 0;

      const previousLevel = state.currentLevel;
      const isClear = attempt.clarity === 'clear';
      const isFast = attempt.durationSeconds < 15;

      // Calculate new state
      const newTotalPoints = state.totalPoints + points;
      const newLevel = getLevelForPoints(newTotalPoints);
      const newClearAnswers = state.totalClearAnswers + (isClear ? 1 : 0);
      const newFastAnswers = state.totalFastAnswers + (isFast ? 1 : 0);

      const newState: GamificationState = {
        ...state,
        totalPoints: newTotalPoints,
        currentLevel: newLevel.level,
        totalClearAnswers: newClearAnswers,
        totalFastAnswers: newFastAnswers,
      };

      // Check for new badges
      const newBadges = checkBadgeUnlocks(state, {
        newClearAnswers: isClear ? 1 : 0,
        newFastAnswers: isFast ? 1 : 0,
      });

      // Add earned badges to state
      for (const badge of newBadges) {
        newState.earnedBadges.push({
          badgeId: badge.id,
          earnedAt: new Date(),
        });
      }

      // Queue celebrations
      const celebrations: CelebrationEvent[] = [];

      // Level up celebration
      if (newLevel.level > previousLevel) {
        celebrations.push({
          type: 'level_up',
          intensity: 'large',
          newLevel,
          message: getRandomMessage('levelUp'),
        });
        playSound('level_up');
      } else {
        // Regular points celebration
        celebrations.push({
          type: 'points',
          intensity: isClear ? 'medium' : 'small',
          points,
          message: getRandomMessage('success'),
        });
        playSound('points_earned');
      }

      // Badge celebrations
      for (const badge of newBadges) {
        celebrations.push({
          type: 'badge',
          intensity: badge.rarity === 'legendary' ? 'large' : 'medium',
          badge,
          message: getRandomMessage('badge'),
        });
        playSound('badge_unlock');
      }

      setPendingCelebrations((prev) => [...prev, ...celebrations]);

      // Save state
      setState(newState);
      await saveGamificationState(newState);

      return points;
    },
    [state, playSound]
  );

  // Process session completion
  const processSessionComplete = useCallback(
    async (attempts: SessionAttempt[]): Promise<number> => {
      const bonus = calculateSessionBonus(attempts);
      const today = getTodayDate();

      const newState: GamificationState = { ...state };
      newState.totalSessions++;
      newState.totalPoints += bonus;

      // Update streak
      if (newState.lastActiveDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (newState.lastActiveDate === yesterdayStr) {
          newState.streakDays++;
        } else if (newState.lastActiveDate !== today) {
          newState.streakDays = 1;
        }
        newState.lastActiveDate = today;
      }

      // Update level based on new total
      const newLevel = getLevelForPoints(newState.totalPoints);
      newState.currentLevel = newLevel.level;

      // Check for session/streak badges
      const newBadges = checkBadgeUnlocks(state, {
        newSessions: 1,
      });

      // Also check streak badges
      const streakBadges = BADGES.filter(
        (b) =>
          b.category === 'streak' &&
          newState.streakDays >= b.threshold &&
          !state.earnedBadges.find((eb) => eb.badgeId === b.id)
      );

      const allNewBadges = [...newBadges, ...streakBadges];

      for (const badge of allNewBadges) {
        if (!newState.earnedBadges.find((eb) => eb.badgeId === badge.id)) {
          newState.earnedBadges.push({
            badgeId: badge.id,
            earnedAt: new Date(),
          });
        }
      }

      // Queue celebrations
      const celebrations: CelebrationEvent[] = [];

      // Session complete celebration
      celebrations.push({
        type: 'session_complete',
        intensity: bonus > 0 ? 'large' : 'medium',
        points: bonus,
        message: getRandomMessage('sessionComplete'),
      });

      if (bonus > 0) {
        playSound('confetti');
      } else {
        playSound('success_chime');
      }

      // Badge celebrations
      for (const badge of allNewBadges) {
        celebrations.push({
          type: 'badge',
          intensity: badge.rarity === 'legendary' ? 'large' : 'medium',
          badge,
          message: getRandomMessage('badge'),
        });
        playSound('badge_unlock');
      }

      setPendingCelebrations((prev) => [...prev, ...celebrations]);

      // Save state
      setState(newState);
      await saveGamificationState(newState);

      return bonus;
    },
    [state, playSound]
  );

  // Clear a celebration from the queue
  const dismissCelebration = useCallback(() => {
    setPendingCelebrations((prev) => prev.slice(1));
  }, []);

  // Clear all celebrations
  const clearCelebrations = useCallback(() => {
    setPendingCelebrations([]);
  }, []);

  // Get current level info
  const levelInfo = getLevelForPoints(state.totalPoints);
  const levelProgress = getProgressToNextLevel(state.totalPoints);

  // Get earned badge definitions
  const earnedBadges = state.earnedBadges
    .map((eb) => BADGES.find((b) => b.id === eb.badgeId)!)
    .filter(Boolean);

  return {
    state,
    isLoading,
    levelInfo,
    levelProgress,
    earnedBadges,
    pendingCelebrations,
    currentCelebration: pendingCelebrations[0] || null,
    processAttempt,
    processSessionComplete,
    dismissCelebration,
    clearCelebrations,
  };
}
