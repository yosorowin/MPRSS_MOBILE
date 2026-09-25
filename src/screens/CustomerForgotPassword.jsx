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

export default function CustomerForgotPassword() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email format");
      return;
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const resetData = {
      email,
      code: verificationCode,
      timestamp: Date.now(),
      expiresIn: 15 * 60 * 1000,
    };

    globalThis.passwordResetData = resetData;

    setSent(true);
  };

  useEffect(() => {
    if (!sent) return;

    const timer = setTimeout(() => {
      router.replace("/reset-password");
    }, 2000);

    return () => clearTimeout(timer);
  }, [sent, router]);

  if (sent) {
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
              <Text style={styles.checkmark}>
                ✓
              </Text>
            </View>

            <Text style={styles.successTitle}>
              Reset Link Sent
            </Text>

            <Text style={styles.successText}>
              Redirecting you to reset your password...
            </Text>

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
              Forgot Password
            </Text>

            <Text style={styles.description}>
              Enter your email address to receive a verification
              code for password reset.
            </Text>
          </View>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>
              EMAIL ADDRESS
            </Text>

            <TextInput
              value={email}
              onChangeText={(value) => {
                setEmail(value);

                if (error) {
                  setError("");
                }
              }}
              style={[
                styles.input,
                error && styles.inputError,
              ]}
              placeholder="your@email.com"
              placeholderTextColor="#d1d5db"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Error */}
          {error !== "" && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>
                {error}
              </Text>
            </View>
          )}

          {/* Send Code */}
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSubmit}
            activeOpacity={0.9}
          >
            <Text style={styles.sendButtonText}>
              Send Verification Code
            </Text>
          </TouchableOpacity>

          {/* Back to Login */}
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
    marginBottom: 8,
    textAlign: "center",
  },

  description: {
    fontSize: 14,
    lineHeight: 21,
    color: "#6B7280",
    textAlign: "center",
  },

  field: {
    marginBottom: 12,
  },

  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
    letterSpacing: 1.2,
    marginBottom: 6,
  },

  input: {
    height: 50,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },

  inputError: {
    borderColor: "#FCA5A5",
  },

  errorBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FEE2E2",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },

  errorText: {
    color: "#B91C1C",
    fontSize: 12,
  },

  sendButton: {
    width: "100%",
    height: 54,
    backgroundColor: "#0A0F1A",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  backButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },

  backArrow: {
    color: "#6B7280",
    fontSize: 22,
    lineHeight: 18,
    marginRight: 5,
  },

  backText: {
    fontSize: 14,
    color: "#6B7280",
  },

  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },

  successCard: {
    width: "100%",
    maxWidth: 384,
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F0FDF4",
    borderWidth: 2,
    borderColor: "#BBF7D0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  checkmark: {
    fontSize: 26,
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

  successText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#6B7280",
    textAlign: "center",
  },
});