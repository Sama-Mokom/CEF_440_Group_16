import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SendHorizontal, Check } from 'lucide-react-native';
import { API_BASE_URL } from '@/utils/apiConfig';

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs = 15000): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const getExperienceDescription = (rating: number): 'very_poor' | 'poor' | 'fair' | 'good' | 'excellent' => {
  if (rating <= 1) return 'very_poor';
  if (rating === 2) return 'poor';
  if (rating === 3) return 'fair';
  if (rating === 4) return 'good';
  return 'excellent';
};

export default function FeedbackScreen() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const t = translations[language];

  const FEEDBACK_CATEGORIES = [
    { label: t.catCallQuality,    value: 'call_quality' },
    { label: t.catInternetSpeed,  value: 'data_speed' },
    { label: t.catSignalStrength, value: 'signal_strength' },
    { label: t.catAppExperience,  value: 'app_experience' },
    { label: t.catCustomerService,value: 'customer_service' },
    { label: t.catOther,          value: 'other' },
  ];

  const DROP_FREQUENCY_OPTIONS = [
    { label: t.dropNever,      value: 'never' },
    { label: t.dropRarely,     value: 'rarely' },
    { label: t.dropOccasional, value: 'occasionally' },
    { label: t.dropFrequent,   value: 'frequently' },
    { label: t.dropConstant,   value: 'constantly' },
  ];

  const [selectedCategory, setSelectedCategory] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(0);
  const [dropFrequency, setDropFrequency] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitFeedback = async () => {
    if (!selectedCategory || !dropFrequency || (!feedbackText.trim() && rating === 0)) {
      Alert.alert(t.missingInfo, t.completeFields);
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload = {
        experience: getExperienceDescription(rating),
        areaOfFeedback: selectedCategory,
        description: feedbackText.trim(),
        rating,
        dropFrequency,
        networkProvider: 'Anonymous',
        resolved: false,
      };

      const response = await fetchWithTimeout(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }, 20000);

      if (!response.ok) {
        let message = t.failedSubmit;
        try { const err = await response.json(); message = err.message || message; } catch {}
        Alert.alert(t.errorTitle, message);
        return;
      }

      Alert.alert(t.thankYou, t.feedbackSubmitted, [{ text: t.ok, onPress: resetForm }]);
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        Alert.alert(t.requestTimedOut, t.serverSlow);
      } else {
        Alert.alert(t.errorTitle, t.somethingWrong);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedCategory('');
    setDropFrequency('');
    setFeedbackText('');
    setRating(0);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t.provideFeedback} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.rateNetwork}</Text>
        <View style={styles.ratingBar}>
          {[...Array(5)].map((_, i) => {
            const value = i + 1;
            return (
              <TouchableOpacity
                key={value}
                style={[styles.ratingCircle, { backgroundColor: value <= rating ? colors.primary : colors.card, borderColor: colors.border }]}
                onPress={() => setRating(value)}
              >
                <Text style={{ color: value <= rating ? 'white' : colors.text }}>{value}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>{t.selectCategory}</Text>
        <View style={styles.categoriesContainer}>
          {FEEDBACK_CATEGORIES.map(({ label, value }) => {
            const isSelected = selectedCategory === value;
            return (
              <TouchableOpacity
                key={value}
                style={[styles.categoryChip, { backgroundColor: isSelected ? colors.primary : colors.card, borderColor: colors.border }]}
                onPress={() => setSelectedCategory(value)}
              >
                <Text style={{ color: isSelected ? 'white' : colors.text }}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>{t.dropFrequencyTitle}</Text>
        <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>{t.dropFrequencyHint}</Text>
        <View style={styles.categoriesContainer}>
          {DROP_FREQUENCY_OPTIONS.map(({ label, value }) => {
            const isSelected = dropFrequency === value;
            return (
              <TouchableOpacity
                key={value}
                style={[styles.categoryChip, { backgroundColor: isSelected ? colors.primary : colors.card, borderColor: colors.border }]}
                onPress={() => setDropFrequency(value)}
              >
                {isSelected && <Check size={14} color="white" style={{ marginRight: 4 }} />}
                <Text style={{ color: isSelected ? 'white' : colors.text }}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 8 }]}>{t.additionalComments}</Text>
        <View style={[styles.textInputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.textInput, { color: colors.text }]}
            placeholder={t.describeExperience}
            placeholderTextColor={colors.textSecondary}
            multiline
            value={feedbackText}
            onChangeText={setFeedbackText}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.primary, opacity: submitting ? 0.6 : 1 }]}
          onPress={handleSubmitFeedback}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>{t.submitFeedback}</Text>
              <SendHorizontal size={20} color="#FFFFFF" style={styles.submitIcon} />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  categoriesContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 8, borderWidth: 1 },
  textInputContainer: { borderRadius: 8, borderWidth: 1, padding: 12, marginBottom: 24 },
  textInput: { fontSize: 16, textAlignVertical: 'top', height: 120 },
  sectionHint: { fontSize: 13, marginTop: -8, marginBottom: 12 },
  ratingBar: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  ratingCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 8, marginBottom: 8, borderWidth: 1 },
  submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 8, marginTop: 8 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  submitIcon: { marginLeft: 8 },
});
