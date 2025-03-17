import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { CustomTabBar, CustomTabProps } from '@/components/CustomTabBar';
import { Entypo, Ionicons, MaterialIcons, Octicons } from '@expo/vector-icons';

const tabs: CustomTabProps[] = [
  {
    name: "main",
    href: "/",
    Icon: <Entypo name="home" size={26} color="#caf0f8" />,
    ActiveIcon: <Entypo name="home" size={26} color="#0077b6" />,
    showTabBar: true
  },
  {
    name: "videos",
    href: "/videos",
    Icon: <MaterialIcons name="video-library" size={26} color="#caf0f8" />,
    ActiveIcon: <MaterialIcons name="video-library" size={26} color="#0077b6" />,
    showTabBar: true
  },
  {
    name: "settings",
    href: "/settings",
    Icon: <Ionicons name="settings" size={26} color="#caf0f8" />,
    ActiveIcon: <Ionicons name="settings" size={26} color="#0077b6" />,
    showTabBar: true
  },
];

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('@/assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <CustomTabBar tabs={tabs} />;
}