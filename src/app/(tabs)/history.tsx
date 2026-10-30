import Feather from '@expo/vector-icons/Feather';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, SectionList, StyleSheet, TextInput, View } from 'react-native';
import { EntryCard } from '../../components/EntryCard';
import { Button, Card, Chip, IconButton, Screen, Txt } from '../../components/ui';
import { FONTS } from '../../constants/themes';
import { MOOD_DEFINITIONS, getTodayDateString, parseDate } from '../../lib/journalLogic';
import { openEntry } from '../../lib/navigation';
import { useStore } from '../../lib/store';
import { Entry, MoodLevel } from '../../types/journal';

export default function HistoryScreen() {
  const { entries, tags, theme } = useStore();
  const [query, setQuery] = useState('');
  const [mood, setMood] = useState<MoodLevel | null>(null);
  const [tagId, setTagId] = useState<string | null>(null);

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = entries.filter((e) => {
      if (q && !e.title.toLowerCase().includes(q) && !e.body.toLowerCase().includes(q)) return false;
      if (mood !== null && e.mood !== mood) return false;
      if (tagId !== null && !e.tagIds.includes(tagId)) return false;
      return true;
    });
    const groups = new Map<string, Entry[]>();
    for (const e of filtered) {
      const key = parseDate(e.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      groups.set(key, [...(groups.get(key) ?? []), e]);
    }
    return Array.from(groups, ([title, data]) => ({ title, data }));
  }, [entries, query, mood, tagId]);

  const usedTags = useMemo(() => {
    const used = new Set(entries.flatMap((e) => e.tagIds));
    return tags.filter((t) => used.has(t.id));
  }, [entries, tags]);

  const filtersActive = !!query.trim() || mood !== null || tagId !== null;

  const header = (
    <View style={{ gap: 12, paddingBottom: 4 }}>
      <View style={[styles.search, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Feather name="search" size={16} color={theme.textFaint} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search your entries"
          placeholderTextColor={theme.textFaint}
          style={[styles.searchInput, { color: theme.text }]}
          returnKeyType="search"
          clearButtonMode="while-editing"
          accessibilityLabel="Search entries"
        />
        {query ? (
          <Pressable accessibilityLabel="Clear search" onPress={() => setQuery('')} hitSlop={10}>
            <Feather name="x" size={16} color={theme.textFaint} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label="All moods" selected={mood === null} onPress={() => setMood(null)} />
        {([5, 4, 3, 2, 1] as MoodLevel[]).map((level) => (
          <Chip
            key={level}
            label={`${MOOD_DEFINITIONS[level].emoji} ${MOOD_DEFINITIONS[level].label}`}
            selected={mood === level}
            onPress={() => setMood(mood === level ? null : level)}
          />
        ))}
      </ScrollView>

      {usedTags.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {usedTags.map((tag) => (
            <Chip
              key={tag.id}
              label={tag.name}
              selected={tagId === tag.id}
              onPress={() => setTagId(tagId === tag.id ? null : tag.id)}
              leading={<View style={[styles.dot, { backgroundColor: tag.color }]} />}
            />
          ))}
        </ScrollView>
      ) : null}
    </View>
  );

  return (
    <Screen
      scroll={false}
      title="Journal"
      subtitle={`${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`}
      right={<IconButton icon="edit-3" label="New entry for today" filled onPress={() => openEntry({ date: getTodayDateString() })} />}
    >
      <SectionList
        sections={sections}
        keyExtractor={(e) => e.id}
        ListHeaderComponent={header}
        stickySectionHeadersEnabled={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 }}
        renderSectionHeader={({ section }) => (
          <Txt variant="overline" tone="faint" style={{ marginTop: 16, marginBottom: 8 }}>
            {section.title}
          </Txt>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => <EntryCard entry={item} tags={tags} onPress={() => openEntry({ date: item.date })} />}
        ListEmptyComponent={
          <Card style={styles.empty}>
            <Feather name={filtersActive ? 'search' : 'book-open'} size={26} color={theme.textFaint} />
            <Txt variant="heading">{filtersActive ? 'Nothing matches' : 'Your journal is quiet'}</Txt>
            <Txt variant="small" tone="muted" style={{ textAlign: 'center' }}>
              {filtersActive
                ? 'Try a different word or clear the filters.'
                : 'Write your first entry today. Everything stays private on this device.'}
            </Txt>
            {filtersActive ? (
              <Button
                title="Clear filters"
                variant="secondary"
                size="sm"
                onPress={() => {
                  setQuery('');
                  setMood(null);
                  setTagId(null);
                }}
              />
            ) : (
              <Button title="Write first entry" size="sm" onPress={() => openEntry({ date: getTodayDateString() })} />
            )}
          </Card>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    minHeight: 46,
  },
  searchInput: { flex: 1, fontFamily: FONTS.sans, fontSize: 15, paddingVertical: 10 },
  chips: { gap: 8 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 32, marginTop: 8 },
});
