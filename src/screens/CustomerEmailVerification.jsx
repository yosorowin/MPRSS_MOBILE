import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  reload,
  sendEmailVerification,
  signOut,
} from "firebase/auth";

import {
  doc,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase";

import {
  clearRegistrationData,
  getRegistrationData,
} from "../data/registrationStore";

export default function CustomerEmailVerification() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);

  const [resendCooldown, setResendCooldown] =
    useState(60);

  useEffect(() => {
    const registrationData =
      getRegistrationData();

    const currentUser = auth.currentUser;

    /*
     * We don't rely only on registrationStore because
     * the store is temporary memory.
     *
     * Firebase Authentication is the actual source
     * of the authenticated account.
     */
    if (!currentUser) {
      router.replace("/register");
      return;
    }

    setEmail(
      registrationData?.email ||
        currentUser.email ||
        ""
    );

    /*
     * If the user already verified the email,
     * don't make them verify again.
     */
    const checkExistingVerification =
      async () => {
        try {
          await reload(currentUser);

          if (auth.currentUser?.emailVerified) {
            setSuccess(true);
          }
        } catch (error) {
          console.log(
            "INITIAL VERIFICATION CHECK ERROR:",
            error
          );
        }
      };

    checkExistingVerification();
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setTimeout(() => {
      setResendCooldown(
        (current) => current - 1
      );
    }, 1000);

    return () =>
      clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerify = async () => {
    if (checking) return;

    setChecking(true);
    setError("");
    setSuccess(false);

    try {
      const user = auth.currentUser;

      if (!user) {
        setError(
          "Your registration session has expired. Please register again."
        );
        return;
      }

      /*
       * Reload the Firebase user so emailVerified
       * contains the latest value from Firebase.
       */
      await reload(user);

      if (!auth.currentUser?.emailVerified) {
        setError(
          "Your email has not been verified yet. Please open the verification email and click the verification link."
        );
        return;
      }

      /*
       * Update the customer's Firestore document.
       */
      try {
        await updateDoc(
          doc(
            db,
            "customers",
            user.uid
          ),
          {
            emailVerified: true,
            updatedAt: new Date().toISOString(),
          }
        );
      } catch (firestoreError) {
        /*
         * The Firebase email is already verified.
         * If Firestore update fails, we still allow
         * the user to continue.
         */
        console.log(
          "FIRESTORE VERIFICATION UPDATE ERROR:",
          firestoreError
        );
      }

      clearRegistrationData();

      setSuccess(true);
    } catch (error) {
      console.log(
        "VERIFICATION CHECK ERROR:",
        error
      );

      setError(
        "Unable to check your email verification status. Please try again."
      );
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    if (
      resendCooldown > 0 ||
      resending
    ) {
      return;
    }

    setResending(true);
    setError("");
    setSuccess(false);

    try {
      const user = auth.currentUser;

      if (!user) {
        setError(
          "Your registration session has expired. Please register again."
        );
        return;
      }

      await reload(user);

      /*
       * Don't send another verification email
       * if the account is already verified.
       */
      if (auth.currentUser?.emailVerified) {
        setSuccess(true);
        return;
      }

      await sendEmailVerification(
        auth.currentUser
      );

      setResendCooldown(60);

      setError(
        ""
      );

      /*
       * Show a temporary success state for the
       * resend operation, but don't show the
       * "Email Verified" success screen.
       */
      setResendSuccess(true);
    } catch (error) {
      console.log(
        "RESEND VERIFICATION ERROR:",
        error
      );

      if (
        error?.code ===
        "auth/too-many-requests"
      ) {
        setError(
          "Too many verification emails were requested. Please wait before trying again."
        );
      } else {
        setError(
          "Unable to resend the verification email. Please try again."
        );
      }
    } finally {
      setResending(false);
    }
  };

  const handleChangeEmail = async () => {
    try {
      /*
       * Sign out first so the previous account doesn't
       * remain authenticated while registering another email.
       */
      await signOut(auth);
    } catch (error) {
      console.log(
        "SIGN OUT ERROR:",
        error
      );
    }

    clearRegistrationData();

    router.replace("/register");
  };

  const handleContinue = () => {
    clearRegistrationData();

    router.replace("/dashboard");
  };

  const [resendSuccess, setResendSuccess] =
    useState(false);

  const maskedEmail = email
    ? (() => {
        const [
          local,
          domain,
        ] = email.split("@");

        if (!local || !domain) {
          return email;
        }

        const visible = local.slice(
          0,
          Math.min(3, local.length)
        );

        const stars = "*".repeat(
          Math.max(
            3,
            local.length - visible.length
          )
        );

        return `${visible}${stars}@${domain}`;
      })()
    : "";

  /*
   * SUCCESS SCREEN
   */
  if (success) {
    return (
      <LinearGradient
        colors={[
          "#F5F5F2",
          "#E7E7E2",
          "#B8B8B3",
          "#7A7A76",
        ]}
        locations={[
          0,
          0.35,
          0.78,
          1,
        ]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={
            styles.successContent
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          <View
            style={
              styles.successCard
            }
          >
            {/* Logo */}
            <View
              style={
                styles.logoContainer
              }
            >
              <Image
                source={require("../../assets/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* Success Icon */}
            <View
              style={
                styles.successIcon
              }
            >
              <Text
                style={
                  styles.successIconText
                }
              >
                ✓
              </Text>
            </View>

            {/* Success Title */}
            <Text
              style={
                styles.successTitle
              }
            >
              Email Verified!
            </Text>

            <Text
              style={
                styles.successDescription
              }
            >
              Your MPRSS account is ready.
              You can now access your
              motorcycle and service
              management features.
            </Text>

            <View
              style={
                styles.redirectContainer
              }
            >
              <View
                style={
                  styles.pulseDot
                }
              />

              <Text
                style={
                  styles.redirectText
                }
              >
                Registration complete
              </Text>
            </View>

            {/* Continue */}
            <TouchableOpacity
              style={
                styles.continueButton
              }
              onPress={
                handleContinue
              }
              activeOpacity={0.9}
            >
              <Text
                style={
                  styles.continueButtonText
                }
              >
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  /*
   * VERIFICATION SCREEN
   */
  return (
    <LinearGradient
      colors={[
        "#F5F5F2",
        "#E7E7E2",
        "#B8B8B3",
        "#7A7A76",
      ]}
      locations={[
        0,
        0.35,
        0.78,
        1,
      ]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <View style={styles.wrapper}>
          <View style={styles.card}>
            {/* Logo */}
            <View
              style={
                styles.logoContainer
              }
            >
              <Image
                source={require("../../assets/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* Email Icon */}
            <View
              style={
                styles.mailIconOuter
              }
            >
              <View
                style={
                  styles.mailIconInner
                }
              >
                <Text
                  style={
                    styles.mailIcon
                  }
                >
                  ✉
                </Text>
              </View>
            </View>

            {/* Heading */}
            <View
              style={
                styles.headingContainer
              }
            >
              <Text
                style={styles.heading}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                Verify Your Email
              </Text>

              <Text
                style={
                  styles.description
                }
              >
                We've sent a verification
                link to your email address.
                Please open the email and
                click the verification link
                to verify your account.
              </Text>

              <Text
                style={
                  styles.maskedEmail
                }
              >
                {maskedEmail}
              </Text>
            </View>

            {/* Information Box */}
            <View
              style={
                styles.infoBox
              }
            >
              <Text
                style={
                  styles.infoTitle
                }
              >
                Check your inbox
              </Text>

              <Text
                style={
                  styles.infoText
                }
              >
                Look for an email from Firebase
                and click the verification link
                inside it. If you don't see it,
                check your Spam or Junk folder.
              </Text>
            </View>

            {/* Resend Success */}
            {resendSuccess && (
              <View
                style={
                  styles.successBox
                }
              >
                <Text
                  style={
                    styles.successBoxText
                  }
                >
                  Verification email sent successfully.
                </Text>
              </View>
            )}

            {/* Error */}
            {error !== "" && (
              <View
                style={
                  styles.errorBox
                }
              >
                <Text
                  style={
                    styles.errorText
                  }
                >
                  {error}
                </Text>
              </View>
            )}

            {/* Verify */}
            <TouchableOpacity
              style={[
                styles.verifyButton,
                checking &&
                  styles.buttonDisabled,
              ]}
              onPress={
                handleVerify
              }
              disabled={checking}
              activeOpacity={0.9}
            >
              <Text
                style={
                  styles.verifyButtonText
                }
              >
                {checking
                  ? "Checking..."
                  : "I've Verified My Email"}
              </Text>
            </TouchableOpacity>

            {/* Resend */}
            <View
              style={
                styles.resendContainer
              }
            >
              <TouchableOpacity
                onPress={
                  handleResend
                }
                disabled={
                  resendCooldown > 0 ||
                  resending
                }
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.resendText,
                    (resendCooldown >
                      0 ||
                      resending) &&
                      styles.resendDisabled,
                  ]}
                >
                  {resending
                    ? "Sending..."
                    : resendCooldown > 0
                    ? `Resend Verification Email (${resendCooldown}s)`
                    : "Resend Verification Email"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={
                  handleChangeEmail
                }
                activeOpacity={0.7}
              >
                <Text
                  style={
                    styles.changeEmailText
                  }
                >
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

  infoBox: {
    backgroundColor: "#F8F8F5",
    borderWidth: 1,
    borderColor: "#E5E5E0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 16,
  },

  infoTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0A0F1A",
    marginBottom: 5,
  },

  infoText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#6B7280",
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
    lineHeight: 18,
  },

  successBox: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },

  successBoxText: {
    color: "#15803D",
    fontSize: 12,
    lineHeight: 18,
  },

  verifyButton: {
    width: "100%",
    height: 54,
    backgroundColor: "#0A0F1A",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonDisabled: {
    opacity: 0.6,
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
    textAlign: "center",
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