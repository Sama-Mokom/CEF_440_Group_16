import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { registerBackgroundTask } from '@/utils/networkBackgroundTask';

export default function Index() {
  useEffect(() => {
    registerBackgroundTask().catch(console.error);
  }, []);

  return <Redirect href="/onboarding/splash" />;
}
