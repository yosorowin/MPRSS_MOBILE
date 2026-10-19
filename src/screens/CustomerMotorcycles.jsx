import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
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
import { auth, db } from "../firebase";

const BRAND_OPTIONS = [
  "Honda",
  "Yamaha",
  "Suzuki",
  "Kawasaki",
  "KTM",
  "Kymco",
  "TVS",
  "SYM",
  "Euro Motor",
  "Keeway",
  "CFMOTO",
  "Benelli",
  "Royal Enfield",
  "Vespa",
  "BMW",
  "Ducati",
  "Triumph",
  "Harley-Davidson",
  "Other",
];

const MODEL_OPTIONS = {
  Honda: [
    "Click 125i",
    "Click 160",
    "ADV 160",
    "PCX 160",
    "Beat",
    "Beat Premium",
    "Airblade 160",
    "XRM 125",
    "TMX 125 Alpha",
    "CB150R",
    "CBR150R",
    "Other",
  ],

  Yamaha: [
    "Mio i125",
    "Mio Gear",
    "Mio Gravis",
    "NMAX",
    "Aerox",
    "Fazzio",
    "Sniper 155",
    "MT-15",
    "YZF-R15",
    "Other",
  ],

  Suzuki: [
    "Raider R150",
    "Burgman Street",
    "Avenis 125",
    "Skydrive Sport",
    "Smash",
    "Gixxer",
    "GSX-R150",
    "Other",
  ],

  Kawasaki: [
    "Barako II",
    "Rouser NS160",
    "Rouser NS200",
    "Ninja 400",
    "Ninja 650",
    "Z400",
    "Z650",
    "Other",
  ],

  KTM: [
    "Duke 200",
    "Duke 390",
    "RC 200",
    "RC 390",
    "390 Adventure",
    "Other",
  ],

  Kymco: [
    "Like 125",
    "KRV 180i",
    "AK 550",
    "X-Town 300i",
    "Other",
  ],

  TVS: [
    "NTORQ 125",
    "Apache RTR 160",
    "Apache RTR 200",
    "XL100",
    "King Deluxe",
    "Other",
  ],

  SYM: [
    "Jet 4 RX",
    "Tuscany 150",
    "Naga 155",
    "Cruisym GT 150",
    "Husky 150",
    "Cruisym 400",
    "ADX TG 400",
    "Maxsym TL 508",
    "VF3i 185 V3",
    "Other",
  ],

  "Euro Motor": [
    "EZ 125 EFI",
    "Samurai 155i",
    "Griffin 180i",
    "Falcon 180i",
    "Peak 110",
    "Sport E 110 V2",
    "Rock R 125 V3",
    "Marvel 125",
    "Vperman 150i",
    "Other",
  ],

  Keeway: [
    "Icon 110",
    "Icon 125i",
    "Other",
  ],

  CFMOTO: [
    "300SR",
    "300NK",
    "450SR",
    "450NK",
    "650MT",
    "650NK",
    "Other",
  ],

  Benelli: [
    "RFS 150i",
    "Leoncino 250",
    "302S",
    "TNT 600i",
    "Other",
  ],

  "Royal Enfield": [
    "Classic 350",
    "Meteor 350",
    "Hunter 350",
    "Interceptor 650",
    "Continental GT 650",
    "Other",
  ],

  Vespa: [
    "S 125",
    "Primavera 150",
    "Sprint 150",
    "GTS 300",
    "Other",
  ],

  BMW: [
    "G 310 R",
    "G 310 GS",
    "C 400 GT",
    "F 900 R",
    "Other",
  ],

  Ducati: [
    "Monster",
    "Panigale V2",
    "Panigale V4",
    "Scrambler",
    "Other",
  ],

  Triumph: [
    "Speed 400",
    "Scrambler 400 X",
    "Street Triple",
    "Bonneville T100",
    "Other",
  ],

  "Harley-Davidson": [
    "Iron 883",
    "Sportster S",
    "Nightster",
    "Street Bob",
    "Other",
  ],

  Other: [
    "Other",
  ],
};

const COLOR_OPTIONS = [
  "Black",
  "White",
  "Red",
  "Blue",
  "Gray",
  "Silver",
  "Green",
  "Yellow",
  "Orange",
  "Brown",
  "Gold",
  "Purple",
  "Other",
];

const CURRENT_YEAR = new Date().getFullYear();

const YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR - 1990 + 1 },
  (_, index) => String(CURRENT_YEAR - index)
);

