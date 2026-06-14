import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

const TermsOfService = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Terms of Service</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Acceptance of Terms</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          By using NetInsight, you agree to these Terms of Service. If you do not agree, please do not use the app.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Use of the App</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          You agree to use the app for lawful purposes only. You are responsible for any activity that occurs under your account.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Data Collection</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          NetInsight collects anonymized network and usage data to improve service. This data is never sold or shared without consent.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Intellectual Property</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          All content and code in the app is owned by NetInsight. You may not reuse or copy without permission.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Termination</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          We may terminate or suspend access if you violate these terms or misuse the platform.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>6. Changes to Terms</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          We may update these terms from time to time. Continued use of the app means you accept the changes.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>7. Contact</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          If you have any questions, please contact us at legal@netinsight.com.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsOfService;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
  },
});
