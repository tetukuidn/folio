// Design tokens for Laporan Aglonema (LPM). Light theme only.
import { useMemo } from "react";
import { Appearance, StyleSheet, useColorScheme } from "react-native";

export type ColorScheme = "light" | "dark";

const light = {
  // Surfaces
  surface: "#F1F5F0", // bg
  onSurface: "#17261F", // teks
  surfaceSecondary: "#FFFFFF", // card
  onSurfaceSecondary: "#17261F",
  surfaceTertiary: "#F7FAF6", // input bg
  onSurfaceTertiary: "#17261F",
  surfaceInverse: "#17261F",
  onSurfaceInverse: "#FFFFFF",
  muted: "#5C6B63", // teks redup

  // Brand (hijau utama)
  brand: "#1F5A41",
  onBrand: "#FFFFFF",
  brandPrimary: "#1F5A41",
  onBrandPrimary: "#FFFFFF",
  brandSecondary: "#E1EFE6", // hijau muda
  onBrandSecondary: "#1F5A41",
  brandTertiary: "#F0F7F2",
  onBrandTertiary: "#1F5A41",

  // Accent (pink)
  accent: "#C42F5C",
  onAccent: "#FFFFFF",
  accentMuted: "#FBE6EC",
  onAccentMuted: "#C42F5C",

  // Status
  success: "#1F5A41",
  onSuccess: "#FFFFFF",
  warning: "#B45309",
  onWarning: "#FFFFFF",
  error: "#C42F5C",
  onError: "#FFFFFF",
  info: "#1D4ED8",
  onInfo: "#FFFFFF",

  // Lines
  border: "#DCE4DE",
  borderStrong: "#B8C6BC",
  divider: "#DCE4DE",
};

export type ThemeColors = typeof light;
export const defaultScheme = "light" satisfies ColorScheme;
export const themes: { light: ThemeColors; dark?: ThemeColors } = { light };

export function setColorScheme(scheme: ColorScheme | null) {
  Appearance.setColorScheme?.(scheme ?? "unspecified");
}

setColorScheme?.(themes.dark ? null : defaultScheme);

export function useTheme(): { scheme: ColorScheme; colors: ThemeColors } {
  const system = useColorScheme();
  const scheme: ColorScheme = system && themes[system] ? system : defaultScheme;
  return { scheme, colors: themes[scheme] ?? themes.light };
}

export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (colors: ThemeColors) => T & StyleSheet.NamedStyles<any>,
): () => T {
  return function useStyles(): T {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}

export const colors = light;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 8, md: 12, lg: 14, xl: 20, pill: 999 };
