import Feather from '@expo/vector-icons/Feather';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { PickerField } from '../../components/PickerField';
import { SetPinDialog } from '../../components/SetPinDialog';
import { Button, Card, Dialog, Divider, Screen, SettingRow, Toggle, Txt } from '../../components/ui';
import { THEMES } from '../../constants/themes';
import * as db from '../../lib/db';
import { useStore } from '../../lib/store';
import { exportJson, exportMarkdown, exportPdf, pickBackup } from '../../services/exporter';
import { cancelReminders, requestReminderPermission, scheduleDailyReminder, sendTestReminder } from '../../services/notifications';
import { clearPin, isBiometricAvailable, setPin } from '../../services/security';
import { ThemeId } from '../../types/journal';

function SectionTitle({ children }: { children: string }) {
  return (
    <Txt variant="overline" tone="faint" style={{ marginTop: 8, marginLeft: 4 }}>
      {children}
    </Txt>
  );
}

export default function SettingsScreen() {
  const { settings, updateSettings, entries, tags, theme, reload } = useStore();
  const [pinDialog, setPinDialog] = useState<'enable' | 'change' | null>(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [info, setInfo] = useState<'privacy' | 'about' | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    isBiometricAvailable().then(setBiometricAvailable);
  }, []);

  const requirePremium = () => {
    if (settings.isPremium) return true;
    router.push('/paywall');
    return false;
  };

  const run = async (key: string, task: () => Promise<void>) => {
    setBusy(key);
    try {
      await task();
    } catch (e) {
      Alert.alert('Something went wrong', e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  const chooseTheme = (id: ThemeId) => {
    if (THEMES[id].isPremium && !settings.isPremium) {
      router.push('/paywall');
      return;
    }
    updateSettings({ theme: id });
  };

  const toggleReminder = (enabled: boolean) =>
    run('reminder', async () => {
      if (!enabled) {
        await cancelReminders();
        updateSettings({ reminderEnabled: false });
        return;
      }
      if (!(await requestReminderPermission())) {
        Alert.alert('Notifications are off', 'Allow notifications for MoodNote in your device settings to get a daily reminder.');
        return;
      }
      await scheduleDailyReminder(settings.reminderTime);
      updateSettings({ reminderEnabled: true });
    });

  const changeReminderTime = (time: string) =>
    run('reminder', async () => {
      updateSettings({ reminderTime: time });
      if (settings.reminderEnabled) await scheduleDailyReminder(time);
    });

  const toggleLock = (enabled: boolean) => {
    if (enabled) {
      setPinDialog('enable');
      return;
    }
    Alert.alert('Turn off app lock?', 'Anyone with your phone will be able to open your journal.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Turn off',
        style: 'destructive',
        onPress: () => {
          clearPin();
          updateSettings({ lockEnabled: false });
        },
      },
    ]);
  };

  const onPinSet = async (pin: string) => {
    await setPin(pin);
    if (pinDialog === 'enable') updateSettings({ lockEnabled: true });
    setPinDialog(null);
  };

  const importBackup = () =>
    run('import', async () => {
      const result = await pickBackup();
      if (result.status === 'cancelled') return;
      if (result.status === 'invalid') {
        Alert.alert('Can’t restore that file', result.error);
        return;
      }
      Alert.alert(
        'Restore backup?',
        `This replaces your ${entries.length} current ${entries.length === 1 ? 'entry' : 'entries'} with ${result.entries.length} from the backup.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Restore',
            style: 'destructive',
            onPress: () => {
              db.importBackup(result.entries, result.tags);
              reload();
              Alert.alert('Restored', `${result.entries.length} entries are back.`);
            },
          },
        ]
      );
    });

  const loadSample = () =>
    Alert.alert('Load sample data?', 'This replaces all your entries with 30 days of example reflections.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Load samples',
        style: 'destructive',
        onPress: () => {
          db.seedSampleData();
          reload();
        },
      },
    ]);

  const eraseAll = () =>
    Alert.alert('Delete all entries?', 'This can’t be undone. Export a backup first if you want to keep them.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete everything',
        style: 'destructive',
        onPress: () => {
          db.clearAllEntries();
          reload();
        },
      },
    ]);

  const noEntries = () => {
    if (entries.length > 0) return false;
    Alert.alert('Nothing to export yet', 'Write an entry first.');
    return true;
  };

  return (
    <Screen title="Settings">
      <Pressable accessibilityRole="button" onPress={() => router.push('/paywall')}>
        <Card style={[styles.supporter, { backgroundColor: theme.accentSoft, borderColor: theme.accentSoft }]}>
          <View style={[styles.supporterIcon, { backgroundColor: theme.accent }]}>
            <Feather name={settings.isPremium ? 'heart' : 'star'} size={18} color={theme.onAccent} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt variant="label">{settings.isPremium ? 'Supporter edition' : 'Become a supporter'}</Txt>
            <Txt variant="small" tone="muted">
              {settings.isPremium ? 'Thank you. Every feature is unlocked.' : 'More themes, PDF export and weekday patterns.'}
            </Txt>
          </View>
          <Feather name="chevron-right" size={18} color={theme.accent} />
        </Card>
      </Pressable>

      <SectionTitle>Appearance</SectionTitle>
      <Card style={styles.themes}>
        {(Object.keys(THEMES) as ThemeId[]).map((id) => {
          const t = THEMES[id];
          const selected = settings.theme === id;
          const locked = t.isPremium && !settings.isPremium;
          return (
            <Pressable
              key={id}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${t.name}${locked ? ', supporter theme' : ''}`}
              onPress={() => chooseTheme(id)}
              style={[styles.themeOption, { borderColor: selected ? theme.accent : theme.border }]}
            >
              <View style={[styles.swatch, { backgroundColor: t.bg, borderColor: t.border }]}>
                <View style={[styles.swatchCard, { backgroundColor: t.card }]}>
                  <View style={[styles.swatchLine, { backgroundColor: t.text }]} />
                  <View style={[styles.swatchLine, { backgroundColor: t.textFaint, width: '50%' }]} />
                </View>
                <View style={[styles.swatchAccent, { backgroundColor: t.accent }]} />
              </View>
              <View style={styles.themeLabel}>
                <Txt variant="caption" numberOfLines={1} style={{ flex: 1 }}>
                  {t.name}
                </Txt>
                {selected ? (
                  <Feather name="check" size={14} color={theme.accent} />
                ) : locked ? (
                  <Feather name="lock" size={12} color={theme.textFaint} />
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </Card>

      <SectionTitle>Reminders</SectionTitle>
      <Card style={styles.list}>
        <SettingRow
          icon="bell"
          title="Daily reminder"
          subtitle="A gentle nudge to check in"
          right={<Toggle label="Daily reminder" value={settings.reminderEnabled} onValueChange={toggleReminder} />}
        />
        {settings.reminderEnabled ? (
          <>
            <Divider />
            <SettingRow
              icon="clock"
              title="Time"
              right={<PickerField mode="time" label="Reminder time" value={settings.reminderTime} onChange={changeReminderTime} />}
            />
            <Divider />
            <SettingRow icon="send" title="Send a test reminder" subtitle="Arrives in a couple of seconds" onPress={() => run('test', sendTestReminder)} />
          </>
        ) : null}
      </Card>

      <SectionTitle>Privacy</SectionTitle>
      <Card style={styles.list}>
        <SettingRow
          icon="lock"
          title="App lock"
          subtitle="Ask for a PIN when opening MoodNote"
          right={<Toggle label="App lock" value={settings.lockEnabled} onValueChange={toggleLock} />}
        />
        {settings.lockEnabled ? (
          <>
            {biometricAvailable ? (
              <>
                <Divider />
                <SettingRow
                  icon="smile"
                  title="Unlock with Face ID or fingerprint"
                  right={
                    <Toggle
                      label="Biometric unlock"
                      value={settings.biometricUnlock}
                      onValueChange={(v) => updateSettings({ biometricUnlock: v })}
                    />
                  }
                />
              </>
            ) : null}
            <Divider />
            <SettingRow icon="key" title="Change PIN" onPress={() => setPinDialog('change')} />
          </>
        ) : null}
        <Divider />
        <SettingRow
          icon="smartphone"
          title="Haptic feedback"
          right={<Toggle label="Haptic feedback" value={settings.hapticsEnabled} onValueChange={(v) => updateSettings({ hapticsEnabled: v })} />}
        />
      </Card>

      <SectionTitle>Your data</SectionTitle>
      <Card style={styles.list}>
        <SettingRow
          icon="file-text"
          title="Export as text"
          subtitle="Markdown file you can read anywhere"
          right={busy === 'md' ? <Txt variant="caption" tone="faint">Preparing…</Txt> : undefined}
          onPress={() => !noEntries() && run('md', () => exportMarkdown(entries, tags))}
        />
        <Divider />
        <SettingRow
          icon="book"
          title="Export as PDF"
          subtitle={settings.isPremium ? 'A printable journal book' : 'Supporter feature'}
          right={busy === 'pdf' ? <Txt variant="caption" tone="faint">Preparing…</Txt> : undefined}
          onPress={() => requirePremium() && !noEntries() && run('pdf', () => exportPdf(entries, tags))}
        />
        <Divider />
        <SettingRow
          icon="download"
          title="Back up to a file"
          subtitle={settings.isPremium ? 'Full JSON backup to Files, Drive or email' : 'Supporter feature'}
          onPress={() => requirePremium() && !noEntries() && run('json', exportJson)}
        />
        <Divider />
        <SettingRow icon="upload" title="Restore from backup" subtitle="Import a MoodNote .json file" onPress={importBackup} />
      </Card>

      <Card style={styles.list}>
        <SettingRow icon="layers" title="Load sample data" subtitle="30 days of example entries" onPress={loadSample} />
        <Divider />
        <Pressable accessibilityRole="button" onPress={eraseAll} style={({ pressed }) => [styles.danger, { opacity: pressed ? 0.6 : 1 }]}>
          <Feather name="trash-2" size={16} color={theme.danger} />
          <Txt variant="label" tone="danger">
            Delete all entries
          </Txt>
        </Pressable>
      </Card>

      <View style={styles.footer}>
        <Button title="Privacy" variant="ghost" size="sm" onPress={() => setInfo('privacy')} />
        <Txt tone="faint">·</Txt>
        <Button title="About" variant="ghost" size="sm" onPress={() => setInfo('about')} />
      </View>

      {pinDialog ? <SetPinDialog onCancel={() => setPinDialog(null)} onSet={onPinSet} /> : null}

      <Dialog visible={info === 'privacy'} onClose={() => setInfo(null)} title="Your privacy">
        <View style={{ gap: 8, marginBottom: 18 }}>
          {[
            'No account or sign-in, ever.',
            'Entries are stored only on this device, in a local database.',
            'Nothing you write is sent anywhere unless you export it yourself.',
            'Your PIN is kept in the device’s secure keychain.',
          ].map((line) => (
            <View key={line} style={{ flexDirection: 'row', gap: 8 }}>
              <Feather name="check" size={15} color={theme.success} style={{ marginTop: 2 }} />
              <Txt variant="small" tone="muted" style={{ flex: 1 }}>
                {line}
              </Txt>
            </View>
          ))}
        </View>
        <Button title="Close" variant="secondary" onPress={() => setInfo(null)} />
      </Dialog>

      <Dialog visible={info === 'about'} onClose={() => setInfo(null)} title="MoodNote">
        <Txt variant="caption" tone="accent" style={{ marginBottom: 8 }}>
          Version {Constants.expoConfig?.version ?? '1.0.0'}
        </Txt>
        <Txt variant="small" tone="muted" style={{ marginBottom: 18 }}>
          A calm daily journal and mood log to help you pause, reflect and notice your patterns over time.
        </Txt>
        <Button title="Close" variant="secondary" onPress={() => setInfo(null)} />
      </Dialog>
    </Screen>
  );
}

const styles = StyleSheet.create({
  supporter: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  supporterIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  themes: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 12 },
  themeOption: { width: '31%', flexGrow: 1, borderRadius: 14, borderWidth: 1.5, padding: 6, gap: 6 },
  swatch: { height: 56, borderRadius: 9, borderWidth: StyleSheet.hairlineWidth, padding: 7, justifyContent: 'space-between' },
  swatchCard: { borderRadius: 5, padding: 5, gap: 3 },
  swatchLine: { height: 3, borderRadius: 2, width: '80%' },
  swatchAccent: { width: 18, height: 6, borderRadius: 3, alignSelf: 'flex-end' },
  themeLabel: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 2 },
  list: { paddingVertical: 4 },
  danger: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4 },
});
