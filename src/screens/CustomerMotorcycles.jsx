import { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import CustomerLayout from "../components/CustomerLayout";

import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "../firebase";

export default function CustomerMotorcycles() {
  const [currentUser, setCurrentUser] = useState(null);
  const [motorcycles, setMotorcycles] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [editingMoto, setEditingMoto] = useState(null);
  const [deletingMoto, setDeletingMoto] = useState(null);

  const [deleteReason, setDeleteReason] = useState("");
  const [saving, setSaving] = useState(false);

  const [motorcycleData, setMotorcycleData] = useState({
    brand: "",
    model: "",
    year: "",
    plate: "",
    vin: "",
    color: "",
  });

  /*
   * FIREBASE AUTH LISTENER
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setCurrentUser(user || null);
      }
    );

    return unsubscribe;
  }, []);

  /*
   * FIREBASE MOTORCYCLE LISTENER
   */
  useEffect(() => {
    if (!currentUser?.uid) {
      setMotorcycles([]);
      return undefined;
    }

    const motorcyclesQuery = query(
      collection(db, "motorcycles"),
      where("customerId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      motorcyclesQuery,
      (snapshot) => {
        const firebaseMotorcycles =
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }));

        setMotorcycles(firebaseMotorcycles);
      },
      (error) => {
        console.error(
          "Error loading motorcycles:",
          error
        );

        setMotorcycles([]);
      }
    );

    return unsubscribe;
  }, [currentUser?.uid]);

  const resetForm = () => {
    setMotorcycleData({
      brand: "",
      model: "",
      year: "",
      plate: "",
      vin: "",
      color: "",
    });

    setEditingMoto(null);
    setShowForm(false);
  };

  const handleEdit = (moto) => {
    setEditingMoto(moto);

    setMotorcycleData({
      brand: moto.brand || "",
      model: moto.model || "",
      year: moto.year ? String(moto.year) : "",
      plate: moto.plate || "",
      vin: moto.vin || "",
      color: moto.color || "",
    });

    setShowForm(true);
  };

  const handleSave = async () => {
    if (
      !currentUser?.uid ||
      !motorcycleData.brand.trim() ||
      !motorcycleData.model.trim() ||
      !motorcycleData.year.trim() ||
      !motorcycleData.plate.trim()
    ) {
      return;
    }

    try {
      setSaving(true);

      const data = {
        brand: motorcycleData.brand.trim(),
        model: motorcycleData.model.trim(),
        year: Number(motorcycleData.year),
        plate: motorcycleData.plate.trim(),
        vin: motorcycleData.vin.trim(),
        color: motorcycleData.color.trim(),
        customerId: currentUser.uid,
        customerUid: currentUser.uid,
        customerEmail: currentUser.email || "",
        updatedAt: serverTimestamp(),
      };

      if (editingMoto) {
        const motorcycleRef = doc(
          db,
          "motorcycles",
          editingMoto.id
        );

        await updateDoc(motorcycleRef, data);
      } else {
        await addDoc(collection(db, "motorcycles"), {
          ...data,
          deletionRequest: null,
          createdAt: serverTimestamp(),
        });
      }

      resetForm();
    } catch (error) {
      console.error(
        "Error saving motorcycle:",
        error
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (moto) => {
    setDeletingMoto(moto);
    setDeleteReason("");
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (
      !deleteReason.trim() ||
      !deletingMoto ||
      !currentUser?.uid
    ) {
      return;
    }

    try {
      setSaving(true);

      const motorcycleRef = doc(
        db,
        "motorcycles",
        deletingMoto.id
      );

      await updateDoc(motorcycleRef, {
        deletionRequest: {
          status: "pending",
          reason: deleteReason.trim(),
          requestedAt: serverTimestamp(),
          requestedBy: currentUser.uid,
        },
        updatedAt: serverTimestamp(),
      });

      setShowDeleteModal(false);
      setDeletingMoto(null);
      setDeleteReason("");
    } catch (error) {
      console.error(
        "Error requesting motorcycle deletion:",
        error
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <CustomerLayout title="My Motorcycles">
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageTitle}>
              Registered Motorcycles
            </Text>

            <Text style={styles.pageSubtitle}>
              Manage your motorcycles and their details.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setEditingMoto(null);

              setMotorcycleData({
                brand: "",
                model: "",
                year: "",
                plate: "",
                vin: "",
                color: "",
              });

              setShowForm(true);
            }}
            activeOpacity={0.9}
          >
            <Text style={styles.addButtonText}>
              + Add Motorcycle
            </Text>
          </TouchableOpacity>
        </View>

        {/* Empty State */}
        {motorcycles.length === 0 && (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>
                🏍
              </Text>
            </View>

            <Text style={styles.emptyTitle}>
              No motorcycles registered
            </Text>

            <Text style={styles.emptyText}>
              Add your motorcycle to start managing its
              details, services, and maintenance records.
            </Text>

            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={() => {
                setEditingMoto(null);
                setShowForm(true);
              }}
            >
              <Text style={styles.emptyAddText}>
                Add Motorcycle
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Motorcycle Cards */}
        {motorcycles.map((moto) => (
          <View
            key={moto.id}
            style={styles.motorcycleCard}
          >
            <View style={styles.cardTop}>
              <View style={styles.bikeIcon}>
                <Text style={styles.bikeIconText}>
                  🏍
                </Text>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEdit(moto)}
                >
                  <Text style={styles.editText}>
                    Edit
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() =>
                    handleDeleteClick(moto)
                  }
                >
                  <Text style={styles.deleteText}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.motorcycleName}>
              {moto.brand} {moto.model}
            </Text>

            {moto.deletionRequest?.status ===
              "pending" && (
              <View style={styles.pendingDeletionBox}>
                <Text style={styles.pendingDeletionText}>
                  Deletion request pending admin approval.
                </Text>
              </View>
            )}

            <View style={styles.details}>
              <DetailRow
                label="Year"
                value={String(moto.year)}
              />

              <DetailRow
                label="Plate"
                value={moto.plate}
              />

              <DetailRow
                label="VIN"
                value={moto.vin || "—"}
              />

              <DetailRow
                label="Color"
                value={moto.color || "—"}
              />
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add / Edit Modal */}
      <Modal
        visible={showForm}
        transparent
        animationType="fade"
        onRequestClose={resetForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingMoto
                    ? "Edit Motorcycle"
                    : "Add Motorcycle"}
                </Text>

                <TouchableOpacity
                  onPress={resetForm}
                >
                  <Text style={styles.closeButton}>
                    ×
                  </Text>
                </TouchableOpacity>
              </View>

              <FormField
                label="Brand *"
                value={motorcycleData.brand}
                placeholder="e.g., Honda, Yamaha"
                onChangeText={(value) =>
                  setMotorcycleData((prev) => ({
                    ...prev,
                    brand: value,
                  }))
                }
              />

              <FormField
                label="Model *"
                value={motorcycleData.model}
                placeholder="e.g., CBR600RR"
                onChangeText={(value) =>
                  setMotorcycleData((prev) => ({
                    ...prev,
                    model: value,
                  }))
                }
              />

              <FormField
                label="Year *"
                value={motorcycleData.year}
                placeholder="e.g., 2022"
                keyboardType="number-pad"
                onChangeText={(value) =>
                  setMotorcycleData((prev) => ({
                    ...prev,
                    year: value.replace(/\D/g, ""),
                  }))
                }
              />

              <FormField
                label="License Plate *"
                value={motorcycleData.plate}
                placeholder="e.g., ABC-123"
                onChangeText={(value) =>
                  setMotorcycleData((prev) => ({
                    ...prev,
                    plate: value,
                  }))
                }
              />

              <FormField
                label="VIN"
                value={motorcycleData.vin}
                placeholder="Vehicle Identification Number"
                onChangeText={(value) =>
                  setMotorcycleData((prev) => ({
                    ...prev,
                    vin: value,
                  }))
                }
              />

              <FormField
                label="Color"
                value={motorcycleData.color}
                placeholder="e.g., Red"
                onChangeText={(value) =>
                  setMotorcycleData((prev) => ({
                    ...prev,
                    color: value,
                  }))
                }
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={resetForm}
                  disabled={saving}
                >
                  <Text style={styles.cancelButtonText}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    saving &&
                      styles.disabledButton,
                  ]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  <Text style={styles.saveButtonText}>
                    {saving
                      ? "Saving..."
                      : editingMoto
                      ? "Update"
                      : "Save"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowDeleteModal(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalCard}>
            <View style={styles.deleteHeader}>
              <Text style={styles.deleteTitle}>
                Request Motorcycle Deletion
              </Text>

              <TouchableOpacity
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeletingMoto(null);
                  setDeleteReason("");
                }}
              >
                <Text style={styles.closeButton}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            {deletingMoto && (
              <View style={styles.deletingMotoBox}>
                <Text style={styles.deletingLabel}>
                  Motorcycle to Delete
                </Text>

                <Text style={styles.deletingName}>
                  {deletingMoto.brand}{" "}
                  {deletingMoto.model} (
                  {deletingMoto.year})
                </Text>

                <Text style={styles.deletingPlate}>
                  Plate: {deletingMoto.plate}
                </Text>
              </View>
            )}

            <Text style={styles.reasonLabel}>
              Reason for Deletion *
            </Text>

            <TextInput
              value={deleteReason}
              onChangeText={setDeleteReason}
              style={styles.reasonInput}
              placeholder="Please explain why you want to delete this motorcycle..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                This deletion request will be sent to
                admin for approval. The motorcycle will
                remain in your account until approved.
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeletingMoto(null);
                  setDeleteReason("");
                }}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitDeleteButton,
                  saving &&
                    styles.disabledDeleteButton,
                ]}
                onPress={handleConfirmDelete}
                disabled={saving}
              >
                <Text style={styles.submitDeleteText}>
                  {saving
                    ? "Submitting..."
                    : "Submit Request"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </CustomerLayout>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>
        {label}
      </Text>

      <Text style={styles.detailValue}>
        {value}
      </Text>
    </View>
  );
}

