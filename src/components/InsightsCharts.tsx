import React, { useState } from 'react';
import { Entry, Tag } from '../types/journal';
import {
  calculateMoodDistribution,
  calculateStreaks,
  calculateTagCorrelations,
  calculateWeekdayMood,
  MOOD_DEFINITIONS,
  addDays,
  getTodayDateString,
} from '../utils/journalLogic';
import { Flame, Award, Lock, Sparkles } from 'lucide-react';

interface InsightsChartsProps {
  entries: Entry[];
  tags: Tag[];
  isPremium: boolean;
  onOpenPaywall: () => void;
  cardBgClass: string;
  cardBorderClass: string;
  textPrimaryClass: string;
  textSecondaryClass: string;
}

export const InsightsCharts: React.FC<InsightsChartsProps> = ({
  entries,
  tags,
  isPremium,
  onOpenPaywall,
  cardBgClass,
  cardBorderClass,
  textPrimaryClass,
  textSecondaryClass,
}) => {
  const [trendRange, setTrendRange] = useState<'7d' | '30d'>('7d');

  const streakStats = calculateStreaks(entries);
  const moodDistribution = calculateMoodDistribution(entries);
  const tagCorrelations = calculateTagCorrelations(entries, tags);
  const weekdayMood = calculateWeekdayMood(entries);

  const daysCount = trendRange === '7d' ? 7 : 30;
  const todayStr = getTodayDateString();
  const entryDateMap = new Map(entries.map((e) => [e.date, e]));

  const trendData = [];
  for (let i = daysCount - 1; i >= 0; i--) {
    const dStr = addDays(todayStr, -i);
    const entry = entryDateMap.get(dStr);
    const dayLabel = trendRange === '7d'
      ? new Date(dStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'narrow' })
      : dStr.slice(8);

    trendData.push({
      dateStr: dStr,
      label: dayLabel,
      mood: entry ? entry.mood : null,
    });
  }

  const recordedEntries = trendData.filter((d) => d.mood !== null);
  const averageMood =
    recordedEntries.length > 0
      ? (recordedEntries.reduce((sum, d) => sum + (d.mood || 0), 0) / recordedEntries.length).toFixed(1)
      : '—';

  return (
    <div className="space-y-4">
      {/* Streaks Header Stats */}
      <div className={`rounded-2xl p-5 border transition-all ${cardBgClass} ${cardBorderClass}`}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className={`flex items-center gap-1.5 text-xs text-stone-500 dark:text-zinc-400 mb-1`}>
              <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500/80" />
              <span>Current Streak</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl sm:text-3xl font-serif font-bold ${textPrimaryClass}`}>
                {streakStats.currentStreak}
              </span>
              <span className={`text-xs ${textSecondaryClass}`}>days</span>
            </div>
          </div>

          <div>
            <div className={`flex items-center gap-1.5 text-xs text-stone-500 dark:text-zinc-400 mb-1`}>
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Longest Streak</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl sm:text-3xl font-serif font-bold ${textPrimaryClass}`}>
                {streakStats.longestStreak}
              </span>
              <span className={`text-xs ${textSecondaryClass}`}>days</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-black/[0.04] dark:border-white/[0.05] flex items-center justify-between text-xs text-stone-400 dark:text-zinc-500">
          <span>Total journal reflections:</span>
          <span className={`font-semibold ${textPrimaryClass}`}>{entries.length}</span>
        </div>
      </div>

      {/* Mood Trend Chart */}
      <div className={`rounded-2xl p-5 border transition-all ${cardBgClass} ${cardBorderClass}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-stone-500 dark:text-zinc-400 font-medium">
              Average Mood
            </div>
            <div className={`text-xl font-serif font-bold mt-0.5 ${textPrimaryClass}`}>
              {averageMood} <span className="text-xs font-sans text-stone-400 font-normal">/ 5.0</span>
            </div>
          </div>

          {/* Segmented Filter */}
          <div className="flex p-0.5 rounded-lg bg-black/[0.04] dark:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.05] text-xs">
            <button
              type="button"
              onClick={() => setTrendRange('7d')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                trendRange === '7d'
                  ? 'bg-white dark:bg-zinc-800 shadow-xs text-stone-900 dark:text-zinc-100 font-semibold'
                  : 'text-stone-500 dark:text-zinc-400 hover:text-stone-800'
              }`}
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => setTrendRange('30d')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                trendRange === '30d'
                  ? 'bg-white dark:bg-zinc-800 shadow-xs text-stone-900 dark:text-zinc-100 font-semibold'
                  : 'text-stone-500 dark:text-zinc-400 hover:text-stone-800'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>

        {/* Minimal Bar Chart */}
        <div className="h-36 w-full flex flex-col justify-end pt-2">
          <div className="flex items-end justify-between gap-1.5 h-24 w-full">
            {trendData.map((d, idx) => {
              const heightPercent = d.mood ? (d.mood / 5) * 100 : 8;
              const meta = d.mood ? MOOD_DEFINITIONS[d.mood] : null;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  {/* Tooltip on hover */}
                  {d.mood && (
                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 text-white text-[10px] py-0.5 px-1.5 rounded-md pointer-events-none whitespace-nowrap z-10 shadow-sm">
                      {meta?.emoji} {meta?.label} ({d.dateStr})
                    </div>
                  )}

                  <div
                    className={`w-full max-w-[12px] rounded-t-sm transition-all duration-300 ${
                      d.mood ? '' : 'bg-black/[0.04] dark:bg-white/[0.05]'
                    }`}
                    style={{
                      height: `${heightPercent}%`,
                      backgroundColor: meta ? meta.color : undefined,
                    }}
                  />
                  <span className="text-[10px] mt-2 font-mono text-stone-400 dark:text-zinc-500">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-[10px] text-stone-400 dark:text-zinc-500 mt-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.05]">
            <span>Rough (1)</span>
            <span>Okay (3)</span>
            <span>Great (5)</span>
          </div>
        </div>
      </div>

      {/* Mood Distribution */}
      <div className={`rounded-2xl p-5 border transition-all ${cardBgClass} ${cardBorderClass}`}>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-zinc-500 mb-3">
          Mood Distribution
        </h3>

        <div className="space-y-2.5">
          {moodDistribution.map((item) => (
            <div key={item.mood} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-stone-700 dark:text-zinc-300 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.label}</span>
                </span>
                <span className="font-mono text-xs text-stone-400 dark:text-zinc-500">
                  {item.count} · {item.percentage}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.05] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activities & Correlations */}
      <div className={`rounded-2xl p-5 border transition-all ${cardBgClass} ${cardBorderClass}`}>
        <div className="flex items-center justify-between mb-3 text-xs text-stone-400 dark:text-zinc-500">
          <span className="font-semibold uppercase tracking-wider text-[10px]">
            Frequent Activities
          </span>
          <span>{tagCorrelations.length} tags logged</span>
        </div>

        {tagCorrelations.length === 0 ? (
          <p className="text-xs py-3 text-center text-stone-400">
            No tags logged yet. Add tags when writing to track mood correlations.
          </p>
        ) : (
          <div className="divide-y divide-black/[0.04] dark:divide-white/[0.05]">
            {tagCorrelations.slice(0, 6).map((tag) => (
              <div key={tag.tagId} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className={`font-medium ${textPrimaryClass}`}>#{tag.name}</span>
                  <span className="text-stone-400 dark:text-zinc-500 ml-2">
                    avg mood {tag.averageMood}/5
                  </span>
                </div>
                <span className="font-mono text-stone-400 dark:text-zinc-500">
                  {tag.count}x
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Advanced Insights for Premium */}
      <div className={`rounded-2xl p-5 border transition-all ${cardBgClass} ${cardBorderClass}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-500`}>
            Weekday Patterns
          </h3>
          {!isPremium && (
            <span className="text-[10px] font-medium text-amber-600">
              Supporter Feature
            </span>
          )}
        </div>

        {isPremium ? (
          <div className="space-y-3">
            <div className="grid grid-cols-7 gap-1 text-center">
              {weekdayMood.map((item) => (
                <div key={item.dayIndex} className="p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.03]">
                  <div className="text-[10px] text-stone-400 font-medium">{item.dayName}</div>
                  <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 mt-1">
                    {item.count > 0 ? item.averageMood : '—'}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-stone-500 dark:text-zinc-400 italic pt-1">
              💡 Your mood is consistently highest on weekends and morning reflections with {tagCorrelations[0]?.name || 'Exercise'}.
            </p>
          </div>
        ) : (
          <div className="py-4 text-center space-y-2">
            <p className="text-xs text-stone-500 dark:text-zinc-400 max-w-xs mx-auto">
              Understand how your mood shifts across weekdays and discover the activities that truly nourish you.
            </p>
            <button
              type="button"
              onClick={onOpenPaywall}
              className="text-xs font-medium text-amber-700 dark:text-amber-500 hover:underline cursor-pointer"
            >
              Unlock Advanced Insights →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
