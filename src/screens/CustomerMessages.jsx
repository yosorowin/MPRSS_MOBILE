import { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
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
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase";

import CustomerLayout from "../components/CustomerLayout";

const RECIPIENTS = [
  {
    id: "admin",
    name: "MPRSS Admin",
    role: "Service Shop",
  },
  {
    id: "super_admin",
    name: "MPRSS Super Admin",
    role: "Management",
  },
];

export default function CustomerMessages() {
  const [currentUser, setCurrentUser] = useState(null);

  const [customerName, setCustomerName] =
    useState("MPRSS Rider");

  const [conversations, setConversations] =
    useState([]);

  const [selectedConversation, setSelectedConversation] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [messageText, setMessageText] =
    useState("");

  const [searchText, setSearchText] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  /*
   * ==========================================
   * AUTHENTICATION
   * ==========================================
   */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        setCurrentUser(user);

        if (!user) {
          setCustomerName("MPRSS Rider");
          setConversations([]);
          setSelectedConversation(null);
          setMessages([]);
          setLoading(false);
          return;
        }

        try {
          const customerRef = doc(
            db,
            "customers",
            user.uid
          );

          const customerSnapshot =
            await getDoc(customerRef);

          if (customerSnapshot.exists()) {
            const data =
              customerSnapshot.data();

            setCustomerName(
              data.fullName ||
                user.displayName ||
                user.email ||
                "MPRSS Rider"
            );
          } else {
            setCustomerName(
              user.displayName ||
                user.email ||
                "MPRSS Rider"
            );
          }
        } catch (error) {
          console.error(
            "Error loading customer profile:",
            error
          );

          setCustomerName(
            user.displayName ||
              user.email ||
              "MPRSS Rider"
          );
        }

        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  /*
   * ==========================================
   * CREATE / LOAD BOTH CONVERSATIONS
   * ==========================================
   *
   * Each customer gets:
   *
   * conversations/{customerUid}_admin
   * conversations/{customerUid}_super_admin
   *
   */

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    let cancelled = false;

    const setupConversations = async () => {
      try {
        const loadedConversations = [];

        for (const recipient of RECIPIENTS) {
          const conversationId =
            `${currentUser.uid}_${recipient.id}`;

          const conversationRef = doc(
            db,
            "conversations",
            conversationId
          );

          const snapshot =
            await getDoc(conversationRef);

          if (!snapshot.exists()) {
            await setDoc(conversationRef, {
              customerId: currentUser.uid,
              customerUid: currentUser.uid,
              customerEmail:
                currentUser.email || "",
              customerName:
                customerName ||
                currentUser.displayName ||
                currentUser.email ||
                "MPRSS Rider",

              recipientId: recipient.id,
              recipientRole: recipient.id,
              recipientName: recipient.name,

              lastMessage: "",
              lastMessageAt: null,

              unreadForCustomer: 0,
              unreadForRecipient: 0,

              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });

            loadedConversations.push({
              id: conversationId,
              customerId: currentUser.uid,
              customerUid: currentUser.uid,
              customerEmail:
                currentUser.email || "",
              customerName:
                customerName || "MPRSS Rider",

              recipientId: recipient.id,
              recipientRole: recipient.id,
              recipientName: recipient.name,

              lastMessage: "",
              lastMessageAt: null,

              unreadForCustomer: 0,
              unreadForRecipient: 0,

              role: recipient.role,
              online: false,
            });
          } else {
            const data = snapshot.data();

            loadedConversations.push({
              id: snapshot.id,
              ...data,
              role: recipient.role,
              online: data.online || false,
            });
          }
        }

        if (!cancelled) {
          setConversations(
            loadedConversations
          );

          setSelectedConversation(
            (previous) => {
              if (!previous) {
                return loadedConversations[0] || null;
              }

              return (
                loadedConversations.find(
                  (item) =>
                    item.id === previous.id
                ) ||
                loadedConversations[0] ||
                null
              );
            }
          );
        }
      } catch (error) {
        console.error(
          "Error setting up conversations:",
          error
        );
      }
    };

    setupConversations();

    return () => {
      cancelled = true;
    };
  }, [currentUser, customerName]);

  /*
   * ==========================================
   * REAL-TIME CONVERSATION LISTENER
   * ==========================================
   */

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const unsubscribers =
      RECIPIENTS.map((recipient) => {
        const conversationId =
          `${currentUser.uid}_${recipient.id}`;

        const conversationRef = doc(
          db,
          "conversations",
          conversationId
        );

        return onSnapshot(
          conversationRef,
          (snapshot) => {
            if (!snapshot.exists()) {
              return;
            }

            const data = snapshot.data();

            const updatedConversation = {
              id: snapshot.id,
              ...data,
              role: recipient.role,
              online: data.online || false,
            };

            setConversations((previous) => {
              const exists = previous.some(
                (item) =>
                  item.id === snapshot.id
              );

              if (!exists) {
                return [
                  ...previous,
                  updatedConversation,
                ];
              }

              return previous.map((item) =>
                item.id === snapshot.id
                  ? updatedConversation
                  : item
              );
            });
          },
          (error) => {
            console.error(
              `Conversation listener error (${recipient.id}):`,
              error
            );
          }
        );
      });

    return () => {
      unsubscribers.forEach(
        (unsubscribe) => unsubscribe()
      );
    };
  }, [currentUser]);

  /*
   * ==========================================
   * REAL-TIME MESSAGE LISTENER
   * ==========================================
   */

  useEffect(() => {
    if (
      !currentUser ||
      !selectedConversation
    ) {
      setMessages([]);
      return;
    }

    const messagesRef = collection(
      db,
      "conversations",
      selectedConversation.id,
      "messages"
    );

    const messagesQuery = query(
      messagesRef,
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const loadedMessages =
          snapshot.docs.map((messageDoc) => ({
            id: messageDoc.id,
            ...messageDoc.data(),
          }));

        setMessages(loadedMessages);
      },
      (error) => {
        console.error(
          "Messages listener error:",
          error
        );
      }
    );

    return unsubscribe;
  }, [
    currentUser,
    selectedConversation?.id,
  ]);

  /*
   * ==========================================
   * MARK SELECTED CONVERSATION AS READ
   * ==========================================
   */

  useEffect(() => {
    if (
      !currentUser ||
      !selectedConversation
    ) {
      return;
    }

    if (
      Number(
        selectedConversation.unreadForCustomer ||
          0
      ) > 0
    ) {
      const conversationRef = doc(
        db,
        "conversations",
        selectedConversation.id
      );

      updateDoc(conversationRef, {
        unreadForCustomer: 0,
        updatedAt: serverTimestamp(),
      }).catch((error) => {
        console.error(
          "Error marking conversation as read:",
          error
        );
      });
    }
  }, [
    currentUser,
    selectedConversation?.id,
    selectedConversation?.unreadForCustomer,
  ]);

  /*
   * ==========================================
   * SELECT CONVERSATION
   * ==========================================
   */

  const handleSelectConversation = (
    conversation
  ) => {
    setSelectedConversation(conversation);
    setMessages([]);
  };

  /*
   * ==========================================
   * SEND MESSAGE
   * ==========================================
   */

  const sendMessage = async () => {
    const trimmedMessage =
      messageText.trim();

    if (
      !trimmedMessage ||
      !currentUser ||
      !selectedConversation ||
      sending
    ) {
      return;
    }

    setSending(true);

    try {
      const conversationRef = doc(
        db,
        "conversations",
        selectedConversation.id
      );

      const messagesRef = collection(
        conversationRef,
        "messages"
      );

      await addDoc(messagesRef, {
        senderId: currentUser.uid,
        senderRole: "customer",
        senderName:
          customerName || "MPRSS Rider",
        message: trimmedMessage,
        createdAt: serverTimestamp(),
      });

      await updateDoc(
        conversationRef,
        {
          customerId: currentUser.uid,
          customerUid: currentUser.uid,
          customerEmail:
            currentUser.email || "",
          customerName:
            customerName || "MPRSS Rider",

          lastMessage: trimmedMessage,
          lastMessageAt:
            serverTimestamp(),

          /*
           * Increase unread count for the
           * selected recipient.
           */
          unreadForRecipient:
            increment(1),

          /*
           * Customer has already read
           * this conversation.
           */
          unreadForCustomer: 0,

          updatedAt: serverTimestamp(),
        }
      );

      setMessageText("");
    } catch (error) {
      console.error(
        "Error sending message:",
        error
      );
    } finally {
      setSending(false);
    }
  };

  /*
   * ==========================================
   * FORMAT TIME
   * ==========================================
   */

  const formatMessageTime = (item) => {
    if (!item?.createdAt) {
      return "";
    }

    try {
      const date =
        typeof item.createdAt.toDate ===
        "function"
          ? item.createdAt.toDate()
          : new Date(item.createdAt);

      if (
        Number.isNaN(date.getTime())
      ) {
        return "";
      }

      return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  /*
   * ==========================================
   * SEARCH
   * ==========================================
   */

  const filteredConversations =
    useMemo(() => {
      const search =
        searchText.toLowerCase().trim();

      if (!search) {
        return conversations;
      }

      return conversations.filter(
        (conversation) =>
          (
            conversation.recipientName ||
            ""
          )
            .toLowerCase()
            .includes(search) ||
          (
            conversation.lastMessage ||
            ""
          )
            .toLowerCase()
            .includes(search)
      );
    }, [
      conversations,
      searchText,
    ]);

  /*
   * ==========================================
   * CURRENT CHAT
   * ==========================================
   */

  const conversationName =
    selectedConversation?.recipientName ||
    "MPRSS Admin";

  const conversationRole =
    selectedConversation?.role ||
    "Service Shop";

  const adminOnline =
    selectedConversation?.online === true;

  const totalUnread = conversations.reduce(
    (total, conversation) =>
      total +
      Number(
        conversation.unreadForCustomer || 0
      ),
    0
  );

  return (
    <CustomerLayout title="Messages">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <View style={styles.content}>
          {/* ================================
              CONVERSATION LIST
              ================================ */}

          <View style={styles.conversationPanel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>
                Conversations
              </Text>

              {totalUnread > 0 && (
                <View
                  style={styles.unreadBadge}
                >
                  <Text
                    style={
                      styles.unreadBadgeText
                    }
                  >
                    {totalUnread}
                  </Text>
                </View>
              )}
            </View>

            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search messages"
              placeholderTextColor="#9ca3af"
              style={styles.searchInput}
            />

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.conversationList
              }
            >
              {loading ? (
                <View
                  style={styles.noConversation}
                >
                  <Text
                    style={
                      styles.noConversationText
                    }
                  >
                    Loading conversations...
                  </Text>
                </View>
              ) : filteredConversations.length ===
                0 ? (
                <View
                  style={styles.noConversation}
                >
                  <Text
                    style={
                      styles.noConversationText
                    }
                  >
                    No conversations found.
                  </Text>
                </View>
              ) : (
                filteredConversations.map(
                  (conversation) => {
                    const isSelected =
                      selectedConversation?.id ===
                      conversation.id;

                    const unreadCount = Number(
                      conversation.unreadForCustomer ||
                        0
                    );

                    return (
                      <TouchableOpacity
                        key={conversation.id}
                        style={[
                          styles.conversationItem,
                          isSelected &&
                            styles.conversationItemSelected,
                        ]}
                        onPress={() =>
                          handleSelectConversation(
                            conversation
                          )
                        }
                        activeOpacity={0.8}
                      >
                        <View
                          style={styles.avatar}
                        >
                          <Text
                            style={
                              styles.avatarText
                            }
                          >
                            {conversation.recipientId ===
                            "super_admin"
                              ? "SA"
                              : "MA"}
                          </Text>

                          {conversation.online && (
                            <View
                              style={
                                styles.onlineDot
                              }
                            />
                          )}
                        </View>

                        <View
                          style={
                            styles.conversationInfo
                          }
                        >
                          <View
                            style={
                              styles.conversationTopRow
                            }
                          >
                            <Text
                              style={
                                styles.conversationName
                              }
                              numberOfLines={1}
                            >
                              {
                                conversation.recipientName
                              }
                            </Text>

                            <Text
                              style={
                                styles.conversationTime
                              }
                            >
                              {formatMessageTime(
                                {
                                  createdAt:
                                    conversation.lastMessageAt,
                                }
                              )}
                            </Text>
                          </View>

                          <Text
                            style={
                              styles.conversationRole
                            }
                          >
                            {conversation.role}
                          </Text>

                          <Text
                            style={
                              styles.conversationPreview
                            }
                            numberOfLines={1}
                          >
                            {conversation.lastMessage ||
                              "Start a conversation"}
                          </Text>
                        </View>

                        {unreadCount > 0 && (
                          <View
                            style={
                              styles.unreadDot
                            }
                          >
                            <Text
                              style={
                                styles.unreadDotText
                              }
                            >
                              {unreadCount}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  }
                )
              )}
            </ScrollView>
          </View>

          {/* ================================
              CHAT
              ================================ */}

          <View style={styles.chatPanel}>
            <View style={styles.chatHeader}>
              <View
                style={
                  styles.chatHeaderAvatar
                }
              >
                <Text
                  style={
                    styles.chatHeaderAvatarText
                  }
                >
                  {selectedConversation?.recipientId ===
                  "super_admin"
                    ? "SA"
                    : "MA"}
                </Text>

                {adminOnline && (
                  <View
                    style={
                      styles.chatOnlineDot
                    }
                  />
                )}
              </View>

              <View
                style={
                  styles.chatHeaderInfo
                }
              >
                <Text
                  style={
                    styles.chatHeaderName
                  }
                >
                  {conversationName}
                </Text>

                <Text
                  style={
                    styles.chatHeaderStatus
                  }
                >
                  {adminOnline
                    ? "Online"
                    : conversationRole}
                </Text>
              </View>
            </View>

            {/* MESSAGES */}

            <ScrollView
              style={styles.messagesArea}
              contentContainerStyle={
                styles.messagesContent
              }
              showsVerticalScrollIndicator={
                false
              }
            >
              <View
                style={styles.dateDivider}
              >
                <View
                  style={styles.dividerLine}
                />

                <Text
                  style={styles.dateText}
                >
                  Today
                </Text>

                <View
                  style={styles.dividerLine}
                />
              </View>

              {messages.length === 0 ? (
                <View
                  style={styles.emptyMessages}
                >
                  <Text
                    style={
                      styles.emptyMessagesTitle
                    }
                  >
                    Start a conversation
                  </Text>

                  <Text
                    style={
                      styles.emptyMessagesText
                    }
                  >
                    Send a message to{" "}
                    {conversationName}.
                  </Text>
                </View>
              ) : (
                messages.map((item) => {
                  const isCustomer =
                    item.senderRole ===
                    "customer";

                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.messageRow,
                        isCustomer &&
                          styles.messageRowCustomer,
                      ]}
                    >
                      {!isCustomer && (
                        <View
                          style={
                            styles.smallAvatar
                          }
                        >
                          <Text
                            style={
                              styles.smallAvatarText
                            }
                          >
                            {item.senderRole ===
                            "super_admin"
                              ? "SA"
                              : "MA"}
                          </Text>
                        </View>
                      )}

                      <View
                        style={[
                          styles.messageBlock,
                          isCustomer &&
                            styles.messageBlockCustomer,
                        ]}
                      >
                        <View
                          style={[
                            styles.messageBubble,
                            isCustomer &&
                              styles.customerBubble,
                          ]}
                        >
                          <Text
                            style={[
                              styles.messageText,
                              isCustomer &&
                                styles.customerMessageText,
                            ]}
                          >
                            {item.message}
                          </Text>
                        </View>

                        <Text
                          style={[
                            styles.messageTime,
                            isCustomer &&
                              styles.customerMessageTime,
                          ]}
                        >
                          {formatMessageTime(
                            item
                          )}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>

            {/* QUICK REPLIES */}

            <View
              style={styles.quickReplyArea}
            >
              <Text
                style={styles.quickReplyLabel}
              >
                Quick reply
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
              >
                <TouchableOpacity
                  style={styles.quickReply}
                  onPress={() =>
                    setMessageText(
                      "Hello, I would like to ask about my service request."
                    )
                  }
                >
                  <Text
                    style={
                      styles.quickReplyText
                    }
                  >
                    Service update
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickReply}
                  onPress={() =>
                    setMessageText(
                      "Can I ask about my scheduled service?"
                    )
                  }
                >
                  <Text
                    style={
                      styles.quickReplyText
                    }
                  >
                    Schedule inquiry
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickReply}
                  onPress={() =>
                    setMessageText(
                      "I need help with my motorcycle service."
                    )
                  }
                >
                  <Text
                    style={
                      styles.quickReplyText
                    }
                  >
                    Need assistance
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* MESSAGE COMPOSER */}

            <View
              style={styles.composerArea}
            >
              <TextInput
                value={messageText}
                onChangeText={setMessageText}
                placeholder={`Message ${conversationName}...`}
                placeholderTextColor="#9ca3af"
                multiline
                style={styles.messageInput}
                editable={
                  !sending &&
                  !!currentUser &&
                  !!selectedConversation
                }
              />

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!messageText.trim() ||
                    sending ||
                    !currentUser ||
                    !selectedConversation) &&
                    styles.sendButtonDisabled,
                ]}
                onPress={sendMessage}
                disabled={
                  !messageText.trim() ||
                  sending ||
                  !currentUser ||
                  !selectedConversation
                }
                activeOpacity={0.85}
              >
                <Text
                  style={
                    styles.sendButtonText
                  }
                >
                  {sending
                    ? "Sending..."
                    : "Send"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </CustomerLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8fafc",
  },

  /* CONVERSATIONS */

  conversationPanel: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
    marginBottom: 14,
  },

  panelHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  panelTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },

  unreadBadge: {
    marginLeft: 8,
    minWidth: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },

  unreadBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
  },

  searchInput: {
    margin: 14,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 12,
    fontSize: 13,
    color: "#111827",
  },

  conversationList: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },

  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 11,
    borderRadius: 12,
    marginBottom: 4,
  },

  conversationItemSelected: {
    backgroundColor: "#f3f4f6",
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  avatarText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
  },

  onlineDot: {
    position: "absolute",
    right: 1,
    bottom: 1,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#22c55e",
    borderWidth: 2,
    borderColor: "#ffffff",
  },

  conversationInfo: {
    flex: 1,
    marginLeft: 11,
  },

  conversationTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  conversationName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
    marginRight: 8,
  },

  conversationTime: {
    fontSize: 10,
    color: "#9ca3af",
  },

  conversationRole: {
    marginTop: 2,
    fontSize: 10,
    color: "#6b7280",
  },

  conversationPreview: {
    marginTop: 3,
    fontSize: 11,
    color: "#6b7280",
  },

  unreadDot: {
    minWidth: 21,
    height: 21,
    borderRadius: 11,
    marginLeft: 8,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },

  unreadDotText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "800",
  },

  noConversation: {
    padding: 25,
    alignItems: "center",
  },

  noConversationText: {
    color: "#6b7280",
    fontSize: 13,
  },

  /* CHAT */

  chatPanel: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },

  chatHeader: {
    minHeight: 70,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
  },

  chatHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  chatHeaderAvatarText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
  },

  chatOnlineDot: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#22c55e",
    borderWidth: 2,
    borderColor: "#ffffff",
  },

  chatHeaderInfo: {
    marginLeft: 10,
  },

  chatHeaderName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },

  chatHeaderStatus: {
    marginTop: 2,
    fontSize: 10,
    color: "#22c55e",
  },

  messagesArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  messagesContent: {
    padding: 15,
    paddingBottom: 20,
  },

  dateDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },

  dateText: {
    marginHorizontal: 10,
    fontSize: 10,
    color: "#9ca3af",
    fontWeight: "700",
  },

  emptyMessages: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 45,
    paddingHorizontal: 25,
  },

  emptyMessagesTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#374151",
    marginBottom: 5,
  },

  emptyMessagesText: {
    fontSize: 11,
    color: "#9ca3af",
    textAlign: "center",
  },

  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 14,
  },

  messageRowCustomer: {
    justifyContent: "flex-end",
  },

  smallAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },

  smallAvatarText: {
    color: "#ffffff",
    fontSize: 8,
    fontWeight: "800",
  },

  messageBlock: {
    maxWidth: "78%",
  },

  messageBlockCustomer: {
    alignItems: "flex-end",
  },

  messageBubble: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    borderBottomLeftRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  customerBubble: {
    backgroundColor: "#111827",
    borderColor: "#111827",
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 5,
  },

  messageText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#374151",
  },

  customerMessageText: {
    color: "#ffffff",
  },

  messageTime: {
    marginTop: 4,
    fontSize: 9,
    color: "#9ca3af",
  },

  customerMessageTime: {
    textAlign: "right",
  },

  /* QUICK REPLY */

  quickReplyArea: {
    paddingHorizontal: 12,
    paddingTop: 9,
    paddingBottom: 6,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },

  quickReplyLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6b7280",
    marginBottom: 7,
  },

  quickReply: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 18,
    paddingHorizontal: 11,
    paddingVertical: 7,
    marginRight: 7,
  },

  quickReplyText: {
    fontSize: 10,
    color: "#374151",
    fontWeight: "700",
  },

  /* COMPOSER */

  composerArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },

  messageInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingTop: 11,
    paddingBottom: 11,
    fontSize: 13,
    color: "#111827",
  },

  sendButton: {
    height: 44,
    paddingHorizontal: 17,
    marginLeft: 8,
    borderRadius: 11,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },

  sendButtonDisabled: {
    backgroundColor: "#d1d5db",
  },

  sendButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
});