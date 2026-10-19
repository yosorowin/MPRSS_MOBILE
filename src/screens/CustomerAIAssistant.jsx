import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
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
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";

export default function CustomerAIAssistant() {
  const router = useRouter();

  const [mode, setMode] = useState("recommendation");

  const [motorcycles, setMotorcycles] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [firebaseLoading, setFirebaseLoading] = useState(true);

  const [formData, setFormData] = useState({
    motorcycle: "",
    goal: "",
    parts: "",
  });

  const [selectedParts, setSelectedParts] = useState([]);

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  const [showMotorcyclePicker, setShowMotorcyclePicker] =
    useState(false);

  const [showSaveModal, setShowSaveModal] = useState(false);

  const [showConfirmModal, setShowConfirmModal] =
    useState(false);

  const [showNoMotorcycleModal, setShowNoMotorcycleModal] =
    useState(false);

  const [buildName, setBuildName] = useState("");

  // Keep the signed-in user in sync with Firebase Authentication.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setMotorcycles([]);
        setInventory([]);
        setFirebaseLoading(false);
      } else {
        setFirebaseLoading(true);
      }
    });
    return unsubscribe;
  }, []);

  // Subscribe to this customer's motorcycles and the shop's inventory.
  useEffect(() => {
    if (!currentUser?.uid) return undefined;

    setFirebaseLoading(true);
    const motorcyclesQuery = query(
      collection(db, "motorcycles"),
      where("customerId", "==", currentUser.uid)
    );

    const unsubscribeMotorcycles = onSnapshot(
      motorcyclesQuery,
      (snapshot) => {
        const items = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));
        setMotorcycles(items);
        setFirebaseLoading(false);
      },
      (error) => {
        console.error("Failed to load motorcycles:", error);
        setFirebaseLoading(false);
        Alert.alert(
          "Motorcycles unavailable",
          "We couldn't load your registered motorcycles. Check your connection and Firestore permissions."
        );
      }
    );

    const unsubscribeInventory = onSnapshot(
      collection(db, "inventory"),
      (snapshot) => {
        const items = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));
        setInventory(items.filter((part) => part.visibleToCustomers === true));
      },
      (error) => {
        console.error("Failed to load inventory:", error);
        Alert.alert(
          "Inventory unavailable",
          "We couldn't load parts from the shop. Check your Firestore permissions."
        );
      }
    );

    return () => {
      unsubscribeMotorcycles();
      unsubscribeInventory();
    };
  }, [currentUser?.uid]);

  // Keep a short list of this customer's previous AI analyses in sync with Firestore.
  useEffect(() => {
    if (!currentUser?.uid) {
      setAnalysisHistory([]);
      return undefined;
    }

    const historyQuery = query(
      collection(db, "aiAnalysisHistory"),
      where("userId", "==", currentUser.uid)
    );

    return onSnapshot(
      historyQuery,
      (snapshot) => {
        const entries = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));
        entries.sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() || 0;
          const bTime = b.createdAt?.toMillis?.() || 0;
          return bTime - aTime;
        });
        setAnalysisHistory(entries.slice(0, 5));
      },
      (error) => {
        console.error("Failed to load AI analysis history:", error);
      }
    );
  }, [currentUser?.uid]);

  const visibleInventory = useMemo(() => inventory, [inventory]);

  const handlePartToggle = (partId) => {
    setSelectedParts((previous) =>
      previous.includes(partId)
        ? previous.filter((id) => id !== partId)
        : [...previous, partId]
    );
  };

  const selectMode = (nextMode) => {
    setMode(nextMode);
    setResult(null);

    if (nextMode === "evaluation") {
      setSelectedParts([]);
    }
  };

  // UI-only handler: keep the button responsive without running AI, API, or rule-based analysis.
  const handleAnalyze = () => {
    if (!currentUser?.uid) {
      Alert.alert("Sign in required", "Please sign in before using the AI Assistant.");
      return;
    }
    if (motorcycles.length === 0) {
      setShowNoMotorcycleModal(true);
      return;
    }
    if (!formData.motorcycle) {
      Alert.alert("Select Motorcycle", "Please select a motorcycle first.");
      return;
    }
    if (mode === "recommendation" && !formData.goal) {
      Alert.alert("Select Goal", "Please select your goal first.");
      return;
    }
    if (mode === "evaluation" && selectedParts.length === 0) {
      Alert.alert("Select Parts", "Please select at least one part to evaluate.");
      return;
    }

    setResult(null);
    Alert.alert(
      "AI Assistant UI Only",
      "The analysis feature is currently disabled. Your selections are kept, but no AI, API, or rule-based analysis was run."
    );
  };

  const handleSave = () => {
    if (!result) {
      return;
    }

    setShowSaveModal(true);
  };

  const handleConfirmSave = async () => {
    if (!currentUser?.uid) {
      Alert.alert("Sign in required", "Please sign in again before saving a build.");
      return;
    }
    if (!result) {
      Alert.alert("No results", "Analyze your setup before saving a build.");
      return;
    }

    const finalName =
      buildName.trim() ||
      `${formData.motorcycle || "My"} ${formData.goal || "Custom"} Build`;

    try {
      const savedBuildRef = await addDoc(collection(db, "builds"), {
        userId: currentUser.uid,
        name: finalName,
        motorcycle: formData.motorcycle,
        goal: formData.goal || null,
        mode,
        additionalNotes: formData.parts || "",
        selectedParts: selectedParts.map((id) => {
          const part = visibleInventory.find((item) => item.id === id);
          return part ? { id: part.id, name: part.name, brand: part.brand || "", category: part.category || "", price: Number(part.price) || 0 } : { id, name: "Unknown part" };
        }),
        result,
        createdAt: serverTimestamp(),
      });

      const riskLevel = String(
        result?.status || result?.riskLevel || result?.safetyLevel || ""
      ).toLowerCase();

      if (["warning", "dangerous", "danger"].includes(riskLevel)) {
        const alertRef = await addDoc(collection(db, "aiAlerts"), {
          customerId: currentUser.uid,
          userId: currentUser.uid,
          customerName: currentUser.displayName || currentUser.email?.split("@")[0] || "Customer",
          buildId: savedBuildRef.id,
          buildName: finalName,
          motorcycle: formData.motorcycle,
          riskLevel: riskLevel === "danger" ? "Dangerous" : riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1),
          status: "New",
          modification: (selectedParts || []).map((id) =>
            visibleInventory.find((part) => part.id === id)?.name
          ).filter(Boolean).join(", "),
          result,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          adminNotified: false,
        });

        await addDoc(collection(db, "notifications"), {
          customerId: currentUser.uid,
          recipientRole: "customer",
          type: "ai_safety_alert",
          title: `${riskLevel === "warning" ? "Warning" : "Dangerous"} Build Alert`,
          message: riskLevel === "warning"
            ? `Your build "${finalName}" has a warning-level safety risk and needs review.`
            : `Your build "${finalName}" has been rated dangerous. Please review the safety recommendations before using this setup.`,
          route: "/ai-assistant",
          alertId: alertRef.id,
          riskLevel: riskLevel === "danger" ? "Dangerous" : riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1),
          read: false,
          createdAt: serverTimestamp(),
        });

        // Notify administrators about builds that need a safety review.
        try {
          const normalizedRiskLevel = riskLevel === "danger"
            ? "Dangerous"
            : riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
          await addDoc(collection(db, "notifications"), {
            recipientRole: "admin",
            type: "ai_safety_alert",
            title: `${normalizedRiskLevel} AI Safety Alert`,
            message: `${currentUser.displayName || currentUser.email?.split("@")[0] || "A customer"} saved the build "${finalName}" with a ${normalizedRiskLevel.toLowerCase()} safety rating.`,
            route: "/admin/ai-safety",
            relatedId: alertRef.id,
            alertId: alertRef.id,
            buildId: savedBuildRef.id,
            buildName: finalName,
            customerId: currentUser.uid,
            customerName: currentUser.displayName || currentUser.email?.split("@")[0] || "Customer",
            motorcycle: formData.motorcycle,
            riskLevel: normalizedRiskLevel,
            read: false,
            createdAt: serverTimestamp(),
          });
        } catch (notificationError) {
          // The safety alert is already saved; notification failure must not undo it.
          console.error("Failed to notify admin about AI safety alert:", notificationError);
        }
      }

      setShowSaveModal(false);
      setBuildName("");
      Alert.alert("Build Saved", `"${finalName}" has been saved to My Builds.`);
    } catch (error) {
      console.error("Failed to save build:", error);
      Alert.alert("Save failed", "Your build could not be saved. Please try again.");
    }
  };

  const handleRequestService = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    if (!currentUser?.uid) {
      Alert.alert("Sign in required", "Please sign in again before submitting a service request.");
      return;
    }
    if (!formData.motorcycle) {
      Alert.alert("Select Motorcycle", "Please select a motorcycle first.");
      return;
    }

    try {
      await addDoc(collection(db, "services"), {
        userId: currentUser.uid,
        motorcycle: formData.motorcycle,
        serviceType: mode === "recommendation"
          ? "AI Recommended Parts Installation"
          : "Parts Compatibility Check",
        goal: formData.goal || null,
        additionalNotes: formData.parts || "",
        selectedParts: selectedParts.map((id) => {
          const part = visibleInventory.find((item) => item.id === id);
          return part ? { id: part.id, name: part.name, brand: part.brand || "", category: part.category || "", price: Number(part.price) || 0 } : { id, name: "Unknown part" };
        }),
        aiResult: result || null,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setShowConfirmModal(false);
      Alert.alert("Request Submitted", "Your service request was sent to the shop.");
      router.push("/services");
    } catch (error) {
      console.error("Failed to submit service request:", error);
      Alert.alert("Submission failed", "Your service request could not be submitted. Please try again.");
    }
  };

  return (
    <CustomerLayout title="AI Assistant">
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Safety Notice */}
        <View style={styles.warningBanner}>
          <View style={styles.warningIcon}>
            <Text style={styles.warningIconText}>⚠</Text>
          </View>

          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>
              Important Safety Notice
            </Text>

            <Text style={styles.warningText}>
              • Recommendations are based on motorcycle
              specifications and shop guidelines.
            </Text>

            <Text style={styles.warningText}>
              • Consult a professional mechanic before
              applying modifications or installing parts.
            </Text>
          </View>
        </View>

        {/* Mode Selection */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Select Mode
          </Text>

          <TouchableOpacity
            style={[
              styles.modeCard,
              mode === "recommendation" &&
                styles.modeCardActive,
            ]}
            onPress={() =>
              selectMode("recommendation")
            }
            activeOpacity={0.85}
          >
            <View style={styles.modeHeader}>
              <View style={styles.modeIcon}>
                <Text style={styles.modeIconText}>✦</Text>
              </View>

              <Text style={styles.modeTitle}>
                Get Recommendations
              </Text>
            </View>

            <Text style={styles.modeDescription}>
              Get AI-powered part recommendations based
              on your motorcycle and goals
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeCard,
              mode === "evaluation" &&
                styles.modeCardActive,
            ]}
            onPress={() => selectMode("evaluation")}
            activeOpacity={0.85}
          >
            <View style={styles.modeHeader}>
              <View style={styles.modeIcon}>
                <Text style={styles.modeIconText}>!</Text>
              </View>

              <Text style={styles.modeTitle}>
                Evaluate Setup
              </Text>
            </View>

            <Text style={styles.modeDescription}>
              Check compatibility and safety of your
              selected parts
            </Text>
          </TouchableOpacity>
        </View>

        {/* Input Form */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            {mode === "recommendation"
              ? "Get Recommendations"
              : "Evaluate Your Setup"}
          </Text>

          {/* Motorcycle */}
          <Text style={styles.label}>
            Motorcycle *
          </Text>

          <TouchableOpacity
            style={styles.selectBox}
            onPress={() => {
              if (motorcycles.length === 0) {
                setShowNoMotorcycleModal(true);
                return;
              }

              setShowMotorcyclePicker(true);
            }}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.selectText,
                !formData.motorcycle &&
                  styles.placeholderText,
              ]}
            >
              {formData.motorcycle ||
                "Select your motorcycle"}
            </Text>

            <Text style={styles.selectArrow}>▼</Text>
          </TouchableOpacity>

          {/* Goal */}
          {mode === "recommendation" && (
            <>
              <Text style={styles.label}>
                Goal *
              </Text>

              <View style={styles.goalGrid}>
                {[
                  "Performance",
                  "Safety",
                  "Aesthetic",
                  "Comfort",
                ].map((goal) => (
                  <TouchableOpacity
                    key={goal}
                    style={[
                      styles.goalButton,
                      formData.goal === goal &&
                        styles.goalButtonActive,
                    ]}
                    onPress={() =>
                      setFormData({
                        ...formData,
                        goal,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.goalText,
                        formData.goal === goal &&
                          styles.goalTextActive,
                      ]}
                    >
                      {goal}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Additional Notes / Parts */}
          {mode === "recommendation" ? (
            <>
              <Text style={styles.label}>
                Additional Notes (Optional)
              </Text>

              <TextInput
                value={formData.parts}
                onChangeText={(text) =>
                  setFormData({
                    ...formData,
                    parts: text,
                  })
                }
                style={styles.textArea}
                placeholder="Any specific requirements or preferences..."
                placeholderTextColor="#9ca3af"
                multiline
                textAlignVertical="top"
              />
            </>
          ) : (
            <>
              <Text style={styles.label}>
                Select Parts *
              </Text>

              <View style={styles.partsBox}>
                {visibleInventory.map((part) => {
                  const selected =
                    selectedParts.includes(part.id);

                  return (
                    <TouchableOpacity
                      key={part.id}
                      style={styles.partItem}
                      onPress={() =>
                        handlePartToggle(part.id)
                      }
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          selected &&
                            styles.checkboxSelected,
                        ]}
                      >
                        {selected && (
                          <Text
                            style={
                              styles.checkboxCheck
                            }
                          >
                            ✓
                          </Text>
                        )}
                      </View>

                      <View
                        style={styles.partInfo}
                      >
                        <Text
                          style={
                            styles.partName
                          }
                        >
                          {part.name}
                        </Text>

                        <Text
                          style={
                            styles.partDetails
                          }
                        >
                          {part.category || "Parts"} • ₱
                          {(Number(part.price) || 0).toLocaleString()}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {selectedParts.length > 0 && (
                <Text style={styles.selectedCount}>
                  {selectedParts.length} part
                  {selectedParts.length !== 1
                    ? "s"
                    : ""}{" "}
                  selected
                </Text>
              )}
            </>
          )}

          {/* Analyze */}
          <TouchableOpacity
            style={[
              styles.analyzeButton,
              loading &&
                styles.analyzeButtonDisabled,
            ]}
            onPress={handleAnalyze}
            disabled={loading || firebaseLoading}
            activeOpacity={0.85}
          >
            <Text style={styles.analyzeIcon}>
              ✦
            </Text>

            <Text style={styles.analyzeButtonText}>
              {loading
                ? "Analyzing..."
                : firebaseLoading
                  ? "Loading your data..."
                  : "Analyze with AI"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent AI Analysis History */}
        {analysisHistory.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Recent AI Analysis</Text>
            <Text style={styles.historyDescription}>Your latest saved analyses</Text>
            {analysisHistory.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                style={styles.historyItem}
                activeOpacity={0.8}
                onPress={() => {
                  if (entry.result) {
                    setMode(entry.mode || entry.result.type || "recommendation");
                    setFormData((previous) => ({
                      ...previous,
                      motorcycle: entry.motorcycle || previous.motorcycle,
                      goal: entry.goal || "",
                      parts: entry.notes || "",
                    }));
                    setResult(entry.result);
                  }
                }}
              >
                <View style={styles.historyItemTextWrap}>
                  <Text style={styles.historyMotorcycle}>{entry.motorcycle || "Motorcycle analysis"}</Text>
                  <Text style={styles.historyMeta}>
                    {(entry.mode || "recommendation") === "evaluation" ? "Safety Evaluation" : `Recommendation${entry.goal ? ` • ${entry.goal}` : ""}`}
                  </Text>
                </View>
                <Text style={styles.historyOpen}>View ›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Results */}
        {result && (
          <View style={styles.resultsCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultsTitle}>AI Analysis Results</Text>
            </View>

            {result.type === "recommendation" ? (
              <>
                <View style={styles.resultsDivider} />
                <Text style={styles.resultSubheading}>Recommended Parts</Text>

                {(result.suggestions || []).map((suggestion, index) => {
                  const inventoryPart = (visibleInventory || []).find((part) =>
                    String(part.name || "").trim().toLowerCase() ===
                    String(suggestion.name || "").trim().toLowerCase()
                  );
                  const hasInventoryPrice =
                    inventoryPart &&
                    inventoryPart.price !== undefined &&
                    inventoryPart.price !== null &&
                    inventoryPart.price !== "" &&
                    Number.isFinite(Number(inventoryPart.price));

                  return (
                    <View key={`${suggestion.name || "part"}-${index}`} style={styles.resultItem}>
                      <View style={styles.resultPartRow}>
                        {(() => {
                          const inventoryImage = inventoryPart?.imageUrl || inventoryPart?.imageURL || inventoryPart?.image || inventoryPart?.photoURL || inventoryPart?.photoUrl;
                          return inventoryImage ? (
                            <Image source={{ uri: inventoryImage }} style={styles.resultPartImage} resizeMode="contain" />
                          ) : (
                            <View style={styles.resultPartImagePlaceholder}>
                              <Text style={styles.resultPartImagePlaceholderText}>No image</Text>
                            </View>
                          );
                        })()}
                        <View style={styles.resultPartDetails}>
                          <Text style={styles.resultItemTitle}>{suggestion.name}</Text>
                          {hasInventoryPrice ? (
                            <Text style={styles.inventoryPriceText}>
                              Price: ₱{Number(inventoryPart.price).toLocaleString("en-PH", { maximumFractionDigits: 2 })}
                            </Text>
                          ) : (
                            <Text style={styles.inventoryPriceText}>Price: Not available in inventory</Text>
                          )}
                        </View>
                      </View>
                      <Text style={styles.partExplanationLabel}>Why it's recommended:</Text>
                      <Text style={styles.safetyText}>
                        {suggestion.explanation || suggestion.reason || suggestion.safetyNote || "Review this recommendation with a qualified mechanic to confirm compatibility with your motorcycle."}
                      </Text>
                    </View>
                  );
                })}

                <View style={styles.resultsDivider} />
                <Text style={[styles.resultSubheading, styles.analysisResultHeading]}>Analysis Result</Text>
                <Text style={styles.resultSummaryText}>
                  {result.summary || (typeof result.compatibility === "string" ? result.compatibility : "The recommendations above are based on the details provided for your motorcycle.")}
                </Text>
              </>
            ) : (
              <>
                <View style={styles.evaluationBox}>
                  <View
                    style={styles.evaluationIcon}
                  >
                    <Text
                      style={
                        styles.evaluationIconText
                      }
                    >
                      ✓
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.evaluationTitle
                    }
                  >
                    {result.status} -{" "}
                    {typeof result.compatibility === "number"
                      ? `${result.compatibility}% Compatibility`
                      : result.compatibility}
                  </Text>
                </View>

                <Text
                  style={styles.resultSubheading}
                >
                  Recommendations:
                </Text>

                {result.recommendations.map(
                  (recommendation, index) => (
                    <View
                      key={index}
                      style={
                        styles.recommendationRow
                      }
                    >
                      <Text
                        style={
                          styles.bullet
                        }
                      >
                        •
                      </Text>

                      <Text
                        style={
                          styles.recommendationText
                        }
                      >
                        {recommendation}
                      </Text>
                    </View>
                  )
                )}
              </>
            )}

            <View style={styles.resultActions}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleSave}
                activeOpacity={0.85}
              >
                <Text
                  style={styles.secondaryButtonIcon}
                >
                  ▣
                </Text>

                <Text
                  style={
                    styles.secondaryButtonText
                  }
                >
                  Save Build
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleRequestService}
                activeOpacity={0.85}
              >
                <Text
                  style={
                    styles.primaryButtonText
                  }
                >
                  Request Service
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Motorcycle Picker Modal */}
      <Modal
        visible={showMotorcyclePicker}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowMotorcyclePicker(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select Motorcycle
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setShowMotorcyclePicker(false)
                }
              >
                <Text style={styles.closeButton}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.motorcyclePickerList}
              showsVerticalScrollIndicator={false}
            >
              {motorcycles.map((motorcycle) => {
                const value = `${motorcycle.brand || ""} ${motorcycle.model || ""}${motorcycle.year ? ` (${motorcycle.year})` : ""}`.trim();

                const selected =
                  formData.motorcycle === value;

                return (
                  <TouchableOpacity
                    key={motorcycle.id}
                    style={[
                      styles.motorcyclePickerItem,
                      selected &&
                        styles.motorcyclePickerItemSelected,
                    ]}
                    onPress={() => {
                      setFormData({
                        ...formData,
                        motorcycle: value,
                      });

                      setShowMotorcyclePicker(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <View
                      style={
                        styles.motorcyclePickerInfo
                      }
                    >
                      <Text
                        style={
                          styles.motorcyclePickerName
                        }
                      >
                        {motorcycle.brand || ""}{" "}
                        {motorcycle.model || ""}
                      </Text>

                      <Text
                        style={
                          styles.motorcyclePickerDetails
                        }
                      >
                        {motorcycle.year ? `${motorcycle.year} Model` : "Registered Motorcycle"}
                        {motorcycle.plate
                          ? ` • ${motorcycle.plate}`
                          : ""}
                      </Text>
                    </View>

                    {selected && (
                      <Text
                        style={
                          styles.motorcyclePickerCheck
                        }
                      >
                        ✓
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Save Build Modal */}
      <Modal
        visible={showSaveModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowSaveModal(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Save Build
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setShowSaveModal(false)
                }
              >
                <Text style={styles.closeButton}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Give your build a name to easily find it
              later in "My Builds"
            </Text>

            <Text style={styles.label}>
              Build Name
            </Text>

            <TextInput
              value={buildName}
              onChangeText={setBuildName}
              style={styles.input}
              placeholder={`${formData.motorcycle || "My"} ${
                formData.goal || "Custom"
              } Build`}
              placeholderTextColor="#9ca3af"
            />

            <View style={styles.buildDetails}>
              <Text style={styles.detailLabel}>
                Build Details:
              </Text>

              <Text style={styles.detailText}>
                <Text style={styles.detailBold}>
                  Motorcycle:
                </Text>{" "}
                {formData.motorcycle ||
                  "Not specified"}
              </Text>

              {formData.goal && (
                <Text style={styles.detailText}>
                  <Text style={styles.detailBold}>
                    Goal:
                  </Text>{" "}
                  {formData.goal}
                </Text>
              )}

              <Text style={styles.detailText}>
                <Text style={styles.detailBold}>
                  Mode:
                </Text>{" "}
                {mode === "recommendation"
                  ? "AI Recommendations"
                  : "Safety Evaluation"}
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() =>
                  setShowSaveModal(false)
                }
              >
                <Text style={styles.cancelText}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalPrimaryButton}
                onPress={handleConfirmSave}
              >
                <Text
                  style={
                    styles.modalPrimaryText
                  }
                >
                  Save Build
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirm Service Request Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowConfirmModal(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Confirm Service Request
            </Text>

            <View style={styles.confirmDetails}>
              <Text style={styles.detailLabel}>
                Motorcycle
              </Text>

              <Text style={styles.detailTextStrong}>
                {formData.motorcycle ||
                  "Not selected"}
              </Text>

              <Text style={styles.detailLabel}>
                Service Type
              </Text>

              <Text style={styles.detailTextStrong}>
                {mode === "recommendation"
                  ? "AI Recommended Parts Installation"
                  : "Parts Compatibility Check"}
              </Text>

              {mode === "recommendation" &&
                formData.goal && (
                  <>
                    <Text
                      style={
                        styles.detailLabel
                      }
                    >
                      Goal
                    </Text>

                    <Text
                      style={
                        styles.detailTextStrong
                      }
                    >
                      {formData.goal}
                    </Text>
                  </>
                )}

              {mode === "recommendation" &&
                formData.parts && (
                  <>
                    <Text
                      style={
                        styles.detailLabel
                      }
                    >
                      Additional Notes
                    </Text>

                    <Text
                      style={styles.detailText}
                    >
                      {formData.parts}
                    </Text>
                  </>
                )}

              {mode === "evaluation" &&
                selectedParts.length > 0 && (
                  <>
                    <Text
                      style={
                        styles.detailLabel
                      }
                    >
                      Selected Parts
                    </Text>

                    {selectedParts.map(
                      (partId) => {
                        const part =
                          visibleInventory.find(
                            (item) =>
                              item.id ===
                              partId
                          );

                        return part ? (
                          <Text
                            key={partId}
                            style={
                              styles.detailText
                            }
                          >
                            • {part.name}
                          </Text>
                        ) : null;
                      }
                    )}
                  </>
                )}

              {result &&
                result.type ===
                  "recommendation" && (
                  <>
                    <Text
                      style={
                        styles.detailLabel
                      }
                    >
                      AI Recommended Parts
                    </Text>

                    {result.suggestions.map(
                      (suggestion, index) => (
                        <Text
                          key={index}
                          style={
                            styles.detailText
                          }
                        >
                          • {suggestion.name}
                        </Text>
                      )
                    )}
                  </>
                )}

              {result &&
                result.type === "evaluation" && (
                  <>
                    <Text
                      style={
                        styles.detailLabel
                      }
                    >
                      Evaluation Result
                    </Text>

                    <Text
                      style={
                        styles.detailText
                      }
                    >
                      {result.status} -{" "}
                      {typeof result.compatibility === "number"
                        ? `${result.compatibility}% Compatibility`
                        : result.compatibility}
                    </Text>
                  </>
                )}
            </View>

            <View style={styles.noticeBox}>
              <Text style={styles.noticeIcon}>
                ✓
              </Text>

              <Text style={styles.noticeText}>
                Your service request will be reviewed
                by our team. You'll be redirected to
                the service section to continue your
                booking.
              </Text>
            </View>

            <Text style={styles.questionText}>
              Do you want to submit this service
              request?
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() =>
                  setShowConfirmModal(false)
                }
              >
                <Text style={styles.cancelText}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalPrimaryButton}
                onPress={handleConfirmSubmit}
              >
                <Text
                  style={
                    styles.modalPrimaryText
                  }
                >
                  Submit Request
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* No Motorcycle Modal */}
      <Modal
        visible={showNoMotorcycleModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowNoMotorcycleModal(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.noMotoHeader}>
              <View style={styles.noMotoIcon}>
                <Text
                  style={
                    styles.noMotoIconText
                  }
                >
                  M
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={styles.modalTitle}
                >
                  No Motorcycle Registered
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setShowNoMotorcycleModal(false)
                }
              >
                <Text style={styles.closeButton}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              You need to register a motorcycle before
              using the AI Assistant. Please add your
              motorcycle information first.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() =>
                  setShowNoMotorcycleModal(false)
                }
              >
                <Text style={styles.cancelText}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalPrimaryButton}
                onPress={() => {
                  setShowNoMotorcycleModal(false);
                  router.push("/motorcycles");
                }}
              >
                <Text
                  style={
                    styles.modalPrimaryText
                  }
                >
                  Register Motorcycle
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </CustomerLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f5f9",
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 36,
  },

  warningBanner: {
    flexDirection: "row",
    backgroundColor: "#fff8e7",
    borderWidth: 1,
    borderColor: "#f3d58a",
    borderRadius: 16,
    padding: 15,
    marginBottom: 14,
  },

  warningIcon: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },

  warningIconText: {
    color: "#c77700",
    fontSize: 23,
    fontWeight: "700",
    lineHeight: 26,
    textAlign: "center",
  },

  warningContent: {
    flex: 1,
  },

  warningTitle: {
    color: "#78350f",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },

  warningText: {
    color: "#92400e",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 3,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e7eaf0",
    padding: 17,
    marginBottom: 15,
    shadowColor: "#172033",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.045,
    shadowRadius: 12,
    elevation: 2,
  },

  sectionTitle: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.35,
    marginBottom: 14,
  },

  modeCard: {
    borderWidth: 1.5,
    borderColor: "#e4e8ef",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },

  modeCardActive: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },

  modeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },

  modeIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#e8eefc",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  modeIconText: {
    color: "#2456c7",
    fontSize: 18,
    fontWeight: "800",
  },

  modeTitle: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
  },

  modeDescription: {
    color: "#6b7280",
    fontSize: 12,
    lineHeight: 18,
  },

  label: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 11,
  },

  selectBox: {
    minHeight: 51,
    borderWidth: 1,
    borderColor: "#d9dee8",
    backgroundColor: "#fbfcfe",
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectText: {
    flex: 1,
    color: "#111827",
    fontSize: 13,
  },

  placeholderText: {
    color: "#9ca3af",
  },

  selectArrow: {
    color: "#6b7280",
    fontSize: 10,
    marginLeft: 10,
  },

  goalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },

  goalButton: {
    borderWidth: 1,
    borderColor: "#d9dee8",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  goalButtonActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },

  goalText: {
    color: "#4b5563",
    fontSize: 12,
    fontWeight: "500",
  },

  goalTextActive: {
    color: "#ffffff",
  },

  textArea: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#d9dee8",
    backgroundColor: "#fbfcfe",
    borderRadius: 12,
    padding: 13,
    color: "#111827",
    fontSize: 13,
    lineHeight: 19,
  },

  partsBox: {
    borderWidth: 1,
    borderColor: "#e0e5ed",
    borderRadius: 13,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },

  partItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#edf0f5",
  },

  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: "#9ca3af",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 1,
  },

  checkboxSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },

  checkboxCheck: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },

  partInfo: {
    flex: 1,
  },

  partName: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "600",
  },

  partDetails: {
    color: "#6b7280",
    fontSize: 10,
    marginTop: 3,
  },

  selectedCount: {
    color: "#6b7280",
    fontSize: 11,
    marginTop: 7,
  },

  analyzeButton: {
    minHeight: 52,
    backgroundColor: "#1d4ed8",
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: "#1d4ed8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 3,
  },

  analyzeButtonDisabled: {
    backgroundColor: "#9ca3af",
    shadowOpacity: 0,
    elevation: 0,
  },

  analyzeIcon: {
    color: "#ffffff",
    fontSize: 17,
    marginRight: 8,
  },

  analyzeButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },

  resultsCard: {
    backgroundColor: "#000000",
    borderRadius: 0,
    borderWidth: 0,
    padding: 14,
    marginBottom: 15,
  },
  resultsTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 10,
  },
  resultsDivider: {
    height: 1,
    backgroundColor: "#2d2d2d",
    marginBottom: 25,
  },
  resultPartRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  resultPartImage: {
    width: 68,
    height: 68,
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },
  resultPartImagePlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  resultPartImagePlaceholderText: {
    color: "#666666",
    fontSize: 9,
  },
  resultPartDetails: {
    flex: 1,
  },

  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  resultIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#e8eefc",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  resultIconText: {
    color: "#111827",
    fontSize: 17,
  },

  resultSubheading: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 9,
  },

  resultItem: {
    borderWidth: 1,
    borderColor: "#303030",
    backgroundColor: "#050505",
    borderRadius: 8,
    padding: 11,
    marginBottom: 14,
  },

  resultItemTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },

  resultItemTitle: {
    flex: 1,
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },

  compatibilityBadge: {
    backgroundColor: "#f3f4f6",
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  compatibilityText: {
    color: "#374151",
    fontSize: 10,
    fontWeight: "600",
  },

  safetyText: {
    color: "#e5e5e5",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 8,
  },

  evaluationBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#dbeafe",
    borderRadius: 13,
    padding: 14,
    marginBottom: 16,
  },

  evaluationIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  evaluationIconText: {
    color: "#374151",
    fontSize: 15,
    fontWeight: "700",
  },

  evaluationTitle: {
    flex: 1,
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
  },

  recommendationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 7,
  },

  bullet: {
    color: "#111827",
    fontSize: 14,
    marginRight: 7,
  },

  recommendationText: {
    flex: 1,
    color: "#4b5563",
    fontSize: 12,
    lineHeight: 18,
  },

  resultActions: {
    marginTop: 18,
    gap: 9,
  },

  secondaryButton: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#d7deea",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  secondaryButtonIcon: {
    color: "#111827",
    fontSize: 16,
    marginRight: 7,
  },

  secondaryButtonText: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "600",
  },

  primaryButton: {
    minHeight: 48,
    backgroundColor: "#1d4ed8",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },

  motorcyclePickerList: {
    maxHeight: 320,
  },

  motorcyclePickerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e3e8f0",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 9,
  },

  motorcyclePickerItemSelected: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },

  motorcyclePickerInfo: {
    flex: 1,
  },

  motorcyclePickerName: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "600",
  },

  motorcyclePickerDetails: {
    color: "#6b7280",
    fontSize: 11,
    marginTop: 4,
  },

  motorcyclePickerCheck: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 18,
  },

  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    maxHeight: "90%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  modalTitle: {
    flex: 1,
    color: "#111827",
    fontSize: 17,
    fontWeight: "700",
  },

  closeButton: {
    color: "#6b7280",
    fontSize: 27,
    lineHeight: 27,
    marginLeft: 10,
  },

  modalDescription: {
    color: "#6b7280",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#d9dee8",
    backgroundColor: "#fbfcfe",
    borderRadius: 12,
    paddingHorizontal: 13,
    color: "#111827",
    fontSize: 13,
  },

  buildDetails: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 12,
    marginTop: 13,
  },

  detailLabel: {
    color: "#6b7280",
    fontSize: 10,
    marginBottom: 4,
    marginTop: 7,
  },

  detailText: {
    color: "#374151",
    fontSize: 12,
    lineHeight: 18,
  },

  detailTextStrong: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },

  detailBold: {
    fontWeight: "700",
    color: "#374151",
  },

  modalActions: {
    flexDirection: "row",
    gap: 9,
    marginTop: 16,
  },

  cancelButton: {
    flex: 1,
    minHeight: 45,
    borderRadius: 10,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "600",
  },

  modalPrimaryButton: {
    flex: 1,
    minHeight: 45,
    borderRadius: 10,
    backgroundColor: "#1f2937",
    alignItems: "center",
    justifyContent: "center",
  },

  modalPrimaryText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },

  confirmDetails: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 13,
    marginTop: 14,
  },

  noticeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 12,
    marginTop: 13,
  },

  noticeIcon: {
    color: "#374151",
    fontSize: 15,
    fontWeight: "700",
    marginRight: 8,
  },

  noticeText: {
    flex: 1,
    color: "#4b5563",
    fontSize: 11,
    lineHeight: 17,
  },

  questionText: {
    color: "#6b7280",
    fontSize: 11,
    marginTop: 13,
  },

  noMotoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  noMotoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  noMotoIconText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "700",
  },

  inventoryPriceText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
  },
  partExplanationLabel: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 2,
  },
  analysisResultHeading: {
    marginTop: 8,
  },
  resultSummaryText: {
    color: "#f0f0f0",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  historyDescription: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: -6,
    marginBottom: 10,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 12,
  },
  historyItemTextWrap: {
    flex: 1,
  },
  historyMotorcycle: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "700",
  },
  historyMeta: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 3,
  },
  historyOpen: {
    color: "#2563eb",
    fontSize: 12,
    fontWeight: "700",
  },

});