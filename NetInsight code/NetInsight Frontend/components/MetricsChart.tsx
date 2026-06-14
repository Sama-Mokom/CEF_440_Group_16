import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { LineChart } from 'react-native-chart-kit';

interface MetricsChartProps {
  data: {
    labels: string[];
    datasets: {
      data: number[];
    }[];
  };
  width: number;
  height: number;
  chartType: string;
}

function MetricsChartComponent({
  data,
  width,
  height,
  chartType,
}: MetricsChartProps) {
  const { colors } = useTheme();

  const lineColor = useMemo(() => {
    switch (chartType) {
      case 'signal':
        return colors.primary;
      case 'speed':
        return colors.secondary;
      case 'latency':
        return colors.warning;
      case 'reliability':
        return colors.success;
      default:
        return colors.primary;
    }
  }, [chartType, colors]);

  const chartConfig = useMemo(
    () => ({
      backgroundColor: 'transparent',
      backgroundGradientFrom: colors.card,
      backgroundGradientTo: colors.card,
      decimalPlaces: chartType === 'latency' ? 0 : 1,
      color: () => lineColor,
      labelColor: () => colors.textSecondary,
      propsForDots: {
        r: '3',
        strokeWidth: '1',
        stroke: lineColor,
      },
      propsForLabels: {
        fontSize: 10,
      },
      propsForBackgroundLines: {
        stroke: colors.border,
        strokeDasharray: '4,4',
        strokeWidth: 1,
      },
    }),
    [colors, chartType, lineColor]
  );

  const metricLabel = useMemo(() => {
    switch (chartType) {
      case 'signal':
        return 'Signal Strength (dBm)';
      case 'speed':
        return 'Speed (Mbps)';
      case 'latency':
        return 'Latency (ms)';
      case 'reliability':
        return 'Reliability (%)';
      default:
        return '';
    }
  }, [chartType]);

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.metricLabel,
          { color: colors.textSecondary },
        ]}
      >
        {metricLabel}
      </Text>

      <LineChart
        data={data}
        width={width}
        height={height}
        bezier
        chartConfig={chartConfig}
        style={styles.chart}
        withInnerLines
        withOuterLines={false}
        withHorizontalLabels
        withVerticalLabels
      />
    </View>
  );
}

export const MetricsChart = memo(MetricsChartComponent);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    marginBottom: 6,
    alignSelf: 'flex-start',
    fontWeight: '500',
  },
  chart: {
    marginVertical: 4,
    borderRadius: 12,
  },
});