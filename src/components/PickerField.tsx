import Feather from '@expo/vector-icons/Feather';
import DateTimePicker, { DateTimePickerAndroid, DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { getTodayDateString, parseDate } from '../lib/journalLogic';
import { useTheme } from '../lib/store';
import { Txt } from './ui';

function timeToDate(time: string) {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}

function dateToTime(d: Date) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function formatTime(time: string) {
  return timeToDate(time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/** `value` is HH:mm for mode="time" and YYYY-MM-DD for mode="date". */
export function PickerField({
  mode,
  value,
  onChange,
  label,
  maximumDate,
}: {
  mode: 'date' | 'time';
  value: string;
  onChange: (value: string) => void;
  label: string;
  maximumDate?: Date;
}) {
  const theme = useTheme();
  const dateValue = mode === 'time' ? timeToDate(value) : parseDate(value);
  const handle = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type !== 'set' || !selected) return;
    onChange(mode === 'time' ? dateToTime(selected) : getTodayDateString(selected));
  };

  if (Platform.OS === 'ios') {
    return (
      <DateTimePicker
        accessibilityLabel={label}
        value={dateValue}
        mode={mode}
        display="compact"
        onChange={handle}
        maximumDate={maximumDate}
        accentColor={theme.accent}
        themeVariant={theme.dark ? 'dark' : 'light'}
      />
    );
  }

  const display =
    mode === 'time'
      ? formatTime(value)
      : dateValue.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${display}`}
      onPress={() => DateTimePickerAndroid.open({ value: dateValue, mode, onChange: handle, maximumDate })}
      style={({ pressed }) => [styles.field, { backgroundColor: theme.subtle, opacity: pressed ? 0.7 : 1 }]}
    >
      <Feather name={mode === 'time' ? 'clock' : 'calendar'} size={14} color={theme.textMuted} />
      <Txt variant="caption">{display}</Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
});
