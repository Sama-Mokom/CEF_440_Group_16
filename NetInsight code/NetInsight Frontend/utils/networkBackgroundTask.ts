import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

import {
  getCurrentNetworkInfo,
  logDailyNetworkSummary,
  submitNetworkMetrics,
} from './networkUtils';

const TASK_NAME = 'network-monitor-task';

TaskManager.defineTask(TASK_NAME, async () => {
  try {
    console.log('🌐 Background network task started at:', new Date().toLocaleString());

    // Always do a fresh measurement when background task runs
    await getCurrentNetworkInfo();

    await logDailyNetworkSummary();

    try {
      await submitNetworkMetrics();
    } catch (error) {
      console.warn('Background metric submission failed:', error);
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.warn('Background task failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const registerBackgroundTask = async () => {
  try {
    const status = await BackgroundFetch.getStatusAsync();

    if (
      status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
      status === BackgroundFetch.BackgroundFetchStatus.Denied
    ) {
      console.warn('Background fetch not allowed by OS');
      return;
    }

    const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);

    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(TASK_NAME, {
        minimumInterval: 300,     // 5 minutes - realistic minimum
        stopOnTerminate: false,
        startOnBoot: true,
      });
      console.log('✅ Background task registered (~every 5 minutes)');
    }
  } catch (error) {
    console.warn('Background task registration skipped (normal in Expo Go):', error);
  }
};