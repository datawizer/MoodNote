import { router } from 'expo-router';
import { MoodLevel } from '../types/journal';

export function openEntry(params: { date: string; mood?: MoodLevel; prompt?: string }) {
  router.push({
    pathname: '/entry',
    params: {
      date: params.date,
      ...(params.mood ? { mood: String(params.mood) } : {}),
      ...(params.prompt ? { prompt: params.prompt } : {}),
    },
  });
}
