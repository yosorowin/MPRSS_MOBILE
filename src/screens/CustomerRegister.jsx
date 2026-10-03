import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

import { setRegistrationData } from "../data/registrationStore";
import { auth, db } from "../firebase";

export default function CustomerRegister() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [hasReachedBottom, setHasReachedBottom] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const fullName = formData.fullName.trim();
    const email = formData.email.trim().toLowerCase();
    const mobile = formData.mobile.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!fullName) {
      Alert.alert("Missing Information", "Please enter your full name.");
      return false;
    }

    if (!email) {
      Alert.alert("Missing Information", "Please enter your email address.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      Alert.alert(
        "Invalid Email",
        "Please enter a valid email address."
      );
      return false;
    }

    if (!mobile) {
      Alert.alert(
        "Missing Information",
        "Please enter your mobile number."
      );
      return false;
    }

    if (!password) {
      Alert.alert("Missing Information", "Please enter a password.");
      return false;
    }

    if (password.length < 6) {
      Alert.alert(
        "Invalid Password",
        "Password must be at least 6 characters long."
      );
      return false;
    }

    if (!/[A-Za-z]/.test(password)) {
      Alert.alert(
        "Invalid Password",
        "Password must contain at least one letter."
      );
      return false;
    }

    if (!confirmPassword) {
      Alert.alert(
        "Missing Information",
        "Please confirm your password."
      );
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Password Mismatch",
        "Password and confirm password do not match."
      );
      return false;
    }

    return true;
  };

  const handleOpenTerms = () => {
    setHasReachedBottom(false);
    setShowTerms(true);
  };

  const handleTermsScroll = ({ nativeEvent }) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;

    const isBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - 30;

    if (isBottom) {
      setHasReachedBottom(true);
    }
  };

  const handleAgree = async () => {
    if (!hasReachedBottom) {
      Alert.alert(
        "Please Read the Terms",
        "Please scroll to the bottom of the Terms and Conditions before agreeing."
      );
      return;
    }

    if (isRegistering) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsRegistering(true);

    const fullName = formData.fullName.trim();
    const email = formData.email.trim().toLowerCase();
    const mobile = formData.mobile.trim();
    const password = formData.password;

    try {
      console.log("Starting customer registration...");
      console.log("Email:", email);

      // ---------------------------------------------------------
      // 1. CREATE FIREBASE AUTH ACCOUNT
      // ---------------------------------------------------------
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      console.log("Firebase Auth account created.");
      console.log("UID:", user.uid);

      // ---------------------------------------------------------
      // 2. CREATE CUSTOMER PROFILE IN FIRESTORE
      // ---------------------------------------------------------
      const customerRef = doc(db, "customers", user.uid);

      const customerData = {
        uid: user.uid,
        fullName: fullName,
        email: email,
        mobileNumber: mobile,
        role: "customer",
        status: "active",
        emailVerified: false,

        termsAccepted: true,
        termsAcceptedAt: serverTimestamp(),
        termsVersion: "1.0",

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      console.log("Creating Firestore customer profile...");
      console.log("Customer document path:", `customers/${user.uid}`);

      await setDoc(customerRef, customerData);

      console.log(
        "Customer profile successfully created in Firestore."
      );

      // ---------------------------------------------------------
      // 3. SEND EMAIL VERIFICATION
      // ---------------------------------------------------------
      try {
        await sendEmailVerification(user);

        console.log("Verification email sent.");
      } catch (verificationError) {
        console.error(
          "EMAIL VERIFICATION ERROR:",
          verificationError
        );

        // The customer profile has already been created,
        // so registration itself remains successful.
        Alert.alert(
          "Account Created",
          "Your account was created successfully, but we could not send the verification email right now. You can request another verification email later."
        );
      }

      // ---------------------------------------------------------
      // 4. SAVE REGISTRATION DATA FOR THE APP
      // ---------------------------------------------------------
      setRegistrationData({
        fullName,
        email,
        mobile,
        uid: user.uid,
      });

      // ---------------------------------------------------------
      // 5. GO TO VERIFICATION SCREEN
      // ---------------------------------------------------------
      router.push("/verify");
    } catch (error) {
      console.error("REGISTRATION ERROR:");
      console.error("CODE:", error?.code);
      console.error("MESSAGE:", error?.message);
      console.error("ERROR:", error);

      // ---------------------------------------------------------
      // FIREBASE AUTH ERRORS
      // ---------------------------------------------------------
      if (error?.code === "auth/email-already-in-use") {
        Alert.alert(
          "Email Already Registered",
          "An account with this email address already exists. Please log in instead."
        );
      } else if (error?.code === "auth/invalid-email") {
        Alert.alert(
          "Invalid Email",
          "Please enter a valid email address."
        );
      } else if (error?.code === "auth/weak-password") {
        Alert.alert(
          "Weak Password",
          "Please choose a stronger password."
        );
      } else if (error?.code === "auth/network-request-failed") {
        Alert.alert(
          "Network Error",
          "Please check your internet connection and try again."
        );
      }

      // ---------------------------------------------------------
      // FIRESTORE PERMISSION ERROR
      // ---------------------------------------------------------
      else if (error?.code === "permission-denied") {
        Alert.alert(
          "Registration Error",
          "Your account was created, but the customer profile could not be saved to the database. Please check the Firestore security rules."
        );

        console.error(
          "FIRESTORE PERMISSION DENIED: Check Firestore Rules for customers/{userId}."
        );
      }

      // ---------------------------------------------------------
      // FIRESTORE NETWORK / AVAILABILITY ERROR
      // ---------------------------------------------------------
      else if (error?.code === "unavailable") {
        Alert.alert(
          "Database Unavailable",
          "The database is temporarily unavailable. Please check your internet connection and try again."
        );
      }

      // ---------------------------------------------------------
      // OTHER ERRORS
      // ---------------------------------------------------------
      else {
        Alert.alert(
          "Registration Failed",
          error?.message ||
            "Something went wrong while creating your account. Please try again."
        );
      }
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>

          <Text style={styles.subtitle}>
            Register to access the MPRSS customer mobile app.
          </Text>

          {/* FULL NAME */}
          <Text style={styles.label}>Full Name</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#999"
            value={formData.fullName}
            onChangeText={(value) =>
              handleChange("fullName", value)
            }
            autoCapitalize="words"
          />

          {/* EMAIL */}
          <Text style={styles.label}>Email Address</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            value={formData.email}
            onChangeText={(value) =>
              handleChange("email", value)
            }
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* MOBILE */}
          <Text style={styles.label}>Mobile Number</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your mobile number"
            placeholderTextColor="#999"
            value={formData.mobile}
            onChangeText={(value) =>
              handleChange("mobile", value)
            }
            keyboardType="phone-pad"
          />

          {/* PASSWORD */}
          <Text style={styles.label}>Password</Text>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              value={formData.password}
              onChangeText={(value) =>
                handleChange("password", value)
              }
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />

            <TouchableOpacity
              onPress={() =>
                setShowPassword((prev) => !prev)
              }
            >
              <Text style={styles.showText}>
                {showPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* CONFIRM PASSWORD */}
          <Text style={styles.label}>Confirm Password</Text>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm your password"
              placeholderTextColor="#999"
              value={formData.confirmPassword}
              onChangeText={(value) =>
                handleChange("confirmPassword", value)
              }
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />

            <TouchableOpacity
              onPress={() =>
                setShowConfirmPassword((prev) => !prev)
              }
            >
              <Text style={styles.showText}>
                {showConfirmPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* TERMS */}
          <View style={styles.termsRow}>
            <Pressable
              style={[
                styles.checkbox,
                termsAccepted && styles.checkboxChecked,
              ]}
              onPress={() => {
                if (!termsAccepted) {
                  handleOpenTerms();
                } else {
                  setTermsAccepted(false);
                }
              }}
            >
              {termsAccepted && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </Pressable>

            <Text style={styles.termsText}>
              I agree to the{" "}
              <Text
                style={styles.termsLink}
                onPress={handleOpenTerms}
              >
                Terms and Conditions
              </Text>
            </Text>
          </View>

          {/* REGISTER BUTTON */}
          <TouchableOpacity
            style={[
              styles.registerButton,
              (!termsAccepted || isRegistering) &&
                styles.registerButtonDisabled,
            ]}
            onPress={handleAgree}
            disabled={!termsAccepted || isRegistering}
          >
            <Text style={styles.registerButtonText}>
              {isRegistering ? "Creating Account..." : "Register"}
            </Text>
          </TouchableOpacity>

          {/* LOGIN */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>
              Already have an account?
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/login")}
            >
              <Text style={styles.loginLink}> Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* TERMS MODAL */}
      <Modal
        visible={showTerms}
        animationType="slide"
        transparent
        onRequestClose={() => setShowTerms(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Terms and Conditions
            </Text>

            <ScrollView
              style={styles.termsScroll}
              contentContainerStyle={styles.termsContent}
              onScroll={handleTermsScroll}
              scrollEventThrottle={16}
            >
              <Text style={styles.sectionTitle}>
                1. Acceptance of Terms
              </Text>
              <Text style={styles.termsParagraph}>
                By creating an account and using the Motorcycle Parts
                Recommendation and Service Scheduling System (MPRSS),
                you agree to comply with and be bound by these Terms
                and Conditions.
              </Text>

              <Text style={styles.sectionTitle}>
                2. Account Registration
              </Text>
              <Text style={styles.termsParagraph}>
                Customers are required to provide accurate, complete,
                and updated information when creating an account.
                Customers are responsible for maintaining the
                confidentiality of their account credentials.
              </Text>

              <Text style={styles.sectionTitle}>
                3. Account Responsibility
              </Text>
              <Text style={styles.termsParagraph}>
                You are responsible for all activities performed
                through your account. You must immediately notify the
                system administrator if you believe that your account
                has been accessed without authorization.
              </Text>

              <Text style={styles.sectionTitle}>
                4. Personal Information
              </Text>
              <Text style={styles.termsParagraph}>
                MPRSS collects personal information necessary for
                account management, motorcycle service scheduling,
                customer support, and system functionality.
              </Text>

              <Text style={styles.sectionTitle}>
                5. Accuracy of Information
              </Text>
              <Text style={styles.termsParagraph}>
                Customers must ensure that all information submitted
                through the system is accurate and up to date.
              </Text>

              <Text style={styles.sectionTitle}>
                6. Motorcycle Information
              </Text>
              <Text style={styles.termsParagraph}>
                Customers are responsible for providing accurate
                motorcycle information when adding or registering a
                motorcycle in the system.
              </Text>

              <Text style={styles.sectionTitle}>
                7. Service Requests
              </Text>
              <Text style={styles.termsParagraph}>
                Service requests submitted through MPRSS are subject
                to review and approval by authorized staff.
                Submission of a service request does not guarantee
                immediate service availability.
              </Text>

              <Text style={styles.sectionTitle}>
                8. Service Schedule
              </Text>
              <Text style={styles.termsParagraph}>
                Service schedules may be changed or adjusted by the
                shop depending on availability, workload, parts,
                technicians, or other operational circumstances.
              </Text>

              <Text style={styles.sectionTitle}>
                9. Estimated Service Cost
              </Text>
              <Text style={styles.termsParagraph}>
                Any estimated service cost displayed in the system is
                subject to confirmation by authorized shop staff.
                The final amount may differ depending on the actual
                service performed and parts used.
              </Text>

              <Text style={styles.sectionTitle}>
                10. Payment
              </Text>
              <Text style={styles.termsParagraph}>
                Selecting a payment method during service request
                submission indicates the customer's preferred payment
                method for the request. Payment is subject to service
                approval and final cost confirmation by authorized
                staff.
              </Text>

              <Text style={styles.sectionTitle}>
                11. Actual Payment
              </Text>
              <Text style={styles.termsParagraph}>
                Actual payment shall be completed at the shop based
                on the final service amount confirmed by authorized
                personnel.
              </Text>

              <Text style={styles.sectionTitle}>
                12. Parts Recommendation
              </Text>
              <Text style={styles.termsParagraph}>
                Parts recommendations provided by the system are
                intended as assistance only. Customers should consult
                authorized personnel before purchasing or installing
                parts.
              </Text>

              <Text style={styles.sectionTitle}>
                13. Inventory Information
              </Text>
              <Text style={styles.termsParagraph}>
                Parts availability displayed in the system may change
                due to purchases, reservations, inventory adjustments,
                or other circumstances.
              </Text>

              <Text style={styles.sectionTitle}>
                14. Notifications
              </Text>
              <Text style={styles.termsParagraph}>
                Customers may receive notifications regarding service
                requests, schedules, messages, account information,
                and other system activities.
              </Text>

              <Text style={styles.sectionTitle}>
                15. Messaging
              </Text>
              <Text style={styles.termsParagraph}>
                Customers must use the messaging feature responsibly
                and must not send abusive, threatening, fraudulent,
                or inappropriate content.
              </Text>

              <Text style={styles.sectionTitle}>
                16. Prohibited Activities
              </Text>
              <Text style={styles.termsParagraph}>
                Customers must not use MPRSS for fraudulent activities,
                unauthorized access, abuse of system functions,
                distribution of malicious content, or activities that
                may compromise the security of the system.
              </Text>

              <Text style={styles.sectionTitle}>
                17. Account Suspension
              </Text>
              <Text style={styles.termsParagraph}>
                MPRSS administrators may suspend or restrict accounts
                that violate these Terms and Conditions or are
                involved in activities that may compromise system
                security or operations.
              </Text>

              <Text style={styles.sectionTitle}>
                18. System Availability
              </Text>
              <Text style={styles.termsParagraph}>
                MPRSS may occasionally become unavailable due to
                maintenance, technical problems, network issues, or
                other circumstances beyond the control of the system
                administrators.
              </Text>

              <Text style={styles.sectionTitle}>
                19. Third-Party Services
              </Text>
              <Text style={styles.termsParagraph}>
                MPRSS may use third-party services and technologies
                to provide authentication, database, notification,
                mapping, or other system functionality.
              </Text>

              <Text style={styles.sectionTitle}>
                20. Data Security
              </Text>
              <Text style={styles.termsParagraph}>
                Reasonable measures are implemented to protect
                customer information. However, no electronic system
                can guarantee complete security against all possible
                threats.
              </Text>

              <Text style={styles.sectionTitle}>
                21. Data Retention
              </Text>
              <Text style={styles.termsParagraph}>
                Customer information may be retained for as long as
                necessary to provide system services, maintain records,
                comply with applicable requirements, and support
                legitimate business operations.
              </Text>

              <Text style={styles.sectionTitle}>
                22. Changes to the Terms
              </Text>
              <Text style={styles.termsParagraph}>
                MPRSS administrators may update these Terms and
                Conditions when necessary. Customers may be required
                to review and accept updated terms before continuing
                to use certain system functions.
              </Text>

              <Text style={styles.sectionTitle}>
                23. Termination
              </Text>
              <Text style={styles.termsParagraph}>
                Customers may request termination of their account
                subject to applicable procedures and verification.
              </Text>

              <Text style={styles.sectionTitle}>
                24. Limitation of Responsibility
              </Text>
              <Text style={styles.termsParagraph}>
                MPRSS provides system functionality to assist with
                motorcycle service scheduling, parts information,
                communication, and related activities. The system does
                not replace professional assessment or advice from
                authorized motorcycle service personnel.
              </Text>

              <Text style={styles.sectionTitle}>
                25. Agreement
              </Text>
              <Text style={styles.termsParagraph}>
                By selecting "I Agree", you confirm that you have read,
                understood, and agreed to these Terms and Conditions.
              </Text>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.disagreeButton}
                onPress={() => {
                  setTermsAccepted(false);
                  setShowTerms(false);
                }}
              >
                <Text style={styles.disagreeText}>
                  Disagree
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.agreeButton,
                  !hasReachedBottom &&
                    styles.agreeButtonDisabled,
                ]}
                disabled={!hasReachedBottom}
                onPress={() => {
                  setTermsAccepted(true);
                  setShowTerms(false);
                }}
              >
                <Text style={styles.agreeText}>I Agree</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 24,
    lineHeight: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 7,
    marginTop: 12,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#fff",
  },

  passwordContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingLeft: 14,
    paddingRight: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
  },

  showText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563eb",
  },

  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },

  checkbox: {
    width: 21,
    height: 21,
    borderWidth: 1.5,
    borderColor: "#9ca3af",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  checkboxChecked: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },

  checkmark: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  termsText: {
    flex: 1,
    fontSize: 13,
    color: "#4b5563",
  },

  termsLink: {
    color: "#2563eb",
    fontWeight: "600",
  },

  registerButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },

  registerButtonDisabled: {
    backgroundColor: "#9ca3af",
  },

  registerButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },

  loginText: {
    fontSize: 13,
    color: "#6b7280",
  },

  loginLink: {
    fontSize: 13,
    color: "#2563eb",
    fontWeight: "700",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingTop: 20,
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#111827",
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  termsScroll: {
    paddingHorizontal: 20,
  },

  termsContent: {
    paddingBottom: 20,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginTop: 16,
    marginBottom: 7,
  },

  termsParagraph: {
    fontSize: 13,
    lineHeight: 20,
    color: "#4b5563",
  },

  modalButtons: {
    flexDirection: "row",
    padding: 20,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },

  disagreeButton: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
  },

  disagreeText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },

  agreeButton: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },

  agreeButtonDisabled: {
    backgroundColor: "#9ca3af",
  },

  agreeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});