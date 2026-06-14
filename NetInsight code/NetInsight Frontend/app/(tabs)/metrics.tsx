import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
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

import { getCachedData } from '@/utils/networkUtils';

const CHART_TYPES = [
  'signal',
  'speed',
  'latency',
  'reliability',
] as const;

const TIME_PERIODS = [
  'day',
  'week',
  'month',
  'year',
] as const;

const LOCATIONS = [
  'Molyko',
  'Mile 16',
  'Check Point',
  'Bonduma',
  'Sandpit',
  'South',
  'Bokwai',
  'Tarred Malingo',
  'Untarred Malingo',
];

const CHART_WIDTH =
  Dimensions.get('window').width - 64;

export default function MetricsScreen() {
  const { colors } = useTheme();
  const { language } = useLanguage();

  const t = translations[language];

  const [activeChart, setActiveChart] =
    useState<
      (typeof CHART_TYPES)[number]
    >('signal');

  const [activePeriod, setActivePeriod] =
    useState<
      (typeof TIME_PERIODS)[number]
    >('week');

  const [showFilters, setShowFilters] =
    useState(false);

  const [selectedLocation, setSelectedLocation] =
    useState('Molyko');

  const [dailyNetworkStats, setDailyNetworkStats] =
    useState<any[]>([]);

  useEffect(() => {
    const loadCachedData = async () => {
      try {
        const cached =
          await getCachedData();

        if (cached?.dailySummary) {
          const withLocationName =
            cached.dailySummary.map(
              (entry: any) => ({
                ...entry,
                locationName:
                  entry.locationName ||
                  'Molyko',
              })
            );

          setDailyNetworkStats(
            withLocationName
          );
        }
      } catch (error) {
        console.error(
          'Failed to load metrics:',
          error
        );
      }
    };

    loadCachedData();
  }, []);

  const chartTypeLabels = {
    signal: t.signal,
    speed: t.speed,
    latency: t.latency,
    reliability: t.reliability,
  };

  const chartData = useMemo(() => {
    const locationData =
      dailyNetworkStats.filter(
        item =>
          item.locationName ===
          selectedLocation
      );

    const rawChartData =
      generateChartData(
        locationData,
        activeChart,
        activePeriod
      );

    const raw =
      rawChartData?.datasets?.[0]?.data ||
      [];

    if (!raw.length) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }],
      };
    }

    return {
      labels: rawChartData.labels,
      datasets: [
        {
          data: raw.map(
            (value: number) =>
              Number.isFinite(value)
                ? value
                : 0
          ),
        },
      ],
    };
  }, [
    dailyNetworkStats,
    selectedLocation,
    activeChart,
    activePeriod,
  ]);

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
      edges={['top']}
    >
      <ScreenHeader
        title={t.networkMetrics}
        rightComponent={
          <FilterButton
            onPress={() =>
              setShowFilters(
                !showFilters
              )
            }
            active={showFilters}
          />
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          styles.content
        }
      >
        <ChartPeriodSelector
          periods={[...TIME_PERIODS]}
          activePeriod={activePeriod}
          onSelectPeriod={period =>
            setActivePeriod(
              period as any
            )
          }
        />

        <View
          style={styles.chartContainer}
        >
          <View
            style={
              styles.chartTypeSelector
            }
          >
            {CHART_TYPES.map(type => (
              <Text
                key={type}
                style={[
                  styles.chartTypeOption,
                  {
                    color:
                      activeChart ===
                      type
                        ? colors.primary
                        : colors.textSecondary,

                    borderBottomColor:
                      activeChart ===
                      type
                        ? colors.primary
                        : 'transparent',
                  },
                ]}
                onPress={() =>
                  setActiveChart(type)
                }
              >
                {
                  chartTypeLabels[
                    type
                  ]
                }
              </Text>
            ))}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            style={{
              marginBottom: 16,
            }}
          >
            {LOCATIONS.map(location => (
              <Text
                key={location}
                onPress={() =>
                  setSelectedLocation(
                    location
                  )
                }
                style={{
                  marginRight: 16,
                  paddingBottom: 6,
                  color:
                    selectedLocation ===
                    location
                      ? colors.primary
                      : colors.textSecondary,
                }}
              >
                {location}
              </Text>
            ))}
          </ScrollView>

          <Text
            style={[
              styles.locationTitle,
              {
                color: colors.text,
              },
            ]}
          >
            {selectedLocation}
          </Text>

          <MetricsChart
            data={chartData}
            width={CHART_WIDTH}
            height={220}
            chartType={activeChart}
          />
        </View>

        <View
          style={styles.statsSection}
        >
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.text,
              },
            ]}
          >
            {t.statistics}
          </Text>

          <MetricsTable
            metricType={activeChart}
            period={activePeriod}
          />
        </View>

        <View
          style={styles.notesSection}
        >
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.text,
              },
            ]}
          >
            {t.notes}
          </Text>

          <View
            style={[
              styles.noteCard,
              {
                backgroundColor:
                  colors.card,
              },
            ]}
          >
            <Text
              style={[
                styles.noteText,
                {
                  color: colors.text,
                },
              ]}
            >
              {t.metricsNote}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  chartContainer: {
    marginVertical: 16,
  },
  chartTypeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  chartTypeOption: {
    marginRight: 16,
    paddingBottom: 4,
    fontSize: 16,
    fontWeight: '500',
    borderBottomWidth: 2,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  notesSection: {
    marginTop: 24,
  },
  noteCard: {
    padding: 16,
    borderRadius: 8,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
  },
});