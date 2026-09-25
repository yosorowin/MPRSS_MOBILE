import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import CustomerLayout from "../components/CustomerLayout";

import {
  getMotorcycles,
  subscribeToMotorcycles,
} from "../data/motorcycleStore";

import {
  getCurrentServiceRequest,
  subscribeToServiceRequest,
} from "../data/serviceRequestStore";

export default function CustomerDashboard() {
  const router = useRouter();

  const [currentServiceRequest, setCurrentServiceRequest] =
    useState(null);

  const [motorcycles, setMotorcycles] = useState([]);

  const [activeMotoIndex, setActiveMotoIndex] = useState(0);

  const activeServices = [
    {
      id: "srv-2",
      motorcycle: "Honda CBR600RR",
      serviceType: "Chain Adjustment",
      status: "Waiting for Parts",
      estimatedCost: 4000,
    },
  ];

  const completedServices = [
    {
      id: "srv-comp-1",
      motorcycle: "Honda CBR600RR",
      serviceType: "Tire Replacement",
      rating: 5,
      cost: 22500,
    },
  ];

  useEffect(() => {
    const updateMotorcycles = () => {
      setMotorcycles(getMotorcycles());
    };

    updateMotorcycles();

    const unsubscribe =
      subscribeToMotorcycles(updateMotorcycles);

    return unsubscribe;
  }, []);

  useEffect(() => {
    const updateServiceRequest = () => {
      setCurrentServiceRequest(
        getCurrentServiceRequest()
      );
    };

    updateServiceRequest();

    const unsubscribe =
      subscribeToServiceRequest(updateServiceRequest);

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (
      motorcycles.length > 0 &&
      activeMotoIndex >= motorcycles.length
    ) {
      setActiveMotoIndex(motorcycles.length - 1);
    }

    if (motorcycles.length === 0) {
      setActiveMotoIndex(0);
    }
  }, [motorcycles.length, activeMotoIndex]);

  const activeMoto = motorcycles[activeMotoIndex];

  const currentService = currentServiceRequest
    ? {
        serviceType: currentServiceRequest.serviceType,
        motorcycle: currentServiceRequest.motorcycle,
        status:
          currentServiceRequest.status ||
          "Pending Approval",
      }
    : activeServices[0];

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
            <Text style={styles.headerTitle}>Carlos Reyes</Text>
            <Text style={styles.headerName}>Customer</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => {}}
        >
          <Text style={styles.notificationIcon}>●</Text>
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
                    {activeMoto.brand} {activeMoto.model}
                  </Text>

                  <Text style={styles.motorcycleSub}>
                    {activeMoto.plate} • {activeMoto.year} Model
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

            {motorcycles.length > 1 && (
              <View style={styles.switcher}>
                <TouchableOpacity
                  style={styles.switchButton}
                  onPress={() =>
                    setActiveMotoIndex(
                      (index) =>
                        (index - 1 + motorcycles.length) %
                        motorcycles.length
                    )
                  }
                >
                  <Text style={styles.switchText}>‹</Text>
                </TouchableOpacity>

                <Text style={styles.switchCount}>
                  {activeMotoIndex + 1}/{motorcycles.length}
                </Text>

                <TouchableOpacity
                  style={styles.switchButton}
                  onPress={() =>
                    setActiveMotoIndex(
                      (index) =>
                        (index + 1) % motorcycles.length
                    )
                  }
                >
                  <Text style={styles.switchText}>›</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {activeMoto && (
            <View style={styles.motorcycleStats}>
              <View style={styles.darkStat}>
                <Text style={styles.statLabelDark}>
                  LAST SERVICE
                </Text>
                <Text style={styles.statValueDark}>
                  {activeMoto.lastService}
                </Text>
              </View>

              <View style={styles.darkStat}>
                <Text style={styles.statLabelDark}>
                  NEXT DUE
                </Text>
                <Text style={styles.statValueDark}>
                  {activeMoto.nextDue}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Current Service */}
        <View style={styles.card}>
          <Text style={styles.overline}>CURRENT SERVICE</Text>

          {currentService ? (
            <>
              <Text style={styles.cardTitle}>
                {currentService.serviceType}
              </Text>

              <Text style={styles.cardSub}>
                {currentService.motorcycle}
              </Text>

              <View style={styles.serviceBottomRow}>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>
                    {currentService.status}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => goTo("/services")}
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
                You currently have no ongoing service requests.
              </Text>

              <TouchableOpacity
                style={styles.outlineButton}
                onPress={() => goTo("/services")}
              >
                <Text style={styles.outlineButtonText}>
                  + Request Service
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Next Maintenance */}
        <View style={styles.card}>
          <Text style={styles.overline}>NEXT MAINTENANCE</Text>

          <View style={styles.maintenanceRow}>
            <View style={styles.maintenanceIcon}>
              <Text style={styles.wrenchIcon}>W</Text>
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
              <Text style={styles.historyIcon}>✓</Text>
              <Text style={styles.historyNumber}>1</Text>
              <Text style={styles.historyLabel}>
                Completed
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.historyItem}>
              <Text style={styles.historyIcon}>W</Text>
              <Text style={styles.historyNumber}>1</Text>
              <Text style={styles.historyLabel}>Active</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.historyItem}>
              <Text style={styles.historyIcon}>◷</Text>
              <Text style={styles.historyNumber}>1</Text>
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
              onPress={() => goTo("/services")}
            >
              <View style={styles.quickIcon}>
                <Text style={styles.quickIconText}>+</Text>
              </View>
              <Text style={styles.quickText}>
                Request Service
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickCard}
              onPress={() => goTo("/ai-assistant")}
            >
              <View style={styles.quickIcon}>
                <Text style={styles.quickIconText}>✦</Text>
              </View>
              <Text style={styles.quickText}>
                AI Assistant
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickCard}
              onPress={() => goTo("/parts-catalog")}
            >
              <View style={styles.quickIcon}>
                <Text style={styles.quickIconText}>□</Text>
              </View>
              <Text style={styles.quickText}>
                Browse Parts
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickCard}
              onPress={() => goTo("/builds")}
            >
              <View style={styles.quickIcon}>
                <Text style={styles.quickIconText}>▤</Text>
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
                <View style={styles.serviceItemTop}>
                  <View style={styles.serviceItemInfo}>
                    <Text style={styles.serviceItemTitle}>
                      {service.serviceType}
                    </Text>

                    <Text style={styles.serviceItemMoto}>
                      {service.motorcycle}
                    </Text>
                  </View>

                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>
                      {service.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.serviceItemBottom}>
                  <Text style={styles.serviceId}>
                    {service.id}
                  </Text>

                  <Text style={styles.serviceCost}>
                    ₱{service.estimatedCost.toLocaleString()}
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
            completedServices.map((service) => (
              <View
                key={service.id}
                style={styles.serviceItem}
              >
                <View style={styles.serviceItemTop}>
                  <View style={styles.serviceItemInfo}>
                    <Text style={styles.serviceItemTitle}>
                      {service.serviceType}
                    </Text>

                    <Text style={styles.serviceItemMoto}>
                      {service.motorcycle}
                    </Text>
                  </View>

                  <View style={styles.doneBadge}>
                    <Text style={styles.doneBadgeText}>
                      Done
                    </Text>
                  </View>
                </View>

                <View style={styles.serviceItemBottom}>
                  <Text style={styles.rating}>
                    {"★".repeat(service.rating)}
                  </Text>

                  <Text style={styles.serviceCost}>
                    ₱{service.cost.toLocaleString()}
                  </Text>
                </View>
              </View>
            ))
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