import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Bell } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

const mockNotifications = [
  {
    id: 1,
    title: 'Network performance improved',
    message: 'We’ve optimized coverage in your area for better speed and reliability.',
    time: '2 hours ago',
  },
  {
    id: 2,
    title: 'Data usage insights',
    message: 'You used 1.2GB yesterday. Tap to view your usage breakdown.',
    time: 'Yesterday',
  },
  {
    id: 3,
    title: 'Welcome to NetInsight!',
    message: 'Thanks for joining. Start tracking and improving your network experience.',
    time: '3 days ago',
  },
];

const Notifications = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const navigateBack = () => {
    navigation.goBack();
    };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={navigateBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {mockNotifications.map((notification) => (
          <View
            key={notification.id}
            style={[styles.notificationCard, { backgroundColor: colors.card }]}
          >
            <View style={styles.iconContainer}>
              <Bell size={20} color={colors.primary} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.notificationTitle, { color: colors.text }]}>
                {notification.title}
              </Text>
              <Text style={[styles.notificationMessage, { color: colors.textSecondary }]}>
                {notification.message}
              </Text>
              <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
                {notification.time}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Notifications;

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
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    opacity: 0.7,
  },
});
