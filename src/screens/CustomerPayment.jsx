import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import CustomerLayout from "../components/CustomerLayout";
import {
  getCurrentServiceRequest,
  updateCurrentServiceRequest,
} from "../data/serviceRequestStore";

export default function CustomerPayment() {
  const router = useRouter();

  const [paymentMethod, setPaymentMethod] = useState(null);
  const [showConfirmation, setShowConfirmation] =
    useState(false);
  const [serviceRequest, setServiceRequest] =
    useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const request = getCurrentServiceRequest();

    if (!request) {
      router.replace("/services");
      return;
    }

    setServiceRequest(request);
  }, []);

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
  };

  const handleConfirmPayment = () => {
    if (!paymentMethod || !serviceRequest) {
      return;
    }

    updateCurrentServiceRequest({
      paymentMethod,
      paymentStatus: "pending",
      paymentDate: new Date()
        .toISOString()
        .split("T")[0],
    });

    setShowConfirmation(true);
  };

  const handleCopyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleComplete = () => {
    router.replace("/services");
  };

  if (!serviceRequest) {
    return (
      <CustomerLayout title="Payment">
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            Loading...
          </Text>
        </View>
      </CustomerLayout>
    );
  }

  /* =====================================================
     REQUEST SUBMITTED
  ===================================================== */

  if (showConfirmation) {
    return (
      <CustomerLayout title="Request Submitted">
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.confirmationCard}>
            {/* Status Icon */}
            <View style={styles.statusIconWrapper}>
              <View style={styles.statusIcon}>
                <Text style={styles.statusIconText}>
                  ◷
                </Text>
              </View>
            </View>

            <Text style={styles.confirmationTitle}>
              Service Request Submitted
            </Text>

            <Text style={styles.confirmationDescription}>
              Your service request has been submitted
              successfully. Your selected payment method
              will remain pending while the admin/staff
              reviews your request.
            </Text>

            {/* Status Tracker */}
            <View style={styles.trackerBox}>
              <View style={styles.trackerRow}>
                <View style={styles.trackerStep}>
                  <View
                    style={[
                      styles.trackerCircle,
                      styles.trackerCircleActive,
                    ]}
                  >
                    <Text
                      style={
                        styles.trackerNumberActive
                      }
                    >
                      1
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.trackerLabel,
                      styles.trackerLabelActive,
                    ]}
                  >
                    Submitted
                  </Text>
                </View>

                <View style={styles.trackerLine} />

                <View style={styles.trackerStep}>
                  <View
                    style={styles.trackerCircle}
                  >
                    <Text
                      style={styles.trackerNumber}
                    >
                      2
                    </Text>
                  </View>

                  <Text style={styles.trackerLabel}>
                    Under Review
                  </Text>
                </View>

                <View style={styles.trackerLine} />

                <View style={styles.trackerStep}>
                  <View
                    style={styles.trackerCircle}
                  >
                    <Text
                      style={styles.trackerNumber}
                    >
                      3
                    </Text>
                  </View>

                  <Text style={styles.trackerLabel}>
                    Approved
                  </Text>
                </View>
              </View>
            </View>

            {/* Request Details */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>
                Request Details
              </Text>

              <DetailRow
                label="Service Reference:"
                value={serviceRequest.id}
                mono
              />

              <DetailRow
                label="Service Type:"
                value={serviceRequest.serviceType}
              />

              <DetailRow
                label="Motorcycle:"
                value={serviceRequest.motorcycle}
              />

              <DetailRow
                label="Preferred Date:"
                value={serviceRequest.preferredDate}
              />

              <DetailRow
                label="Preferred Time:"
                value={serviceRequest.preferredTime}
              />
            </View>

            {/* Status Cards */}
            <View style={styles.statusCards}>
              <View style={styles.statusCard}>
                <Text style={styles.statusCardLabel}>
                  Request Status
                </Text>

                <Text style={styles.statusCardValue}>
                  Pending Approval
                </Text>
              </View>

              <View style={styles.statusCard}>
                <Text style={styles.statusCardLabel}>
                  Preferred Payment
                </Text>

                <Text style={styles.statusCardValue}>
                  {paymentMethod === "gcash"
                    ? "GCash"
                    : paymentMethod === "bank"
                    ? "Bank Transfer"
                    : "Cash"}
                </Text>
              </View>
            </View>

            {/* Payment Information */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>
                Payment Information
              </Text>

              <DetailRow
                label="Payment Method:"
                value={
                  paymentMethod === "gcash"
                    ? "GCash"
                    : paymentMethod === "bank"
                    ? "Bank Transfer"
                    : "Cash"
                }
              />
            </View>

            {/* Important Note */}
            <View style={styles.importantBox}>
              <Text style={styles.importantTitle}>
                ⚠️ Important:
              </Text>

              <Text style={styles.importantText}>
                The estimated service cost will be
                provided after approval. No payment is
                required at this stage. Actual payment
                will be completed at the shop before or
                after the service.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleComplete}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryButtonText}>
                View Status in My Services
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </CustomerLayout>
    );
  }

  /* =====================================================
     PAYMENT METHOD PAGE
  ===================================================== */

  return (
    <CustomerLayout title="Payment Method">
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            router.replace("/services")
          }
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>
            ‹
          </Text>

          <Text style={styles.backText}>
            Back to Services
          </Text>
        </TouchableOpacity>

        {/* Service Summary */}
        <View style={styles.card}>
          <View style={styles.referenceRow}>
            <Text style={styles.referenceLabel}>
              REF:
            </Text>

            <Text style={styles.referenceValue}>
              {serviceRequest.id}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>
            Service Request Summary
          </Text>

          <View style={styles.summaryGrid}>
            <SummaryItem
              label="Service Type"
              value={serviceRequest.serviceType}
            />

            <SummaryItem
              label="Motorcycle"
              value={serviceRequest.motorcycle}
            />

            <SummaryItem
              label="Preferred Date"
              value={serviceRequest.preferredDate}
            />

            <SummaryItem
              label="Preferred Time"
              value={serviceRequest.preferredTime}
            />
          </View>
        </View>

        {/* Important Note */}
        <View style={styles.importantBox}>
          <Text style={styles.importantTitle}>
            ⚠️ Important:
          </Text>

          <Text style={styles.importantText}>
            Your service request and selected payment
            method will remain pending until the
            admin/staff reviews and approves your
            request. The estimated service cost will
            be provided after approval. No payment is
            required at this stage.
          </Text>
        </View>

        {/* Payment Method Selection */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Select Payment Method
          </Text>

          <View style={styles.methodList}>
            {/* Cash */}
            <PaymentMethodButton
              method="cash"
              selected={paymentMethod === "cash"}
              title="Cash Payment"
              description="Select cash as your preferred payment method"
              icon="₱"
              onPress={() =>
                handlePaymentMethodSelect("cash")
              }
            />

            {/* GCash */}
            <PaymentMethodButton
              method="gcash"
              selected={paymentMethod === "gcash"}
              title="GCash"
              description="Select GCash as your preferred payment method"
              icon="G"
              onPress={() =>
                handlePaymentMethodSelect("gcash")
              }
            />

            {/* Bank */}
            <PaymentMethodButton
              method="bank"
              selected={paymentMethod === "bank"}
              title="Bank Transfer"
              description="Select bank transfer as your preferred payment method"
              icon="▣"
              onPress={() =>
                handlePaymentMethodSelect("bank")
              }
            />
          </View>
        </View>

        {/* =====================================================
            GCASH DETAILS
        ===================================================== */}

        {paymentMethod === "gcash" && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              GCash Payment Details
            </Text>

            <View style={styles.detailBox}>
              <View style={styles.detailHeader}>
                <Text style={styles.detailLabel}>
                  GCash Number
                </Text>

                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() =>
                    handleCopyToClipboard(
                      "09171234567"
                    )
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.copyIcon}>
                    ⧉
                  </Text>

                  <Text style={styles.copyText}>
                    {copied ? "Copied!" : "Copy"}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.accountNumber}>
                0917 123 4567
              </Text>
            </View>

            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>
                Account Name
              </Text>

              <Text style={styles.accountName}>
                MPRSS Motorcycle Service
              </Text>
            </View>

            <View style={styles.instructionsBox}>
              <Text style={styles.instructionsTitle}>
                Instructions:
              </Text>

              <Instruction number="1">
                Select GCash as your preferred payment
                method.
              </Instruction>

              <Instruction number="2">
                Do not send payment yet.
              </Instruction>

              <Instruction number="3">
                Your service request will be reviewed
                by the admin/staff.
              </Instruction>

              <Instruction number="4">
                The estimated service cost will be
                provided after approval.
              </Instruction>

              <Instruction number="5">
                Actual payment will be completed at
                the shop before or after the service.
              </Instruction>
            </View>
          </View>
        )}

        {/* =====================================================
            BANK DETAILS
        ===================================================== */}

        {paymentMethod === "bank" && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Bank Transfer Details
            </Text>

            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>
                Bank Name
              </Text>

              <Text style={styles.accountName}>
                BDO Unibank
              </Text>
            </View>

            <View style={styles.detailBox}>
              <View style={styles.detailHeader}>
                <Text style={styles.detailLabel}>
                  Account Number
                </Text>

                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() =>
                    handleCopyToClipboard(
                      "001234567890"
                    )
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.copyIcon}>
                    ⧉
                  </Text>

                  <Text style={styles.copyText}>
                    {copied ? "Copied!" : "Copy"}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.accountNumber}>
                0012 3456 7890
              </Text>
            </View>

            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>
                Account Name
              </Text>

              <Text style={styles.accountName}>
                MPRSS Motorcycle Service Center
              </Text>
            </View>

            <View style={styles.instructionsBox}>
              <Text style={styles.instructionsTitle}>
                Instructions:
              </Text>

              <Instruction number="1">
                Select bank transfer as your preferred
                payment method.
              </Instruction>

              <Instruction number="2">
                Do not transfer payment yet.
              </Instruction>

              <Instruction number="3">
                Your service request will be reviewed
                by the admin/staff.
              </Instruction>

              <Instruction number="4">
                The estimated service cost will be
                provided after approval.
              </Instruction>

              <Instruction number="5">
                Actual payment will be completed at
                the shop before or after the service.
              </Instruction>
            </View>
          </View>
        )}

        {/* =====================================================
            CASH DETAILS
        ===================================================== */}

        {paymentMethod === "cash" && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Cash Payment Information
            </Text>

            <View style={styles.instructionsBox}>
              <Text style={styles.cashText}>
                You have selected cash as your preferred
                payment method. No payment is required
                at this stage. Your service request will
                be reviewed by the admin/staff, and the
                estimated cost will be provided after
                approval. Actual payment will be completed
                at the shop before or after the service.
              </Text>
            </View>
          </View>
        )}

        {/* Submit Service Request */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            !paymentMethod &&
              styles.submitButtonDisabled,
          ]}
          disabled={!paymentMethod}
          onPress={handleConfirmPayment}
          activeOpacity={0.9}
        >
          <Text style={styles.submitButtonText}>
            Submit Service Request
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </CustomerLayout>
  );
}

