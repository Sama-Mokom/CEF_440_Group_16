import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface QuickFeedbackButtonsProps {
  rating: number;
  onRatingChange: (rating: number) => void;
}

export function QuickFeedbackButtons({ rating, onRatingChange }: QuickFeedbackButtonsProps) {
  const { colors } = useTheme();
  
  const buttons = [
    { value: 1, label: 'Very Poor', color: colors.error },
    { value: 2, label: 'Poor', color: colors.warning },
    { value: 3, label: 'Neutral', color: colors.info },
    { value: 4, label: 'Good', color: colors.secondary },
    { value: 5, label: 'Excellent', color: colors.success },
  ];
  
  return (
    <View style={styles.container}>
      {buttons.map((button) => (
        <TouchableOpacity
          key={button.value}
          style={[
            styles.ratingButton,
            { 
              backgroundColor: rating === button.value ? button.color : colors.card,
              borderColor: button.color,
            }
          ]}
          onPress={() => onRatingChange(button.value)}
        >
          <Text
            style={[
              styles.ratingText,
              { 
                color: rating === button.value ? colors.white : button.color,
                fontWeight: rating === button.value ? '600' : '400',
              }
            ]}
          >
            {button.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  ratingButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    marginBottom: 12,
    borderWidth: 1,
    width: '48%',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
  },
});