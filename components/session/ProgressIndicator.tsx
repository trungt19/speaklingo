'use client';

interface ProgressIndicatorProps {
  current: number;
  total: number;
}

export function ProgressIndicator({ current, total }: ProgressIndicatorProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-text-secondary text-lg">
        Question {current} of {total}
      </p>
      <div className="flex gap-2">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i < current
                ? 'bg-primary'
                : i === current - 1
                  ? 'bg-primary ring-4 ring-primary/20'
                  : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
