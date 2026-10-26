import { Entry, Settings, Tag } from '../types/journal';
import { DEFAULT_TAGS } from '../constants/tags';
import { addDays, getTodayDateString } from '../utils/journalLogic';

const STORAGE_KEYS = {
  ENTRIES: 'moodnote_entries_v1',
  TAGS: 'moodnote_tags_v1',
  SETTINGS: 'moodnote_settings_v1',
  DRAFT: 'moodnote_draft_v1',
  SCHEMA_VERSION: 'moodnote_schema_version',
};

const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  reminderEnabled: true,
  reminderTime: '21:00',
  biometricsEnabled: false,
  pinCode: '',
  isLocked: false,
  isPremium: false,
  hapticsEnabled: true,
  soundEnabled: true,
  onboardingCompleted: true,
};

export class StorageService {
  private static instance: StorageService;

  private constructor() {
    this.runMigrations();
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Run schema migrations
   */
  private runMigrations(): void {
    const currentVersion = parseInt(localStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION) || '0', 10);
    if (currentVersion < 1) {
      // Initialize default tags if empty
      if (!localStorage.getItem(STORAGE_KEYS.TAGS)) {
        localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(DEFAULT_TAGS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      }
      localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, '1');
    }
  }

  public getEntries(): Entry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ENTRIES);
      if (!data) return [];
      const parsed: Entry[] = JSON.parse(data);
      return parsed.sort((a, b) => b.date.localeCompare(a.date));
    } catch (e) {
      console.error('Failed to parse entries', e);
      return [];
    }
  }

  public getEntryById(id: string): Entry | undefined {
    return this.getEntries().find((e) => e.id === id);
  }

  public getEntryByDate(dateStr: string): Entry | undefined {
    return this.getEntries().find((e) => e.date === dateStr);
  }

  public saveEntry(entry: Entry): Entry {
    const entries = this.getEntries();
    const existingIndex = entries.findIndex((e) => e.id === entry.id || e.date === entry.date);

    const updatedEntry = {
      ...entry,
      updatedAt: new Date().toISOString(),
      createdAt: entry.createdAt || new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      entries[existingIndex] = updatedEntry;
    } else {
      entries.unshift(updatedEntry);
    }

    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
    return updatedEntry;
  }

  public deleteEntry(id: string): void {
    const entries = this.getEntries().filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  }

  public getTags(): Tag[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TAGS);
      if (!data) return DEFAULT_TAGS;
      return JSON.parse(data);
    } catch {
      return DEFAULT_TAGS;
    }
  }

  public saveTag(tag: Tag): void {
    const tags = this.getTags();
    const index = tags.findIndex((t) => t.id === tag.id);
    if (index >= 0) {
      tags[index] = tag;
    } else {
      tags.push(tag);
    }
    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
  }

  public getSettings(): Settings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public updateSettings(partial: Partial<Settings>): Settings {
    const current = this.getSettings();
    const updated = { ...current, ...partial };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }

  public saveDraft(draft: Partial<Entry> | null): void {
    if (!draft) {
      localStorage.removeItem(STORAGE_KEYS.DRAFT);
    } else {
      localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(draft));
    }
  }

  public getDraft(): Partial<Entry> | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DRAFT);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  /**
   * Generates 30 days of realistic seed data for dev testing
   */
  public generate30DaySeed(): void {
    const today = getTodayDateString();
    const sampleJournals = [
      {
        title: 'Morning sunrise run & deep clarity',
        body: 'Woke up at 6:30 AM before the city buzzed. Crisp morning air on the river trail. Caught a gorgeous orange glow over the skyline. Completed 5K without looking at pace once. Today felt grounded and peaceful.',
        mood: 5 as const,
        energy: 5 as const,
        tags: ['exercise', 'nature', 'health'],
      },
      {
        title: 'Productive sprint review & team lunch',
        body: 'Shipped the new notification architecture. Everyone on the team gave positive feedback. Had tacos together outside in the courtyard. Felt like real momentum after weeks of debugging.',
        mood: 4 as const,
        energy: 4 as const,
        tags: ['work', 'friends', 'food'],
      },
      {
        title: 'Slow evening with green tea and book',
        body: 'Finished reading chapter 6 of The Creative Act. Took a long hot shower, listened to rain gently tapping the windowsill. Practiced 10 minutes of box breathing before bed.',
        mood: 4 as const,
        energy: 3 as const,
        tags: ['reading', 'mindfulness', 'sleep'],
      },
      {
        title: 'Fatigue crept in by mid-afternoon',
        body: 'Too many back-to-back meetings without bio breaks. Felt mentally depleted by 3 PM. Resisted checking work emails after 6 PM to protect evening boundaries.',
        mood: 2 as const,
        energy: 2 as const,
        tags: ['work', 'sleep'],
      },
      {
        title: 'Quiet Sunday pancakes & farmer’s market',
        body: 'Made sourdough banana pancakes with mom. Walked through the local weekend market, bought fresh eucalyptus and artisanal honey. Simple joys that recharge the spirit.',
        mood: 5 as const,
        energy: 4 as const,
        tags: ['family', 'food', 'nature'],
      },
      {
        title: 'Rainy gray mood, needed grace with myself',
        body: 'Felt an anxious weight in the chest for no obvious reason. Decided not to fight it. Cancelled gym plans, wrapped in a blanket, and watched an old Studio Ghibli film.',
        mood: 1 as const,
        energy: 1 as const,
        tags: ['health', 'sleep'],
      },
      {
        title: 'Steady progress on side creative project',
        body: 'Carved out 90 minutes of flow state sketching new interface concepts. Lost track of time in a good way. Coffee was especially delicious today.',
        mood: 4 as const,
        energy: 4 as const,
        tags: ['hobbies', 'food'],
      },
      {
        title: 'Call with old friend across the country',
        body: 'Caught up with Alex for over an hour. Talked about careers, dreams, and childhood memories. Remarkable how certain friendships pick up instantly regardless of time.',
        mood: 5 as const,
        energy: 4 as const,
        tags: ['friends', 'mindfulness'],
      },
      {
        title: 'Average Wednesday routine',
        body: 'Nothing standout good or bad. Handled grocery shopping, cleaned the desk, prepped lunch for tomorrow. An ordinary, stable day.',
        mood: 3 as const,
        energy: 3 as const,
        tags: ['work', 'food'],
      },
    ];

    const generated: Entry[] = [];
    // Generate 30 days of entries leading up to today
    for (let i = 29; i >= 0; i--) {
      // Occasional rest day with no entry to test streak calculations realistically (e.g. at day 18)
      if (i === 18) continue;

      const dateStr = addDays(today, -i);
      const sample = sampleJournals[(29 - i) % sampleJournals.length];

      // Add mild variation
      const moodVal = sample.mood;
      const energyVal = sample.energy;

      generated.push({
        id: `seed-${dateStr}`,
        date: dateStr,
        title: sample.title,
        body: sample.body,
        mood: moodVal,
        energy: energyVal,
        tagIds: sample.tags,
        createdAt: new Date(`${dateStr}T20:30:00Z`).toISOString(),
        updatedAt: new Date(`${dateStr}T20:30:00Z`).toISOString(),
      });
    }

    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(generated));
  }

  public clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.ENTRIES);
    localStorage.removeItem(STORAGE_KEYS.DRAFT);
  }

  public exportBackupJson(): string {
    const payload = {
      app: 'MoodNote',
      version: 1,
      exportedAt: new Date().toISOString(),
      entries: this.getEntries(),
      tags: this.getTags(),
      settings: this.getSettings(),
    };
    return JSON.stringify(payload, null, 2);
  }

  public importBackupJson(jsonString: string): { success: boolean; count?: number; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed.entries)) {
        return { success: false, error: 'Invalid backup file: "entries" array not found' };
      }
      localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(parsed.entries));
      if (Array.isArray(parsed.tags)) {
        localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(parsed.tags));
      }
      return { success: true, count: parsed.entries.length };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Could not parse JSON' };
    }
  }
}

export const storage = StorageService.getInstance();
