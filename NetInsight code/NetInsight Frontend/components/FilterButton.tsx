import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { SlidersHorizontal } from 'lucide-react-native';

interface FilterButtonProps {
  onPress: () => void;
  active: boolean;
}

export function FilterButton({ onPress, active }: FilterButtonProps) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.button, {
        backgroundColor: active ? `${colors.primary}22` : colors.card,
        borderColor: active ? colors.primary : colors.border,
      }]}
      onPress={onPress}
    >
      <SlidersHorizontal size={16} color={active ? colors.primary : colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
