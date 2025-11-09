
import CreateOptionPopup from '@/components/home_page_components/CreateOptionPopup';
import AppWrapperProvider from '@/components/wrapper_layout/AppWrapperContext';
import { requestNotificationPermissions } from '@/constants/notificationAndroid';
import { initiateDB } from '@/db/db';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeProvider } from './home';
export default function RootLayout() {


  useEffect(() => {
    initiateDB();
    requestNotificationPermissions();
  }, [])



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