function FormField({
  label,
  value,
  placeholder,
  onChangeText,
  keyboardType,
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        keyboardType={keyboardType || "default"}
        style={styles.input}
        autoCapitalize="words"
      />
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
    marginBottom: 18,
  },

  pageTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  pageSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
    marginBottom: 14,
  },

  addButton: {
    alignSelf: "flex-start",
    backgroundColor: "#1f2937",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },

  addButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },

  emptyCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    padding: 28,
    alignItems: "center",
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  emptyIconText: {
    fontSize: 25,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 7,
  },

  emptyText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 18,
  },

  emptyAddButton: {
    backgroundColor: "#111827",
    borderRadius: 9,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },

  emptyAddText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },

  motorcycleCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  bikeIcon: {
    width: 48,
    height: 48,
    borderRadius: 11,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },

  bikeIconText: {
    fontSize: 22,
  },

  cardActions: {
    flexDirection: "row",
    gap: 7,
  },

  editButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },

  editText: {
    color: "#374151",
    fontSize: 11,
    fontWeight: "600",
  },

  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: "#fef2f2",
  },

  deleteText: {
    color: "#dc2626",
    fontSize: 11,
    fontWeight: "600",
  },

  motorcycleName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginTop: 14,
    marginBottom: 12,
  },

  pendingDeletionBox: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 8,
    padding: 9,
    marginBottom: 12,
  },

  pendingDeletionText: {
    fontSize: 10,
    color: "#92400e",
  },

  details: {
    gap: 8,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  detailLabel: {
    fontSize: 12,
    color: "#6b7280",
  },

  detailValue: {
    flex: 1,
    fontSize: 12,
    color: "#111827",
    fontWeight: "600",
    textAlign: "right",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 16,
  },

  modalCard: {
    width: "100%",
    maxHeight: "90%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
  },

  deleteModalCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  deleteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  deleteTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#dc2626",
    marginRight: 12,
  },

  closeButton: {
    fontSize: 28,
    color: "#6b7280",
    lineHeight: 28,
  },

  field: {
    marginBottom: 15,
  },

  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },

  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 9,
    paddingHorizontal: 13,
    fontSize: 13,
    color: "#111827",
    backgroundColor: "#ffffff",
  },

  modalButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },

  cancelButton: {
    flex: 1,
    backgroundColor: "#e5e7eb",
    borderRadius: 9,
    paddingVertical: 12,
    alignItems: "center",
  },

  cancelButtonText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "600",
  },

  saveButton: {
    flex: 1,
    backgroundColor: "#1f2937",
    borderRadius: 9,
    paddingVertical: 12,
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },

  deletingMotoBox: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },

  deletingLabel: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 5,
  },

  deletingName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },

  deletingPlate: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 3,
  },

  reasonLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 7,
  },

  reasonInput: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 9,
    padding: 12,
    fontSize: 13,
    color: "#111827",
    marginBottom: 12,
  },

  warningBox: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 9,
    padding: 11,
    marginBottom: 6,
  },

  warningText: {
    fontSize: 11,
    lineHeight: 17,
    color: "#92400e",
  },

  submitDeleteButton: {
    flex: 1,
    backgroundColor: "#dc2626",
    borderRadius: 9,
    paddingVertical: 12,
    alignItems: "center",
  },

  disabledDeleteButton: {
    opacity: 0.6,
  },

  submitDeleteText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
});