import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, Screen, Segmented, Txt } from '../../components/ui';
import {
  MOOD_DEFINITIONS,
  addDays,
  calculateMoodDistribution,
  calculateStreaks,
  calculateTagCorrelations,
  calculateWeekdayMood,
  findBestWeekday,
  getTodayDateString,
  parseDate,
} from '../../lib/journalLogic';
import { useStore } from '../../lib/store';
import { MoodLevel } from '../../types/journal';

const CHART_HEIGHT = 120;

function moodForAverage(avg: number) {
  return MOOD_DEFINITIONS[Math.min(5, Math.max(1, Math.round(avg))) as MoodLevel];
}

export default function InsightsScreen() {
  const { entries, tags, theme, settings } = useStore();
  const [range, setRange] = useState<'7' | '30'>('7');
  const [selected, setSelected] = useState<string | null>(null);

  const today = getTodayDateString();
  const streaks = calculateStreaks(entries, today);
  const byDate = new Map(entries.map((e) => [e.date, e]));
  const days = Number(range);
  const trend = Array.from({ length: days }, (_, i) => {
    const date = addDays(today, i - (days - 1));
    return { date, mood: byDate.get(date)?.mood ?? null };
  });
  const logged = trend.filter((d) => d.mood !== null);
  const average = logged.length ? logged.reduce((s, d) => s + (d.mood ?? 0), 0) / logged.length : null;
  const distribution = calculateMoodDistribution(entries);
  const activities = calculateTagCorrelations(entries, tags).slice(0, 6);
  const weekdays = calculateWeekdayMood(entries);
  const bestDay = findBestWeekday(entries);
  const selectedPoint = trend.find((d) => d.date === selected);

  if (entries.length === 0) {
    return (
      <Screen title="Insights">
        <Card style={styles.empty}>
          <Feather name="bar-chart-2" size={26} color={theme.textFaint} />
          <Txt variant="heading">Patterns appear over time</Txt>
          <Txt variant="small" tone="muted" style={{ textAlign: 'center' }}>
            Log your mood for a few days and your trends, streaks and the activities that lift you will show up here.
          </Txt>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen title="Insights">
      <View style={styles.tiles}>
        {[
          { label: 'Current streak', value: streaks.currentStreak, unit: 'days' },
          { label: 'Longest streak', value: streaks.longestStreak, unit: 'days' },
          { label: 'Entries', value: streaks.totalEntries, unit: 'total' },
        ].map((tile) => (
          <Card key={tile.label} style={styles.tile}>
            <Txt variant="caption" tone="muted" numberOfLines={1}>
              {tile.label}
            </Txt>
            <Txt variant="display" style={{ fontSize: 28, lineHeight: 34 }}>
              {tile.value}
            </Txt>
            <Txt variant="caption" tone="faint">
              {tile.unit}
            </Txt>
          </Card>
        ))}
      </View>

      <Card style={{ gap: 14 }}>
        <View style={styles.cardHead}>
          <View style={{ flex: 1 }}>
            <Txt variant="caption" tone="muted">
              Mood trend · average
            </Txt>
            <Txt variant="title">
              {average ? average.toFixed(1) : '—'}
              <Txt variant="small" tone="faint">
                {' '}
                / 5
              </Txt>
            </Txt>
          </View>
          <Segmented
            options={[
              { value: '7', label: '7 days' },
              { value: '30', label: '30 days' },
            ]}
            value={range}
            onChange={(v) => {
              setRange(v);
              setSelected(null);
            }}
          />
        </View>

        <Txt variant="small" tone={selectedPoint ? 'default' : 'faint'} style={{ minHeight: 18 }}>
          {selectedPoint
            ? `${parseDate(selectedPoint.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · ${
                selectedPoint.mood ? `${MOOD_DEFINITIONS[selectedPoint.mood].emoji} ${MOOD_DEFINITIONS[selectedPoint.mood].label}` : 'No entry'
              }`
            : 'Tap a bar for details'}
        </Txt>

        <View>
          <View style={[styles.gridLine, { top: CHART_HEIGHT * 0.4, backgroundColor: theme.border }]} />
          <View style={[styles.chart, { height: CHART_HEIGHT, gap: days === 7 ? 10 : 2 }]}>
            {trend.map((d) => {
              const isSelected = d.date === selected;
              const color = d.mood ? MOOD_DEFINITIONS[d.mood].color : theme.subtle;
              return (
                <Pressable
                  key={d.date}
                  accessibilityRole="button"
                  accessibilityLabel={`${d.date}: ${d.mood ? MOOD_DEFINITIONS[d.mood].label : 'no entry'}`}
                  onPress={() => setSelected(isSelected ? null : d.date)}
                  style={styles.barSlot}
                >
                  <View
                    style={{
                      height: d.mood ? (d.mood / 5) * CHART_HEIGHT : 4,
                      backgroundColor: color,
                      borderTopLeftRadius: 4,
                      borderTopRightRadius: 4,
                      opacity: selected && !isSelected ? 0.35 : 1,
                    }}
                  />
                </Pressable>
              );
            })}
          </View>
          <Divider />
          <View style={[styles.axis, { gap: days === 7 ? 10 : 2 }]}>
            {trend.map((d, i) => (
              <Txt key={d.date} variant="caption" tone="faint" style={styles.axisLabel}>
                {days === 7
                  ? parseDate(d.date).toLocaleDateString('en-US', { weekday: 'narrow' })
                  : i % 5 === 4 || i === days - 1
                    ? Number(d.date.slice(8))
                    : ''}
              </Txt>
            ))}
          </View>
        </View>
      </Card>

      <Card style={{ gap: 12 }}>
        <Txt variant="overline" tone="faint">
          Mood distribution
        </Txt>
        {distribution.map((item) => (
          <View key={item.mood} style={{ gap: 6 }}>
            <View style={styles.cardHead}>
              <Txt variant="small" style={{ flex: 1 }}>
                {item.emoji} {item.label}
              </Txt>
              <Txt variant="caption" tone="muted">
                {item.count} · {item.percentage}%
              </Txt>
            </View>
            <View style={[styles.track, { backgroundColor: theme.subtle }]}>
              {item.percentage > 0 ? (
                <View style={[styles.fill, { width: `${item.percentage}%`, backgroundColor: item.color }]} />
              ) : null}
            </View>
          </View>
        ))}
      </Card>

      <Card style={{ gap: 4 }}>
        <View style={[styles.cardHead, { marginBottom: 6 }]}>
          <Txt variant="overline" tone="faint" style={{ flex: 1 }}>
            Activities and mood
          </Txt>
        </View>
        {activities.length === 0 ? (
          <Txt variant="small" tone="muted">
            Add activities to your entries to see which ones go with your best days.
          </Txt>
        ) : (
          activities.map((tag, i) => {
            const meta = moodForAverage(tag.averageMood);
            return (
              <View key={tag.tagId}>
                {i > 0 ? <Divider /> : null}
                <View style={styles.activity}>
                  <View style={[styles.tagDot, { backgroundColor: tag.color }]} />
                  <Txt variant="label" style={{ flex: 1, fontSize: 14 }}>
                    {tag.name}
                  </Txt>
                  <Txt variant="caption" tone="muted">
                    {meta.emoji} {tag.averageMood.toFixed(1)} avg · {tag.count}×
                  </Txt>
                </View>
              </View>
            );
          })
        )}
      </Card>

      <Card style={{ gap: 12 }}>
        <View style={styles.cardHead}>
          <Txt variant="overline" tone="accent" style={{ flex: 1 }}>
            Weekday patterns
          </Txt>
          {!settings.isPremium ? (
            <Txt variant="caption" tone="faint">
              Supporter
            </Txt>
          ) : null}
        </View>
        {settings.isPremium ? (
          <>
            <View style={[styles.chart, { height: 80, gap: 10 }]}>
              {weekdays.map((d) => (
                <View key={d.dayIndex} style={styles.barSlot} accessibilityLabel={`${d.dayName}: ${d.count ? d.averageMood : 'no data'}`}>
                  <View
                    style={{
                      height: d.count ? (d.averageMood / 5) * 80 : 4,
                      backgroundColor: d.count ? moodForAverage(d.averageMood).color : theme.subtle,
                      borderTopLeftRadius: 4,
                      borderTopRightRadius: 4,
                    }}
                  />
                </View>
              ))}
            </View>
            <Divider />
            <View style={[styles.axis, { gap: 10 }]}>
              {weekdays.map((d) => (
                <View key={d.dayIndex} style={styles.axisLabel}>
                  <Txt variant="caption" tone="faint" style={{ textAlign: 'center' }}>
                    {d.dayName}
                  </Txt>
                  <Txt variant="caption" style={{ textAlign: 'center' }}>
                    {d.count ? d.averageMood.toFixed(1) : '—'}
                  </Txt>
                </View>
              ))}
            </View>
            <Txt variant="small" tone="muted">
              {bestDay
                ? `${bestDay.dayName}s tend to be your best days, averaging ${bestDay.averageMood.toFixed(1)}.${
                    activities[0] ? ` ${activities[0].name} is your most logged activity.` : ''
                  }`
                : 'Keep journaling. A pattern shows up after a couple of weeks.'}
            </Txt>
          </>
        ) : (
          <>
            <Txt variant="small" tone="muted">
              See how your mood shifts across the week and which days tend to feel best.
            </Txt>
            <Button title="Unlock weekday patterns" variant="secondary" size="sm" onPress={() => router.push('/paywall')} style={{ alignSelf: 'flex-start' }} />
          </>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', gap: 8, paddingVertical: 32 },
  tiles: { flexDirection: 'row', gap: 10 },
  tile: { flex: 1, padding: 14, gap: 2 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chart: { flexDirection: 'row', alignItems: 'flex-end' },
  barSlot: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  gridLine: { position: 'absolute', left: 0, right: 0, height: StyleSheet.hairlineWidth },
  axis: { flexDirection: 'row', marginTop: 6 },
  axisLabel: { flex: 1, textAlign: 'center' },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  activity: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 },
  tagDot: { width: 8, height: 8, borderRadius: 4 },
});
