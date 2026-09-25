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
import { getRegistrationData } from "../data/registrationStore";

export default function CustomerEmailVerification() {
  const router = useRouter();

  const registrationData = getRegistrationData();

  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);

  useEffect(() => {
    if (!registrationData) {
      router.replace("/register");
      return;
    }

    setResendCooldown(60);
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setTimeout(() => {
      setResendCooldown((current) => current - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerify = () => {
    setError("");

    setSuccess(true);
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;

    setResendCooldown(60);
    setError("");
  };

  const handleChangeEmail = () => {
    router.replace("/register");
  };

  const maskedEmail = registrationData?.email
    ? (() => {
        const [local, domain] =
          registrationData.email.split("@");

        if (!local || !domain) {
          return registrationData.email;
        }

        const visible = local.slice(0, 3);
        const stars = "*".repeat(
          Math.max(3, local.length - 3)
        );

        return `${visible}${stars}@${domain}`;
      })()
    : "";

  if (!registrationData) {
    return null;
  }

  if (success) {
    return (
      <LinearGradient
        colors={["#F5F5F2", "#E7E7E2", "#B8B8B3", "#7A7A76"]}
        locations={[0, 0.35, 0.78, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.successContent}
          showsVerticalScrollIndicator={false}
        >
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

            {/* Success Title */}
            <Text style={styles.successTitle}>
              Email Verified!
            </Text>

            <Text style={styles.successDescription}>
              Your MPRSS account is ready. You can now access
              your motorcycle and service management features.
            </Text>

            <View style={styles.redirectContainer}>
              <View style={styles.pulseDot} />

              <Text style={styles.redirectText}>
                Registration complete
              </Text>
            </View>

            {/* Continue */}
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() =>
                router.replace("/dashboard")
              }
              activeOpacity={0.9}
            >
              <Text style={styles.continueButtonText}>
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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

            {/* Email Icon */}
            <View style={styles.mailIconOuter}>
              <View style={styles.mailIconInner}>
                <Text style={styles.mailIcon}>
                  ✉
                </Text>
              </View>
            </View>

            {/* Heading */}
            <View style={styles.headingContainer}>
              <Text
                style={styles.heading}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                Verify Your Email
              </Text>

              <Text style={styles.description}>
                We've sent a verification code to your email
                address. Enter the code below to verify your
                account.
              </Text>

              <Text style={styles.maskedEmail}>
                {maskedEmail}
              </Text>
            </View>

            {/* Verification Code */}
            <View style={styles.field}>
              <Text style={styles.label}>
                6-DIGIT VERIFICATION CODE
              </Text>

              <TextInput
                value={verificationCode}
                onChangeText={(value) => {
                  setVerificationCode(
                    value.replace(/\D/g, "").slice(0, 6)
                  );
                  setError("");
                }}
                style={styles.codeInput}
                placeholder="000000"
                placeholderTextColor="#d1d5db"
                keyboardType="number-pad"
                maxLength={6}
                textAlign="center"
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

            {/* Verify */}
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={handleVerify}
              activeOpacity={0.9}
            >
              <Text style={styles.verifyButtonText}>
                Verify Email
              </Text>
            </TouchableOpacity>

            {/* Resend */}
            <View style={styles.resendContainer}>
              <TouchableOpacity
                onPress={handleResend}
                disabled={resendCooldown > 0}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.resendText,
                    resendCooldown > 0 &&
                      styles.resendDisabled,
                  ]}
                >
                  {resendCooldown > 0
                    ? `Resend Code (${resendCooldown}s)`
                    : "Resend Code"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleChangeEmail}
                activeOpacity={0.7}
              >
                <Text style={styles.changeEmailText}>
                  Change Email
                </Text>
              </TouchableOpacity>
            </View>

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

  successContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
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
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
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
    paddingVertical: 40,
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

  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },

  logo: {
    width: 120,
    height: 42,
  },

  mailIconOuter: {
    alignItems: "center",
    marginBottom: 24,
  },

  mailIconInner: {
    width: 56,
    height: 56,
    backgroundColor: "#F8F8F5",
    borderWidth: 2,
    borderColor: "#E2E2DD",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  mailIcon: {
    fontSize: 25,
    color: "#64748B",
  },

  headingContainer: {
    alignItems: "center",
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

  maskedEmail: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0A0F1A",
    marginTop: 8,
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
    textAlign: "center",
  },

  codeInput: {
    height: 64,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: 8,
    color: "#111827",
    backgroundColor: "#FFFFFF",
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

  verifyButton: {
    width: "100%",
    height: 54,
    backgroundColor: "#0A0F1A",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  resendContainer: {
    alignItems: "center",
    marginTop: 20,
  },

  resendText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0A0F1A",
  },

  resendDisabled: {
    color: "#D1D5DB",
  },

  changeEmailText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 12,
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
    marginBottom: 12,
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
    marginTop: 24,
  },

  pulseDot: {
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

  continueButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#0A0F1A",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },

  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});