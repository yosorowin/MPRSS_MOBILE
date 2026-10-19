import { usePathname, useRouter } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../firebase";

export default function CustomerLayout({ title, children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [activePopup, setActivePopup] = useState(null);

  // Automatically dismiss the in-app notification after five seconds.
  useEffect(() => {
    if (!activePopup) return undefined;

    const timeoutId = setTimeout(() => {
      setActivePopup((currentPopup) =>
        currentPopup?.id === activePopup.id ? null : currentPopup
      );
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [activePopup]);

  /*
   * ==========================================
   * REAL-TIME FIREBASE NOTIFICATIONS
   * ==========================================
   */

  useEffect(() => {
    let unsubscribeNotifications = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      // Stop listening to the previous user's notifications.
      if (unsubscribeNotifications) {
        unsubscribeNotifications();
        unsubscribeNotifications = null;
      }

      setNotifications([]);
      setActivePopup(null);

      if (!currentUser) {
        return;
      }

      let initialSnapshotReceived = false;

      const notificationsRef = collection(db, "notifications");

      const notificationsQuery = query(
        notificationsRef,
        where("customerId", "==", currentUser.uid),
        where("recipientRole", "==", "customer")
      );

      unsubscribeNotifications = onSnapshot(
        notificationsQuery,
        (snapshot) => {
          // Do not pop up historical notifications on the first snapshot.
          if (initialSnapshotReceived) {
            snapshot.docChanges().forEach((change) => {
              if (change.type !== "added") return;
              const data = change.doc.data();
              setActivePopup({
                id: change.doc.id,
                type: data.type || "service",
                title: data.title || "MPRSS Notification",
                message: data.message || "You have a new notification.",
                route: data.route || "/dashboard",
                unread: data.read !== true,
                createdAt: data.createdAt || null,
              });
            });
          } else {
            initialSnapshotReceived = true;
          }

          const notificationList = snapshot.docs.map(
            (notificationDoc) => {
              const data = notificationDoc.data();

              return {
                id: notificationDoc.id,
                type: data.type || "service",
                title: data.title || "Notification",
                message: data.message || "",
                route: data.route || "/dashboard",
                unread: data.read !== true,
                createdAt: data.createdAt || null,
              };
            }
          );

          // Sort newest first without requiring a composite index.
          notificationList.sort((a, b) => {
            const aTime = a.createdAt?.toMillis
              ? a.createdAt.toMillis()
              : 0;

            const bTime = b.createdAt?.toMillis
              ? b.createdAt.toMillis()
              : 0;

            return bTime - aTime;
          });

          setNotifications(notificationList);
        },
        (error) => {
          console.error("Notifications listener error:", error);
        }
      );
    });

    return () => {
      unsubscribeAuth();

      if (unsubscribeNotifications) {
        unsubscribeNotifications();
      }
    };
  }, []);

  /*
   * ==========================================
   * REAL-TIME UNREAD MESSAGE BADGE
   * Uses the existing conversations/{id}.unreadForCustomer field.
   * ==========================================
   */

  useEffect(() => {
    let unsubscribeConversations = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (unsubscribeConversations) {
        unsubscribeConversations();
        unsubscribeConversations = null;
      }

      setUnreadMessagesCount(0);

      if (!currentUser) return;

      unsubscribeConversations = onSnapshot(
        collection(db, "conversations"),
        (snapshot) => {
          const unreadTotal = snapshot.docs.reduce((total, conversationDoc) => {
            const conversation = conversationDoc.data();
            const belongsToCurrentCustomer =
              conversation.customerId === currentUser.uid ||
              conversation.customerUid === currentUser.uid;

            if (!belongsToCurrentCustomer) return total;

            return total + Math.max(
              0,
              Number(conversation.unreadForCustomer || 0)
            );
          }, 0);

          setUnreadMessagesCount(unreadTotal);
        },
        (error) => {
          console.error("Unread messages listener error:", error);
          setUnreadMessagesCount(0);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeConversations) unsubscribeConversations();
    };
  }, []);

  /*
   * ==========================================
   * MARK CUSTOMER MESSAGES AS READ
   * When the Messages screen is opened, clear the
   * unread counter in each of this customer's conversations.
   * ==========================================
   */
  useEffect(() => {
    if (!pathname?.startsWith("/messages")) return;

    let cancelled = false;
    let unsubscribeAuth = null;

    // Hide the badge immediately while Firestore is updated.
    setUnreadMessagesCount(0);

    unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser || cancelled) return;

      try {
        const snapshot = await getDocs(collection(db, "conversations"));
        if (cancelled) return;

        const unreadConversations = snapshot.docs.filter((conversationDoc) => {
          const conversation = conversationDoc.data();
          const belongsToCurrentCustomer =
            conversation.customerId === currentUser.uid ||
            conversation.customerUid === currentUser.uid;

          return (
            belongsToCurrentCustomer &&
            Number(conversation.unreadForCustomer || 0) > 0
          );
        });

        await Promise.all(
          unreadConversations.map((conversationDoc) =>
            updateDoc(conversationDoc.ref, { unreadForCustomer: 0 })
          )
        );
      } catch (error) {
        console.error("Error marking customer messages as read:", error);
      }
    });

    return () => {
      cancelled = true;
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, [pathname]);

  /*
   * ==========================================
   * TIME FORMATTER
   * ==========================================
   */

  const formatNotificationTime = (timestamp) => {
    if (!timestamp?.toDate) {
      return "Just now";
    }

    const notificationDate = timestamp.toDate();
    const now = new Date();

    const difference = now.getTime() - notificationDate.getTime();

    const seconds = Math.floor(difference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    }

    if (hours < 24) {
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }

    if (days < 7) {
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    }

    return notificationDate.toLocaleDateString();
  };

  /*
   * ==========================================
   * UNREAD COUNT
   * ==========================================
   */

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  /*
   * ==========================================
   * NAVIGATION
   * ==========================================
   */

  const menuItems = [
    { route: "/dashboard", label: "Dashboard" },
    { route: "/motorcycles", label: "My Motorcycles" },
    { route: "/services", label: "My Services" },
    { route: "/ai-assistant", label: "AI Assistant" },
    { route: "/builds", label: "My Builds" },
    { route: "/community-builds", label: "Community Builds" },
    { route: "/parts-catalog", label: "Parts Catalog" },
    { route: "/messages", label: "Messages" },
    { route: "/profile", label: "Profile" },
  ];

  const handleNavigate = (route) => {
    setSidebarOpen(false);
    setShowNotifications(false);

    if (route === "/messages") {
      // Immediate UI feedback; the effect above persists this in Firestore.
      setUnreadMessagesCount(0);
    }

    router.push(route);
  };

  /*
   * ==========================================
   * MARK ONE NOTIFICATION AS READ
   * ==========================================
   */

  const markNotificationAsRead = async (notification) => {
    if (!notification.unread) {
      return;
    }

    try {
      await updateDoc(doc(db, "notifications", notification.id), {
        read: true,
      });
    } catch (error) {
      console.error("Mark notification as read error:", error);
    }
  };

  /*
   * ==========================================
   * NOTIFICATION PRESS
   * ==========================================
   */

  const handleNotificationItemPress = async (notification) => {
    setShowNotifications(false);
    setActivePopup(null);

    // Navigate even if updating the read status fails.
    await markNotificationAsRead(notification);

    if (notification.route) {
      router.push(notification.route);
    }
  };

  /*
   * ==========================================
   * MARK ALL AS READ
   * ==========================================
   */

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter(
      (notification) => notification.unread
    );

    if (unreadNotifications.length === 0) {
      return;
    }

    try {
      await Promise.all(
        unreadNotifications.map((notification) =>
          updateDoc(doc(db, "notifications", notification.id), {
            read: true,
          })
        )
      );
    } catch (error) {
      console.error("Mark all notifications as read error:", error);
    }
  };

  /*
   * ==========================================
   * LOGOUT
   * ==========================================
   */

  const handleLogout = async () => {
    try {
      setSidebarOpen(false);
      setShowNotifications(false);

      await signOut(auth);

      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* MAIN CONTENT */}
      <View style={styles.main}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => {
                setShowNotifications(false);
                setSidebarOpen(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>

            <Text style={styles.title}>{title}</Text>
          </View>

          {/* GLOBAL NOTIFICATIONS */}
          <View style={styles.notificationWrapper}>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() =>
                setShowNotifications((previous) => !previous)
              }
              activeOpacity={0.7}
            >
              <Text style={styles.notificationIcon}>🔔</Text>

              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <Modal
              visible={showNotifications}
              transparent
              animationType="fade"
              statusBarTranslucent
              onRequestClose={() => setShowNotifications(false)}
            >
              <View style={styles.notificationModalOverlay}>
                <Pressable
                  style={StyleSheet.absoluteFill}
                  onPress={() => setShowNotifications(false)}
                />
                <View
                  style={[
                    styles.notificationDropdown,
                    styles.notificationModalDropdown,
                  ]}
                >
                {/* HEADER */}
                <View style={styles.notificationHeader}>
                  <View>
                    <Text style={styles.notificationTitle}>
                      Notifications
                    </Text>

                    <Text style={styles.notificationSubtitle}>
                      {unreadCount} unread
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => setShowNotifications(false)}
                  >
                    <Text style={styles.notificationClose}>×</Text>
                  </TouchableOpacity>
                </View>

                {/* NOTIFICATION LIST */}
                <ScrollView
                  style={styles.notificationList}
                  contentContainerStyle={styles.notificationListContent}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                  keyboardShouldPersistTaps="handled"
                >
                  {notifications.length === 0 ? (
                    <View style={styles.emptyNotifications}>
                      <Text style={styles.emptyNotificationIcon}>
                        🔔
                      </Text>

                      <Text style={styles.emptyNotificationTitle}>
                        No notifications
                      </Text>

                      <Text style={styles.emptyNotificationMessage}>
                        You're all caught up.
                      </Text>
                    </View>
                  ) : (
                    notifications.map((notification) => (
                      <TouchableOpacity
                        key={notification.id}
                        style={[
                          styles.notificationItem,
                          notification.unread &&
                            styles.notificationItemUnread,
                        ]}
                        onPress={() =>
                          handleNotificationItemPress(notification)
                        }
                        activeOpacity={0.8}
                      >
                        {/* TYPE ICON */}
                        <View
                          style={[
                            styles.notificationTypeIcon,
                            notification.type === "service" &&
                              styles.serviceIcon,
                            notification.type === "message" &&
                              styles.messageIcon,
                            notification.type === "ai" &&
                              styles.aiIcon,
                          ]}
                        >
                          <Text style={styles.notificationTypeText}>
                            {notification.type === "service"
                              ? "✓"
                              : notification.type === "message"
                                ? "•"
                                : "✦"}
                          </Text>
                        </View>

                        {/* CONTENT */}
                        <View style={styles.notificationContent}>
                          <View style={styles.notificationTitleRow}>
                            <Text
                              style={[
                                styles.notificationItemTitle,
                                notification.unread &&
                                  styles.notificationItemTitleUnread,
                              ]}
                              numberOfLines={1}
                            >
                              {notification.title}
                            </Text>

                            {notification.unread && (
                              <View style={styles.unreadDot} />
                            )}
                          </View>

                          <Text
                            style={styles.notificationMessage}
                            numberOfLines={2}
                          >
                            {notification.message}
                          </Text>

                          <Text style={styles.notificationTime}>
                            {formatNotificationTime(notification.createdAt)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>

                {/* MARK ALL AS READ */}
                {unreadCount > 0 && (
                  <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={handleMarkAllAsRead}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.viewAllText}>
                      Mark all as read
                    </Text>
                  </TouchableOpacity>
                )}
                </View>
              </View>
            </Modal>
          </View>
        </View>

        <View style={styles.page}>
          {children}
        </View>
      </View>

      {/* FIXED MOBILE BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        {[
          { route: "/dashboard", label: "Home", icon: "⌂" },
          { route: "/services", label: "Services", icon: "▣" },
          { route: "/ai-assistant", label: "AI Assistant", icon: "✦", center: true },
          { route: "/messages", label: "Messages", icon: "✉" },
          { route: "/profile", label: "Profile", icon: "●" },
        ].map((item) => {
          const active =
            pathname === item.route ||
            (item.route === "/services" && pathname.startsWith("/services/")) ||
            (item.route === "/messages" && pathname.startsWith("/messages/"));

          return (
            <TouchableOpacity
              key={item.route}
              style={[
                styles.bottomNavItem,
                item.center && styles.bottomNavCenterItem,
                active && !item.center && styles.bottomNavItemActive,
              ]}
              onPress={() => handleNavigate(item.route)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              {item.center ? (
                <View style={[styles.bottomNavCenterIcon, active && styles.bottomNavCenterIconActive]}>
                  <Text style={styles.bottomNavCenterIconText}>{item.icon}</Text>
                </View>
              ) : (
                <View style={styles.bottomNavIconWrap}>
                  <Text style={[styles.bottomNavIcon, active && styles.bottomNavIconActive]}>
                    {item.icon}
                  </Text>
                  {item.route === "/messages" && unreadMessagesCount > 0 && (
                    <View style={styles.messageUnreadBadge}>
                      <Text style={styles.messageUnreadBadgeText}>
                        {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
                      </Text>
                    </View>
                  )}
                </View>
              )}
              <Text
                numberOfLines={1}
                style={[
                  styles.bottomNavLabel,
                  (active || item.center) && styles.bottomNavLabelActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* IN-APP NOTIFICATION POPUP */}
      {activePopup && (
        <View style={styles.popupHost} pointerEvents="box-none">
          <View style={styles.popupCard}>
            <View style={styles.popupTopRow}>
              <View style={styles.popupBrandRow}>
                <View style={styles.popupIconCircle}>
                  <Text style={styles.popupIconText}>
                    {activePopup.type === "service"
                      ? "✓"
                      : activePopup.type === "message"
                        ? "✉"
                        : activePopup.type === "ai"
                          ? "✦"
                          : "🔔"}
                  </Text>
                </View>
                <View style={styles.popupHeadingWrap}>
                  <Text style={styles.popupEyebrow}>MPRSS • NOTIFICATION</Text>
                  <Text style={styles.popupTitle} numberOfLines={1}>
                    {activePopup.title}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Dismiss notification"
                style={styles.popupDismissButton}
                onPress={() => setActivePopup(null)}
              >
                <Text style={styles.popupDismissText}>×</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.popupMessage} numberOfLines={3}>
              {activePopup.message}
            </Text>

            <View style={styles.popupActions}>
              <TouchableOpacity
                style={styles.popupLaterButton}
                onPress={() => setActivePopup(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.popupLaterText}>Later</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.popupViewButton}
                onPress={() => handleNotificationItemPress(activePopup)}
                activeOpacity={0.85}
              >
                <Text style={styles.popupViewText}>View notification</Text>
                <Text style={styles.popupArrow}>›</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* OUTSIDE AREA — CLOSE SIDEBAR */}
      {sidebarOpen && (
        <Pressable
          style={styles.overlay}
          onPress={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      {sidebarOpen && (
        <View style={styles.sidebar}>
          {/* LOGO */}
          <View style={styles.sidebarHeader}>
            <Image
              source={require("../../assets/logo.png")}
              style={styles.sidebarLogo}
              resizeMode="contain"
            />
          </View>

          {/* MENU */}
          <ScrollView
            style={styles.menu}
            contentContainerStyle={styles.menuContent}
            showsVerticalScrollIndicator={false}
          >
            {menuItems.map((item) => {
              const active = pathname === item.route;

              return (
                <TouchableOpacity
                  key={item.route}
                  style={[
                    styles.menuItem,
                    active && styles.menuItemActive,
                  ]}
                  onPress={() => handleNavigate(item.route)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.menuText,
                      active && styles.menuTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* FIXED LOGOUT */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  popupHost: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    zIndex: 1000,
    elevation: 1000,
  },
  popupCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 12,
  },
  popupTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  popupBrandRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  popupIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  popupIconText: {
    color: "#ffffff",
    fontSize: 19,
    fontWeight: "700",
  },
  popupHeadingWrap: { flex: 1 },
  popupEyebrow: {
    color: "#6b7280",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginBottom: 3,
  },
  popupTitle: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "800",
  },
  popupDismissButton: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  popupDismissText: {
    color: "#4b5563",
    fontSize: 23,
    lineHeight: 25,
  },
  popupMessage: {
    color: "#4b5563",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 13,
    marginBottom: 15,
  },
  popupActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 9,
  },
  popupLaterButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 9,
    backgroundColor: "#f3f4f6",
  },
  popupLaterText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "700",
  },
  popupViewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 9,
    backgroundColor: "#111827",
  },
  popupViewText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  popupArrow: {
    color: "#ffffff",
    fontSize: 18,
    lineHeight: 18,
    marginLeft: 7,
  },
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },

  main: {
    flex: 1,
    zIndex: 0,
  },

  header: {
    height: 62,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    zIndex: 30,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  menuIcon: {
    fontSize: 25,
    color: "#111827",
  },

  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },

  /* NOTIFICATION BUTTON */
  notificationWrapper: {
    position: "relative",
    zIndex: 50,
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
    fontSize: 17,
  },

  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
    paddingHorizontal: 2,
  },

  notificationBadgeText: {
    color: "#ffffff",
    fontSize: 8,
    fontWeight: "900",
  },

  /* NOTIFICATION MODAL: keep the dropdown above page content so scroll gestures reach the list. */
  notificationModalOverlay: {
    flex: 1,
    alignItems: "flex-end",
    paddingTop: 68,
    paddingHorizontal: 12,
  },

  notificationModalDropdown: {
    position: "relative",
    top: 0,
    right: 0,
    maxWidth: "100%",
    maxHeight: "80%",
  },

  /* NOTIFICATION DROPDOWN */
  notificationDropdown: {
    position: "absolute",
    top: 45,
    right: 0,
    width: 320,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
    overflow: "hidden",
    zIndex: 100,
  },

  notificationHeader: {
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  notificationTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },

  notificationSubtitle: {
    marginTop: 2,
    fontSize: 10,
    color: "#9ca3af",
  },

  notificationClose: {
    fontSize: 25,
    color: "#6b7280",
    lineHeight: 25,
  },

  notificationList: {
    height: 300,
    flexGrow: 0,
    flexShrink: 1,
  },

  notificationListContent: {
    flexGrow: 0,
  },

  notificationItem: {
    padding: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    flexDirection: "row",
  },

  notificationItemUnread: {
    backgroundColor: "#f8fafc",
  },

  notificationTypeIcon: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },

  serviceIcon: {
    backgroundColor: "#ecfdf5",
  },

  messageIcon: {
    backgroundColor: "#eef2ff",
  },

  aiIcon: {
    backgroundColor: "#fef3c7",
  },

  notificationTypeText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#374151",
  },

  notificationContent: {
    flex: 1,
    marginLeft: 10,
  },

  notificationTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  notificationItemTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },

  notificationItemTitleUnread: {
    fontWeight: "900",
    color: "#111827",
  },

  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#2563eb",
    marginLeft: 7,
  },

  notificationMessage: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: "#6b7280",
  },

  notificationTime: {
    marginTop: 4,
    fontSize: 9,
    color: "#9ca3af",
  },

  emptyNotifications: {
    paddingVertical: 35,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  emptyNotificationIcon: {
    fontSize: 24,
    marginBottom: 8,
    opacity: 0.5,
  },

  emptyNotificationTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },

  emptyNotificationMessage: {
    marginTop: 3,
    fontSize: 11,
    color: "#9ca3af",
  },

  viewAllButton: {
    paddingVertical: 12,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },

  viewAllText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#374151",
  },

  page: {
    flex: 1,
  },

  /* FIXED MOBILE BOTTOM NAVIGATION */
  bottomNav: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingHorizontal: 4,
    paddingTop: 6,
    paddingBottom: 8,
    elevation: 12,
    zIndex: 5,
  },

  bottomNavItem: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
    paddingVertical: 3,
    borderRadius: 10,
  },

  bottomNavItemActive: {
    backgroundColor: "#f3f4f6",
  },

  bottomNavCenterItem: {
    marginTop: -18,
  },

  bottomNavCenterIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#ffffff",
    elevation: 7,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },

  bottomNavCenterIconActive: {
    backgroundColor: "#2563eb",
  },

  bottomNavCenterIconText: {
    color: "#ffffff",
    fontSize: 23,
    lineHeight: 27,
    fontWeight: "800",
  },

  bottomNavIconWrap: {
    minHeight: 24,
    minWidth: 26,
    alignItems: "center",
    justifyContent: "center",
  },

  bottomNavIcon: {
    color: "#6b7280",
    fontSize: 20,
    lineHeight: 23,
    fontWeight: "700",
  },

  bottomNavIconActive: {
    color: "#111827",
  },

  messageUnreadBadge: {
    position: "absolute",
    top: -5,
    right: -10,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ffffff",
  },

  messageUnreadBadgeText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "800",
  },

  bottomNavLabel: {
    color: "#6b7280",
    fontSize: 9,
    marginTop: 3,
    fontWeight: "600",
  },

  bottomNavLabelActive: {
    color: "#111827",
    fontWeight: "800",
  },

  /* SIDEBAR OVERLAY */
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 10,
    elevation: 10,
  },

  /* SIDEBAR */
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 270,
    backgroundColor: "#000000",
    zIndex: 20,
    elevation: 20,
  },

  sidebarHeader: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#262626",
    alignItems: "center",
  },

  sidebarLogo: {
    width: 200,
    height: 65,
    tintColor: "#ffffff",
  },

  menu: {
    flex: 1,
    paddingHorizontal: 12,
  },

  menuContent: {
    paddingTop: 14,
    paddingBottom: 90,
  },

  menuItem: {
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 8,
    marginBottom: 4,
  },

  menuItemActive: {
    backgroundColor: "#ffffff",
  },

  menuText: {
    color: "#d1d5db",
    fontSize: 14,
  },

  menuTextActive: {
    color: "#000000",
    fontWeight: "600",
  },

  logoutContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000000",
    borderTopWidth: 1,
    borderTopColor: "#262626",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },

  logoutButton: {
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 8,
    backgroundColor: "#111111",
  },

  logoutText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});