import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch,
  TouchableOpacity, Alert, Share, Modal, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { translations } from '@/utils/translations';
import { INTERVALS, IntervalMinutes } from '@/utils/notificationUtils';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Info, ChevronRight, RotateCcw, Bell, BellOff, Check, Clock } from 'lucide-react-native';
import { router } from 'expo-router';
import { getCachedData, CACHE_KEY } from '@/utils/networkUtils';
import { removeItem } from '@/utils/storage';

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { language } = useLanguage();
  const t = translations[language];
  const {
    reminderEnabled,
    intervalMinutes,
    setReminderEnabled,
    setIntervalMinutes,
  } = useNotifications();

  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [backgroundEnabled, setBackgroundEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [showIntervalModal, setShowIntervalModal] = useState(false);

  // ── Data management ──────────────────────────────────────────────────────
  const handleDownloadData = async () => {
    try {
      const data = await getCachedData();
      if (!data) { Alert.alert(t.noData, t.noDataFound); return; }
      await Share.share({ message: JSON.stringify(data, null, 2), title: 'My NetInsight Data' });
    } catch {
      Alert.alert(t.errorTitle, t.exportError);
    }
  };

  const handleDeleteData = async () => {
    try {
      await removeItem(CACHE_KEY);
      Alert.alert(t.dataDeleted, t.dataDeletedMsg);
    } catch {
      Alert.alert(t.errorTitle, t.deleteError);
    }
  };

  const handleManageData = () => {
    Alert.alert(t.manageDataTitle, t.manageDataMessage, [
      { text: t.download, onPress: handleDownloadData },
      { text: t.delete, style: 'destructive', onPress: handleDeleteData },
      { text: t.cancel, style: 'cancel' },
    ]);
  };

  // ── Onboarding reset ─────────────────────────────────────────────────────
  const handleResetOnboarding = () => {
    Alert.alert(t.resetOnboardingTitle, t.resetOnboardingMessage, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.reset,
        style: 'destructive',
        onPress: async () => {
          await removeItem('language');
          await removeItem('permissionsAccepted');
          Alert.alert(t.resetDone, t.resetDoneMsg);
        },
      },
    ]);
  };

  // ── Interval label helper ─────────────────────────────────────────────────
  const getIntervalLabel = (minutes: IntervalMinutes): string => {
    const match = INTERVALS.find((i) => i.minutes === minutes);
    if (!match) return '';
    return (t as any)[match.labelKey] ?? match.labelKey;
  };

  // ── Toggle reminder switch ────────────────────────────────────────────────
  const handleToggleReminder = async (value: boolean) => {
    await setReminderEnabled(value);
  };

  // ── Pick interval from modal ──────────────────────────────────────────────
  const handlePickInterval = async (minutes: IntervalMinutes) => {
    setShowIntervalModal(false);
    await setIntervalMinutes(minutes);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScreenHeader title={t.settings} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>

        {/* ── Network Monitoring ── */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.networkMonitoring}</Text>
        <View style={[styles.settingsCard, { backgroundColor: colors.card }]}>
          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLabelContainer}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>{t.backgroundTracking}</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>{t.backgroundTrackingDesc}</Text>
            </View>
            <Switch value={backgroundEnabled} onValueChange={setBackgroundEnabled} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.white} />
          </View>
          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLabelContainer}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>{t.locationServices}</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>{t.locationServicesDesc}</Text>
            </View>
            <Switch value={locationEnabled} onValueChange={setLocationEnabled} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.white} />
          </View>
          <View style={styles.batterySection}>
            <Info size={16} color={colors.info} style={styles.infoIcon} />
            <Text style={[styles.batteryInfo, { color: colors.textSecondary }]}>
              {t.batteryImpact}: {backgroundEnabled ? t.batteryMedium : t.batteryLow}
            </Text>
          </View>
        </View>

        {/* ── Feedback Reminders ── */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.feedbackReminderSection}</Text>
        <View style={[styles.settingsCard, { backgroundColor: colors.card }]}>

          {/* Enable / disable toggle */}
          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingIconLabel}>
              {reminderEnabled
                ? <Bell size={20} color={colors.primary} style={styles.rowIcon} />
                : <BellOff size={20} color={colors.textSecondary} style={styles.rowIcon} />
              }
              <View style={styles.settingLabelContainer}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>{t.feedbackReminderEnable}</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>{t.feedbackReminderEnableDesc}</Text>
              </View>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={handleToggleReminder}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          {/* Interval selector — only visible when reminders are enabled */}
          {reminderEnabled && (
            <TouchableOpacity
              style={[styles.settingRow, { borderBottomColor: colors.border }]}
              onPress={() => setShowIntervalModal(true)}
            >
              <View style={styles.settingIconLabel}>
                <Clock size={20} color={colors.primary} style={styles.rowIcon} />
                <View style={styles.settingLabelContainer}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>{t.feedbackReminderInterval}</Text>
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>{t.feedbackReminderIntervalDesc}</Text>
                </View>
              </View>
              <View style={styles.intervalBadgeRow}>
                <View style={[styles.intervalBadge, { backgroundColor: `${colors.primary}22` }]}>
                  <Text style={[styles.intervalBadgeText, { color: colors.primary }]}>
                    {getIntervalLabel(intervalMinutes)}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          )}

          {/* Info banner */}
          <View style={[styles.reminderInfoBanner, { backgroundColor: `${colors.primary}12` }]}>
            <Info size={14} color={colors.primary} />
            <Text style={[styles.reminderInfoText, { color: colors.primary }]}>
              {reminderEnabled
                ? `${t.feedbackReminderEnable}: ${getIntervalLabel(intervalMinutes)}`
                : t.feedbackReminderEnableDesc}
            </Text>
          </View>
        </View>

        {/* ── Data & Privacy ── */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.dataPrivacy}</Text>
        <View style={[styles.settingsCard, { backgroundColor: colors.card }]}>
          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLabelContainer}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>{t.dataCollection}</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>{t.dataCollectionDesc}</Text>
            </View>
            <Switch value={trackingEnabled} onValueChange={setTrackingEnabled} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.white} />
          </View>
          <TouchableOpacity style={[styles.settingRow, { borderBottomColor: colors.border }]} onPress={handleManageData}>
            <View style={styles.settingLabelContainer}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>{t.manageMyData}</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>{t.manageMyDataDesc}</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ── Preferences ── */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.preferences}</Text>
        <View style={[styles.settingsCard, { backgroundColor: colors.card }]}>
          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLabelContainer}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>{t.darkTheme}</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>{t.darkThemeDesc}</Text>
            </View>
            <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.white} />
          </View>
        </View>

        {/* ── About ── */}
        <View style={styles.aboutSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.about}</Text>
          <TouchableOpacity style={[styles.aboutButton, { backgroundColor: colors.card }]} onPress={() => router.navigate('/About/helpCenter')}>
            <Text style={[styles.aboutButtonText, { color: colors.text }]}>{t.helpCenter}</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.aboutButton, { backgroundColor: colors.card }]} onPress={() => router.navigate('/About/privacyPolicy')}>
            <Text style={[styles.aboutButtonText, { color: colors.text }]}>{t.privacyPolicy}</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.aboutButton, { backgroundColor: colors.card }]} onPress={() => router.navigate('/About/termsOfService')}>
            <Text style={[styles.aboutButtonText, { color: colors.text }]}>{t.termsOfService}</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.aboutButton, { backgroundColor: colors.card }]} onPress={handleResetOnboarding}>
            <View style={styles.settingLabelContainer}>
              <Text style={[styles.aboutButtonText, { color: colors.text }]}>{t.resetOnboarding}</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>{t.resetOnboardingDesc}</Text>
            </View>
            <RotateCcw size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>{t.version}</Text>
        </View>
      </ScrollView>

      {/* ── Interval picker modal ── */}
      <Modal
        visible={showIntervalModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowIntervalModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowIntervalModal(false)}
        >
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t.chooseInterval}</Text>
            <FlatList
              data={INTERVALS}
              keyExtractor={(item) => String(item.minutes)}
              renderItem={({ item }) => {
                const isSelected = intervalMinutes === item.minutes;
                return (
                  <TouchableOpacity
                    style={[
                      styles.intervalOption,
                      { borderBottomColor: colors.border },
                      isSelected && { backgroundColor: `${colors.primary}14` },
                    ]}
                    onPress={() => handlePickInterval(item.minutes)}
                  >
                    <Text style={[
                      styles.intervalOptionText,
                      { color: isSelected ? colors.primary : colors.text },
                    ]}>
                      {(t as any)[item.labelKey] ?? item.labelKey}
                    </Text>
                    {isSelected && <Check size={18} color={colors.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, marginTop: 24 },
  settingsCard: { borderRadius: 12, overflow: 'hidden' },
  settingRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 16, borderBottomWidth: 0.5,
  },
  settingIconLabel: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  rowIcon: { marginRight: 10 },
  settingLabelContainer: { flex: 1, marginRight: 8 },
  settingLabel: { fontSize: 16, fontWeight: '500', marginBottom: 4 },
  settingDescription: { fontSize: 13, lineHeight: 18 },
  batterySection: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  infoIcon: { marginRight: 8 },
  batteryInfo: { fontSize: 14 },
  intervalBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  intervalBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  intervalBadgeText: { fontSize: 12, fontWeight: '600' },
  reminderInfoBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, margin: 12, borderRadius: 8,
  },
  reminderInfoText: { fontSize: 12, flex: 1, lineHeight: 17 },
  aboutSection: { marginTop: 8, marginBottom: 24 },
  aboutButton: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 16, borderRadius: 12, marginBottom: 8,
  },
  aboutButtonText: { fontSize: 16, fontWeight: '500' },
  versionText: { textAlign: 'center', marginTop: 24, fontSize: 14 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  modalTitle: { fontSize: 17, fontWeight: '700', padding: 18, paddingBottom: 8 },
  intervalOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 0.5,
  },
  intervalOptionText: { fontSize: 16 },
});
