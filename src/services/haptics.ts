import * as Haptics from 'expo-haptics';
import { getSettings } from '../lib/db';

export function tapFeedback() {
  if (getSettings().hapticsEnabled) {
    Haptics.selectionAsync().catch(() => {});
  }
}

export function successFeedback() {
  if (getSettings().hapticsEnabled) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }
}
