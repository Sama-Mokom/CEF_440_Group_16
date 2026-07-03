import moment from 'moment';

type Entry = {
  timestamp: number;
  signalStrength?: number | null;
  downloadSpeed?: number;
  uploadSpeed?: number;
  latency?: number;
  locationName?: string;
};

export function generateChartData(
  entries: Entry[],
  chartType: 'signal' | 'speed' | 'latency' | 'reliability',
  period: 'day' | 'week' | 'month' | 'year'
) {
  if (!entries?.length) {
    return {
      labels: [''],
      datasets: [{ data: [0] }],
    };
  }

  const metricKeyMap = {
    signal: 'signalStrength',
    speed: 'downloadSpeed',
    latency: 'latency',
    reliability: 'uploadSpeed',
  } as const;

  const key = metricKeyMap[chartType];

  const grouped = new Map<
    string,
    { sum: number; count: number }
  >();

  for (const entry of entries) {
    const value = entry[key];

    if (typeof value !== 'number' || value === null || !isFinite(value)) continue;

    const date = moment(entry.timestamp);

    let label = '';

    switch (period) {
      case 'day':
        label = date.format('HH:mm');
        break;

      case 'week':
        label = date.format('ddd');
        break;

      case 'month':
        label = date.format('D');
        break;

      case 'year':
        label = date.format('MMM');
        break;
    }

    const existing = grouped.get(label);

    if (existing) {
      existing.sum += value;
      existing.count += 1;
    } else {
      grouped.set(label, {
        sum: value,
        count: 1,
      });
    }
  }

  const labels = Array.from(grouped.keys());

  const data = labels.map(label => {
    const metric = grouped.get(label)!;

    return Number(
      (metric.sum / metric.count).toFixed(2)
    );
  });

  const MAX_VISIBLE_LABELS = 6;

  const step = Math.max(
    1,
    Math.ceil(labels.length / MAX_VISIBLE_LABELS)
  );

  const thinnedLabels = labels.map(
    (label, index) =>
      index % step === 0 ? label : ''
  );

  return {
    labels: thinnedLabels,
    datasets: [{ data }],
  };
}

export function getChartTitle(
  chartType:
    | 'signal'
    | 'speed'
    | 'latency'
    | 'reliability'
) {
  const titles = {
    signal: 'Signal Strength',
    speed: 'Download Speed',
    latency: 'Latency',
    reliability: 'Upload Speed',
  } as const;

  return titles[chartType];
}