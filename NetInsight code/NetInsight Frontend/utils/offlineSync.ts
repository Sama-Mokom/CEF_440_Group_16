// utils/offlineSync.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { API_BASE_URL } from './apiConfig';

const PENDING_METRICS_KEY = 'pending_network_metrics';
const PENDING_FEEDBACK_KEY = 'pending_feedback';

// ==================== NETWORK METRICS ====================

export const savePendingMetric = async (metric: any) => {
  try {
    const existing = await getPendingMetrics();
    const updated = [...existing, { ...metric, queuedAt: new Date().toISOString() }];
    await AsyncStorage.setItem(PENDING_METRICS_KEY, JSON.stringify(updated));
    console.log('📦 Metric saved to offline queue');
  } catch (e) {
    console.error('Failed to save pending metric', e);
  }
};

export const getPendingMetrics = async (): Promise<any[]> => {
  try {
    const data = await AsyncStorage.getItem(PENDING_METRICS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const clearPendingMetrics = async () => {
  await AsyncStorage.removeItem(PENDING_METRICS_KEY);
};

// ==================== FEEDBACK ====================

export const savePendingFeedback = async (feedback: any) => {
  try {
    const existing = await getPendingFeedback();
    const updated = [...existing, { ...feedback, queuedAt: new Date().toISOString() }];
    await AsyncStorage.setItem(PENDING_FEEDBACK_KEY, JSON.stringify(updated));
    console.log('📦 Feedback saved to offline queue');
  } catch (e) {
    console.error('Failed to save pending feedback', e);
  }
};

export const getPendingFeedback = async (): Promise<any[]> => {
  try {
    const data = await AsyncStorage.getItem(PENDING_FEEDBACK_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const clearPendingFeedback = async () => {
  await AsyncStorage.removeItem(PENDING_FEEDBACK_KEY);
};

// ==================== SYNC ====================

export const syncPendingData = async () => {
  const netState = await NetInfo.fetch();
  if (!netState.isConnected) return false;

  try {
    // Sync Metrics
    const pendingMetrics = await getPendingMetrics();
    if (pendingMetrics.length > 0) {
      console.log(`Uploading ${pendingMetrics.length} pending metrics...`);
      for (const metric of pendingMetrics) {
        await fetch(`${API_BASE_URL}/api/network-metrics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metric),
        });
      }
      await clearPendingMetrics();
    }

    // Sync Feedback
    const pendingFeedback = await getPendingFeedback();
    if (pendingFeedback.length > 0) {
      console.log(`Uploading ${pendingFeedback.length} pending feedback...`);
      for (const fb of pendingFeedback) {
        await fetch(`${API_BASE_URL}/api/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fb),
        });
      }
      await clearPendingFeedback();
    }

    console.log('✅ All pending data synced successfully');
    return true;
  } catch (error) {
    console.error('Sync failed:', error);
    return false;
  }
};

// Listen for reconnection
export const setupOfflineSync = () => {
  NetInfo.addEventListener(state => {
    if (state.isConnected) {
      console.log('🔄 Device is back online → syncing pending data...');
      syncPendingData();
    }
  });
};