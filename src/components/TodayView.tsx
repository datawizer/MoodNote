import React from 'react';
import { Entry, MoodLevel, Tag } from '../types/journal';
import { MoodSelector } from './MoodSelector';
import { DailyPromptCard } from './DailyPromptCard';
import { EntryCard } from './EntryCard';
import { getPromptForDay } from '../constants/prompts';
import { getTodayDateString } from '../utils/journalLogic';
import { PenLine, Check } from 'lucide-react';

interface TodayViewProps {
  todayEntry?: Entry;
  onOpenEditor: (initialMood?: MoodLevel, prompt?: string) => void;
  onSelectMood: (mood: MoodLevel) => void;
  tags: Tag[];
  cardBgClass: string;
  cardBorderClass: string;
  textPrimaryClass: string;
  textSecondaryClass: string;
}

export const TodayView: React.FC<TodayViewProps> = ({
  todayEntry,
  onOpenEditor,
  onSelectMood,
  tags,
  cardBgClass,
  cardBorderClass,
  textPrimaryClass,
  textSecondaryClass,
}) => {
  const now = new Date();
  const hours = now.getHours();
  const greeting =
    hours < 12 ? 'Good morning' : hours < 17 ? 'Good afternoon' : 'Good evening';

  const todayStr = getTodayDateString(now);
  const prompt = getPromptForDay(todayStr);

  const formattedFullDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-4 pb-6">
      {/* Serene Greeting */}
      <div className="pt-1">
        <h2 className={`text-2xl sm:text-3xl font-serif font-semibold tracking-tight ${textPrimaryClass}`}>
          {greeting}.
        </h2>
        <p className={`text-xs mt-1 ${textSecondaryClass}`}>
          {formattedFullDate}
        </p>
      </div>

      {/* Mood Barometer Card */}
      <div className={`rounded-2xl p-5 border transition-all ${cardBgClass} ${cardBorderClass}`}>
        <div className="flex items-center justify-between mb-3 text-xs text-stone-500 dark:text-zinc-400">
          <span className="font-medium">How is your spirit today?</span>
          {todayEntry && (
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <Check className="w-3 h-3" />
              <span>Logged</span>
            </span>
          )}
        </div>

        <MoodSelector
          selectedMood={todayEntry ? todayEntry.mood : null}
          onSelectMood={onSelectMood}
        />

        <div className="mt-4 pt-3.5 border-t border-black/[0.04] dark:border-white/[0.05]">
          <button
            type="button"
            onClick={() => onOpenEditor(todayEntry?.mood)}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>{todayEntry ? "Edit Today's Journal Entry" : "Write Today's Reflection"}</span>
          </button>
        </div>
      </div>

      {/* Daily Reflection Prompt */}
      <DailyPromptCard
        prompt={prompt}
        onUsePrompt={(promptText) => onOpenEditor(todayEntry?.mood, promptText)}
        cardBgClass={cardBgClass}
        cardBorderClass={cardBorderClass}
        textPrimaryClass={textPrimaryClass}
        textSecondaryClass={textSecondaryClass}
      />

      {/* Today's Saved Entry Preview */}
      {todayEntry && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs text-stone-400 dark:text-zinc-500">
            <span className="uppercase tracking-wider text-[10px] font-semibold">
              Today&apos;s Entry
            </span>
            <button
              type="button"
              onClick={() => onOpenEditor(todayEntry.mood)}
              className="hover:underline text-amber-700 dark:text-amber-500 font-medium cursor-pointer"
            >
              Edit
            </button>
          </div>
          <EntryCard
            entry={todayEntry}
            tags={tags}
            onClick={() => onOpenEditor(todayEntry.mood)}
            cardBgClass={cardBgClass}
            cardBorderClass={cardBorderClass}
            textPrimaryClass={textPrimaryClass}
            textSecondaryClass={textSecondaryClass}
          />
        </div>
      )}

      {/* Quiet Reflection Thought */}
      <p className="text-center text-xs text-stone-400 dark:text-zinc-500 font-serif italic pt-3 px-4 leading-relaxed">
        &ldquo;Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.&rdquo;
      </p>
    </div>
  );
};
