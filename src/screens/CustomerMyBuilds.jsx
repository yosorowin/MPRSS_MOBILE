import { useState } from "react";
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import CustomerLayout from "../components/CustomerLayout";

const initialBuilds = [
  {
    id: "build-1",
    motorcycleId: "m1",
    motorcycleName: "Honda CBR600RR",
    goal: "Performance",
    parts: [
      "Performance Exhaust",
      "Air Filter",
      "ECU Flash",
    ],
    dateSaved: "2026-03-20",
    aiResult:
      "Safe - Compatible upgrades with minimal risk",
  },
];

export default function CustomerMyBuilds() {
  const [builds, setBuilds] = useState(initialBuilds);
  const [selectedBuild, setSelectedBuild] =
    useState(null);

  const [modalType, setModalType] =
    useState(null);

  const [shareData, setShareData] = useState({
    description: "",
    estimatedCost: "",
    difficultyLevel: "Intermediate",
    safetyNotes: "",
  });

  const [buildName, setBuildName] = useState("");

  const openModal = (type) => {
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
  };

  const handleDelete = () => {
    if (!selectedBuild) return;

    setBuilds((previous) =>
      previous.filter(
        (build) => build.id !== selectedBuild.id
      )
    );

    setSelectedBuild(null);
    setModalType(null);
  };

  const handleSaveEdit = () => {
    setModalType(null);

    Alert.alert(
      "Build Updated",
      "Your build changes have been saved."
    );
  };

  const handleShare = () => {
    if (
      !shareData.description.trim() ||
      !shareData.estimatedCost.trim()
    ) {
      Alert.alert(
        "Required Fields",
        "Please provide a description and estimated cost."
      );
      return;
    }

    setModalType(null);

    setShareData({
      description: "",
      estimatedCost: "",
      difficultyLevel: "Intermediate",
      safetyNotes: "",
    });

    Alert.alert(
      "Build Shared",
      "Your build is now available in Community Builds."
    );
  };

  const handleRequestService = () => {
    setModalType(null);

    Alert.alert(
      "Request Service",
      "This build will be used for a Custom Build Installation service request.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Continue",
          onPress: () => {},
        },
      ]
    );
  };

  return (
    <CustomerLayout title="My Builds">
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>
            My Builds
          </Text>

          <Text style={styles.pageSubtitle}>
            Saved motorcycle configurations and AI recommendations
          </Text>
        </View>

        {/* Saved Builds */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Saved Builds
              </Text>

              <Text style={styles.sectionSubtitle}>
                {builds.length} build
                {builds.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>

          {builds.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>
                ▣
              </Text>

              <Text style={styles.emptyTitle}>
                No Saved Builds
              </Text>

              <Text style={styles.emptyText}>
                Your saved AI recommendations and custom
                builds will appear here.
              </Text>
            </View>
          ) : (
            builds.map((build) => (
              <TouchableOpacity
                key={build.id}
                style={[
                  styles.buildListItem,
                  selectedBuild?.id === build.id &&
                    styles.buildListItemActive,
                ]}
                onPress={() =>
                  setSelectedBuild(build)
                }
                activeOpacity={0.85}
              >
                <View style={styles.buildListInfo}>
                  <Text style={styles.buildName}>
                    {build.motorcycleName}
                  </Text>

                  <Text style={styles.buildGoal}>
                    {build.goal}
                  </Text>

                  <Text style={styles.buildDate}>
                    Saved {build.dateSaved}
                  </Text>
                </View>

                <Text style={styles.chevron}>
                  ›
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Build Details */}
        {selectedBuild ? (
          <>
            {/* Header */}
            <View style={styles.card}>
              <View style={styles.detailHeader}>
                <View style={styles.detailHeaderInfo}>
                  <Text style={styles.detailTitle}>
                    {selectedBuild.motorcycleName}
                  </Text>

                  <Text style={styles.detailGoal}>
                    Goal: {selectedBuild.goal}
                  </Text>
                </View>

                <View style={styles.savedBadge}>
                  <Text style={styles.savedBadgeText}>
                    Saved {selectedBuild.dateSaved}
                  </Text>
                </View>
              </View>
            </View>

            {/* Selected Parts */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                Selected Parts
              </Text>

              <View style={styles.partsList}>
                {selectedBuild.parts.map(
                  (part, index) => (
                    <View
                      key={index}
                      style={styles.partRow}
                    >
                      <View style={styles.partNumber}>
                        <Text
                          style={
                            styles.partNumberText
                          }
                        >
                          {index + 1}
                        </Text>
                      </View>

                      <Text style={styles.partText}>
                        {part}
                      </Text>
                    </View>
                  )
                )}
              </View>
            </View>

            {/* AI Analysis */}
            {selectedBuild.aiResult && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>
                  AI Analysis
                </Text>

                <View style={styles.aiBox}>
                  <Text style={styles.aiText}>
                    {selectedBuild.aiResult}
                  </Text>
                </View>
              </View>
            )}

            {/* Actions */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                Actions
              </Text>

              <TouchableOpacity
                style={styles.fullActionButton}
                onPress={() => openModal("view")}
              >
                <Text style={styles.actionIcon}>
                  ◉
                </Text>

                <Text style={styles.actionText}>
                  View Full Details
                </Text>
              </TouchableOpacity>

              <View style={styles.actionGrid}>
                <TouchableOpacity
                  style={styles.grayAction}
                  onPress={() => openModal("edit")}
                >
                  <Text style={styles.actionIcon}>
                    ✎
                  </Text>

                  <Text style={styles.grayActionText}>
                    Edit Build
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.greenAction}
                  onPress={() => openModal("share")}
                >
                  <Text style={styles.actionIconLight}>
                    ↗
                  </Text>

                  <Text style={styles.actionTextLight}>
                    Share to Community
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.darkAction}
                  onPress={() =>
                    openModal("request")
                  }
                >
                  <Text style={styles.actionIconLight}>
                    →
                  </Text>

                  <Text style={styles.actionTextLight}>
                    Request Service
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.redAction}
                  onPress={() => openModal("delete")}
                >
                  <Text style={styles.actionIconLight}>
                    ×
                  </Text>

                  <Text style={styles.actionTextLight}>
                    Delete Build
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.selectPlaceholder}>
            <Text style={styles.placeholderIcon}>
              ←
            </Text>

            <Text style={styles.placeholderTitle}>
              Select a build
            </Text>

            <Text style={styles.placeholderText}>
              Select a saved build above to view its
              details.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* View Modal */}
      <Modal
        visible={modalType === "view"}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ModalHeader
              title="Build Details"
              onClose={closeModal}
            />

            {selectedBuild && (
              <>
                <Text style={styles.modalLabel}>
                  Motorcycle
                </Text>

                <Text style={styles.modalValue}>
                  {selectedBuild.motorcycleName}
                </Text>

                <Text style={styles.modalLabel}>
                  Goal
                </Text>

                <Text style={styles.modalValue}>
                  {selectedBuild.goal}
                </Text>

                <Text style={styles.modalLabel}>
                  Saved On
                </Text>

                <Text style={styles.modalValue}>
                  {selectedBuild.dateSaved}
                </Text>

                <Text style={styles.modalLabel}>
                  Parts Selected
                </Text>

                {selectedBuild.parts.map(
                  (part, index) => (
                    <Text
                      key={index}
                      style={styles.modalPart}
                    >
                      • {part}
                    </Text>
                  )
                )}
              </>
            )}

            <TouchableOpacity
              style={styles.modalDarkButton}
              onPress={closeModal}
            >
              <Text style={styles.modalDarkButtonText}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={modalType === "edit"}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ModalHeader
              title="Edit Build"
              onClose={closeModal}
            />

            <Text style={styles.modalLabel}>
              Goal
            </Text>

            <TextInput
              defaultValue={
                selectedBuild?.goal || ""
              }
              style={styles.input}
              placeholder="Build goal"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.modalLabel}>
              Add Notes
            </Text>

            <TextInput
              style={[
                styles.input,
                styles.textArea,
              ]}
              placeholder="Additional notes..."
              placeholderTextColor="#9ca3af"
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.modalDarkButton}
              onPress={handleSaveEdit}
            >
              <Text style={styles.modalDarkButtonText}>
                Save Changes
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Request Service Modal */}
      <Modal
        visible={modalType === "request"}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ModalHeader
              title="Request Service"
              onClose={closeModal}
            />

            <Text style={styles.modalDescription}>
              Use this saved build for a Custom Build
              Installation service request.
            </Text>

            {selectedBuild && (
              <View style={styles.confirmBox}>
                <Text style={styles.confirmLabel}>
                  Motorcycle
                </Text>

                <Text style={styles.confirmValue}>
                  {selectedBuild.motorcycleName}
                </Text>

                <Text style={styles.confirmLabel}>
                  Goal
                </Text>

                <Text style={styles.confirmValue}>
                  {selectedBuild.goal}
                </Text>

                <Text style={styles.confirmLabel}>
                  Parts
                </Text>

                {selectedBuild.parts.map(
                  (part, index) => (
                    <Text
                      key={index}
                      style={styles.confirmPart}
                    >
                      • {part}
                    </Text>
                  )
                )}
              </View>
            )}

            <Text style={styles.modalDescription}>
              You can continue to the service request
              page to choose your preferred schedule.
            </Text>

            <TouchableOpacity
              style={styles.modalDarkButton}
              onPress={handleRequestService}
            >
              <Text style={styles.modalDarkButtonText}>
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Modal */}
      <Modal
        visible={modalType === "delete"}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ModalHeader
              title="Delete Build"
              onClose={closeModal}
            />

            <Text style={styles.modalDescription}>
              Are you sure you want to delete{" "}
              <Text style={styles.boldText}>
                {selectedBuild?.motorcycleName}
              </Text>
              ? This action cannot be undone.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeModal}
              >
                <Text style={styles.cancelText}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <Text style={styles.deleteButtonText}>
                  Delete Permanently
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Share Modal */}
      <Modal
        visible={modalType === "share"}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ModalHeader
              title="Share to Community"
              onClose={closeModal}
            />

            <Text style={styles.modalDescription}>
              Share your build with the community so
              other riders can view and interact with it.
            </Text>

            <Text style={styles.modalLabel}>
              Description *
            </Text>

            <TextInput
              value={shareData.description}
              onChangeText={(text) =>
                setShareData({
                  ...shareData,
                  description: text,
                })
              }
              style={[
                styles.input,
                styles.textArea,
              ]}
              placeholder="Describe your build, modifications, and performance gains..."
              placeholderTextColor="#9ca3af"
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.modalLabel}>
              Estimated Cost (₱) *
            </Text>

            <TextInput
              value={shareData.estimatedCost}
              onChangeText={(text) =>
                setShareData({
                  ...shareData,
                  estimatedCost: text,
                })
              }
              style={styles.input}
              placeholder="50000"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />

            <Text style={styles.modalLabel}>
              Difficulty Level
            </Text>

            <View style={styles.difficultyRow}>
              {[
                "Beginner",
                "Intermediate",
                "Advanced",
              ].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.difficultyButton,
                    shareData.difficultyLevel ===
                      level &&
                      styles.difficultyButtonActive,
                  ]}
                  onPress={() =>
                    setShareData({
                      ...shareData,
                      difficultyLevel: level,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.difficultyText,
                      shareData.difficultyLevel ===
                        level &&
                        styles.difficultyTextActive,
                    ]}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>
              Safety Notes
            </Text>

            <TextInput
              value={shareData.safetyNotes}
              onChangeText={(text) =>
                setShareData({
                  ...shareData,
                  safetyNotes: text,
                })
              }
              style={[
                styles.input,
                styles.textAreaSmall,
              ]}
              placeholder="Important safety considerations..."
              placeholderTextColor="#9ca3af"
              multiline
              textAlignVertical="top"
            />

            {selectedBuild && (
              <View style={styles.sharePreview}>
                <Text style={styles.sharePreviewText}>
                  <Text style={styles.boldText}>
                    Build Preview:
                  </Text>{" "}
                  {selectedBuild.motorcycleName} •{" "}
                  {selectedBuild.goal} •{" "}
                  {selectedBuild.parts.length} parts
                </Text>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeModal}
              >
                <Text style={styles.cancelText}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.shareButton,
                  (!shareData.description ||
                    !shareData.estimatedCost) &&
                    styles.disabledButton,
                ]}
                onPress={handleShare}
                disabled={
                  !shareData.description ||
                  !shareData.estimatedCost
                }
              >
                <Text style={styles.shareButtonText}>
                  Share Build
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </CustomerLayout>
  );
}

