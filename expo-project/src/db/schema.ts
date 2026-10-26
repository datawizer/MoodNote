/**
 * SQLite Schema definitions for MoodNote (using expo-sqlite / modern next API)
 */

export const SCHEMA_V1 = `
CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY NOT NULL,
  date TEXT NOT NULL,
  title TEXT,
  body TEXT NOT NULL,
  mood INTEGER NOT NULL CHECK (mood >= 1 AND mood <= 5),
  energy INTEGER CHECK (energy >= 1 AND energy <= 5),
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS entry_tags (
  entryId TEXT NOT NULL,
  tagId TEXT NOT NULL,
  PRIMARY KEY (entryId, tagId),
  FOREIGN KEY (entryId) REFERENCES entries (id) ON DELETE CASCADE,
  FOREIGN KEY (tagId) REFERENCES tags (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_entries_date ON entries (date DESC);
CREATE INDEX IF NOT EXISTS idx_entry_tags_entryId ON entry_tags (entryId);
CREATE INDEX IF NOT EXISTS idx_entry_tags_tagId ON entry_tags (tagId);
`;