/* =====================================================
   COMPONENTS
===================================================== */

function PaymentMethodButton({
  selected,
  title,
  description,
  icon,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={[
        styles.methodButton,
        selected && styles.methodButtonSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View
        style={[
          styles.methodIcon,
          selected && styles.methodIconSelected,
        ]}
      >
        <Text
          style={[
            styles.methodIconText,
            selected &&
              styles.methodIconTextSelected,
          ]}
        >
          {icon}
        </Text>
      </View>

      <View style={styles.methodContent}>
        <Text style={styles.methodTitle}>
          {title}
        </Text>

        <Text style={styles.methodDescription}>
          {description}
        </Text>
      </View>

      {selected && (
        <Text style={styles.checkIcon}>
          ✓
        </Text>
      )}
    </TouchableOpacity>
  );
}

function SummaryItem({ label, value }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryLabel}>
        {label}
      </Text>

      <Text style={styles.summaryValue}>
        {value}
      </Text>
    </View>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailRowLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.detailRowValue,
          mono && styles.monoValue,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function Instruction({ number, children }) {
  return (
    <View style={styles.instructionRow}>
      <Text style={styles.instructionNumber}>
        {number}.
      </Text>

      <Text style={styles.instructionText}>
        {children}
      </Text>
    </View>
  );
}

/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    fontSize: 14,
    color: "#6b7280",
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 4,
  },

  backIcon: {
    fontSize: 30,
    lineHeight: 30,
    color: "#4b5563",
    marginRight: 6,
  },

  backText: {
    fontSize: 13,
    color: "#4b5563",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    elevation: 1,
  },

  confirmationCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    elevation: 1,
  },

  referenceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  referenceLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: "#6b7280",
    marginRight: 6,
  },

  referenceValue: {
    fontSize: 10,
    fontFamily: "monospace",
    color: "#374151",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 5,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  summaryItem: {
    width: "50%",
    marginBottom: 16,
    paddingRight: 10,
  },

  summaryLabel: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 5,
  },

  summaryValue: {
    fontSize: 12,
    color: "#111827",
    fontWeight: "600",
    lineHeight: 17,
  },

  importantBox: {
    backgroundColor: "#f9fafb",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 9,
    padding: 14,
    marginBottom: 16,
  },

  importantTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 7,
  },

  importantText: {
    fontSize: 11,
    lineHeight: 18,
    color: "#1f2937",
  },

  methodList: {
    gap: 12,
  },

  methodButton: {
    width: "100%",
    minHeight: 80,
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 15,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 9,
    backgroundColor: "#ffffff",
  },

  methodButtonSelected: {
    borderColor: "#000000",
    backgroundColor: "#f9fafb",
  },

  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  methodIconSelected: {
    backgroundColor: "#000000",
  },

  methodIconText: {
    fontSize: 19,
    fontWeight: "700",
    color: "#374151",
  },

  methodIconTextSelected: {
    color: "#ffffff",
  },

  methodContent: {
    flex: 1,
    paddingRight: 6,
  },

  methodTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 5,
  },

  methodDescription: {
    fontSize: 10,
    lineHeight: 16,
    color: "#6b7280",
  },

  checkIcon: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000000",
  },

  detailBox: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },

  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },

  detailLabel: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 5,
  },

  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    padding: 4,
  },

  copyIcon: {
    fontSize: 13,
    color: "#374151",
  },

  copyText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
  },

  accountNumber: {
    fontSize: 23,
    fontWeight: "800",
    color: "#111827",
  },

  accountName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },

  instructionsBox: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 14,
  },

  instructionsTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 9,
  },

  instructionRow: {
    flexDirection: "row",
    marginBottom: 6,
  },

  instructionNumber: {
    width: 20,
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
  },

  instructionText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color: "#4b5563",
  },

  cashText: {
    fontSize: 11,
    lineHeight: 18,
    color: "#374151",
  },

  submitButton: {
    width: "100%",
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  submitButtonDisabled: {
    backgroundColor: "#9ca3af",
  },

  submitButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },

  /* =========================
     CONFIRMATION
  ========================= */

  statusIconWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },

  statusIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#4b5563",
    alignItems: "center",
    justifyContent: "center",
  },

  statusIconText: {
    fontSize: 34,
    color: "#ffffff",
  },

  confirmationTitle: {
    fontSize: 22,
    fontWeight: "500",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },

  confirmationDescription: {
    fontSize: 12,
    lineHeight: 19,
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 20,
  },

  trackerBox: {
    backgroundColor: "#f9fafb",
    borderRadius: 9,
    padding: 14,
    marginBottom: 18,
  },

  trackerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  trackerStep: {
    width: 70,
    alignItems: "center",
  },

  trackerCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },

  trackerCircleActive: {
    backgroundColor: "#000000",
  },

  trackerNumber: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
  },

  trackerNumberActive: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },

  trackerLabel: {
    fontSize: 8,
    color: "#6b7280",
    textAlign: "center",
  },

  trackerLabelActive: {
    fontSize: 8,
    color: "#111827",
    textAlign: "center",
    fontWeight: "600",
  },

  trackerLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#d1d5db",
    marginBottom: 20,
  },

  sectionBox: {
    backgroundColor: "#f9fafb",
    borderRadius: 9,
    padding: 14,
    marginBottom: 16,
  },

  statusCards: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },

  statusCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
  },

  statusCardLabel: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 5,
  },

  statusCardValue: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
    color: "#1f2937",
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 11,
  },

  detailRowLabel: {
    flex: 1,
    paddingRight: 8,
    fontSize: 10,
    color: "#6b7280",
  },

  detailRowValue: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "600",
    color: "#111827",
    textAlign: "right",
  },

  monoValue: {
    fontFamily: "monospace",
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
});