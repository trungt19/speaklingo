import { GameTopic, QuizQuestion, MemoryPair, GameImage, KaraokeLine, EchoPhrase, WordBuilderWord, BeatPattern } from '@/types';

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
  karaoke: {
    name: 'Rap Karaoke',
    emoji: '🎤',
    description: 'Tap words to the beat',
  },
  echo: {
    name: 'Echo Challenge',
    emoji: '🔊',
    description: 'Listen and repeat',
  },
  wordbuilder: {
    name: 'Word Builder',
    emoji: '🔤',
    description: 'Spell words with letters',
  },
  beatmaker: {
    name: 'Beat Maker',
    emoji: '🥁',
    description: 'Create fun rhythms',
  },
};

// ============ Rap Karaoke Content ============

export const KARAOKE_LINES: KaraokeLine[] = [
  {
    id: 'k1',
    words: [
      { id: 'k1w1', text: 'I', beatIndex: 0 },
      { id: 'k1w2', text: 'am', beatIndex: 1 },
      { id: 'k1w3', text: 'happy', beatIndex: 2 },
      { id: 'k1w4', text: 'today', beatIndex: 3 },
    ],
    bpm: 80,
  },
  {
    id: 'k2',
    words: [
      { id: 'k2w1', text: 'Hello', beatIndex: 0 },
      { id: 'k2w2', text: 'my', beatIndex: 1 },
      { id: 'k2w3', text: 'friend', beatIndex: 2 },
    ],
    bpm: 80,
  },
  {
    id: 'k3',
    words: [
      { id: 'k3w1', text: 'Red', beatIndex: 0 },
      { id: 'k3w2', text: 'blue', beatIndex: 1 },
      { id: 'k3w3', text: 'green', beatIndex: 2 },
      { id: 'k3w4', text: 'yellow', beatIndex: 3 },
    ],
    bpm: 90,
  },
  {
    id: 'k4',
    words: [
      { id: 'k4w1', text: 'One', beatIndex: 0 },
      { id: 'k4w2', text: 'two', beatIndex: 1 },
      { id: 'k4w3', text: 'three', beatIndex: 2 },
      { id: 'k4w4', text: 'four', beatIndex: 3 },
    ],
    bpm: 100,
  },
  {
    id: 'k5',
    words: [
      { id: 'k5w1', text: 'Cat', beatIndex: 0 },
      { id: 'k5w2', text: 'and', beatIndex: 1 },
      { id: 'k5w3', text: 'dog', beatIndex: 2 },
      { id: 'k5w4', text: 'are', beatIndex: 3 },
      { id: 'k5w5', text: 'friends', beatIndex: 4 },
    ],
    bpm: 85,
  },
];

export function getKaraokeLines(count: number): KaraokeLine[] {
  return shuffleArray([...KARAOKE_LINES]).slice(0, count);
}

// ============ Echo Challenge Content ============

export const ECHO_PHRASES: Record<GameTopic, EchoPhrase[]> = {
  emotions: [
    { id: 'e1', text: 'I am happy', emoji: '😊', audioHint: 'I am happy' },
    { id: 'e2', text: 'I feel sad', emoji: '😢', audioHint: 'I feel sad' },
    { id: 'e3', text: 'I am excited', emoji: '🤩', audioHint: 'I am excited' },
    { id: 'e4', text: 'I feel tired', emoji: '😴', audioHint: 'I feel tired' },
  ],
  greetings: [
    { id: 'g1', text: 'Hello', emoji: '👋', audioHint: 'Hello' },
    { id: 'g2', text: 'Good morning', emoji: '🌅', audioHint: 'Good morning' },
    { id: 'g3', text: 'How are you', emoji: '🙋', audioHint: 'How are you' },
    { id: 'g4', text: 'Nice to meet you', emoji: '🤝', audioHint: 'Nice to meet you' },
  ],
  colors: [
    { id: 'c1', text: 'Red', emoji: '🔴', audioHint: 'Red' },
    { id: 'c2', text: 'Blue', emoji: '🔵', audioHint: 'Blue' },
    { id: 'c3', text: 'Green', emoji: '🟢', audioHint: 'Green' },
    { id: 'c4', text: 'Yellow', emoji: '🟡', audioHint: 'Yellow' },
  ],
  animals: [
    { id: 'a1', text: 'Cat', emoji: '🐱', audioHint: 'Cat' },
    { id: 'a2', text: 'Dog', emoji: '🐕', audioHint: 'Dog' },
    { id: 'a3', text: 'Bird', emoji: '🐦', audioHint: 'Bird' },
    { id: 'a4', text: 'Fish', emoji: '🐟', audioHint: 'Fish' },
  ],
  numbers: [
    { id: 'n1', text: 'One', emoji: '1️⃣', audioHint: 'One' },
    { id: 'n2', text: 'Two', emoji: '2️⃣', audioHint: 'Two' },
    { id: 'n3', text: 'Three', emoji: '3️⃣', audioHint: 'Three' },
    { id: 'n4', text: 'Four', emoji: '4️⃣', audioHint: 'Four' },
  ],
  objects: [
    { id: 'o1', text: 'Apple', emoji: '🍎', audioHint: 'Apple' },
    { id: 'o2', text: 'Book', emoji: '📚', audioHint: 'Book' },
    { id: 'o3', text: 'Car', emoji: '🚗', audioHint: 'Car' },
    { id: 'o4', text: 'House', emoji: '🏠', audioHint: 'House' },
  ],
};

