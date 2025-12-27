import { Prompt } from '@/types';

// Category 1: Daily Reflection (Easiest - Start here)
const dailyPrompts: Prompt[] = [
  {
    id: 'daily-1',
    category: 'daily',
    difficulty: 2,
    questionText: 'What did you do today?',
    followUp: 'What was your favorite part?',
  },
  {
    id: 'daily-2',
    category: 'daily',
    difficulty: 2,
    questionText: 'What did you eat for lunch?',
    followUp: 'Did you like it?',
  },
  {
    id: 'daily-3',
    category: 'daily',
    difficulty: 3,
    questionText: 'What are you thinking about right now?',
  },
  {
    id: 'daily-4',
    category: 'daily',
    difficulty: 2,
    questionText: 'What did you see today?',
    followUp: 'What color was it?',
  },
  {
    id: 'daily-5',
    category: 'daily',
    difficulty: 2,
    questionText: 'How are you feeling?',
    followUp: 'What made you feel that way?',
  },
];

// Category 2: Interests (Medium - Tristan's comfort zone)
const interestPrompts: Prompt[] = [
  {
    id: 'interest-1',
    category: 'interests',
    difficulty: 2,
    questionText: 'What do you like to do on your iPad?',
    followUp: 'What app do you like most?',
  },
  {
    id: 'interest-2',
    category: 'interests',
    difficulty: 2,
    questionText: 'What did you write in Notepad today?',
    followUp: 'Can you tell me more about it?',
  },
  {
    id: 'interest-3',
    category: 'interests',
    difficulty: 2,
    questionText: 'What do you like about ChatGPT?',
    followUp: 'What do you like to ask it?',
  },
  {
    id: 'interest-4',
    category: 'interests',
    difficulty: 2,
    questionText: "What's your favorite app?",
    followUp: 'Why do you like it?',
  },
  {
    id: 'interest-5',
    category: 'interests',
    difficulty: 2,
    questionText: 'What do you like to watch?',
    followUp: 'What is it about?',
  },
];

// Category 3: Simple Choices (Easiest - Low pressure)
const choicePrompts: Prompt[] = [
  {
    id: 'choice-1',
    category: 'choice',
    difficulty: 1,
    questionText: "What's your favorite color: red, blue, or green?",
  },
  {
    id: 'choice-2',
    category: 'choice',
    difficulty: 1,
    questionText: 'Would you rather draw or write?',
  },
  {
    id: 'choice-3',
    category: 'choice',
    difficulty: 1,
    questionText: 'Do you like morning or night better?',
  },
  {
    id: 'choice-4',
    category: 'choice',
    difficulty: 1,
    questionText: 'True or false: You like pizza.',
  },
  {
    id: 'choice-5',
    category: 'choice',
    difficulty: 1,
    questionText: 'Pick one: Cat, dog, or bird.',
  },
];

// All prompts
export const PROMPTS: Prompt[] = [
  ...dailyPrompts,
  ...interestPrompts,
  ...choicePrompts,
];

// Get prompts by category
export function getPromptsByCategory(category: Prompt['category']): Prompt[] {
  return PROMPTS.filter((p) => p.category === category);
}

// Get prompts by difficulty
export function getPromptsByDifficulty(difficulty: 1 | 2 | 3): Prompt[] {
  return PROMPTS.filter((p) => p.difficulty <= difficulty);
}

// Get random prompts for a session
export function getSessionPrompts(
  difficulty: 1 | 2 | 3,
  count: number = 3,
  excludeIds: string[] = []
): Prompt[] {
  // For week 1, mix daily and choice prompts
  const availablePrompts = PROMPTS.filter(
    (p) => p.difficulty <= difficulty && !excludeIds.includes(p.id)
  );

  // Shuffle and select
  const shuffled = [...availablePrompts].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Get a specific prompt by ID
export function getPromptById(id: string): Prompt | undefined {
  return PROMPTS.find((p) => p.id === id);
}
