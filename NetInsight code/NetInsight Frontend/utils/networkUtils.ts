// networkUtils.ts
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Cellular from 'expo-cellular';
import { API_BASE_URL } from './apiConfig';

export const CACHE_KEY = 'network_stats_cache';
const SAMPLE_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

const TEST_FILE_URL = 'https://speed.cloudflare.com/__down?bytes=5000000';

const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeoutMs = 10000
): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

export type NetworkSample = {
  timestamp: number;
  signalStrength: number | null;
  downloadSpeed: number;
  uploadSpeed: number;
  latency: number;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null;
};

export type NetworkData = {
  type: string;
  isConnected: boolean;
  isInternetReachable: boolean | null;
  signalStrength: number | null;
  downloadSpeed: number;
  downloadStatus: string;
  uploadSpeed: number;
  uploadStatus: string;
  latency: number;
  latencyStatus: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null;
  dailySummary: NetworkSample[];
};

export const getCurrentNetworkInfo = async (): Promise<NetworkData> => {
  try {
    const netInfo = await NetInfo.fetch();
    console.log('NetInfo:', netInfo);

    // Measure speed + latency first so we can pass them to getRealSignalStrength
    // as a fallback when the OS doesn't expose raw dBm (e.g. iOS).
    const location = await getCurrentLocation();
    console.log('Location:', location);

    const downloadSpeed = await measureDownloadSpeed();
    console.log('Download Speed (Mbps):', downloadSpeed);

    const uploadSpeed = await estimateUploadSpeed();
    console.log('Upload Speed (Mbps):', uploadSpeed);

    const latency = await measureLatency();
    console.log('Latency (ms):', latency);

    // Re-fetch NetInfo right here so signal strength reflects the current radio
    // state AFTER measurements have completed, not the stale snapshot from the
    // start of the cycle. This is what makes signal update in sync with the
    // other metrics on every refresh interval.
    const freshNetInfo = await NetInfo.fetch();
    const signalStrength = await getRealSignalStrength(freshNetInfo, latency, downloadSpeed);
    console.log('Signal Strength (dBm):', signalStrength);

    const downloadStatus = classifySpeed(downloadSpeed);
    const uploadStatus = classifySpeed(uploadSpeed);
    const latencyStatus = classifyLatency(latency);

    const cached = await getCachedData();
    const timestamp = Date.now();
    const newSample: NetworkSample = {
      timestamp,
      signalStrength,
      downloadSpeed,
      uploadSpeed,
      latency,
      location,
    };

    const updatedSummary = [...(cached?.dailySummary || []), newSample].slice(-500);

    const updated: NetworkData = {
      type: netInfo.type,
      isConnected: netInfo.isConnected ?? false,
      isInternetReachable: netInfo.isInternetReachable ?? null,
      signalStrength,
      downloadSpeed,
      downloadStatus,
      uploadSpeed,
      uploadStatus,
      latency,
      latencyStatus,
      location,
      dailySummary: updatedSummary,
    };

    console.log('Final NetworkData:', updated);

    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ data: updated, timestamp }));
    return updated;
  } catch (error) {
    console.error('Error in getCurrentNetworkInfo:', error);
    throw error;
  }
};

/**
 * Real Signal Strength in dBm.
 *
 * Sources tried in order of accuracy:
 *  1. NetInfo details.strength (Android only) — an ASU/percentage value that
 *     maps linearly to dBm. This is the most reliable cross-platform source
 *     available without a custom native module.
 *  2. expo-cellular cellularGeneration — used to pick the right dBm range so
 *     the fallback is band-accurate (5G vs LTE vs 3G vs 2G).
 *  3. Connection-quality fallback — derived from measured latency + speed so
 *     the value is still meaningful even when the OS withholds signal data
 *     (common on iOS, which never exposes raw dBm to JS).
 *
 * Why not expo-cellular.getCellularInfoAsync()?
 *   It returns Android's SignalStrength.getLevel() — a 0-4 bar integer, not dBm.
 *   We use expo-cellular only to read cellularGeneration for band-aware mapping.
 */
