import { Entry, MoodDistribution, MoodLevel, StreakStats, Tag, TagStat } from '../types/journal';

export const MOOD_LEVELS: MoodLevel[] = [1, 2, 3, 4, 5];

// Diverging scale: cool for low moods, neutral midpoint, warm for good ones.
export const MOOD_DEFINITIONS: Record<MoodLevel, { label: string; emoji: string; color: string }> = {
  1: { label: 'Rough', emoji: '🌧️', color: '#2a64ad' },
  2: { label: 'Low', emoji: '☁️', color: '#7ea6d8' },
  3: { label: 'Okay', emoji: '⛅', color: '#cdc8bf' },
  4: { label: 'Good', emoji: '🌤️', color: '#ef9244' },
  5: { label: 'Great', emoji: '☀️', color: '#d2581f' },
};

export function getTodayDateString(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return getTodayDateString(d);
}

export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const d = parseDate(dateStr);
  const now = new Date();
  const todayStr = getTodayDateString(now);
  const yesterdayStr = addDays(todayStr, -1);

  if (dateStr === todayStr) return 'Today';
  if (dateStr === yesterdayStr) return 'Yesterday';

  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Calculates current and longest streaks based on unique entry dates.
 */
export function calculateStreaks(entries: Entry[], referenceDateStr = getTodayDateString()): StreakStats {
  if (!entries || entries.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalEntries: 0,
      lastEntryDate: null,
    };
  }

  // Get unique sorted dates in ascending order
  const uniqueDates = Array.from(new Set(entries.map((e) => e.date))).sort();
  const totalEntries = entries.length;
  const lastEntryDate = uniqueDates[uniqueDates.length - 1];

  let longest = 0;
  let currentRun = 0;
  let prevDateStr: string | null = null;

  for (const dateStr of uniqueDates) {
    if (!prevDateStr) {
      currentRun = 1;
    } else {
      const nextDayOfPrev = addDays(prevDateStr, 1);
      if (nextDayOfPrev === dateStr) {
        currentRun += 1;
      } else {
        currentRun = 1;
      }
    }
    if (currentRun > longest) {
      longest = currentRun;
    }
    prevDateStr = dateStr;
  }

  // Calculate current streak relative to reference date (today)
  const yesterdayStr = addDays(referenceDateStr, -1);
  const hasToday = uniqueDates.includes(referenceDateStr);
  const hasYesterday = uniqueDates.includes(yesterdayStr);

  let currentStreak = 0;
  if (hasToday || hasYesterday) {
    let checkDate = hasToday ? referenceDateStr : yesterdayStr;
    while (uniqueDates.includes(checkDate)) {
      currentStreak += 1;
      checkDate = addDays(checkDate, -1);
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longest, currentStreak),
    totalEntries,
    lastEntryDate,
  };
}

/**
 * Calculates mood distribution (counts and percentages) for levels 1-5.
 */
export function calculateMoodDistribution(entries: Entry[]): MoodDistribution[] {
  const counts: Record<MoodLevel, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const entry of entries) {
    if (counts[entry.mood] !== undefined) {
      counts[entry.mood] += 1;
    }
  }

  const total = entries.length || 1;
  const levels: MoodLevel[] = [5, 4, 3, 2, 1];

  return levels.map((mood) => {
    const meta = MOOD_DEFINITIONS[mood];
    const count = counts[mood];
    return {
      mood,
      label: meta.label,
      emoji: meta.emoji,
      color: meta.color,
      count,
      percentage: entries.length > 0 ? Math.round((count / total) * 100) : 0,
    };
  });
}

/**
 * Calculates average mood score per day of the week (0 = Sunday ... 6 = Saturday).
 */