function ModalHeader({ title, onClose }) {
  return (
    <View style={styles.modalHeader}>
      <Text style={styles.modalTitle}>
        {title}
      </Text>

      <TouchableOpacity onPress={onClose}>
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  pageHeader: {
    marginBottom: 14,
  },

  pageTitle: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "700",
  },

  pageSubtitle: {
    color: "#6b7280",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
    marginBottom: 14,
  },

  cardHeader: {
    paddingBottom: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginBottom: 4,
  },

  sectionTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
  },

  sectionSubtitle: {
    color: "#6b7280",
    fontSize: 11,
    marginTop: 4,
  },

  buildListItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },

  buildListItemActive: {
    backgroundColor: "#f9fafb",
    marginHorizontal: -8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },

  buildListInfo: {
    flex: 1,
  },

  buildName: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
  },

  buildGoal: {
    color: "#4b5563",
    fontSize: 12,
    marginTop: 4,
  },

  buildDate: {
    color: "#9ca3af",
    fontSize: 10,
    marginTop: 5,
  },

  chevron: {
    color: "#9ca3af",
    fontSize: 24,
    marginLeft: 10,
  },

  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },

  detailHeaderInfo: {
    flex: 1,
  },

  detailTitle: {
    color: "#111827",
    fontSize: 19,
    fontWeight: "700",
  },

  detailGoal: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 5,
  },

  savedBadge: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  savedBadgeText: {
    color: "#374151",
    fontSize: 10,
    fontWeight: "600",
  },

  partsList: {
    marginTop: 12,
  },

  partRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 9,
    padding: 10,
    marginBottom: 7,
  },

  partNumber: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  partNumberText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },

  partText: {
    flex: 1,
    color: "#374151",
    fontSize: 12,
  },

  aiBox: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 9,
    padding: 12,
    marginTop: 10,
  },

  aiText: {
    color: "#111827",
    fontSize: 12,
    lineHeight: 18,
  },

  fullActionButton: {
    minHeight: 45,
    borderRadius: 9,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 11,
  },

  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginTop: 9,
  },

  grayAction: {
    width: "48%",
    minHeight: 47,
    borderRadius: 9,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 8,
  },

  greenAction: {
    width: "48%",
    minHeight: 47,
    borderRadius: 9,
    backgroundColor: "#16a34a",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 8,
  },

  darkAction: {
    width: "48%",
    minHeight: 47,
    borderRadius: 9,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 8,
  },

  redAction: {
    width: "48%",
    minHeight: 47,
    borderRadius: 9,
    backgroundColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 8,
  },

  actionIcon: {
    color: "#374151",
    fontSize: 15,
    marginRight: 7,
  },

  actionIconLight: {
    color: "#ffffff",
    fontSize: 15,
    marginRight: 7,
  },

  actionText: {
    color: "#374151",
    fontSize: 11,
    fontWeight: "600",
  },

  grayActionText: {
    color: "#374151",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },

  actionTextLight: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 35,
  },

  emptyIcon: {
    color: "#9ca3af",
    fontSize: 28,
    marginBottom: 10,
  },

  emptyTitle: {
    color: "#374151",
    fontSize: 15,
    fontWeight: "600",
  },

  emptyText: {
    color: "#9ca3af",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 5,
    maxWidth: 260,
  },

  selectPlaceholder: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 35,
    alignItems: "center",
    marginBottom: 14,
  },

  placeholderIcon: {
    color: "#9ca3af",
    fontSize: 24,
    marginBottom: 8,
  },

  placeholderTitle: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },

  placeholderText: {
    color: "#9ca3af",
    fontSize: 11,
    marginTop: 5,
    textAlign: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 18,
  },

  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    maxHeight: "90%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  modalTitle: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "700",
  },

  closeText: {
    color: "#6b7280",
    fontSize: 27,
    lineHeight: 27,
  },

  modalLabel: {
    color: "#6b7280",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
    textTransform: "uppercase",
  },

  modalValue: {
    color: "#111827",
    fontSize: 13,
    marginBottom: 6,
  },

  modalPart: {
    color: "#374151",
    fontSize: 12,
    marginBottom: 4,
  },

  modalDescription: {
    color: "#6b7280",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },

  input: {
    minHeight: 45,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 9,
    paddingHorizontal: 12,
    color: "#111827",
    fontSize: 12,
  },

  textArea: {
    minHeight: 85,
    paddingTop: 10,
  },

  textAreaSmall: {
    minHeight: 65,
    paddingTop: 10,
  },

  modalDarkButton: {
    minHeight: 45,
    backgroundColor: "#111827",
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },

  modalDarkButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },

  confirmBox: {
    backgroundColor: "#f9fafb",
    borderRadius: 9,
    padding: 12,
    marginVertical: 10,
  },

  confirmLabel: {
    color: "#6b7280",
    fontSize: 10,
    marginBottom: 3,
    marginTop: 5,
  },

  confirmValue: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "600",
  },

  confirmPart: {
    color: "#374151",
    fontSize: 11,
    lineHeight: 17,
  },

  modalActions: {
    flexDirection: "row",
    gap: 9,
    marginTop: 15,
  },

  cancelButton: {
    flex: 1,
    minHeight: 45,
    borderRadius: 9,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "600",
  },

  deleteButton: {
    flex: 1,
    minHeight: 45,
    borderRadius: 9,
    backgroundColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },

  difficultyRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },

  difficultyButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 8,
  },

  difficultyButtonActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },

  difficultyText: {
    color: "#4b5563",
    fontSize: 10,
  },

  difficultyTextActive: {
    color: "#ffffff",
  },

  sharePreview: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 9,
    padding: 10,
    marginTop: 12,
  },

  sharePreviewText: {
    color: "#166534",
    fontSize: 11,
    lineHeight: 17,
  },

  shareButton: {
    flex: 1,
    minHeight: 45,
    borderRadius: 9,
    backgroundColor: "#16a34a",
    alignItems: "center",
    justifyContent: "center",
  },

  shareButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },

  disabledButton: {
    backgroundColor: "#d1d5db",
  },

  boldText: {
    fontWeight: "700",
    color: "#111827",
  },
});