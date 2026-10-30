import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MOOD_DEFINITIONS, formatDateDisplay } from '../lib/journalLogic';
import { useTheme } from '../lib/store';
import { Entry, Tag } from '../types/journal';
import { Txt } from './ui';

export function EntryCard({ entry, tags, onPress }: { entry: Entry; tags: Tag[]; onPress: () => void }) {
  const theme = useTheme();
  const mood = MOOD_DEFINITIONS[entry.mood];
  const tagMap = new Map(tags.map((t) => [t.id, t]));
  const entryTags = entry.tagIds.map((id) => tagMap.get(id)).filter((t): t is Tag => !!t);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${formatDateDisplay(entry.date)}, mood ${mood.label}${entry.title ? `, ${entry.title}` : ''}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View style={[styles.moodRail, { backgroundColor: mood.color }]} />
      <View style={styles.content}>
        <View style={styles.meta}>
          <Txt variant="caption" tone="muted" style={{ flex: 1 }}>
            {formatDateDisplay(entry.date)} · {mood.emoji} {mood.label}
            {entry.energy ? ` · ⚡ ${entry.energy}/5` : ''}
          </Txt>
          <Feather name="chevron-right" size={16} color={theme.textFaint} />
        </View>
        {entry.title ? (
          <Txt variant="heading" numberOfLines={1}>
            {entry.title}
          </Txt>
        ) : null}
        {entry.body ? (
          <Txt variant="serif" tone="muted" numberOfLines={entry.title ? 2 : 3} style={{ fontSize: 15, lineHeight: 23 }}>
            {entry.body}
          </Txt>
        ) : (
          <Txt variant="small" tone="faint">
            Mood logged, no words yet.
          </Txt>
        )}
        {entryTags.length > 0 ? (
          <View style={styles.tags}>
            {entryTags.map((tag) => (
              <View key={tag.id} style={styles.tag}>
                <View style={[styles.dot, { backgroundColor: tag.color }]} />
                <Txt variant="caption" tone="faint">
                  {tag.name}
                </Txt>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  moodRail: { width: 4 },
  content: { flex: 1, padding: 16, gap: 6 },
  meta: { flexDirection: 'row', alignItems: 'center' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
