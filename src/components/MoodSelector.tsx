import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FONTS } from '../constants/themes';
import { MOOD_DEFINITIONS, MOOD_LEVELS } from '../lib/journalLogic';
import { useTheme } from '../lib/store';
import { tapFeedback } from '../services/haptics';
import { MoodLevel } from '../types/journal';

export function MoodSelector({
  value,
  onChange,
  compact,
}: {
  value: MoodLevel | null;
  onChange: (mood: MoodLevel) => void;
  compact?: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {MOOD_LEVELS.map((level) => {
        const meta = MOOD_DEFINITIONS[level];
        const selected = value === level;
        return (
          <Pressable
            key={level}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={`${meta.label}, ${level} of 5`}
            onPress={() => {
              tapFeedback();
              onChange(level);
            }}
            style={({ pressed }) => [
              styles.option,
              compact && styles.optionCompact,
              {
                backgroundColor: selected ? meta.color + (theme.dark ? '33' : '1f') : theme.subtle,
                borderColor: selected ? meta.color : 'transparent',
                transform: [{ scale: pressed ? 0.96 : 1 }],
              },
            ]}
          >
            <Text style={[styles.emoji, compact && styles.emojiCompact, { opacity: value === null || selected ? 1 : 0.55 }]}>
              {meta.emoji}
            </Text>
            <Text
              style={[
                styles.label,
                { color: selected ? theme.text : theme.textMuted, fontFamily: selected ? FONTS.sansBold : FONTS.sansMedium },
              ]}
            >
              {meta.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 4,
  },
  optionCompact: { paddingVertical: 9, borderRadius: 14 },
  emoji: { fontSize: 26 },
  emojiCompact: { fontSize: 22 },
  label: { fontSize: 11 },
});
