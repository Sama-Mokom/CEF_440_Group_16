import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { Check } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';
import { setItem } from '@/utils/storage';

export default function PermissionsScreen() {
  const { language } = useLanguage();
  const t = translations[language];

  const [agreedPolicy, setAgreedPolicy] = useState(false);
  const [agreedLocation, setAgreedLocation] = useState(false);
  const [agreedData, setAgreedData] = useState(false);

  const allChecked = agreedPolicy && agreedLocation && agreedData;

  const handleGetStarted = async () => {
    if (!allChecked) return;

    try {
      await Location.requestForegroundPermissionsAsync();
    } catch (error) {
      console.warn('Location permission request failed:', error);
    }

    await setItem('permissionsAccepted', 'true');
    router.replace('/(tabs)');
  };

  const Checkbox = ({
    checked,
    onPress,
    label,
  }: {
    checked: boolean;
    onPress: () => void;
    label: string;
  }) => (
    <TouchableOpacity style={styles.checkboxRow} onPress={onPress}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Check size={14} color="#0B1628" strokeWidth={3} />}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>{t.privacyTitle}</Text>

        <Text style={styles.description}>{t.privacyDescription}</Text>

        <Image
          source={require('@/assets/images/track.png')}
          style={styles.icon}
          resizeMode="contain"
        />

        <View style={styles.checkboxList}>
          <Checkbox
            checked={agreedPolicy}
            onPress={() => setAgreedPolicy(!agreedPolicy)}
            label={t.agreePrivacyPolicy}
          />
          <Checkbox
            checked={agreedLocation}
            onPress={() => setAgreedLocation(!agreedLocation)}
            label={t.agreeLocation}
          />
          <Checkbox
            checked={agreedData}
            onPress={() => setAgreedData(!agreedData)}
            label={t.agreeDataCollection}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.getStartedButton, !allChecked && styles.getStartedDisabled]}
        onPress={handleGetStarted}
        disabled={!allChecked}
      >
        <Text style={styles.getStartedText}>{t.getStarted}</Text>
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
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  description: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  icon: {
    width: 90,
    height: 90,
    alignSelf: 'center',
    marginBottom: 32,
  },
  checkboxList: {
    gap: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: '#00C2CB',
    borderColor: '#00C2CB',
  },
  checkboxLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
  getStartedButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 24,
  },
  getStartedDisabled: {
    opacity: 0.4,
  },
  getStartedText: {
    color: '#0B1628',
    fontSize: 17,
    fontWeight: '700',
  },
});
