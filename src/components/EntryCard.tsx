import React from 'react';
import { Entry, Tag } from '../types/journal';
import { MOOD_DEFINITIONS, formatDateDisplay } from '../utils/journalLogic';
import { ChevronRight } from 'lucide-react';

interface EntryCardProps {
  entry: Entry;
  tags: Tag[];
  onClick: () => void;
  cardBgClass: string;
  cardBorderClass: string;
  textPrimaryClass: string;
  textSecondaryClass: string;
}

export const EntryCard: React.FC<EntryCardProps> = ({
  entry,
  tags,
  onClick,
  cardBgClass,
  cardBorderClass,
  textPrimaryClass,
  textSecondaryClass,
}) => {
  const moodInfo = MOOD_DEFINITIONS[entry.mood];
  const tagMap = new Map(tags.map((t) => [t.id, t]));

  return (
    <article
      onClick={onClick}
      className={`rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer group hover:border-stone-300 dark:hover:border-zinc-700 ${cardBgClass} ${cardBorderClass}`}
    >
      {/* Top Metadata Row: clean, unboxed text */}
      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-zinc-400 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`font-semibold ${textPrimaryClass}`}>
            {formatDateDisplay(entry.date)}
          </span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            <span role="img" aria-hidden="true" className="text-sm">
              {moodInfo.emoji}
            </span>
            <span>{moodInfo.label}</span>
          </span>
          {entry.energy && (
            <>
              <span aria-hidden="true">·</span>
              <span>⚡ {entry.energy}/5</span>
            </>
          )}
        </div>

        <ChevronRight className="w-4 h-4 text-stone-300 dark:text-zinc-600 group-hover:text-amber-700 dark:group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
      </div>

      {/* Title */}
      {entry.title && (
        <h3 className={`font-serif font-semibold text-base mb-1 line-clamp-1 ${textPrimaryClass}`}>
          {entry.title}
        </h3>
      )}

      {/* Body preview */}
      <p className={`font-serif text-sm leading-relaxed line-clamp-2 ${textSecondaryClass}`}>
        {entry.body}
      </p>

      {/* Unboxed tags row */}
      {entry.tagIds && entry.tagIds.length > 0 && (
        <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-black/[0.04] dark:border-white/[0.05] text-[11px] text-stone-400 dark:text-zinc-500 overflow-hidden">
          {entry.tagIds.map((tagId, idx) => {
            const tag = tagMap.get(tagId);
            if (!tag) return null;
            return (
              <React.Fragment key={tagId}>
                {idx > 0 && <span aria-hidden="true">·</span>}
                <span className="hover:text-stone-600 dark:hover:text-zinc-300 transition-colors">
                  #{tag.name}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </article>
  );
};
