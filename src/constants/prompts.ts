import { DailyPrompt } from '../types/journal';

export const DAILY_PROMPTS: DailyPrompt[] = [
  {
    id: 'p1',
    prompt: 'What was a small, quiet moment today that brought you peace?',
    category: 'mindfulness',
  },
  {
    id: 'p2',
    prompt: 'What is something you learned about yourself this week?',
    category: 'growth',
  },
  {
    id: 'p3',
    prompt: 'Who made a positive difference in your day, and how?',
    category: 'gratitude',
  },
  {
    id: 'p4',
    prompt: 'If today was a chapter in your book, what title would you give it?',
    category: 'reflection',
  },
  {
    id: 'p5',
    prompt: 'What emotion visited you most often today? What was it trying to tell you?',
    category: 'reflection',
  },
  {
    id: 'p6',
    prompt: 'What is one thing you can gently release or forgive yourself for?',
    category: 'mindfulness',
  },
  {
    id: 'p7',
    prompt: 'What gave you energy today, and what felt draining?',
    category: 'reflection',
  },
  {
    id: 'p8',
    prompt: 'Name three simple sensory pleasures you noticed today.',
    category: 'gratitude',
  },
  {
    id: 'p9',
    prompt: 'How did you show kindness to yourself or someone else today?',
    category: 'mindfulness',
  },
  {
    id: 'p10',
    prompt: 'What are you looking forward to tomorrow, even if small?',
    category: 'gratitude',
  },
  {
    id: 'p11',
    prompt: 'What boundary did you protect today, or wish you had?',
    category: 'growth',
  },
  {
    id: 'p12',
    prompt: 'Describe a moment today when you felt fully present.',
    category: 'mindfulness',
  },
];

export function getPromptForDay(dateStr: string): DailyPrompt {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dayNumber = Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
  return DAILY_PROMPTS[dayNumber % DAILY_PROMPTS.length];
}
