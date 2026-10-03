import { useLocalSearchParams, useRouter } from "expo-router";
import {
  confirmPasswordReset,
  verifyPasswordResetCode,
} from "firebase/auth";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../firebase";

export default function CustomerResetPassword() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [oobCode, setOobCode] = useState("");
  const [email, setEmail] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const code = Array.isArray(params.oobCode)
      ? params.oobCode[0]
      : params.oobCode;

    if (!code) {
      setError("This password reset link is invalid or incomplete.");
      setLoading(false);
      return;
    }

    setOobCode(code);

    const verifyCode = async () => {
      try {
        const verifiedEmail = await verifyPasswordResetCode(auth, code);

        setEmail(verifiedEmail);
        setLoading(false);
      } catch (error) {
        console.error("Reset code verification error:", error);

        if (
          error.code === "auth/expired-action-code" ||
          error.code === "auth/invalid-action-code"
        ) {
          setError(
            "This password reset link is invalid or has expired. Please request a new one."
          );
        } else {
          setError(
            "We couldn't verify this reset link. Please request a new password reset email."
          );
        }

        setLoading(false);
      }
    };

    verifyCode();
  }, [params.oobCode]);

  const handleResetPassword = async () => {
    setError("");

    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Your password must be at least 6 characters long.");
      return;
    }

    if (!/[A-Za-z]/.test(newPassword)) {
      setError("Your password must contain at least one letter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!oobCode) {
      setError("Invalid password reset request.");
      return;
    }

    try {
      setSaving(true);

      await confirmPasswordReset(auth, oobCode, newPassword);

      setSuccess(true);
    } catch (error) {
      console.error("Password update error:", error);

      if (error.code === "auth/expired-action-code") {
        setError(
          "This reset link has expired. Please request a new password reset email."
        );
      } else if (error.code === "auth/invalid-action-code") {
        setError(
          "This reset link is no longer valid. Please request a new one."
        );
      } else if (error.code === "auth/weak-password") {
        setError("This password is too weak. Please choose a stronger one.");
      } else {
        setError("Unable to change your password. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#111" />

        <Text style={styles.loadingText}>
          Verifying your password reset link...
        </Text>
      </View>
    );
  }

  if (success) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Text style={styles.successIconText}>✓</Text>
        </View>

        <Text style={styles.title}>Password Changed</Text>

        <Text style={styles.description}>
          Your password has been successfully updated.
        </Text>

        <Text style={styles.description}>
          You can now log in to your MPRSS account using your new password.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/login")}
        >
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/login")}
        >
          <Text style={styles.backText}>‹ Back to Login</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Reset Password</Text>

        {email ? (
          <Text style={styles.emailText}>
            Resetting password for{" "}
            <Text style={styles.emailBold}>{email}</Text>
          </Text>
        ) : null}

        <Text style={styles.description}>
          Create a new password for your MPRSS account.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>New Password</Text>

          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              setError("");
            }}
            placeholder="Enter new password"
            placeholderTextColor="#999"
            secureTextEntry
            editable={!saving}
          />

          <Text style={styles.requirement}>
            At least 6 characters and one letter
          </Text>

          <Text style={styles.label}>Confirm New Password</Text>

          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setError("");
            }}
            placeholder="Confirm new password"
            placeholderTextColor="#999"
            secureTextEntry
            editable={!saving}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, saving && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={saving}
          >
            <Text style={styles.buttonText}>
              {saving ? "Changing Password..." : "Change Password"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 55,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 18,
    fontSize: 15,
    color: "#666",
    textAlign: "center",
  },

  successContainer: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  backButton: {
    marginBottom: 40,
  },

  backText: {
    fontSize: 16,
    color: "#222",
    fontWeight: "500",
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111",
    marginBottom: 14,
  },

  description: {
    fontSize: 15,
    lineHeight: 23,
    color: "#666",
    marginBottom: 12,
  },

  emailText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#666",
    marginBottom: 12,
  },

  emailBold: {
    color: "#111",
    fontWeight: "600",
  },

  form: {
    marginTop: 25,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
    marginBottom: 8,
    marginTop: 12,
  },

  input: {
    width: "100%",
    height: 52,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#222",
  },

  requirement: {
    fontSize: 12,
    color: "#888",
    marginTop: 7,
  },

  errorText: {
    color: "#d93025",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
  },

  button: {
    width: "100%",
    height: 52,
    backgroundColor: "#111",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
  },

  successIconText: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "600",
  },
});