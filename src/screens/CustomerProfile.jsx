import {
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  updateEmail,
  updatePassword,
} from "firebase/auth";
import {
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";

import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import CustomerLayout from "../components/CustomerLayout";
import { auth, db } from "../firebase";

export default function CustomerProfile() {
  const [showEditModal, setShowEditModal] =
    useState(false);

  const [showPasswordModal, setShowPasswordModal] =
    useState(false);

  const [showDeleteAccountModal, setShowDeleteAccountModal] =
    useState(false);

  const [currentUser, setCurrentUser] =
    useState(null);

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    mobile: "",
  });

  const [editData, setEditData] = useState({
    fullName: "",
    email: "",
    mobile: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [deleteAccountReason, setDeleteAccountReason] =
    useState("");

  const [accountDeletionPending, setAccountDeletionPending] =
    useState(false);

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [requestingAccountDeletion, setRequestingAccountDeletion] =
    useState(false);

  /*
   * --------------------------------------------------
   * FIREBASE AUTH
   * --------------------------------------------------
   */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setCurrentUser(user || null);

        if (!user) {
          setProfile({
            fullName: "",
            email: "",
            mobile: "",
          });

          setAccountDeletionPending(false);
        }
      }
    );

    return unsubscribe;
  }, []);

  /*
   * --------------------------------------------------
   * FIRESTORE CUSTOMER PROFILE
   * --------------------------------------------------
   */

  useEffect(() => {
    if (!currentUser?.uid) {
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

          setProfile({
            fullName: data.fullName || "",
            email:
              data.email ||
              currentUser.email ||
              "",
            mobile: data.mobileNumber || "",
          });

          setAccountDeletionPending(
            data.accountDeletionRequest?.status ===
              "pending"
          );

          console.log(
            "Firebase customer profile:",
            {
              uid: currentUser.uid,
              ...data,
            }
          );
        } else {
          console.warn(
            "Customer profile not found in Firestore:",
            currentUser.uid
          );

          setProfile({
            fullName: "",
            email: currentUser.email || "",
            mobile: "",
          });

          setAccountDeletionPending(false);
        }
      },
      (error) => {
        console.error(
          "Error loading customer profile:",
          error
        );
      }
    );

    return unsubscribe;
  }, [currentUser]);

  /*
   * --------------------------------------------------
   * EDIT PROFILE
   * --------------------------------------------------
   */

  const openEditProfile = () => {
    setEditData({
      fullName: profile.fullName,
      email:
        profile.email ||
        currentUser?.email ||
        "",
      mobile: profile.mobile,
    });

    setShowEditModal(true);
  };

  const saveProfile = async () => {
    if (!currentUser?.uid) {
      alert("You are not logged in.");
      return;
    }

    const fullName = editData.fullName.trim();
    const email = editData.email.trim().toLowerCase();
    const mobile = editData.mobile.trim();

    if (!fullName) {
      alert("Please enter your full name.");
      return;
    }

    if (!email) {
      alert("Please enter your email address.");
      return;
    }

    if (!mobile) {
      alert("Please enter your mobile number.");
      return;
    }

    setSavingProfile(true);

    try {
      const customerRef = doc(
        db,
        "customers",
        currentUser.uid
      );

      const oldEmail =
        currentUser.email?.trim().toLowerCase() || "";

      if (email !== oldEmail) {
        try {
          await updateEmail(
            currentUser,
            email
          );

          await sendEmailVerification(
            currentUser
          );
        } catch (emailError) {
          console.error(
            "EMAIL UPDATE ERROR:",
            emailError
          );

          if (
            emailError?.code ===
            "auth/requires-recent-login"
          ) {
            alert(
              "For security, please log in again before changing your email address."
            );
          } else if (
            emailError?.code ===
            "auth/email-already-in-use"
          ) {
            alert(
              "That email address is already being used by another account."
            );
          } else if (
            emailError?.code ===
            "auth/invalid-email"
          ) {
            alert(
              "Please enter a valid email address."
            );
          } else {
            alert(
              emailError?.message ||
                "Unable to update your email address."
            );
          }

          setSavingProfile(false);
          return;
        }
      }

      await updateDoc(customerRef, {
        fullName,
        email,
        mobileNumber: mobile,
        updatedAt: serverTimestamp(),
      });

      setProfile({
        fullName,
        email,
        mobile,
      });

      setShowEditModal(false);

      alert(
        email !== oldEmail
          ? "Profile updated. Please check your new email address for the verification email."
          : "Profile updated successfully."
      );
    } catch (error) {
      console.error(
        "PROFILE UPDATE ERROR:",
        error
      );

      if (
        error?.code ===
        "permission-denied"
      ) {
        alert(
          "Permission denied while updating your profile."
        );
      } else {
        alert(
          error?.message ||
            "Unable to update your profile."
        );
      }
    } finally {
      setSavingProfile(false);
    }
  };

  /*
   * --------------------------------------------------
   * CHANGE PASSWORD
   * --------------------------------------------------
   */

  const openPasswordModal = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setShowPasswordModal(true);
  };

  const changePassword = async () => {
    if (!currentUser?.email) {
      alert(
        "Your account email could not be found."
      );
      return;
    }

    const currentPassword =
      passwordData.currentPassword;

    const newPassword =
      passwordData.newPassword;

    const confirmPassword =
      passwordData.confirmPassword;

    if (!currentPassword) {
      alert(
        "Please enter your current password."
      );
      return;
    }

    if (!newPassword) {
      alert(
        "Please enter your new password."
      );
      return;
    }

    if (newPassword.length < 6) {
      alert(
        "Your new password must be at least 6 characters."
      );
      return;
    }

    if (!/[A-Za-z]/.test(newPassword)) {
      alert(
        "Your new password must contain at least one letter."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      alert(
        "The new passwords do not match."
      );
      return;
    }

    if (currentPassword === newPassword) {
      alert(
        "Your new password must be different from your current password."
      );
      return;
    }

    setChangingPassword(true);

    try {
      const credential =
        EmailAuthProvider.credential(
          currentUser.email,
          currentPassword
        );

      await reauthenticateWithCredential(
        currentUser,
        credential
      );

      await updatePassword(
        currentUser,
        newPassword
      );

      const customerRef = doc(
        db,
        "customers",
        currentUser.uid
      );

      await updateDoc(customerRef, {
        updatedAt: serverTimestamp(),
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowPasswordModal(false);

      alert(
        "Your password has been changed successfully."
      );
    } catch (error) {
      console.error(
        "PASSWORD CHANGE ERROR:",
        error
      );

      if (
        error?.code ===
        "auth/invalid-credential"
      ) {
        alert(
          "The current password is incorrect."
        );
      } else if (
        error?.code ===
        "auth/wrong-password"
      ) {
        alert(
          "The current password is incorrect."
        );
      } else if (
        error?.code ===
        "auth/requires-recent-login"
      ) {
        alert(
          "For security, please log in again before changing your password."
        );
      } else if (
        error?.code ===
        "auth/weak-password"
      ) {
        alert(
          "The new password is too weak."
        );
      } else {
        alert(
          error?.message ||
            "Unable to change your password."
        );
      }
    } finally {
      setChangingPassword(false);
    }
  };

  /*
   * --------------------------------------------------
   * ACCOUNT DELETION REQUEST
   * --------------------------------------------------
   */

  const openDeleteAccountModal = () => {
    if (accountDeletionPending) {
      alert(
        "Your account deletion request is already pending admin approval."
      );
      return;
    }

    setDeleteAccountReason("");
    setShowDeleteAccountModal(true);
  };

  const requestAccountDeletion = async () => {
    if (!currentUser?.uid) {
      alert("You are not logged in.");
      return;
    }

    if (accountDeletionPending) {
      alert(
        "Your account deletion request is already pending admin approval."
      );
      return;
    }

    const reason = deleteAccountReason.trim();

    if (!reason) {
      alert(
        "Please provide a reason for requesting account deletion."
      );
      return;
    }

    setRequestingAccountDeletion(true);

    try {
      const customerRef = doc(
        db,
        "customers",
        currentUser.uid
      );

      await updateDoc(customerRef, {
        accountDeletionRequest: {
          status: "pending",
          reason,
          requestedAt: serverTimestamp(),
          requestedBy: currentUser.uid,
        },
        updatedAt: serverTimestamp(),
      });

      setAccountDeletionPending(true);
      setDeleteAccountReason("");
      setShowDeleteAccountModal(false);

      alert(
        "Your account deletion request has been submitted. Your account will remain active until an admin reviews and approves the request."
      );
    } catch (error) {
      console.error(
        "ACCOUNT DELETION REQUEST ERROR:",
        error
      );

      if (
        error?.code ===
        "permission-denied"
      ) {
        alert(
          "Permission denied while submitting your account deletion request."
        );
      } else {
        alert(
          error?.message ||
            "Unable to submit your account deletion request."
        );
      }
    } finally {
      setRequestingAccountDeletion(false);
    }
  };

  /*
   * --------------------------------------------------
   * AVATAR INITIALS
   * --------------------------------------------------
   */

  const getInitials = () => {
    const name = profile.fullName?.trim();

    if (!name) {
      return "CU";
    }

    const parts = name.split(/\s+/);

    if (parts.length === 1) {
      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  const isEmailVerified =
    currentUser?.emailVerified === true;

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
              {getInitials()}
            </Text>
          </View>

          <View style={styles.profileHeaderInfo}>
            <Text style={styles.profileName}>
              {profile.fullName ||
                "Customer"}
            </Text>

            <Text style={styles.profileRole}>
              Customer
            </Text>

            <Text style={styles.profileEmail}>
              {profile.email ||
                currentUser?.email ||
                ""}
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
              {profile.fullName || "Not set"}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>
              EMAIL ADDRESS
            </Text>

            <Text style={styles.infoValue}>
              {profile.email ||
                currentUser?.email ||
                "Not set"}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>
              MOBILE NUMBER
            </Text>

            <Text style={styles.infoValue}>
              {profile.mobile || "Not set"}
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
            onPress={openPasswordModal}
          >
            <View>
              <Text style={styles.securityTitle}>
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
        <View
          style={[
            styles.statusCard,
            !isEmailVerified &&
              styles.statusCardUnverified,
          ]}
        >
          <View
            style={[
              styles.statusIcon,
              !isEmailVerified &&
                styles.statusIconUnverified,
            ]}
          >
            <Text style={styles.statusIconText}>
              {isEmailVerified ? "✓" : "!"}
            </Text>
          </View>

          <View style={styles.statusInfo}>
            <Text
              style={[
                styles.statusTitle,
                !isEmailVerified &&
                  styles.statusTitleUnverified,
              ]}
            >
              {isEmailVerified
                ? "Account Verified"
                : "Email Not Verified"}
            </Text>

            <Text
              style={[
                styles.statusText,
                !isEmailVerified &&
                  styles.statusTextUnverified,
              ]}
            >
              {isEmailVerified
                ? "Your email address has been verified."
                : "Your email address has not been verified yet."}
            </Text>
          </View>
        </View>

        {/* ACCOUNT DELETION */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            Account Deletion
          </Text>

          <Text style={styles.sectionSubtitle}>
            Request the removal of your MPRSS account
          </Text>

          {accountDeletionPending ? (
            <View style={styles.deletionPendingCard}>
              <View style={styles.deletionPendingIcon}>
                <Text style={styles.deletionPendingIconText}>
                  !
                </Text>
              </View>

              <View style={styles.deletionPendingInfo}>
                <Text style={styles.deletionPendingTitle}>
                  Deletion Request Pending
                </Text>

                <Text style={styles.deletionPendingText}>
                  Your account deletion request has been
                  submitted and is waiting for admin approval.
                </Text>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.deletionDescription}>
                If you no longer want to use MPRSS, you can
                submit an account deletion request. Your
                account will remain active until an admin
                reviews and approves the request.
              </Text>

              <TouchableOpacity
                style={styles.deleteAccountButton}
                onPress={openDeleteAccountModal}
              >
                <Text style={styles.deleteAccountButtonText}>
                  Request Account Deletion
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* APP INFORMATION */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            About MPRSS
          </Text>

          <Text style={styles.aboutText}>
            Motorcycle Parts Recommendation &
            {"\n"}Service Scheduling System
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
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
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
                  <Text
                    style={styles.closeButton}
                  >
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
                style={[
                  styles.primaryButton,
                  savingProfile &&
                    styles.primaryButtonDisabled,
                ]}
                onPress={saveProfile}
                disabled={savingProfile}
              >
                <Text
                  style={styles.primaryButtonText}
                >
                  {savingProfile
                    ? "Saving..."
                    : "Save Changes"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
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
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
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
                  <Text
                    style={styles.closeButton}
                  >
                    ×
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.fieldLabel}>
                CURRENT PASSWORD
              </Text>

              <TextInput
                value={
                  passwordData.currentPassword
                }
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
                value={
                  passwordData.newPassword
                }
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
                value={
                  passwordData.confirmPassword
                }
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
                style={[
                  styles.primaryButton,
                  changingPassword &&
                    styles.primaryButtonDisabled,
                ]}
                onPress={changePassword}
                disabled={changingPassword}
              >
                <Text
                  style={styles.primaryButtonText}
                >
                  {changingPassword
                    ? "Updating..."
                    : "Update Password"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ACCOUNT DELETION REQUEST MODAL */}
      <Modal
        visible={showDeleteAccountModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!requestingAccountDeletion) {
            setShowDeleteAccountModal(false);
          }
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalHeader}>
                <View style={styles.deleteModalTitleContainer}>
                  <Text style={styles.modalTitle}>
                    Request Account Deletion
                  </Text>

                  <Text style={styles.modalSubtitle}>
                    Submit a request for admin review
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    if (!requestingAccountDeletion) {
                      setShowDeleteAccountModal(false);
                    }
                  }}
                  disabled={requestingAccountDeletion}
                >
                  <Text style={styles.closeButton}>
                    ×
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.warningCard}>
                <Text style={styles.warningTitle}>
                  Before you continue
                </Text>

                <Text style={styles.warningText}>
                  This will send an account deletion request
                  to the admin. Your account will remain active
                  until the request is reviewed and approved.
                </Text>
              </View>

              <Text style={styles.fieldLabel}>
                REASON FOR DELETION
              </Text>

              <TextInput
                value={deleteAccountReason}
                onChangeText={setDeleteAccountReason}
                style={[
                  styles.input,
                  styles.reasonInput,
                ]}
                placeholder="Please tell us why you want to delete your account"
                placeholderTextColor="#9ca3af"
                multiline
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  styles.deleteSubmitButton,
                  requestingAccountDeletion &&
                    styles.primaryButtonDisabled,
                ]}
                onPress={requestAccountDeletion}
                disabled={requestingAccountDeletion}
              >
                <Text style={styles.primaryButtonText}>
                  {requestingAccountDeletion
                    ? "Submitting..."
                    : "Submit Deletion Request"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  if (!requestingAccountDeletion) {
                    setShowDeleteAccountModal(false);
                  }
                }}
                disabled={requestingAccountDeletion}
              >
                <Text style={styles.cancelButtonText}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </ScrollView>
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

  statusCardUnverified: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
  },

  statusIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#16a34a",
    alignItems: "center",
    justifyContent: "center",
  },

  statusIconUnverified: {
    backgroundColor: "#d97706",
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

  statusTitleUnverified: {
    color: "#92400e",
  },

  statusText: {
    marginTop: 3,
    fontSize: 11,
    color: "#15803d",
  },

  statusTextUnverified: {
    color: "#b45309",
  },

  deletionDescription: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 19,
    color: "#6b7280",
  },

  deleteAccountButton: {
    marginTop: 15,
    minHeight: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },

  deleteAccountButtonText: {
    color: "#dc2626",
    fontSize: 13,
    fontWeight: "800",
  },

  deletionPendingCard: {
    marginTop: 15,
    backgroundColor: "#fffbeb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fde68a",
    padding: 13,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  deletionPendingIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#d97706",
    alignItems: "center",
    justifyContent: "center",
  },

  deletionPendingIconText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },

  deletionPendingInfo: {
    flex: 1,
    marginLeft: 10,
  },

  deletionPendingTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#92400e",
  },

  deletionPendingText: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 17,
    color: "#b45309",
  },

  warningCard: {
    marginBottom: 5,
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fed7aa",
    borderRadius: 12,
    padding: 13,
  },

  warningTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#9a3412",
  },

  warningText: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 17,
    color: "#c2410c",
  },

  deleteModalTitleContainer: {
    flex: 1,
    paddingRight: 10,
  },

  reasonInput: {
    height: 110,
    paddingTop: 12,
  },

  deleteSubmitButton: {
    backgroundColor: "#dc2626",
  },

  cancelButton: {
    height: 46,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 9,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },

  cancelButtonText: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "800",
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
    maxHeight: "90%",
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

  primaryButtonDisabled: {
    opacity: 0.6,
  },

  primaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
});