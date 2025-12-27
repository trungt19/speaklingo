'use client';

import { DailyProgress } from '@/types';
import { Card } from '@/components/ui/Card';

interface WeeklyChartProps {
  weeklyProgress: (DailyProgress | null)[];
  streak: number;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function WeeklyChart({ weeklyProgress, streak }: WeeklyChartProps) {
  const totalPrompts = weeklyProgress.reduce(
    (sum, day) => sum + (day?.promptsCompleted ?? 0) + (day?.promptsSkipped ?? 0),
    0
  );
  const completedPrompts = weeklyProgress.reduce(
    (sum, day) => sum + (day?.promptsCompleted ?? 0),
    0
  );
  const skippedPrompts = weeklyProgress.reduce(
    (sum, day) => sum + (day?.promptsSkipped ?? 0),
    0
  );
  const completionRate =
    totalPrompts > 0 ? Math.round((completedPrompts / totalPrompts) * 100) : 0;
  const avgFocusTime =
    weeklyProgress.filter((d) => d).length > 0
      ? Math.round(
          weeklyProgress.reduce((sum, day) => sum + (day?.totalFocusTime ?? 0), 0) /
            weeklyProgress.filter((d) => d).length /
            60
        )
      : 0;

  return (
    <Card>
      <h3 className="text-lg font-semibold text-text-primary mb-4">This Week</h3>

      {/* Day indicators */}
      <div className="flex justify-between mb-6">
        {DAY_LABELS.map((day, i) => {
          const hasProgress = weeklyProgress[i]?.promptsCompleted ?? 0 > 0;
          return (
            <div key={day} className="flex flex-col items-center gap-1">
              <span className="text-xs text-text-secondary">{day}</span>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                  hasProgress
                    ? 'bg-success/20 text-success'
                    : weeklyProgress[i]
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-gray-100 text-gray-300'
                }`}
              >
                {hasProgress ? '*' : '-'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <p className="text-2xl font-semibold text-text-primary">
            {totalPrompts}
          </p>
          <p className="text-xs text-text-secondary">Total prompts</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <p className="text-2xl font-semibold text-text-primary">
            {completedPrompts}
          </p>
          <p className="text-xs text-text-secondary">
            Completed ({completionRate}%)
          </p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <p className="text-2xl font-semibold text-text-primary">
            {avgFocusTime}m
          </p>
          <p className="text-xs text-text-secondary">Avg session</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <p className="text-2xl font-semibold text-text-primary">
            {streak} {streak > 0 && <span className="text-orange-500">fire</span>}
          </p>
          <p className="text-xs text-text-secondary">Day streak</p>
        </div>
      </div>

      {/* Skipped info */}
      {skippedPrompts > 0 && (
        <p className="text-sm text-text-secondary mt-4">
          {skippedPrompts} prompt{skippedPrompts !== 1 ? 's' : ''} skipped this
          week
        </p>
      )}
    </Card>
  );
}
