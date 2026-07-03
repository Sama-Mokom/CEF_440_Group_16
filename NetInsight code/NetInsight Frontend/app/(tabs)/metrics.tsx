import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ChartPeriodSelector } from '@/components/ChartPeriodSelector';
import { MetricsChart } from '@/components/MetricsChart';
import { MetricsTable } from '@/components/MetricsTable';
import { FilterButton } from '@/components/FilterButton';
import { generateChartData } from '@/utils/metricsChartUtils';
import { getCachedData, NetworkSample } from '@/utils/networkUtils';

const CHART_TYPES = ['signal', 'speed', 'latency', 'reliability'] as const;
const TIME_PERIODS = ['day', 'week', 'month', 'year'] as const;
const CHART_WIDTH = Dimensions.get('window').width - 48;

export default function MetricsScreen() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const t = translations[language];

  const [activeChart, setActiveChart] = useState<(typeof CHART_TYPES)[number]>('signal');
  const [activePeriod, setActivePeriod] = useState<(typeof TIME_PERIODS)[number]>('day');
  const [showFilters, setShowFilters] = useState(false);
  const [allSamples, setAllSamples] = useState<NetworkSample[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const cached = await getCachedData();
      if (cached?.dailySummary?.length) {
        setAllSamples(cached.dailySummary);
      }
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  }, []);

  // Load on mount, then refresh every 10 seconds in sync with dashboard
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const chartTypeLabels = {
    signal:      t.signal,
    speed:       t.speed,
    latency:     t.latency,
    reliability: t.reliability,
  };

  // Build chart data from real samples — no location filter needed since
  // GPS coordinates are captured automatically from device
  const chartData = useMemo(() => {
    if (!allSamples.length) {
      return { labels: ['No Data'], datasets: [{ data: [0] }] };
    }

    const rawChartData = generateChartData(allSamples, activeChart, activePeriod);
    const raw = rawChartData?.datasets?.[0]?.data || [];

    if (!raw.length) {
      return { labels: ['No Data'], datasets: [{ data: [0] }] };
    }

    return {
      labels: rawChartData.labels,
      datasets: [{
        data: raw.map((value: number) => Number.isFinite(value) ? value : 0),
      }],
    };
  }, [allSamples, activeChart, activePeriod]);

  const sampleCountLabel = useMemo(() => {
    const now = Date.now();
    const cutoffs: Record<string, number> = {
      day:   now - 24 * 60 * 60 * 1000,
      week:  now - 7 * 24 * 60 * 60 * 1000,
      month: now - 30 * 24 * 60 * 60 * 1000,
      year:  now - 365 * 24 * 60 * 60 * 1000,
    };
    const count = allSamples.filter(s => s.timestamp >= cutoffs[activePeriod]).length;
    return count > 0 ? `${count} reading${count !== 1 ? 's' : ''} collected` : 'Collecting data...';
  }, [allSamples, activePeriod]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScreenHeader
        title={t.networkMetrics}
        rightComponent={
          <FilterButton onPress={() => setShowFilters(!showFilters)} active={showFilters} />
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Period selector */}
        <ChartPeriodSelector
          periods={[...TIME_PERIODS]}
          activePeriod={activePeriod}
          onSelectPeriod={period => setActivePeriod(period as any)}
        />

        {/* Sample count badge */}
        <View style={[styles.badgeRow]}>
          <View style={[styles.badge, { backgroundColor: `${colors.primary}22`, borderColor: `${colors.primary}44` }]}>
            <View style={[styles.dot, { backgroundColor: allSamples.length > 0 ? colors.primary : colors.textSecondary }]} />
            <Text style={[styles.badgeText, { color: colors.primary }]}>{sampleCountLabel}</Text>
          </View>
        </View>

        {/* Chart type tabs */}
        <View style={styles.chartContainer}>
          <View style={styles.chartTypeSelector}>
            {CHART_TYPES.map(type => (
              <Text
                key={type}
                style={[
                  styles.chartTypeOption,
                  {
                    color: activeChart === type ? colors.primary : colors.textSecondary,
                    borderBottomColor: activeChart === type ? colors.primary : 'transparent',
                  },
                ]}
                onPress={() => setActiveChart(type)}
              >
                {chartTypeLabels[type]}
              </Text>
            ))}
          </View>

          {/* Chart */}
          <MetricsChart
            data={chartData}
            width={CHART_WIDTH}
            height={220}
            chartType={activeChart}
          />

          {allSamples.length === 0 && (
            <View style={[styles.emptyOverlay, { backgroundColor: `${colors.card}cc` }]}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No data yet</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Go to the Home tab — measurements are collected automatically every 10 seconds.
              </Text>
            </View>
          )}
        </View>

        {/* Statistics */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.statistics}</Text>
          <MetricsTable
            metricType={activeChart}
            period={activePeriod}
            samples={allSamples}
          />
        </View>

        {/* Notes */}
        <View style={styles.notesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.notes}</Text>
          <View style={[styles.noteCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.noteText, { color: colors.text }]}>{t.metricsNote}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1 },
  scrollView:        { flex: 1 },
  content:           { padding: 16, paddingBottom: 32 },
  badgeRow:          { flexDirection: 'row', marginVertical: 10 },
  badge:             { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, gap: 6 },
  dot:               { width: 7, height: 7, borderRadius: 4 },
  badgeText:         { fontSize: 12, fontWeight: '600' },
  chartContainer:    { marginVertical: 8 },
  chartTypeSelector: { flexDirection: 'row', marginBottom: 16 },
  chartTypeOption:   { marginRight: 16, paddingBottom: 4, fontSize: 15, fontWeight: '600', borderBottomWidth: 2 },
  emptyOverlay:      { position: 'absolute', top: 40, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', borderRadius: 12, padding: 24 },
  emptyTitle:        { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  emptySubtitle:     { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  statsSection:      { marginTop: 24 },
  sectionTitle:      { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  notesSection:      { marginTop: 24 },
  noteCard:          { padding: 16, borderRadius: 8 },
  noteText:          { fontSize: 14, lineHeight: 20 },
});
