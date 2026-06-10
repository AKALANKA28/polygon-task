import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { Provider } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import { store } from '../src/store';
import { restoreSession } from '../src/store/slices/authSlice';
import { restoreTasksCache, processOfflineSync } from '../src/store/slices/tasksSlice';
import { restoreEmployeesCache } from '../src/store/slices/employeesSlice';
import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../src/theme/colors';

import { ThemeProvider, useTheme } from '../src/theme/ThemeContext';
import OfflineIndicator from '../src/components/ui/OfflineIndicator';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isInitialized } = useAppSelector((s) => s.auth);
  const router = useRouter();
  const segments = useSegments();
  const dispatch = useAppDispatch();

  // Restore sessions and local caches on launch
  useEffect(() => {
    dispatch(restoreSession());
    dispatch(restoreTasksCache());
    dispatch(restoreEmployeesCache());
  }, [dispatch]);

  // Listen to network changes and execute background synchronization
  useEffect(() => {
    let isInitialFetch = true;
    const unsubscribe = NetInfo.addEventListener((state) => {
      // Avoid triggering sync immediately on the first hook registration if already online
      if (isInitialFetch) {
        isInitialFetch = false;
        return;
      }
      if (state.isConnected) {
        console.log('[NetInfo] Restored connectivity. Triggering background offline sync.');
        dispatch(processOfflineSync())
          .unwrap()
          .then(() => {
            Toast.show({
              type: 'success',
              text1: 'Sync Completed',
              text2: 'Offline updates synchronized successfully!',
              position: 'top',
              visibilityTime: 4000,
            });
          })
          .catch((err) => {
            console.error('[Offline Sync] Sync error during reconnect:', err);
          });
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  useEffect(() => {
    if (!isInitialized) return;

    const inAuth = segments[0] === '(auth)';
    const inAdmin = segments[0] === '(admin)';
    const inEmployee = segments[0] === '(employee)';

    if (!user && !inAuth) {
      router.replace('/(auth)/login');
    } else if (user && inAuth) {
      if (user.role === 'admin') {
        router.replace('/(admin)');
      } else {
        router.replace('/(employee)');
      }
    } else if (user && user.role === 'admin' && inEmployee) {
      router.replace('/(admin)');
    } else if (user && user.role === 'employee' && inAdmin) {
      router.replace('/(employee)');
    }
  }, [user, isInitialized, segments, router]);

  return <>{children}</>;
}

function InnerLayout() {
  const { isDark, themeColors } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AuthGuard>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade_from_bottom',
            animationDuration: 200,
            freezeOnBlur: true,
            contentStyle: { backgroundColor: themeColors.background },
          }}
        />
      </AuthGuard>
      <OfflineIndicator />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surfaceDark.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <InnerLayout />
            <Toast />
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}
