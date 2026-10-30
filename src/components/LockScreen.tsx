import Feather from '@expo/vector-icons/Feather';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../lib/store';
import { authenticateBiometric, getPin, isBiometricAvailable } from '../services/security';
import { PIN_LENGTH, PinDots, PinPad } from './PinPad';
import { Txt } from './ui';

const MAX_ATTEMPTS = 5;
const COOLDOWN_SECONDS = 30;

export function LockScreen() {
  const { theme, settings, unlock } = useStore();
  const insets = useSafeAreaInsets();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [canUseBiometric, setCanUseBiometric] = useState(false);
  const savedPin = useRef<string | null>(null);

  const tryBiometric = useCallback(async () => {
    if (await authenticateBiometric()) unlock();
  }, [unlock]);

  useEffect(() => {
    getPin().then((value) => {
      savedPin.current = value;
      // Lock is on but no PIN was ever stored (e.g. keychain wiped): don't trap the user out.
      if (!value) unlock();
    });
    if (settings.biometricUnlock) {
      isBiometricAvailable().then((available) => {
        setCanUseBiometric(available);
        if (available) tryBiometric();
      });
    }
  }, [settings.biometricUnlock, tryBiometric, unlock]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const onDigit = (digit: string) => {
    if (cooldown > 0 || pin.length >= PIN_LENGTH) return;
    const next = pin + digit;
    setPin(next);
    if (next.length < PIN_LENGTH) return;
    if (next === savedPin.current) {
      unlock();
      return;
    }
    const failed = attempts + 1;
    setAttempts(failed);
    setError(true);
    setTimeout(() => {
      setPin('');
      setError(false);
      if (failed >= MAX_ATTEMPTS) {
        setAttempts(0);
        setCooldown(COOLDOWN_SECONDS);
      }
    }, 500);
  };

  const message =
    cooldown > 0
      ? `Too many attempts. Try again in ${cooldown}s.`
      : error
        ? 'That PIN didn’t match.'
        : 'Enter your PIN to open your journal.';

  return (
    <View style={[StyleSheet.absoluteFill, styles.wrap, { backgroundColor: theme.bg, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={[styles.badge, { backgroundColor: theme.accentSoft }]}>
        <Feather name="lock" size={26} color={theme.accent} />
      </View>
      <Txt variant="title">MoodNote is locked</Txt>
      <Txt variant="small" tone={error || cooldown > 0 ? 'danger' : 'muted'} style={styles.message}>
        {message}
      </Txt>
      <PinDots length={pin.length} error={error} />
      <View style={{ height: 36 }} />
      <PinPad
        onDigit={onDigit}
        onBackspace={() => setPin((p) => p.slice(0, -1))}
        onBiometric={canUseBiometric ? tryBiometric : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', zIndex: 100, elevation: 100 },
  badge: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  message: { marginTop: 6, marginBottom: 28, textAlign: 'center', paddingHorizontal: 32 },
});
