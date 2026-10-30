import React, { useState } from 'react';
import { View } from 'react-native';
import { PIN_LENGTH, PinDots, PinPad } from './PinPad';
import { Button, Dialog, Txt } from './ui';

/** Mount only while open so each opening starts from a clean state. */
export function SetPinDialog({
  onCancel,
  onSet,
}: {
  onCancel: () => void;
  onSet: (pin: string) => void;
}) {
  const [first, setFirst] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [mismatch, setMismatch] = useState(false);

  const onDigit = (digit: string) => {
    if (pin.length >= PIN_LENGTH) return;
    const next = pin + digit;
    setPin(next);
    if (next.length < PIN_LENGTH) return;
    setTimeout(() => {
      if (first === null) {
        setFirst(next);
        setPin('');
        setMismatch(false);
      } else if (next === first) {
        onSet(next);
      } else {
        setFirst(null);
        setPin('');
        setMismatch(true);
      }
    }, 150);
  };

  return (
    <Dialog visible onClose={onCancel} title={first === null ? 'Choose a 4-digit PIN' : 'Enter it again'}>
      <Txt variant="small" tone={mismatch ? 'danger' : 'muted'} style={{ marginBottom: 20 }}>
        {mismatch
          ? 'Those didn’t match. Start again.'
          : first === null
            ? 'You’ll use this to open MoodNote when Face ID or fingerprint isn’t available.'
            : 'Confirm your new PIN.'}
      </Txt>
      <View style={{ alignItems: 'center', gap: 24 }}>
        <PinDots length={pin.length} />
        <PinPad onDigit={onDigit} onBackspace={() => setPin((p) => p.slice(0, -1))} />
        <Button title="Cancel" variant="ghost" onPress={onCancel} />
      </View>
    </Dialog>
  );
}
