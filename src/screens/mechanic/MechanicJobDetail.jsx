import { useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MechanicLayout from "./MechanicLayout";
import { mockMechanicJobs, mockMechanicNotifications, availabilityColor, statusColor } from "../../data/mechanicData";

const PROGRESS_STEPS = [
  "Approved",
  "In Progress",
  "Waiting for Parts",
  "Ready for Quality Check",
  "Completed",
];

export default function MechanicJobDetail() {
  const router = useRouter();
  const { jobId } = useLocalSearchParams();
  const unreadCount = mockMechanicNotifications.filter((item) => !item.read).length;

  const [activeTab, setActiveTab] = useState("Details");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [updateNotes, setUpdateNotes] = useState("");
  const [newNote, setNewNote] = useState("");

  const job = mockMechanicJobs.find((item) => item.id === jobId);

  const currentProgress = useMemo(() => {
    if (!job) return 0;
    switch (job.status) {
      case "Pending": return 0;
      case "In Progress": return 1;
      case "Waiting for Parts": return 2;
      case "Ready for Quality Check": return 3;
      case "Completed": return 4;
      default: return 0;
    }
  }, [job]);

  if (!job) {
    return (
      <MechanicLayout title="Job Not Found" showBack onBack={() => router.replace("/mechanic/jobs")} unreadCount={unreadCount}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>Job not found.</Text>
          <TouchableOpacity style={styles.darkButton} onPress={() => router.replace("/mechanic/jobs")}>
            <Text style={styles.darkButtonText}>Back to Jobs</Text>
          </TouchableOpacity>
        </View>
      </MechanicLayout>
    );
  }

  const status = statusColor(job.status);

  const availableStatuses = job.status === "Pending"
    ? ["In Progress"]
    : job.status === "In Progress"
      ? ["Waiting for Parts", "Ready for Quality Check"]
      : job.status === "Waiting for Parts"
        ? ["In Progress"]
        : [];

  const submitStatus = () => {
    setShowUpdateModal(false);
    setSelectedStatus("");
    setUpdateNotes("");
  };

  const addWorkNote = () => {
    if (!newNote.trim()) return;
    setNewNote("");
  };

  return (
    <MechanicLayout title={`Job ${job.id}`} showBack onBack={() => router.replace("/mechanic/jobs")} unreadCount={unreadCount}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.statusBanner, { backgroundColor: status.bg }]}> 
          <Text style={[styles.statusBannerText, { color: status.text }]}>{job.status}</Text>
          {job.priority === "High" && <Text style={styles.highPriority}>HIGH PRIORITY</Text>}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {["Details", "Parts", "Progress", "Notes"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
              {tab === "Parts" && job.parts.some((part) => part.availability !== "Available") && <View style={styles.warningDot} />}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {activeTab === "Details" && (
          <>
            <View style={styles.darkCard}>
              <Text style={styles.overlineLight}>MOTORCYCLE</Text>
              <Text style={styles.motorcycleTitle}>{job.motorcycle}</Text>
              <Text style={styles.mutedLight}>{job.year} • {job.color}</Text>

              <View style={styles.infoGrid}>
                <View style={styles.infoBoxDark}>
                  <Text style={styles.infoLabelLight}>PLATE NUMBER</Text>
                  <Text style={styles.infoValueLight}>{job.plateNumber}</Text>
                </View>
                <View style={styles.infoBoxDark}>
                  <Text style={styles.infoLabelLight}>VIN</Text>
                  <Text style={styles.infoValueLight}>{job.vin}</Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.overline}>SERVICE INFORMATION</Text>
              {[
                ["Service Type", job.serviceType],
                ["Customer", job.customerName],
                ["Preferred Schedule", `${job.schedule} • ${job.scheduleTime}`],
                ["Assigned By", job.assignedBy],
                ["Assigned Date", job.assignedDate],
              ].map(([label, value]) => (
                <View key={label} style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{label}</Text>
                  <Text style={styles.infoValue}>{value}</Text>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.overline}>CUSTOMER'S ISSUE</Text>
              <Text style={styles.issueText}>"{job.customerIssue}"</Text>
            </View>

            {job.status !== "Ready for Quality Check" && job.status !== "Completed" && (
              <TouchableOpacity style={styles.darkButton} onPress={() => setShowUpdateModal(true)} activeOpacity={0.9}>
                <Text style={styles.darkButtonText}>Update Job Status</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {activeTab === "Parts" && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Parts Required</Text>
              <Text style={styles.sectionMeta}>{job.parts.length} items</Text>
            </View>

            {job.parts.map((part) => {
              const partStatus = availabilityColor(part.availability);
              return (
                <View key={part.name} style={styles.card}>
                  <View style={styles.partRow}>
                    <View style={styles.partIcon}><Text style={styles.partIconText}>▣</Text></View>
                    <View style={styles.partInfo}>
                      <Text style={styles.partName}>{part.name}</Text>
                      <Text style={styles.partMeta}>{part.category} • Qty: {part.qty}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: partStatus.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: partStatus.text }]}>{part.availability}</Text>
                    </View>
                  </View>
                </View>
              );
            })}

            {job.parts.some((part) => part.availability === "Unavailable") && (
              <View style={styles.warningBox}>
                <Text style={styles.warningTitle}>Waiting for Required Parts</Text>
                <Text style={styles.warningText}>Some required parts are unavailable. Notify the admin if the work is blocked.</Text>
              </View>
            )}
          </>
        )}

        {activeTab === "Progress" && (
          <>
            <Text style={styles.sectionTitle}>Service Progress</Text>
            <View style={styles.card}>
              {PROGRESS_STEPS.map((step, index) => {
                const completed = index < currentProgress;
                const current = index === currentProgress;
                const pending = index > currentProgress;
                return (
                  <View key={step} style={styles.progressRow}>
                    <View style={styles.progressRail}>
                      <View style={[styles.progressCircle, completed || current ? styles.progressCircleActive : styles.progressCirclePending]}>
                        <Text style={[styles.progressCircleText, completed || current ? styles.progressCircleTextActive : styles.progressCircleTextPending]}>
                          {completed ? "✓" : index + 1}
                        </Text>
                      </View>
                      {index < PROGRESS_STEPS.length - 1 && <View style={[styles.progressLine, completed && styles.progressLineActive]} />}
                    </View>
                    <View style={styles.progressInfo}>
                      <Text style={[styles.progressTitle, pending && styles.progressTitlePending]}>{step}</Text>
                      {current && <Text style={styles.currentBadge}>CURRENT STAGE</Text>}
                    </View>
                  </View>
                );
              })}
            </View>

            {job.status === "Pending" && (
              <TouchableOpacity style={styles.darkButton} onPress={() => { setSelectedStatus("In Progress"); setShowUpdateModal(true); }}>
                <Text style={styles.darkButtonText}>Start Job</Text>
              </TouchableOpacity>
            )}

            {job.status === "In Progress" && (
              <>
                <TouchableOpacity style={styles.darkButton} onPress={() => { setSelectedStatus("Ready for Quality Check"); setShowUpdateModal(true); }}>
                  <Text style={styles.darkButtonText}>Ready for Quality Check</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.outlineButton} onPress={() => { setSelectedStatus("Waiting for Parts"); setShowUpdateModal(true); }}>
                  <Text style={styles.outlineButtonText}>Mark as Waiting for Parts</Text>
                </TouchableOpacity>
              </>
            )}

            {job.status === "Waiting for Parts" && (
              <View style={styles.warningBox}>
                <Text style={styles.warningTitle}>Waiting for Required Parts</Text>
                {job.parts.filter((part) => part.availability === "Unavailable").map((part) => (
                  <Text key={part.name} style={styles.warningText}>• {part.name}</Text>
                ))}
              </View>
            )}

            {job.status === "Ready for Quality Check" && (
              <View style={styles.successBox}>
                <Text style={styles.successTitle}>Ready for Admin Quality Check</Text>
                <Text style={styles.successText}>The mechanic has finished the service work. The admin will finalize the job after quality inspection.</Text>
              </View>
            )}
          </>
        )}

        {activeTab === "Notes" && (
          <>
            <Text style={styles.sectionTitle}>Work Notes</Text>
            {job.notes.length === 0 ? (
              <View style={styles.emptyCard}><Text style={styles.emptyText}>No work notes yet.</Text></View>
            ) : (
              job.notes.map((note, index) => (
                <View key={`${note.author}-${index}`} style={styles.noteCard}>
                  <View style={styles.noteHeader}>
                    <Text style={styles.noteAuthor}>{note.author}</Text>
                    <Text style={styles.noteTime}>{note.timestamp}</Text>
                  </View>
                  <Text style={styles.noteText}>{note.text}</Text>
                </View>
              ))
            )}

            {job.status !== "Completed" && job.status !== "Ready for Quality Check" && (
              <View style={styles.card}>
                <Text style={styles.formLabel}>ADD WORK NOTE</Text>
                <TextInput
                  value={newNote}
                  onChangeText={setNewNote}
                  placeholder="Describe what was completed or observed..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  textAlignVertical="top"
                  style={styles.textArea}
                />
                <TouchableOpacity
                  style={[styles.darkButton, !newNote.trim() && styles.disabledButton]}
                  disabled={!newNote.trim()}
                  onPress={addWorkNote}
                >
                  <Text style={styles.darkButtonText}>Save Note</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <Modal
        visible={showUpdateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUpdateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Job Status</Text>
              <TouchableOpacity onPress={() => setShowUpdateModal(false)}>
                <Text style={styles.closeText}>×</Text>
              </TouchableOpacity>
            </View>

            {availableStatuses.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.modalStatus, selectedStatus === item && styles.modalStatusActive]}
                onPress={() => setSelectedStatus(item)}
              >
                <Text style={[styles.modalStatusText, selectedStatus === item && styles.modalStatusTextActive]}>{item}</Text>
              </TouchableOpacity>
            ))}

            {selectedStatus === "Waiting for Parts" && (
              <Text style={styles.helperText}>Check the Parts tab for unavailable items before saving this update.</Text>
            )}

            <Text style={styles.formLabel}>WORK NOTES (OPTIONAL)</Text>
            <TextInput
              value={updateNotes}
              onChangeText={setUpdateNotes}
              placeholder="Describe what was completed or observed..."
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              style={styles.textArea}
            />

            <TouchableOpacity
              style={[styles.darkButton, !selectedStatus && styles.disabledButton]}
              onPress={submitStatus}
              disabled={!selectedStatus}
            >
              <Text style={styles.darkButtonText}>Save Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </MechanicLayout>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 30 },
  statusBanner: { paddingHorizontal: 16, paddingVertical: 11, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  statusBannerText: { fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  highPriority: { color: "#FFFFFF", backgroundColor: "rgba(17,24,39,0.25)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, fontSize: 8, fontWeight: "800" },
  tabs: { backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E5E7EB", paddingHorizontal: 10 },
  tab: { paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: "#0A0F1A" },
  tabText: { color: "#9CA3AF", fontSize: 10, fontWeight: "600" },
  tabTextActive: { color: "#0A0F1A" },
  warningDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#F59E0B", position: "absolute", top: 9, right: 4 },
  darkCard: { backgroundColor: "#0A0F1A", margin: 16, borderRadius: 14, padding: 16 },
  overlineLight: { color: "#94A3B8", fontSize: 9, fontWeight: "700", letterSpacing: 1.5, marginBottom: 5 },
  motorcycleTitle: { color: "#FFFFFF", fontSize: 21, fontWeight: "800" },
  mutedLight: { color: "#94A3B8", fontSize: 11, marginTop: 4 },
  infoGrid: { flexDirection: "row", gap: 8, marginTop: 14 },
  infoBoxDark: { flex: 1, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 9, padding: 10 },
  infoLabelLight: { color: "#94A3B8", fontSize: 8, fontWeight: "700", letterSpacing: 1, marginBottom: 4 },
  infoValueLight: { color: "#FFFFFF", fontSize: 10, fontWeight: "600" },
  card: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 15, marginHorizontal: 16, marginBottom: 10 },
  overline: { color: "#9CA3AF", fontSize: 9, fontWeight: "700", letterSpacing: 1.4, marginBottom: 10 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12, paddingVertical: 5 },
  infoLabel: { color: "#6B7280", fontSize: 10 },
  infoValue: { color: "#111827", fontSize: 10, fontWeight: "600", textAlign: "right", flex: 1 },
  issueText: { color: "#374151", fontSize: 12, lineHeight: 18, fontStyle: "italic" },
  sectionHeader: { marginHorizontal: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { marginHorizontal: 16, marginBottom: 10, color: "#111827", fontSize: 15, fontWeight: "700" },
  sectionMeta: { color: "#6B7280", fontSize: 10 },
  partRow: { flexDirection: "row", alignItems: "center" },
  partIcon: { width: 38, height: 38, borderRadius: 9, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center", marginRight: 10 },
  partIconText: { color: "#6B7280", fontSize: 17 },
  partInfo: { flex: 1 },
  partName: { color: "#111827", fontSize: 12, fontWeight: "700" },
  partMeta: { color: "#6B7280", fontSize: 10, marginTop: 3 },
  statusBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5 },
  statusBadgeText: { fontSize: 8, fontWeight: "800" },
  warningBox: { marginHorizontal: 16, marginBottom: 10, backgroundColor: "#FFFBEB", borderWidth: 1, borderColor: "#FCD34D", borderRadius: 12, padding: 14 },
  warningTitle: { color: "#92400E", fontSize: 12, fontWeight: "800", marginBottom: 5 },
  warningText: { color: "#92400E", fontSize: 10, lineHeight: 16 },
  successBox: { marginHorizontal: 16, marginBottom: 10, backgroundColor: "#F0FDF4", borderWidth: 1, borderColor: "#BBF7D0", borderRadius: 12, padding: 14 },
  successTitle: { color: "#166534", fontSize: 12, fontWeight: "800", marginBottom: 5 },
  successText: { color: "#166534", fontSize: 10, lineHeight: 16 },
  progressRow: { flexDirection: "row", minHeight: 62 },
  progressRail: { width: 32, alignItems: "center" },
  progressCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  progressCircleActive: { backgroundColor: "#0A0F1A", borderColor: "#0A0F1A" },
  progressCirclePending: { backgroundColor: "#FFFFFF", borderColor: "#D1D5DB" },
  progressCircleText: { fontSize: 9, fontWeight: "800" },
  progressCircleTextActive: { color: "#FFFFFF" },
  progressCircleTextPending: { color: "#9CA3AF" },
  progressLine: { width: 2, flex: 1, backgroundColor: "#E5E7EB", marginTop: 2 },
  progressLineActive: { backgroundColor: "#0A0F1A" },
  progressInfo: { flex: 1, paddingLeft: 10, paddingTop: 4 },
  progressTitle: { color: "#111827", fontSize: 12, fontWeight: "700" },
  progressTitlePending: { color: "#9CA3AF" },
  currentBadge: { color: "#1D4ED8", fontSize: 8, fontWeight: "800", marginTop: 4 },
  noteCard: { marginHorizontal: 16, marginBottom: 8, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 13 },
  noteHeader: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  noteAuthor: { color: "#374151", fontSize: 10, fontWeight: "800" },
  noteTime: { color: "#9CA3AF", fontSize: 8, marginLeft: "auto" },
  noteText: { color: "#4B5563", fontSize: 11, lineHeight: 17 },
  formLabel: { color: "#6B7280", fontSize: 9, fontWeight: "700", letterSpacing: 1.2, marginBottom: 7 },
  textArea: { minHeight: 90, borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 10, padding: 11, color: "#111827", fontSize: 11, backgroundColor: "#F9FAFB", marginBottom: 10 },
  darkButton: { minHeight: 46, marginHorizontal: 16, marginBottom: 10, borderRadius: 10, backgroundColor: "#0A0F1A", alignItems: "center", justifyContent: "center" },
  darkButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  outlineButton: { minHeight: 46, marginHorizontal: 16, marginBottom: 10, borderRadius: 10, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#D1D5DB", alignItems: "center", justifyContent: "center" },
  outlineButtonText: { color: "#374151", fontSize: 12, fontWeight: "700" },
  disabledButton: { backgroundColor: "#E5E7EB" },
  emptyCard: { marginHorizontal: 16, marginBottom: 10, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 25, alignItems: "center" },
  emptyText: { color: "#9CA3AF", fontSize: 11, textAlign: "center" },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  notFoundTitle: { color: "#6B7280", fontSize: 14, marginBottom: 15 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 20, paddingBottom: 28 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  modalTitle: { color: "#111827", fontSize: 17, fontWeight: "800" },
  closeText: { color: "#6B7280", fontSize: 28 },
  modalStatus: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, paddingVertical: 12, paddingHorizontal: 13, marginBottom: 8 },
  modalStatusActive: { borderColor: "#0A0F1A", backgroundColor: "#F9FAFB" },
  modalStatusText: { color: "#374151", fontSize: 12, fontWeight: "600" },
  modalStatusTextActive: { color: "#0A0F1A" },
  helperText: { color: "#92400E", fontSize: 10, lineHeight: 15, marginBottom: 12 },
});
