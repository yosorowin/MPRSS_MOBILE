import { usePathname, useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Image,
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
  const [showNotifications, setShowNotifications] =
    useState(false);

  const [notifications, setNotifications] = useState([]);

  /*
   * ==========================================
   * REAL-TIME FIREBASE NOTIFICATIONS
   * ==========================================
   */

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setNotifications([]);
      return;
    }

    const notificationsRef = collection(
      db,
      "notifications"
    );

    const notificationsQuery = query(
      notificationsRef,
      where("customerId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
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

        /*
         * Sort newest first.
         * We do this locally so you don't immediately
         * need a Firestore composite index.
         */
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
        console.error(
          "Notifications listener error:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, []);

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

    const difference =
      now.getTime() - notificationDate.getTime();

    const seconds = Math.floor(difference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} ${
        minutes === 1 ? "minute" : "minutes"
      } ago`;
    }

    if (hours < 24) {
      return `${hours} ${
        hours === 1 ? "hour" : "hours"
      } ago`;
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
    {
      route: "/community-builds",
      label: "Community Builds",
    },
    {
      route: "/parts-catalog",
      label: "Parts Catalog",
    },
    { route: "/messages", label: "Messages" },
    { route: "/profile", label: "Profile" },
  ];

  const handleNavigate = (route) => {
    setSidebarOpen(false);
    setShowNotifications(false);
    router.push(route);
  };

  /*
   * ==========================================
   * NOTIFICATION PRESS
   * ==========================================
   */

  const handleNotificationPress = async (
    notification
  ) => {
    setShowNotifications(false);

    try {
      if (notification.unread) {
        await updateDoc(
          collection(db, "notifications")
            ? // This part is replaced below by direct document access.
              // Kept out of the actual operation.
              null
            : null,
          {}
        );
      }
    } catch (error) {
      console.error(
        "Notification read error:",
        error
      );
    }

    /*
     * Navigate even if marking the notification
     * as read fails.
     */
    router.push(notification.route);
  };

  /*
   * ==========================================
   * MARK ONE NOTIFICATION AS READ
   * ==========================================
   */

  const markNotificationAsRead = async (
    notification
  ) => {
    if (!notification.unread) {
      return;
    }

    try {
      const { doc } = await import("firebase/firestore");

      const notificationRef = doc(
        db,
        "notifications",
        notification.id
      );

      await updateDoc(notificationRef, {
        read: true,
      });
    } catch (error) {
      console.error(
        "Mark notification as read error:",
        error
      );
    }
  };

  /*
   * ==========================================
   * ACTUAL NOTIFICATION PRESS
   * ==========================================
   */

  const handleNotificationItemPress = async (
    notification
  ) => {
    setShowNotifications(false);

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
    try {
      const unreadNotifications =
        notifications.filter(
          (notification) => notification.unread
        );

      const { doc } = await import("firebase/firestore");

      await Promise.all(
        unreadNotifications.map((notification) =>
          updateDoc(
            doc(
              db,
              "notifications",
              notification.id
            ),
            {
              read: true,
            }
          )
        )
      );
    } catch (error) {
      console.error(
        "Mark all notifications as read error:",
        error
      );
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
                setShowNotifications(
                  (previous) => !previous
                )
              }
              activeOpacity={0.7}
            >
              <Text style={styles.notificationIcon}>
                🔔
              </Text>

              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text
                    style={styles.notificationBadgeText}
                  >
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {showNotifications && (
              <View style={styles.notificationDropdown}>
                {/* HEADER */}
                <View style={styles.notificationHeader}>
                  <View>
                    <Text
                      style={styles.notificationTitle}
                    >
                      Notifications
                    </Text>

                    <Text
                      style={styles.notificationSubtitle}
                    >
                      {unreadCount} unread
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      setShowNotifications(false)
                    }
                  >
                    <Text
                      style={styles.notificationClose}
                    >
                      ×
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* NOTIFICATION LIST */}
                <ScrollView
                  style={styles.notificationList}
                  showsVerticalScrollIndicator={false}
                >
                  {notifications.length === 0 ? (
                    <View style={styles.emptyNotifications}>
                      <Text
                        style={
                          styles.emptyNotificationIcon
                        }
                      >
                        🔔
                      </Text>

                      <Text
                        style={
                          styles.emptyNotificationTitle
                        }
                      >
                        No notifications
                      </Text>

                      <Text
                        style={
                          styles.emptyNotificationMessage
                        }
                      >
                        You're all caught up.
                      </Text>
                    </View>
                  ) : (
                    notifications.map(
                      (notification) => (
                        <TouchableOpacity
                          key={notification.id}
                          style={[
                            styles.notificationItem,
                            notification.unread &&
                              styles.notificationItemUnread,
                          ]}
                          onPress={() =>
                            handleNotificationItemPress(
                              notification
                            )
                          }
                          activeOpacity={0.8}
                        >
                          {/* TYPE ICON */}
                          <View
                            style={[
                              styles.notificationTypeIcon,
                              notification.type ===
                                "service" &&
                                styles.serviceIcon,
                              notification.type ===
                                "message" &&
                                styles.messageIcon,
                              notification.type ===
                                "ai" &&
                                styles.aiIcon,
                            ]}
                          >
                            <Text
                              style={
                                styles.notificationTypeText
                              }
                            >
                              {notification.type ===
                              "service"
                                ? "✓"
                                : notification.type ===
                                    "message"
                                  ? "•"
                                  : "✦"}
                            </Text>
                          </View>

                          {/* CONTENT */}
                          <View
                            style={
                              styles.notificationContent
                            }
                          >
                            <View
                              style={
                                styles.notificationTitleRow
                              }
                            >
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
                                <View
                                  style={
                                    styles.unreadDot
                                  }
                                />
                              )}
                            </View>

                            <Text
                              style={
                                styles.notificationMessage
                              }
                              numberOfLines={2}
                            >
                              {notification.message}
                            </Text>

                            <Text
                              style={
                                styles.notificationTime
                              }
                            >
                              {formatNotificationTime(
                                notification.createdAt
                              )}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )
                    )
                  )}
                </ScrollView>

                {/* MARK ALL AS READ */}
                {unreadCount > 0 && (
                  <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={handleMarkAllAsRead}
                  >
                    <Text style={styles.viewAllText}>
                      Mark all as read
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>

        <View style={styles.page}>{children}</View>
      </View>

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
              const active =
                pathname === item.route;

              return (
                <TouchableOpacity
                  key={item.route}
                  style={[
                    styles.menuItem,
                    active &&
                      styles.menuItemActive,
                  ]}
                  onPress={() =>
                    handleNavigate(item.route)
                  }
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.menuText,
                      active &&
                        styles.menuTextActive,
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
              <Text style={styles.logoutText}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
    maxHeight: 300,
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