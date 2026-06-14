import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';

export default function LanguageScreen() {
  const { language, setLanguage } = useLanguage();
  const [selected, setSelected] = useState<Language>(language || 'en');
  const t = translations[selected];

  const handleContinue = async () => {
    await setLanguage(selected);
    router.replace('/onboarding/permissions');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Select Language/{'\n'}Sélectionner la langue
        </Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.option, selected === 'en' && styles.optionSelected]}
            onPress={() => setSelected('en')}
          >
            <Text style={styles.flag}>🇬🇧</Text>
            <Text style={styles.optionText}>English</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, selected === 'fr' && styles.optionSelected]}
            onPress={() => setSelected('fr')}
          >
            <Text style={styles.flag}>🇫🇷</Text>
            <Text style={styles.optionText}>French</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueText}>{t.continue}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1628',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 30,
  },
  optionsContainer: {
    gap: 16,
  },
  option: {
    backgroundColor: '#D9D9D9',
    borderRadius: 30,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  optionSelected: {
    borderWidth: 2,
    borderColor: '#00C2CB',
  },
  flag: {
    fontSize: 22,
  },
  optionText: {
    color: '#0B1628',
    fontSize: 16,
    fontWeight: '700',
  },
  continueButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 24,
  },
  continueText: {
    color: '#0B1628',
    fontSize: 17,
    fontWeight: '700',
  },
});