function DropdownField({
  label,
  value,
  placeholder,
  options,
  onChange,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Text style={styles.label}>
        {label} <Text style={styles.required}>*</Text>
      </Text>

      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setVisible(true)}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.dropdownText,
            !value && styles.dropdownPlaceholder,
          ]}
        >
          {value || placeholder}
        </Text>

        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <TouchableOpacity
            style={styles.dropdownMenu}
            activeOpacity={1}
            onPress={() => {}}
          >
            <Text style={styles.dropdownTitle}>{label}</Text>

            <ScrollView
              style={styles.dropdownScroll}
              showsVerticalScrollIndicator={false}
            >
              {options.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.dropdownOption,
                    value === option &&
                      styles.dropdownOptionSelected,
                  ]}
                  onPress={() => {
                    onChange(option);
                    setVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      value === option &&
                        styles.dropdownOptionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

export default function CustomerMotorcycles() {
  const [currentUser, setCurrentUser] = useState(null);
  const [motorcycles, setMotorcycles] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingMotorcycle, setEditingMotorcycle] = useState(null);

  const [showDeleteRequestModal, setShowDeleteRequestModal] =
    useState(false);

  const [deletionMotorcycle, setDeletionMotorcycle] =
    useState(null);

  const [deletionReason, setDeletionReason] = useState("");

  const [motorcycleData, setMotorcycleData] = useState({
    brand: "",
    model: "",
    year: "",
    plate: "",
    color: "",
  });

  const [catalogBrands, setCatalogBrands] = useState([]);
  const [catalogModels, setCatalogModels] = useState({});

  const [loading, setLoading] = useState(false);
  const [deletionLoading, setDeletionLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const catalogRef = collection(db, "motorcycleCatalog");

    const initializeCatalog = async () => {
      try {
        const snapshot = await getDocs(catalogRef);

        const existingBrands = new Set(
          snapshot.docs.map((item) => item.data()?.brand)
        );

        for (const brand of BRAND_OPTIONS) {
          if (!existingBrands.has(brand)) {
            await setDoc(doc(catalogRef, brand), {
              brand,
              models: MODEL_OPTIONS[brand] || ["Other"],
              status: "active",
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        }
      } catch (error) {
        console.error(
          "Motorcycle catalog initialization error:",
          error
        );
      }
    };

    initializeCatalog();

    const unsubscribe = onSnapshot(
      catalogRef,
      (snapshot) => {
        const brands = [];
        const models = {};

        snapshot.docs.forEach((item) => {
          const data = item.data();

          if (!data?.brand) return;

          if (data.status === "inactive") return;

          brands.push(data.brand);

          models[data.brand] = Array.isArray(data.models)
            ? data.models
            : ["Other"];
        });

        brands.sort(
          (a, b) =>
            BRAND_OPTIONS.indexOf(a) - BRAND_OPTIONS.indexOf(b)
        );

        setCatalogBrands(brands);
        setCatalogModels(models);
      },
      (error) => {
        console.error(
          "Motorcycle catalog listener error:",
          error
        );
      }
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!currentUser?.uid) {
      setMotorcycles([]);
      return;
    }

    const q = query(
      collection(db, "motorcycles"),
      where("customerId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const motorcycleList = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setMotorcycles(motorcycleList);
      },
      (error) => {
        console.error("Motorcycles listener error:", error);
      }
    );

    return unsubscribe;
  }, [currentUser]);

  const openAddModal = () => {
    setEditingMotorcycle(null);

    setMotorcycleData({
      brand: "",
      model: "",
      year: "",
      plate: "",
      color: "",
    });

    setShowModal(true);
  };

  const openEditModal = (motorcycle) => {
    setEditingMotorcycle(motorcycle);

    setMotorcycleData({
      brand: motorcycle.brand || "",
      model: motorcycle.model || "",
      year: motorcycle.year ? String(motorcycle.year) : "",
      plate: motorcycle.plate || "",
      color: motorcycle.color || "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (loading) return;

    setShowModal(false);
    setEditingMotorcycle(null);

    setMotorcycleData({
      brand: "",
      model: "",
      year: "",
      plate: "",
      color: "",
    });
  };

  const openDeleteRequestModal = (motorcycle) => {
    setDeletionMotorcycle(motorcycle);
    setDeletionReason("");
    setShowDeleteRequestModal(true);
  };

  const closeDeleteRequestModal = () => {
    if (deletionLoading) return;

    setShowDeleteRequestModal(false);
    setDeletionMotorcycle(null);
    setDeletionReason("");
  };

  const handleBrandChange = (brand) => {
    setMotorcycleData((prev) => ({
      ...prev,
      brand,
      model: "",
    }));
  };

  const handleSave = async () => {
    if (!currentUser?.uid) return;

    const brand = motorcycleData.brand.trim();
    const model = motorcycleData.model.trim();
    const year = motorcycleData.year.trim();
    const plate = motorcycleData.plate.trim();
    const color = motorcycleData.color.trim();

    if (!brand || !model || !year || !plate || !color) {
      return;
    }

    setLoading(true);

    try {
      const data = {
        brand,
        model,
        year: Number(year),
        plate,
        color,
        customerId: currentUser.uid,
        customerUid: currentUser.uid,
        customerEmail: currentUser.email || "",
        updatedAt: serverTimestamp(),
      };

      if (editingMotorcycle?.id) {
        await updateDoc(
          doc(db, "motorcycles", editingMotorcycle.id),
          data
        );
      } else {
        await addDoc(collection(db, "motorcycles"), {
          ...data,
          createdAt: serverTimestamp(),
        });
      }

      closeModal();
    } catch (error) {
      console.error("Save motorcycle error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async () => {
    if (!currentUser?.uid) {
      Alert.alert(
        "Error",
        "You are not currently signed in."
      );
      return;
    }

    if (!deletionMotorcycle?.id) {
      Alert.alert(
        "Error",
        "The selected motorcycle could not be found."
      );
      return;
    }

    const reason = deletionReason.trim();

    if (!reason) {
      Alert.alert(
        "Reason Required",
        "Please provide a reason for the deletion request."
      );
      return;
    }

    setDeletionLoading(true);

    try {
      const requestData = {
        motorcycleId: deletionMotorcycle.id,

        customerId: currentUser.uid,
        customerUid: currentUser.uid,
        customerEmail: currentUser.email || "",

        motorcycleBrand:
          deletionMotorcycle.brand || "",
        motorcycleModel:
          deletionMotorcycle.model || "",
        motorcycleYear:
          deletionMotorcycle.year || "",
        motorcyclePlate:
          deletionMotorcycle.plate || "",
        motorcycleColor:
          deletionMotorcycle.color || "",

        reason,

        status: "pending",

        requestedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      console.log(
        "FIREBASE PROJECT:",
        db.app.options.projectId
      );

      console.log(
        "CREATING DELETION REQUEST:",
        requestData
      );

      const requestCollection = collection(
        db,
        "motorcycleDeletionRequests"
      );

      const requestRef = doc(requestCollection);

      console.log(
        "DELETION REQUEST DOCUMENT ID:",
        requestRef.id
      );

      await setDoc(requestRef, requestData);

      console.log(
        "DELETION REQUEST SUCCESSFULLY WRITTEN:",
        requestRef.id
      );

      // Notify the admin after the deletion request is safely saved.
      // A notification failure should not make the customer request fail.
      try {
        const motorcycleLabel = [
          deletionMotorcycle.brand,
          deletionMotorcycle.model,
          deletionMotorcycle.year,
        ]
          .filter(Boolean)
          .join(" ");

        await addDoc(collection(db, "notifications"), {
          recipientRole: "admin",
          type: "motorcycle_deletion",
          title: "Motorcycle Deletion Request",
          message: `${currentUser.displayName || currentUser.email || "A customer"} requested deletion of ${motorcycleLabel || "a motorcycle"}. Reason: ${reason}`,
          route: "/admin/motorcycle-deletions",
          relatedId: requestRef.id,
          requestId: requestRef.id,
          motorcycleId: deletionMotorcycle.id,
          customerId: currentUser.uid,
          customerName: currentUser.displayName || "",
          customerEmail: currentUser.email || "",
          read: false,
          createdAt: serverTimestamp(),
        });
      } catch (notificationError) {
        console.error(
          "MOTORCYCLE DELETION NOTIFICATION ERROR:",
          notificationError
        );
      }

      Alert.alert(
        "Request Sent",
        "The deletion request was successfully saved to Firebase."
      );

      closeDeleteRequestModal();
    } catch (error) {
      console.error(
        "DELETION REQUEST FIREBASE ERROR:",
        error
      );

      Alert.alert(
        "Request Failed",
        `${error.code || "Unknown error"}\n\n${
          error.message || "Unable to save the request."
        }`
      );
    } finally {
      setDeletionLoading(false);
    }
  };

  const getModelOptions = () => {
    const options =
      catalogModels[motorcycleData.brand] || [];

    if (
      motorcycleData.model &&
      !options.includes(motorcycleData.model)
    ) {
      return [motorcycleData.model, ...options];
    }

    return options;
  };

  return (
    <CustomerLayout title="My Motorcycles">
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {motorcycles.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              No motorcycles yet
            </Text>

            <Text style={styles.emptyText}>
              Add your motorcycle to start managing your services
              and maintenance records.
            </Text>

            <TouchableOpacity
              style={styles.emptyButton}
              onPress={openAddModal}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyButtonText}>
                Add Motorcycle
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.list}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={openAddModal}
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonText}>
                + Add Motorcycle
              </Text>
            </TouchableOpacity>

            {motorcycles.map((motorcycle) => (
              <View key={motorcycle.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <Text style={styles.cardTitle}>
                      {motorcycle.brand} {motorcycle.model}
                    </Text>

                    <Text style={styles.cardYear}>
                      {motorcycle.year}
                    </Text>
                  </View>

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => openEditModal(motorcycle)}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.editText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() =>
                        openDeleteRequestModal(motorcycle)
                      }
                      activeOpacity={0.75}
                    >
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>
                      Plate
                    </Text>

                    <Text style={styles.detailValue}>
                      {motorcycle.plate || "—"}
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>
                      Color
                    </Text>

                    <Text style={styles.detailValue}>
                      {motorcycle.color || "—"}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ADD / EDIT MOTORCYCLE MODAL */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingMotorcycle
                  ? "Edit Motorcycle"
                  : "Add Motorcycle"}
              </Text>

              <TouchableOpacity onPress={closeModal}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.formScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <DropdownField
                label="Brand"
                value={motorcycleData.brand}
                placeholder="Select brand"
                options={
                  catalogBrands.length > 0
                    ? catalogBrands
                    : BRAND_OPTIONS
                }
                onChange={handleBrandChange}
              />

              <DropdownField
                label="Model"
                value={motorcycleData.model}
                placeholder={
                  motorcycleData.brand
                    ? "Select model"
                    : "Select brand first"
                }
                options={getModelOptions()}
                onChange={(value) =>
                  setMotorcycleData((prev) => ({
                    ...prev,
                    model: value,
                  }))
                }
              />

              <DropdownField
                label="Year"
                value={motorcycleData.year}
                placeholder="Select year"
                options={YEAR_OPTIONS}
                onChange={(value) =>
                  setMotorcycleData((prev) => ({
                    ...prev,
                    year: value,
                  }))
                }
              />

              <FormField
                label="Plate Number"
                value={motorcycleData.plate}
                placeholder="Enter plate number"
                onChangeText={(value) =>
                  setMotorcycleData((prev) => ({
                    ...prev,
                    plate: value,
                  }))
                }
              />

              <DropdownField
                label="Color"
                value={motorcycleData.color}
                placeholder="Select color"
                options={COLOR_OPTIONS}
                onChange={(value) =>
                  setMotorcycleData((prev) => ({
                    ...prev,
                    color: value,
                  }))
                }
              />

              <Text style={styles.requiredNote}>
                * All fields are required.
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={closeModal}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    loading && styles.disabledButton,
                  ]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  <Text style={styles.saveButtonText}>
                    {loading
                      ? "Saving..."
                      : "Save Motorcycle"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* DELETE REQUEST MODAL */}
      <Modal
        visible={showDeleteRequestModal}
        transparent
        animationType="fade"
        onRequestClose={closeDeleteRequestModal}
      >
        <View style={styles.deleteRequestOverlay}>
          <View style={styles.deleteRequestContainer}>
            <View style={styles.deleteRequestHeader}>
              <Text style={styles.deleteRequestTitle}>
                Request Motorcycle Deletion
              </Text>

              <TouchableOpacity
                onPress={closeDeleteRequestModal}
                disabled={deletionLoading}
              >
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.deleteRequestDescription}>
              Your request will be sent to the administrator for
              review. The motorcycle will remain registered until
              the request is approved.
            </Text>

            {deletionMotorcycle && (
              <View style={styles.deleteMotorcycleInfo}>
                <Text style={styles.deleteMotorcycleName}>
                  {deletionMotorcycle.brand}{" "}
                  {deletionMotorcycle.model}
                </Text>

                <Text style={styles.deleteMotorcycleDetails}>
                  {deletionMotorcycle.year} •{" "}
                  {deletionMotorcycle.plate}
                </Text>
              </View>
            )}

            <Text style={styles.reasonLabel}>
              Reason for Deletion{" "}
              <Text style={styles.required}>*</Text>
            </Text>

            <TextInput
              style={styles.reasonInput}
              value={deletionReason}
              onChangeText={setDeletionReason}
              placeholder="Enter your reason for requesting deletion"
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              editable={!deletionLoading}
            />

            <Text style={styles.reasonNote}>
              Please provide a reason so the administrator can
              review your request.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeDeleteRequestModal}
                disabled={deletionLoading}
              >
                <Text style={styles.cancelButtonText}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.requestDeleteButton,
                  deletionLoading && styles.disabledButton,
                  !deletionReason.trim() &&
                    styles.disabledButton,
                ]}
                onPress={handleDeleteRequest}
                disabled={
                  deletionLoading || !deletionReason.trim()
                }
              >
                <Text style={styles.requestDeleteButtonText}>
                  {deletionLoading
                    ? "Sending..."
                    : "Send Request"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </CustomerLayout>
  );
}

function FormField({
  label,
  value,
  placeholder,
  onChangeText,
}) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>
        {label} <Text style={styles.required}>*</Text>
      </Text>

      <TextInput
        style={styles.input}
        value={value}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        onChangeText={onChangeText}
        autoCapitalize="characters"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 20,
  },

  emptyButton: {
    backgroundColor: "#111827",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  list: {
    gap: 16,
  },

  addButton: {
    backgroundColor: "#111827",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 0,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },

  cardTitleContainer: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  cardYear: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },

  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 10,
  },

  editButton: {
    minWidth: 62,
    minHeight: 34,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 9,
  },

  editText: {
    color: "#1D4ED8",
    fontSize: 12,
    fontWeight: "700",
  },

  deleteButton: {
    minWidth: 66,
    minHeight: 34,
    paddingHorizontal: 11,
    paddingVertical: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 9,
  },

  deleteText: {
    color: "#B91C1C",
    fontSize: 12,
    fontWeight: "700",
  },

  detailsRow: {
    flexDirection: "row",
    gap: 40,
  },

  detailItem: {
    minWidth: 100,
  },

  detailLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
  },

  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    padding: 20,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  closeButton: {
    fontSize: 30,
    lineHeight: 30,
    color: "#6B7280",
  },

  formScroll: {
    paddingBottom: 10,
  },

  fieldContainer: {
    marginBottom: 16,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 7,
  },

  required: {
    color: "#DC2626",
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },

  dropdown: {
    height: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },

  dropdownText: {
    fontSize: 14,
    color: "#111827",
  },

  dropdownPlaceholder: {
    color: "#9CA3AF",
  },

  dropdownArrow: {
    fontSize: 12,
    color: "#6B7280",
  },

  dropdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 25,
  },

  dropdownMenu: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    maxHeight: "70%",
    overflow: "hidden",
  },

  dropdownTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  dropdownScroll: {
    maxHeight: 400,
  },

  dropdownOption: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  dropdownOptionSelected: {
    backgroundColor: "#F3F4F6",
  },

  dropdownOptionText: {
    fontSize: 14,
    color: "#374151",
  },

  dropdownOptionTextSelected: {
    fontWeight: "700",
    color: "#111827",
  },

  requiredNote: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
    marginBottom: 18,
  },

  modalButtons: {
    flexDirection: "row",
    gap: 10,
    paddingBottom: 10,
  },

  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    color: "#374151",
    fontWeight: "600",
  },

  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  requestDeleteButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
  },

  requestDeleteButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  disabledButton: {
    opacity: 0.5,
  },

  deleteRequestOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },

  deleteRequestContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
  },

  deleteRequestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  deleteRequestTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginRight: 10,
  },

  deleteRequestDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 21,
    marginBottom: 16,
  },

  deleteMotorcycleInfo: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 14,
    marginBottom: 18,
  },

  deleteMotorcycleName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },

  deleteMotorcycleDetails: {
    fontSize: 13,
    color: "#6B7280",
  },

  reasonLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 7,
  },

  reasonInput: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },

  reasonNote: {
    fontSize: 12,
    color: "#9CA3AF",
    lineHeight: 18,
    marginTop: 7,
    marginBottom: 18,
  },
});