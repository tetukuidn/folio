import React, { useEffect } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/src/auth";
import { useToast } from "@/src/components/toast";
import { colors, fonts, fontSize, radius, shadow, spacing } from "@/src/theme";

const BG =
  "https://images.unsplash.com/photo-1629099534513-bbc256e2b58a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzV8MHwxfHNlYXJjaHwxfHxBZ2xhb25lbWElMjBwbGFudCUyMGFlc3RoZXRpY3xlbnwwfHx8fDE3OTE0MzMxODN8MA&ixlib=rb-4.1.0&q=85";

export default function LoginScreen() {
  const { signIn, signingIn, error } = useAuth();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  useEffect(() => {
    if (error) toast.show(error);
  }, [error, toast]);

  return (
    <View style={styles.root}>
      <Image source={{ uri: BG }} style={StyleSheet.absoluteFill} contentFit="cover" transition={400} />
      <LinearGradient
        colors={["rgba(11,31,22,0.35)", "rgba(11,31,22,0.55)", "rgba(11,31,22,0.92)"]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.content, { paddingTop: insets.top + spacing.xxxl, paddingBottom: insets.bottom + spacing.xl }]}>
        <View>
          <Text style={styles.wordmark}>folio</Text>
          <Text style={styles.tagline}>lembar pembukuan penjualan aglonema</Text>
        </View>

        <Pressable
          onPress={signingIn ? undefined : signIn}
          disabled={signingIn}
          style={({ pressed }) => [styles.ctaShadow, pressed && { transform: [{ scale: 0.98 }] }]}
          testID="login-google"
        >
          <BlurView intensity={40} tint="light" style={styles.cta}>
            {signingIn ? (
              <ActivityIndicator color={colors.surfaceSecondary} />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color={colors.surfaceSecondary} />
                <Text style={styles.ctaText}>Masuk untuk mulai</Text>
                <Ionicons name="arrow-forward" size={20} color={colors.surfaceSecondary} />
              </>
            )}
          </BlurView>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0B1F16" },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: "space-between",
  },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: fontSize.display + 16,
    color: colors.surfaceSecondary,
    letterSpacing: -2,
  },
  tagline: {
    fontFamily: fonts.medium,
    fontSize: fontSize.base,
    color: "rgba(255,255,255,0.78)",
    marginTop: spacing.xs,
  },
  ctaShadow: { ...shadow.float, borderRadius: radius.pill },
  cta: {
    minHeight: 62,
    borderRadius: radius.pill,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  ctaText: { fontFamily: fonts.bold, fontSize: fontSize.lg + 1, color: colors.surfaceSecondary },
});
