import React from 'react';
import { DailyPrompt } from '../types/journal';
import { ArrowRight } from 'lucide-react';

interface DailyPromptCardProps {
  prompt: DailyPrompt;
  onUsePrompt: (promptText: string) => void;
  cardBgClass: string;
  cardBorderClass: string;
  textPrimaryClass: string;
  textSecondaryClass: string;
}

export const DailyPromptCard: React.FC<DailyPromptCardProps> = ({
  prompt,
  onUsePrompt,
  cardBgClass,
  cardBorderClass,
  textPrimaryClass,
  textSecondaryClass,
}) => {
  return (
    <div
      className={`rounded-2xl p-5 border transition-all ${cardBgClass} ${cardBorderClass}`}
    >
      <div className="flex items-center justify-between mb-2.5 text-xs text-stone-400 dark:text-zinc-500 font-medium">
        <span className="tracking-wider uppercase text-[10px] text-amber-700 dark:text-amber-500 font-semibold">
          Daily Prompt
        </span>
        <span className="capitalize">{prompt.category}</span>
      </div>

      <p className={`font-serif italic text-base sm:text-lg leading-relaxed mb-3 ${textPrimaryClass}`}>
        &ldquo;{prompt.prompt}&rdquo;
      </p>

      <button
        type="button"
        onClick={() => onUsePrompt(prompt.prompt)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-500 hover:underline transition-all cursor-pointer group"
        aria-label="Reflect on this daily prompt"
      >
        <span>Reflect on this</span>
        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
};
