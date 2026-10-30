import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, IconButton, Screen, Txt } from '../../components/ui';
import { FONTS } from '../../constants/themes';
import { MOOD_DEFINITIONS, MOOD_LEVELS, getTodayDateString } from '../../lib/journalLogic';
import { openEntry } from '../../lib/navigation';
import { useStore } from '../../lib/store';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function CalendarScreen() {
  const { entries, theme } = useStore();
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const { year, month } = cursor;
  const today = getTodayDateString(now);
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  const shift = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
  };

  const byDate = new Map(entries.map((e) => [e.date, e]));
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthEntries = entries.filter((e) => e.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`));
  const avg = monthEntries.length ? monthEntries.reduce((s, e) => s + e.mood, 0) / monthEntries.length : null;
  const avgMeta = avg ? MOOD_DEFINITIONS[Math.round(avg) as 1 | 2 | 3 | 4 | 5] : null;
  const monthLabel = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Screen title="Calendar" subtitle="Tap a day to view or add an entry">
      <Card>
        <View style={styles.monthBar}>
          <IconButton icon="chevron-left" label="Previous month" onPress={() => shift(-1)} />
          <Txt variant="heading" style={{ flex: 1, textAlign: 'center' }}>
            {monthLabel}
          </Txt>
          <IconButton icon="chevron-right" label="Next month" onPress={() => !isCurrentMonth && shift(1)} tone={isCurrentMonth ? 'faint' : 'muted'} />
        </View>

        <View style={styles.grid}>
          {WEEKDAYS.map((d, i) => (
            <View key={`h${i}`} style={styles.cell}>
              <Txt variant="caption" tone="faint">
                {d}
              </Txt>
            </View>
          ))}
          {cells.map((date, i) => {
            if (!date) return <View key={`p${i}`} style={styles.cell} />;
            const entry = byDate.get(date);
            const meta = entry ? MOOD_DEFINITIONS[entry.mood] : null;
            const isToday = date === today;
            const isFuture = date > today;
            return (
              <View key={date} style={styles.cell}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${date}: ${meta ? meta.label : isFuture ? 'future day' : 'no entry'}`}
                  disabled={isFuture}
                  onPress={() => openEntry({ date })}
                  style={({ pressed }) => [
                    styles.day,
                    {
                      backgroundColor: meta ? meta.color + (theme.dark ? '40' : '2e') : 'transparent',
                      borderColor: isToday ? theme.accent : 'transparent',
                      opacity: isFuture ? 0.3 : pressed ? 0.6 : 1,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontFamily: entry || isToday ? FONTS.sansBold : FONTS.sansMedium,
                      fontSize: 14,
                      color: isToday ? theme.accent : entry ? theme.text : theme.textMuted,
                    }}
                  >
                    {Number(date.slice(8))}
                  </Text>
                  {meta ? <View style={[styles.moodDot, { backgroundColor: meta.color }]} /> : null}
                </Pressable>
              </View>
            );
          })}
        </View>
      </Card>

      <View style={styles.stats}>
        <Card style={styles.stat}>
          <Txt variant="overline" tone="faint">
            Entries
          </Txt>
          <Txt variant="title">{monthEntries.length}</Txt>
          <Txt variant="caption" tone="muted">
            of {isCurrentMonth ? now.getDate() : daysInMonth} days
          </Txt>
        </Card>
        <Card style={styles.stat}>
          <Txt variant="overline" tone="faint">
            Average mood
          </Txt>
          <Txt variant="title">{avg ? avg.toFixed(1) : '—'}</Txt>
          <Txt variant="caption" tone="muted">
            {avgMeta ? `${avgMeta.emoji} ${avgMeta.label}` : 'No entries yet'}
          </Txt>
        </Card>
      </View>

      <View style={styles.legend}>
        {MOOD_LEVELS.map((m) => (
          <View key={m} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: MOOD_DEFINITIONS[m].color }]} />
            <Txt variant="caption" tone="muted">
              {MOOD_DEFINITIONS[m].label}
            </Txt>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  monthBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, padding: 2, alignItems: 'center', justifyContent: 'center' },
  day: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  moodDot: { width: 5, height: 5, borderRadius: 3 },
  stats: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, gap: 2 },
  legend: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
});
