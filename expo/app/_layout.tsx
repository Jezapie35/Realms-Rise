import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Image as ExpoImage } from "expo-image";
import { Asset } from "expo-asset";
import { GameProvider } from "@/context/GameContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { Palette } from "@/constants/colors";
import { initMonetisation } from "@/services/monetisation";
import { ALL_ICON_MODULES } from "@/components/icons/assetSources";

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

/**
 * Preload + decode every bundled icon before the first render so they
 * paint instantly when any screen mounts.
 */
async function preloadAssets(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      await ExpoImage.prefetch(ALL_ICON_MODULES as unknown as string[], 'memory-disk');
      return;
    }
    await Promise.all([
      Asset.loadAsync(ALL_ICON_MODULES as unknown as number[]),
      ExpoImage.prefetch(ALL_ICON_MODULES as unknown as string[], 'memory-disk'),
    ]);
  } catch (e) {
    console.log('[assets] preload failed', e);
  }
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        contentStyle: { backgroundColor: Palette.bg },
        headerStyle: { backgroundColor: Palette.bg },
        headerTintColor: Palette.gold,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await preloadAssets();
      if (cancelled) return;
      setReady(true);
      SplashScreen.hideAsync().catch(() => {});
      initMonetisation().catch(() => {});
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: Palette.bg }} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: Palette.bg }}>
          <SettingsProvider>
            <GameProvider>
              <StatusBar style="light" />
              <RootLayoutNav />
            </GameProvider>
          </SettingsProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
