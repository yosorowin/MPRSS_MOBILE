import { useState } from "react";
import {
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

const inventory = [
  {
    id: "part-1",
    name: "Engine Oil 10W-40",
    brand: "Motul",
    category: "Lubricants",
    quantity: 45,
    price: 25,
    compatibleModels: ["All Models"],
    safetyNotes: "",
    image:
      "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "part-2",
    name: "Brake Pads - Front",
    brand: "Brembo",
    category: "Brake System",
    quantity: 8,
    price: 85,
    compatibleModels: [
      "Honda CBR600RR",
      "Yamaha R1",
      "Kawasaki ZX-10R",
    ],
    safetyNotes: "Critical safety component",
    image:
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "part-3",
    name: "Air Filter",
    brand: "K&N",
    category: "Engine",
    quantity: 15,
    price: 35,
    compatibleModels: ["All Models"],
    safetyNotes: "",
    image:
      "https://images.unsplash.com/photo-1558980664-10ea814e0b3c?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "part-4",
    name: "Chain Lubricant",
    brand: "Motul",
    category: "Lubricants",
    quantity: 5,
    price: 18,
    compatibleModels: ["All Models"],
    safetyNotes: "",
    image:
      "https://images.unsplash.com/photo-1511110423706-9f5b6c1aa1a3?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "part-5",
    name: "Spark Plugs (Set of 4)",
    brand: "NGK",
    category: "Engine",
    quantity: 12,
    price: 48,
    compatibleModels: [
      "Honda CBR600RR",
      "Yamaha R1",
    ],
    safetyNotes: "",
    image:
      "https://images.unsplash.com/photo-1600273142727-2d3dbab5e38e?auto=format&fit=crop&w=700&q=80",
  },
];

const categories = [
  "All",
  "Lubricants",
  "Brake System",
  "Engine",
];

const brands = [
  "All",
  "Motul",
  "Brembo",
  "K&N",
  "NGK",
];

export default function CustomerPartsCatalog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [brandFilter, setBrandFilter] = useState("All");

  const [showFilterMenu, setShowFilterMenu] =
    useState(false);

  const [selectedPart, setSelectedPart] =
    useState(null);

  const [partToAdd, setPartToAdd] =
    useState(null);

  const [selectedBuild, setSelectedBuild] =
    useState("My Performance Build");

  const [partsInBuild, setPartsInBuild] =
    useState([]);

  const filteredParts = inventory.filter((part) => {
    const search = searchTerm.toLowerCase();

    const name = part.name.toLowerCase();
    const brand = part.brand.toLowerCase();
    const category = part.category.toLowerCase();

    const matchesSearch =
      name.indexOf(search) !== -1 ||
      brand.indexOf(search) !== -1 ||
      category.indexOf(search) !== -1;

    const matchesCategory =
      categoryFilter === "All" ||
      part.category === categoryFilter;

    const matchesBrand =
      brandFilter === "All" ||
      part.brand === brandFilter;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesBrand
    );
  });

  const addPartToBuild = () => {
    if (!partToAdd) {
      return;
    }

    const alreadyAdded = partsInBuild.some(
      (part) => part.id === partToAdd.id
    );

    if (!alreadyAdded) {
      setPartsInBuild([
        ...partsInBuild,
        partToAdd,
      ]);
    }

    setPartToAdd(null);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("All");
    setBrandFilter("All");
  };

  return (
    <CustomerLayout title="Parts Catalog">
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* FIND PARTS */}
        <View style={styles.findPartsCard}>
          <Text style={styles.findPartsTitle}>
            Find parts for your motorcycle
          </Text>

          <Text style={styles.findPartsDescription}>
            Discover compatible parts, check
            availability, and review safety notes
            before adding them to your build.
          </Text>

          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>
              🔍
            </Text>

            <TextInput
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="Search parts, brands, or categories"
              placeholderTextColor="#9ca3af"
              style={styles.searchInput}
            />
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterMenu(true)}
          >
            <Text style={styles.filterButtonText}>
              ⚙ Filters
            </Text>
          </TouchableOpacity>

          {(categoryFilter !== "All" ||
            brandFilter !== "All") && (
            <View style={styles.activeFilters}>
              {categoryFilter !== "All" && (
                <View style={styles.filterChip}>
                  <Text
                    style={styles.filterChipText}
                  >
                    {categoryFilter}
                  </Text>
                </View>
              )}

              {brandFilter !== "All" && (
                <View style={styles.filterChip}>
                  <Text
                    style={styles.filterChipText}
                  >
                    {brandFilter}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                onPress={clearFilters}
              >
                <Text style={styles.clearText}>
                  Clear
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* RESULTS */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>
            Available Parts
          </Text>

          <Text style={styles.resultsCount}>
            {filteredParts.length} parts found
          </Text>
        </View>

        {filteredParts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              🔧
            </Text>

            <Text style={styles.emptyTitle}>
              No parts found
            </Text>

            <Text style={styles.emptyText}>
              Try changing your search or filters.
            </Text>

            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearFilters}
            >
              <Text
                style={styles.clearButtonText}
              >
                Clear Search
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredParts.map((part) => {
            const isLowStock =
              part.quantity <= 10;

            return (
              <View
                key={part.id}
                style={styles.partCard}
              >
                <Image
                  source={{ uri: part.image }}
                  style={styles.partImage}
                />

                <View style={styles.partContent}>
                  <Text style={styles.partBrand}>
                    {part.brand}
                  </Text>

                  <Text style={styles.partName}>
                    {part.name}
                  </Text>

                  <Text style={styles.partCategory}>
                    {part.category}
                  </Text>

                  <View
                    style={[
                      styles.stockBadge,
                      isLowStock &&
                        styles.lowStockBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stockText,
                        isLowStock &&
                          styles.lowStockText,
                      ]}
                    >
                      {part.quantity > 0
                        ? `In Stock: ${part.quantity}`
                        : "Out of Stock"}
                    </Text>
                  </View>

                  <Text style={styles.partPrice}>
                    ₱{part.price}
                  </Text>

                  <View
                    style={styles.compatibilityBox}
                  >
                    <Text
                      style={
                        styles.compatibilityLabel
                      }
                    >
                      Compatible With
                    </Text>

                    <Text
                      style={
                        styles.compatibilityText
                      }
                    >
                      {part.compatibleModels.join(
                        ", "
                      )}
                    </Text>
                  </View>

                  {part.safetyNotes !== "" && (
                    <View
                      style={styles.safetyBox}
                    >
                      <Text
                        style={styles.safetyTitle}
                      >
                        ⚠ Safety Note
                      </Text>

                      <Text
                        style={styles.safetyText}
                      >
                        {part.safetyNotes}
                      </Text>
                    </View>
                  )}

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={
                        styles.detailsButton
                      }
                      onPress={() =>
                        setSelectedPart(part)
                      }
                    >
                      <Text
                        style={
                          styles.detailsButtonText
                        }
                      >
                        View Details
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() =>
                        setPartToAdd(part)
                      }
                    >
                      <Text
                        style={styles.addButtonText}
                      >
                        + Add
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}

        {/* CURRENT BUILD */}
        <View style={styles.buildSummary}>
          <Text style={styles.buildLabel}>
            CURRENT BUILD
          </Text>

          <Text style={styles.buildName}>
            {selectedBuild}
          </Text>

          <Text style={styles.buildParts}>
            {partsInBuild.length} part
            {partsInBuild.length !== 1
              ? "s"
              : ""}{" "}
            added
          </Text>
        </View>
      </ScrollView>

      {/* FILTER MODAL */}
      <Modal
        visible={showFilterMenu}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowFilterMenu(false)
        }
      >
        <View style={styles.overlay}>
          <View style={styles.filterModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Filters
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setShowFilterMenu(false)
                }
              >
                <Text style={styles.closeText}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.filterLabel}>
              CATEGORY
            </Text>

            <View style={styles.chipRow}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.optionChip,
                    categoryFilter ===
                      category &&
                      styles.optionChipActive,
                  ]}
                  onPress={() =>
                    setCategoryFilter(category)
                  }
                >
                  <Text
                    style={[
                      styles.optionText,
                      categoryFilter ===
                        category &&
                        styles.optionTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text
              style={[
                styles.filterLabel,
                styles.brandLabel,
              ]}
            >
              BRAND
            </Text>

            <View style={styles.chipRow}>
              {brands.map((brand) => (
                <TouchableOpacity
                  key={brand}
                  style={[
                    styles.optionChip,
                    brandFilter === brand &&
                      styles.optionChipActive,
                  ]}
                  onPress={() =>
                    setBrandFilter(brand)
                  }
                >
                  <Text
                    style={[
                      styles.optionText,
                      brandFilter === brand &&
                        styles.optionTextActive,
                    ]}
                  >
                    {brand}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() =>
                setShowFilterMenu(false)
              }
            >
              <Text
                style={styles.applyButtonText}
              >
                Apply Filters
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* DETAILS MODAL */}
      <Modal
        visible={selectedPart !== null}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setSelectedPart(null)
        }
      >
        <View style={styles.overlay}>
          <View style={styles.detailsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Part Details
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setSelectedPart(null)
                }
              >
                <Text style={styles.closeText}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            {selectedPart && (
              <ScrollView
                showsVerticalScrollIndicator={false}
              >
                <Image
                  source={{
                    uri: selectedPart.image,
                  }}
                  style={styles.detailsImage}
                />

                <Text style={styles.detailsBrand}>
                  {selectedPart.brand}
                </Text>

                <Text style={styles.detailsName}>
                  {selectedPart.name}
                </Text>

                <Text
                  style={styles.detailsCategory}
                >
                  {selectedPart.category}
                </Text>

                <Text style={styles.detailsPrice}>
                  ₱{selectedPart.price}
                </Text>

                <View
                  style={styles.detailSection}
                >
                  <Text
                    style={styles.detailTitle}
                  >
                    Availability
                  </Text>

                  <Text
                    style={styles.detailText}
                  >
                    {selectedPart.quantity} units
                    available
                  </Text>
                </View>

                <View
                  style={styles.detailSection}
                >
                  <Text
                    style={styles.detailTitle}
                  >
                    Compatible Models
                  </Text>

                  <Text
                    style={styles.detailText}
                  >
                    {selectedPart.compatibleModels.join(
                      ", "
                    )}
                  </Text>
                </View>

                {selectedPart.safetyNotes !==
                  "" && (
                  <View
                    style={styles.detailSafety}
                  >
                    <Text
                      style={
                        styles.detailSafetyTitle
                      }
                    >
                      ⚠ Safety Notes
                    </Text>

                    <Text
                      style={
                        styles.detailSafetyText
                      }
                    >
                      {selectedPart.safetyNotes}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.fullButton}
                  onPress={() => {
                    setPartToAdd(selectedPart);
                    setSelectedPart(null);
                  }}
                >
                  <Text
                    style={
                      styles.fullButtonText
                    }
                  >
                    Add to Custom Build
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ADD TO BUILD MODAL */}
      <Modal
        visible={partToAdd !== null}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setPartToAdd(null)
        }
      >
        <View style={styles.overlay}>
          <View style={styles.buildModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Add to Custom Build
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setPartToAdd(null)
                }
              >
                <Text style={styles.closeText}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            {partToAdd && (
              <>
                <Text style={styles.addPartName}>
                  {partToAdd.name}
                </Text>

                <Text
                  style={styles.addPartDescription}
                >
                  Choose the build where you want
                  to add this part.
                </Text>

                <TouchableOpacity
                  style={styles.buildOption}
                  onPress={() =>
                    setSelectedBuild(
                      "My Performance Build"
                    )
                  }
                >
                  <Text
                    style={
                      styles.buildOptionText
                    }
                  >
                    My Performance Build
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.buildOption}
                  onPress={() =>
                    setSelectedBuild(
                      "Daily Ride Setup"
                    )
                  }
                >
                  <Text
                    style={
                      styles.buildOptionText
                    }
                  >
                    Daily Ride Setup
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={addPartToBuild}
                >
                  <Text
                    style={
                      styles.confirmButtonText
                    }
                  >
                    Add Part to Build
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </CustomerLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  findPartsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  findPartsTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },

  findPartsDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: "#6b7280",
    marginBottom: 16,
  },

  searchBox: {
    height: 48,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },

  filterButton: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingHorizontal: 15,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    justifyContent: "center",
  },

  filterButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },

  activeFilters: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 12,
  },

  filterChip: {
    backgroundColor: "#eef2ff",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 15,
    marginRight: 7,
    marginBottom: 5,
  },

  filterChipText: {
    color: "#3730a3",
    fontSize: 12,
    fontWeight: "700",
  },

  clearText: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "700",
  },

  resultsHeader: {
    marginBottom: 12,
  },

  resultsTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#111827",
  },

  resultsCount: {
    marginTop: 3,
    fontSize: 13,
    color: "#6b7280",
  },

  partCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
    marginBottom: 14,
  },

  partImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#f3f4f6",
  },

  partContent: {
    padding: 15,
  },

  partBrand: {
    fontSize: 11,
    fontWeight: "800",
    color: "#6b7280",
    textTransform: "uppercase",
  },

  partName: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },

  partCategory: {
    marginTop: 4,
    fontSize: 13,
    color: "#6b7280",
  },

  stockBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#ecfdf5",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
    marginTop: 10,
  },

  lowStockBadge: {
    backgroundColor: "#fff7ed",
  },

  stockText: {
    color: "#047857",
    fontSize: 11,
    fontWeight: "800",
  },

  lowStockText: {
    color: "#c2410c",
  },

  partPrice: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
  },

  compatibilityBox: {
    marginTop: 12,
    padding: 11,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
  },

  compatibilityLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#6b7280",
  },

  compatibilityText: {
    marginTop: 4,
    fontSize: 13,
    color: "#374151",
    lineHeight: 18,
  },

  safetyBox: {
    marginTop: 10,
    padding: 11,
    backgroundColor: "#fffbeb",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fde68a",
  },

  safetyTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#92400e",
  },

  safetyText: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: "#78350f",
  },

  actionRow: {
    flexDirection: "row",
    marginTop: 14,
  },

  detailsButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  detailsButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#374151",
  },

  addButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },

  addButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
  },

  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  emptyIcon: {
    fontSize: 32,
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },

  emptyText: {
    marginTop: 5,
    color: "#6b7280",
    fontSize: 13,
    textAlign: "center",
  },

  clearButton: {
    marginTop: 15,
    backgroundColor: "#111827",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 9,
  },

  clearButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },

  buildSummary: {
    marginTop: 6,
    padding: 16,
    backgroundColor: "#111827",
    borderRadius: 15,
  },

  buildLabel: {
    fontSize: 10,
    color: "#9ca3af",
    fontWeight: "800",
    letterSpacing: 1,
  },

  buildName: {
    marginTop: 5,
    fontSize: 17,
    color: "#ffffff",
    fontWeight: "800",
  },

  buildParts: {
    marginTop: 4,
    color: "#d1d5db",
    fontSize: 13,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  filterModal: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    maxHeight: "80%",
  },

  detailsModal: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    maxHeight: "88%",
  },

  buildModal: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },

  closeText: {
    fontSize: 30,
    color: "#6b7280",
  },

  filterLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#6b7280",
    marginBottom: 10,
  },

  brandLabel: {
    marginTop: 22,
  },

  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginRight: 8,
    marginBottom: 8,
  },

  optionChipActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },

  optionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },

  optionTextActive: {
    color: "#ffffff",
  },

  applyButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },

  applyButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },

  detailsImage: {
    width: "100%",
    height: 210,
    borderRadius: 14,
    marginBottom: 15,
  },

  detailsBrand: {
    fontSize: 11,
    fontWeight: "800",
    color: "#6b7280",
  },

  detailsName: {
    marginTop: 4,
    fontSize: 23,
    fontWeight: "900",
    color: "#111827",
  },

  detailsCategory: {
    marginTop: 5,
    fontSize: 13,
    color: "#6b7280",
  },

  detailsPrice: {
    marginTop: 12,
    fontSize: 21,
    fontWeight: "900",
    color: "#111827",
  },

  detailSection: {
    marginTop: 18,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },

  detailTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },

  detailText: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 19,
  },

  detailSafety: {
    marginTop: 18,
    padding: 13,
    backgroundColor: "#fffbeb",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fde68a",
  },

  detailSafetyTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#92400e",
  },

  detailSafetyText: {
    marginTop: 5,
    fontSize: 13,
    color: "#78350f",
  },

  fullButton: {
    marginTop: 20,
    height: 50,
    borderRadius: 11,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },

  fullButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },

  addPartName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },

  addPartDescription: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: "#6b7280",
  },

  buildOption: {
    marginTop: 12,
    padding: 15,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },

  buildOptionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  confirmButton: {
    height: 50,
    borderRadius: 11,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },

  confirmButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
});