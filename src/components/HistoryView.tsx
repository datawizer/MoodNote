import React, { useState } from 'react';
import { Entry, MoodLevel, Tag } from '../types/journal';
import { EntryCard } from './EntryCard';
import { AdBanner } from './AdBanner';
import { MOOD_DEFINITIONS } from '../utils/journalLogic';
import { Search, PenLine, BookOpen } from 'lucide-react';

interface HistoryViewProps {
  entries: Entry[];
  tags: Tag[];
  onSelectEntry: (entry: Entry) => void;
  onOpenNewEntry: () => void;
  isPremium: boolean;
  onOpenPaywall: () => void;
  cardBgClass: string;
  cardBorderClass: string;
  textPrimaryClass: string;
  textSecondaryClass: string;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  entries,
  tags,
  onSelectEntry,
  onOpenNewEntry,
  isPremium,
  onOpenPaywall,
  cardBgClass,
  cardBorderClass,
  textPrimaryClass,
  textSecondaryClass,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<MoodLevel | null>(null);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);

  const filteredEntries = entries.filter((e) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = e.title?.toLowerCase().includes(q);
      const bodyMatch = e.body.toLowerCase().includes(q);
      if (!titleMatch && !bodyMatch) return false;
    }

    if (selectedMoodFilter !== null && e.mood !== selectedMoodFilter) {
      return false;
    }

    if (selectedTagFilter !== null && !e.tagIds?.includes(selectedTagFilter)) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-4 pb-6">
      {/* Title & New Entry Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-serif font-semibold tracking-tight ${textPrimaryClass}`}>
            Journal History
          </h2>
          <p className={`text-xs ${textSecondaryClass}`}>
            {entries.length} {entries.length === 1 ? 'reflection' : 'reflections'} recorded
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenNewEntry}
          className="p-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white transition-all cursor-pointer shadow-xs"
          aria-label="Write new entry"
          title="Write entry"
        >
          <PenLine className="w-4 h-4" />
        </button>
      </div>

      {/* Clean Minimal Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-zinc-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search thoughts, memories, words..."
          className={`w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200/80 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 text-xs sm:text-sm placeholder:text-stone-400 dark:placeholder:text-zinc-500 focus:outline-hidden focus:ring-1 focus:ring-amber-600 ${textPrimaryClass}`}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Mood Filter Bar (Clean Segmented) */}
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar text-xs">
        <button
          type="button"
          onClick={() => setSelectedMoodFilter(null)}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer font-medium ${
            selectedMoodFilter === null
              ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-xs'
              : 'text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 bg-black/[0.02] dark:bg-white/[0.02]'
          }`}
        >
          All
        </button>

        {([5, 4, 3, 2, 1] as MoodLevel[]).map((level) => {
          const meta = MOOD_DEFINITIONS[level];
          const isSelected = selectedMoodFilter === level;

          return (
            <button
              key={level}
              type="button"
              onClick={() => setSelectedMoodFilter(isSelected ? null : level)}
              className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 font-medium ${
                isSelected
                  ? 'bg-white dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 shadow-xs ring-1 ring-black/10 dark:ring-white/10'
                  : 'text-stone-500 dark:text-zinc-400 hover:text-stone-900 bg-black/[0.02] dark:bg-white/[0.02]'
              }`}
            >
              <span className="text-sm">{meta.emoji}</span>
              <span>{meta.label}</span>
            </button>
          );
        })}
      </div>

      {/* Activity Filter Chips */}
      {tags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
          {tags.map((tag) => {
            const isSelected = selectedTagFilter === tag.id;
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => setSelectedTagFilter(isSelected ? null : tag.id)}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer font-medium ${
                  isSelected
                    ? 'bg-amber-700 text-white'
                    : 'text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-200 border border-stone-200/60 dark:border-zinc-800'
                }`}
              >
                #{tag.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Entries List or Empty State */}
      {filteredEntries.length === 0 ? (
        <div className={`rounded-2xl p-8 border text-center space-y-2.5 ${cardBgClass} ${cardBorderClass}`}>
          <BookOpen className="w-6 h-6 text-stone-400 mx-auto stroke-[1.5]" />
          <h3 className={`text-base font-serif font-medium ${textPrimaryClass}`}>
            {entries.length === 0 ? 'Your journal is quiet' : 'No reflections match your search'}
          </h3>
          <p className={`text-xs max-w-xs mx-auto ${textSecondaryClass}`}>
            {entries.length === 0
              ? 'Begin by writing your first reflection today. Everything stays private on this device.'
              : 'Try clearing your filters or searching for different keywords.'}
          </p>
          {entries.length === 0 && (
            <button
              type="button"
              onClick={onOpenNewEntry}
              className="mt-2 px-4 py-2 rounded-xl bg-amber-700 text-white text-xs font-medium cursor-pointer"
            >
              Write First Reflection
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              tags={tags}
              onClick={() => onSelectEntry(entry)}
              cardBgClass={cardBgClass}
              cardBorderClass={cardBorderClass}
              textPrimaryClass={textPrimaryClass}
              textSecondaryClass={textSecondaryClass}
            />
          ))}
        </div>
      )}

      {/* Ad Banner for Free tier */}
      <AdBanner isPremium={isPremium} onOpenPaywall={onOpenPaywall} />
    </div>
  );
};
