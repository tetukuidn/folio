import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { TabTriggerSlotProps } from "expo-router/ui";
import { useRouter } from "expo-router";
import { colors, fonts, fontSize, nav, radius, shadow } from "../theme";

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  dashboard: "stats-chart",
  pesanan: "receipt",
  persediaan: "leaf",
  customer: "cart",
  ekspor: "cloud-upload",
};

type TabItemData = { key: string; name: string; label: string; focused: boolean; onPress: () => void };

type TabBarLikeProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  descriptors: Record<string, { options: { title?: string } }>;
  navigation: {
    emit: (e: { type: "tabPress"; target: string; canPreventDefault: true }) => { defaultPrevented: boolean };
    navigate: (name: never) => void;
  };
};

export function FloatingTabBar({ state, descriptors, navigation }: TabBarLikeProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const items: TabItemData[] = state.routes.map((route, index) => {
    const { options } = descriptors[route.key];
    return {
      key: route.key,
      name: route.name,
      label: options.title || route.name,
      focused: state.index === index,
      onPress: () => {
        const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
        if (!event.defaultPrevented) navigation.navigate(route.name as never);
      },
    };
  });

  const left = items.slice(0, 2);
  const right = items.slice(2);

  return (
    <View
      style={[
        styles.wrap,
        { bottom: insets.bottom + nav.bottomGap, left: nav.sideInset, right: nav.sideInset, pointerEvents: "box-none" },
      ]}
    >
      <View style={styles.pill}>
        <View style={styles.group}>
          {left.map(({ key, ...it }) => (
            <TabItem key={key} {...it} />
          ))}
        </View>
        <View style={{ width: nav.fabSize - 4 }} />
        <View style={styles.group}>
          {right.map(({ key, ...it }) => (
            <TabItem key={key} {...it} />
          ))}
        </View>
      </View>

      <View style={styles.fabWrap}>
        <Pressable
          onPress={() => router.push("/pesanan-baru")}
          style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.94 }] }]}
          testID="fab-pesanan-baru"
          accessibilityLabel="Pesanan baru"
        >
          <Ionicons name="add" size={32} color={colors.onAccent} />
        </Pressable>
      </View>
    </View>
  );
}

function TabItem({
  name,
  label,
  focused,
  onPress,
}: {
  name: string;
  label: string;
  focused: boolean;
  onPress: () => void;
}) {
  const icon = ICONS[name] ?? "ellipse";
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tab, focused && styles.tabActive]}
      testID={`tab-${name}`}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
    >
      <Ionicons
        name={focused ? icon : ((`${icon}-outline` as keyof typeof Ionicons.glyphMap) ?? icon)}
        size={focused ? 19 : 22}
        color={focused ? colors.brandPrimary : "rgba(255,255,255,0.72)"}
      />
      {focused ? (
        <Text style={styles.tabLabel} numberOfLines={1}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute" },
  pill: {
    height: nav.barHeight,
    borderRadius: radius.pill,
    backgroundColor: colors.brandPrimary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    ...shadow.float,
  },
  group: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-evenly" },
  tab: {
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: 6,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
  },
  tabActive: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 12,
  },
  tabLabel: { fontFamily: fonts.semibold, fontSize: fontSize.sm, color: colors.brandPrimary },
  fabWrap: {
    position: "absolute",
    pointerEvents: "box-none",
    left: 0,
    right: 0,
    bottom: nav.barHeight - nav.fabSize + nav.fabLift,
    alignItems: "center",
  },
  fab: {
    width: nav.fabSize,
    height: nav.fabSize,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: colors.surface,
    ...shadow.float,
  },
});
