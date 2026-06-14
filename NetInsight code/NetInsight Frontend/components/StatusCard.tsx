import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';
import { Signal, Download, Upload, Clock } from 'lucide-react-native';
import { ReactNode } from 'react';

type StatusType = 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';

interface StatusCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: 'signal' | 'download' | 'upload' | 'clock';
  status: StatusType;
  lowerIsBetter?: boolean;
}

export function StatusCard({ title, value, unit, icon, status, lowerIsBetter = false }: StatusCardProps) {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const t = translations[language];

  const getStatusColor = (s: StatusType) => {
    switch (s) {
      case 'excellent': return colors.primary;
      case 'good':      return colors.success;
      case 'fair':      return colors.warning;
      case 'poor':      return colors.error;
      default:          return colors.textSecondary;
    }
  };

  const getIcon = (): ReactNode => {
    const color = getStatusColor(status);
    const size = 18;
    switch (icon) {
      case 'signal':   return <Signal size={size} color={color} />;
      case 'download': return <Download size={size} color={color} />;
      case 'upload':   return <Upload size={size} color={color} />;
      case 'clock':    return <Clock size={size} color={color} />;
      default:         return null;
    }
  };

  const getStatusText = (s: StatusType) => {
    if (s === 'unknown') return t.statusUnknown;
    if (lowerIsBetter) {
      const map = {
        excellent: t.latencyVeryLow,
        good: t.latencyLow,
        fair: t.latencyModerate,
        poor: t.latencyHigh,
      };
      return map[s];
    }
    const map = {
      excellent: t.statusExcellent,
      good: t.statusGood,
      fair: t.statusFair,
      poor: t.statusPoor,
    };
    return map[s];
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.headerRow}>
        <View style={[styles.iconWrap, { backgroundColor: `${getStatusColor(status)}18` }]}>
          {getIcon()}
        </View>
        <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
      </View>
      <Text style={[styles.value, { color: colors.text }]}>
        {value}
        {unit && <Text style={[styles.unit, { color: colors.textSecondary }]}> {unit}</Text>}
      </Text>
      <Text style={[styles.status, { color: getStatusColor(status) }]}>{getStatusText(status)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14, borderRadius: 14, marginHorizontal: 4, borderWidth: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  iconWrap: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, flex: 1 },
  value: { fontSize: 22, fontWeight: '700', marginBottom: 4, letterSpacing: -0.5 },
  unit: { fontSize: 13, fontWeight: '400' },
  status: { fontSize: 12, fontWeight: '500' },
});
