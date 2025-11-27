import CreateOptionPopup from '@/components/home_page_components/CreateOptionPopup';
import AppWrapperProvider from '@/components/wrapper_layout/AppWrapperContext';
import { requestNotificationPermissions } from '@/constants/notificationAndroid';
import { initiateDB } from '@/db/db';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeProvider } from './home';

export default function RootLayout() {
  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'SpaceMono-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
    'SpaceMono-Bold': require('../assets/fonts/SpaceMono-Bold.ttf'),
    'SpaceMono-Italic': require('../assets/fonts/SpaceMono-Italic.ttf'),
    'SpaceMono-BoldItalic': require('../assets/fonts/SpaceMono-BoldItalic.ttf'),
  });

  useEffect(() => {
    initiateDB();
    requestNotificationPermissions();
  }, [])

  // Show loading screen while fonts are loading
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (

    <SafeAreaProvider>
      <HomeProvider>
        <AppWrapperProvider>


          <Stack
            screenOptions={{
              animation: 'none',
              // animationTypeForReplace: 'pop',
              headerShown: false
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="home" />
          </Stack>
          <CreateOptionPopup />

        </AppWrapperProvider>
      </HomeProvider>

    </SafeAreaProvider>


  );
}