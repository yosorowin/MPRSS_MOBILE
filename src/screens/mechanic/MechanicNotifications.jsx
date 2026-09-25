import { useState } from "react";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MechanicLayout from "./MechanicLayout";
import { mockMechanicNotifications } from "../../data/mechanicData";

export default function MechanicNotifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(mockMechanicNotifications);
  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <MechanicLayout title="Notifications" unreadCount={unreadCount}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Text style={styles.unreadText}>{unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up."}</Text>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={() => setNotifications((items) => items.map((item) => ({ ...item, read: true })))}>
              <Text style={styles.markAll}>Mark all as read</Text>
            </TouchableOpacity>
          )}
        </View>

        {notifications.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.card, !item.read && styles.cardUnread]}
            onPress={() => item.jobId && router.push(`/mechanic/jobs/${item.jobId}`)}
            activeOpacity={0.85}
          >
            <View style={[styles.icon, !item.read && styles.iconUnread]}>
              <Text style={[styles.iconText, !item.read && styles.iconTextUnread]}>●</Text>
            </View>
            <View style={styles.info}>
              <View style={styles.titleRow}>
                <Text style={styles.type}>{item.type}</Text>
                {!item.read && <View style={styles.dot} />}
              </View>
              <Text style={[styles.message, !item.read && styles.messageUnread]}>{item.text}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {notifications.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>You're all caught up.</Text>
            <Text style={styles.emptyText}>No new notifications.</Text>
          </View>
        )}
      </ScrollView>
    </MechanicLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 30 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  unreadText: { color: "#6B7280", fontSize: 12 },
  markAll: { color: "#374151", fontSize: 10, fontWeight: "700", borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
  card: { flexDirection: "row", backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 13, marginBottom: 8 },
  cardUnread: { borderColor: "#D1D5DB" },
  icon: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center", marginRight: 10 },
  iconUnread: { backgroundColor: "#0A0F1A" },
  iconText: { color: "#9CA3AF", fontSize: 8 },
  iconTextUnread: { color: "#FFFFFF" },
  info: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 },
  type: { color: "#9CA3AF", fontSize: 8, fontWeight: "800", letterSpacing: 1 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#0A0F1A" },
  message: { color: "#6B7280", fontSize: 11, lineHeight: 16 },
  messageUnread: { color: "#111827", fontWeight: "600" },
  time: { color: "#9CA3AF", fontSize: 9, marginTop: 4 },
  emptyCard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 28, alignItems: "center" },
  emptyTitle: { color: "#6B7280", fontSize: 13, fontWeight: "600" },
  emptyText: { color: "#9CA3AF", fontSize: 11, marginTop: 4 },
});
