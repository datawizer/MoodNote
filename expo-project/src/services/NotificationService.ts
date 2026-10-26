import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export class NotificationService {
  public static async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  }

  public static async scheduleDailyReminder(hour: number, minute: number): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'MoodNote',
        body: 'How are you feeling this evening? Take a quiet moment to record your thoughts.',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  }

  public static async cancelReminders(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}