const getRealSignalStrength = async (
  netInfo: any,
  latency: number = 0,
  downloadSpeed: number = 0
): Promise<number | null> => {
  const details = netInfo?.details as any;
  const isWifi = netInfo?.type === 'wifi';

  // ── 1. Wi-Fi RSSI (Android exposes this directly in some builds) ──────────
  if (isWifi) {
    // Android NetInfo sometimes puts RSSI in details.strength as a negative dBm
    if (
      details?.strength != null &&
      typeof details.strength === 'number' &&
      details.strength < 0
    ) {
      console.log('✅ Wi-Fi RSSI from NetInfo (negative):', details.strength);
      return Math.round(details.strength);
    }

    // Android also exposes it as a 0-100 percentage on older builds
    if (
      details?.strength != null &&
      typeof details.strength === 'number' &&
      details.strength > 0
    ) {
      // Wi-Fi range: -30 dBm (excellent) … -90 dBm (unusable)
      const dBm = -90 + (details.strength / 100) * 60;
      console.log('✅ Wi-Fi signal from NetInfo % →', Math.round(dBm), 'dBm');
      return Math.round(dBm);
    }

    // iOS never exposes Wi-Fi RSSI to JS without a native entitlement — fall through
  }

  // ── 2. Cellular ASU / percentage from NetInfo ─────────────────────────────
  if (!isWifi && details?.strength != null && typeof details.strength === 'number') {
    const raw = details.strength; // 0-100 on Android

    // Determine band for accurate dBm mapping
    let minDbm = -113; // 2G floor
    let maxDbm = -51;  // 2G ceiling (ASU 0-31)

    try {
      const gen = details?.cellularGeneration ?? (await Cellular.getCellularGenerationAsync?.());
      if (gen === '5g')      { minDbm = -140; maxDbm = -44; }
      else if (gen === '4g') { minDbm = -140; maxDbm = -43; } // LTE: -140 to -43 dBm
      else if (gen === '3g') { minDbm = -120; maxDbm = -24; }
      // 2G defaults above
    } catch (_) {}

    if (raw < 0) {
      // Some Android versions return the raw dBm directly as a negative value
      console.log('✅ Cellular dBm direct from NetInfo:', raw);
      return Math.round(raw);
    }

    if (raw > 0) {
      const dBm = minDbm + (raw / 100) * (maxDbm - minDbm);
      console.log('✅ Cellular dBm from NetInfo %:', Math.round(dBm), '(raw:', raw + ')');
      return Math.round(dBm);
    }
  }

  // ── 3. Connection-quality fallback (iOS + stubborn Android) ──────────────
  // Derive a plausible dBm from the speed + latency we actually measured.
  // This is an estimate, not a hardware reading, but it's band-consistent and
  // changes realistically as conditions change — far better than a static mock.
  console.log('⚠️  No hardware signal data — deriving dBm from connection quality');

  if (latency > 0 || downloadSpeed > 0) {
    // Score 0-1 based on how good the connection is
    const latencyScore  = latency      <= 0 ? 0.5 : Math.max(0, Math.min(1, 1 - (latency - 20) / 380));
    const speedScore    = downloadSpeed <= 0 ? 0.5 : Math.max(0, Math.min(1, downloadSpeed / 100));
    const qualityScore  = (latencyScore * 0.6 + speedScore * 0.4); // latency weighted higher

    // Map 0-1 → -120 dBm (terrible) … -50 dBm (excellent)
    const estimatedDbm = Math.round(-120 + qualityScore * 70);
    console.log('✅ Estimated dBm from quality score:', estimatedDbm, '(score:', qualityScore.toFixed(2) + ')');
    return estimatedDbm;
  }

  return null;
};

const getCurrentLocation = async (): Promise<{ latitude: number; longitude: number; accuracy: number; } | null> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Location permission not granted');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy ?? 0,
    };
  } catch (error) {
    console.warn('Failed to get location', error);
    return null;
  }
};

const measureDownloadSpeed = async (): Promise<number> => {
  try {
    const startTime = Date.now();
    const response = await fetchWithTimeout(TEST_FILE_URL, {
      method: 'GET',
      headers: { Range: 'bytes=0-5000000' },
    }, 12000);

    if (!response.ok) throw new Error('Failed to fetch download test file');

    const blob = await response.blob();
    const endTime = Date.now();

    const sizeBytes = blob.size;
    const sizeMB = sizeBytes / (1024 * 1024);
    const durationSec = (endTime - startTime) / 1000;

    const speedMbps = sizeMB / durationSec;
    return Number(speedMbps.toFixed(2));
  } catch (e) {
    console.warn('Download speed test failed:', e);
    return 0;
  }
};

