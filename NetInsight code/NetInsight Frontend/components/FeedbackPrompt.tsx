import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';
import { MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react-native';
import { useState } from 'react';
import { router } from 'expo-router';

export function FeedbackPrompt() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const t = translations[language];
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  const handleQuickFeedback = (_isPositive: boolean) => {
    setFeedbackGiven(true);
    setTimeout(() => setFeedbackGiven(false), 5000);
  };

  if (feedbackGiven) {
    return (
      <View style={[styles.container, { backgroundColor: colors.successBackground, borderColor: colors.success }]}>
        <Text style={[styles.thankYouText, { color: colors.success }]}>{t.thankYouFeedback}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.iconTextContainer}>
        <MessageSquare size={18} color={colors.primary} />
        <Text style={[styles.promptText, { color: colors.text }]}>{t.networkExperienceToday}</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.feedbackButton, { borderColor: colors.success, backgroundColor: `${colors.success}14` }]}
          onPress={() => handleQuickFeedback(true)}
        >
          <ThumbsUp size={15} color={colors.success} />
          <Text style={[styles.feedbackButtonText, { color: colors.success }]}>{t.good}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.feedbackButton, { borderColor: colors.error, backgroundColor: `${colors.error}14` }]}
          onPress={() => handleQuickFeedback(false)}
        >
          <ThumbsDown size={15} color={colors.error} />
          <Text style={[styles.feedbackButtonText, { color: colors.error }]}>{t.poor}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.detailedButton, { backgroundColor: colors.primary }]}
          onPress={() => router.navigate('/(tabs)/feedback')}
        >
          <Text style={styles.detailedButtonText}>{t.details}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, borderRadius: 14, marginTop: 8, borderWidth: 1 },
  iconTextContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 8 },
  promptText: { fontSize: 15, fontWeight: '500' },
  buttonsContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  feedbackButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 9, borderRadius: 20, borderWidth: 1, gap: 5,
  },
  feedbackButtonText: { fontWeight: '600', fontSize: 13 },
  detailedButton: { flex: 1, paddingVertical: 9, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  detailedButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  thankYouText: { fontSize: 15, fontWeight: '600', textAlign: 'center', paddingVertical: 10 },
});
