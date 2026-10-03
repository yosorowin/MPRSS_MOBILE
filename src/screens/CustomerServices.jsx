import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import {
  collection,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

import { auth, db } from "../firebase";

import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import CustomerLayout from "../components/CustomerLayout";
import { setCurrentServiceRequest } from "../data/serviceRequestStore";

export default function CustomerServices() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("pending");

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [showMotorcycleDropdown, setShowMotorcycleDropdown] =
    useState(false);

  const [showServiceDropdown, setShowServiceDropdown] =
    useState(false);

  const [showTimeDropdown, setShowTimeDropdown] =
    useState(false);

  const [showCalendar, setShowCalendar] = useState(false);

  const [motorcycles, setMotorcycles] = useState([]);
  const [firestoreServices, setFirestoreServices] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const [currentUser, setCurrentUser] = useState(null);

  const [selectedService, setSelectedService] = useState(null);

  const [calendarMonth, setCalendarMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  const [requestData, setRequestData] = useState({
    motorcycle: "",
    motorcycleId: "",
    serviceType: "",
    date: "",
    time: "",
    description: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  /*
   * ============================================================
   * AUTH
   * ============================================================
   */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user || null);
    });

    return unsubscribe;
  }, []);

  /*
   * ============================================================
   * MOTORCYCLES
   * ============================================================
   */

  useEffect(() => {
    if (!currentUser?.uid) {
      setMotorcycles([]);
      return undefined;
    }

    const unsubscribe = onSnapshot(
      collection(db, "motorcycles"),
      (snapshot) => {
        const data = snapshot.docs
          .map((item) => ({
            id: item.id,
            ...item.data(),
          }))
          .filter(
            (motorcycle) =>
              motorcycle.customerId === currentUser.uid ||
              motorcycle.customerUid === currentUser.uid ||
              motorcycle.userId === currentUser.uid
          );

        setMotorcycles(data);
      },
      (error) => {
        console.error("Error loading motorcycles:", error);
        setMotorcycles([]);
      }
    );

    return unsubscribe;
  }, [currentUser?.uid]);

  /*
   * ============================================================
   * SERVICES
   * ============================================================
   */

  useEffect(() => {
    if (!currentUser?.uid) {
      setFirestoreServices([]);
      return undefined;
    }

    const unsubscribe = onSnapshot(
      collection(db, "services"),
      (snapshot) => {
        const services = snapshot.docs
          .map((item) => ({
            id: item.id,
            ...item.data(),
          }))
          .filter(
            (service) =>
              service.customerId === currentUser.uid ||
              service.customerUid === currentUser.uid ||
              service.userId === currentUser.uid ||
              service.userUid === currentUser.uid ||
              String(service.customerEmail || "").toLowerCase() ===
                String(currentUser.email || "").toLowerCase()
          );

        setFirestoreServices(services);
      },
      (error) => {
        console.error("Error loading service requests:", error);
        setFirestoreServices([]);
      }
    );

    return unsubscribe;
  }, [currentUser?.uid, currentUser?.email]);

  /*
   * ============================================================
   * SCHEDULES
   * ============================================================
   */

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "schedules"),
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setSchedules(data);
      },
      (error) => {
        console.error("Error loading schedules:", error);
        setSchedules([]);
      }
    );

    return unsubscribe;
  }, []);

  /*
   * ============================================================
   * OPTIONS
   * ============================================================
   */

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

  /*
   * ============================================================
   * HELPERS
   * ============================================================
   */

  const normalizeStatus = (value) =>
    String(value || "")
      .toLowerCase()
      .replace(/_/g, " ")
      .trim();

  const formatDate = (date) => {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const parseDate = (value) => {
    if (!value) {
      return null;
    }

    const parts = String(value).split("-");

    if (parts.length !== 3) {
      return null;
    }

    return new Date(
      Number(parts[0]),
      Number(parts[1]) - 1,
      Number(parts[2])
    );
  };

  const getToday = () => {
    const now = new Date();

    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
  };

  const getSchedule = (date) => {
    return (
      schedules.find(
        (schedule) =>
          schedule.id === date ||
          schedule.date === date
      ) || null
    );
  };

  const getScheduleCapacity = (schedule) => {
    if (!schedule) {
      return 5;
    }

    return Number(
      schedule.capacity ??
        schedule.dailyCapacity ??
        schedule.maxCapacity ??
        5
    );
  };

  const getBookedCount = (schedule, time) => {
    if (!schedule || !time) {
      return 0;
    }

    const bookedSlots = schedule.bookedSlots || {};

    return Number(bookedSlots[time] || 0);
  };

  const isTimeAvailable = (date, time, ignoredServiceId = null) => {
    if (!date || !time) {
      return false;
    }

    const schedule = getSchedule(date);

    const capacity = getScheduleCapacity(schedule);

    let bookedCount = getBookedCount(schedule, time);

    /*
     * If the schedule document is not yet created,
     * the slot is treated as available using the
     * default capacity.
     */

    const customerReservations = firestoreServices.filter(
      (service) => {
        if (ignoredServiceId && service.id === ignoredServiceId) {
          return false;
        }

        const status = normalizeStatus(service.status);

        if (
          [
            "rejected",
            "cancelled",
            "canceled",
            "completed",
          ].includes(status)
        ) {
          return false;
        }

        return (
          service.preferredDate === date &&
          service.preferredTime === time
        );
      }
    );

    /*
     * Only count customer reservations that are not
     * already represented by bookedSlots.
     *
     * This protects the system from double-counting
     * older records.
     */

    bookedCount += customerReservations.filter(
      (service) =>
        service.scheduleReservationActive === true
    ).length;

    return bookedCount < capacity;
  };

  const getAvailableTimesForDate = (
    date,
    ignoredServiceId = null
  ) => {
    if (!date) {
      return [];
    }

    return availableTimes.filter((time) =>
      isTimeAvailable(
        date,
        time,
        ignoredServiceId
      )
    );
  };

  const isDateAvailable = (
    date,
    ignoredServiceId = null
  ) => {
    if (!date) {
      return false;
    }

    return (
      getAvailableTimesForDate(
        date,
        ignoredServiceId
      ).length > 0
    );
  };

  const getMotorcycleLabel = (motorcycle) => {
    if (!motorcycle) {
      return "Motorcycle";
    }

    return (
      `${motorcycle.brand || ""} ${
        motorcycle.model || ""
      }`.trim() ||
      motorcycle.name ||
      "Motorcycle"
    );
  };

  /*
   * ============================================================
   * SERVICE LISTS
   * ============================================================
   */

  const pendingRequests = useMemo(() => {
    return firestoreServices.filter((service) => {
      const status = normalizeStatus(service.status);

      const approvalStatus = normalizeStatus(
        service.approvalStatus
      );

      if (
        [
          "rejected",
          "cancelled",
          "canceled",
          "completed",
          "in progress",
          "waiting for parts",
          "quality check",
        ].includes(status)
      ) {
        return false;
      }

      if (approvalStatus === "approved") {
        return false;
      }

      return [
        "pending",
        "pending approval",
        "for approval",
        "awaiting approval",
      ].includes(status);
    });
  }, [firestoreServices]);

  const activeServices = useMemo(() => {
    return firestoreServices.filter((service) => {
      const status = normalizeStatus(service.status);

      const approvalStatus = normalizeStatus(
        service.approvalStatus
      );

      if (
        [
          "rejected",
          "cancelled",
          "canceled",
          "completed",
        ].includes(status)
      ) {
        return false;
      }

      if (
        [
          "in progress",
          "waiting for parts",
          "quality check",
          "ready for pickup",
          "active",
          "approved",
          "confirmed",
        ].includes(status)
      ) {
        return true;
      }

      return (
        approvalStatus === "approved" &&
        status === "pending"
      );
    });
  }, [firestoreServices]);

  const completedServices = useMemo(() => {
    return firestoreServices.filter(
      (service) =>
        normalizeStatus(service.status) ===
        "completed"
    );
  }, [firestoreServices]);

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

  const motorcycleOptions = motorcycles.map(
    (motorcycle) => ({
      id: motorcycle.id,
      label: getMotorcycleLabel(motorcycle),
    })
  );

  /*
   * ============================================================
   * FORM
   * ============================================================
   */

  const resetRequestForm = () => {
    setRequestData({
      motorcycle: "",
      motorcycleId: "",
      serviceType: "",
      date: "",
      time: "",
      description: "",
    });

    setCalendarMonth(
      new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      )
    );

    setShowMotorcycleDropdown(false);
    setShowServiceDropdown(false);
    setShowTimeDropdown(false);
    setShowCalendar(false);
  };

  const openRequestForm = () => {
    resetRequestForm();

    setSelectedService(null);
    setShowEditModal(false);
    setShowRequestForm(true);
  };

  const closeRequestForm = () => {
    if (isSaving) {
      return;
    }

    setShowRequestForm(false);
    resetRequestForm();
  };

  const openEditRequest = (service) => {
    const motorcycle = motorcycles.find(
      (item) =>
        item.id === service.motorcycleId
    );

    setSelectedService(service);

    setRequestData({
      motorcycle:
        motorcycle
          ? getMotorcycleLabel(motorcycle)
          : service.motorcycle || "",
      motorcycleId:
        motorcycle?.id ||
        service.motorcycleId ||
        "",
      serviceType:
        service.serviceType || "",
      date:
        service.preferredDate ||
        service.date ||
        "",
      time:
        service.preferredTime ||
        service.time ||
        "",
      description:
        service.issueDescription ||
        service.description ||
        "",
    });

    const selectedDate = parseDate(
      service.preferredDate ||
        service.date
    );

    if (selectedDate) {
      setCalendarMonth(
        new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          1
        )
      );
    }

    setShowEditModal(true);
  };

  /*
   * ============================================================
   * DROPDOWN CLOSE
   * ============================================================
   */

  const closeAllDropdowns = () => {
    setShowMotorcycleDropdown(false);
    setShowServiceDropdown(false);
    setShowTimeDropdown(false);
    setShowCalendar(false);
  };

  /*
   * ============================================================
   * DATE CALENDAR
   * ============================================================
   */

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDay = new Date(
      year,
      month,
      1
    ).getDay();

    const daysInMonth = new Date(
      year,
      month + 1,
      0
    ).getDate();

    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        new Date(year, month, day)
      );
    }

    return days;
  }, [calendarMonth]);

  const monthLabel = calendarMonth.toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    }
  );

  const previousMonth = () => {
    const currentMonth = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      1
    );

    const minimumMonth = new Date(
      getToday().getFullYear(),
      getToday().getMonth(),
      1
    );

    const previous = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1
    );

    if (previous >= minimumMonth) {
      setCalendarMonth(previous);
    }
  };

  const nextMonth = () => {
    setCalendarMonth(
      new Date(
        calendarMonth.getFullYear(),
        calendarMonth.getMonth() + 1,
        1
      )
    );
  };

  const selectCalendarDate = (date) => {
    if (!date) {
      return;
    }

    const today = getToday();

    if (date < today) {
      return;
    }

    const formatted = formatDate(date);

    if (
      !isDateAvailable(
        formatted,
        selectedService?.id || null
      )
    ) {
      return;
    }

    setRequestData((previous) => ({
      ...previous,
      date: formatted,
      time: "",
    }));

    setShowCalendar(false);
  };

  /*
   * ============================================================
   * FIRESTORE SCHEDULE RESERVATION
   * ============================================================
   */

  const reserveScheduleSlot = async (
    serviceId,
    date,
    time
  ) => {
    if (!date || !time) {
      throw new Error(
        "Preferred date and time are required."
      );
    }

    const scheduleRef = doc(
      db,
      "schedules",
      date
    );

    await runTransaction(
      db,
      async (transaction) => {
        const scheduleSnapshot =
          await transaction.get(
            scheduleRef
          );

        const scheduleData =
          scheduleSnapshot.exists()
            ? scheduleSnapshot.data()
            : {};

        const capacity =
          Number(
            scheduleData.capacity ??
              scheduleData.dailyCapacity ??
              scheduleData.maxCapacity ??
              5
          );

        const bookedSlots =
          scheduleData.bookedSlots || {};

        const currentCount = Number(
          bookedSlots[time] || 0
        );

        if (currentCount >= capacity) {
          throw new Error(
            "This time slot is already fully booked."
          );
        }

        transaction.set(
          scheduleRef,
          {
            date,
            capacity,
            bookedSlots: {
              ...bookedSlots,
              [time]: currentCount + 1,
            },
            updatedAt:
              serverTimestamp(),
          },
          {
            merge: true,
          }
        );

        if (serviceId) {
          transaction.update(
            doc(
              db,
              "services",
              serviceId
            ),
            {
              scheduleReservationActive: true,
              scheduleReservationDate: date,
              scheduleReservationTime: time,
              updatedAt:
                serverTimestamp(),
            }
          );
        }
      }
    );
  };

  /*
   * ============================================================
   * RELEASE SCHEDULE SLOT
   * ============================================================
   */

  const releaseScheduleSlot = async (
    service
  ) => {
    const date =
      service.scheduleReservationDate ||
      service.preferredDate;

    const time =
      service.scheduleReservationTime ||
      service.preferredTime;

    if (!date || !time) {
      return;
    }

    const scheduleRef = doc(
      db,
      "schedules",
      date
    );

    await runTransaction(
      db,
      async (transaction) => {
        const scheduleSnapshot =
          await transaction.get(
            scheduleRef
          );

        if (!scheduleSnapshot.exists()) {
          return;
        }

        const scheduleData =
          scheduleSnapshot.data();

        const bookedSlots =
          scheduleData.bookedSlots || {};

        const currentCount = Number(
          bookedSlots[time] || 0
        );

        const nextCount =
          Math.max(0, currentCount - 1);

        transaction.update(
          scheduleRef,
          {
            bookedSlots: {
              ...bookedSlots,
              [time]: nextCount,
            },
            updatedAt:
              serverTimestamp(),
          }
        );
      }
    );
  };

  /*
   * ============================================================
   * REQUEST VALIDATION
   * ============================================================
   */

  const validateRequest = () => {
    if (!requestData.motorcycleId) {
      return false;
    }

    if (!requestData.serviceType) {
      return false;
    }

    if (!requestData.date) {
      return false;
    }

    if (!requestData.time) {
      return false;
    }

    if (!requestData.description.trim()) {
      return false;
    }

    return true;
  };

  /*
   * ============================================================
   * CREATE REQUEST
   * ============================================================
   */

  const handleContinueRequest = () => {
    if (!validateRequest()) {
      return;
    }

    if (
      !isTimeAvailable(
        requestData.date,
        requestData.time
      )
    ) {
      return;
    }

    closeAllDropdowns();

    setShowRequestForm(false);
    setShowConfirmModal(true);
  };

  const handleConfirmRequest = async () => {
    if (!currentUser?.uid) {
      return;
    }

    if (!validateRequest()) {
      return;
    }

    if (isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const selectedMotorcycle =
        motorcycles.find(
          (motorcycle) =>
            motorcycle.id ===
            requestData.motorcycleId
        );

      if (!selectedMotorcycle) {
        throw new Error(
          "Selected motorcycle could not be found."
        );
      }

      const requestDate =
        new Date()
          .toISOString()
          .split("T")[0];

      const serviceRequest = {
        customerId:
          currentUser.uid,

        customerUid:
          currentUser.uid,

        customerEmail:
          currentUser.email || "",

        motorcycleId:
          selectedMotorcycle.id,

        motorcycle:
          getMotorcycleLabel(
            selectedMotorcycle
          ),

        serviceType:
          requestData.serviceType,

        preferredDate:
          requestData.date,

        preferredTime:
          requestData.time,

        issueDescription:
          requestData.description.trim(),

        requestDate,

        status:
          "Pending Approval",

        approvalStatus:
          "pending",

        paymentMethod:
          null,

        paymentStatus:
          "Pending",

        estimatedCost:
          0,

        estimatedTime:
          "",

        assignedStaff:
          "",

        assignedStaffId:
          null,

        assignedStaffPosition:
          null,

        scheduleReservationActive:
          true,

        scheduleReservationDate:
          requestData.date,

        scheduleReservationTime:
          requestData.time,

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),
      };

      /*
       * Reserve the schedule and create the service
       * inside one Firestore transaction.
       */
      const documentReference =
        await runTransaction(
          db,
          async (transaction) => {
            const scheduleRef =
              doc(
                db,
                "schedules",
                requestData.date
              );

            const scheduleSnapshot =
              await transaction.get(
                scheduleRef
              );

            const scheduleData =
              scheduleSnapshot.exists()
                ? scheduleSnapshot.data()
                : {};

            const capacity =
              Number(
                scheduleData.capacity ??
                  scheduleData.dailyCapacity ??
                  scheduleData.maxCapacity ??
                  5
              );

            const bookedSlots =
              scheduleData.bookedSlots ||
              {};

            const currentCount =
              Number(
                bookedSlots[
                  requestData.time
                ] || 0
              );

            if (
              currentCount >=
              capacity
            ) {
              throw new Error(
                "The selected time is already fully booked."
              );
            }

            const serviceRef =
              doc(
                collection(
                  db,
                  "services"
                )
              );

            transaction.set(
              serviceRef,
              serviceRequest
            );

            transaction.set(
              scheduleRef,
              {
                date:
                  requestData.date,

                capacity,

                bookedSlots: {
                  ...bookedSlots,
                  [requestData.time]:
                    currentCount + 1,
                },

                updatedAt:
                  serverTimestamp(),
              },
              {
                merge: true,
              }
            );

            return serviceRef;
          }
        );

      setCurrentServiceRequest({
        id:
          documentReference.id,

        ...serviceRequest,

        createdAt:
          new Date().toISOString(),

        updatedAt:
          new Date().toISOString(),
      });

      setShowConfirmModal(false);

      resetRequestForm();

      router.push("/payment");
    } catch (error) {
      console.error(
        "Error creating service request:",
        error
      );
    } finally {
      setIsSaving(false);
    }
  };

  /*
   * ============================================================
   * EDIT REQUEST
   * ============================================================
   */

  const handleSaveEdit = async () => {
    if (!selectedService) {
      return;
    }

    if (!validateRequest()) {
      return;
    }

    if (isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const oldDate =
        selectedService.scheduleReservationDate ||
        selectedService.preferredDate;

      const oldTime =
        selectedService.scheduleReservationTime ||
        selectedService.preferredTime;

      const newDate =
        requestData.date;

      const newTime =
        requestData.time;

      const selectedMotorcycle =
        motorcycles.find(
          (motorcycle) =>
            motorcycle.id ===
            requestData.motorcycleId
        );

      if (!selectedMotorcycle) {
        throw new Error(
          "Selected motorcycle could not be found."
        );
      }

      await runTransaction(
        db,
        async (transaction) => {
          const oldScheduleRef =
            doc(
              db,
              "schedules",
              oldDate
            );

          const newScheduleRef =
            doc(
              db,
              "schedules",
              newDate
            );

          const oldScheduleSnapshot =
            await transaction.get(
              oldScheduleRef
            );

          let newScheduleSnapshot =
            null;

          if (
            oldDate === newDate
          ) {
            newScheduleSnapshot =
              oldScheduleSnapshot;
          } else {
            newScheduleSnapshot =
              await transaction.get(
                newScheduleRef
              );
          }

          /*
           * If the date/time did not change,
           * only update the service itself.
           */
          if (
            oldDate === newDate &&
            oldTime === newTime
          ) {
            transaction.update(
              doc(
                db,
                "services",
                selectedService.id
              ),
              {
                motorcycleId:
                  selectedMotorcycle.id,

                motorcycle:
                  getMotorcycleLabel(
                    selectedMotorcycle
                  ),

                serviceType:
                  requestData.serviceType,

                preferredDate:
                  newDate,

                preferredTime:
                  newTime,

                issueDescription:
                  requestData.description.trim(),

                updatedAt:
                  serverTimestamp(),
              }
            );

            return;
          }

          /*
           * Check new schedule capacity.
           */
          const newScheduleData =
            newScheduleSnapshot?.exists()
              ? newScheduleSnapshot.data()
              : {};

          const newCapacity =
            Number(
              newScheduleData.capacity ??
                newScheduleData.dailyCapacity ??
                newScheduleData.maxCapacity ??
                5
            );

          const newBookedSlots =
            newScheduleData.bookedSlots ||
            {};

          const newCurrentCount =
            Number(
              newBookedSlots[newTime] ||
                0
            );

          if (
            newCurrentCount >=
            newCapacity
          ) {
            throw new Error(
              "The selected new schedule is fully booked."
            );
          }

          /*
           * Release old slot.
           */
          if (
            oldScheduleSnapshot.exists()
          ) {
            const oldScheduleData =
              oldScheduleSnapshot.data();

            const oldBookedSlots =
              oldScheduleData.bookedSlots ||
              {};

            const oldCount =
              Number(
                oldBookedSlots[
                  oldTime
                ] || 0
              );

            transaction.update(
              oldScheduleRef,
              {
                bookedSlots: {
                  ...oldBookedSlots,
                  [oldTime]:
                    Math.max(
                      0,
                      oldCount - 1
                    ),
                },

                updatedAt:
                  serverTimestamp(),
              }
            );
          }

          /*
           * Reserve new slot.
           */
          transaction.set(
            newScheduleRef,
            {
              date:
                newDate,

              capacity:
                newCapacity,

              bookedSlots: {
                ...newBookedSlots,

                [newTime]:
                  newCurrentCount + 1,
              },

              updatedAt:
                serverTimestamp(),
            },
            {
              merge: true,
            }
          );

          /*
           * Update service.
           */
          transaction.update(
            doc(
              db,
              "services",
              selectedService.id
            ),
            {
              motorcycleId:
                selectedMotorcycle.id,

              motorcycle:
                getMotorcycleLabel(
                  selectedMotorcycle
                ),

              serviceType:
                requestData.serviceType,

              preferredDate:
                newDate,

              preferredTime:
                newTime,

              issueDescription:
                requestData.description.trim(),

              scheduleReservationActive:
                true,

              scheduleReservationDate:
                newDate,

              scheduleReservationTime:
                newTime,

              updatedAt:
                serverTimestamp(),
            }
          );
        }
      );

      setShowEditModal(false);
      setSelectedService(null);
      resetRequestForm();
    } catch (error) {
      console.error(
        "Error editing service request:",
        error
      );
    } finally {
      setIsSaving(false);
    }
  };

  /*
   * ============================================================
   * CANCEL REQUEST
   * ============================================================
   */

  const openCancelRequest = (service) => {
    setSelectedService(service);
    setShowCancelModal(true);
  };

  const handleCancelRequest = async () => {
    if (!selectedService) {
      return;
    }

    if (isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const serviceRef =
        doc(
          db,
          "services",
          selectedService.id
        );

      await runTransaction(
        db,
        async (transaction) => {
          const date =
            selectedService.scheduleReservationDate ||
            selectedService.preferredDate;

          const time =
            selectedService.scheduleReservationTime ||
            selectedService.preferredTime;

          if (date && time) {
            const scheduleRef =
              doc(
                db,
                "schedules",
                date
              );

            const scheduleSnapshot =
              await transaction.get(
                scheduleRef
              );

            if (
              scheduleSnapshot.exists()
            ) {
              const scheduleData =
                scheduleSnapshot.data();

              const bookedSlots =
                scheduleData.bookedSlots ||
                {};

              const currentCount =
                Number(
                  bookedSlots[
                    time
                  ] || 0
                );

              transaction.update(
                scheduleRef,
                {
                  bookedSlots: {
                    ...bookedSlots,

                    [time]:
                      Math.max(
                        0,
                        currentCount - 1
                      ),
                  },

                  updatedAt:
                    serverTimestamp(),
                }
              );
            }
          }

          transaction.update(
            serviceRef,
            {
              status:
                "Cancelled",

              approvalStatus:
                "cancelled",

              scheduleReservationActive:
                false,

              cancelledAt:
                serverTimestamp(),

              updatedAt:
                serverTimestamp(),
            }
          );
        }
      );

      setShowCancelModal(false);
      setSelectedService(null);
    } catch (error) {
      console.error(
        "Error cancelling service request:",
        error
      );
    } finally {
      setIsSaving(false);
    }
  };

  /*
   * ============================================================
   * CAN EDIT / CANCEL
   * ============================================================
   */

  const canModifyService = (service) => {
    const status = normalizeStatus(
      service.status
    );

    return ![
      "rejected",
      "cancelled",
      "canceled",
      "completed",
      "in progress",
      "waiting for parts",
      "quality check",
    ].includes(status);
  };

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <CustomerLayout title="My Services">
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* TOP ACTIONS */}

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

        {/* PENDING */}

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
                          {
                            request.motorcycle
                          }
                        </Text>
                      </View>

                      <StatusBadge
                        text={
                          request.status
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.tracker
                      }
                    >
                      <TrackerStep
                        number="1"
                        label="Approved"
                        active={
                          normalizeStatus(
                            request.approvalStatus
                          ) ===
                          "approved"
                        }
                      />

                      <TrackerLine
                        active={
                          normalizeStatus(
                            request.approvalStatus
                          ) ===
                          "approved"
                        }
                      />

                      <TrackerStep
                        number="2"
                        label="Payment"
                        active={
                          normalizeStatus(
                            request.paymentStatus
                          ) ===
                          "confirmed"
                        }
                      />

                      <TrackerLine
                        active={
                          normalizeStatus(
                            request.paymentStatus
                          ) ===
                          "confirmed"
                        }
                      />

                      <TrackerStep
                        number="3"
                        label="Confirmed"
                        active={
                          [
                            "in progress",
                            "waiting for parts",
                            "quality check",
                            "completed",
                          ].includes(
                            normalizeStatus(
                              request.status
                            )
                          )
                        }
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
                          request.requestDate ||
                            "-",
                        ],
                        [
                          "Estimated Cost",
                          `₱${Number(
                            request.estimatedCost ||
                              0
                          ).toLocaleString()}`,
                        ],
                      ]}
                    />

                    <View
                      style={
                        styles.infoBox
                      }
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
                            request.paymentMethod ||
                            "Not selected"
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
                            request.paymentStatus ||
                            "Pending"
                          }
                        </Text>
                      </View>
                    </View>

                    <View
                      style={
                        styles.pendingActions
                      }
                    >
                      {canModifyService(
                        request
                      ) && (
                        <>
                          <TouchableOpacity
                            style={
                              styles.outlineAction
                            }
                            onPress={() =>
                              openEditRequest(
                                request
                              )
                            }
                          >
                            <Text
                              style={
                                styles.outlineActionText
                              }
                            >
                              Edit Request
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={
                              styles.cancelAction
                            }
                            onPress={() =>
                              openCancelRequest(
                                request
                              )
                            }
                          >
                            <Text
                              style={
                                styles.cancelActionText
                              }
                            >
                              Cancel Request
                            </Text>
                          </TouchableOpacity>
                        </>
                      )}
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
                        Waiting for admin
                        approval. You will
                        be notified once your
                        request has been
                        reviewed.
                      </Text>
                    </View>
                  </View>
                )
              )
            )}
          </>
        )}

        {/* ACTIVE */}

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
                        text={
                          service.status
                        }
                      />
                    </View>

                    <InfoGrid
                      items={[
                        [
                          "Preferred Date",
                          service.preferredDate,
                        ],
                        [
                          "Preferred Time",
                          service.preferredTime,
                        ],
                        [
                          "Assigned Staff",
                          service.assignedStaff ||
                            "Pending assignment",
                        ],
                        [
                          "Estimated Cost",
                          `₱${Number(
                            service.estimatedCost ||
                              0
                          ).toLocaleString()}`,
                        ],
                        [
                          "Estimated Time",
                          service.estimatedTime ||
                            "Pending",
                        ],
                        [
                          "Payment",
                          service.paymentStatus ||
                            "Pending",
                        ],
                      ]}
                    />

                    <View
                      style={
                        styles.infoBox
                      }
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
                        {service.notes ||
                          service.issueDescription ||
                          "No service notes available."}
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
                            service.paymentMethod ||
                            "Not selected"
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
                            service.paymentStatus ||
                            "Pending"
                          }
                        </Text>
                      </View>
                    </View>

                    {canModifyService(
                      service
                    ) && (
                      <View
                        style={
                          styles.pendingActions
                        }
                      >
                        <TouchableOpacity
                          style={
                            styles.outlineAction
                          }
                          onPress={() =>
                            openEditRequest(
                              service
                            )
                          }
                        >
                          <Text
                            style={
                              styles.outlineActionText
                            }
                          >
                            Edit Request
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={
                            styles.cancelAction
                          }
                          onPress={() =>
                            openCancelRequest(
                              service
                            )
                          }
                        >
                          <Text
                            style={
                              styles.cancelActionText
                            }
                          >
                            Cancel Request
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

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

        {/* COMPLETED */}

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
                          service.completedDate ||
                            "-",
                        ],
                        [
                          "Total Cost",
                          `₱${Number(
                            service.cost ??
                              service.estimatedCost ??
                              0
                          ).toLocaleString()}`,
                        ],
                        [
                          "Parts Used",
                          (
                            service.partsUsed ||
                            []
                          ).join(", ") ||
                            "-",
                        ],
                        [
                          "Rating",
                          `${Number(
                            service.rating ||
                              0
                          )}/5`,
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
                          Number(
                            service.rating ||
                              0
                          )
                        )}
                        {"☆".repeat(
                          Math.max(
                            0,
                            5 -
                              Number(
                                service.rating ||
                                  0
                              )
                          )
                        )}
                      </Text>

                      <Text
                        style={
                          styles.feedback
                        }
                      >
                        "{service.feedback ||
                          "No feedback yet."}"
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

      {/* ========================================================
          REQUEST / EDIT MODAL
          ======================================================== */}

      <Modal
        visible={
          showRequestForm ||
          showEditModal
        }
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (showEditModal) {
            setShowEditModal(false);
            setSelectedService(null);
            resetRequestForm();
          } else {
            closeRequestForm();
          }
        }}
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
              nestedScrollEnabled
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
                    {showEditModal
                      ? "Edit Service Request"
                      : "Request Service"}
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
                  onPress={() => {
                    if (
                      showEditModal
                    ) {
                      setShowEditModal(
                        false
                      );
                      setSelectedService(
                        null
                      );
                      resetRequestForm();
                    } else {
                      closeRequestForm();
                    }
                  }}
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

              {/* MOTORCYCLE */}

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

                    setShowCalendar(
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
                    <ScrollView
                      nestedScrollEnabled
                      style={
                        styles.dropdownScroll
                      }
                      showsVerticalScrollIndicator
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
                                  motorcycleId:
                                    motorcycle.id,
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
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* SERVICE TYPE */}

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
                    setShowServiceDropdown(
                      (previous) =>
                        !previous
                    );

                    setShowMotorcycleDropdown(
                      false
                    );

                    setShowTimeDropdown(
                      false
                    );

                    setShowCalendar(
                      false
                    );
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

                {showServiceDropdown && (
                  <View
                    style={
                      styles.dropdownMenu
                    }
                  >
                    <ScrollView
                      nestedScrollEnabled
                      style={
                        styles.dropdownScroll
                      }
                      showsVerticalScrollIndicator
                    >
                      {serviceTypes.map(
                        (service) => (
                          <TouchableOpacity
                            key={service}
                            style={
                              styles.dropdownItem
                            }
                            onPress={() => {
                              setRequestData(
                                (
                                  previous
                                ) => ({
                                  ...previous,
                                  serviceType:
                                    service,
                                })
                              );

                              setShowServiceDropdown(
                                false
                              );
                            }}
                          >
                            <Text
                              style={
                                styles.dropdownItemText
                              }
                            >
                              {service}
                            </Text>
                          </TouchableOpacity>
                        )
                      )}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* DATE */}

              <Text
                style={[
                  styles.formLabel,
                  styles.formLabelSpaced,
                ]}
              >
                PREFERRED DATE *
              </Text>

              <TouchableOpacity
                style={[
                  styles.dropdown,
                  requestData.date &&
                    styles.selectedDateDropdown,
                ]}
                onPress={() => {
                  setShowCalendar(
                    (previous) =>
                      !previous
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

              {showCalendar && (
                <View
                  style={
                    styles.calendarContainer
                  }
                >
                  <View
                    style={
                      styles.calendarHeader
                    }
                  >
                    <TouchableOpacity
                      style={
                        styles.calendarNavButton
                      }
                      onPress={
                        previousMonth
                      }
                    >
                      <Text
                        style={
                          styles.calendarNavText
                        }
                      >
                        ‹
                      </Text>
                    </TouchableOpacity>

                    <Text
                      style={
                        styles.calendarMonth
                      }
                    >
                      {monthLabel}
                    </Text>

                    <TouchableOpacity
                      style={
                        styles.calendarNavButton
                      }
                      onPress={nextMonth}
                    >
                      <Text
                        style={
                          styles.calendarNavText
                        }
                      >
                        ›
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View
                    style={
                      styles.calendarWeekRow
                    }
                  >
                    {[
                      "Sun",
                      "Mon",
                      "Tue",
                      "Wed",
                      "Thu",
                      "Fri",
                      "Sat",
                    ].map((day) => (
                      <Text
                        key={day}
                        style={
                          styles.calendarWeekText
                        }
                      >
                        {day}
                      </Text>
                    ))}
                  </View>

                  <View
                    style={
                      styles.calendarGrid
                    }
                  >
                    {calendarDays.map(
                      (date, index) => {
                        if (!date) {
                          return (
                            <View
                              key={`empty-${index}`}
                              style={
                                styles.calendarDay
                              }
                            />
                          );
                        }

                        const dateString =
                          formatDate(
                            date
                          );

                        const today =
                          getToday();

                        const isPast =
                          date < today;

                        const available =
                          !isPast &&
                          isDateAvailable(
                            dateString,
                            selectedService?.id ||
                              null
                          );

                        const selected =
                          requestData.date ===
                          dateString;

                        return (
                          <TouchableOpacity
                            key={
                              dateString
                            }
                            disabled={
                              !available
                            }
                            onPress={() =>
                              selectCalendarDate(
                                date
                              )
                            }
                            style={[
                              styles.calendarDay,
                              selected &&
                                styles.calendarDaySelected,
                              available &&
                                !selected &&
                                styles.calendarDayAvailable,
                              !available &&
                                styles.calendarDayFull,
                            ]}
                          >
                            <Text
                              style={[
                                styles.calendarDayText,
                                selected &&
                                  styles.calendarDayTextSelected,
                                !available &&
                                  styles.calendarDayTextFull,
                              ]}
                            >
                              {date.getDate()}
                            </Text>
                          </TouchableOpacity>
                        );
                      }
                    )}
                  </View>

                  <View
                    style={
                      styles.calendarLegend
                    }
                  >
                    <View
                      style={
                        styles.legendItem
                      }
                    >
                      <View
                        style={[
                          styles.legendDot,
                          styles.legendAvailable,
                        ]}
                      />

                      <Text
                        style={
                          styles.legendText
                        }
                      >
                        Available
                      </Text>
                    </View>

                    <View
                      style={
                        styles.legendItem
                      }
                    >
                      <View
                        style={[
                          styles.legendDot,
                          styles.legendFull,
                        ]}
                      />

                      <Text
                        style={
                          styles.legendText
                        }
                      >
                        Fully Booked
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* TIME */}

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
                  disabled={
                    !requestData.date
                  }
                  onPress={() => {
                    if (
                      !requestData.date
                    ) {
                      return;
                    }

                    setShowTimeDropdown(
                      (previous) =>
                        !previous
                    );

                    setShowMotorcycleDropdown(
                      false
                    );

                    setShowServiceDropdown(
                      false
                    );

                    setShowCalendar(
                      false
                    );
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
                      (requestData.date
                        ? "Select time"
                        : "Select date first")}
                  </Text>

                  <Text
                    style={
                      styles.dropdownArrow
                    }
                  >
                    ▾
                  </Text>
                </TouchableOpacity>

                {showTimeDropdown &&
                  requestData.date && (
                    <View
                      style={
                        styles.dropdownMenu
                      }
                    >
                      <ScrollView
                        nestedScrollEnabled
                        style={
                          styles.dropdownScroll
                        }
                        showsVerticalScrollIndicator
                      >
                        {availableTimes.map(
                          (time) => {
                            const available =
                              isTimeAvailable(
                                requestData.date,
                                time,
                                selectedService?.id ||
                                  null
                              );

                            return (
                              <TouchableOpacity
                                key={time}
                                disabled={
                                  !available
                                }
                                style={[
                                  styles.dropdownItem,
                                  !available &&
                                    styles.dropdownItemDisabled,
                                ]}
                                onPress={() => {
                                  setRequestData(
                                    (
                                      previous
                                    ) => ({
                                      ...previous,
                                      time,
                                    })
                                  );

                                  setShowTimeDropdown(
                                    false
                                  );
                                }}
                              >
                                <View
                                  style={
                                    styles.timeItemRow
                                  }
                                >
                                  <Text
                                    style={[
                                      styles.dropdownItemText,
                                      !available &&
                                        styles.dropdownItemTextDisabled,
                                    ]}
                                  >
                                    {time}
                                  </Text>

                                  <Text
                                    style={[
                                      styles.timeAvailabilityText,
                                      available
                                        ? styles.timeAvailableText
                                        : styles.timeFullText,
                                    ]}
                                  >
                                    {available
                                      ? "Available"
                                      : "Full"}
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            );
                          }
                        )}
                      </ScrollView>
                    </View>
                  )}
              </View>

              {/* DESCRIPTION */}

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

              {/* BUTTONS */}

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
                    if (
                      showEditModal
                    ) {
                      setShowEditModal(
                        false
                      );
                      setSelectedService(
                        null
                      );
                      resetRequestForm();
                    } else {
                      closeRequestForm();
                    }
                  }}
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
                    !validateRequest() &&
                      styles.continueDisabled,
                  ]}
                  disabled={
                    !validateRequest() ||
                    isSaving
                  }
                  onPress={
                    showEditModal
                      ? handleSaveEdit
                      : handleContinueRequest
                  }
                >
                  <Text
                    style={
                      styles.continueButtonText
                    }
                  >
                    {isSaving
                      ? "Saving..."
                      : showEditModal
                      ? "Save Changes"
                      : "Continue"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================
          CONFIRMATION
          ======================================================== */}

      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowConfirmModal(false)
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
                After submitting, your
                request will be reviewed
                by the admin. Payment
                instructions will be
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
                disabled={isSaving}
                onPress={
                  handleConfirmRequest
                }
              >
                <Text
                  style={
                    styles.continueButtonText
                  }
                >
                  {isSaving
                    ? "Submitting..."
                    : "Submit Request"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================
          CANCEL CONFIRMATION
          ======================================================== */}

      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowCancelModal(false)
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
              Cancel Service Request
            </Text>

            <Text
              style={
                styles.confirmSubtitle
              }
            >
              Are you sure you want to
              cancel this service request?
            </Text>

            {selectedService && (
              <>
                <ConfirmRow
                  label="Service"
                  value={
                    selectedService.serviceType
                  }
                />

                <ConfirmRow
                  label="Preferred Date"
                  value={
                    selectedService.preferredDate
                  }
                />

                <ConfirmRow
                  label="Preferred Time"
                  value={
                    selectedService.preferredTime
                  }
                />
              </>
            )}

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
                Cancelling this request
                will release the selected
                schedule slot.
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
                onPress={() =>
                  setShowCancelModal(
                    false
                  )
                }
              >
                <Text
                  style={
                    styles.cancelButtonText
                  }
                >
                  Keep Request
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.dangerButton
                }
                disabled={isSaving}
                onPress={
                  handleCancelRequest
                }
              >
                <Text
                  style={
                    styles.continueButtonText
                  }
                >
                  {isSaving
                    ? "Cancelling..."
                    : "Cancel Request"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </CustomerLayout>
  );
}

