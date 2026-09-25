import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import CustomerLayout from "../components/CustomerLayout";
import {
  getMotorcycles,
  subscribeToMotorcycles,
} from "../data/motorcycleStore";
import { setCurrentServiceRequest } from "../data/serviceRequestStore";

export default function CustomerServices() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("pending");

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showConfirmModal, setShowConfirmModal] =
    useState(false);
    

  const [showMotorcycleDropdown, setShowMotorcycleDropdown] =
    useState(false);

  const [showServiceDropdown, setShowServiceDropdown] =
    useState(false);

  const [showTimeDropdown, setShowTimeDropdown] =
    useState(false);

  const [showDatePicker, setShowDatePicker] =
    useState(false);

  const [showServicePicker, setShowServicePicker] =
    useState(false);

  const [showTimePicker, setShowTimePicker] =
    useState(false);

  const [motorcycles, setMotorcycles] = useState([]);

  const [requestData, setRequestData] = useState({
    motorcycle: "",
    serviceType: "",
    date: "",
    time: "",
    description: "",
  });

  useEffect(() => {
    const updateMotorcycles = () => {
      setMotorcycles(getMotorcycles());
    };

    updateMotorcycles();

    const unsubscribe =
      subscribeToMotorcycles(updateMotorcycles);

    return unsubscribe;
  }, []);

  const serviceTypes = [
    "Complete PMS",
    "Change Oil & Gear Oil",
    "Throttle Body Cleaning",
    "CVT Cleaning",
    "Lense Installation",
    "Front Shock Repack",
    "Ball Race Replacement",
    "Electrical Troubleshooting (MDL & Loud Horn Installation)",
    "Brake System Flushing",
    "Custom Build Installation",
  ];

  const availableTimes = [
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
  ];

  const pendingRequests = [
    {
      id: "req-1",
      motorcycle: "Honda CBR600RR",
      serviceType: "Engine Tune-up",
      preferredDate: "2026-03-25",
      preferredTime: "10:00 AM",
      issueDescription:
        "Engine making unusual noise at high RPM",
      status: "Pending Approval",
      paymentMethod: "GCash",
      paymentStatus: "Awaiting Confirmation",
      estimatedCost: 300,
    },
  ];

  const activeServices = [
    {
      id: "srv-2",
      motorcycle: "Honda CBR600RR",
      serviceType: "Chain Adjustment",
      requestDate: "2026-03-19",
      assignedStaff: "Maria Santos",
      estimatedCost: 80,
      estimatedTime: "1 hour",
      status: "Waiting for Parts",
      notes: "Need to order new chain",
      paymentMethod: "Cash",
      paymentStatus: "Pending",
    },
  ];

  const completedServices = [
    {
      id: "srv-comp-1",
      motorcycle: "Honda CBR600RR",
      serviceType: "Tire Replacement",
      completedDate: "2026-03-15",
      cost: 450,
      partsUsed: [
        "Front Tire",
        "Rear Tire",
      ],
      rating: 5,
      feedback: "Excellent service!",
    },
  ];

  const tabs = [
    {
      id: "pending",
      label: "Pending",
      count: pendingRequests.length,
    },
    {
      id: "active",
      label: "Active",
      count: activeServices.length,
    },
    {
      id: "completed",
      label: "Completed",
      count: completedServices.length,
    },
  ];

  const motorcycleOptions =
    motorcycles.length > 0
      ? motorcycles.map((motorcycle) => ({
          id: motorcycle.id,
          label: `${motorcycle.brand} ${motorcycle.model}`,
        }))
      : [
          {
            id: "prototype-m1",
            label: "Honda CBR600RR",
          },
        ];

  const openRequestForm = () => {
    setRequestData({
      motorcycle: "",
      serviceType: "",
      date: "",
      time: "",
      description: "",
    });

    setShowMotorcycleDropdown(false);
    setShowServiceDropdown(false);
    setShowTimeDropdown(false);
    setShowDatePicker(false);
    setShowServicePicker(false);
    setShowTimePicker(false);

    setShowRequestForm(true);
  };

  const closeRequestForm = () => {
    setShowRequestForm(false);

    setShowMotorcycleDropdown(false);
    setShowServiceDropdown(false);
    setShowTimeDropdown(false);
    setShowDatePicker(false);
    setShowServicePicker(false);
    setShowTimePicker(false);
  };

  const formatDate = (date) => {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (
    event,
    selectedDate
  ) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setRequestData((previous) => ({
        ...previous,
        date: formatDate(selectedDate),
      }));
    }
  };

  const handleContinueRequest = () => {
    if (
      !requestData.motorcycle ||
      !requestData.serviceType ||
      !requestData.date ||
      !requestData.time ||
      !requestData.description.trim()
    ) {
      return;
    }

    setShowMotorcycleDropdown(false);
    setShowServiceDropdown(false);
    setShowTimeDropdown(false);
    setShowServicePicker(false);
    setShowTimePicker(false);

    setShowRequestForm(false);
    setShowConfirmModal(true);
  };

  const handleConfirmRequest = () => {
    const serviceRequest = {
      id: `REQ-${Date.now()}`,
      motorcycle: requestData.motorcycle,
      serviceType: requestData.serviceType,
      preferredDate: requestData.date,
      preferredTime: requestData.time,
      issueDescription: requestData.description,
      requestDate: new Date().toISOString().split("T")[0],
      status: "Pending Approval",
      paymentMethod: null,
      paymentStatus: "Pending",
      estimatedCost: 300,
    };

    console.log(
      "SERVICE REQUEST:",
      serviceRequest
    );

    setCurrentServiceRequest(serviceRequest);
    setShowConfirmModal(false);

    setRequestData({
      motorcycle: "",
      serviceType: "",
      date: "",
      time: "",
      description: "",
    });

    router.push("/payment");
  };

  return (
    <CustomerLayout title="My Services">
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ================================= */}
        {/* TOP ACTIONS */}
        {/* ================================= */}

        <View style={styles.topSection}>
          <View style={styles.tabs}>
            {tabs.map((tab) => {
              const selected =
                activeTab === tab.id;

              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.tab,
                    selected &&
                      styles.tabActive,
                  ]}
                  onPress={() =>
                    setActiveTab(tab.id)
                  }
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.tabText,
                      selected &&
                        styles.tabTextActive,
                    ]}
                  >
                    {tab.label} ({tab.count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.requestButton}
            onPress={openRequestForm}
            activeOpacity={0.9}
          >
            <Text
              style={
                styles.requestButtonText
              }
            >
              + Request Service
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================================= */}
        {/* PENDING */}
        {/* ================================= */}

        {activeTab === "pending" && (
          <>
            {pendingRequests.length === 0 ? (
              <EmptyState text="No pending requests" />
            ) : (
              pendingRequests.map(
                (request) => (
                  <View
                    key={request.id}
                    style={styles.card}
                  >
                    <View
                      style={
                        styles.cardHeader
                      }
                    >
                      <View
                        style={
                          styles.cardHeaderInfo
                        }
                      >
                        <Text
                          style={styles.ref}
                        >
                          REF: {request.id}
                        </Text>

                        <Text
                          style={
                            styles.title
                          }
                        >
                          {
                            request.serviceType
                          }
                        </Text>

                        <Text
                          style={
                            styles.subtitle
                          }
                        >
                          {request.motorcycle}
                        </Text>
                      </View>

                      <StatusBadge
                        text={request.status}
                      />
                    </View>

                    <View
                      style={styles.tracker}
                    >
                      <TrackerStep
                        number="1"
                        label="Approved"
                        active={false}
                      />

                      <TrackerLine
                        active={false}
                      />

                      <TrackerStep
                        number="2"
                        label="Payment"
                        active={false}
                      />

                      <TrackerLine
                        active={false}
                      />

                      <TrackerStep
                        number="3"
                        label="Confirmed"
                        active={false}
                      />
                    </View>

                    <InfoGrid
                      items={[
                        [
                          "Preferred Date",
                          request.preferredDate,
                        ],
                        [
                          "Preferred Time",
                          request.preferredTime,
                        ],
                        [
                          "Request Date",
                          "2026-03-22",
                        ],
                        [
                          "Estimated Cost",
                          `₱${request.estimatedCost.toLocaleString()}`,
                        ],
                      ]}
                    />

                    <View
                      style={styles.infoBox}
                    >
                      <Text
                        style={
                          styles.infoLabel
                        }
                      >
                        Issue Description
                      </Text>

                      <Text
                        style={
                          styles.infoText
                        }
                      >
                        {
                          request.issueDescription
                        }
                      </Text>
                    </View>

                    <View
                      style={
                        styles.paymentBox
                      }
                    >
                      <Text
                        style={
                          styles.infoLabel
                        }
                      >
                        Payment
                      </Text>

                      <View
                        style={
                          styles.paymentRow
                        }
                      >
                        <Text
                          style={
                            styles.paymentLabel
                          }
                        >
                          Method
                        </Text>

                        <Text
                          style={
                            styles.paymentValue
                          }
                        >
                          {
                            request.paymentMethod
                          }
                        </Text>
                      </View>

                      <View
                        style={
                          styles.paymentRow
                        }
                      >
                        <Text
                          style={
                            styles.paymentLabel
                          }
                        >
                          Status
                        </Text>

                        <Text
                          style={
                            styles.paymentValue
                          }
                        >
                          {
                            request.paymentStatus
                          }
                        </Text>
                      </View>
                    </View>

                    <View
                      style={
                        styles.noticeBox
                      }
                    >
                      <Text
                        style={
                          styles.noticeText
                        }
                      >
                        Waiting for admin approval.
                        You will be notified once
                        your request has been reviewed.
                      </Text>
                    </View>
                  </View>
                )
              )
            )}
          </>
        )}

        {/* ================================= */}
        {/* ACTIVE */}
        {/* ================================= */}

        {activeTab === "active" && (
          <>
            {activeServices.length === 0 ? (
              <EmptyState text="No active services" />
            ) : (
              activeServices.map(
                (service) => (
                  <View
                    key={service.id}
                    style={styles.card}
                  >
                    <View
                      style={
                        styles.cardHeader
                      }
                    >
                      <View
                        style={
                          styles.cardHeaderInfo
                        }
                      >
                        <Text
                          style={styles.ref}
                        >
                          REF: {service.id}
                        </Text>

                        <Text
                          style={
                            styles.title
                          }
                        >
                          {
                            service.serviceType
                          }
                        </Text>

                        <Text
                          style={
                            styles.subtitle
                          }
                        >
                          {
                            service.motorcycle
                          }
                        </Text>
                      </View>

                      <StatusBadge
                        text={service.status}
                      />
                    </View>

                    <InfoGrid
                      items={[
                        [
                          "Request Date",
                          service.requestDate,
                        ],
                        [
                          "Assigned Staff",
                          service.assignedStaff,
                        ],
                        [
                          "Estimated Cost",
                          `₱${service.estimatedCost.toLocaleString()}`,
                        ],
                        [
                          "Estimated Time",
                          service.estimatedTime,
                        ],
                      ]}
                    />

                    <View
                      style={styles.infoBox}
                    >
                      <Text
                        style={
                          styles.infoLabel
                        }
                      >
                        Service Notes
                      </Text>

                      <Text
                        style={
                          styles.infoText
                        }
                      >
                        {service.notes}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.paymentBox
                      }
                    >
                      <Text
                        style={
                          styles.infoLabel
                        }
                      >
                        Payment
                      </Text>

                      <View
                        style={
                          styles.paymentRow
                        }
                      >
                        <Text
                          style={
                            styles.paymentLabel
                          }
                        >
                          Method
                        </Text>

                        <Text
                          style={
                            styles.paymentValue
                          }
                        >
                          {
                            service.paymentMethod
                          }
                        </Text>
                      </View>

                      <View
                        style={
                          styles.paymentRow
                        }
                      >
                        <Text
                          style={
                            styles.paymentLabel
                          }
                        >
                          Status
                        </Text>

                        <Text
                          style={
                            styles.paymentValue
                          }
                        >
                          {
                            service.paymentStatus
                          }
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={
                        styles.chatButton
                      }
                      onPress={() =>
                        router.push(
                          "/messages"
                        )
                      }
                    >
                      <Text
                        style={
                          styles.chatButtonText
                        }
                      >
                        Chat with Admin
                      </Text>
                    </TouchableOpacity>
                  </View>
                )
              )
            )}
          </>
        )}

        {/* ================================= */}
        {/* COMPLETED */}
        {/* ================================= */}

        {activeTab === "completed" && (
          <>
            {completedServices.length ===
            0 ? (
              <EmptyState text="No completed services" />
            ) : (
              completedServices.map(
                (service) => (
                  <View
                    key={service.id}
                    style={styles.card}
                  >
                    <View
                      style={
                        styles.cardHeader
                      }
                    >
                      <View
                        style={
                          styles.cardHeaderInfo
                        }
                      >
                        <Text
                          style={styles.ref}
                        >
                          REF: {service.id}
                        </Text>

                        <Text
                          style={
                            styles.title
                          }
                        >
                          {
                            service.serviceType
                          }
                        </Text>

                        <Text
                          style={
                            styles.subtitle
                          }
                        >
                          {
                            service.motorcycle
                          }
                        </Text>
                      </View>

                      <StatusBadge text="Completed" />
                    </View>

                    <InfoGrid
                      items={[
                        [
                          "Completed Date",
                          service.completedDate,
                        ],
                        [
                          "Total Cost",
                          `₱${service.cost.toLocaleString()}`,
                        ],
                        [
                          "Parts Used",
                          service.partsUsed.join(
                            ", "
                          ),
                        ],
                        [
                          "Rating",
                          `${service.rating}/5`,
                        ],
                      ]}
                    />

                    <View
                      style={
                        styles.feedbackBox
                      }
                    >
                      <Text
                        style={
                          styles.infoLabel
                        }
                      >
                        Your Feedback
                      </Text>

                      <Text
                        style={styles.stars}
                      >
                        {"★".repeat(
                          service.rating
                        )}
                        {"☆".repeat(
                          5 - service.rating
                        )}
                      </Text>

                      <Text
                        style={
                          styles.feedback
                        }
                      >
                        "{service.feedback}"
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={
                        styles.outlineButton
                      }
                      onPress={() => {}}
                    >
                      <Text
                        style={
                          styles.outlineButtonText
                        }
                      >
                        Edit Feedback
                      </Text>
                    </TouchableOpacity>
                  </View>
                )
              )
            )}
          </>
        )}
      </ScrollView>

      {/* ================================= */}
      {/* REQUEST SERVICE */}
      {/* ================================= */}

      <Modal
        visible={showRequestForm}
        transparent
        animationType="slide"
        onRequestClose={
          closeRequestForm
        }
      >
        <View
          style={
            styles.requestOverlay
          }
        >
          <View
            style={styles.requestModal}
          >
            <ScrollView
              style={styles.requestScroll}
              contentContainerStyle={
                styles.requestContent
              }
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
            >
              <View
                style={styles.modalHeader}
              >
                <View>
                  <Text
                    style={
                      styles.modalTitle
                    }
                  >
                    Request Service
                  </Text>

                  <Text
                    style={
                      styles.modalSubtitle
                    }
                  >
                    Schedule a motorcycle
                    service
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={
                    closeRequestForm
                  }
                >
                  <Text
                    style={
                      styles.closeButton
                    }
                  >
                    ×
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ------------------------- */}
              {/* MOTORCYCLE */}
              {/* ------------------------- */}

              <Text
                style={styles.formLabel}
              >
                MOTORCYCLE *
              </Text>

              <View
                style={[
                  styles.dropdownWrapper,
                  showMotorcycleDropdown &&
                    styles.dropdownWrapperOpen,
                ]}
              >
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => {
                    setShowMotorcycleDropdown(
                      (previous) =>
                        !previous
                    );

                    setShowServiceDropdown(
                      false
                    );

                    setShowTimeDropdown(
                      false
                    );

                    setShowDatePicker(
                      false
                    );
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      !requestData.motorcycle &&
                        styles.placeholderText,
                    ]}
                  >
                    {requestData.motorcycle ||
                      "Select motorcycle"}
                  </Text>

                  <Text
                    style={
                      styles.dropdownArrow
                    }
                  >
                    ▾
                  </Text>
                </TouchableOpacity>

                {showMotorcycleDropdown && (
                  <View
                    style={
                      styles.dropdownMenu
                    }
                  >
                    {motorcycleOptions.map(
                      (motorcycle) => (
                        <TouchableOpacity
                          key={
                            motorcycle.id
                          }
                          style={
                            styles.dropdownItem
                          }
                          onPress={() => {
                            setRequestData(
                              (
                                previous
                              ) => ({
                                ...previous,
                                motorcycle:
                                  motorcycle.label,
                              })
                            );

                            setShowMotorcycleDropdown(
                              false
                            );
                          }}
                        >
                          <Text
                            style={
                              styles.dropdownItemText
                            }
                          >
                            {
                              motorcycle.label
                            }
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                )}
              </View>

              {/* ------------------------- */}
              {/* SERVICE TYPE */}
              {/* ------------------------- */}

              <Text
                style={[
                  styles.formLabel,
                  styles.formLabelSpaced,
                ]}
              >
                SERVICE TYPE *
              </Text>

              <View
                style={[
                  styles.dropdownWrapper,
                  showServiceDropdown &&
                    styles.dropdownWrapperOpen,
                ]}
              >
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => {
                    setShowMotorcycleDropdown(false);
                    setShowServiceDropdown(false);
                    setShowTimeDropdown(false);
                    setShowDatePicker(false);
                    setShowTimePicker(false);
                    setShowServicePicker(true);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      !requestData.serviceType &&
                        styles.placeholderText,
                    ]}
                  >
                    {requestData.serviceType ||
                      "Select service type"}
                  </Text>

                  <Text
                    style={
                      styles.dropdownArrow
                    }
                  >
                    ▾
                  </Text>
                </TouchableOpacity>


              </View>

              {/* ------------------------- */}
              {/* DATE */}
              {/* ------------------------- */}

              <Text
                style={[
                  styles.formLabel,
                  styles.formLabelSpaced,
                ]}
              >
                PREFERRED DATE *
              </Text>

              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => {
                  setShowDatePicker(
                    true
                  );

                  setShowMotorcycleDropdown(
                    false
                  );

                  setShowServiceDropdown(
                    false
                  );

                  setShowTimeDropdown(
                    false
                  );
                }}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !requestData.date &&
                      styles.placeholderText,
                  ]}
                >
                  {requestData.date ||
                    "Select date"}
                </Text>

                <Text
                  style={
                    styles.calendarIcon
                  }
                >
                  ▣
                </Text>
              </TouchableOpacity>

              {/* Android Native Calendar */}
              {showDatePicker &&
                Platform.OS ===
                  "android" && (
                  <DateTimePicker
                    value={
                      requestData.date
                        ? new Date(
                            `${requestData.date}T00:00:00`
                          )
                        : new Date()
                    }
                    mode="date"
                    display="calendar"
                    minimumDate={
                      new Date()
                    }
                    onChange={
                      handleDateChange
                    }
                  />
                )}

              {/* iOS Calendar Modal */}
              {Platform.OS === "ios" && (
                <Modal
                  visible={showDatePicker}
                  transparent
                  animationType="fade"
                  onRequestClose={() =>
                    setShowDatePicker(
                      false
                    )
                  }
                >
                  <View
                    style={
                      styles.calendarOverlay
                    }
                  >
                    <View
                      style={
                        styles.calendarCard
                      }
                    >
                      <Text
                        style={
                          styles.calendarTitle
                        }
                      >
                        Select Preferred Date
                      </Text>

                      <DateTimePicker
                        value={
                          requestData.date
                            ? new Date(
                                `${requestData.date}T00:00:00`
                              )
                            : new Date()
                        }
                        mode="date"
                        display="inline"
                        minimumDate={
                          new Date()
                        }
                        onChange={
                          handleDateChange
                        }
                        style={
                          styles.calendarPicker
                        }
                      />

                      <TouchableOpacity
                        style={
                          styles.calendarDone
                        }
                        onPress={() =>
                          setShowDatePicker(
                            false
                          )
                        }
                      >
                        <Text
                          style={
                            styles.calendarDoneText
                          }
                        >
                          Done
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
              )}

              {/* ------------------------- */}
              {/* TIME */}
              {/* ------------------------- */}

              <Text
                style={[
                  styles.formLabel,
                  styles.formLabelSpaced,
                ]}
              >
                PREFERRED TIME *
              </Text>

              <View
                style={[
                  styles.dropdownWrapper,
                  showTimeDropdown &&
                    styles.dropdownWrapperOpen,
                ]}
              >
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => {
                    setShowMotorcycleDropdown(false);
                    setShowServiceDropdown(false);
                    setShowTimeDropdown(false);
                    setShowDatePicker(false);
                    setShowServicePicker(false);
                    setShowTimePicker(true);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      !requestData.time &&
                        styles.placeholderText,
                    ]}
                  >
                    {requestData.time ||
                      "Select time"}
                  </Text>

                  <Text
                    style={
                      styles.dropdownArrow
                    }
                  >
                    ▾
                  </Text>
                </TouchableOpacity>


              </View>

              {/* ------------------------- */}
              {/* DESCRIPTION */}
              {/* ------------------------- */}

              <Text
                style={[
                  styles.formLabel,
                  styles.formLabelSpaced,
                ]}
              >
                ISSUE DESCRIPTION *
              </Text>

              <TextInput
                value={
                  requestData.description
                }
                onChangeText={(value) =>
                  setRequestData(
                    (previous) => ({
                      ...previous,
                      description:
                        value,
                    })
                  )
                }
                placeholder="Describe the issue or service you need..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                style={
                  styles.descriptionInput
                }
              />

              {/* Buttons */}
              <View
                style={
                  styles.modalButtons
                }
              >
                <TouchableOpacity
                  style={
                    styles.cancelButton
                  }
                  onPress={
                    closeRequestForm
                  }
                >
                  <Text
                    style={
                      styles.cancelButtonText
                    }
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.continueButton,
                    (
                      !requestData.motorcycle ||
                      !requestData.serviceType ||
                      !requestData.date ||
                      !requestData.time ||
                      !requestData.description.trim()
                    ) &&
                      styles.continueDisabled,
                  ]}
                  disabled={
                    !requestData.motorcycle ||
                    !requestData.serviceType ||
                    !requestData.date ||
                    !requestData.time ||
                    !requestData.description.trim()
                  }
                  onPress={
                    handleContinueRequest
                  }
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
          </View>
        </View>
      </Modal>

      {/* ================================= */}
      {/* SERVICE TYPE PICKER */}
      {/* ================================= */}

      <Modal
        visible={showServicePicker}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowServicePicker(false)
        }
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerCard}>
            <View style={styles.pickerHeader}>
              <View style={styles.pickerHeaderText}>
                <Text style={styles.pickerTitle}>
                  Select Service Type
                </Text>
                <Text style={styles.pickerSubtitle}>
                  Choose the service you need
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setShowServicePicker(false)
                }
              >
                <Text style={styles.closeButton}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.pickerScroll}
              contentContainerStyle={styles.pickerScrollContent}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {serviceTypes.map((service) => (
                <TouchableOpacity
                  key={service}
                  style={[
                    styles.pickerItem,
                    requestData.serviceType === service &&
                      styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    setRequestData((previous) => ({
                      ...previous,
                      serviceType: service,
                    }));
                    setShowServicePicker(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      requestData.serviceType === service &&
                        styles.pickerItemTextSelected,
                    ]}
                  >
                    {service}
                  </Text>

                  {requestData.serviceType === service && (
                    <Text style={styles.pickerCheck}>
                      ✓
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.pickerDoneButton}
              onPress={() =>
                setShowServicePicker(false)
              }
              activeOpacity={0.9}
            >
              <Text style={styles.pickerDoneText}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================================= */}
      {/* TIME PICKER */}
      {/* ================================= */}

      <Modal
        visible={showTimePicker}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowTimePicker(false)
        }
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerCard}>
            <View style={styles.pickerHeader}>
              <View style={styles.pickerHeaderText}>
                <Text style={styles.pickerTitle}>
                  Select Preferred Time
                </Text>
                <Text style={styles.pickerSubtitle}>
                  Choose your preferred service time
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setShowTimePicker(false)
                }
              >
                <Text style={styles.closeButton}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.pickerScroll}
              contentContainerStyle={styles.pickerScrollContent}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {availableTimes.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.pickerItem,
                    requestData.time === time &&
                      styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    setRequestData((previous) => ({
                      ...previous,
                      time,
                    }));
                    setShowTimePicker(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      requestData.time === time &&
                        styles.pickerItemTextSelected,
                    ]}
                  >
                    {time}
                  </Text>

                  {requestData.time === time && (
                    <Text style={styles.pickerCheck}>
                      ✓
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.pickerDoneButton}
              onPress={() =>
                setShowTimePicker(false)
              }
              activeOpacity={0.9}
            >
              <Text style={styles.pickerDoneText}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================================= */}
      {/* CONFIRMATION */}
      {/* ================================= */}

      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowConfirmModal(
            false
          )
        }
      >
        <View
          style={
            styles.confirmOverlay
          }
        >
          <View
            style={
              styles.confirmCard
            }
          >
            <Text
              style={
                styles.confirmTitle
              }
            >
              Confirm Service Request
            </Text>

            <Text
              style={
                styles.confirmSubtitle
              }
            >
              Please review your request
              before continuing.
            </Text>

            <ConfirmRow
              label="Motorcycle"
              value={
                requestData.motorcycle
              }
            />

            <ConfirmRow
              label="Service Type"
              value={
                requestData.serviceType
              }
            />

            <ConfirmRow
              label="Preferred Date"
              value={requestData.date}
            />

            <ConfirmRow
              label="Preferred Time"
              value={requestData.time}
            />

            <View
              style={
                styles.confirmDescription
              }
            >
              <Text
                style={
                  styles.confirmLabel
                }
              >
                Issue Description
              </Text>

              <Text
                style={
                  styles.confirmValue
                }
              >
                {
                  requestData.description
                }
              </Text>
            </View>

            <View
              style={
                styles.confirmNotice
              }
            >
              <Text
                style={
                  styles.confirmNoticeText
                }
              >
                After submitting, your request
                will be reviewed by the admin.
                Payment instructions will be
                provided after approval.
              </Text>
            </View>

            <View
              style={
                styles.modalButtons
              }
            >
              <TouchableOpacity
                style={
                  styles.cancelButton
                }
                onPress={() => {
                  setShowConfirmModal(
                    false
                  );
                  setShowRequestForm(
                    true
                  );
                }}
              >
                <Text
                  style={
                    styles.cancelButtonText
                  }
                >
                  Back
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.continueButton
                }
                onPress={
                  handleConfirmRequest
                }
              >
                <Text
                  style={
                    styles.continueButtonText
                  }
                >
                  Submit Request
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </CustomerLayout>
  );
}

