import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ChartPeriodSelectorProps {
  periods: string[];
  activePeriod: string;
  onSelectPeriod: (period: string) => void;
}

export function ChartPeriodSelector({ periods, activePeriod, onSelectPeriod }: ChartPeriodSelectorProps) {
  const { colors } = useTheme();
  const label = (p: string) => p.charAt(0).toUpperCase() + p.slice(1);

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {periods.map((period) => (
        <TouchableOpacity
          key={period}
          style={[styles.periodButton, activePeriod === period && { backgroundColor: colors.primary }]}
          onPress={() => onSelectPeriod(period)}
        >
          <Text style={[styles.periodText, { color: activePeriod === period ? '#fff' : colors.textSecondary }]}>
            {label(period)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
  },
  periodButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 9,
  },
  periodText: { fontSize: 13, fontWeight: '600' },
});
