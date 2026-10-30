import Feather from '@expo/vector-icons/Feather';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, BackHandler, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MoodSelector } from '../components/MoodSelector';
import { PickerField } from '../components/PickerField';
import { Button, Chip, Divider, IconButton, Txt } from '../components/ui';
import { FONTS } from '../constants/themes';
import * as db from '../lib/db';
import { countWords, formatDateDisplay, getTodayDateString, newId } from '../lib/journalLogic';
import { useStore } from '../lib/store';
import { successFeedback } from '../services/haptics';
import { EnergyLevel, Entry, MoodLevel } from '../types/journal';

interface FormState {
  date: string;
  title: string;
  body: string;
  mood: MoodLevel;
  energy?: EnergyLevel;
  prompt?: string;
  tagIds: string[];
}

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function EntryScreen() {
  const params = useLocalSearchParams<{ date?: string; mood?: string; prompt?: string }>();
  const { entries, tags, theme, saveEntry, deleteEntry, addTag } = useStore();
  const insets = useSafeAreaInsets();

  const initialDate = single(params.date) ?? getTodayDateString();
  const paramMood = Number(single(params.mood));
  const paramPrompt = single(params.prompt);

  // Resolve the entry once; later store updates must not reset the form.
  const [existing] = useState<Entry | undefined>(() => entries.find((e) => e.date === initialDate));
  const [initial] = useState<FormState>(() => {
    if (existing) {
      return {
        date: existing.date,
        title: existing.title,
        body: existing.body,
        mood: existing.mood,
        energy: existing.energy,
        prompt: paramPrompt ?? existing.prompt,
        tagIds: existing.tagIds,
      };
    }
    const draft = db.getDraft();
    if (draft && draft.date === initialDate) return { ...draft, prompt: paramPrompt };
    return {
      date: initialDate,
      title: '',
      body: '',
      mood: paramMood >= 1 && paramMood <= 5 ? (paramMood as MoodLevel) : 3,
      energy: undefined,
      prompt: paramPrompt,
      tagIds: [],
    };
  });
  const [form, setForm] = useState<FormState>(initial);
  const [newTag, setNewTag] = useState<string | null>(null);
  const bodyRef = useRef<React.ComponentRef<typeof TextInput>>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));
  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initial), [form, initial]);
  const restoredDraft = !existing && db.getDraft()?.date === initialDate && !dirty;

  // Autosave new entries as a draft so nothing is lost if the app is closed.
  useEffect(() => {
    if (existing || !dirty) return;
    const t = setTimeout(() => {
      if (form.title.trim() || form.body.trim() || form.tagIds.length) {
        db.saveDraft({ date: form.date, title: form.title, body: form.body, mood: form.mood, energy: form.energy, tagIds: form.tagIds });
      }
    }, 600);
    return () => clearTimeout(t);
  }, [form, dirty, existing]);

  const close = () => {
    if (existing && dirty) {
      Alert.alert('Discard changes?', 'Your edits to this entry won’t be saved.', [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() },
      ]);
      return true;
    }
    router.back();
    return true;
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', close);
    return () => sub.remove();
  });

  const persist = () => {
    const stamp = new Date().toISOString();
    saveEntry({
      id: existing?.id ?? newId('entry'),
      date: form.date,
      title: form.title.trim(),
      body: form.body.trim(),
      mood: form.mood,
      energy: form.energy,
      prompt: form.prompt,
      tagIds: form.tagIds,
      createdAt: existing?.createdAt ?? stamp,
      updatedAt: stamp,
    });
    db.saveDraft(null);
    successFeedback();
    router.back();
  };

  const save = () => {
    const clash = entries.find((e) => e.date === form.date && e.id !== existing?.id);
    if (clash) {
      Alert.alert(
        `${formatDateDisplay(form.date)} already has an entry`,
        'Each day holds one entry. Saving will replace the one already there.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Replace', style: 'destructive', onPress: persist },
        ]
      );
      return;
    }
    persist();
  };

  const remove = () => {
    if (!existing) return;
    Alert.alert('Delete this entry?', 'This can’t be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteEntry(existing.id);
          router.back();
        },
      },
    ]);
  };

  const toggleTag = (id: string) =>
    set('tagIds', form.tagIds.includes(id) ? form.tagIds.filter((t) => t !== id) : [...form.tagIds, id]);

  const createTag = () => {
    const name = newTag?.trim();
    if (name) {
      const tag = addTag(name);
      if (!form.tagIds.includes(tag.id)) set('tagIds', [...form.tagIds, tag.id]);
    }
    setNewTag(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Stack.Screen options={{ gestureEnabled: !(existing && dirty) }} />
      <View style={[styles.topBar, { paddingTop: Platform.OS === 'ios' ? 12 : insets.top + 8, borderColor: theme.border }]}>
        <IconButton icon="x" label="Close" onPress={close} />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Txt variant="label">{existing ? 'Edit entry' : 'New entry'}</Txt>
          {restoredDraft ? (
            <Txt variant="caption" tone="faint">
              Draft restored
            </Txt>
          ) : null}
        </View>
        {existing ? <IconButton icon="trash-2" label="Delete entry" tone="danger" onPress={remove} /> : <View style={{ width: 40 }} />}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <View style={styles.rowBetween}>
            <Txt variant="label">{formatDateDisplay(form.date)}</Txt>
            <PickerField mode="date" label="Entry date" value={form.date} onChange={(d) => set('date', d)} maximumDate={new Date()} />
          </View>

          <MoodSelector value={form.mood} onChange={(m) => set('mood', m)} compact />

          <View style={{ gap: 8 }}>
            <Txt variant="caption" tone="muted">
              Energy {form.energy ? `· ${form.energy}/5` : '· optional'}
            </Txt>
            <View style={styles.energy}>
              {([1, 2, 3, 4, 5] as EnergyLevel[]).map((level) => {
                const active = form.energy !== undefined && level <= form.energy;
                return (
                  <Pressable
                    key={level}
                    accessibilityRole="button"
                    accessibilityLabel={`Energy ${level} of 5`}
                    accessibilityState={{ selected: form.energy === level }}
                    onPress={() => set('energy', form.energy === level ? undefined : level)}
                    style={[styles.energyStep, { backgroundColor: active ? theme.accent : theme.subtle }]}
                  >
                    <Feather name="zap" size={14} color={active ? theme.onAccent : theme.textFaint} />
                  </Pressable>
                );
              })}
            </View>
          </View>

          {form.prompt ? (
            <View style={[styles.prompt, { backgroundColor: theme.accentSoft }]}>
              <Txt variant="quote" style={{ flex: 1, fontSize: 16, lineHeight: 24 }}>
                {form.prompt}
              </Txt>
              <IconButton icon="x" label="Remove prompt" onPress={() => set('prompt', undefined)} />
            </View>
          ) : null}

          <View style={{ gap: 4 }}>
            <TextInput
              value={form.title}
              onChangeText={(v) => set('title', v)}
              placeholder="Title (optional)"
              placeholderTextColor={theme.textFaint}
              style={[styles.title, { color: theme.text }]}
              returnKeyType="next"
              onSubmitEditing={() => bodyRef.current?.focus()}
              submitBehavior="submit"
              accessibilityLabel="Title"
            />
            <Divider />
            <TextInput
              ref={bodyRef}
              value={form.body}
              onChangeText={(v) => set('body', v)}
              placeholder={form.prompt ? 'Write whatever comes to mind…' : 'What’s on your mind today?'}
              placeholderTextColor={theme.textFaint}
              style={[styles.body, { color: theme.text }]}
              multiline
              textAlignVertical="top"
              scrollEnabled={false}
              accessibilityLabel="Entry text"
            />
            <Txt variant="caption" tone="faint" style={{ textAlign: 'right' }}>
              {countWords(form.body)} words
            </Txt>
          </View>

          <View style={{ gap: 10 }}>
            <Txt variant="caption" tone="muted">
              What were you up to?
            </Txt>
            <View style={styles.tags}>
              {tags.map((tag) => (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  selected={form.tagIds.includes(tag.id)}
                  onPress={() => toggleTag(tag.id)}
                  leading={<View style={[styles.dot, { backgroundColor: tag.color }]} />}
                />
              ))}
              {newTag === null ? (
                <Chip label="New" onPress={() => setNewTag('')} leading={<Feather name="plus" size={13} color={theme.textMuted} />} />
              ) : (
                <TextInput
                  autoFocus
                  value={newTag}
                  onChangeText={setNewTag}
                  onSubmitEditing={createTag}
                  onBlur={createTag}
                  placeholder="Activity name"
                  placeholderTextColor={theme.textFaint}
                  returnKeyType="done"
                  maxLength={24}
                  style={[styles.tagInput, { color: theme.text, borderColor: theme.accent }]}
                  accessibilityLabel="New activity name"
                />
              )}
            </View>
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 12, borderColor: theme.border, backgroundColor: theme.bg }]}>
          <Button title={existing ? 'Save changes' : 'Save entry'} icon="check" onPress={save} disabled={!!existing && !dirty} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  energy: { flexDirection: 'row', gap: 8 },
  energyStep: { flex: 1, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  prompt: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 16, paddingLeft: 16, paddingVertical: 8, paddingRight: 4 },
  title: { fontFamily: FONTS.serifSemiBold, fontSize: 22, paddingVertical: 8 },
  body: { fontFamily: FONTS.serif, fontSize: 17, lineHeight: 27, minHeight: 200, paddingTop: 10 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  tagInput: { minHeight: 34, minWidth: 130, borderRadius: 17, borderWidth: 1.5, paddingHorizontal: 12, fontFamily: FONTS.sansMedium, fontSize: 12 },
  footer: { paddingHorizontal: 20, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
});