/* ============================================================
   HELPERS
   ============================================================ */

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
              {value || "-"}
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
        {value || "-"}
      </Text>
    </View>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

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

  pendingActions: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },

  outlineAction: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  outlineActionText: {
    color: "#374151",
    fontSize: 11,
    fontWeight: "600",
  },

  cancelAction: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelActionText: {
    color: "#4b5563",
    fontSize: 11,
    fontWeight: "600",
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

  /* REQUEST MODAL */

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

  selectedDateDropdown: {
    borderColor: "#16a34a",
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

  dropdownScroll: {
    maxHeight: 190,
  },

  dropdownItem: {
    minHeight: 44,
    paddingHorizontal: 13,
    paddingVertical: 12,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },

  dropdownItemDisabled: {
    backgroundColor: "#f9fafb",
  },

  dropdownItemText: {
    fontSize: 12,
    color: "#374151",
  },

  dropdownItemTextDisabled: {
    color: "#9ca3af",
  },

  timeItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  timeAvailabilityText: {
    fontSize: 10,
    fontWeight: "600",
  },

  timeAvailableText: {
    color: "#16a34a",
  },

  timeFullText: {
    color: "#9ca3af",
  },

  /* CALENDAR */

  calendarIcon: {
    fontSize: 16,
    color: "#6b7280",
  },

  calendarContainer: {
    marginTop: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
  },

  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  calendarNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },

  calendarNavText: {
    fontSize: 24,
    color: "#374151",
    lineHeight: 28,
  },

  calendarMonth: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  calendarWeekRow: {
    flexDirection: "row",
    marginBottom: 5,
  },

  calendarWeekText: {
    width: "14.2857%",
    textAlign: "center",
    fontSize: 9,
    color: "#9ca3af",
    fontWeight: "600",
  },

  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  calendarDay: {
    width: "14.2857%",
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginBottom: 3,
  },

  calendarDayAvailable: {
    backgroundColor: "#dcfce7",
  },

  calendarDayFull: {
    backgroundColor: "#f3f4f6",
  },

  calendarDaySelected: {
    backgroundColor: "#16a34a",
  },

  calendarDayText: {
    fontSize: 11,
    color: "#111827",
    fontWeight: "600",
  },

  calendarDayTextSelected: {
    color: "#ffffff",
  },

  calendarDayTextFull: {
    color: "#9ca3af",
  },

  calendarLegend: {
    flexDirection: "row",
    gap: 18,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  legendAvailable: {
    backgroundColor: "#22c55e",
  },

  legendFull: {
    backgroundColor: "#d1d5db",
  },

  legendText: {
    fontSize: 9,
    color: "#6b7280",
  },

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

  dangerButton: {
    flex: 1,
    height: 48,
    backgroundColor: "#991b1b",
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

  /* CONFIRMATION */

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