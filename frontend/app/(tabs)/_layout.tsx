import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { colors } from "@/src/theme";

function TabIcon({ name, color, focused }: { name: keyof typeof Ionicons.glyphMap; color: string; focused: boolean }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      {focused && (
        <View
          style={{
            position: "absolute",
            top: -8,
            width: 28,
            height: 3,
            borderRadius: 2,
            backgroundColor: colors.accent,
          }}
        />
      )}
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brandPrimary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
        tabBarStyle: {
          backgroundColor: colors.surfaceSecondary,
          borderTopColor: colors.border,
        },
        tabBarItemStyle: { alignSelf: "center" },
      }}
    >
      <Tabs.Screen
        name="pesanan"
        options={{
          title: "Pesanan",
          tabBarIcon: ({ color, focused }) => <TabIcon name="receipt-outline" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="supplier"
        options={{
          title: "Supplier",
          tabBarIcon: ({ color, focused }) => <TabIcon name="people-outline" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="persediaan"
        options={{
          title: "Persediaan",
          tabBarIcon: ({ color, focused }) => <TabIcon name="leaf-outline" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="customer"
        options={{
          title: "Customer",
          tabBarIcon: ({ color, focused }) => <TabIcon name="cart-outline" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => <TabIcon name="stats-chart-outline" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="ekspor"
        options={{
          title: "Ekspor",
          tabBarIcon: ({ color, focused }) => <TabIcon name="cloud-upload-outline" color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
