import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FONTS } from '../constants/themes';
import { useTheme } from '../lib/store';
import { tapFeedback } from '../services/haptics';

export const PIN_LENGTH = 4;

export function PinDots({ length, error }: { length: number; error?: boolean }) {
  const theme = useTheme();
  return (
    <View style={styles.dots} accessibilityLabel={`${length} of ${PIN_LENGTH} digits entered`}>
      {Array.from({ length: PIN_LENGTH }, (_, i) => {
        const filled = i < length;
        const color = error ? theme.danger : theme.accent;
        return (
          <View
            key={i}
            style={[styles.dot, { borderColor: filled ? color : theme.textFaint, backgroundColor: filled ? color : 'transparent' }]}
          />
        );
      })}
    </View>
  );
}

export function PinPad({
  onDigit,
  onBackspace,
  onBiometric,
}: {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onBiometric?: () => void;
}) {
  const theme = useTheme();
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'bio', '0', 'back'];
  return (
    <View style={styles.pad}>
      {keys.map((key) => {
        if (key === 'bio' && !onBiometric) return <View key={key} style={styles.key} />;
        const isDigit = key !== 'bio' && key !== 'back';
        return (
          <Pressable
            key={key}
            accessibilityRole="button"
            accessibilityLabel={key === 'bio' ? 'Unlock with biometrics' : key === 'back' ? 'Delete digit' : key}
            onPress={() => {
              tapFeedback();
              if (key === 'bio') onBiometric?.();
              else if (key === 'back') onBackspace();
              else onDigit(key);
            }}
            style={({ pressed }) => [styles.key, isDigit && { backgroundColor: pressed ? theme.border : theme.subtle }]}
          >
            {key === 'bio' ? (
              <Feather name="unlock" size={24} color={theme.accent} />
            ) : key === 'back' ? (
              <Feather name="delete" size={24} color={theme.textMuted} />
            ) : (
              <Text style={[styles.digit, { color: theme.text }]}>{key}</Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', gap: 18, justifyContent: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5 },
  pad: { flexDirection: 'row', flexWrap: 'wrap', width: 276, gap: 18, justifyContent: 'center' },
  key: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  digit: { fontFamily: FONTS.sansMedium, fontSize: 26 },
});
