import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, Modal, FlatList, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SendHorizontal, ChevronDown, Check } from 'lucide-react-native';
import { API_BASE_URL } from '@/utils/apiConfig';

const BUEA_LOCATIONS = [
  { label: 'Molyko', value: 'Molyko', lat: 4.152, lng: 9.312 },
  { label: 'Tarred Malingo', value: 'Tarred Malingo', lat: 4.160, lng: 9.309 },
  { label: 'Untarred Malingo', value: 'Untarred Malingo', lat: 4.158, lng: 9.307 },
  { label: 'South', value: 'South', lat: 4.148, lng: 9.314 },
  { label: 'Bonduma', value: 'Bonduma', lat: 4.135, lng: 9.296 },
  { label: 'Check Point', value: 'Check Point', lat: 4.150, lng: 9.300 },
  { label: 'Wotolo', value: 'Wotolo', lat: 4.139, lng: 9.302 },
  { label: 'Sandpit', value: 'Sandpit', lat: 4.155, lng: 9.310 },
  { label: 'Great Soppo', value: 'Great Soppo', lat: 4.124, lng: 9.290 },
  { label: 'Small Soppo', value: 'Small Soppo', lat: 4.130, lng: 9.288 },
  { label: 'Clerks Quarters', value: 'Clerks Quarters', lat: 4.134, lng: 9.304 },
  { label: 'GRA', value: 'GRA', lat: 4.145, lng: 9.295 },
  { label: 'Bokwango', value: 'Bokwango', lat: 4.120, lng: 9.285 },
  { label: 'Bokwai', value: 'Bokwai', lat: 4.105, lng: 9.270 },
  { label: 'Likoko', value: 'Likoko', lat: 4.110, lng: 9.255 },
  { label: 'Mile 16', value: 'Mile 16', lat: 4.110, lng: 9.270 },
  { label: 'Mile 17', value: 'Mile 17', lat: 4.115, lng: 9.273 },
  { label: 'Mile 18', value: 'Mile 18', lat: 4.100, lng: 9.265 },
  { label: 'Buea Town', value: 'Buea Town', lat: 4.120, lng: 9.320 },
  { label: 'Bakweri Town', value: 'Bakweri Town', lat: 4.125, lng: 9.327 },
  { label: 'Dschang Quarter', value: 'Dschang Quarter', lat: 4.130, lng: 9.315 },
];

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

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(0);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitFeedback = async () => {
    if (!selectedCategory || !selectedLocation || (!feedbackText.trim() && rating === 0)) {
      Alert.alert(t.missingInfo, t.completeFields);
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      const locationData = BUEA_LOCATIONS.find(loc => loc.value === selectedLocation);
      const payload = {
        experience: getExperienceDescription(rating),
        areaOfFeedback: selectedCategory,
        description: feedbackText.trim(),
        rating,
        location: { latitude: locationData?.lat, longitude: locationData?.lng },
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
    setSelectedLocation('');
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

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>{t.selectLocation}</Text>
        <TouchableOpacity
          style={[styles.locationSelector, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setShowLocationModal(true)}
        >
          <Text style={{ color: selectedLocation ? colors.text : colors.textSecondary }}>
            {selectedLocation || t.chooseLocation}
          </Text>
          <ChevronDown size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <Modal visible={showLocationModal} transparent animationType="fade" onRequestClose={() => setShowLocationModal(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowLocationModal(false)}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t.selectLocation}</Text>
              <FlatList
                data={BUEA_LOCATIONS}
                keyExtractor={(item) => item.value}
                style={styles.modalList}
                renderItem={({ item }) => {
                  const isSelected = selectedLocation === item.value;
                  return (
                    <TouchableOpacity
                      style={[styles.modalItem, { borderBottomColor: colors.border }]}
                      onPress={() => { setSelectedLocation(item.value); setShowLocationModal(false); }}
                    >
                      <Text style={{ color: isSelected ? colors.primary : colors.text, fontWeight: isSelected ? '700' : '400' }}>{item.label}</Text>
                      {isSelected && <Check size={18} color={colors.primary} />}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.additionalComments}</Text>
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
  locationSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderWidth: 1, borderRadius: 8, marginBottom: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { width: '100%', maxHeight: '70%', borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  modalList: { flexGrow: 0 },
  modalItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 0.5 },
  textInput: { fontSize: 16, textAlignVertical: 'top', height: 120 },
  ratingBar: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  ratingCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 8, marginBottom: 8, borderWidth: 1 },
  submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 8, marginTop: 8 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  submitIcon: { marginLeft: 8 },
});