const estimateUploadSpeed = async (): Promise<number> => {
  try {
    const data = new Uint8Array(1 * 1024 * 1024);
    data.fill(97);

    const start = Date.now();
    const response = await fetchWithTimeout('https://httpbin.org/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: data,
    }, 12000);

    if (!response.ok) throw new Error('Failed to upload test data');

    const end = Date.now();
    const sizeMB = data.length / (1024 * 1024);
    const durationSec = (end - start) / 1000;

    const speedMbps = sizeMB / durationSec;
    return Number(speedMbps.toFixed(2));
  } catch (e) {
    console.warn('Upload speed test failed:', e);
    return 0;
  }
};

const measureLatency = async (): Promise<number> => {
  try {
    const start = Date.now();
    await fetchWithTimeout('https://www.google.com/generate_204', {}, 8000);
    const end = Date.now();
    return end - start;
  } catch {
    return 0;
  }
};

const classifySpeed = (speed: number): string => {
  if (speed > 25) return 'excellent';
  if (speed > 10) return 'good';
  if (speed > 2) return 'fair';
  return 'poor';
};

const classifyLatency = (latency: number): string => {
  if (latency < 50) return 'excellent';
  if (latency < 100) return 'good';
  if (latency < 200) return 'fair';
  return 'poor';
};

const QUALITY_SCORES: Record<string, number> = {
  excellent: 4,
  good: 3,
  fair: 2,
  poor: 1,
  unknown: 0,
};

export const getConnectionQuality = (
  downloadStatus: string,
  uploadStatus: string,
  latencyStatus: string
): 'excellent' | 'good' | 'fair' | 'poor' | 'unknown' => {
  const scores = [downloadStatus, uploadStatus, latencyStatus]
    .map((s) => QUALITY_SCORES[s] ?? 0)
    .filter((s) => s > 0);

  if (scores.length === 0) return 'unknown';

  const average = scores.reduce((sum, val) => sum + val, 0) / scores.length;

  if (average >= 3.5) return 'excellent';
  if (average >= 2.5) return 'good';
  if (average >= 1.5) return 'fair';
  return 'poor';
};

export const getCachedData = async (): Promise<NetworkData | null> => {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.data ?? null;
  } catch (error) {
    console.warn('Failed to read cache:', error);
    return null;
  }
};

// Background polling
let backgroundInterval: ReturnType<typeof setInterval> | null = null;

export const startBackgroundNetworkMonitor = () => {
  if (backgroundInterval) return;
  backgroundInterval = setInterval(() => {
    getCurrentNetworkInfo().catch(console.warn);
  }, SAMPLE_INTERVAL_MS);
};

export const stopBackgroundNetworkMonitor = () => {
  if (backgroundInterval) {
    clearInterval(backgroundInterval);
    backgroundInterval = null;
  }
};

export const getCurrentNetworkType = async (): Promise<string> => {
  try {
    const netInfo = await NetInfo.fetch();
    return netInfo.type;
  } catch (error) {
    console.warn('Failed to get network type:', error);
    return 'unknown';
  }
};

const CAMEROON_OPERATORS: { match: string[]; name: string; color: string }[] = [
  { match: ['mtn', '62401', '624 01'], name: 'MTN', color: '#FFC107' },
  { match: ['orange', '62402', '624 02', 'orange cm'], name: 'Orange', color: '#FF6600' },
  { match: ['camtel', '62401', '62403', '624 03', 'camtel'], name: 'Camtel', color: '#003087' },
  { match: ['nextel', '62404', '624 04'], name: 'Nexttel', color: '#E30613' },
];

export type NetworkOperatorInfo = {
  operatorName: string | null;
  operatorColor: string | null;
  ssid: string | null;
  cellularGeneration: string | null;
  carrier: string | null;
  isWifi: boolean;
  isConnected: boolean;
  networkType: string;
};

