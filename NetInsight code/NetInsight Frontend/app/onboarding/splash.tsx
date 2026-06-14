import { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { getItem } from '@/utils/storage';

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(async () => {
      const language = await getItem('language');
      const permissionsAccepted = await getItem('permissionsAccepted');

      if (!language) {
        router.replace('/onboarding/language');
      } else if (!permissionsAccepted) {
        router.replace('/onboarding/permissions');
      } else {
        router.replace('/(tabs)');
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/track.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>NetInsight</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1628',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
