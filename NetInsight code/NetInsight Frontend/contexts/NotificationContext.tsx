import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import {
  INTERVALS,
  IntervalMinutes,
  requestNotificationPermission,
  scheduleFeedbackReminder,
  cancelFeedbackReminder,
  saveReminderSettings,
  loadReminderSettings,
  setupAndroidChannel,
} from '@/utils/notificationUtils';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';

interface NotificationContextType {
  reminderEnabled: boolean;
  intervalMinutes: IntervalMinutes;
  isLoaded: boolean;
  setReminderEnabled: (enabled: boolean) => Promise<void>;
  setIntervalMinutes: (minutes: IntervalMinutes) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  reminderEnabled: false,
  intervalMinutes: 60,
  isLoaded: false,
  setReminderEnabled: async () => {},
  setIntervalMinutes: async () => {},
});

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { language } = useLanguage();
  const t = translations[language];

  const [reminderEnabled, setReminderEnabledState] = useState(false);
  const [intervalMinutes, setIntervalMinutesState] = useState<IntervalMinutes>(60);
  const [isLoaded, setIsLoaded] = useState(false);

  // Keep a ref to the notification response listener so we can remove it
  const responseListenerRef = useRef<Notifications.EventSubscription | null>(null);

  // ── Bootstrap: load saved settings & set up Android channel ────────────────
  useEffect(() => {
    (async () => {
      await setupAndroidChannel();
      const settings = await loadReminderSettings();
      setReminderEnabledState(settings.enabled);
      setIntervalMinutesState(settings.intervalMinutes);
      setIsLoaded(true);
    })();
  }, []);

  // ── Re-schedule whenever interval changes (while enabled) ──────────────────
  useEffect(() => {
    if (!isLoaded) return;
    if (reminderEnabled) {
      scheduleFeedbackReminder(intervalMinutes, t.notifTitle, t.notifBody);
    }
  }, [intervalMinutes, isLoaded]);

  // ── Deep-link: tapping the notification opens the Feedback tab ─────────────
  useEffect(() => {
    responseListenerRef.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as any;
        if (data?.screen === 'feedback') {
          // Small delay ensures router is ready
          setTimeout(() => router.navigate('/(tabs)/feedback'), 300);
        }
      },
    );
    return () => {
      responseListenerRef.current?.remove();
    };
  }, []);

  // ── Enable / disable ────────────────────────────────────────────────────────
  const setReminderEnabled = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert(t.permissionDenied, t.permissionDeniedMsg);
        return;
      }
      await scheduleFeedbackReminder(intervalMinutes, t.notifTitle, t.notifBody);
    } else {
      await cancelFeedbackReminder();
    }

    setReminderEnabledState(enabled);
    await saveReminderSettings(enabled, intervalMinutes);
  };

  // ── Change interval ─────────────────────────────────────────────────────────
  const setIntervalMinutes = async (minutes: IntervalMinutes) => {
    setIntervalMinutesState(minutes);
    await saveReminderSettings(reminderEnabled, minutes);

    if (reminderEnabled) {
      await scheduleFeedbackReminder(minutes, t.notifTitle, t.notifBody);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        reminderEnabled,
        intervalMinutes,
        isLoaded,
        setReminderEnabled,
        setIntervalMinutes,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