/* ================================= */
/* HELPERS */
/* ================================= */

function EmptyState({ text }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>
        {text}
      </Text>
    </View>
  );
}

function StatusBadge({ text }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>
        {text}
      </Text>
    </View>
  );
}

function TrackerStep({
  number,
  label,
  active,
}) {
  return (
    <View
      style={styles.trackerStep}
    >
      <View
        style={[
          styles.trackerCircle,
          active &&
            styles.trackerCircleActive,
        ]}
      >
        <Text
          style={[
            styles.trackerNumber,
            active &&
              styles.trackerNumberActive,
          ]}
        >
          {number}
        </Text>
      </View>

      <Text
        style={styles.trackerLabel}
      >
        {label}
      </Text>
    </View>
  );
}

function TrackerLine({ active }) {
  return (
    <View
      style={[
        styles.trackerLine,
        active &&
          styles.trackerLineActive,
      ]}
    />
  );
}

function InfoGrid({ items }) {
  return (
    <View style={styles.infoGrid}>
      {items.map(
        ([label, value]) => (
          <View
            key={label}
            style={styles.infoItem}
          >
            <Text
              style={
                styles.infoLabel
              }
            >
              {label}
            </Text>

            <Text
              style={
                styles.infoValue
              }
            >
              {value}
            </Text>
          </View>
        )
      )}
    </View>
  );
}

