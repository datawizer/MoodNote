import Feather from '@expo/vector-icons/Feather';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../lib/store';
import { requestReminderPermission, scheduleDailyReminder } from '../services/notifications';
import { PickerField } from './PickerField';
import { Button, IconName, Toggle, Txt } from './ui';

const STEPS: { icon: IconName; overline: string; title: string; body: string }[] = [
  {
    icon: 'shield',
    overline: 'Private by design',
    title: 'Your thoughts stay on this phone',
    body: 'No account, no email, no cloud. Every entry is stored only on your device, and you can lock the app with a PIN or Face ID.',
  },
  {
    icon: 'sun',
    overline: 'Notice the patterns',
    title: 'One small check-in a day',
    body: 'Tap how you feel, add a few words if you like, and tag what you did. Over time, MoodNote shows what lifts you up.',
  },
  {
    icon: 'bell',
    overline: 'A gentle habit',
    title: 'Want a daily nudge?',
    body: 'A quiet reminder at the same time each day makes journaling easier to keep. You can change this anytime in Settings.',
  },
];

export function Onboarding() {
  const { theme, updateSettings } = useStore();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [remind, setRemind] = useState(true);
  const [time, setTime] = useState('21:00');
  const [finishing, setFinishing] = useState(false);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const finish = async () => {
    setFinishing(true);
    let reminderEnabled = false;
    if (remind) {
      try {
        reminderEnabled = await requestReminderPermission();
        if (reminderEnabled) await scheduleDailyReminder(time);
      } catch {
        reminderEnabled = false;
      }
    }
    updateSettings({ onboardingCompleted: true, reminderEnabled, reminderTime: time });
  };

  return (
    <View style={[styles.wrap, { backgroundColor: theme.bg, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.progress}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.bar, { backgroundColor: i <= step ? theme.accent : theme.border }]} />
        ))}
      </View>

      <View style={styles.body}>
        <View style={[styles.icon, { backgroundColor: theme.accentSoft }]}>
          <Feather name={current.icon} size={32} color={theme.accent} />
        </View>
        <Txt variant="overline" tone="accent">
          {current.overline}
        </Txt>
        <Txt variant="display" style={{ textAlign: 'center' }}>
          {current.title}
        </Txt>
        <Txt variant="body" tone="muted" style={{ textAlign: 'center' }}>
          {current.body}
        </Txt>

        {isLast ? (
          <View style={[styles.reminder, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.reminderRow}>
              <Txt variant="label" style={{ flex: 1 }}>
                Daily reminder
              </Txt>
              <Toggle label="Daily reminder" value={remind} onValueChange={setRemind} />
            </View>
            {remind ? (
              <View style={styles.reminderRow}>
                <Txt variant="small" tone="muted" style={{ flex: 1 }}>
                  Remind me at
                </Txt>
                <PickerField mode="time" label="Reminder time" value={time} onChange={setTime} />
              </View>
            ) : null}
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Button
          title={isLast ? 'Start journaling' : 'Continue'}
          icon={isLast ? 'check' : 'arrow-right'}
          loading={finishing}
          onPress={isLast ? finish : () => setStep(step + 1)}
        />
        {step > 0 ? <Button title="Back" variant="ghost" onPress={() => setStep(step - 1)} style={{ alignSelf: 'center' }} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 24 },
  progress: { flexDirection: 'row', gap: 6 },
  bar: { flex: 1, height: 4, borderRadius: 2 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  icon: { width: 80, height: 80, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  reminder: { alignSelf: 'stretch', borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 12, marginTop: 12 },
  reminderRow: { flexDirection: 'row', alignItems: 'center', minHeight: 36 },
  footer: { gap: 8 },
});
