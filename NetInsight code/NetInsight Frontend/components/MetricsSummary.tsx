import React, { memo, useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';
import { LineChart } from 'react-native-chart-kit';
import { NetworkSample, getCurrentNetworkInfo } from '@/utils/networkUtils';

interface MetricsSummaryProps {
  dailySummary?: NetworkSample[]; // optional - will fetch internally if not provided
}

const CHART_WIDTH = Dimensions.get('window').width - 48;
const REFRESH_INTERVAL = 10000; // 10 seconds

function MetricsSummaryComponent({ dailySummary: propDailySummary }: MetricsSummaryProps) {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const t = translations[language];

  const [dailySummary, setDailySummary] = useState<NetworkSample[]>(propDailySummary || []);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Auto-refresh every 10 seconds
  useEffect(() => {
    // If parent passes real data, use it (but still allow internal refresh)
    if (propDailySummary && propDailySummary.length > 0) {
      setDailySummary(propDailySummary);
      setLastUpdated(new Date());
    }

    const fetchData = async () => {
      try {
        const networkData = await getCurrentNetworkInfo();
        setDailySummary(networkData.dailySummary || []);
        setLastUpdated(new Date());
      } catch (error) {
        console.warn('Failed to refresh network metrics:', error);
      }
    };

    // Initial fetch
    fetchData();

    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchData, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [propDailySummary]);

  // Re-process data when samples change
  const processedData = useMemo(() => {
    const today = new Date().toDateString();

    const todaySamples = dailySummary.filter(
      (sample) => new Date(sample.timestamp).toDateString() === today
    );

    const source = todaySamples.length > 0 ? todaySamples : dailySummary;

    if (source.length === 0) {
      return {
        stats: { avgDownloadSpeed: 0, avgUploadSpeed: 0, avgLatency: 0, sampleCount: 0 },
        recentSamples: [],
      };
    }

    const avg = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length;

    return {
      stats: {
        avgDownloadSpeed: Number(avg(source.map((s) => s.downloadSpeed)).toFixed(2)),
        avgUploadSpeed: Number(avg(source.map((s) => s.uploadSpeed)).toFixed(2)),
        avgLatency: Number(avg(source.map((s) => s.latency)).toFixed(0)),
        sampleCount: source.length,
      },
      recentSamples: source.slice(-6),
    };
  }, [dailySummary]);

  const stats = processedData.stats;
  const recentSamples = processedData.recentSamples;

  const formatNumber = (value: number): string => {
    if (!value || isNaN(value)) return '--';
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(2) + 'M';
    if (value >= 1_000) return (value / 1_000).toFixed(2) + 'K';
    return value.toFixed(2);
  };

  const hasData = recentSamples.length > 0;

  const chartData = useMemo(
    () => ({
      labels: hasData ? recentSamples.map((_, i) => `${i + 1}`) : [''],
      datasets: [
        {
          data: hasData ? recentSamples.map((s) => s.downloadSpeed || 0) : [0],
          color: () => colors.primary,
          strokeWidth: 2,
        },
        {
          data: hasData ? recentSamples.map((s) => s.uploadSpeed || 0) : [0],
          color: () => colors.success ?? '#22c55e',
          strokeWidth: 2,
        },
      ],
      legend: [t.avgDownload, t.avgUpload],
    }),
    [recentSamples, colors, t, hasData]
  );

  const chartConfig = useMemo(
    () => ({
      backgroundColor: 'transparent',
      backgroundGradientFrom: colors.card,
      backgroundGradientTo: colors.card,
      decimalPlaces: 1,
      color: (opacity = 1) =>
        `${colors.primary}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
      labelColor: () => colors.textSecondary,
      propsForDots: { r: '4', strokeWidth: '2', stroke: colors.primary },
      propsForLabels: { fontSize: 10 },
      propsForBackgroundLines: { stroke: colors.border, strokeDasharray: '4,4' },
    }),
    [colors]
  );

  const formatLastUpdated = (date: Date): string => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>
          {t.avgDownload} / {t.avgUpload}
        </Text>

        <View style={[styles.badge, { backgroundColor: `${colors.primary}22` }]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>
            {stats.sampleCount} {stats.sampleCount === 1 ? 'sample' : 'samples'} today
          </Text>
        </View>
      </View>

      {/* Last Updated Timestamp */}
      <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
        Last updated: {formatLastUpdated(lastUpdated)}
      </Text>

      <View style={styles.chartContainer}>
        {hasData ? (
          <LineChart
            data={chartData}
            width={CHART_WIDTH}
            height={160}
            bezier
            chartConfig={chartConfig}
            style={styles.chart}
            withInnerLines
            withOuterLines={false}
            withLegend
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={[styles.noDataText, { color: colors.textSecondary }]}>
              Measuring network...
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.statsContainer, { borderTopColor: colors.border }]}>
        {[
          {
            label: t.avgDownload,
            value: `${formatNumber(stats.avgDownloadSpeed)} Mbps`,
            color: colors.primary,
          },
          {
            label: t.avgUpload,
            value: `${formatNumber(stats.avgUploadSpeed)} Mbps`,
            color: colors.success ?? '#22c55e',
          },
          {
            label: t.avgLatency,
            value: `${formatNumber(stats.avgLatency)} ms`,
            color: colors.warning ?? '#f59e0b',
          },
        ].map((item, index) => (
          <View key={index} style={styles.statItem}>
            <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export const MetricsSummary = memo(MetricsSummaryComponent);

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  lastUpdated: {
    fontSize: 11,
    textAlign: 'right',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  chartTitle: { fontSize: 13, fontWeight: '600' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  chartContainer: { alignItems: 'center' },
  chart: { marginVertical: 4, borderRadius: 12 },
  noDataContainer: { height: 160, alignItems: 'center', justifyContent: 'center' },
  noDataText: { fontSize: 14 },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  statLabel: { fontSize: 11 },
});