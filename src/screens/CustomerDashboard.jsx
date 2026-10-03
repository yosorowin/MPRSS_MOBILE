import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "../firebase";

import CustomerLayout from "../components/CustomerLayout";

// ─────────────────────────────────────────────────────────────────────────────
// Highest-Selling Parts — UI only
// ─────────────────────────────────────────────────────────────────────────────

const TOP_PARTS = [
  {
    id: 1,
    name: "Front Brake Disc Pad Set",
    category: "Brakes",
    unitsSold: 2847,
    image:
      "https://images.unsplash.com/photo-1544515137-1950c9866aef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
  },
  {
    id: 2,
    name: "Drive Chain & Sprocket Kit",
    category: "Drivetrain",
    unitsSold: 2214,
    image:
      "https://images.unsplash.com/photo-1769537754999-724044ec2e32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
  },
  {
    id: 3,
    name: "Oil Filter (Pleated)",
    category: "Engine",
    unitsSold: 1983,
    image:
      "https://images.unsplash.com/photo-1777118947168-b6e806cb80cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
  },
  {
    id: 4,
    name: "Iridium Spark Plug",
    category: "Ignition",
    unitsSold: 1756,
    image:
      "https://images.unsplash.com/photo-1782885044133-27c4df887d96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
  },
  {
    id: 5,
    name: "Rear Performance Tire",
    category: "Wheels",
    unitsSold: 1492,
    image:
      "https://images.unsplash.com/photo-1612692064035-df2d74a77cb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
  },
  {
    id: 6,
    name: "Front Brake Caliper",
    category: "Brakes",
    unitsSold: 1305,
    image:
      "https://images.unsplash.com/photo-1762012507780-060fe0bcc783?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
  },
];

const SCREEN_WIDTH = Dimensions.get("window").width;
const CAROUSEL_WIDTH = SCREEN_WIDTH - 32;
const CARD_WIDTH = CAROUSEL_WIDTH * 0.88;

// ─────────────────────────────────────────────────────────────────────────────
// Highest-Selling Parts Carousel
// ─────────────────────────────────────────────────────────────────────────────

