import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';
import { Bell } from 'lucide-react-native';
import { router } from 'expo-router';

interface DashboardHeaderProps {
  lastRefreshed: Date;
}

export function DashboardHeader({ lastRefreshed }: DashboardHeaderProps) {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const t = translations[language];

  const formatLastUpdated = (date: Date): string => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.tabBar, borderBottomColor: colors.border }]}>
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View>
            <Text style={[styles.appName, { color: colors.text }]}>NetInsight</Text>
            <Text style={[styles.subtitle, { color: colors.primary }]}>
              {t.qoeActive}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.notificationButton, { backgroundColor: colors.card }]}
          onPress={() => router.navigate('/About/notifications')}
        >
          <Bell size={18} color={colors.text} />
          <View style={[styles.notificationBadge, { backgroundColor: colors.primary }]} />
        </TouchableOpacity>
      </View>

      {/* Last Refreshed Timestamp */}
      <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
        Last updated: {formatLastUpdated(lastRefreshed)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoImage: {
    width: 38,
    height: 38,
    borderRadius: 10,
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  notificationButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  lastUpdated: {
    fontSize: 11,
    marginTop: 6,
    paddingHorizontal: 4,
    textAlign: 'right',
  },
});