import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface MetricsTableProps {
  metricType: string;
  period: string;
}

function MetricsTableComponent({
  metricType,
}: MetricsTableProps) {
  const { colors } = useTheme();

  const stats = useMemo(() => {
    switch (metricType) {
      case 'signal':
        return {
          average: '-78 dBm',
          peak: '-65 dBm',
          low: '-102 dBm',
          stability: '86%',
        };

      case 'speed':
        return {
          average: '42.5 Mbps',
          peak: '87.2 Mbps',
          low: '12.8 Mbps',
          stability: '92%',
        };

      case 'latency':
        return {
          average: '38 ms',
          peak: '12 ms',
          low: '97 ms',
          stability: '89%',
        };

      case 'reliability':
        return {
          average: '94%',
          peak: '99%',
          low: '78%',
          stability: '95%',
        };

      default:
        return {
          average: 'N/A',
          peak: 'N/A',
          low: 'N/A',
          stability: 'N/A',
        };
    }
  }, [metricType]);

  const rows = useMemo(
    () => [
      {
        label: 'Average',
        value: stats.average,
        color: colors.text,
      },
      {
        label: 'Peak',
        value: stats.peak,
        color: colors.success,
      },
      {
        label: 'Lowest',
        value: stats.low,
        color: colors.error,
      },
      {
        label: 'Stability',
        value: stats.stability,
        color: colors.primary,
      },
    ],
    [stats, colors]
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      {rows.map((row, index) => (
        <View key={row.label}>
          <View style={styles.row}>
            <Text
              style={[
                styles.label,
                { color: colors.textSecondary },
              ]}
            >
              {row.label}
            </Text>

            <Text
              style={[
                styles.value,
                { color: row.color },
              ]}
            >
              {row.value}
            </Text>
          </View>

          {index < rows.length - 1 && (
            <View
              style={[
                styles.divider,
                {
                  backgroundColor:
                    colors.border,
                },
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );
}

export const MetricsTable = memo(
  MetricsTableComponent
);

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },

  label: {
    fontSize: 14,
  },

  value: {
    fontSize: 14,
    fontWeight: '700',
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
});