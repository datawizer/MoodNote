export type MoodLevel = 1 | 2 | 3 | 4 | 5;
export type EnergyLevel = 1 | 2 | 3 | 4 | 5;

export interface Tag {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface Entry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  body: string;
  mood: MoodLevel;
  energy?: EnergyLevel;
  tagIds: string[];
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export type ThemeId = 'light' | 'dark' | 'midnight' | 'forest' | 'sunset' | 'paper';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  isPremium: boolean;
  bg: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentHover: string;
  accentText: string;
  chipBg: string;
  navBg: string;
  navActive: string;
  editorBg: string;
}

export interface Settings {
  theme: ThemeId;
  reminderEnabled: boolean;
  reminderTime: string; // HH:mm
  biometricsEnabled: boolean;
  pinCode: string; // 4 digits or empty
  isLocked: boolean;
  isPremium: boolean;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  onboardingCompleted: boolean;
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
