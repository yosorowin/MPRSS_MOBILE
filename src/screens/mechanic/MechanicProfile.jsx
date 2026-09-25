import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MechanicLayout from "./MechanicLayout";
import { mockMechanicJobs, mockMechanicNotifications, mockMechanicUser } from "../../data/mechanicData";

export default function MechanicProfile() {
  const router = useRouter();
  const unreadCount = mockMechanicNotifications.filter((item) => !item.read).length;
  const assignedJobs = mockMechanicJobs.filter((job) => job.status !== "Completed").length;
  const completedJobs = mockMechanicJobs.filter((job) => job.status === "Completed").length + mockMechanicUser.completedJobsTotal;
  const working = mockMechanicJobs.some((job) => job.status === "In Progress");

  return (
    <MechanicLayout title="Profile" unreadCount={unreadCount}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{mockMechanicUser.initials}</Text></View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{mockMechanicUser.name}</Text>
            <Text style={styles.role}>{mockMechanicUser.role}</Text>
            <View style={styles.onlinePill}><View style={styles.onlineDot} /><Text style={styles.onlineText}>{mockMechanicUser.status}</Text></View>
          </View>
        </View>

        <View style={styles.card}>
          {[
            ["Email", mockMechanicUser.email],
            ["Mobile", mockMechanicUser.mobile],
            ["Role", mockMechanicUser.role],
          ].map(([label, value], index) => (
            <View key={label} style={[styles.infoRow, index > 0 && styles.infoBorder]}>
              <Text style={styles.infoLabel}>{label}</Text>
              <Text style={styles.infoValue}>{value}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>WORK INFORMATION</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}><Text style={styles.statValue}>{assignedJobs}</Text><Text style={styles.statLabel}>Assigned</Text></View>
          <View style={styles.statCard}><Text style={styles.statValue}>{completedJobs}</Text><Text style={styles.statLabel}>Completed</Text></View>
          <View style={styles.statCard}><Text style={styles.statValueSmall}>{working ? "Working" : "Available"}</Text><Text style={styles.statLabel}>Status</Text></View>
        </View>

        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
            <Text style={styles.actionText}>Edit Profile</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
            <Text style={styles.actionText}>Change Password</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace("/mechanic-login")} activeOpacity={0.9}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </MechanicLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 30 },
  profileCard: { backgroundColor: "#0A0F1A", borderRadius: 14, padding: 18, flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center", marginRight: 14 },
  avatarText: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" },
  profileInfo: { flex: 1 },
  name: { color: "#FFFFFF", fontSize: 18, fontWeight: "800" },
  role: { color: "#94A3B8", fontSize: 11, marginTop: 3 },
  onlinePill: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5, marginTop: 8 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#4ADE80", marginRight: 5 },
  onlineText: { color: "#FFFFFF", fontSize: 8, fontWeight: "700" },
  card: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, overflow: "hidden", marginBottom: 14 },
  infoRow: { paddingHorizontal: 14, paddingVertical: 13, flexDirection: "row", justifyContent: "space-between", gap: 10 },
  infoBorder: { borderTopWidth: 1, borderTopColor: "#F3F4F6" },
  infoLabel: { color: "#9CA3AF", fontSize: 10 },
  infoValue: { color: "#374151", fontSize: 11, fontWeight: "600", textAlign: "right", flex: 1 },
  sectionLabel: { color: "#9CA3AF", fontSize: 9, fontWeight: "800", letterSpacing: 1.4, marginBottom: 8, marginTop: 4 },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 14, alignItems: "center" },
  statValue: { color: "#111827", fontSize: 20, fontWeight: "800" },
  statValueSmall: { color: "#111827", fontSize: 13, fontWeight: "800" },
  statLabel: { color: "#9CA3AF", fontSize: 9, marginTop: 4 },
  actionRow: { paddingHorizontal: 14, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  actionText: { color: "#374151", fontSize: 12, fontWeight: "600" },
  chevron: { color: "#9CA3AF", fontSize: 22 },
  divider: { height: 1, backgroundColor: "#F3F4F6" },
  logoutButton: { height: 48, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 10, alignItems: "center", justifyContent: "center" },
  logoutText: { color: "#374151", fontSize: 12, fontWeight: "700" },
});
