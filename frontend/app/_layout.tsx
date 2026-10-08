import React, { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { ActivityIndicator, LogBox, StyleSheet, Text, View } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/src/components/error-boundary";
import { queryClient } from "@/src/query-client";
import { AuthProvider, useAuth } from "@/src/auth";
import { StoreProvider } from "@/src/store";
import { ToastProvider } from "@/src/components/toast";
import { colors, spacing } from "@/src/theme";

LogBox.ignoreAllLogs(true);

function Splash() {
  return (
    <View style={styles.splash}>
      <ActivityIndicator size="large" color={colors.brandPrimary} />
      <Text style={styles.splashText}>Memuat data…</Text>
    </View>
  );
}

function Gate() {
  const { loading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const onLogin = segments[0] === "login";
    if (!user && !onLogin) router.replace("/login");
    else if (user && onLogin) router.replace("/(tabs)/dashboard");
  }, [loading, user, segments, router]);

  if (loading) return <Splash />;
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <KeyboardProvider>
            <AuthProvider>
              <StoreProvider>
                <ToastProvider>
                  <Gate />
                </ToastProvider>
              </StoreProvider>
            </AuthProvider>
          </KeyboardProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  splashText: { color: colors.muted, fontSize: 14 },
});
