import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { mockMechanicUser } from "../../data/mechanicData";

export default function MechanicLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    setError("");

    if (
      (email === mockMechanicUser.email ||
        email === "mechanic@mprss.com") &&
      password === "mechanic123"
    ) {
      router.replace("/mechanic/dashboard");
      return;
    }

    setError("Invalid email or password.");
  };

  return (
    <LinearGradient
      colors={["#F5F5F2", "#E7E7E2", "#B8B8B3", "#7A7A76"]}
      locations={[0, 0.35, 0.78, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
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
                source={require("../../../assets/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* Authorized Personnel Badge */}
            <View style={styles.badge}>
              <Text style={styles.badgeIcon}>
                ◉
              </Text>

              <Text style={styles.badgeText}>
                AUTHORIZED PERSONNEL ONLY
              </Text>
            </View>

            {/* Heading */}
            <View style={styles.headingContainer}>
              <Text style={styles.heading}>
                Mechanic Login
              </Text>

              <Text style={styles.description}>
                Sign in to manage your assigned service jobs.
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
                  setError("");
                }}
                style={[
                  styles.input,
                  error && styles.inputError,
                ]}
                placeholder="mechanic@mprss.com"
                placeholderTextColor="#D1D5DB"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <View style={styles.field}>
              <Text style={styles.label}>
                PASSWORD
              </Text>

              <View
                style={[
                  styles.passwordWrapper,
                  error && styles.inputError,
                ]}
              >
                <TextInput
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    setError("");
                  }}
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#D1D5DB"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() =>
                    setShowPassword(
                      (previous) => !previous
                    )
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.eyeText}>
                    {showPassword ? "◉" : "○"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Error */}
            {error !== "" && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>
                  {error}
                </Text>
              </View>
            )}

            {/* Sign In */}
            <TouchableOpacity
              style={styles.signInButton}
              onPress={handleLogin}
              activeOpacity={0.9}
            >
              <Text style={styles.signInText}>
                Sign In
              </Text>
            </TouchableOpacity>

            {/* Back to MPRSS */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace("/login")}
              activeOpacity={0.7}
            >
              <Text style={styles.backArrow}>
                ←
              </Text>

              <Text style={styles.backText}>
                Back to MPRSS
              </Text>
            </TouchableOpacity>

            {/* Footer */}
            <Text style={styles.footerText}>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  keyboard: {
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
    marginBottom: 20,
  },

  logo: {
    width: 120,
    height: 42,
  },

  badge: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginBottom: 18,
  },

  badgeIcon: {
    fontSize: 8,
    color: "#64748B",
    marginRight: 5,
  },

  badgeText: {
    fontSize: 8,
    fontWeight: "600",
    color: "#64748B",
    letterSpacing: 0.7,
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
    marginBottom: 16,
  },

  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
    letterSpacing: 1.1,
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

  passwordWrapper: {
    height: 50,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 16,
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

  signInButton: {
    height: 54,
    borderRadius: 12,
    backgroundColor: "#0A0F1A",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  signInText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },

  backArrow: {
    color: "#9CA3AF",
    fontSize: 10,
    marginRight: 3,
  },

  backText: {
    color: "#9CA3AF",
    fontSize: 9,
  },

  footerText: {
    color: "#9CA3AF",
    fontSize: 9,
    textAlign: "center",
    marginTop: 16,
  },
});