function ConfirmRow({
  label,
  value,
}) {
  return (
    <View
      style={styles.confirmRow}
    >
      <Text
        style={
          styles.confirmLabel
        }
      >
        {label}
      </Text>

      <Text
        style={
          styles.confirmValue
        }
      >
        {value}
      </Text>
    </View>
  );
}

/* ================================= */
/* STYLES */
/* ================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  topSection: {
    marginBottom: 16,
  },

  tabs: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },

  tab: {
    flex: 1,
    minHeight: 42,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  tabActive: {
    backgroundColor: "#1f2937",
    borderColor: "#1f2937",
  },

  tabText: {
    color: "#4b5563",
    fontSize: 10,
    fontWeight: "600",
  },

  tabTextActive: {
    color: "#ffffff",
  },

  requestButton: {
    backgroundColor: "#000000",
    borderRadius: 8,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  requestButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 16,
  },

  cardHeaderInfo: {
    flex: 1,
  },

  ref: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 5,
    fontFamily: "monospace",
  },

  title: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "600",
  },

  subtitle: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 4,
  },

  badge: {
    backgroundColor: "#f3f4f6",
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  badgeText: {
    fontSize: 9,
    color: "#374151",
    fontWeight: "600",
  },

  tracker: {
    backgroundColor: "#f9fafb",
    borderRadius: 9,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  trackerStep: {
    width: 58,
    alignItems: "center",
  },

  trackerCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },

  trackerNumber: {
    fontSize: 10,
    color: "#4b5563",
    fontWeight: "700",
  },

  trackerCircleActive: {
    backgroundColor: "#000000",
  },

  trackerNumberActive: {
    color: "#ffffff",
  },

  trackerLabel: {
    fontSize: 7,
    color: "#6b7280",
    textAlign: "center",
  },

  trackerLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#d1d5db",
    marginBottom: 18,
  },

  trackerLineActive: {
    backgroundColor: "#000000",
  },

  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 5,
  },

  infoItem: {
    width: "50%",
    marginBottom: 12,
    paddingRight: 8,
  },

  infoLabel: {
    fontSize: 9,
    color: "#9ca3af",
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 11,
    color: "#111827",
    fontWeight: "600",
    lineHeight: 16,
  },

  infoBox: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 11,
    marginTop: 4,
    marginBottom: 12,
  },

  infoText: {
    fontSize: 11,
    color: "#4b5563",
    lineHeight: 17,
  },

  paymentBox: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 11,
    marginBottom: 12,
  },

  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },

  paymentLabel: {
    fontSize: 10,
    color: "#6b7280",
  },

  paymentValue: {
    fontSize: 10,
    color: "#111827",
    fontWeight: "600",
  },

  noticeBox: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 11,
  },

  noticeText: {
    fontSize: 11,
    color: "#4b5563",
    lineHeight: 17,
  },

  chatButton: {
    backgroundColor: "#000000",
    borderRadius: 8,
    minHeight: 43,
    alignItems: "center",
    justifyContent: "center",
  },

  chatButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },

  feedbackBox: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 11,
    marginBottom: 12,
  },

  stars: {
    color: "#d97706",
    fontSize: 17,
    marginBottom: 5,
  },

  feedback: {
    color: "#374151",
    fontSize: 11,
    lineHeight: 17,
    fontStyle: "italic",
  },

  outlineButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  outlineButtonText: {
    color: "#374151",
    fontSize: 11,
    fontWeight: "600",
  },

  emptyState: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingVertical: 40,
    alignItems: "center",
  },

  emptyText: {
    color: "#9ca3af",
    fontSize: 12,
  },

  /* ================================= */
  /* REQUEST MODAL */
  /* ================================= */

  requestOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

 requestModal: {
  backgroundColor: "#ffffff",
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  maxHeight: "92%",
  paddingHorizontal: 20,
  paddingTop: 20,
  paddingBottom: 16,
  overflow: "visible",
},

  requestScroll: {
  overflow: "visible",
  flexGrow: 0,
},

  requestContent: {
    paddingBottom: 20,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  modalSubtitle: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 4,
  },

  closeButton: {
    fontSize: 28,
    color: "#6b7280",
    lineHeight: 28,
  },

  formLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1,
    color: "#6b7280",
    marginBottom: 6,
  },

  formLabelSpaced: {
    marginTop: 16,
  },

  /* Dropdown */

  dropdownWrapper: {
    position: "relative",
    zIndex: 1,
  },

  dropdownWrapperOpen: {
    zIndex: 9999,
    elevation: 9999,
  },

  dropdown: {
    height: 48,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 9,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
  },

  dropdownText: {
    flex: 1,
    fontSize: 13,
    color: "#111827",
    paddingRight: 8,
  },

  placeholderText: {
    color: "#9ca3af",
  },

  dropdownArrow: {
    fontSize: 17,
    color: "#6b7280",
  },

  dropdownMenu: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 53,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 9,
    zIndex: 99999,
    elevation: 99999,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },

  dropdownItem: {
    minHeight: 44,
    paddingHorizontal: 13,
    paddingVertical: 12,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },

  dropdownItemText: {
    fontSize: 12,
    color: "#374151",
  },

  /* Calendar */

  calendarIcon: {
    fontSize: 16,
    color: "#6b7280",
  },

  calendarOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },

  calendarCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
  },

  calendarTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },

  calendarPicker: {
    alignSelf: "center",
  },

  calendarDone: {
    backgroundColor: "#000000",
    height: 44,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  calendarDoneText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },

  /* Description */

  descriptionInput: {
    minHeight: 105,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 9,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 13,
    color: "#111827",
  },

  /* Bottom buttons */

  modalButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
    marginBottom: 10,
  },

  cancelButton: {
    flex: 1,
    height: 48,
    backgroundColor: "#e5e7eb",
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "600",
  },

  continueButton: {
    flex: 1,
    height: 48,
    backgroundColor: "#000000",
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  continueDisabled: {
    backgroundColor: "#d1d5db",
  },

  continueButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },

  /* ================================= */
  /* PICKER MODALS */
  /* ================================= */

  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 16,
  },

  pickerCard: {
    width: "100%",
    maxHeight: "78%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
  },

  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },

  pickerHeaderText: {
    flex: 1,
    paddingRight: 12,
  },

  pickerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  pickerSubtitle: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 4,
  },

  pickerScroll: {
    maxHeight: 320,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
  },

  pickerScrollContent: {
    paddingVertical: 2,
  },

  pickerItem: {
    minHeight: 50,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },

  pickerItemSelected: {
    backgroundColor: "#f3f4f6",
  },

  pickerItemText: {
    flex: 1,
    paddingRight: 10,
    fontSize: 12,
    color: "#374151",
    lineHeight: 17,
  },

  pickerItemTextSelected: {
    color: "#111827",
    fontWeight: "700",
  },

  pickerCheck: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
  },

  pickerDoneButton: {
    backgroundColor: "#000000",
    height: 46,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },

  pickerDoneText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },

  /* ================================= */
  /* CONFIRMATION */
  /* ================================= */

  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 16,
  },

  confirmCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
  },

  confirmTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
  },

  confirmSubtitle: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 4,
    marginBottom: 18,
  },

  confirmRow: {
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },

  confirmLabel: {
    fontSize: 9,
    color: "#9ca3af",
    marginBottom: 3,
  },

  confirmValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
    lineHeight: 18,
  },

  confirmDescription: {
    paddingTop: 12,
    paddingBottom: 4,
  },

  confirmNotice: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 9,
    padding: 11,
    marginTop: 14,
  },

  confirmNoticeText: {
    fontSize: 11,
    lineHeight: 17,
    color: "#4b5563",
  },
});