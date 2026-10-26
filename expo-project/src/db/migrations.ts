import * as SQLite from 'expo-sqlite';
import { SCHEMA_V1 } from './schema';

export const DATABASE_NAME = 'moodnote.db';

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

  // Enable WAL mode and foreign keys
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // Run versioned migrations
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion < 1) {
    await db.execAsync(SCHEMA_V1);
    // Seed initial tags
    await db.runAsync(`
      INSERT OR IGNORE INTO tags (id, name, color) VALUES
      ('work', 'Work', '#3b82f6'),
      ('family', 'Family', '#ec4899'),
      ('friends', 'Friends', '#8b5cf6'),
      ('exercise', 'Exercise', '#10b981'),
      ('sleep', 'Sleep', '#6366f1'),
      ('reading', 'Reading', '#f59e0b'),
      ('nature', 'Nature', '#14b8a6'),
      ('hobbies', 'Hobbies', '#f43f5e'),
      ('health', 'Health', '#06b6d4'),
      ('travel', 'Travel', '#eab308');
    `);
    await db.execAsync('PRAGMA user_version = 1;');
  }

  return db;
}
