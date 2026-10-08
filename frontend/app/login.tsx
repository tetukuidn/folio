import React from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Card } from "@/src/components/ui";
import { useAuth } from "@/src/auth";
import { colors, radius, spacing } from "@/src/theme";

export default function LoginScreen() {
  const { signIn, signingIn, error } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl }]}>
      <View style={styles.logoWrap}>
        <View style={styles.logo}>
          <Ionicons name="leaf" size={40} color={colors.onBrandPrimary} />
        </View>
        <Text style={styles.brand}>LPM</Text>
        <Text style={styles.tagline}>Laporan penjualan aglonema</Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Masuk untuk mulai</Text>
        <Text style={styles.cardBody}>
          Data toko Anda tersimpan online dan terpisah per akun Google. Masuk dengan akun yang sama di HP mana pun
          untuk melihat data yang sama.
        </Text>
        <View style={{ height: spacing.lg }} />
        {signingIn ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.brandPrimary} />
            <Text style={styles.loadingText}>Menghubungkan ke Google…</Text>
          </View>
        ) : (
          <Button title="Masuk dengan Google" icon="logo-google" onPress={signIn} testID="login-google" />
        )}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </Card>

      <Text style={styles.footer}>
        {Platform.OS === "web" ? "Anda akan diarahkan ke halaman Google." : "Jendela Google akan terbuka sebentar."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
    gap: spacing.xl,
  },
  logoWrap: { alignItems: "center", gap: spacing.sm },
  logo: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: { fontSize: 30, fontWeight: "800", color: colors.onSurface, letterSpacing: 2 },
  tagline: { fontSize: 14, color: colors.muted },
  card: { gap: 2 },
  cardTitle: { fontSize: 17, fontWeight: "800", color: colors.onSurface, marginBottom: 6 },
  cardBody: { fontSize: 13, color: colors.muted, lineHeight: 19 },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, minHeight: 48 },
  loadingText: { color: colors.onSurface, fontWeight: "600" },
  error: { color: colors.accent, fontWeight: "600", marginTop: spacing.md, fontSize: 13 },
  footer: { textAlign: "center", color: colors.muted, fontSize: 12 },
});
