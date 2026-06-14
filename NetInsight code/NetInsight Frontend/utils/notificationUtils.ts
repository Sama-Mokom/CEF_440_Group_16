import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getItem, setItem, removeItem } from '@/utils/storage';

// ── Storage keys ────────────────────────────────────────────────────────────
export const NOTIF_ENABLED_KEY = 'feedbackReminderEnabled';
export const NOTIF_INTERVAL_KEY = 'feedbackReminderInterval';
export const NOTIF_ID_KEY = 'feedbackReminderNotifId';

// ── Available intervals (minutes) ──────────────────────────────────────────
export const INTERVALS = [
  { labelKey: 'interval30min', minutes: 30 },
  { labelKey: 'interval1h',    minutes: 60 },
  { labelKey: 'interval2h',    minutes: 120 },
  { labelKey: 'interval3h',    minutes: 180 },
  { labelKey: 'interval6h',    minutes: 360 },
  { labelKey: 'interval12h',   minutes: 720 },
  { labelKey: 'interval24h',   minutes: 1440 },
] as const;

export type IntervalMinutes = (typeof INTERVALS)[number]['minutes'];

// ── Default behaviour: show alerts even when app is foregrounded ─────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowList: true,
  }),
});

// ── Request permission ───────────────────────────────────────────────────────
export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: false, allowSound: true },
  });
  return status === 'granted';
}

// ── Cancel any existing scheduled reminder ───────────────────────────────────
export async function cancelFeedbackReminder(): Promise<void> {
  const id = await getItem(NOTIF_ID_KEY);
  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
    await removeItem(NOTIF_ID_KEY);
  }
  // Also cancel all just in case there are orphans
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// ── Schedule a repeating feedback reminder ───────────────────────────────────
export async function scheduleFeedbackReminder(
  intervalMinutes: IntervalMinutes,
  title: string,
  body: string,
): Promise<string | null> {
  try {
    await cancelFeedbackReminder();

    const seconds = intervalMinutes * 60;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { screen: 'feedback' },
        // Android channel
        ...(Platform.OS === 'android' && { channelId: 'feedback-reminders' }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        repeats: true,
      },
    });

    await setItem(NOTIF_ID_KEY, id);
    return id;
  } catch (err) {
    console.error('scheduleFeedbackReminder error:', err);
    return null;
  }
}

// ── Set up Android notification channel (must run before scheduling) ─────────
export async function setupAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('feedback-reminders', {
    name: 'Feedback Reminders',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#0F3460',
    sound: 'default',
  });
}

// ── Load saved settings from AsyncStorage ────────────────────────────────────
export async function loadReminderSettings(): Promise<{
  enabled: boolean;
  intervalMinutes: IntervalMinutes;
}> {
  const [enabledRaw, intervalRaw] = await Promise.all([
    getItem(NOTIF_ENABLED_KEY),
    getItem(NOTIF_INTERVAL_KEY),
  ]);

  const enabled = enabledRaw === 'true';
  const parsed = parseInt(intervalRaw ?? '', 10);
  const validInterval = INTERVALS.find((i) => i.minutes === parsed);
  const intervalMinutes: IntervalMinutes = validInterval ? validInterval.minutes : 60;

  return { enabled, intervalMinutes };
}

// ── Persist settings ─────────────────────────────────────────────────────────
export async function saveReminderSettings(
  enabled: boolean,
  intervalMinutes: IntervalMinutes,
): Promise<void> {
  await Promise.all([
    setItem(NOTIF_ENABLED_KEY, String(enabled)),
    setItem(NOTIF_INTERVAL_KEY, String(intervalMinutes)),
  ]);
}
