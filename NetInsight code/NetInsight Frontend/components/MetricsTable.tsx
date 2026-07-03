import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { NetworkSample } from '@/utils/networkUtils';

interface MetricsTableProps {
  metricType: string;
  period: string;
  samples: NetworkSample[];
}

// Returns the unit suffix for each metric type
const getUnit = (metricType: string): string => {
  switch (metricType) {
    case 'signal':      return ' dBm';
    case 'speed':       return ' Mbps';
    case 'latency':     return ' ms';
    case 'reliability': return ' Mbps';
    default:            return '';
  }
};

// Extracts the numeric value for the chosen metric from a sample
const getValue = (sample: NetworkSample, metricType: string): number | null => {
  switch (metricType) {
    case 'signal':      return sample.signalStrength ?? null;
    case 'speed':       return sample.downloadSpeed;
    case 'latency':     return sample.latency;
    case 'reliability': return sample.uploadSpeed;
    default:            return null;
  }
};

// Filters samples to the selected time period
const filterByPeriod = (samples: NetworkSample[], period: string): NetworkSample[] => {
  const now = Date.now();
  const cutoff: Record<string, number> = {
    day:   now - 24 * 60 * 60 * 1000,
    week:  now - 7  * 24 * 60 * 60 * 1000,
    month: now - 30 * 24 * 60 * 60 * 1000,
    year:  now - 365 * 24 * 60 * 60 * 1000,
  };
  const from = cutoff[period] ?? cutoff.week;
  return samples.filter(s => s.timestamp >= from);
};

// Computes stability as the % of readings within 1 std-dev of the mean
const computeStability = (values: number[]): string => {
  if (values.length < 2) return 'N/A';
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const withinStdDev = values.filter(v => Math.abs(v - mean) <= stdDev).length;
  return `${Math.round((withinStdDev / values.length) * 100)}%`;
};

function MetricsTableComponent({ metricType, period, samples }: MetricsTableProps) {
  const { colors } = useTheme();
  const unit = getUnit(metricType);

  const stats = useMemo(() => {
    const periodSamples = filterByPeriod(samples, period);
    const values = periodSamples
      .map(s => getValue(s, metricType))
      .filter((v): v is number => v !== null && isFinite(v));

    if (values.length === 0) {
      return { average: 'No data', peak: 'No data', low: 'No data', stability: 'No data' };
    }

    const avg   = values.reduce((a, b) => a + b, 0) / values.length;
    // For signal & latency lower is worse for "peak" (best = highest signal / lowest latency)
    const isLowerBetter = metricType === 'latency';
    const peak  = isLowerBetter ? Math.min(...values) : Math.max(...values);
    const low   = isLowerBetter ? Math.max(...values) : Math.min(...values);

    const fmt = (v: number) => `${v.toFixed(metricType === 'latency' ? 0 : 1)}${unit}`;

    return {
      average:   fmt(avg),
      peak:      fmt(peak),
      low:       fmt(low),
      stability: computeStability(values),
      sampleCount: values.length,
    };
  }, [samples, metricType, period]);

  const rows = [
    { label: 'Average',   value: stats.average,   color: colors.text    },
    { label: 'Best',      value: stats.peak,       color: colors.success },
    { label: 'Worst',     value: stats.low,        color: colors.error   },
    { label: 'Stability', value: stats.stability,  color: colors.primary },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {'sampleCount' in stats && (
        <View style={[styles.sampleRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sampleText, { color: colors.textSecondary }]}>
            Based on {(stats as any).sampleCount} real measurement{(stats as any).sampleCount !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
      {rows.map((row, index) => (
        <View key={row.label}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{row.label}</Text>
            <Text style={[styles.value, { color: row.color }]}>{row.value}</Text>
          </View>
          {index < rows.length - 1 && (
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          )}
        </View>
      ))}
    </View>
  );
}

export const MetricsTable = memo(MetricsTableComponent);

const styles = StyleSheet.create({
  container: { borderRadius: 14, overflow: 'hidden', borderWidth: 1 },
  sampleRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sampleText: { fontSize: 11, fontStyle: 'italic' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  label: { fontSize: 14 },
  value: { fontSize: 14, fontWeight: '700' },
  divider: { height: StyleSheet.hairlineWidth, width: '100%' },
});
