import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';
import { NetworkStatus } from '@/components/NetworkStatus';
import { DashboardHeader } from '@/components/DashboardHeader';
import { StatusCard } from '@/components/StatusCard';
import { MetricsSummary } from '@/components/MetricsSummary';
import { FeedbackPrompt } from '@/components/FeedbackPrompt';
import {
  getCurrentNetworkInfo,
  getCachedData,
  submitNetworkMetrics,
  getConnectionQuality,
  NetworkSample,
} from '@/utils/networkUtils';
import { router } from 'expo-router';

type StatusLevel = 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';

type NetworkStats = {
  signalStrength: string;
  signalStatus: StatusLevel;
  downloadSpeed: string;
  downloadStatus: StatusLevel;
  uploadSpeed: string;
  uploadStatus: StatusLevel;
  latency: number;
  latencyStatus: StatusLevel;
  dailySummary: NetworkSample[];
};

export default function Dashboard() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const t = translations[language];

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const updateLastRefreshed = useCallback(() => {
    setLastRefreshed(new Date());
  }, []);

  const applyStats = (stats: any) => {
    if (!stats) return;

    const hasRealSignal = stats.signalStrength !== null;

    const signalStatus = hasRealSignal
      ? classifySignalStrength(stats.signalStrength)
      : getConnectionQuality(
          stats.downloadStatus,
          stats.uploadStatus,
          stats.latencyStatus
        );

    setNetworkStats({
      signalStrength: hasRealSignal
        ? `${stats.signalStrength} dBm`
        : signalStatus !== 'unknown'
        ? signalStatus.charAt(0).toUpperCase() + signalStatus.slice(1)
        : 'N/A',

      signalStatus,
      downloadSpeed: typeof stats.downloadSpeed === 'number' ? stats.downloadSpeed.toFixed(2) : '0.00',
      uploadSpeed: typeof stats.uploadSpeed === 'number' ? stats.uploadSpeed.toFixed(2) : '0.00',
      downloadStatus: (stats.downloadStatus as StatusLevel) ?? 'unknown',
      uploadStatus: (stats.uploadStatus as StatusLevel) ?? 'unknown',
      latency: stats.latency ?? 0,
      latencyStatus: (stats.latencyStatus as StatusLevel) ?? 'unknown',
      dailySummary: stats.dailySummary || [],
    });

    updateLastRefreshed();
  };

  const loadNetworkData = async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);

      const stats = await getCurrentNetworkInfo();
      if (stats) {
        applyStats(stats);
        submitNetworkMetrics(stats).catch(console.warn);
      }
    } catch (error) {
      console.error('Failed to load network data:', error);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  // Initial load + Auto-refresh every 10 seconds
  useEffect(() => {
    const init = async () => {
      const cached = await getCachedData();
      if (cached) applyStats(cached);
      await loadNetworkData(false);
    };

    init();

    // Auto refresh every 10 seconds
    const interval = setInterval(() => {
      loadNetworkData(false);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNetworkData(false);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <DashboardHeader lastRefreshed={lastRefreshed} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <NetworkStatus />

        {loading && !networkStats && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              {t.measuringNetwork}
            </Text>
          </View>
        )}

        <View style={styles.cardsContainer}>
          <StatusCard
            title={t.signalStrength}
            value={networkStats?.signalStrength || 'N/A'}
            icon="signal"
            status={networkStats?.signalStatus || 'unknown'}
          />
          <StatusCard
            title={t.downloadSpeed}
            value={networkStats?.downloadSpeed || 'N/A'}
            unit="Mbps"
            icon="download"
            status={networkStats?.downloadStatus || 'unknown'}
          />
        </View>

        <View style={styles.cardsContainer}>
          <StatusCard
            title={t.uploadSpeed}
            value={networkStats?.uploadSpeed || 'N/A'}
            unit="Mbps"
            icon="upload"
            status={networkStats?.uploadStatus || 'unknown'}
          />
          <StatusCard
            title={t.latency}
            value={networkStats?.latency || 'N/A'}
            unit="ms"
            icon="clock"
            status={networkStats?.latencyStatus || 'unknown'}
            lowerIsBetter
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t.todayOverview}
        </Text>

        <MetricsSummary dailySummary={undefined} />

        <View style={styles.ctaRow}>
          <TouchableOpacity
            style={[styles.ctaButton, styles.ctaPrimary, { backgroundColor: colors.primary }]}
            onPress={() => router.navigate('/(tabs)/feedback')}
          >
            <Text style={styles.ctaPrimaryText}>{t.rateExperience}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ctaButton, styles.ctaSecondary, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={() => router.navigate('/(tabs)/metrics')}
          >
            <Text style={[styles.ctaSecondaryText, { color: colors.text }]}>{t.fullMetrics}</Text>
          </TouchableOpacity>
        </View>

        <FeedbackPrompt />
      </ScrollView>
    </SafeAreaView>
  );
};

const classifySignalStrength = (strength: number | null): StatusLevel => {
  if (strength === null) return 'unknown';
  if (strength >= -70) return 'excellent';
  if (strength >= -85) return 'good';
  if (strength >= -100) return 'fair';
  return 'poor';
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 32 },
  cardsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  loadingContainer: { alignItems: 'center', paddingVertical: 16, gap: 8 },
  loadingText: { fontSize: 13 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginTop: 4, marginBottom: 12 },
  ctaRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  ctaButton: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  ctaPrimary: {},
  ctaSecondary: { borderWidth: 1 },
  ctaPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  ctaSecondaryText: { fontWeight: '700', fontSize: 14 },
});