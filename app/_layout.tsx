import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

import { LoadingProvider } from '@/contexts/LoadingContext';
import { Stack } from 'expo-router';
import Toast from 'react-native-toast-message';
import '@/i18n';
import { NotificationProvider } from '@/contexts/NotificationContext';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  return <LoadingProvider>
    <NotificationProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <Toast />
    </NotificationProvider>
  </LoadingProvider>
}