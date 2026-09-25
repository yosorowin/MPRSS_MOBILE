import { useState } from "react";
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

import CustomerLayout from "../components/CustomerLayout";

const conversations = [
  {
    id: "admin-1",
    name: "MPRSS Admin",
    role: "Service Shop",
    preview:
      "Your service request has been received.",
    time: "10:32 AM",
    unread: 2,
    online: true,
  },
  {
    id: "admin-2",
    name: "Service Coordinator",
    role: "MPRSS Staff",
    preview:
      "Your motorcycle is ready for pickup.",
    time: "Yesterday",
    unread: 0,
    online: false,
  },
];

const initialMessages = [
  {
    id: "msg-1",
    sender: "admin",
    message:
      "Hello Carlos! Welcome to MPRSS. How can we help you today?",
    time: "10:21 AM",
  },
  {
    id: "msg-2",
    sender: "customer",
    message:
      "Hi! I would like to ask about my service request.",
    time: "10:24 AM",
  },
  {
    id: "msg-3",
    sender: "admin",
    message:
      "Sure. Your request is currently under review by our service team.",
    time: "10:26 AM",
  },
  {
    id: "msg-4",
    sender: "customer",
    message:
      "Okay, thank you. Please let me know once it is approved.",
    time: "10:30 AM",
  },
  {
    id: "msg-5",
    sender: "admin",
    message:
      "Your service request has been received. We will update you once it has been reviewed.",
    time: "10:32 AM",
  },
];

export default function CustomerMessages() {
  const [selectedConversation, setSelectedConversation] =
    useState(conversations[0]);

  const [messages, setMessages] =
    useState(initialMessages);

  const [messageText, setMessageText] =
    useState("");

  const [searchText, setSearchText] =
    useState("");

  const sendMessage = () => {
    const trimmedMessage = messageText.trim();

    if (!trimmedMessage) {
      return;
    }

    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: "customer",
      message: trimmedMessage,
      time: getCurrentTime(),
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      newMessage,
    ]);

    setMessageText("");
  };

  const filteredConversations =
    conversations.filter((conversation) => {
      const search = searchText
        .toLowerCase()
        .trim();

      if (!search) {
        return true;
      }

      return (
        conversation.name
          .toLowerCase()
          .indexOf(search) !== -1 ||
        conversation.preview
          .toLowerCase()
          .indexOf(search) !== -1
      );
    });

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
          {/* CONVERSATIONS */}
          <View style={styles.conversationPanel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>
                Conversations
              </Text>

              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  2
                </Text>
              </View>
            </View>

            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search messages"
              placeholderTextColor="#9ca3af"
              style={styles.searchInput}
            />

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={
                styles.conversationList
              }
            >
              {filteredConversations.length ===
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
                    const selected =
                      selectedConversation.id ===
                      conversation.id;

                    return (
                      <TouchableOpacity
                        key={conversation.id}
                        style={[
                          styles.conversationItem,
                          selected &&
                            styles.conversationItemSelected,
                        ]}
                        onPress={() =>
                          setSelectedConversation(
                            conversation
                          )
                        }
                        activeOpacity={0.8}
                      >
                        <View
                          style={
                            styles.avatar
                          }
                        >
                          <Text
                            style={
                              styles.avatarText
                            }
                          >
                            MA
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
                              {conversation.name}
                            </Text>

                            <Text
                              style={
                                styles.conversationTime
                              }
                            >
                              {conversation.time}
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
                            {conversation.preview}
                          </Text>
                        </View>

                        {conversation.unread >
                          0 && (
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
                              {conversation.unread}
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

          {/* CHAT */}
          <View style={styles.chatPanel}>
            <View style={styles.chatHeader}>
              <View
                style={styles.chatHeaderAvatar}
              >
                <Text
                  style={
                    styles.chatHeaderAvatarText
                  }
                >
                  MA
                </Text>

                {selectedConversation.online && (
                  <View
                    style={styles.chatOnlineDot}
                  />
                )}
              </View>

              <View
                style={styles.chatHeaderInfo}
              >
                <Text
                  style={styles.chatHeaderName}
                >
                  {selectedConversation.name}
                </Text>

                <Text
                  style={styles.chatHeaderStatus}
                >
                  {selectedConversation.online
                    ? "Online"
                    : "Offline"}
                </Text>
              </View>
            </View>

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

              {messages.map((item) => {
                const isCustomer =
                  item.sender ===
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
                          MA
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
                        {item.time}
                      </Text>
                    </View>
                  </View>
                );
              })}
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
                placeholder="Type your message..."
                placeholderTextColor="#9ca3af"
                multiline
                style={styles.messageInput}
              />

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !messageText.trim() &&
                    styles.sendButtonDisabled,
                ]}
                onPress={sendMessage}
                disabled={!messageText.trim()}
                activeOpacity={0.85}
              >
                <Text
                  style={styles.sendButtonText}
                >
                  Send
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </CustomerLayout>
  );
}

function getCurrentTime() {
  const now = new Date();

  return now.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
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
    fontSize: 12,
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
    fontSize: 11,
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
    color: "#22a55",
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