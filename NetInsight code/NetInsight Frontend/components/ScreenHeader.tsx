import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ReactNode } from 'react';

interface ScreenHeaderProps {
  title: string;
  leftComponent?: ReactNode;
  rightComponent?: ReactNode;
  showBorder?: boolean;
}

export function ScreenHeader({
  title,
  leftComponent,
  rightComponent,
  showBorder = true,
}: ScreenHeaderProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.tabBar },
        showBorder && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
      ]}
    >
      <View style={styles.leftContainer}>{leftComponent}</View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <View style={styles.rightContainer}>{rightComponent}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 56,
  },
  leftContainer: { width: 40, alignItems: 'flex-start' },
  title: { fontSize: 18, fontWeight: '700', textAlign: 'center', flex: 1, letterSpacing: -0.2 },
  rightContainer: { width: 40, alignItems: 'flex-end' },
});
