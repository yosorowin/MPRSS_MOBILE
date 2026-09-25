import { useState } from "react";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MechanicLayout from "./MechanicLayout";
import { mockMechanicJobs, mockMechanicNotifications, statusColor } from "../../data/mechanicData";

const tabs = ["All", "Pending", "In Progress", "Waiting for Parts", "Ready for Quality Check", "Completed"];

export default function MechanicJobs() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All");
  const unreadCount = mockMechanicNotifications.filter((item) => !item.read).length;

  const filtered = activeTab === "All"
    ? mockMechanicJobs
    : mockMechanicJobs.filter((job) => job.status === activeTab);

  return (
    <MechanicLayout title="Assigned Jobs" unreadCount={unreadCount}>
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No jobs found.</Text>
            <Text style={styles.emptyText}>There are no jobs under this status.</Text>
          </View>
        ) : (
          filtered.map((job) => {
            const status = statusColor(job.status);
            return (
              <TouchableOpacity
                key={job.id}
                style={styles.card}
                onPress={() => router.push(`/mechanic/jobs/${job.id}`)}
                activeOpacity={0.85}
              >
                <View style={styles.cardTop}>
                  <View style={styles.cardTitleWrap}>
                    <Text style={styles.motorcycle}>{job.motorcycle}</Text>
                    <Text style={styles.service}>{job.serviceType}</Text>
                  </View>
                  <View style={[styles.status, { backgroundColor: status.bg }]}> 
                    <Text style={[styles.statusText, { color: status.text }]}>{job.status}</Text>
                  </View>
                </View>

                <Text style={styles.rowText}>Customer: <Text style={styles.strong}>{job.customerName}</Text></Text>
                <Text style={styles.rowText}>Schedule: <Text style={styles.strong}>{job.schedule} • {job.scheduleTime}</Text></Text>
                <Text style={styles.rowText}>Priority: <Text style={styles.strong}>{job.priority}</Text></Text>

                <View style={styles.bottomRow}>
                  <Text style={styles.jobId}>{job.id}</Text>
                  <Text style={styles.detailLink}>View Details ›</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </MechanicLayout>
  );
}

const styles = StyleSheet.create({
  tabBar: { backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  tabContent: { paddingHorizontal: 12, gap: 4 },
  tab: { paddingHorizontal: 10, paddingVertical: 13, borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: "#0A0F1A" },
  tabText: { color: "#9CA3AF", fontSize: 10, fontWeight: "600" },
  tabTextActive: { color: "#0A0F1A" },
  content: { padding: 16, paddingBottom: 30 },
  emptyCard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 30, alignItems: "center" },
  emptyTitle: { color: "#6B7280", fontSize: 13, fontWeight: "600" },
  emptyText: { color: "#9CA3AF", fontSize: 11, marginTop: 4 },
  card: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 14, marginBottom: 10 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  cardTitleWrap: { flex: 1 },
  motorcycle: { color: "#111827", fontSize: 14, fontWeight: "700" },
  service: { color: "#6B7280", fontSize: 11, marginTop: 3 },
  status: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5 },
  statusText: { fontSize: 9, fontWeight: "700" },
  rowText: { color: "#6B7280", fontSize: 10, marginTop: 7 },
  strong: { color: "#374151", fontWeight: "600" },
  bottomRow: { marginTop: 12, paddingTop: 11, borderTopWidth: 1, borderTopColor: "#F3F4F6", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  jobId: { color: "#9CA3AF", fontSize: 9, fontWeight: "700", letterSpacing: 1 },
  detailLink: { color: "#0A0F1A", fontSize: 10, fontWeight: "700" },
});
