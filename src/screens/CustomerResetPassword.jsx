import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CustomerResetPassword() {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const resetData = globalThis.passwordResetData;

    if (!resetData) {
      router.replace("/forgot-password");
      return;
    }

    if (
      Date.now() - resetData.timestamp >
      resetData.expiresIn
    ) {
      globalThis.passwordResetData = null;
      router.replace("/forgot-password");
      return;
    }

    setEmail(resetData.email || "");
  }, [router]);

  const requirements = [
    {
      label: "At least 6 characters",
      met: newPassword.length >= 6,
    },
    {
      label: "Contains a letter",
      met: /[a-zA-Z]/.test(newPassword),
    },
    {
      label: "Passwords match",
      met:
        newPassword.length > 0 &&
        newPassword === confirmPassword,
    },
  ];

  const validate = () => {
    const next = {};

    if (!newPassword) {
      next.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      next.newPassword = "At least 6 characters";
    }

    if (!confirmPassword) {
      next.confirmPassword =
        "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      next.confirmPassword =
        "Passwords do not match";
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const resetData = globalThis.passwordResetData;

    if (!resetData) {
      setErrors({
        newPassword:
          "Session expired. Please try again.",
      });
      return;
    }

    if (
      Date.now() - resetData.timestamp >
      resetData.expiresIn
    ) {
      globalThis.passwordResetData = null;

      setErrors({
        newPassword:
          "Session expired. Please try again.",
      });

      return;
    }

    globalThis.customerResetPassword = {
      email: resetData.email,
      password: newPassword,
    };

    globalThis.passwordResetData = null;

    setSuccess(true);

    setTimeout(() => {
      router.replace("/login");
    }, 2500);
  };

  if (success) {
    return (
      <LinearGradient
        colors={["#F5F5F2", "#E7E7E2", "#B8B8B3", "#7A7A76"]}
        locations={[0, 0.35, 0.78, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.container}
      >
        <View style={styles.successContainer}>
          <View style={styles.successCard}>

            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require("../../assets/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* Success Icon */}
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>
                ✓
              </Text>
            </View>

            <Text style={styles.successTitle}>
              Password Updated
            </Text>

            <Text style={styles.successDescription}>
              Your password has been successfully reset.
              Redirecting to Sign In...
            </Text>

            <View style={styles.redirectContainer}>
              <View style={styles.redirectDot} />

              <Text style={styles.redirectText}>
                Redirecting...
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#F5F5F2", "#E7E7E2", "#B8B8B3", "#7A7A76"]}
      locations={[0, 0.35, 0.78, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Heading */}
          <View style={styles.headingContainer}>
            <Text
              style={styles.heading}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              Create New Password
            </Text>

            {email !== "" && (
              <Text style={styles.emailText}>
                Resetting for{" "}
                <Text style={styles.emailValue}>
                  {email}
                </Text>
              </Text>
            )}
          </View>

          {/* New Password */}
          <View style={styles.field}>
            <Text style={styles.label}>
              NEW PASSWORD
            </Text>

            <View
              style={[
                styles.passwordWrapper,
                errors.newPassword &&
                  styles.passwordWrapperError,
              ]}
            >
              <TextInput
                value={newPassword}
                onChangeText={(value) => {
                  setNewPassword(value);

                  if (errors.newPassword) {
                    setErrors((previous) => {
                      const next = { ...previous };
                      delete next.newPassword;
                      return next;
                    });
                  }
                }}
                style={styles.passwordInput}
                placeholder="Enter new password"
                placeholderTextColor="#d1d5db"
                secureTextEntry={!showNew}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() =>
                  setShowNew((previous) => !previous)
                }
                activeOpacity={0.7}
              >
                <Text style={styles.eyeText}>
                  {showNew ? "◉" : "○"}
                </Text>
              </TouchableOpacity>
            </View>

            {errors.newPassword && (
              <Text style={styles.errorText}>
                {errors.newPassword}
              </Text>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.field}>
            <Text style={styles.label}>
              CONFIRM NEW PASSWORD
            </Text>

            <View
              style={[
                styles.passwordWrapper,
                errors.confirmPassword &&
                  styles.passwordWrapperError,
              ]}
            >
              <TextInput
                value={confirmPassword}
                onChangeText={(value) => {
                  setConfirmPassword(value);

                  if (errors.confirmPassword) {
                    setErrors((previous) => {
                      const next = { ...previous };
                      delete next.confirmPassword;
                      return next;
                    });
                  }
                }}
                style={styles.passwordInput}
                placeholder="Re-enter new password"
                placeholderTextColor="#d1d5db"
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() =>
                  setShowConfirm(
                    (previous) => !previous
                  )
                }
                activeOpacity={0.7}
              >
                <Text style={styles.eyeText}>
                  {showConfirm ? "◉" : "○"}
                </Text>
              </TouchableOpacity>
            </View>

            {errors.confirmPassword && (
              <Text style={styles.errorText}>
                {errors.confirmPassword}
              </Text>
            )}
          </View>

          {/* Password Requirements */}
          {newPassword.length > 0 && (
            <View style={styles.requirementsBox}>
              {requirements.map(({ label, met }, index) => (
                <View
                  key={label}
                  style={[
                    styles.requirementRow,
                    index === requirements.length - 1 &&
                      styles.requirementRowLast,
                  ]}
                >
                  <View
                    style={[
                      styles.requirementDot,
                      met
                        ? styles.requirementMet
                        : styles.requirementUnmet,
                    ]}
                  >
                    {met && (
                      <View
                        style={styles.requirementInner}
                      />
                    )}
                  </View>

                  <Text
                    style={[
                      styles.requirementText,
                      met &&
                        styles.requirementTextMet,
                    ]}
                  >
                    {label}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Reset Password */}
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleSubmit}
            activeOpacity={0.9}
          >
            <Text style={styles.resetButtonText}>
              Reset Password
            </Text>
          </TouchableOpacity>

          {/* Back to Sign In */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/login")}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrow}>
              ‹
            </Text>

            <Text style={styles.backText}>
              Back to Sign In
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
    paddingVertical: 40,
  },

  card: {
    width: "100%",
    maxWidth: 384,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E5E0",
    paddingHorizontal: 32,
    paddingVertical: 40,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },

  logo: {
    width: 120,
    height: 42,
  },

  headingContainer: {
    marginBottom: 28,
  },

  heading: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "900",
    color: "#0A0F1A",
    marginBottom: 6,
    textAlign: "center",
  },

  emailText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
    textAlign: "center",
  },

  emailValue: {
    color: "#4B5563",
    fontWeight: "500",
  },

  field: {
    marginBottom: 16,
  },

  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
    letterSpacing: 1.2,
    marginBottom: 6,
  },

  passwordWrapper: {
    height: 50,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  passwordWrapperError: {
    borderColor: "#FCA5A5",
  },

  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 16,
    paddingRight: 8,
    fontSize: 14,
    color: "#111827",
  },

  eyeButton: {
    height: "100%",
    paddingHorizontal: 14,
    justifyContent: "center",
  },

  eyeText: {
    color: "#9CA3AF",
    fontSize: 16,
  },

  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
  },

  requirementsBox: {
    backgroundColor: "#F8F8F5",
    borderWidth: 1,
    borderColor: "#E5E5E0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },

  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  requirementRowLast: {
    marginBottom: 0,
  },

  requirementDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  requirementMet: {
    backgroundColor: "#22C55E",
  },

  requirementUnmet: {
    backgroundColor: "#E5E7EB",
  },

  requirementInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },

  requirementText: {
    fontSize: 12,
    color: "#9CA3AF",
  },

  requirementTextMet: {
    color: "#16A34A",
  },

  resetButton: {
    width: "100%",
    height: 54,
    backgroundColor: "#0A0F1A",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },

  backArrow: {
    color: "#6B7280",
    fontSize: 22,
    lineHeight: 18,
    marginRight: 5,
  },

  backText: {
    color: "#6B7280",
    fontSize: 14,
  },

  successContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },

  successCard: {
    width: "100%",
    maxWidth: 384,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E5E0",
    paddingHorizontal: 32,
    paddingVertical: 48,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },

  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F0FDF4",
    borderWidth: 2,
    borderColor: "#BBF7D0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  successIconText: {
    fontSize: 30,
    fontWeight: "700",
    color: "#22C55E",
  },

  successTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: "#0A0F1A",
    marginBottom: 10,
    textAlign: "center",
  },

  successDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: "#6B7280",
    textAlign: "center",
  },

  redirectContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },

  redirectDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4ADE80",
    marginRight: 8,
  },

  redirectText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
});