import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';

const HelpCenter = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Help Center</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Frequently Asked Questions
        </Text>

        <View style={styles.faqItem}>
          <Text style={[styles.question, { color: colors.text }]}>
            How does NetInsight work?
          </Text>
          <Text style={[styles.answer, { color: colors.textSecondary }]}>
            NetInsight gathers anonymized network performance data and visualizes it to help users monitor their connection and usage patterns.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={[styles.question, { color: colors.text }]}>
            Is my data private?
          </Text>
          <Text style={[styles.answer, { color: colors.textSecondary }]}>
            Yes. All data is anonymized and stored securely. We do not track personal identifiers.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={[styles.question, { color: colors.text }]}>
            How can I contact support?
          </Text>
          <Text style={[styles.answer, { color: colors.textSecondary }]}>
            Reach out via the app settings or email us at support@netinsight.com.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpCenter;

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
    marginBottom: 16,
  },
  faqItem: {
    marginBottom: 24,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  answer: {
    fontSize: 15,
    lineHeight: 22,
  },
});
