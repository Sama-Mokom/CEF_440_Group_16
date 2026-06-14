import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

const PrivacyPolicy = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy Policy</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Introduction
        </Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          At NetInsight, we value your privacy. This policy explains what data we collect, how we use it, and your rights concerning your information.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Information We Collect
        </Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          We collect anonymized performance data, device identifiers, and usage statistics to improve your experience and optimize network insights.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          How We Use Your Data
        </Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          Data is used for analytics, performance monitoring, feature improvements, and service optimization. We do not sell or share personal data with third parties.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Your Rights
        </Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          You have the right to request data deletion, understand how your data is used, and opt out of certain data collection practices.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Contact Us
        </Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          If you have any questions or concerns, contact us at privacy@netinsight.com.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicy;

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
