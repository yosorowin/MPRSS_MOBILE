import { usePathname, useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CustomerLayout({ title, children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] =
    useState(false);

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

  const notifications = [
    {
      id: "notification-1",
      type: "service",
      title: "Service Request Update",
      message:
        "Your service request is currently under review.",
      time: "10 mins ago",
      unread: true,
      route: "/services",
    },
    {
      id: "notification-2",
      type: "message",
      title: "New Message",
      message:
        "MPRSS Admin sent you a new message.",
      time: "1 hour ago",
      unread: true,
      route: "/messages",
    },
    {
      id: "notification-3",
      type: "ai",
      title: "AI Safety Alert",
      message:
        "A safety warning was detected in your build.",
      time: "3 hours ago",
      unread: true,
      route: "/ai-assistant",
    },
  ];

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  const handleNavigate = (route) => {
    setSidebarOpen(false);
    setShowNotifications(false);
    router.push(route);
  };

  const handleNotificationPress = (notification) => {
    setShowNotifications(false);
    router.push(notification.route);
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
                    {unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {showNotifications && (
              <>
                {/* DROPDOWN */}
                <View style={styles.notificationDropdown}>
                  <View
                    style={styles.notificationHeader}
                  >
                    <View>
                      <Text
                        style={styles.notificationTitle}
                      >
                        Notifications
                      </Text>

                      <Text
                        style={
                          styles.notificationSubtitle
                        }
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
                        style={
                          styles.notificationClose
                        }
                      >
                        ×
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    style={
                      styles.notificationList
                    }
                    showsVerticalScrollIndicator={false}
                  >
                    {notifications.map(
                      (notification) => (
                        <TouchableOpacity
                          key={notification.id}
                          style={[
                            styles.notificationItem,
                            notification.unread &&
                              styles.notificationItemUnread,
                          ]}
                          onPress={() =>
                            handleNotificationPress(
                              notification
                            )
                          }
                          activeOpacity={0.8}
                        >
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
                              {notification.time}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )
                    )}
                  </ScrollView>

                  <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() =>
                      setShowNotifications(false)
                    }
                  >
                    <Text
                      style={styles.viewAllText}
                    >
                      Mark all as read
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
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
          <View style={styles.sidebarHeader}>
            <Text style={styles.logoText}>MPRSS</Text>

            <Text style={styles.userText}>
              Carlos Reyes
            </Text>
          </View>

          <ScrollView
            style={styles.menu}
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

          <View style={styles.logoutContainer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => {
                setSidebarOpen(false);
                setShowNotifications(false);
                router.replace("/login");
              }}
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
  },

  logoText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 1,
  },

  userText: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 8,
  },

  menu: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 14,
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
    borderTopWidth: 1,
    borderTopColor: "#262626",
    padding: 16,
  },

  logoutButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
  },

  logoutText: {
    color: "#d1d5db",
    fontSize: 14,
  },
});