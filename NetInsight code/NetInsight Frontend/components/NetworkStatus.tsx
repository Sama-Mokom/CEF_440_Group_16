import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';
import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Signal } from 'lucide-react-native';
import { getNetworkOperatorInfo, NetworkOperatorInfo } from '@/utils/networkUtils';
import NetInfo from '@react-native-community/netinfo';

export function NetworkStatus() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const t = translations[language];

  const [info, setInfo] = useState<NetworkOperatorInfo>({
    operatorName: null,
    operatorColor: null,
    ssid: null,
    cellularGeneration: null,
    carrier: null,
    isWifi: false,
    isConnected: false,
    networkType: 'unknown',
  });

  const refresh = async () => {
    const result = await getNetworkOperatorInfo();
    setInfo(result);
  };

  useEffect(() => {
    refresh();
    // Re-check whenever connectivity changes
    const unsubscribe = NetInfo.addEventListener(() => refresh());
    // Also poll every 15s in case carrier changes without a connectivity event
    const timer = setInterval(refresh, 15000);
    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, []);

  // ── Derived display values ───────────────────────────────────────────────
  const accent = !info.isConnected
    ? colors.error
    : info.operatorColor ?? (info.isWifi ? colors.success : colors.primary);

  const primaryLabel = (() => {
    if (!info.isConnected) return t.offline;
    if (info.isWifi) return info.ssid ? `Wi-Fi · ${info.ssid}` : 'Wi-Fi';
    if (info.operatorName) return info.operatorName;
    return t.connected;
  })();

  const generationLabel = (() => {
    if (!info.cellularGeneration) return '';
    const map: Record<string, string> = { '2g': '2G', '3g': '3G', '4g': '4G LTE', '5g': '5G' };
    return map[info.cellularGeneration] ?? info.cellularGeneration.toUpperCase();
  })();

  const subLabel = (() => {
    if (!info.isConnected) return t.noInternet;
    if (info.isWifi) return t.connectedWifi;
    const parts = ['Mobile Data'];
    if (generationLabel) parts.push(generationLabel);
    return parts.join(' · ');
  })();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: accent }]}>
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: `${accent}22` }]}>
        {!info.isConnected
          ? <WifiOff color={accent} size={18} />
          : info.isWifi
            ? <Wifi color={accent} size={18} />
            : <Signal color={accent} size={18} />
        }
      </View>

      {/* Text */}
      <View style={styles.textContainer}>
        <View style={styles.labelRow}>
          <Text style={[styles.primaryLabel, { color: accent }]}>{primaryLabel}</Text>
          {/* Generation badge e.g. "4G LTE" — only for cellular */}
          {!info.isWifi && generationLabel ? (
            <View style={[styles.genBadge, { backgroundColor: `${accent}22` }]}>
              <Text style={[styles.genBadgeText, { color: accent }]}>{generationLabel}</Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.subLabel, { color: colors.textSecondary }]}>{subLabel}</Text>
      </View>

      {/* Live dot */}
      <View style={[styles.dot, { backgroundColor: accent }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginVertical: 10,
    borderWidth: 1,
    borderLeftWidth: 4,
    gap: 12,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: { flex: 1 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  primaryLabel: { fontSize: 15, fontWeight: '700' },
  genBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  genBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  subLabel: { fontSize: 12 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
