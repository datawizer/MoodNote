import * as SQLite from 'expo-sqlite';
import { DEFAULT_TAGS } from '../constants/tags';
import { Entry, EntryDraft, Settings, Tag } from '../types/journal';
import { addDays, getTodayDateString } from './journalLogic';

const db = SQLite.openDatabaseSync('moodnote.db');

export const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  reminderEnabled: false,
  reminderTime: '21:00',
  lockEnabled: false,
  biometricUnlock: true,
  isPremium: false,
  hapticsEnabled: true,
  onboardingCompleted: false,
};

const MIGRATIONS: string[] = [
  `
  CREATE TABLE IF NOT EXISTS entries (
    id TEXT PRIMARY KEY NOT NULL,
    date TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL DEFAULT '',
    mood INTEGER NOT NULL CHECK (mood BETWEEN 1 AND 5),
    energy INTEGER CHECK (energy BETWEEN 1 AND 5),
    prompt TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    sortOrder INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS entry_tags (
    entryId TEXT NOT NULL REFERENCES entries (id) ON DELETE CASCADE,
    tagId TEXT NOT NULL REFERENCES tags (id) ON DELETE CASCADE,
    PRIMARY KEY (entryId, tagId)
  );
  CREATE TABLE IF NOT EXISTS kv (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_entries_date ON entries (date DESC);
  CREATE INDEX IF NOT EXISTS idx_entry_tags_tag ON entry_tags (tagId);
  `,
];

function migrate() {
  db.execSync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  const row = db.getFirstSync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;
  while (version < MIGRATIONS.length) {
    const sql = MIGRATIONS[version];
    const isFirst = version === 0;
    db.withTransactionSync(() => {
      db.execSync(sql);
      if (isFirst) {
        DEFAULT_TAGS.forEach((tag, i) => {
          db.runSync('INSERT OR IGNORE INTO tags (id, name, color, sortOrder) VALUES (?, ?, ?, ?)', tag.id, tag.name, tag.color, i);
        });
      }
    });
    version += 1;
    db.execSync(`PRAGMA user_version = ${version}`);
  }
}

migrate();

interface EntryRow {
  id: string;
  date: string;
  title: string;
  body: string;
  mood: number;
  energy: number | null;
  prompt: string | null;
  createdAt: string;
  updatedAt: string;
  tagIds: string | null;
}

