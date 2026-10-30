export type MoodLevel = 1 | 2 | 3 | 4 | 5;
export type EnergyLevel = 1 | 2 | 3 | 4 | 5;

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Entry {
  id: string;
  date: string; // YYYY-MM-DD, one entry per day
  title: string;
  body: string;
  mood: MoodLevel;
  energy?: EnergyLevel;
  prompt?: string;
  tagIds: string[];
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export type ThemeId = 'light' | 'dark' | 'midnight' | 'forest' | 'sunset' | 'paper';

export interface Settings {
  theme: ThemeId;
  reminderEnabled: boolean;
  reminderTime: string; // HH:mm
  lockEnabled: boolean;
  biometricUnlock: boolean;
  isPremium: boolean;
  hapticsEnabled: boolean;
  onboardingCompleted: boolean;
}

export interface EntryDraft {
  date: string;
  title: string;
  body: string;
  mood: MoodLevel;
  energy?: EnergyLevel;
  tagIds: string[];
}

export interface DailyPrompt {
  id: string;
  prompt: string;
  category: 'reflection' | 'gratitude' | 'growth' | 'mindfulness';
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalEntries: number;
  lastEntryDate: string | null;
}

export interface MoodDistribution {
  mood: MoodLevel;
  label: string;
  count: number;
  percentage: number;
  color: string;
  emoji: string;
}

export interface TagStat {
  tagId: string;
  name: string;
  color: string;
  count: number;
  averageMood: number;
}
