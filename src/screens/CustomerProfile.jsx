import { useState } from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

import CustomerLayout from "../components/CustomerLayout";

export default function CustomerProfile() {
  const [showEditModal, setShowEditModal] =
    useState(false);

  const [showPasswordModal, setShowPasswordModal] =
    useState(false);

  const [profile, setProfile] = useState({
    fullName: "Carlos Reyes",
    email: "customer@umes.com",
    mobile: "+63 917 123 4567",
  });

  const [editData, setEditData] = useState(profile);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const openEditProfile = () => {
    setEditData(profile);
    setShowEditModal(true);
  };

  const saveProfile = () => {
    setProfile(editData);
    setShowEditModal(false);
  };

  const changePassword = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setShowPasswordModal(false);
  };

  return (
    <CustomerLayout title="Profile">
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* PROFILE HEADER */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              CR
            </Text>
          </View>

          <View style={styles.profileHeaderInfo}>
            <Text style={styles.profileName}>
              {profile.fullName}
            </Text>

            <Text style={styles.profileRole}>
              Customer
            </Text>

            <Text style={styles.profileEmail}>
              {profile.email}
            </Text>
          </View>
        </View>

        {/* PERSONAL INFORMATION */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Personal Information
              </Text>

              <Text style={styles.sectionSubtitle}>
                Manage your account details
              </Text>
            </View>

            <TouchableOpacity
              style={styles.editButton}
              onPress={openEditProfile}
            >
              <Text style={styles.editButtonText}>
                Edit
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>
              FULL NAME
            </Text>

            <Text style={styles.infoValue}>
              {profile.fullName}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>
              EMAIL ADDRESS
            </Text>

            <Text style={styles.infoValue}>
              {profile.email}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>
              MOBILE NUMBER
            </Text>

            <Text style={styles.infoValue}>
              {profile.mobile}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>
              ACCOUNT ROLE
            </Text>

            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                Customer
              </Text>
            </View>
          </View>
        </View>

        {/* ACCOUNT SECURITY */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            Account Security
          </Text>

          <Text style={styles.sectionSubtitle}>
            Manage your password and account security
          </Text>

          <TouchableOpacity
            style={styles.securityButton}
            onPress={() =>
              setShowPasswordModal(true)
            }
          >
            <View>
              <Text
                style={styles.securityTitle}
              >
                Change Password
              </Text>

              <Text
                style={styles.securityDescription}
              >
                Update your account password
              </Text>
            </View>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>
        </View>

        {/* ACCOUNT STATUS */}
        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <Text style={styles.statusIconText}>
              ✓
            </Text>
          </View>

          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>
              Account Verified
            </Text>

            <Text style={styles.statusText}>
              Your email address has been verified.
            </Text>
          </View>
        </View>

        {/* APP INFORMATION */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            About MPRSS
          </Text>

          <Text style={styles.aboutText}>
            Motorcycle Parts Recommendation &
            Service Scheduling System
          </Text>

          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>
              Version
            </Text>

            <Text style={styles.appInfoValue}>
              1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* EDIT PROFILE MODAL */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowEditModal(false)
        }
      >
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Edit Profile
                </Text>

                <Text
                  style={styles.modalSubtitle}
                >
                  Update your personal information
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setShowEditModal(false)
                }
              >
                <Text style={styles.closeButton}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>
              FULL NAME
            </Text>

            <TextInput
              value={editData.fullName}
              onChangeText={(value) =>
                setEditData({
                  ...editData,
                  fullName: value,
                })
              }
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.fieldLabel}>
              EMAIL ADDRESS
            </Text>

            <TextInput
              value={editData.email}
              onChangeText={(value) =>
                setEditData({
                  ...editData,
                  email: value,
                })
              }
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.fieldLabel}>
              MOBILE NUMBER
            </Text>

            <TextInput
              value={editData.mobile}
              onChangeText={(value) =>
                setEditData({
                  ...editData,
                  mobile: value,
                })
              }
              style={styles.input}
              placeholder="Mobile number"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={saveProfile}
            >
              <Text
                style={styles.primaryButtonText}
              >
                Save Changes
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* CHANGE PASSWORD MODAL */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowPasswordModal(false)
        }
      >
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Change Password
                </Text>

                <Text
                  style={styles.modalSubtitle}
                >
                  Keep your account secure
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setShowPasswordModal(false)
                }
              >
                <Text style={styles.closeButton}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>
              CURRENT PASSWORD
            </Text>

            <TextInput
              value={passwordData.currentPassword}
              onChangeText={(value) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: value,
                })
              }
              style={styles.input}
              placeholder="Current password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
            />

            <Text style={styles.fieldLabel}>
              NEW PASSWORD
            </Text>

            <TextInput
              value={passwordData.newPassword}
              onChangeText={(value) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: value,
                })
              }
              style={styles.input}
              placeholder="New password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
            />

            <Text style={styles.fieldLabel}>
              CONFIRM NEW PASSWORD
            </Text>

            <TextInput
              value={passwordData.confirmPassword}
              onChangeText={(value) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: value,
                })
              }
              style={styles.input}
              placeholder="Confirm new password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={changePassword}
            >
              <Text
                style={styles.primaryButtonText}
              >
                Update Password
              </Text>
            </TouchableOpacity>
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

  profileCard: {
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
  },

  profileHeaderInfo: {
    flex: 1,
    marginLeft: 14,
  },

  profileName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
  },

  profileRole: {
    marginTop: 3,
    fontSize: 12,
    color: "#d1d5db",
  },

  profileEmail: {
    marginTop: 4,
    fontSize: 12,
    color: "#9ca3af",
  },

  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 17,
    marginBottom: 14,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#6b7280",
  },

  editButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 8,
  },

  editButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },

  infoItem: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },

  infoLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#9ca3af",
    letterSpacing: 0.5,
  },

  infoValue: {
    marginTop: 5,
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },

  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 6,
  },

  roleBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#374151",
  },

  securityButton: {
    marginTop: 15,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  securityTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
  },

  securityDescription: {
    marginTop: 3,
    fontSize: 11,
    color: "#6b7280",
  },

  arrow: {
    fontSize: 25,
    color: "#9ca3af",
  },

  statusCard: {
    backgroundColor: "#ecfdf5",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  statusIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#16a34a",
    alignItems: "center",
    justifyContent: "center",
  },

  statusIconText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
  },

  statusInfo: {
    flex: 1,
    marginLeft: 11,
  },

  statusTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#166534",
  },

  statusText: {
    marginTop: 3,
    fontSize: 11,
    color: "#15803d",
  },

  aboutText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: "#4b5563",
  },

  appInfoRow: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  appInfoLabel: {
    fontSize: 12,
    color: "#6b7280",
  },

  appInfoValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  modalCard: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },

  modalSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#6b7280",
  },

  closeButton: {
    fontSize: 30,
    color: "#6b7280",
    lineHeight: 30,
  },

  fieldLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#6b7280",
    marginTop: 12,
    marginBottom: 7,
  },

  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    color: "#111827",
  },

  primaryButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },

  primaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
});