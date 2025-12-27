import { v4 as uuidv4 } from 'uuid';

// Generate unique ID
export function generateId(): string {
  return uuidv4();
}

// Format date as YYYY-MM-DD
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Get today's date as YYYY-MM-DD
export function getTodayDate(): string {
  return formatDate(new Date());
}

// Format date for display (e.g., "Dec 26")
export function formatDisplayDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Calculate streak from progress records
export function calculateStreak(
  progressDates: string[],
  today: string = getTodayDate()
): number {
  if (progressDates.length === 0) return 0;

  // Sort dates in descending order
  const sortedDates = [...progressDates].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  let streak = 0;
  let currentDate = new Date(today);

  // Check if today or yesterday has progress
  const todayStr = formatDate(currentDate);
  const yesterdayStr = formatDate(
    new Date(currentDate.getTime() - 24 * 60 * 60 * 1000)
  );

  // Start counting from most recent valid date
  let startIndex = sortedDates.indexOf(todayStr);
  if (startIndex === -1) {
    startIndex = sortedDates.indexOf(yesterdayStr);
    if (startIndex === -1) return 0;
    currentDate = new Date(yesterdayStr);
  }

  // Count consecutive days
  for (let i = startIndex; i < sortedDates.length; i++) {
    const expectedDate = formatDate(
      new Date(currentDate.getTime() - (i - startIndex) * 24 * 60 * 60 * 1000)
    );
    if (sortedDates[i] === expectedDate) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// Simple hash function for PIN (NOT cryptographically secure - for demo only)
export function hashPIN(pin: string): string {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// Verify PIN against hash
export function verifyPIN(pin: string, hash: string): boolean {
  return hashPIN(pin) === hash;
}

// Get day of week (0 = Sunday, 6 = Saturday)
export function getDayOfWeek(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getDay();
}

// Get week start date (Monday)
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return formatDate(d);
}

// Get dates for the current week
export function getWeekDates(weekStart: string = getWeekStart()): string[] {
  const dates: string[] = [];
  const start = new Date(weekStart);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(formatDate(d));
  }
  return dates;
}

// Format duration in seconds to readable string
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)} seconds`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  if (remainingSeconds === 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  return `${minutes}m ${remainingSeconds}s`;
}

// Tailwind class merge utility
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
