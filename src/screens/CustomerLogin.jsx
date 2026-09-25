import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CustomerLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    setError("");

    if (
      email === "customer@umes.com" &&
      password === "customer123"
    ) {
      router.replace("/dashboard");
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
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wrapper}>
          {/* Main Card */}
          <View style={styles.card}>

            {/* Logo */}
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>
                MPRSS
              </Text>
            </View>

            {/* Heading */}
            <View style={styles.headingContainer}>
              <Text style={styles.heading}>
                Welcome
              </Text>

              <Text style={styles.description}>
                Sign in to manage your motorcycle, services, and maintenance.
              </Text>
            </View>

            {/* Email Address */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Email Address
              </Text>

              <TextInput
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor="#d1d5db"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <View style={styles.fieldContainer}>
              <View style={styles.passwordHeader}>
                <Text style={styles.label}>
                  Password
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    router.push("/forgot-password")
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotPassword}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.passwordWrapper}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#d1d5db"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() =>
                    setShowPassword(!showPassword)
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.eyeText}>
                    {showPassword ? "◉" : "○"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Error Message */}
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

            {/* Register */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>
                Don't have an account?{" "}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  router.push("/register");
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.registerLink}>
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>

            {/* Mechanic Login */}
            <TouchableOpacity
              style={styles.mechanicLoginContainer}
              onPress={() =>
                router.push("/mechanic-login")
              }
              activeOpacity={0.7}
            >
              <Text style={styles.mechanicLoginText}>
                Are you a mechanic?{" "}
              </Text>

              <Text style={styles.mechanicLoginLink}>
                Mechanic Login →
              </Text>
            </TouchableOpacity>

          </View>
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

  wrapper: {
    width: "100%",
    maxWidth: 384,
    alignSelf: "center",
  },

  card: {
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
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },

  logoText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: 0.5,
  },

  headingContainer: {
    marginBottom: 28,
  },

  heading: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: "900",
    color: "#0A0F1A",
    marginBottom: 6,
    textAlign: "center",
  },

  description: {
    fontSize: 14,
    lineHeight: 21,
    color: "#6B7280",
    textAlign: "center",
  },

  fieldContainer: {
    marginBottom: 16,
  },

  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },

  input: {
    height: 48,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },

  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  forgotPassword: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 6,
  },

  passwordWrapper: {
    height: 48,
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
    paddingRight: 8,
    fontSize: 14,
    color: "#111827",
  },

  eyeButton: {
    paddingHorizontal: 14,
    height: "100%",
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },

  errorText: {
    color: "#B91C1C",
    fontSize: 12,
  },

  signInButton: {
    width: "100%",
    height: 54,
    backgroundColor: "#0A0F1A",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  signInText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    flexWrap: "nowrap",
  },

  registerText: {
    fontSize: 13,
    color: "#6B7280",
  },

  registerLink: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0A0F1A",
  },

  mechanicLoginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
    flexWrap: "wrap",
  },

  mechanicLoginText: {
    fontSize: 12,
    color: "#9CA3AF",
  },

  mechanicLoginLink: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },

  demoBox: {
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  demoTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 4,
  },

  demoText: {
    fontSize: 12,
    color: "#9CA3AF",
  },

  adminContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    flexWrap: "wrap",
  },

  adminText: {
    fontSize: 12,
    color: "#9CA3AF",
  },

  adminLink: {
    fontSize: 12,
    color: "#4B5563",
  },
});