function PartsCarousel() {
  const [current, setCurrent] = useState(0);

  const goTo = (index) => {
    setCurrent(
      Math.max(0, Math.min(index, TOP_PARTS.length - 1))
    );
  };

  const handleScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;

    const index = Math.round(
      offsetX / (CARD_WIDTH + 12)
    );

    setCurrent(
      Math.max(0, Math.min(index, TOP_PARTS.length - 1))
    );
  };

  return (
    <View style={styles.partsSection}>
      <View style={styles.partsHeader}>
        <View style={styles.partsHeaderLeft}>
          <Text style={styles.partsTrendingIcon}>↗</Text>

          <Text style={styles.partsSectionTitle}>
            HIGHEST-SELLING PARTS
          </Text>
        </View>

        <View style={styles.partsNavigation}>
          <TouchableOpacity
            style={[
              styles.partsNavButton,
              current === 0 &&
                styles.partsNavButtonDisabled,
            ]}
            disabled={current === 0}
            onPress={() => goTo(current - 1)}
          >
            <Text style={styles.partsNavText}>‹</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.partsNavButton,
              current === TOP_PARTS.length - 1 &&
                styles.partsNavButtonDisabled,
            ]}
            disabled={current === TOP_PARTS.length - 1}
            onPress={() => goTo(current + 1)}
          >
            <Text style={styles.partsNavText}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 12}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScrollEnd}
        contentContainerStyle={styles.partsCarouselContent}
      >
        {TOP_PARTS.map((part, index) => (
          <View
            key={part.id}
            style={[
              styles.partCarouselCard,
              {
                width: CARD_WIDTH,
                opacity:
                  index === current ? 1 : 0.6,
              },
            ]}
          >
            <View style={styles.partImageContainer}>
              <Image
                source={{ uri: part.image }}
                style={styles.partImage}
                resizeMode="cover"
              />

              <View style={styles.partRankBadge}>
                <Text style={styles.partRankText}>
                  #{index + 1}
                </Text>
              </View>

              <View
                style={styles.highestSellingBadge}
              >
                <Text
                  style={styles.highestSellingIcon}
                >
                  ↗
                </Text>

                <Text
                  style={styles.highestSellingText}
                >
                  HIGHEST SELLING
                </Text>
              </View>
            </View>

            <View style={styles.partInfo}>
              <View style={styles.partInfoText}>
                <Text style={styles.partCategory}>
                  {part.category}
                </Text>

                <Text
                  style={styles.partName}
                  numberOfLines={2}
                >
                  {part.name}
                </Text>
              </View>

              <View style={styles.unitsContainer}>
                <Text style={styles.unitsSold}>
                  {part.unitsSold.toLocaleString()}
                </Text>

                <Text style={styles.unitsLabel}>
                  units sold
                </Text>
              </View>
            </View>

            <View
              style={styles.partProgressContainer}
            >
              <View
                style={
                  styles.partProgressBackground
                }
              >
                <View
                  style={[
                    styles.partProgressFill,
                    {
                      width: `${
                        (part.unitsSold /
                          TOP_PARTS[0].unitsSold) *
                        100
                      }%`,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.partsPagination}>
        {TOP_PARTS.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => goTo(index)}
            style={[
              styles.paginationDot,
              index === current
                ? styles.paginationDotActive
                : styles.paginationDotInactive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Customer Dashboard
// ─────────────────────────────────────────────────────────────────────────────

export default function CustomerDashboard() {
  const router = useRouter();

  // ─────────────────────────────────────────────────────────────────────────
  // Firebase Customer Information
  // ─────────────────────────────────────────────────────────────────────────

  const [currentUser, setCurrentUser] = useState(null);

  const [customerProfile, setCustomerProfile] =
    useState(null);

  const [motorcycles, setMotorcycles] = useState([]);

  const [services, setServices] = useState([]);

  const [activeMotoIndex, setActiveMotoIndex] = useState(0);

  // ─────────────────────────────────────────────────────────────────────────
  // Firebase Authentication
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setCurrentUser(user || null);

        if (!user) {
          setCustomerProfile(null);
          setMotorcycles([]);
          setServices([]);
          setActiveMotoIndex(0);
        }
      }
    );

    return unsubscribe;
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Firebase Customer Profile
  // customers/{Firebase UID}
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!currentUser?.uid) {
      setCustomerProfile(null);
      return undefined;
    }

    const customerRef = doc(
      db,
      "customers",
      currentUser.uid
    );

    const unsubscribe = onSnapshot(
      customerRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();

          setCustomerProfile({
            id: snapshot.id,
            ...data,
          });

          console.log(
            "Firebase customer profile:",
            {
              uid: currentUser.uid,
              email: currentUser.email,
              ...data,
            }
          );
        } else {
          console.warn(
            "Customer profile not found in Firestore:",
            currentUser.uid
          );

          setCustomerProfile(null);
        }
      },
      (error) => {
        console.error(
          "Error loading customer profile:",
          error
        );

        setCustomerProfile(null);
      }
    );

    return unsubscribe;
  }, [currentUser?.uid]);

  // ─────────────────────────────────────────────────────────────────────────
  // Firebase Motorcycles
  // motorcycles where customerId == current user's UID
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
        const motorcycleList = snapshot.docs.map(
          (motorcycleDoc) => ({
            id: motorcycleDoc.id,
            ...motorcycleDoc.data(),
          })
        );

        console.log(
          "Dashboard motorcycles synced:",
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
          "Error loading dashboard motorcycles:",
          error
        );

        setMotorcycles([]);
      }
    );

    return unsubscribe;
  }, [currentUser?.uid]);

  // ─────────────────────────────────────────────────────────────────────────
  // Firebase Services
  // services where customerId == current user's UID
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!currentUser?.uid) {
      setServices([]);
      return undefined;
    }

    const servicesQuery = query(
      collection(db, "services"),
      where(
        "customerId",
        "==",
        currentUser.uid
      )
    );

    const unsubscribe = onSnapshot(
      servicesQuery,
      (snapshot) => {
        const serviceList = snapshot.docs.map(
          (serviceDoc) => ({
            id: serviceDoc.id,
            ...serviceDoc.data(),
          })
        );

        console.log(
          "Dashboard services synced:",
          serviceList
        );

        setServices(
          Array.isArray(serviceList)
            ? serviceList
            : []
        );
      },
      (error) => {
        console.error(
          "Error loading dashboard services:",
          error
        );

        setServices([]);
      }
    );

    return unsubscribe;
  }, [currentUser?.uid]);

  // ─────────────────────────────────────────────────────────────────────────
  // Always keep these as arrays
  // ─────────────────────────────────────────────────────────────────────────

  const motorcycleList = Array.isArray(motorcycles)
    ? motorcycles
    : [];

  const serviceList = Array.isArray(services)
    ? services
    : [];

  // ─────────────────────────────────────────────────────────────────────────
  // Active Services
  // ─────────────────────────────────────────────────────────────────────────

  const activeServices = serviceList
    .filter((service) => {
      const status = String(
        service?.status || ""
      ).toLowerCase();

      return [
        "pending approval",
        "pending",
        "approved",
        "active",
        "in progress",
        "waiting for parts",
        "quality check",
      ].includes(status);
    })
    .sort((a, b) => {
      const aDate =
        a?.updatedAt?.toMillis?.() ||
        a?.createdAt?.toMillis?.() ||
        0;

      const bDate =
        b?.updatedAt?.toMillis?.() ||
        b?.createdAt?.toMillis?.() ||
        0;

      return bDate - aDate;
    });

  // ─────────────────────────────────────────────────────────────────────────
  // Recently Completed Services
  // ─────────────────────────────────────────────────────────────────────────

  const completedServices = serviceList
    .filter((service) => {
      const status = String(
        service?.status || ""
      ).toLowerCase();

      return status === "completed";
    })
    .sort((a, b) => {
      const aDate =
        a?.completedAt?.toMillis?.() ||
        a?.updatedAt?.toMillis?.() ||
        a?.createdAt?.toMillis?.() ||
        0;

      const bDate =
        b?.completedAt?.toMillis?.() ||
        b?.updatedAt?.toMillis?.() ||
        b?.createdAt?.toMillis?.() ||
        0;

      return bDate - aDate;
    })
    .slice(0, 3);

  // ─────────────────────────────────────────────────────────────────────────
  // Motorcycle Index
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (motorcycleList.length === 0) {
      if (activeMotoIndex !== 0) {
        setActiveMotoIndex(0);
      }

      return;
    }

    if (
      activeMotoIndex >= motorcycleList.length
    ) {
      setActiveMotoIndex(
        motorcycleList.length - 1
      );
    }
  }, [motorcycleList.length, activeMotoIndex]);

  const activeMoto =
    motorcycleList.length > 0
      ? motorcycleList[activeMotoIndex]
      : null;

  // ─────────────────────────────────────────────────────────────────────────
  // Current Service
  // ─────────────────────────────────────────────────────────────────────────

  const currentService =
    activeServices.length > 0
      ? activeServices[0]
      : null;

  // ─────────────────────────────────────────────────────────────────────────
  // Firebase Customer Display Information
  // ─────────────────────────────────────────────────────────────────────────

  const customerName =
    customerProfile?.fullName ||
    currentUser?.displayName ||
    "Customer";

  const customerRole =
    customerProfile?.role || "customer";

  const goTo = (route) => {
    router.push(route);
  };

  return (
    <CustomerLayout title="Dashboard">
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <View>
            <Text style={styles.headerTitle}>
              {customerName}
            </Text>

            <Text style={styles.headerName}>
              {customerRole === "customer"
                ? "Customer"
                : customerRole}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => {}}
        >
          <Text style={styles.notificationIcon}>
            ●
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Motorcycle */}
        <View style={styles.darkCard}>
          <View style={styles.darkTopRow}>
            <View style={styles.darkInfo}>
              <Text style={styles.overlineDark}>
                ACTIVE MOTORCYCLE
              </Text>

              {activeMoto ? (
                <>
                  <Text style={styles.motorcycleName}>
                    {activeMoto.brand}{" "}
                    {activeMoto.model}
                  </Text>

                  <Text style={styles.motorcycleSub}>
                    {activeMoto.plate || "No plate"} •{" "}
                    {activeMoto.year || "Year N/A"} Model
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.motorcycleName}>
                    No Motorcycle Registered
                  </Text>

                  <Text style={styles.motorcycleSub}>
                    Add a motorcycle to get started
                  </Text>
                </>
              )}
            </View>

            {activeMoto ? (
              motorcycleList.length > 1 && (
                <View style={styles.switcher}>
                  <TouchableOpacity
                    style={styles.switchButton}
                    onPress={() =>
                      setActiveMotoIndex(
                        (index) =>
                          (index -
                            1 +
                            motorcycleList.length) %
                          motorcycleList.length
                      )
                    }
                  >
                    <Text style={styles.switchText}>
                      ‹
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.switchCount}>
                    {activeMotoIndex + 1}/
                    {motorcycleList.length}
                  </Text>

                  <TouchableOpacity
                    style={styles.switchButton}
                    onPress={() =>
                      setActiveMotoIndex(
                        (index) =>
                          (index + 1) %
                          motorcycleList.length
                      )
                    }
                  >
                    <Text style={styles.switchText}>
                      ›
                    </Text>
                  </TouchableOpacity>
                </View>
              )
            ) : (
              <TouchableOpacity
                style={styles.addMotorcycleButton}
                onPress={() => goTo("/motorcycles")}
                activeOpacity={0.8}
              >
                <Text style={styles.addMotorcyclePlus}>
                  +
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {activeMoto && (
            <View style={styles.motorcycleStats}>
              <View style={styles.darkStat}>
                <Text
                  style={styles.statLabelDark}
                >
                  LAST SERVICE
                </Text>

                <Text
                  style={styles.statValueDark}
                >
                  {activeMoto.lastService || "—"}
                </Text>
              </View>

              <View style={styles.darkStat}>
                <Text
                  style={styles.statLabelDark}
                >
                  NEXT DUE
                </Text>

                <Text
                  style={styles.statValueDark}
                >
                  {activeMoto.nextDue || "—"}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Highest-Selling Parts */}
        <PartsCarousel />

        {/* Current Service */}
        <View style={styles.card}>
          <Text style={styles.overline}>
            CURRENT SERVICE
          </Text>

          {currentService ? (
            <>
              <Text style={styles.cardTitle}>
                {currentService.serviceType ||
                  "Service Request"}
              </Text>

              <Text style={styles.cardSub}>
                {currentService.motorcycle ||
                  "Motorcycle"}
              </Text>

              <View
                style={styles.serviceBottomRow}
              >
                <View style={styles.statusBadge}>
                  <Text
                    style={styles.statusBadgeText}
                  >
                    {currentService.status ||
                      "Pending Approval"}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    goTo("/services")
                  }
                >
                  <Text style={styles.viewDetails}>
                    View Details →
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.emptyText}>
                You currently have no ongoing
                service requests.
              </Text>

              <TouchableOpacity
                style={styles.outlineButton}
                onPress={() =>
                  goTo("/services")
                }
              >
                <Text
                  style={styles.outlineButtonText}
                >
                  + Request Service
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Next Maintenance */}
        <View style={styles.card}>
          <Text style={styles.overline}>
            NEXT MAINTENANCE
          </Text>

          <View style={styles.maintenanceRow}>
            <View style={styles.maintenanceIcon}>
              <Text style={styles.wrenchIcon}>
                W
              </Text>
            </View>

            <View style={styles.maintenanceInfo}>
              <Text style={styles.cardTitle}>
                Oil Change
              </Text>

              <Text style={styles.cardSub}>
                Due: March 15, 2026
              </Text>
            </View>
          </View>
        </View>

        {/* Maintenance History */}
        <View style={styles.card}>
          <Text style={styles.overline}>
            MAINTENANCE HISTORY
          </Text>

          <View style={styles.historyRow}>
            <View style={styles.historyItem}>
              <Text style={styles.historyIcon}>
                ✓
              </Text>

              <Text style={styles.historyNumber}>
                {completedServices.length}
              </Text>

              <Text style={styles.historyLabel}>
                Completed
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.historyItem}>
              <Text style={styles.historyIcon}>
                W
              </Text>

              <Text style={styles.historyNumber}>
                {activeServices.length}
              </Text>

              <Text style={styles.historyLabel}>
                Active
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.historyItem}>
              <Text style={styles.historyIcon}>
                ◷
              </Text>

              <Text style={styles.historyNumber}>
                0
              </Text>

              <Text style={styles.historyLabel}>
                Upcoming
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.overline}>
            QUICK ACTIONS
          </Text>

          <View style={styles.quickGrid}>
            <TouchableOpacity
              style={styles.quickCard}
              onPress={() =>
                goTo("/services")
              }
            >
              <View style={styles.quickIcon}>
                <Text style={styles.quickIconText}>
                  +
                </Text>
              </View>

              <Text style={styles.quickText}>
                Request Service
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickCard}
              onPress={() =>
                goTo("/ai-assistant")
              }
            >
              <View style={styles.quickIcon}>
                <Text style={styles.quickIconText}>
                  ✦
                </Text>
              </View>

              <Text style={styles.quickText}>
                AI Assistant
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickCard}
              onPress={() =>
                goTo("/parts-catalog")
              }
            >
              <View style={styles.quickIcon}>
                <Text style={styles.quickIconText}>
                  □
                </Text>
              </View>

              <Text style={styles.quickText}>
                Browse Parts
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickCard}
              onPress={() =>
                goTo("/builds")
              }
            >
              <View style={styles.quickIcon}>
                <Text style={styles.quickIconText}>
                  ▤
                </Text>
              </View>

              <Text style={styles.quickText}>
                My Builds
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Services */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.cardSectionTitle}>
              Active Services
            </Text>

            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>
                {activeServices.length}
              </Text>
            </View>
          </View>

          {activeServices.length > 0 ? (
            activeServices.map((service) => (
              <View
                key={service.id}
                style={styles.serviceItem}
              >
                <View
                  style={styles.serviceItemTop}
                >
                  <View
                    style={
                      styles.serviceItemInfo
                    }
                  >
                    <Text
                      style={
                        styles.serviceItemTitle
                      }
                    >
                      {service.serviceType ||
                        "Service Request"}
                    </Text>

                    <Text
                      style={
                        styles.serviceItemMoto
                      }
                    >
                      {service.motorcycle ||
                        "Motorcycle"}
                    </Text>
                  </View>

                  <View
                    style={styles.statusBadge}
                  >
                    <Text
                      style={
                        styles.statusBadgeText
                      }
                    >
                      {service.status ||
                        "Pending Approval"}
                    </Text>
                  </View>
                </View>

                <View
                  style={styles.serviceItemBottom}
                >
                  <Text
                    style={styles.serviceId}
                  >
                    {service.id}
                  </Text>

                  <Text
                    style={styles.serviceCost}
                  >
                    ₱
                    {Number(
                      service.estimatedCost || 0
                    ).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyService}>
              <Text style={styles.emptyText}>
                No active services
              </Text>
            </View>
          )}
        </View>

        {/* Recent Completed */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>
            Recent Completed
          </Text>

          {completedServices.length > 0 ? (
            completedServices.map((service) => {
              const rating = Number(
                service?.rating || 0
              );

              return (
                <View
                  key={service.id}
                  style={styles.serviceItem}
                >
                  <View
                    style={styles.serviceItemTop}
                  >
                    <View
                      style={
                        styles.serviceItemInfo
                      }
                    >
                      <Text
                        style={
                          styles.serviceItemTitle
                        }
                      >
                        {service.serviceType ||
                          "Completed Service"}
                      </Text>

                      <Text
                        style={
                          styles.serviceItemMoto
                        }
                      >
                        {service.motorcycle ||
                          "Motorcycle"}
                      </Text>
                    </View>

                    <View style={styles.doneBadge}>
                      <Text
                        style={styles.doneBadgeText}
                      >
                        Done
                      </Text>
                    </View>
                  </View>

                  <View
                    style={styles.serviceItemBottom}
                  >
                    <Text style={styles.rating}>
                      {rating > 0
                        ? "★".repeat(rating)
                        : "Completed"}
                    </Text>

                    <Text
                      style={styles.serviceCost}
                    >
                      ₱
                      {Number(
                        service.estimatedCost || 0
                      ).toLocaleString()}
                    </Text>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyService}>
              <Text style={styles.emptyText}>
                No completed services yet
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </CustomerLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },

  header: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  logo: {
    width: 70,
    height: 28,
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },

  headerName: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },

  notificationButton: {
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },

  notificationIcon: {
    color: "#111827",
    fontSize: 12,
  },

  content: {
    padding: 16,
    paddingBottom: 36,
  },

  darkCard: {
    backgroundColor: "#0a0f1a",
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
  },

  darkTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  darkInfo: {
    flex: 1,
  },

  overlineDark: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1.5,
    marginBottom: 6,
  },

  motorcycleName: {
    color: "#ffffff",
    fontSize: 21,
    fontWeight: "700",
  },

  motorcycleSub: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 4,
  },

  switcher: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  switchButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  switchText: {
    color: "#ffffff",
    fontSize: 18,
  },

  switchCount: {
    color: "#94a3b8",
    fontSize: 11,
    minWidth: 24,
    textAlign: "center",
  },

  addMotorcycleButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },

  addMotorcyclePlus: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "300",
    lineHeight: 30,
  },

  motorcycleStats: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },

  darkStat: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 10,
    padding: 12,
  },

  statLabelDark: {
    color: "#94a3b8",
    fontSize: 9,
    letterSpacing: 1.2,
    marginBottom: 5,
  },

  statValueDark: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },

  partsSection: {
    marginBottom: 14,
  },

  partsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 2,
  },

  partsHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  partsTrendingIcon: {
    color: "#6b7280",
    fontSize: 15,
    fontWeight: "700",
  },

  partsSectionTitle: {
    color: "#9ca3af",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1.5,
  },

  partsNavigation: {
    flexDirection: "row",
    gap: 5,
  },

  partsNavButton: {
    width: 28,
    height: 28,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },

  partsNavButtonDisabled: {
    opacity: 0.3,
  },

  partsNavText: {
    color: "#4b5563",
    fontSize: 19,
    lineHeight: 20,
    fontWeight: "500",
  },

  partsCarouselContent: {
    paddingRight: 16,
  },

  partCarouselCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
    marginRight: 12,
  },

  partImageContainer: {
    height: 175,
    backgroundColor: "#f3f4f6",
    position: "relative",
  },

  partImage: {
    width: "100%",
    height: "100%",
  },

  partRankBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: "#0a0f1a",
    alignItems: "center",
    justifyContent: "center",
  },

  partRankText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },

  highestSellingBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(10,15,26,0.92)",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  highestSellingIcon: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "700",
  },

  highestSellingText: {
    color: "#ffffff",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.8,
  },

  partInfo: {
    paddingHorizontal: 15,
    paddingTop: 13,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  partInfoText: {
    flex: 1,
    paddingRight: 10,
  },

  partCategory: {
    color: "#9ca3af",
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 3,
  },

  partName: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 19,
  },

  unitsContainer: {
    alignItems: "flex-end",
    flexShrink: 0,
  },

  unitsSold: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 22,
  },

  unitsLabel: {
    color: "#9ca3af",
    fontSize: 8,
    fontWeight: "500",
    marginTop: 2,
  },

  partProgressContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },

  partProgressBackground: {
    height: 4,
    backgroundColor: "#f3f4f6",
    borderRadius: 999,
    overflow: "hidden",
  },

  partProgressFill: {
    height: "100%",
    backgroundColor: "#0a0f1a",
    borderRadius: 999,
  },

  partsPagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 10,
  },

  paginationDot: {
    height: 6,
    borderRadius: 999,
  },

  paginationDotActive: {
    width: 16,
    backgroundColor: "#374151",
  },

  paginationDotInactive: {
    width: 6,
    backgroundColor: "#d1d5db",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#eef0f2",
    padding: 18,
    marginBottom: 14,
  },

  overline: {
    color: "#9ca3af",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1.4,
    marginBottom: 12,
  },

  cardTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
  },

  cardSub: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 4,
  },

  serviceBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },

  statusBadge: {
    backgroundColor: "#f3f4f6",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  statusBadgeText: {
    color: "#4b5563",
    fontSize: 10,
    fontWeight: "600",
  },

  viewDetails: {
    color: "#6b7280",
    fontSize: 11,
    fontWeight: "600",
  },

  emptyText: {
    color: "#9ca3af",
    fontSize: 13,
    lineHeight: 20,
  },

  outlineButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginTop: 12,
  },

  outlineButtonText: {
    color: "#374151",
    fontSize: 11,
    fontWeight: "600",
  },

  maintenanceRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  maintenanceIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  wrenchIcon: {
    color: "#4b5563",
    fontSize: 15,
    fontWeight: "700",
  },

  maintenanceInfo: {
    flex: 1,
  },

  historyRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  historyItem: {
    flex: 1,
    alignItems: "center",
  },

  historyIcon: {
    color: "#6b7280",
    fontSize: 15,
    marginBottom: 5,
  },

  historyNumber: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "700",
  },

  historyLabel: {
    color: "#9ca3af",
    fontSize: 10,
    marginTop: 3,
  },

  divider: {
    width: 1,
    height: 42,
    backgroundColor: "#e5e7eb",
  },

  section: {
    marginBottom: 8,
  },

  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  quickCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#eef0f2",
    borderRadius: 14,
    padding: 14,
  },

  quickIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: "#0a0f1a",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  quickIconText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
  },

  quickText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  cardSectionTitle: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "700",
  },

  countBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },

  countBadgeText: {
    color: "#6b7280",
    fontSize: 10,
    fontWeight: "600",
  },

  serviceItem: {
    borderWidth: 1,
    borderColor: "#eef0f2",
    borderRadius: 12,
    padding: 13,
    marginTop: 9,
  },

  serviceItemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },

  serviceItemInfo: {
    flex: 1,
  },

  serviceItemTitle: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "600",
  },

  serviceItemMoto: {
    color: "#6b7280",
    fontSize: 11,
    marginTop: 4,
  },

  serviceItemBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },

  serviceId: {
    color: "#9ca3af",
    fontSize: 10,
    fontFamily: "monospace",
  },

  serviceCost: {
    color: "#4b5563",
    fontSize: 11,
    fontWeight: "600",
  },

  doneBadge: {
    backgroundColor: "#f3f4f6",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  doneBadgeText: {
    color: "#6b7280",
    fontSize: 10,
    fontWeight: "600",
  },

  rating: {
    color: "#d97706",
    fontSize: 11,
  },

  emptyService: {
    alignItems: "center",
    paddingVertical: 20,
  },
});