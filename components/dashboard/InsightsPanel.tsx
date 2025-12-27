'use client';

import { DailyProgress } from '@/types';
import { Card } from '@/components/ui/Card';

interface InsightsPanelProps {
  weeklyProgress: (DailyProgress | null)[];
}

export function InsightsPanel({ weeklyProgress }: InsightsPanelProps) {
  // Aggregate topics from the week
  const topicCounts: Record<string, number> = {};
  weeklyProgress.forEach((day) => {
    if (day?.topicsEngaged) {
      day.topicsEngaged.forEach((topic) => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      });
    }
  });

  // Sort topics by count
  const sortedTopics = Object.entries(topicCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Count skipped question patterns (simplified)
  const skippedCount = weeklyProgress.reduce(
    (sum, day) => sum + (day?.promptsSkipped ?? 0),
    0
  );

  // Suggested conversation starters based on topics
  const suggestions = generateSuggestions(sortedTopics.map(([topic]) => topic));

  if (sortedTopics.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Patterns This Week
        </h3>
        <p className="text-text-secondary text-center py-4">
          Complete more sessions to see patterns and insights
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        Patterns This Week
      </h3>

      {/* Topics */}
      <div className="mb-6">
        <p className="text-sm text-text-secondary mb-2">
          Topics Tristan talks about most:
        </p>
        <ul className="space-y-1">
          {sortedTopics.map(([topic, count]) => (
            <li key={topic} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-text-primary capitalize">{topic}</span>
              <span className="text-text-secondary text-sm">
                (mentioned {count} time{count !== 1 ? 's' : ''})
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Skipped patterns */}
      {skippedCount > 0 && (
        <div className="mb-6">
          <p className="text-sm text-text-secondary mb-2">
            Questions Tristan skips:
          </p>
          <p className="text-text-primary text-sm">
            {skippedCount} question{skippedCount !== 1 ? 's' : ''} skipped this
            week
          </p>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div>
          <p className="text-sm text-text-secondary mb-2">
            Suggested conversation starters:
          </p>
          <ul className="space-y-2">
            {suggestions.map((suggestion, i) => (
              <li
                key={i}
                className="text-primary bg-primary/5 px-3 py-2 rounded-lg text-sm"
              >
                &ldquo;{suggestion}&rdquo;
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

// Generate conversation suggestions based on topics
function generateSuggestions(topics: string[]): string[] {
  const suggestions: string[] = [];

  if (topics.includes('ipad')) {
    suggestions.push('What do you like to do on your iPad?');
  }
  if (topics.includes('videos') || topics.includes('youtube')) {
    suggestions.push('What videos did you watch today?');
  }
  if (topics.includes('chatgpt')) {
    suggestions.push('What do you like to ask ChatGPT?');
  }
  if (topics.includes('writing') || topics.includes('notepad')) {
    suggestions.push('Show me what you wrote today');
  }
  if (topics.includes('games')) {
    suggestions.push('What game are you playing?');
  }

  // Default suggestions if no specific topics
  if (suggestions.length === 0 && topics.length > 0) {
    suggestions.push(`Tell me more about ${topics[0]}`);
  }

  return suggestions.slice(0, 3);
}
