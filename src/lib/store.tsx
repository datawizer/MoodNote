import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { THEMES, Theme } from '../constants/themes';
import { Entry, Settings, Tag } from '../types/journal';
import * as db from './db';
import { newId } from './journalLogic';

const LOCK_AFTER_BACKGROUND_MS = 30_000;

interface AppStore {
  entries: Entry[];
  tags: Tag[];
  settings: Settings;
  theme: Theme;
  locked: boolean;
  saveEntry: (entry: Entry) => void;
  deleteEntry: (id: string) => void;
  addTag: (name: string) => Tag;
  updateSettings: (partial: Partial<Settings>) => void;
  reload: () => void;
  lock: () => void;
  unlock: () => void;
}

const StoreContext = createContext<AppStore | null>(null);

const TAG_COLORS = ['#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#f59e0b', '#06b6d4', '#f43f5e', '#84cc16'];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>(() => db.getEntries());
  const [tags, setTags] = useState<Tag[]>(() => db.getTags());
  const [settings, setSettings] = useState<Settings>(() => db.getSettings());
  const [locked, setLocked] = useState(() => db.getSettings().lockEnabled);
  const backgroundedAt = useRef<number | null>(null);

  const reload = useCallback(() => {
    setEntries(db.getEntries());
    setTags(db.getTags());
    setSettings(db.getSettings());
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') {
        backgroundedAt.current = Date.now();
      } else if (state === 'active' && backgroundedAt.current !== null) {
        const away = Date.now() - backgroundedAt.current;
        backgroundedAt.current = null;
        if (away >= LOCK_AFTER_BACKGROUND_MS && db.getSettings().lockEnabled) setLocked(true);
      }
    });
    return () => sub.remove();
  }, []);

  const saveEntry = useCallback((entry: Entry) => {
    db.saveEntry(entry);
    setEntries(db.getEntries());
  }, []);

  const deleteEntry = useCallback((id: string) => {
    db.deleteEntry(id);
    setEntries(db.getEntries());
  }, []);

  const addTag = useCallback((name: string) => {
    const existing = db.getTags().find((t) => t.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;
    const tag: Tag = {
      id: newId('tag'),
      name,
      color: TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)],
    };
    db.saveTag(tag);
    setTags(db.getTags());
    return tag;
  }, []);

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setSettings(db.updateSettings(partial));
  }, []);

  const lock = useCallback(() => setLocked(true), []);
  const unlock = useCallback(() => setLocked(false), []);

  const value = useMemo<AppStore>(
    () => ({
      entries,
      tags,
      settings,
      theme: THEMES[settings.theme] ?? THEMES.light,
      locked: locked && settings.lockEnabled,
      saveEntry,
      deleteEntry,
      addTag,
      updateSettings,
      reload,
      lock,
      unlock,
    }),
    [entries, tags, settings, locked, saveEntry, deleteEntry, addTag, updateSettings, reload, lock, unlock]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): AppStore {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <AppProvider>');
  return ctx;
}

export function useTheme(): Theme {
  return useStore().theme;
}
