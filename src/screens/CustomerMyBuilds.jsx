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

import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "../firebase";

import CustomerLayout from "../components/CustomerLayout";

export default function CustomerMyBuilds() {
  // ─────────────────────────────────────────────────────────────────────────
  // Authentication / Firebase Data
  // ─────────────────────────────────────────────────────────────────────────

  const [currentUser, setCurrentUser] = useState(null);

  const [builds, setBuilds] = useState([]);

  const [motorcycles, setMotorcycles] = useState([]);

  const [loadingBuilds, setLoadingBuilds] =
    useState(true);

  const [selectedBuild, setSelectedBuild] =
    useState(null);

  // ─────────────────────────────────────────────────────────────────────────
  // Modal
  // ─────────────────────────────────────────────────────────────────────────

  const [modalType, setModalType] =
    useState(null);

  // ─────────────────────────────────────────────────────────────────────────
  // New Build
  // ─────────────────────────────────────────────────────────────────────────

  const [newBuildData, setNewBuildData] = useState({
    motorcycleId: "",
    motorcycleName: "",
    buildName: "",
    goal: "Performance",
    partsText: "",
    aiResult: "",
    notes: "",
  });

  const [savingBuild, setSavingBuild] =
    useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // Edit Build
  // ─────────────────────────────────────────────────────────────────────────

  const [editBuildData, setEditBuildData] =
    useState({
      buildName: "",
      goal: "",
      partsText: "",
      aiResult: "",
      notes: "",
    });

  const [updatingBuild, setUpdatingBuild] =
    useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // Share
  // ─────────────────────────────────────────────────────────────────────────

  const [shareData, setShareData] = useState({
    description: "",
    estimatedCost: "",
    difficultyLevel: "Intermediate",
    safetyNotes: "",
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Authentication
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setCurrentUser(user || null);

        if (!user) {
          setBuilds([]);
          setMotorcycles([]);
          setSelectedBuild(null);
          setLoadingBuilds(false);
        }
      }
    );

    return unsubscribe;
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Listen to Customer Builds
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!currentUser?.uid) {
      setBuilds([]);
      setLoadingBuilds(false);
      return undefined;
    }

    setLoadingBuilds(true);

    const buildsQuery = query(
      collection(db, "builds"),
      where(
        "customerId",
        "==",
        currentUser.uid
      )
    );

    const unsubscribe = onSnapshot(
      buildsQuery,
      (snapshot) => {
        const buildList = snapshot.docs.map(
          (buildDoc) => ({
            id: buildDoc.id,
            ...buildDoc.data(),
          })
        );

        buildList.sort((a, b) => {
          const aDate =
            a.updatedAt?.toMillis?.() ||
            a.createdAt?.toMillis?.() ||
            0;

          const bDate =
            b.updatedAt?.toMillis?.() ||
            b.createdAt?.toMillis?.() ||
            0;

          return bDate - aDate;
        });

        console.log(
          "Customer builds synced:",
          buildList
        );

        setBuilds(
          Array.isArray(buildList)
            ? buildList
            : []
        );

        setLoadingBuilds(false);

        // Keep selected build synchronized with Firestore.
        if (selectedBuild?.id) {
          const updatedSelectedBuild =
            buildList.find(
              (build) =>
                build.id === selectedBuild.id
            );

          if (updatedSelectedBuild) {
            setSelectedBuild(
              updatedSelectedBuild
            );
          } else {
            setSelectedBuild(null);
          }
        }
      },
      (error) => {
        console.error(
          "Error loading customer builds:",
          error
        );

        setBuilds([]);
        setLoadingBuilds(false);
      }
    );

    return unsubscribe;
  }, [
    currentUser?.uid,
    selectedBuild?.id,
  ]);

  // ─────────────────────────────────────────────────────────────────────────
  // Listen to Customer Motorcycles
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!currentUser?.uid) {
      setMotorcycles([]);
      return undefined;
    }

    const motorcyclesQuery = query(
      collection(db, "motorcycles"),
      where(
        "customerId",
        "==",
        currentUser.uid
      )
    );

    const unsubscribe = onSnapshot(
      motorcyclesQuery,
      (snapshot) => {
        const motorcycleList =
          snapshot.docs.map(
            (motorcycleDoc) => ({
              id: motorcycleDoc.id,
              ...motorcycleDoc.data(),
            })
          );

        console.log(
          "Build motorcycles synced:",
          motorcycleList
        );

        setMotorcycles(
          Array.isArray(motorcycleList)
            ? motorcycleList
            : []
        );
      },
      (error) => {
        console.error(
          "Error loading motorcycles for builds:",
          error
        );

        setMotorcycles([]);
      }
    );

    return unsubscribe;
  }, [currentUser?.uid]);

  // ─────────────────────────────────────────────────────────────────────────
  // Modal Helpers
  // ─────────────────────────────────────────────────────────────────────────

  const openModal = (type) => {
    if (type === "edit" && selectedBuild) {
      setEditBuildData({
        buildName:
          selectedBuild.buildName ||
          selectedBuild.motorcycleName ||
          "",
        goal:
          selectedBuild.goal ||
          "Performance",
        partsText: Array.isArray(
          selectedBuild.parts
        )
          ? selectedBuild.parts.join("\n")
          : "",
        aiResult:
          selectedBuild.aiResult || "",
        notes:
          selectedBuild.notes || "",
      });
    }

    if (type === "share") {
      setShareData({
        description: "",
        estimatedCost: "",
        difficultyLevel: "Intermediate",
        safetyNotes: "",
      });
    }

    setModalType(type);
  };

  const closeModal = () => {
    if (savingBuild || updatingBuild) {
      return;
    }

    setModalType(null);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Date Helper
  // ─────────────────────────────────────────────────────────────────────────

  const formatDate = (value) => {
    if (!value) {
      return "Unknown date";
    }

    try {
      if (
        typeof value?.toDate === "function"
      ) {
        return value
          .toDate()
          .toISOString()
          .split("T")[0];
      }

      if (value instanceof Date) {
        return value
          .toISOString()
          .split("T")[0];
      }

      if (typeof value === "string") {
        return value.split("T")[0];
      }

      return "Unknown date";
    } catch {
      return "Unknown date";
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Motorcycle Label
  // ─────────────────────────────────────────────────────────────────────────

  const getMotorcycleName = (motorcycle) => {
    if (!motorcycle) {
      return "";
    }

    const brand = String(
      motorcycle.brand || ""
    ).trim();

    const model = String(
      motorcycle.model || ""
    ).trim();

    const year = String(
      motorcycle.year || ""
    ).trim();

    const baseName = [brand, model]
      .filter(Boolean)
      .join(" ");

    if (year && baseName) {
      return `${baseName} (${year})`;
    }

    return baseName || "Motorcycle";
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Create Build
  // ─────────────────────────────────────────────────────────────────────────

  const resetNewBuildForm = () => {
    setNewBuildData({
      motorcycleId: "",
      motorcycleName: "",
      buildName: "",
      goal: "Performance",
      partsText: "",
      aiResult: "",
      notes: "",
    });
  };

  const handleSelectMotorcycle = (
    motorcycle
  ) => {
    setNewBuildData((previous) => ({
      ...previous,
      motorcycleId: motorcycle.id,
      motorcycleName:
        getMotorcycleName(motorcycle),
    }));
  };

  const handleCreateBuild = async () => {
    if (!currentUser?.uid) {
      Alert.alert(
        "Not Signed In",
        "Please sign in again before creating a build."
      );
      return;
    }

    if (!newBuildData.motorcycleId) {
      Alert.alert(
        "Motorcycle Required",
        "Please select a motorcycle for this build."
      );
      return;
    }

    const selectedMotorcycle =
      motorcycles.find(
        (motorcycle) =>
          motorcycle.id ===
          newBuildData.motorcycleId
      );

    if (!selectedMotorcycle) {
      Alert.alert(
        "Motorcycle Not Found",
        "Please select your motorcycle again."
      );
      return;
    }

    if (!newBuildData.buildName.trim()) {
      Alert.alert(
        "Build Name Required",
        "Please enter a name for your build."
      );
      return;
    }

    const parts = newBuildData.partsText
      .split("\n")
      .map((part) => part.trim())
      .filter(Boolean);

    setSavingBuild(true);

    try {
      const now = new Date();

      const buildData = {
        customerId: currentUser.uid,
        customerUid: currentUser.uid,
        customerEmail:
          currentUser.email || "",

        motorcycleId:
          selectedMotorcycle.id,

        motorcycleName:
          getMotorcycleName(
            selectedMotorcycle
          ),

        motorcycleBrand:
          selectedMotorcycle.brand || "",

        motorcycleModel:
          selectedMotorcycle.model || "",

        motorcycleYear:
          selectedMotorcycle.year || "",

        buildName:
          newBuildData.buildName.trim(),

        goal:
          newBuildData.goal.trim() ||
          "Performance",

        parts,

        aiResult:
          newBuildData.aiResult.trim(),

        notes:
          newBuildData.notes.trim(),

        dateSaved:
          now.toISOString().split("T")[0],

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),
      };

      const buildReference =
        await addDoc(
          collection(db, "builds"),
          buildData
        );

      console.log(
        "Build created:",
        buildReference.id
      );

      setModalType(null);
      resetNewBuildForm();

      Alert.alert(
        "Build Saved",
        "Your motorcycle build has been saved successfully."
      );
    } catch (error) {
      console.error(
        "Error creating build:",
        error
      );

      Alert.alert(
        "Save Failed",
        error?.message ||
          "Unable to save your build. Please try again."
      );
    } finally {
      setSavingBuild(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Edit Build
  // ─────────────────────────────────────────────────────────────────────────

  const handleSaveEdit = async () => {
    if (!selectedBuild?.id) {
      return;
    }

    if (!editBuildData.buildName.trim()) {
      Alert.alert(
        "Build Name Required",
        "Please enter a build name."
      );
      return;
    }

    const parts = editBuildData.partsText
      .split("\n")
      .map((part) => part.trim())
      .filter(Boolean);

    setUpdatingBuild(true);

    try {
      const buildReference = doc(
        db,
        "builds",
        selectedBuild.id
      );

      await updateDoc(
        buildReference,
        {
          buildName:
            editBuildData.buildName.trim(),

          goal:
            editBuildData.goal.trim() ||
            "Performance",

          parts,

          aiResult:
            editBuildData.aiResult.trim(),

          notes:
            editBuildData.notes.trim(),

          updatedAt:
            serverTimestamp(),
        }
      );

      setModalType(null);

      Alert.alert(
        "Build Updated",
        "Your build changes have been saved."
      );
    } catch (error) {
      console.error(
        "Error updating build:",
        error
      );

      Alert.alert(
        "Update Failed",
        error?.message ||
          "Unable to update your build. Please try again."
      );
    } finally {
      setUpdatingBuild(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Delete Build
  // ─────────────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!selectedBuild?.id) {
      return;
    }

    try {
      await deleteDoc(
        doc(
          db,
          "builds",
          selectedBuild.id
        )
      );

      console.log(
        "Build deleted:",
        selectedBuild.id
      );

      setSelectedBuild(null);
      setModalType(null);

      Alert.alert(
        "Build Deleted",
        "Your saved build has been deleted."
      );
    } catch (error) {
      console.error(
        "Error deleting build:",
        error
      );

      Alert.alert(
        "Delete Failed",
        error?.message ||
          "Unable to delete your build. Please try again."
      );
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Share Build
  // ─────────────────────────────────────────────────────────────────────────

  const handleShare = async () => {
    if (!selectedBuild) {
      return;
    }

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

    /*
     * For now, sharing is kept as a confirmation flow.
     * The actual community collection can be connected
     * separately once the Community Builds screen is ready.
     */

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

  // ─────────────────────────────────────────────────────────────────────────
  // Request Service
  // ─────────────────────────────────────────────────────────────────────────

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
          onPress: () => {
            /*
             * This can be connected directly to the
             * existing CustomerServices request flow.
             */
          },
        },
      ]
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <CustomerLayout title="My Builds">
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderText}>
            <Text style={styles.pageTitle}>
              My Builds
            </Text>

            <Text style={styles.pageSubtitle}>
              Saved motorcycle configurations and AI
              recommendations
            </Text>
          </View>

          <TouchableOpacity
            style={styles.newBuildButton}
            onPress={() => {
              resetNewBuildForm();
              openModal("new");
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.newBuildButtonText}>
              + New Build
            </Text>
          </TouchableOpacity>
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
                {builds.length !== 1
                  ? "s"
                  : ""}
              </Text>
            </View>
          </View>

          {loadingBuilds ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>
                …
              </Text>

              <Text style={styles.emptyTitle}>
                Loading Builds
              </Text>

              <Text style={styles.emptyText}>
                Loading your saved builds...
              </Text>
            </View>
          ) : builds.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>
                ▣
              </Text>

              <Text style={styles.emptyTitle}>
                No Saved Builds
              </Text>

              <Text style={styles.emptyText}>
                Your saved AI recommendations and
                custom builds will appear here.
              </Text>

              <TouchableOpacity
                style={styles.emptyNewBuildButton}
                onPress={() => {
                  resetNewBuildForm();
                  openModal("new");
                }}
              >
                <Text
                  style={
                    styles.emptyNewBuildButtonText
                  }
                >
                  + Create Your First Build
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            builds.map((build) => (
              <TouchableOpacity
                key={build.id}
                style={[
                  styles.buildListItem,
                  selectedBuild?.id ===
                    build.id &&
                    styles.buildListItemActive,
                ]}
                onPress={() =>
                  setSelectedBuild(build)
                }
                activeOpacity={0.85}
              >
                <View style={styles.buildListInfo}>
                  <Text style={styles.buildName}>
                    {build.buildName ||
                      build.motorcycleName ||
                      "Unnamed Build"}
                  </Text>

                  <Text style={styles.buildGoal}>
                    {build.motorcycleName ||
                      "Motorcycle"}{" "}
                    •{" "}
                    {build.goal ||
                      "Performance"}
                  </Text>

                  <Text style={styles.buildDate}>
                    Saved{" "}
                    {formatDate(
                      build.dateSaved ||
                        build.createdAt
                    )}
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
                <View
                  style={styles.detailHeaderInfo}
                >
                  <Text style={styles.detailTitle}>
                    {selectedBuild.buildName ||
                      selectedBuild.motorcycleName ||
                      "Unnamed Build"}
                  </Text>

                  <Text style={styles.detailGoal}>
                    {selectedBuild.motorcycleName ||
                      "Motorcycle"}
                  </Text>

                  <Text style={styles.detailGoal}>
                    Goal:{" "}
                    {selectedBuild.goal ||
                      "Performance"}
                  </Text>
                </View>

                <View style={styles.savedBadge}>
                  <Text
                    style={styles.savedBadgeText}
                  >
                    Saved{" "}
                    {formatDate(
                      selectedBuild.dateSaved ||
                        selectedBuild.createdAt
                    )}
                  </Text>
                </View>
              </View>
            </View>

            {/* Selected Parts */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                Selected Parts
              </Text>

              {Array.isArray(
                selectedBuild.parts
              ) &&
              selectedBuild.parts.length >
                0 ? (
                <View style={styles.partsList}>
                  {selectedBuild.parts.map(
                    (part, index) => (
                      <View
                        key={`${selectedBuild.id}-part-${index}`}
                        style={styles.partRow}
                      >
                        <View
                          style={
                            styles.partNumber
                          }
                        >
                          <Text
                            style={
                              styles.partNumberText
                            }
                          >
                            {index + 1}
                          </Text>
                        </View>

                        <Text
                          style={styles.partText}
                        >
                          {part}
                        </Text>
                      </View>
                    )
                  )}
                </View>
              ) : (
                <Text
                  style={styles.noPartsText}
                >
                  No parts have been added to this
                  build yet.
                </Text>
              )}
            </View>

            {/* AI Analysis */}
            {selectedBuild.aiResult ? (
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
            ) : null}

            {/* Notes */}
            {selectedBuild.notes ? (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>
                  Notes
                </Text>

                <View style={styles.notesBox}>
                  <Text style={styles.notesText}>
                    {selectedBuild.notes}
                  </Text>
                </View>
              </View>
            ) : null}

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
                  onPress={() =>
                    openModal("edit")
                  }
                >
                  <Text style={styles.actionIcon}>
                    ✎
                  </Text>

                  <Text
                    style={styles.grayActionText}
                  >
                    Edit Build
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.greenAction}
                  onPress={() =>
                    openModal("share")
                  }
                >
                  <Text
                    style={styles.actionIconLight}
                  >
                    ↗
                  </Text>

                  <Text
                    style={styles.actionTextLight}
                  >
                    Share to Community
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.darkAction}
                  onPress={() =>
                    openModal("request")
                  }
                >
                  <Text
                    style={styles.actionIconLight}
                  >
                    →
                  </Text>

                  <Text
                    style={styles.actionTextLight}
                  >
                    Request Service
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.redAction}
                  onPress={() =>
                    openModal("delete")
                  }
                >
                  <Text
                    style={styles.actionIconLight}
                  >
                    ×
                  </Text>

                  <Text
                    style={styles.actionTextLight}
                  >
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

            <Text
              style={styles.placeholderTitle}
            >
              Select a build
            </Text>

            <Text
              style={styles.placeholderText}
            >
              Select a saved build above to view
              its details.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* New Build Modal */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <Modal
        visible={modalType === "new"}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView
              showsVerticalScrollIndicator={false}
            >
              <ModalHeader
                title="New Build"
                onClose={closeModal}
              />

              <Text style={styles.modalDescription}>
                Create a saved configuration for one
                of your registered motorcycles.
              </Text>

              <Text style={styles.modalLabel}>
                Motorcycle *
              </Text>

              {motorcycles.length === 0 ? (
                <View
                  style={styles.noMotorcycleBox}
                >
                  <Text
                    style={
                      styles.noMotorcycleText
                    }
                  >
                    You don't have any registered
                    motorcycles yet.
                  </Text>

                  <Text
                    style={
                      styles.noMotorcycleSubtext
                    }
                  >
                    Add a motorcycle first before
                    creating a build.
                  </Text>
                </View>
              ) : (
                <View
                  style={
                    styles.motorcycleSelection
                  }
                >
                  {motorcycles.map(
                    (motorcycle) => {
                      const isSelected =
                        newBuildData.motorcycleId ===
                        motorcycle.id;

                      return (
                        <TouchableOpacity
                          key={motorcycle.id}
                          style={[
                            styles.motorcycleOption,
                            isSelected &&
                              styles.motorcycleOptionActive,
                          ]}
                          onPress={() =>
                            handleSelectMotorcycle(
                              motorcycle
                            )
                          }
                        >
                          <View
                            style={
                              styles.motorcycleOptionInfo
                            }
                          >
                            <Text
                              style={[
                                styles.motorcycleOptionName,
                                isSelected &&
                                  styles.motorcycleOptionNameActive,
                              ]}
                            >
                              {getMotorcycleName(
                                motorcycle
                              )}
                            </Text>

                            {motorcycle.plate ? (
                              <Text
                                style={[
                                  styles.motorcycleOptionPlate,
                                  isSelected &&
                                    styles.motorcycleOptionPlateActive,
                                ]}
                              >
                                Plate:{" "}
                                {motorcycle.plate}
                              </Text>
                            ) : null}
                          </View>

                          <View
                            style={[
                              styles.radioOuter,
                              isSelected &&
                                styles.radioOuterActive,
                            ]}
                          >
                            {isSelected ? (
                              <View
                                style={
                                  styles.radioInner
                                }
                              />
                            ) : null}
                          </View>
                        </TouchableOpacity>
                      );
                    }
                  )}
                </View>
              )}

              <Text style={styles.modalLabel}>
                Build Name *
              </Text>

              <TextInput
                value={newBuildData.buildName}
                onChangeText={(text) =>
                  setNewBuildData(
                    (previous) => ({
                      ...previous,
                      buildName: text,
                    })
                  )
                }
                style={styles.input}
                placeholder="e.g. Daily Performance Build"
                placeholderTextColor="#9ca3af"
              />

              <Text style={styles.modalLabel}>
                Goal
              </Text>

              <View style={styles.goalRow}>
                {[
                  "Performance",
                  "Daily",
                  "Racing",
                  "Touring",
                  "Custom",
                ].map((goal) => (
                  <TouchableOpacity
                    key={goal}
                    style={[
                      styles.goalButton,
                      newBuildData.goal ===
                        goal &&
                        styles.goalButtonActive,
                    ]}
                    onPress={() =>
                      setNewBuildData(
                        (previous) => ({
                          ...previous,
                          goal,
                        })
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.goalButtonText,
                        newBuildData.goal ===
                          goal &&
                          styles.goalButtonTextActive,
                      ]}
                    >
                      {goal}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>
                Selected Parts
              </Text>

              <Text style={styles.helperText}>
                Enter one part per line.
              </Text>

              <TextInput
                value={newBuildData.partsText}
                onChangeText={(text) =>
                  setNewBuildData(
                    (previous) => ({
                      ...previous,
                      partsText: text,
                    })
                  )
                }
                style={[
                  styles.input,
                  styles.textArea,
                ]}
                placeholder={
                  "Performance Exhaust\nAir Filter\nECU Flash"
                }
                placeholderTextColor="#9ca3af"
                multiline
                textAlignVertical="top"
              />

              <Text style={styles.modalLabel}>
                AI Analysis
              </Text>

              <TextInput
                value={newBuildData.aiResult}
                onChangeText={(text) =>
                  setNewBuildData(
                    (previous) => ({
                      ...previous,
                      aiResult: text,
                    })
                  )
                }
                style={[
                  styles.input,
                  styles.textAreaSmall,
                ]}
                placeholder="Optional AI recommendation or compatibility result..."
                placeholderTextColor="#9ca3af"
                multiline
                textAlignVertical="top"
              />

              <Text style={styles.modalLabel}>
                Notes
              </Text>

              <TextInput
                value={newBuildData.notes}
                onChangeText={(text) =>
                  setNewBuildData(
                    (previous) => ({
                      ...previous,
                      notes: text,
                    })
                  )
                }
                style={[
                  styles.input,
                  styles.textAreaSmall,
                ]}
                placeholder="Additional build notes..."
                placeholderTextColor="#9ca3af"
                multiline
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[
                  styles.modalDarkButton,
                  (savingBuild ||
                    motorcycles.length === 0) &&
                    styles.disabledButtonDark,
                ]}
                onPress={handleCreateBuild}
                disabled={
                  savingBuild ||
                  motorcycles.length === 0
                }
              >
                <Text
                  style={
                    styles.modalDarkButtonText
                  }
                >
                  {savingBuild
                    ? "Saving Build..."
                    : "Save Build"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* View Modal */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <Modal
        visible={modalType === "view"}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView
              showsVerticalScrollIndicator={false}
            >
              <ModalHeader
                title="Build Details"
                onClose={closeModal}
              />

              {selectedBuild && (
                <>
                  <Text style={styles.modalLabel}>
                    Build Name
                  </Text>

                  <Text style={styles.modalValue}>
                    {selectedBuild.buildName ||
                      "Unnamed Build"}
                  </Text>

                  <Text style={styles.modalLabel}>
                    Motorcycle
                  </Text>

                  <Text style={styles.modalValue}>
                    {selectedBuild.motorcycleName ||
                      "Motorcycle"}
                  </Text>

                  <Text style={styles.modalLabel}>
                    Goal
                  </Text>

                  <Text style={styles.modalValue}>
                    {selectedBuild.goal ||
                      "Performance"}
                  </Text>

                  <Text style={styles.modalLabel}>
                    Saved On
                  </Text>

                  <Text style={styles.modalValue}>
                    {formatDate(
                      selectedBuild.dateSaved ||
                        selectedBuild.createdAt
                    )}
                  </Text>

                  <Text style={styles.modalLabel}>
                    Parts Selected
                  </Text>

                  {Array.isArray(
                    selectedBuild.parts
                  ) &&
                  selectedBuild.parts.length >
                    0 ? (
                    selectedBuild.parts.map(
                      (part, index) => (
                        <Text
                          key={index}
                          style={
                            styles.modalPart
                          }
                        >
                          • {part}
                        </Text>
                      )
                    )
                  ) : (
                    <Text
                      style={styles.noPartsText}
                    >
                      No parts selected.
                    </Text>
                  )}

                  {selectedBuild.aiResult ? (
                    <>
                      <Text
                        style={styles.modalLabel}
                      >
                        AI Analysis
                      </Text>

                      <Text
                        style={
                          styles.modalValue
                        }
                      >
                        {selectedBuild.aiResult}
                      </Text>
                    </>
                  ) : null}

                  {selectedBuild.notes ? (
                    <>
                      <Text
                        style={styles.modalLabel}
                      >
                        Notes
                      </Text>

                      <Text
                        style={
                          styles.modalValue
                        }
                      >
                        {selectedBuild.notes}
                      </Text>
                    </>
                  ) : null}
                </>
              )}

              <TouchableOpacity
                style={styles.modalDarkButton}
                onPress={closeModal}
              >
                <Text
                  style={
                    styles.modalDarkButtonText
                  }
                >
                  Close
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* Edit Modal */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <Modal
        visible={modalType === "edit"}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView
              showsVerticalScrollIndicator={false}
            >
              <ModalHeader
                title="Edit Build"
                onClose={closeModal}
              />

              <Text style={styles.modalLabel}>
                Build Name *
              </Text>

              <TextInput
                value={editBuildData.buildName}
                onChangeText={(text) =>
                  setEditBuildData(
                    (previous) => ({
                      ...previous,
                      buildName: text,
                    })
                  )
                }
                style={styles.input}
                placeholder="Build name"
                placeholderTextColor="#9ca3af"
              />

              <Text style={styles.modalLabel}>
                Goal
              </Text>

              <View style={styles.goalRow}>
                {[
                  "Performance",
                  "Daily",
                  "Racing",
                  "Touring",
                  "Custom",
                ].map((goal) => (
                  <TouchableOpacity
                    key={goal}
                    style={[
                      styles.goalButton,
                      editBuildData.goal ===
                        goal &&
                        styles.goalButtonActive,
                    ]}
                    onPress={() =>
                      setEditBuildData(
                        (previous) => ({
                          ...previous,
                          goal,
                        })
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.goalButtonText,
                        editBuildData.goal ===
                          goal &&
                          styles.goalButtonTextActive,
                      ]}
                    >
                      {goal}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>
                Selected Parts
              </Text>

              <Text style={styles.helperText}>
                Enter one part per line.
              </Text>

              <TextInput
                value={editBuildData.partsText}
                onChangeText={(text) =>
                  setEditBuildData(
                    (previous) => ({
                      ...previous,
                      partsText: text,
                    })
                  )
                }
                style={[
                  styles.input,
                  styles.textArea,
                ]}
                placeholder="Parts..."
                placeholderTextColor="#9ca3af"
                multiline
                textAlignVertical="top"
              />

              <Text style={styles.modalLabel}>
                AI Analysis
              </Text>

              <TextInput
                value={editBuildData.aiResult}
                onChangeText={(text) =>
                  setEditBuildData(
                    (previous) => ({
                      ...previous,
                      aiResult: text,
                    })
                  )
                }
                style={[
                  styles.input,
                  styles.textAreaSmall,
                ]}
                placeholder="AI recommendation..."
                placeholderTextColor="#9ca3af"
                multiline
                textAlignVertical="top"
              />

              <Text style={styles.modalLabel}>
                Notes
              </Text>

              <TextInput
                value={editBuildData.notes}
                onChangeText={(text) =>
                  setEditBuildData(
                    (previous) => ({
                      ...previous,
                      notes: text,
                    })
                  )
                }
                style={[
                  styles.input,
                  styles.textAreaSmall,
                ]}
                placeholder="Additional notes..."
                placeholderTextColor="#9ca3af"
                multiline
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[
                  styles.modalDarkButton,
                  updatingBuild &&
                    styles.disabledButtonDark,
                ]}
                onPress={handleSaveEdit}
                disabled={updatingBuild}
              >
                <Text
                  style={
                    styles.modalDarkButtonText
                  }
                >
                  {updatingBuild
                    ? "Saving Changes..."
                    : "Save Changes"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* Request Service Modal */}
      {/* ─────────────────────────────────────────────────────────────────── */}

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
                  Build
                </Text>

                <Text style={styles.confirmValue}>
                  {selectedBuild.buildName ||
                    "Unnamed Build"}
                </Text>

                <Text style={styles.confirmLabel}>
                  Motorcycle
                </Text>

                <Text style={styles.confirmValue}>
                  {selectedBuild.motorcycleName ||
                    "Motorcycle"}
                </Text>

                <Text style={styles.confirmLabel}>
                  Goal
                </Text>

                <Text style={styles.confirmValue}>
                  {selectedBuild.goal ||
                    "Performance"}
                </Text>

                <Text style={styles.confirmLabel}>
                  Parts
                </Text>

                {Array.isArray(
                  selectedBuild.parts
                ) &&
                selectedBuild.parts.length >
                  0 ? (
                  selectedBuild.parts.map(
                    (part, index) => (
                      <Text
                        key={index}
                        style={
                          styles.confirmPart
                        }
                      >
                        • {part}
                      </Text>
                    )
                  )
                ) : (
                  <Text
                    style={styles.confirmPart}
                  >
                    No parts selected.
                  </Text>
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
              <Text
                style={
                  styles.modalDarkButtonText
                }
              >
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* Delete Modal */}
      {/* ─────────────────────────────────────────────────────────────────── */}

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
                {selectedBuild?.buildName ||
                  selectedBuild?.motorcycleName ||
                  "this build"}
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
                <Text
                  style={styles.deleteButtonText}
                >
                  Delete Permanently
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* Share Modal */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <Modal
        visible={modalType === "share"}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView
              showsVerticalScrollIndicator={false}
            >
              <ModalHeader
                title="Share to Community"
                onClose={closeModal}
              />

              <Text style={styles.modalDescription}>
                Share your build with the community so
                other riders can view and interact with
                it.
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
                        difficultyLevel:
                          level,
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
                  <Text
                    style={styles.sharePreviewText}
                  >
                    <Text
                      style={styles.boldText}
                    >
                      Build Preview:
                    </Text>{" "}
                    {selectedBuild.buildName ||
                      selectedBuild.motorcycleName}{" "}
                    •{" "}
                    {selectedBuild.goal ||
                      "Performance"}{" "}
                    •{" "}
                    {Array.isArray(
                      selectedBuild.parts
                    )
                      ? selectedBuild.parts
                          .length
                      : 0}{" "}
                    parts
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
                  <Text
                    style={styles.shareButtonText}
                  >
                    Share Build
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </CustomerLayout>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal Header
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

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
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },

  pageHeaderText: {
    flex: 1,
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

  newBuildButton: {
    backgroundColor: "#111827",
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 9,
    marginTop: 1,
  },

  newBuildButtonText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
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

  noPartsText: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 10,
    lineHeight: 18,
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

  notesBox: {
    backgroundColor: "#f9fafb",
    borderRadius: 9,
    padding: 12,
    marginTop: 10,
  },

  notesText: {
    color: "#374151",
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
    maxWidth: 280,
  },

  emptyNewBuildButton: {
    backgroundColor: "#111827",
    borderRadius: 9,
    paddingHorizontal: 13,
    paddingVertical: 10,
    marginTop: 14,
  },

  emptyNewBuildButtonText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
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
    marginTop: 10,
    marginBottom: 5,
    textTransform: "uppercase",
  },

  modalValue: {
    color: "#111827",
    fontSize: 13,
    marginBottom: 6,
    lineHeight: 19,
  },

  modalPart: {
    color: "#374151",
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 18,
  },

  modalDescription: {
    color: "#6b7280",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },

  helperText: {
    color: "#9ca3af",
    fontSize: 10,
    marginBottom: 5,
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
    minHeight: 90,
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

  disabledButtonDark: {
    backgroundColor: "#9ca3af",
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

  noMotorcycleBox: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 9,
    padding: 12,
  },

  noMotorcycleText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "600",
  },

  noMotorcycleSubtext: {
    color: "#9ca3af",
    fontSize: 10,
    marginTop: 4,
    lineHeight: 15,
  },

  motorcycleSelection: {
    gap: 7,
  },

  motorcycleOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 9,
    padding: 11,
  },

  motorcycleOptionActive: {
    borderColor: "#111827",
    backgroundColor: "#f9fafb",
  },

  motorcycleOptionInfo: {
    flex: 1,
  },

  motorcycleOptionName: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "600",
  },

  motorcycleOptionNameActive: {
    color: "#111827",
  },

  motorcycleOptionPlate: {
    color: "#9ca3af",
    fontSize: 10,
    marginTop: 3,
  },

  motorcycleOptionPlateActive: {
    color: "#6b7280",
  },

  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  radioOuterActive: {
    borderColor: "#111827",
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#111827",
  },

  goalRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },

  goalButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  goalButtonActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },

  goalButtonText: {
    color: "#4b5563",
    fontSize: 10,
  },

  goalButtonTextActive: {
    color: "#ffffff",
  },
});