export const getNetworkOperatorInfo = async (): Promise<NetworkOperatorInfo> => {
  try {
    const netInfo = await NetInfo.fetch();
    const details = (netInfo as any).details;
    const isWifi = netInfo.type === 'wifi';
    const isConnected = netInfo.isConnected ?? false;

    if (isWifi) {
      const ssid: string | null = details?.ssid ?? null;
      return {
        operatorName: ssid ? ssid : 'Wi-Fi',
        operatorColor: '#22c55e',
        ssid,
        cellularGeneration: null,
        carrier: null,
        isWifi: true,
        isConnected,
        networkType: 'wifi',
      };
    }

    const rawCarrier: string | null = details?.carrier ?? null;
    const cellularGeneration: string | null = details?.cellularGeneration ?? null;

    let operatorName: string | null = null;
    let operatorColor: string | null = null;

    if (rawCarrier) {
      const lower = rawCarrier.toLowerCase();
      for (const op of CAMEROON_OPERATORS) {
        if (op.match.some((m) => lower.includes(m))) {
          operatorName = op.name;
          operatorColor = op.color;
          break;
        }
      }
      if (!operatorName) {
        operatorName = rawCarrier;
        operatorColor = '#6366f1';
      }
    }

    return {
      operatorName,
      operatorColor,
      ssid: null,
      cellularGeneration,
      carrier: rawCarrier,
      isWifi: false,
      isConnected,
      networkType: netInfo.type,
    };
  } catch (error) {
    console.warn('getNetworkOperatorInfo error:', error);
    return {
      operatorName: null,
      operatorColor: null,
      ssid: null,
      cellularGeneration: null,
      carrier: null,
      isWifi: false,
      isConnected: false,
      networkType: 'unknown',
    };
  }
};

export const logDailyNetworkSummary = async () => {
  const cached = await getCachedData();
  if (!cached || !cached.dailySummary || cached.dailySummary.length === 0) {
    console.log('No network data available for daily summary.');
    return;
  }

  const today = new Date().toDateString();
  const todaySamples = cached.dailySummary.filter(sample => 
    new Date(sample.timestamp).toDateString() === today
  );

  if (todaySamples.length === 0) return;

  const average = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

  console.log('📊 Daily Network Summary for', today);
  console.log('Samples:', todaySamples.length);
  console.log('Avg Download:', average(todaySamples.map(s => s.downloadSpeed)).toFixed(2));
  console.log('Avg Upload:', average(todaySamples.map(s => s.uploadSpeed)).toFixed(2));
  console.log('Avg Latency:', average(todaySamples.map(s => s.latency)).toFixed(2));
};

export const submitNetworkMetrics = async (data?: NetworkData) => {
  try {
    const networkData = data ?? await getCurrentNetworkInfo();

    const payload = {
      deviceId: `device-${Platform.OS}`,
      timestamp: new Date().toISOString(),
      connectionType: networkData.type,
      isConnected: networkData.isConnected,
      isInternetReachable: networkData.isInternetReachable ?? false,
      signalStrength: networkData.signalStrength ?? -100,
      downloadSpeed: networkData.downloadSpeed,
      downloadStatus: networkData.downloadStatus,
      uploadSpeed: networkData.uploadSpeed,
      uploadStatus: networkData.uploadStatus,
      latency: networkData.latency,
      latencyStatus: networkData.latencyStatus,
      location: networkData.location ? {
        latitude: networkData.location.latitude,
        longitude: networkData.location.longitude,
        accuracy: networkData.location.accuracy
      } : { latitude: 0, longitude: 0, accuracy: 0 }
    };

    const response = await fetchWithTimeout(`${API_BASE_URL}/api/network-metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }, 15000);

    if (!response.ok) {
      console.error('Error submitting metrics');
    } else {
      console.log('✅ Network metrics submitted');
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') return;
    console.error('❌ Failed to submit network metrics:', err);
  }
};

export const getNetworkStatsFromServer = async () => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/network-metrics/stats`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }, 12000);

    if (!response.ok) throw new Error('Failed to fetch stats');
    return await response.json();
  } catch (error) {
    console.error("Error in getNetworkStatsFromServer:", error);
    throw error;
  }
};

export const getLocalTodayAverages = async () => {
  const cached = await getCachedData();
  const samples = cached?.dailySummary || [];

  const today = new Date().toDateString();
  const todaySamples = samples.filter(
    (sample) => new Date(sample.timestamp).toDateString() === today
  );

  const source = todaySamples.length > 0 ? todaySamples : samples;

  if (source.length === 0) {
    return { avgDownloadSpeed: 0, avgUploadSpeed: 0, avgLatency: 0 };
  }

  const average = (values: number[]) =>
    values.reduce((sum, val) => sum + val, 0) / values.length;

  return {
    avgDownloadSpeed: Number(average(source.map((s) => s.downloadSpeed)).toFixed(2)),
    avgUploadSpeed: Number(average(source.map((s) => s.uploadSpeed)).toFixed(2)),
    avgLatency: Number(average(source.map((s) => s.latency)).toFixed(2)),
  };
};