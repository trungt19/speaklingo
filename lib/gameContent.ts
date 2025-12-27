import { GameTopic, QuizQuestion, MemoryPair, GameImage } from '@/types';

// ============ Game Content Data ============

// Emotions content
export const EMOTIONS: GameImage[] = [
  { id: 'happy', emoji: '😊', label: 'Happy' },
  { id: 'sad', emoji: '😢', label: 'Sad' },
  { id: 'angry', emoji: '😠', label: 'Angry' },
  { id: 'scared', emoji: '😨', label: 'Scared' },
  { id: 'surprised', emoji: '😲', label: 'Surprised' },
  { id: 'excited', emoji: '🤩', label: 'Excited' },
  { id: 'tired', emoji: '😴', label: 'Tired' },
  { id: 'confused', emoji: '😕', label: 'Confused' },
];

// Greetings content
export const GREETINGS: GameImage[] = [
  { id: 'wave', emoji: '👋', label: 'Wave' },
  { id: 'smile', emoji: '😃', label: 'Smile' },
  { id: 'handshake', emoji: '🤝', label: 'Handshake' },
  { id: 'hug', emoji: '🤗', label: 'Hug' },
  { id: 'hello', emoji: '🙋', label: 'Hello' },
  { id: 'goodbye', emoji: '👋', label: 'Goodbye' },
];

// Colors content
export const COLORS: GameImage[] = [
  { id: 'red', emoji: '🔴', label: 'Red' },
  { id: 'blue', emoji: '🔵', label: 'Blue' },
  { id: 'green', emoji: '🟢', label: 'Green' },
  { id: 'yellow', emoji: '🟡', label: 'Yellow' },
  { id: 'orange', emoji: '🟠', label: 'Orange' },
  { id: 'purple', emoji: '🟣', label: 'Purple' },
  { id: 'pink', emoji: '💗', label: 'Pink' },
  { id: 'brown', emoji: '🟤', label: 'Brown' },
];

// Animals content
export const ANIMALS: GameImage[] = [
  { id: 'cat', emoji: '🐱', label: 'Cat' },
  { id: 'dog', emoji: '🐕', label: 'Dog' },
  { id: 'bird', emoji: '🐦', label: 'Bird' },
  { id: 'fish', emoji: '🐟', label: 'Fish' },
  { id: 'rabbit', emoji: '🐰', label: 'Rabbit' },
  { id: 'turtle', emoji: '🐢', label: 'Turtle' },
  { id: 'elephant', emoji: '🐘', label: 'Elephant' },
  { id: 'lion', emoji: '🦁', label: 'Lion' },
];

// Numbers content (1-10)
export const NUMBERS: GameImage[] = [
  { id: 'one', emoji: '1️⃣', label: 'One' },
  { id: 'two', emoji: '2️⃣', label: 'Two' },
  { id: 'three', emoji: '3️⃣', label: 'Three' },
  { id: 'four', emoji: '4️⃣', label: 'Four' },
  { id: 'five', emoji: '5️⃣', label: 'Five' },
  { id: 'six', emoji: '6️⃣', label: 'Six' },
  { id: 'seven', emoji: '7️⃣', label: 'Seven' },
  { id: 'eight', emoji: '8️⃣', label: 'Eight' },
];

// Objects content
export const OBJECTS: GameImage[] = [
  { id: 'apple', emoji: '🍎', label: 'Apple' },
  { id: 'book', emoji: '📚', label: 'Book' },
  { id: 'car', emoji: '🚗', label: 'Car' },
  { id: 'house', emoji: '🏠', label: 'House' },
  { id: 'ball', emoji: '⚽', label: 'Ball' },
  { id: 'phone', emoji: '📱', label: 'Phone' },
  { id: 'star', emoji: '⭐', label: 'Star' },
  { id: 'heart', emoji: '❤️', label: 'Heart' },
];

// Get content by topic
export function getContentByTopic(topic: GameTopic): GameImage[] {
  switch (topic) {
    case 'emotions':
      return EMOTIONS;
    case 'greetings':
      return GREETINGS;
    case 'colors':
      return COLORS;
    case 'animals':
      return ANIMALS;
    case 'numbers':
      return NUMBERS;
    case 'objects':
      return OBJECTS;
    default:
      return EMOTIONS;
  }
}

// ============ Quiz Questions ============

export function generateQuizQuestions(topic: GameTopic, count: number): QuizQuestion[] {
  const content = getContentByTopic(topic);
  const questions: QuizQuestion[] = [];
  const shuffled = shuffleArray([...content]);

  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    const correctItem = shuffled[i];
    const otherItems = shuffled.filter((item) => item.id !== correctItem.id);
    const wrongChoices = shuffleArray(otherItems).slice(0, 3);

    const choices = shuffleArray([
      { ...correctItem, isCorrect: true },
      ...wrongChoices.map((item) => ({ ...item, isCorrect: false })),
    ]);

    questions.push({
      id: `quiz-${topic}-${i}`,
      topic,
      questionText: getQuestionText(topic, correctItem.label),
      choices,
    });
  }

  return questions;
}

function getQuestionText(topic: GameTopic, label: string): string {
  switch (topic) {
    case 'emotions':
      return `Which face shows "${label}"?`;
    case 'greetings':
      return `Which one means "${label}"?`;
    case 'colors':
      return `Which one is ${label}?`;
    case 'animals':
      return `Which one is a ${label}?`;
    case 'numbers':
      return `Which one shows ${label}?`;
    case 'objects':
      return `Which one is a ${label}?`;
    default:
      return `Find "${label}"`;
  }
}

// ============ Memory Pairs ============

export function generateMemoryPairs(topic: GameTopic, pairCount: number): MemoryPair[] {
  const content = getContentByTopic(topic);
  const shuffled = shuffleArray([...content]);
  return shuffled.slice(0, pairCount);
}

// ============ Matching Items ============

export function generateMatchingItems(
  topic: GameTopic,
  count: number
): { items: GameImage[]; shuffledItems: GameImage[] } {
  const content = getContentByTopic(topic);
  const items = shuffleArray([...content]).slice(0, count);
  const shuffledItems = shuffleArray([...items]);
  return { items, shuffledItems };
}

// ============ Utilities ============

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Topic display info
export const TOPIC_INFO: Record<GameTopic, { name: string; emoji: string; description: string }> = {
  emotions: {
    name: 'Emotions',
    emoji: '😊',
    description: 'Learn about feelings',
  },
  greetings: {
    name: 'Greetings',
    emoji: '👋',
    description: 'Ways to say hello',
  },
  colors: {
    name: 'Colors',
    emoji: '🌈',
    description: 'Learn your colors',
  },
  animals: {
    name: 'Animals',
    emoji: '🐾',
    description: 'Fun with animals',
  },
  numbers: {
    name: 'Numbers',
    emoji: '🔢',
    description: 'Count with me',
  },
  objects: {
    name: 'Objects',
    emoji: '🎁',
    description: 'Everyday things',
  },
};

// Game type info
export const GAME_INFO: Record<
  string,
  { name: string; emoji: string; description: string }
> = {
  matching: {
    name: 'Word Match',
    emoji: '🔗',
    description: 'Match words to pictures',
  },
  quiz: {
    name: 'Picture Quiz',
    emoji: '❓',
    description: 'Pick the right picture',
  },
  memory: {
    name: 'Memory',
    emoji: '🧠',
    description: 'Find matching pairs',
  },
};
