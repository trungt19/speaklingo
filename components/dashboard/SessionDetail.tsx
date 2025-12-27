'use client';

import { SessionAttempt } from '@/types';
import { Card } from '@/components/ui/Card';

interface SessionDetailProps {
  attempts: SessionAttempt[];
  date: string;
}

export function SessionDetail({ attempts, date }: SessionDetailProps) {
  if (attempts.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-text-secondary text-lg">No sessions yet today</p>
          <p className="text-text-secondary text-sm mt-2">
            Start a session to see progress here
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        Today&apos;s Session ({date})
      </h3>

      <div className="space-y-4">
        {attempts.map((attempt, index) => (
          <div
            key={attempt.id}
            className={`p-4 rounded-xl ${
              attempt.skipped
                ? 'bg-gray-50 border border-gray-200'
                : 'bg-primary/5 border border-primary/20'
            }`}
          >
            {/* Question */}
            <p className="text-text-secondary text-sm mb-2">
              Q{index + 1}: {attempt.promptText}
            </p>

            {attempt.skipped ? (
              <p className="text-text-secondary italic">Skipped</p>
            ) : (
              <>
                {/* Typed response */}
                {attempt.typedResponse && (
                  <div className="mb-2">
                    <span className="text-xs text-text-secondary uppercase">
                      Typed:{' '}
                    </span>
                    <span className="text-text-primary">
                      {attempt.typedResponse}
                    </span>
                  </div>
                )}

                {/* Spoken response */}
                <div className="mb-2">
                  <span className="text-xs text-text-secondary uppercase">
                    Spoke:{' '}
                  </span>
                  <span className="text-text-primary">
                    {attempt.spokenTranscript || '(no transcript)'}
                  </span>
                  {attempt.clarity === 'clear' && (
                    <span className="ml-2 text-success">*</span>
                  )}
                </div>

                {/* Clarity */}
                <div className="mb-2">
                  <span className="text-xs text-text-secondary uppercase">
                    Clarity:{' '}
                  </span>
                  <span
                    className={`text-sm ${
                      attempt.clarity === 'clear'
                        ? 'text-success'
                        : attempt.clarity === 'partial'
                          ? 'text-warning'
                          : 'text-text-secondary'
                    }`}
                  >
                    {attempt.clarity.charAt(0).toUpperCase() +
                      attempt.clarity.slice(1)}
                  </span>
                </div>

                {/* Claude's insight */}
                {attempt.insightForParent && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-text-secondary italic">
                      {attempt.insightForParent}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
