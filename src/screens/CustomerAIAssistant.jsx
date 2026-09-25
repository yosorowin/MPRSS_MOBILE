import { useRouter } from "expo-router";
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

import {
    getMotorcycles,
    subscribeToMotorcycles,
} from "../data/motorcycleStore";

const inventory = [
  {
    id: "part-1",
    name: "Engine Oil 10W-40",
    brand: "Motul",
    category: "Lubricants",
    price: 25,
    visibleToCustomers: true,
  },
  {
    id: "part-2",
    name: "Brake Pads - Front",
    brand: "Brembo",
    category: "Brake System",
    price: 85,
    visibleToCustomers: true,
  },
  {
    id: "part-3",
    name: "Air Filter",
    brand: "K&N",
    category: "Engine",
    price: 35,
    visibleToCustomers: true,
  },
  {
    id: "part-4",
    name: "Chain Lubricant",
    brand: "Motul",
    category: "Lubricants",
    price: 18,
    visibleToCustomers: true,
  },
  {
    id: "part-5",
    name: "Spark Plugs (Set of 4)",
    brand: "NGK",
    category: "Engine",
    price: 48,
    visibleToCustomers: true,
  },
];

export default function CustomerAIAssistant() {
  const router = useRouter();

  const [mode, setMode] = useState("recommendation");

  const [motorcycles, setMotorcycles] = useState([]);

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

  useEffect(() => {
    const updateMotorcycles = () => {
      setMotorcycles(getMotorcycles());
    };

    updateMotorcycles();

    const unsubscribe =
      subscribeToMotorcycles(updateMotorcycles);

    return unsubscribe;
  }, []);

  const visibleInventory = inventory.filter(
    (part) => part.visibleToCustomers
  );

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

  const handleAnalyze = () => {
    if (motorcycles.length === 0) {
      setShowNoMotorcycleModal(true);
      return;
    }

    if (!formData.motorcycle) {
      Alert.alert(
        "Select Motorcycle",
        "Please select a motorcycle first."
      );
      return;
    }

    if (
      mode === "recommendation" &&
      !formData.goal
    ) {
      Alert.alert(
        "Select Goal",
        "Please select your goal first."
      );
      return;
    }

    if (
      mode === "evaluation" &&
      selectedParts.length === 0
    ) {
      Alert.alert(
        "Select Parts",
        "Please select at least one part to evaluate."
      );
      return;
    }

    setLoading(true);
    setResult(null);

    setTimeout(() => {
      if (mode === "recommendation") {
        setResult({
          type: "recommendation",
          suggestions: [
            {
              name: "Performance Exhaust System",
              compatibility: 95,
              safetyNote:
                "Safe - Ensure professional installation",
            },
            {
              name: "High-Flow Air Filter",
              compatibility: 98,
              safetyNote:
                "Safe - Compatible with stock ECU",
            },
            {
              name: "ECU Flash Tune",
              compatibility: 90,
              safetyNote:
                "Caution - Requires dyno tuning",
            },
          ],
        });
      } else {
        setResult({
          type: "evaluation",
          status: "Safe",
          compatibility: 92,
          recommendations: [
            "All selected parts are compatible",
            "Professional installation recommended",
            "Consider regular maintenance checks",
          ],
          selectedParts: selectedParts
            .map(
              (id) =>
                inventory.find(
                  (part) => part.id === id
                )?.name
            )
            .filter(Boolean),
        });
      }

      setLoading(false);
    }, 1500);
  };

  const handleSave = () => {
    if (!result) {
      return;
    }

    setShowSaveModal(true);
  };

  const handleConfirmSave = () => {
    setShowSaveModal(false);

    const finalName =
      buildName ||
      `${formData.motorcycle || "My"} ${
        formData.goal || "Custom"
      } Build`;

    setBuildName("");

    Alert.alert(
      "Build Saved",
      `"${finalName}" has been saved successfully.`
    );
  };

  const handleRequestService = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    router.push("/services");
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
            <Text style={styles.warningIconText}>!</Text>
          </View>

          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>
              Important Safety Notice
            </Text>

            <Text style={styles.warningText}>
              ⚠ Recommendations are based on motorcycle
              specifications and shop guidelines.
            </Text>

            <Text style={styles.warningText}>
              ⚠ Consult a professional mechanic before
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
                          {part.category} • ₱
                          {(
                            part.price * 50
                          ).toLocaleString()}
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
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.analyzeIcon}>
              ✦
            </Text>

            <Text style={styles.analyzeButtonText}>
              {loading
                ? "Analyzing..."
                : "Analyze with AI"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Results */}
        {result && (
          <View style={styles.card}>
            <View style={styles.resultHeader}>
              <View style={styles.resultIcon}>
                <Text style={styles.resultIconText}>
                  ✦
                </Text>
              </View>

              <Text style={styles.sectionTitle}>
                AI Analysis Results
              </Text>
            </View>

            {result.type === "recommendation" ? (
              <>
                <Text style={styles.resultSubheading}>
                  Recommended Parts:
                </Text>

                {result.suggestions.map(
                  (suggestion, index) => (
                    <View
                      key={index}
                      style={styles.resultItem}
                    >
                      <View
                        style={
                          styles.resultItemTop
                        }
                      >
                        <Text
                          style={
                            styles.resultItemTitle
                          }
                        >
                          {suggestion.name}
                        </Text>

                        <View
                          style={
                            styles.compatibilityBadge
                          }
                        >
                          <Text
                            style={
                              styles.compatibilityText
                            }
                          >
                            {
                              suggestion.compatibility
                            }
                            % Compatible
                          </Text>
                        </View>
                      </View>

                      <Text
                        style={
                          styles.safetyText
                        }
                      >
                        ✓ {suggestion.safetyNote}
                      </Text>
                    </View>
                  )
                )}
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
                    {result.compatibility}%
                    Compatibility
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
                const value = `${motorcycle.brand} ${motorcycle.model} (${motorcycle.year})`;

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
                        {motorcycle.brand}{" "}
                        {motorcycle.model}
                      </Text>

                      <Text
                        style={
                          styles.motorcyclePickerDetails
                        }
                      >
                        {motorcycle.year} Model
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
                          inventory.find(
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
                      {result.compatibility}%
                      Compatibility
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
    backgroundColor: "#f9fafb",
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  warningBanner: {
    flexDirection: "row",
    backgroundColor: "#fffbeb",
    borderWidth: 2,
    borderColor: "#fbbf24",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },

  warningIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f59e0b",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  warningIconText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
    marginBottom: 14,
  },

  sectionTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 14,
  },

  modeCard: {
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },

  modeCardActive: {
    borderColor: "#1f2937",
    backgroundColor: "#f9fafb",
  },

  modeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },

  modeIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  modeIconText: {
    color: "#374151",
    fontSize: 17,
    fontWeight: "700",
  },

  modeTitle: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
  },

  modeDescription: {
    color: "#6b7280",
    fontSize: 12,
    lineHeight: 18,
  },

  label: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 7,
    marginTop: 8,
  },

  selectBox: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 13,
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
    borderColor: "#d1d5db",
    borderRadius: 9,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },

  goalButtonActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
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
    minHeight: 92,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    color: "#111827",
    fontSize: 13,
  },

  partsBox: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    overflow: "hidden",
  },

  partItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
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
    backgroundColor: "#111827",
    borderColor: "#111827",
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
    minHeight: 48,
    backgroundColor: "#1f2937",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },

  analyzeButtonDisabled: {
    backgroundColor: "#9ca3af",
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

  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  resultIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  resultIconText: {
    color: "#111827",
    fontSize: 17,
  },

  resultSubheading: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 9,
  },

  resultItem: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 13,
    marginBottom: 9,
  },

  resultItemTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },

  resultItemTitle: {
    flex: 1,
    color: "#111827",
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
    color: "#6b7280",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 8,
  },

  evaluationBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 13,
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
    minHeight: 46,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
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
    minHeight: 46,
    backgroundColor: "#1f2937",
    borderRadius: 10,
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
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 13,
    marginBottom: 8,
  },

  motorcyclePickerItemSelected: {
    borderColor: "#111827",
    backgroundColor: "#f9fafb",
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
    borderRadius: 16,
    padding: 18,
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
    height: 46,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
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
});