function rowToEntry(row: EntryRow): Entry {
  return {
    id: row.id,
    date: row.date,
    title: row.title,
    body: row.body,
    mood: row.mood as Entry['mood'],
    energy: (row.energy ?? undefined) as Entry['energy'],
    prompt: row.prompt ?? undefined,
    tagIds: row.tagIds ? row.tagIds.split(',') : [],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function getEntries(): Entry[] {
  const rows = db.getAllSync<EntryRow>(`
    SELECT e.*, (SELECT group_concat(tagId) FROM entry_tags WHERE entryId = e.id) AS tagIds
    FROM entries e
    ORDER BY e.date DESC
  `);
  return rows.map(rowToEntry);
}

function writeEntry(entry: Entry) {
  db.runSync(
    `INSERT INTO entries (id, date, title, body, mood, energy, prompt, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       date = excluded.date, title = excluded.title, body = excluded.body, mood = excluded.mood,
       energy = excluded.energy, prompt = excluded.prompt, updatedAt = excluded.updatedAt`,
    entry.id,
    entry.date,
    entry.title,
    entry.body,
    entry.mood,
    entry.energy ?? null,
    entry.prompt ?? null,
    entry.createdAt,
    entry.updatedAt
  );
  db.runSync('DELETE FROM entry_tags WHERE entryId = ?', entry.id);
  for (const tagId of new Set(entry.tagIds)) {
    db.runSync('INSERT OR IGNORE INTO entry_tags (entryId, tagId) SELECT ?, id FROM tags WHERE id = ?', entry.id, tagId);
  }
}

/**
 * Saves an entry. If another entry already exists for the same date it is replaced,
 * so callers must confirm that with the user first.
 */
export function saveEntry(entry: Entry): void {
  db.withTransactionSync(() => {
    db.runSync('DELETE FROM entries WHERE date = ? AND id != ?', entry.date, entry.id);
    writeEntry(entry);
  });
}

export function deleteEntry(id: string): void {
  db.runSync('DELETE FROM entries WHERE id = ?', id);
}

export function getTags(): Tag[] {
  return db.getAllSync<Tag>('SELECT id, name, color FROM tags ORDER BY sortOrder, name');
}

export function saveTag(tag: Tag): void {
  db.runSync(
    `INSERT INTO tags (id, name, color, sortOrder)
     VALUES (?, ?, ?, (SELECT COALESCE(MAX(sortOrder), 0) + 1 FROM tags))
     ON CONFLICT(id) DO UPDATE SET name = excluded.name, color = excluded.color`,
    tag.id,
    tag.name,
    tag.color
  );
}

function getKv<T>(key: string): T | null {
  const row = db.getFirstSync<{ value: string }>('SELECT value FROM kv WHERE key = ?', key);
  if (!row) return null;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return null;
  }
}

function setKv(key: string, value: unknown) {
  db.runSync(
    'INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    key,
    JSON.stringify(value)
  );
}

export function getSettings(): Settings {
  return { ...DEFAULT_SETTINGS, ...(getKv<Partial<Settings>>('settings') ?? {}) };
}

export function updateSettings(partial: Partial<Settings>): Settings {
  const next = { ...getSettings(), ...partial };
  setKv('settings', next);
  return next;
}

export function getDraft(): EntryDraft | null {
  return getKv<EntryDraft>('draft');
}

export function saveDraft(draft: EntryDraft | null): void {
  if (draft) setKv('draft', draft);
  else db.runSync("DELETE FROM kv WHERE key = 'draft'");
}

export function clearAllEntries(): void {
  db.withTransactionSync(() => {
    db.runSync('DELETE FROM entries');
    db.runSync("DELETE FROM kv WHERE key = 'draft'");
  });
}

export function exportBackup() {
  return {
    app: 'MoodNote',
    version: 2,
    exportedAt: new Date().toISOString(),
    entries: getEntries(),
    tags: getTags(),
  };
}

/** Replaces all entries with the backup's, and merges its tags into the existing ones. */
export function importBackup(entries: Entry[], tags: Tag[] | undefined): void {
  db.withTransactionSync(() => {
    tags?.forEach(saveTag);
    // Tags referenced by entries but missing from the backup still need a row.
    const known = new Set(getTags().map((t) => t.id));
    for (const id of new Set(entries.flatMap((e) => e.tagIds))) {
      if (!known.has(id)) saveTag({ id, name: id, color: '#a39a90' });
    }
    db.runSync('DELETE FROM entries');
    entries.forEach(writeEntry);
  });
}

const SAMPLE_JOURNALS: Omit<Entry, 'id' | 'date' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Morning run and a clear head',
    body: 'Woke up at 6:30 before the city got loud. Crisp air on the river trail and an orange glow over the skyline. Finished 5K without checking my pace once. Today felt grounded.',
    mood: 5,
    energy: 5,
    tagIds: ['exercise', 'nature', 'health'],
  },
  {
    title: 'Sprint review and team lunch',
    body: 'Shipped the new notification work. Good feedback from the team, then tacos together in the courtyard. Real momentum after weeks of debugging.',
    mood: 4,
    energy: 4,
    tagIds: ['work', 'friends', 'food'],
  },
  {
    title: 'Slow evening with tea and a book',
    body: 'Finished another chapter, took a long shower and listened to the rain. Ten minutes of box breathing before bed.',
    mood: 4,
    energy: 3,
    tagIds: ['reading', 'mindfulness', 'sleep'],
  },
  {
    title: 'Tired by mid-afternoon',
    body: 'Too many back-to-back meetings. Mentally drained by 3 PM. Did not check email after 6 to protect the evening.',
    mood: 2,
    energy: 2,
    tagIds: ['work', 'sleep'],
  },
  {
    title: 'Pancakes and the farmers market',
    body: 'Made banana pancakes with mom, then wandered the weekend market for eucalyptus and local honey. Simple, recharging.',
    mood: 5,
    energy: 4,
    tagIds: ['family', 'food', 'nature'],
  },
  {
    title: 'Grey day, going easy on myself',
    body: 'An anxious weight in my chest for no clear reason. Decided not to fight it, skipped the gym and watched an old favourite film under a blanket.',
    mood: 1,
    energy: 1,
    tagIds: ['health', 'sleep'],
  },
  {
    title: 'Progress on the side project',
    body: 'Ninety minutes of real flow sketching new ideas. Lost track of time in the good way.',
    mood: 4,
    energy: 4,
    tagIds: ['hobbies'],
  },
  {
    title: 'Long call with an old friend',
    body: 'Caught up for over an hour about work, plans and old memories. Some friendships pick up instantly no matter how long it has been.',
    mood: 5,
    energy: 4,
    tagIds: ['friends', 'mindfulness'],
  },
  {
    title: 'An ordinary Wednesday',
    body: 'Groceries, cleaned the desk, prepped tomorrow’s lunch. Nothing standout, and that is fine.',
    mood: 3,
    energy: 3,
    tagIds: ['work', 'food'],
  },
];

/** Replaces all entries with 30 days of sample reflections (one rest day included). */
export function seedSampleData(): void {
  const today = getTodayDateString();
  const entries: Entry[] = [];
  for (let i = 29; i >= 0; i--) {
    if (i === 18) continue;
    const date = addDays(today, -i);
    const sample = SAMPLE_JOURNALS[(29 - i) % SAMPLE_JOURNALS.length];
    const stamp = new Date(`${date}T20:30:00`).toISOString();
    entries.push({ ...sample, id: `seed-${date}`, date, createdAt: stamp, updatedAt: stamp });
  }
  importBackup(entries, undefined);
}
