import React, { useState } from 'react';
import { Entry } from '../types/journal';
import { MOOD_DEFINITIONS, getTodayDateString } from '../utils/journalLogic';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarGridProps {
  entries: Entry[];
  onSelectDate: (dateStr: string, existingEntry?: Entry) => void;
  cardBgClass: string;
  cardBorderClass: string;
  textPrimaryClass: string;
  textSecondaryClass: string;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  entries,
  onSelectDate,
  cardBgClass,
  cardBorderClass,
  textPrimaryClass,
  textSecondaryClass,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const entryMap = new Map<string, Entry>();
  entries.forEach((e) => entryMap.set(e.date, e));

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const todayStr = getTodayDateString();

  const calendarDays = [];

  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevMonthTotalDays - i,
      isCurrentMonth: false,
      dateStr: '',
    });
  }

  for (let day = 1; day <= totalDays; day++) {
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${mStr}-${dStr}`;
    calendarDays.push({
      day,
      isCurrentMonth: true,
      dateStr,
      entry: entryMap.get(dateStr),
    });
  }

  const remaining = (7 - (calendarDays.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      dateStr: '',
    });
  }

  return (
    <div className={`rounded-2xl p-5 border transition-all ${cardBgClass} ${cardBorderClass}`}>
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className={`text-base font-serif font-semibold tracking-tight ${textPrimaryClass}`}>
            {monthName} {year}
          </h2>
          <p className={`text-xs ${textSecondaryClass}`}>
            Tap any day to view or record a reflection
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-stone-500"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-stone-500"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {daysOfWeek.map((d, idx) => (
          <div key={idx} className="text-[11px] font-medium text-stone-400 dark:text-zinc-500 py-0.5">
            {d}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((item, idx) => {
          if (!item.isCurrentMonth) {
            return (
              <div
                key={`pad-${idx}`}
                className="aspect-square flex items-center justify-center text-xs text-stone-300 dark:text-zinc-700 select-none opacity-30"
              >
                {item.day}
              </div>
            );
          }

          const entry = item.entry;
          const isToday = item.dateStr === todayStr;
          const moodMeta = entry ? MOOD_DEFINITIONS[entry.mood] : null;

          return (
            <button
              key={item.dateStr}
              type="button"
              onClick={() => onSelectDate(item.dateStr, entry)}
              aria-label={`${item.dateStr}: ${entry ? `Mood ${entry.mood} of 5` : 'No entry'}`}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center p-0.5 relative transition-all duration-150 cursor-pointer ${
                isToday
                  ? 'ring-1 ring-amber-600 font-bold bg-amber-500/[0.08]'
                  : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
              }`}
            >
              <span
                className={`text-xs ${
                  entry
                    ? 'font-medium text-stone-900 dark:text-zinc-100'
                    : 'text-stone-500 dark:text-zinc-400'
                } ${isToday ? 'text-amber-700 dark:text-amber-400 font-bold' : ''}`}
              >
                {item.day}
              </span>

              {entry ? (
                <span
                  className="w-1.5 h-1.5 rounded-full mt-1"
                  style={{ backgroundColor: moodMeta?.color }}
                  title={`${moodMeta?.emoji} ${moodMeta?.label}`}
                />
              ) : (
                <span className="w-1 h-1 rounded-full bg-stone-200 dark:bg-zinc-800 mt-1 opacity-40" />
              )}
            </button>
          );
        })}
      </div>

      {/* Subtle Legend */}
      <div className="mt-4 pt-3 border-t border-black/[0.04] dark:border-white/[0.05] flex items-center justify-between text-[11px] text-stone-400 dark:text-zinc-500">
        <span>Mood levels:</span>
        <div className="flex items-center gap-2.5">
          {([1, 2, 3, 4, 5] as const).map((m) => {
            const meta = MOOD_DEFINITIONS[m];
            return (
              <span key={m} className="flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
                <span>{meta.label}</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