export function calculateWeekdayMood(entries: Entry[]): { dayIndex: number; dayName: string; averageMood: number; count: number }[] {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const accum = days.map((dayName, idx) => ({ dayIndex: idx, dayName, sum: 0, count: 0 }));

  for (const entry of entries) {
    const d = parseDate(entry.date);
    const dayIndex = d.getDay();
    accum[dayIndex].sum += entry.mood;
    accum[dayIndex].count += 1;
  }

  return accum.map((item) => ({
    dayIndex: item.dayIndex,
    dayName: item.dayName,
    averageMood: item.count > 0 ? Number((item.sum / item.count).toFixed(1)) : 0,
    count: item.count,
  }));
}

/**
 * Calculates tag frequencies and average mood when each tag is present.
 */
export function calculateTagCorrelations(entries: Entry[], tags: Tag[]): TagStat[] {
  const tagMap = new Map<string, Tag>(tags.map((t) => [t.id, t]));
  const tagStats = new Map<string, { sum: number; count: number }>();

  for (const entry of entries) {
    for (const tagId of entry.tagIds) {
      const current = tagStats.get(tagId) || { sum: 0, count: 0 };
      current.sum += entry.mood;
      current.count += 1;
      tagStats.set(tagId, current);
    }
  }

  const result: TagStat[] = [];
  tagStats.forEach((stat, tagId) => {
    const tag = tagMap.get(tagId);
    if (tag) {
      result.push({
        tagId,
        name: tag.name,
        color: tag.color,
        count: stat.count,
        averageMood: Number((stat.sum / stat.count).toFixed(1)),
      });
    }
  });

  return result.sort((a, b) => b.count - a.count);
}

/**
 * Validates imported JSON backup file structure.
 */
export function validateBackupData(data: unknown): { isValid: boolean; error?: string; entries?: Entry[]; tags?: Tag[] } {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Backup data must be an object' };
  }

  const obj = data as Record<string, unknown>;
  if (!Array.isArray(obj.entries)) {
    return { isValid: false, error: 'Invalid or missing "entries" list in backup' };
  }

  const entries: Entry[] = [];
  const seenDates = new Set<string>();
  for (const raw of obj.entries) {
    const item = raw as Record<string, unknown>;
    const mood = Number(item?.mood);
    if (
      !item ||
      typeof item.id !== 'string' ||
      typeof item.date !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(item.date) ||
      !Number.isInteger(mood) ||
      mood < 1 ||
      mood > 5
    ) {
      return { isValid: false, error: 'One or more entries are corrupted or missing required fields' };
    }
    if (seenDates.has(item.date)) continue; // one entry per day; keep the first
    seenDates.add(item.date);
    const energy = Number(item.energy);
    const now = new Date().toISOString();
    entries.push({
      id: item.id,
      date: item.date,
      title: typeof item.title === 'string' ? item.title : '',
      body: typeof item.body === 'string' ? item.body : '',
      mood: mood as MoodLevel,
      energy: Number.isInteger(energy) && energy >= 1 && energy <= 5 ? (energy as Entry['energy']) : undefined,
      prompt: typeof item.prompt === 'string' ? item.prompt : undefined,
      tagIds: Array.isArray(item.tagIds) ? item.tagIds.filter((t): t is string => typeof t === 'string') : [],
      createdAt: typeof item.createdAt === 'string' ? item.createdAt : now,
      updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : now,
    });
  }

  const tags = Array.isArray(obj.tags)
    ? (obj.tags as Record<string, unknown>[])
        .filter((t) => t && typeof t.id === 'string' && typeof t.name === 'string')
        .map((t) => ({ id: t.id as string, name: t.name as string, color: typeof t.color === 'string' ? t.color : '#a39a90' }))
    : undefined;

  return { isValid: true, entries, tags };
}

/**
 * Picks the weekday with the highest average mood, once there is enough data to say anything.
 */
export function findBestWeekday(entries: Entry[]): { dayName: string; averageMood: number } | null {
  const days = calculateWeekdayMood(entries).filter((d) => d.count >= 2);
  if (days.length < 2) return null;
  const best = days.reduce((a, b) => (b.averageMood > a.averageMood ? b : a));
  const fullNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return { dayName: fullNames[best.dayIndex], averageMood: best.averageMood };
}

export function formatLongDate(dateStr: string): string {
  return parseDate(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
