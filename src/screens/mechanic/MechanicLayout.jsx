import { useRouter, usePathname } from "expo-router";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function MechanicLayout({ children, title, showBack = false, onBack, unreadCount = 0 }) {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", icon: "⌂", path: "/mechanic/dashboard" },
    { label: "Jobs", icon: "▣", path: "/mechanic/jobs" },
    { label: "Notifications", icon: "●", path: "/mechanic/notifications" },
    { label: "Profile", icon: "○", path: "/mechanic/profile" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {showBack && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={onBack || (() => router.back())}
                activeOpacity={0.7}
              >
                <Text style={styles.backText}>‹</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
          </View>
          <View style={styles.rolePill}>
            <Text style={styles.rolePillText}>MECHANIC</Text>
          </View>
        </View>

        <View style={styles.content}>{children}</View>

        <View style={styles.bottomNav}>
          {navItems.map((item) => {
            const active = pathname === item.path;
            return (
              <TouchableOpacity
                key={item.path}
                style={styles.navItem}
                onPress={() => router.replace(item.path)}
                activeOpacity={0.8}
              >
                <View style={styles.navIconWrap}>
                  <Text style={[styles.navIcon, active && styles.navIconActive]}>{item.icon}</Text>
                  {item.label === "Notifications" && unreadCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
                {active && <View style={styles.activeLine} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F9FAFB" },
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    height: 56,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { flex: 1, flexDirection: "row", alignItems: "center" },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
    backgroundColor: "#F3F4F6",
  },
  backText: { color: "#374151", fontSize: 26, lineHeight: 28 },
  headerTitle: { flex: 1, color: "#111827", fontSize: 18, fontWeight: "700" },
  rolePill: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    marginLeft: 8,
  },
  rolePillText: { color: "#6B7280", fontSize: 8, fontWeight: "800", letterSpacing: 1 },
  content: { flex: 1, paddingBottom: 76 },
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 68,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
  },
  navItem: { flex: 1, alignItems: "center", justifyContent: "center", position: "relative" },
  navIconWrap: { position: "relative", height: 25, justifyContent: "center" },
  navIcon: { color: "#9CA3AF", fontSize: 19 },
  navIconActive: { color: "#0A0F1A" },
  navLabel: { color: "#9CA3AF", fontSize: 9, fontWeight: "500", marginTop: 2 },
  navLabelActive: { color: "#0A0F1A", fontWeight: "700" },
  activeLine: {
    position: "absolute",
    top: 0,
    width: 30,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#0A0F1A",
  },
  badge: {
    position: "absolute",
    right: -9,
    top: -4,
    minWidth: 15,
    height: 15,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: "#0A0F1A",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#FFFFFF", fontSize: 8, fontWeight: "800" },
});