export function getEchoPhrases(topic: GameTopic, count: number): EchoPhrase[] {
  return shuffleArray([...ECHO_PHRASES[topic]]).slice(0, count);
}

// ============ Word Builder Content ============

export const WORD_BUILDER_WORDS: Record<GameTopic, WordBuilderWord[]> = {
  emotions: [
    { id: 'wb1', word: 'HAPPY', emoji: '😊', hint: 'Feeling good' },
    { id: 'wb2', word: 'SAD', emoji: '😢', hint: 'Feeling down' },
    { id: 'wb3', word: 'ANGRY', emoji: '😠', hint: 'Feeling mad' },
    { id: 'wb4', word: 'LOVE', emoji: '❤️', hint: 'A warm feeling' },
  ],
  greetings: [
    { id: 'wg1', word: 'HELLO', emoji: '👋', hint: 'Say hi' },
    { id: 'wg2', word: 'BYE', emoji: '👋', hint: 'Say goodbye' },
    { id: 'wg3', word: 'HI', emoji: '🙋', hint: 'Short greeting' },
    { id: 'wg4', word: 'WAVE', emoji: '👋', hint: 'Move your hand' },
  ],
  colors: [
    { id: 'wc1', word: 'RED', emoji: '🔴', hint: 'Color of apples' },
    { id: 'wc2', word: 'BLUE', emoji: '🔵', hint: 'Color of sky' },
    { id: 'wc3', word: 'GREEN', emoji: '🟢', hint: 'Color of grass' },
    { id: 'wc4', word: 'PINK', emoji: '💗', hint: 'Light red color' },
  ],
  animals: [
    { id: 'wa1', word: 'CAT', emoji: '🐱', hint: 'Says meow' },
    { id: 'wa2', word: 'DOG', emoji: '🐕', hint: 'Says woof' },
    { id: 'wa3', word: 'BIRD', emoji: '🐦', hint: 'Can fly' },
    { id: 'wa4', word: 'FISH', emoji: '🐟', hint: 'Lives in water' },
  ],
  numbers: [
    { id: 'wn1', word: 'ONE', emoji: '1️⃣', hint: 'First number' },
    { id: 'wn2', word: 'TWO', emoji: '2️⃣', hint: 'After one' },
    { id: 'wn3', word: 'TEN', emoji: '🔟', hint: 'Two hands' },
    { id: 'wn4', word: 'FIVE', emoji: '5️⃣', hint: 'One hand' },
  ],
  objects: [
    { id: 'wo1', word: 'BALL', emoji: '⚽', hint: 'Round toy' },
    { id: 'wo2', word: 'BOOK', emoji: '📚', hint: 'Has pages' },
    { id: 'wo3', word: 'CAR', emoji: '🚗', hint: 'Has wheels' },
    { id: 'wo4', word: 'STAR', emoji: '⭐', hint: 'Shines at night' },
  ],
};

export function getWordBuilderWords(topic: GameTopic, count: number): WordBuilderWord[] {
  return shuffleArray([...WORD_BUILDER_WORDS[topic]]).slice(0, count);
}

// ============ Beat Maker Content ============

export const BEAT_PATTERNS: BeatPattern[] = [
  { id: 'bp1', name: 'Simple', pattern: [true, false, true, false], bpm: 80 },
  { id: 'bp2', name: 'March', pattern: [true, true, false, false], bpm: 90 },
  { id: 'bp3', name: 'Quick', pattern: [true, false, false, true], bpm: 100 },
  { id: 'bp4', name: 'Double', pattern: [true, true, true, false], bpm: 85 },
  { id: 'bp5', name: 'Bouncy', pattern: [true, false, true, true], bpm: 95 },
  { id: 'bp6', name: 'Full', pattern: [true, true, true, true], bpm: 75 },
];

export function getBeatPatterns(count: number): BeatPattern[] {
  return shuffleArray([...BEAT_PATTERNS]).slice(0, count);
}
