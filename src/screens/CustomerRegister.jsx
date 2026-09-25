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
import { setRegistrationData } from "../data/registrationStore";

export default function CustomerRegister() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const next = {};

    if (!formData.fullName.trim()) {
      next.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      next.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      next.email = "Invalid email format";
    }

    if (!formData.mobile.trim()) {
      next.mobile = "Mobile number is required";
    }

    if (!formData.password) {
      next.password = "Password is required";
    } else if (formData.password.length < 6) {
      next.password = "At least 6 characters";
    } else if (!/[a-zA-Z]/.test(formData.password)) {
      next.password = "Contains a letter";
    }

    if (!formData.confirmPassword) {
      next.confirmPassword = "Please confirm your password";
    } else if (
      formData.password !== formData.confirmPassword
    ) {
      next.confirmPassword = "Passwords do not match";
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    setRegistrationData(formData);

    router.push("/verify");
  };

  const hasMinimumLength = formData.password.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(formData.password);

  return (
    <LinearGradient
      colors={["#F5F5F2", "#E7E7E2", "#B8B8B3", "#7A7A76"]}
      locations={[0, 0.35, 0.78, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.wrapper}>
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
                  Create your account
                </Text>

                <Text style={styles.description}>
                  Create your MPRSS account to manage your motorcycle and
                  services.
                </Text>
              </View>

              {/* Full Name */}
              <View style={styles.field}>
                <Text style={styles.label}>FULL NAME</Text>

                <TextInput
                  value={formData.fullName}
                  onChangeText={(value) =>
                    handleChange("fullName", value)
                  }
                  style={[
                    styles.input,
                    errors.fullName && styles.inputError,
                  ]}
                  placeholder="Juan dela Cruz"
                  placeholderTextColor="#d1d5db"
                  autoCapitalize="words"
                />

                {errors.fullName && (
                  <Text style={styles.error}>
                    {errors.fullName}
                  </Text>
                )}
              </View>

              {/* Email */}
              <View style={styles.field}>
                <Text style={styles.label}>EMAIL ADDRESS</Text>

                <TextInput
                  value={formData.email}
                  onChangeText={(value) =>
                    handleChange("email", value)
                  }
                  style={[
                    styles.input,
                    errors.email && styles.inputError,
                  ]}
                  placeholder="your@email.com"
                  placeholderTextColor="#d1d5db"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                {errors.email && (
                  <Text style={styles.error}>
                    {errors.email}
                  </Text>
                )}
              </View>

              {/* Mobile */}
              <View style={styles.field}>
                <Text style={styles.label}>MOBILE NUMBER</Text>

                <TextInput
                  value={formData.mobile}
                  onChangeText={(value) =>
                    handleChange("mobile", value)
                  }
                  style={[
                    styles.input,
                    errors.mobile && styles.inputError,
                  ]}
                  placeholder="+63 9XX XXX XXXX"
                  placeholderTextColor="#d1d5db"
                  keyboardType="phone-pad"
                />

                {errors.mobile && (
                  <Text style={styles.error}>
                    {errors.mobile}
                  </Text>
                )}
              </View>

              {/* Password */}
              <View style={styles.field}>
                <Text style={styles.label}>PASSWORD</Text>

                <View
                  style={[
                    styles.passwordWrapper,
                    errors.password && styles.inputError,
                  ]}
                >
                  <TextInput
                    value={formData.password}
                    onChangeText={(value) =>
                      handleChange("password", value)
                    }
                    style={styles.passwordInput}
                    placeholder="Create your password"
                    placeholderTextColor="#d1d5db"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />

                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() =>
                      setShowPassword((prev) => !prev)
                    }
                    activeOpacity={0.7}
                  >
                    <Text style={styles.eyeText}>
                      {showPassword ? "◉" : "○"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Password Requirements */}
                {formData.password.length > 0 && (
                  <View style={styles.requirementsBox}>
                    <View style={styles.requirementRow}>
                      <View
                        style={[
                          styles.requirementDot,
                          hasMinimumLength
                            ? styles.requirementMet
                            : styles.requirementUnmet,
                        ]}
                      >
                        {hasMinimumLength && (
                          <View style={styles.requirementInner} />
                        )}
                      </View>

                      <Text
                        style={[
                          styles.requirementText,
                          hasMinimumLength &&
                            styles.requirementTextMet,
                        ]}
                      >
                        At least 6 characters
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.requirementRow,
                        styles.requirementRowLast,
                      ]}
                    >
                      <View
                        style={[
                          styles.requirementDot,
                          hasLetter
                            ? styles.requirementMet
                            : styles.requirementUnmet,
                        ]}
                      >
                        {hasLetter && (
                          <View style={styles.requirementInner} />
                        )}
                      </View>

                      <Text
                        style={[
                          styles.requirementText,
                          hasLetter &&
                            styles.requirementTextMet,
                        ]}
                      >
                        Contains a letter
                      </Text>
                    </View>
                  </View>
                )}

                {errors.password && (
                  <Text style={styles.error}>
                    {errors.password}
                  </Text>
                )}
              </View>

              {/* Confirm Password */}
              <View style={styles.field}>
                <Text style={styles.label}>CONFIRM PASSWORD</Text>

                <View
                  style={[
                    styles.passwordWrapper,
                    errors.confirmPassword && styles.inputError,
                  ]}
                >
                  <TextInput
                    value={formData.confirmPassword}
                    onChangeText={(value) =>
                      handleChange("confirmPassword", value)
                    }
                    style={styles.passwordInput}
                    placeholder="Re-enter your password"
                    placeholderTextColor="#d1d5db"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />

                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                    activeOpacity={0.7}
                  >
                    <Text style={styles.eyeText}>
                      {showConfirmPassword ? "◉" : "○"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {errors.confirmPassword && (
                  <Text style={styles.error}>
                    {errors.confirmPassword}
                  </Text>
                )}
              </View>

              {/* Create Account */}
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleSubmit}
                activeOpacity={0.9}
              >
                <Text style={styles.createButtonText}>
                  Create Account
                </Text>
              </TouchableOpacity>

              {/* Sign In */}
              <View style={styles.signInContainer}>
                <Text style={styles.signInText}>
                  Already have an account?{" "}
                </Text>

                <TouchableOpacity
                  onPress={() => router.replace("/login")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.signInLink}>
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>

            </View>
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

  keyboardContainer: {
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
    shadowOpacity: 0.10,
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

  inputError: {
    borderColor: "#FCA5A5",
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
    height: "100%",
    paddingHorizontal: 14,
    justifyContent: "center",
  },

  eyeText: {
    color: "#9CA3AF",
    fontSize: 16,
  },

  requirementsBox: {
    backgroundColor: "#F8F8F5",
    borderWidth: 1,
    borderColor: "#E5E5E0",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    marginBottom: 12,
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

  error: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
  },

  createButton: {
    width: "100%",
    height: 54,
    backgroundColor: "#0A0F1A",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  createButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    flexWrap: "wrap",
  },

  signInText: {
    fontSize: 14,
    color: "#6B7280",
  },

  signInLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0A0F1A",
  },
});