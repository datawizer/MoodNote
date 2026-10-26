import React from 'react';
import { MoodLevel } from '../types/journal';
import { MOOD_DEFINITIONS } from '../utils/journalLogic';

interface MoodSelectorProps {
  selectedMood: MoodLevel | null;
  onSelectMood: (mood: MoodLevel) => void;
  size?: 'normal' | 'compact';
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onSelectMood,
  size = 'normal',
}) => {
  const levels: MoodLevel[] = [1, 2, 3, 4, 5];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-1.5 p-1 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.05]">
        {levels.map((level) => {
          const meta = MOOD_DEFINITIONS[level];
          const isSelected = selectedMood === level;

          return (
            <button
              key={level}
              type="button"
              onClick={() => onSelectMood(level)}
              aria-label={`Mood ${level} of 5: ${meta.label}`}
              className={`flex-1 flex flex-col items-center justify-center transition-colors duration-150 rounded-xl relative cursor-pointer ${
                size === 'compact' ? 'py-2 px-1' : 'py-2.5 px-1.5'
              } ${
                isSelected
                  ? 'bg-white dark:bg-zinc-800 shadow-xs font-semibold'
                  : 'hover:bg-white/50 dark:hover:bg-zinc-800/40 opacity-70 hover:opacity-100'
              }`}
            >
              <span
                className={size === 'compact' ? 'text-xl' : 'text-2xl'}
                role="img"
                aria-hidden="true"
              >
                {meta.emoji}
              </span>
              <span
                className={`mt-1 tracking-tight transition-colors ${
                  size === 'compact' ? 'text-[10px]' : 'text-[11px]'
                } ${isSelected ? 'text-stone-900 dark:text-zinc-100 font-semibold' : 'text-stone-500 dark:text-zinc-400'}`}
              >
                {meta.label}
              </span>

              {isSelected && (
                <span
                  className="absolute bottom-1 w-1 h-1 rounded-full"
                  style={{ backgroundColor: meta.color }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
