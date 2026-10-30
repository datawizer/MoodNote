import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, IconButton, Txt } from '../components/ui';
import { useStore } from '../lib/store';
import { successFeedback } from '../services/haptics';
import { PLANS, PREMIUM_PERKS, PlanId, STORE_CONNECTED, purchase, restore } from '../services/purchases';

export default function PaywallScreen() {
  const { theme, settings, updateSettings } = useStore();
  const insets = useSafeAreaInsets();
  const [plan, setPlan] = useState<PlanId>('yearly');
  const [busy, setBusy] = useState<'buy' | 'restore' | null>(null);

  const complete = (ok: boolean) => {
    if (!ok) return;
    updateSettings({ isPremium: true });
    successFeedback();
    router.back();
  };

  const buy = async () => {
    setBusy('buy');
    try {
      complete(await purchase(plan));
    } finally {
      setBusy(null);
    }
  };

  const restorePurchases = async () => {
    setBusy('restore');
    try {
      const ok = await restore();
      if (!ok) Alert.alert('Nothing to restore', 'No previous supporter purchase was found for this account.');
      complete(ok);
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={[styles.close, { paddingTop: Platform.OS === 'ios' ? 12 : insets.top + 8 }]}>
        <IconButton icon="x" label="Close" onPress={() => router.back()} />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24, gap: 22 }}>
        <View style={{ alignItems: 'center', gap: 10 }}>
          <View style={[styles.badge, { backgroundColor: theme.accentSoft }]}>
            <Feather name="heart" size={28} color={theme.accent} />
          </View>
          <Txt variant="display" style={{ textAlign: 'center' }}>
            {settings.isPremium ? 'Thank you for your support' : 'Support MoodNote'}
          </Txt>
          <Txt variant="body" tone="muted" style={{ textAlign: 'center' }}>
            A private journal with no ads and no tracking, paid for by the people who use it.
          </Txt>
        </View>

        <View style={{ gap: 14 }}>
          {PREMIUM_PERKS.map((perk) => (
            <View key={perk.title} style={styles.perk}>
              <View style={[styles.perkIcon, { backgroundColor: theme.subtle }]}>
                <Feather name={perk.icon} size={16} color={theme.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt variant="label" style={{ fontSize: 14 }}>
                  {perk.title}
                </Txt>
                <Txt variant="small" tone="muted">
                  {perk.desc}
                </Txt>
              </View>
            </View>
          ))}
        </View>

        {settings.isPremium ? null : (
          <View style={{ gap: 10 }}>
            {PLANS.map((p) => {
              const selected = plan === p.id;
              return (
                <Pressable
                  key={p.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => setPlan(p.id)}
                  style={[
                    styles.plan,
                    { backgroundColor: theme.card, borderColor: selected ? theme.accent : theme.border, borderWidth: selected ? 2 : 1 },
                  ]}
                >
                  <View style={[styles.radio, { borderColor: selected ? theme.accent : theme.textFaint }]}>
                    {selected ? <View style={[styles.radioDot, { backgroundColor: theme.accent }]} /> : null}
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Txt variant="label">{p.title}</Txt>
                      {p.badge ? (
                        <View style={[styles.planBadge, { backgroundColor: theme.accent }]}>
                          <Txt variant="caption" tone="onAccent" style={{ fontSize: 10 }}>
                            {p.badge}
                          </Txt>
                        </View>
                      ) : null}
                    </View>
                    <Txt variant="small" tone="muted">
                      {p.detail}
                    </Txt>
                  </View>
                  <Txt variant="label" style={{ fontSize: 14 }}>
                    {p.price}
                  </Txt>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      {settings.isPremium ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12, borderColor: theme.border }]}>
          <Button title="Close" variant="secondary" onPress={() => router.back()} />
        </View>
      ) : (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12, borderColor: theme.border }]}>
          {!STORE_CONNECTED ? (
            <Txt variant="caption" tone="faint" style={{ textAlign: 'center' }}>
              Test mode: the store isn’t connected yet, so you won’t be charged.
            </Txt>
          ) : null}
          <Button title="Continue" icon="arrow-right" loading={busy === 'buy'} disabled={busy !== null} onPress={buy} />
          <Button title="Restore purchases" variant="ghost" size="sm" disabled={busy !== null} onPress={restorePurchases} style={{ alignSelf: 'center' }} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  close: { paddingHorizontal: 12, alignItems: 'flex-start' },
  badge: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  perk: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  perkIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  plan: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 16 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  planBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  footer: { paddingHorizontal: 20, paddingTop: 12, gap: 6, borderTopWidth: StyleSheet.hairlineWidth },
});
