import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { EntryCard } from '../../components/EntryCard';
import { MoodSelector } from '../../components/MoodSelector';
import { Button, Card, IconButton, Screen, Txt } from '../../components/ui';
import { getPromptForDay } from '../../constants/prompts';
import { MOOD_DEFINITIONS, addDays, calculateStreaks, getTodayDateString, newId, parseDate } from '../../lib/journalLogic';
import { openEntry } from '../../lib/navigation';
import { useStore } from '../../lib/store';
import { successFeedback } from '../../services/haptics';
import { MoodLevel } from '../../types/journal';

function greetingFor(hour: number) {
  if (hour < 5) return 'Still up?';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function TodayScreen() {
  const { entries, tags, theme, settings, saveEntry, lock } = useStore();
  const now = new Date();
  const today = getTodayDateString(now);
  const todayEntry = entries.find((e) => e.date === today);
  const streak = calculateStreaks(entries, today).currentStreak;
  const prompt = getPromptForDay(today);
  const byDate = new Map(entries.map((e) => [e.date, e]));
  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));

  const logMood = (mood: MoodLevel) => {
    const stamp = new Date().toISOString();
    saveEntry(
      todayEntry
        ? { ...todayEntry, mood, updatedAt: stamp }
        : { id: newId('entry'), date: today, title: '', body: '', mood, tagIds: [], createdAt: stamp, updatedAt: stamp }
    );
    successFeedback();
  };

  return (
    <Screen>
      <View style={styles.topBar}>
        <View style={styles.brand}>
          <View style={[styles.brandDot, { backgroundColor: theme.accent }]} />
          <Txt variant="heading">MoodNote</Txt>
        </View>
        <View style={[styles.streak, { backgroundColor: theme.accentSoft }]} accessibilityLabel={`${streak} day streak`}>
          <Feather name="zap" size={13} color={theme.accent} />
          <Txt variant="caption" tone="accent">
            {streak} {streak === 1 ? 'day' : 'days'}
          </Txt>
        </View>
        {settings.lockEnabled ? <IconButton icon="lock" label="Lock now" onPress={lock} /> : null}
      </View>

      <View style={{ marginTop: 4 }}>
        <Txt variant="display" accessibilityRole="header">
          {greetingFor(now.getHours())}
        </Txt>
        <Txt variant="small" tone="muted">
          {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Txt>
      </View>

      <Card style={{ gap: 14 }}>
        <View style={styles.cardHead}>
          <Txt variant="label" style={{ flex: 1 }}>
            How are you feeling?
          </Txt>
          {todayEntry ? (
            <View style={styles.logged}>
              <Feather name="check" size={13} color={theme.success} />
              <Txt variant="caption" tone="success">
                Logged
              </Txt>
            </View>
          ) : null}
        </View>
        <MoodSelector value={todayEntry?.mood ?? null} onChange={logMood} />
        <Button
          title={todayEntry?.body ? 'Continue today’s entry' : todayEntry ? 'Add a few words' : 'Write about today'}
          icon="edit-3"
          onPress={() => openEntry({ date: today })}
        />
      </Card>

      <Card style={{ gap: 10 }}>
        <View style={styles.cardHead}>
          <Txt variant="overline" tone="accent" style={{ flex: 1 }}>
            Today’s prompt
          </Txt>
          <Txt variant="caption" tone="faint" style={{ textTransform: 'capitalize' }}>
            {prompt.category}
          </Txt>
        </View>
        <Txt variant="quote">{prompt.prompt}</Txt>
        <Pressable
          accessibilityRole="button"
          onPress={() => openEntry({ date: today, prompt: prompt.prompt })}
          style={({ pressed }) => [styles.link, { opacity: pressed ? 0.6 : 1 }]}
          hitSlop={8}
        >
          <Txt variant="label" tone="accent" style={{ fontSize: 14 }}>
            Reflect on this
          </Txt>
          <Feather name="arrow-right" size={15} color={theme.accent} />
        </Pressable>
      </Card>

      <Card style={{ gap: 12 }}>
        <Txt variant="overline" tone="faint">
          Last 7 days
        </Txt>
        <View style={styles.week}>
          {week.map((date) => {
            const entry = byDate.get(date);
            const meta = entry ? MOOD_DEFINITIONS[entry.mood] : null;
            const isToday = date === today;
            return (
              <Pressable
                key={date}
                accessibilityRole="button"
                accessibilityLabel={`${date}: ${meta ? meta.label : 'no entry'}`}
                onPress={() => openEntry({ date })}
                style={styles.day}
              >
                <View
                  style={[
                    styles.dayDot,
                    {
                      backgroundColor: meta ? meta.color : theme.subtle,
                      borderColor: isToday ? theme.accent : 'transparent',
                    },
                  ]}
                >
                  {meta ? null : <Feather name="plus" size={12} color={theme.textFaint} />}
                </View>
                <Txt variant="caption" tone={isToday ? 'accent' : 'faint'}>
                  {parseDate(date).toLocaleDateString('en-US', { weekday: 'narrow' })}
                </Txt>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {todayEntry && (todayEntry.body || todayEntry.title) ? (
        <View style={{ gap: 8 }}>
          <Txt variant="overline" tone="faint">
            Today’s entry
          </Txt>
          <EntryCard entry={todayEntry} tags={tags} onPress={() => openEntry({ date: today })} />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 40 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  brandDot: { width: 8, height: 8, borderRadius: 4 },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, height: 28, borderRadius: 14 },
  cardHead: { flexDirection: 'row', alignItems: 'center' },
  logged: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', minHeight: 32 },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { alignItems: 'center', gap: 6, minWidth: 36 },
  dayDot: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
