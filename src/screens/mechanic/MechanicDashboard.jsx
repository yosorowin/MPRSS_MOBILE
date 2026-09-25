import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MechanicLayout from "./MechanicLayout";
import { mockMechanicJobs, mockMechanicNotifications, statusColor } from "../../data/mechanicData";

export default function MechanicDashboard() {
  const router = useRouter();
  const mechanicName = "Juan";

  const todayJobs = mockMechanicJobs.filter((job) => job.schedule === "Sept 23, 2026");
  const assignedCount = mockMechanicJobs.filter((job) => job.status !== "Completed").length;
  const inProgressCount = mockMechanicJobs.filter((job) => job.status === "In Progress").length;
  const waitingPartsCount = mockMechanicJobs.filter((job) => job.status === "Waiting for Parts").length;
  const completedTodayCount = mockMechanicJobs.filter((job) => job.status === "Completed").length;
  const unreadCount = mockMechanicNotifications.filter((item) => !item.read).length;

  const cards = [
    { label: "Assigned Jobs", value: assignedCount },
    { label: "In Progress", value: inProgressCount },
    { label: "Waiting for Parts", value: waitingPartsCount },
    { label: "Completed Today", value: completedTodayCount },
  ];

  return (
    <MechanicLayout title="Dashboard" unreadCount={unreadCount}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.greeting}>
          <Text style={styles.greetingTitle}>Good morning, {mechanicName}!</Text>
          <Text style={styles.greetingText}>Here are your assigned jobs for today.</Text>
        </View>

        <View style={styles.grid}>
          {cards.map((card) => (
            <View key={card.label} style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{card.value}</Text>
              <Text style={styles.summaryLabel}>{card.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Jobs</Text>
          <TouchableOpacity onPress={() => router.push("/mechanic/jobs")} activeOpacity={0.7}>
            <Text style={styles.viewAll}>View all ›</Text>
          </TouchableOpacity>
        </View>

        {todayJobs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No assigned jobs yet.</Text>
            <Text style={styles.emptyText}>New service assignments will appear here.</Text>
          </View>
        ) : (
          todayJobs.slice(0, 3).map((job) => {
            const status = statusColor(job.status);
            return (
              <View key={job.id} style={styles.jobCard}>
                <View style={styles.jobHeader}>
                  <View style={styles.jobHeaderInfo}>
                    <Text style={styles.jobMotorcycle}>{job.motorcycle}</Text>
                    <Text style={styles.jobService}>{job.serviceType}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: status.bg }]}> 
                    <Text style={[styles.statusText, { color: status.text }]}>{job.status}</Text>
                  </View>
                </View>

                <Text style={styles.jobMeta}>Customer: <Text style={styles.jobMetaStrong}>{job.customerName}</Text></Text>
                <Text style={styles.jobMeta}>Today • {job.scheduleTime}</Text>

                <TouchableOpacity
                  style={styles.viewJobButton}
                  onPress={() => router.push(`/mechanic/jobs/${job.id}`)}
                  activeOpacity={0.9}
                >
                  <Text style={styles.viewJobText}>View Job</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Notifications</Text>
          <TouchableOpacity onPress={() => router.push("/mechanic/notifications")} activeOpacity={0.7}>
            <Text style={styles.viewAll}>View all ›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.notificationCard}>
          {mockMechanicNotifications.slice(0, 3).map((item) => (
            <View key={item.id} style={styles.notificationRow}>
              <View style={[styles.notificationDot, !item.read && styles.notificationUnread]} />
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationType}>{item.type}</Text>
                <Text style={styles.notificationText}>{item.text}</Text>
                <Text style={styles.notificationTime}>{item.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </MechanicLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 30 },
  greeting: { marginBottom: 18 },
  greetingTitle: { color: "#111827", fontSize: 22, fontWeight: "800", marginBottom: 4 },
  greetingText: { color: "#6B7280", fontSize: 13, lineHeight: 18 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 22 },
  summaryCard: { width: "48.5%", backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", padding: 15 },
  summaryValue: { color: "#111827", fontSize: 24, fontWeight: "800" },
  summaryLabel: { color: "#6B7280", fontSize: 10, marginTop: 5, lineHeight: 14 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10, marginTop: 2 },
  sectionTitle: { color: "#111827", fontSize: 15, fontWeight: "700" },
  viewAll: { color: "#6B7280", fontSize: 11, fontWeight: "600" },
  emptyCard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 25, alignItems: "center", marginBottom: 20 },
  emptyTitle: { color: "#6B7280", fontSize: 13, fontWeight: "600" },
  emptyText: { color: "#9CA3AF", fontSize: 11, textAlign: "center", marginTop: 4 },
  jobCard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 14, marginBottom: 10 },
  jobHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  jobHeaderInfo: { flex: 1 },
  jobMotorcycle: { color: "#111827", fontSize: 14, fontWeight: "700" },
  jobService: { color: "#6B7280", fontSize: 11, marginTop: 3 },
  statusBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5 },
  statusText: { fontSize: 9, fontWeight: "700" },
  jobMeta: { color: "#6B7280", fontSize: 10, marginTop: 8 },
  jobMetaStrong: { color: "#374151", fontWeight: "600" },
  viewJobButton: { backgroundColor: "#0A0F1A", borderRadius: 9, minHeight: 42, alignItems: "center", justifyContent: "center", marginTop: 12 },
  viewJobText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  notificationCard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, overflow: "hidden" },
  notificationRow: { flexDirection: "row", padding: 13, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  notificationDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#D1D5DB", marginTop: 4, marginRight: 10 },
  notificationUnread: { backgroundColor: "#0A0F1A" },
  notificationInfo: { flex: 1 },
  notificationType: { color: "#9CA3AF", fontSize: 8, fontWeight: "800", letterSpacing: 1, marginBottom: 3 },
  notificationText: { color: "#374151", fontSize: 11, lineHeight: 16 },
  notificationTime: { color: "#9CA3AF", fontSize: 9, marginTop: 3 },
});
